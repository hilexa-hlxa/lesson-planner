// Отдельный веб-сервис (не часть основного сайта): read-mostly дашборд для
// мониторинга пользователей/учителей/генераций той же базы, что и backend/.
// Один администратор, один общий пароль в переменной окружения — намеренно
// не переиспользуем систему логина основного приложения (users/sessions):
// это отдельный периметр, и учётка "администратор" не должна быть строкой в
// той же таблице, которую этот дашборд как раз показывает.
"use strict";

const express = require("express");
const cookieSession = require("cookie-session");
const crypto = require("crypto");
const { pool } = require("./db");
const { esc, fmtDate, layout, loginPage, pager } = require("./views");

const PORT = process.env.PORT || 10000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "";

if (!ADMIN_PASSWORD) {
  throw new Error("Admin panel: ADMIN_PASSWORD env var is not set — refusing to start unprotected.");
}
if (!SESSION_SECRET) {
  throw new Error("Admin panel: SESSION_SECRET env var is not set.");
}

const app = express();
app.set("trust proxy", 1); // за прокси Render — иначе req.ip и secure-cookie определяются неверно
app.use(express.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: "adm_sess",
    secret: SESSION_SECRET,
    maxAge: 12 * 60 * 60 * 1000, // 12 часов — внутренний инструмент, не нужно жить неделями
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
  })
);

// Никаких поисковиков и превью-ботов на внутренней панели.
app.use((req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

// Простая защита от подбора пароля: 5 неудач — блокировка на 5 минут по IP.
// In-memory достаточно (один процесс, один инстанс, перезапуск сбрасывает —
// не критично для внутреннего инструмента с одним настоящим паролем).
const loginAttempts = new Map(); // ip -> { count, lockedUntil }
function checkLoginRateLimit(ip) {
  const rec = loginAttempts.get(ip);
  if (!rec) return { blocked: false };
  if (rec.lockedUntil && rec.lockedUntil > Date.now()) {
    return { blocked: true, retryInSec: Math.ceil((rec.lockedUntil - Date.now()) / 1000) };
  }
  return { blocked: false };
}
function recordLoginFailure(ip) {
  const rec = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= 5) {
    rec.lockedUntil = Date.now() + 5 * 60 * 1000;
    rec.count = 0;
  }
  loginAttempts.set(ip, rec);
}
function recordLoginSuccess(ip) {
  loginAttempts.delete(ip);
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Всё равно сравниваем что-то постоянной длины, чтобы не утекала длина пароля через тайминг
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

app.get("/login", (req, res) => {
  if (req.session.authed) return res.redirect("/");
  res.send(loginPage({ error: null }));
});

app.post("/login", (req, res) => {
  const ip = req.ip || "unknown";
  const rl = checkLoginRateLimit(ip);
  if (rl.blocked) {
    return res
      .status(429)
      .send(loginPage({ error: `Too many attempts. Try again in ${rl.retryInSec}s.` }));
  }
  const password = req.body.password || "";
  if (timingSafeEqual(password, ADMIN_PASSWORD)) {
    recordLoginSuccess(ip);
    req.session.authed = true;
    return res.redirect("/");
  }
  recordLoginFailure(ip);
  res.status(401).send(loginPage({ error: "Wrong password." }));
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Render's health check hits this unauthenticated — must stay before the
// auth wall below, or Render sees every check as a 302 and marks the
// service unhealthy.
app.get("/healthz", (req, res) => res.status(200).send("ok"));

app.use((req, res, next) => {
  if (!req.session || !req.session.authed) return res.redirect("/login");
  next();
});

const PAGE_SIZE = 50;
function pageParam(req) {
  const p = parseInt(req.query.page, 10);
  return Number.isFinite(p) && p > 0 ? p : 1;
}

// ── Overview ────────────────────────────────────────────────────────────────
app.get("/", async (req, res, next) => {
  try {
    const [
      users, teachers, students, classes, generations,
      genToday, genWeek, errorsToday, recentSignups, recentGens,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS n FROM users"),
      pool.query(
        "SELECT COUNT(DISTINCT ur.user_id)::int AS n FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE r.code = 'teacher'"
      ),
      pool.query(
        "SELECT COUNT(DISTINCT ur.user_id)::int AS n FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE r.code = 'student'"
      ),
      pool.query("SELECT COUNT(*)::int AS n FROM classes"),
      pool.query("SELECT COUNT(*)::int AS n FROM generations"),
      pool.query("SELECT COUNT(*)::int AS n FROM generations WHERE created_at >= CURRENT_DATE"),
      pool.query("SELECT COUNT(*)::int AS n FROM generations WHERE created_at >= NOW() - INTERVAL '7 days'"),
      pool.query(
        "SELECT COUNT(*)::int AS n FROM generations WHERE status = 'error' AND created_at >= CURRENT_DATE"
      ),
      pool.query(
        "SELECT id, email, display_name, created_at FROM users ORDER BY created_at DESC LIMIT 8"
      ),
      pool.query(
        `SELECT g.id, g.subject, g.topic, g.type, g.status, g.created_at, u.email
           FROM generations g JOIN users u ON u.id = g.user_id
          ORDER BY g.created_at DESC LIMIT 8`
      ),
    ]);

    const cards = [
      ["Users", users.rows[0].n],
      ["Teachers", teachers.rows[0].n],
      ["Students", students.rows[0].n],
      ["Classes", classes.rows[0].n],
      ["Generations (total)", generations.rows[0].n],
      ["Generations today", genToday.rows[0].n],
      ["Generations (7d)", genWeek.rows[0].n],
      ["Errors today", errorsToday.rows[0].n],
    ]
      .map(([l, n]) => `<div class="card"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`)
      .join("");

    const signupsRows = recentSignups.rows
      .map(
        (u) =>
          `<tr><td>${esc(u.email)}</td><td>${esc(u.display_name)}</td><td class="muted">${fmtDate(u.created_at)}</td></tr>`
      )
      .join("");

    const gensRows = recentGens.rows
      .map(
        (g) =>
          `<tr><td>${esc(g.email)}</td><td>${esc(g.subject)} — ${esc(g.topic)}</td><td>${esc(g.type)}</td>` +
          `<td><span class="badge ${esc(g.status)}">${esc(g.status)}</span></td><td class="muted">${fmtDate(g.created_at)}</td></tr>`
      )
      .join("");

    const body = `
      <h1>Overview</h1>
      <p class="sub">Live counts from the same database as the main app.</p>
      <div class="cards">${cards}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
        <div>
          <h2 style="font-size:14px;margin:0 0 10px">Recent signups</h2>
          <table><thead><tr><th>Email</th><th>Name</th><th>Joined</th></tr></thead>
          <tbody>${signupsRows || `<tr><td colspan="3" class="muted">No users yet.</td></tr>`}</tbody></table>
        </div>
        <div>
          <h2 style="font-size:14px;margin:0 0 10px">Recent generations</h2>
          <table><thead><tr><th>User</th><th>Subject / Topic</th><th>Type</th><th>Status</th><th>When</th></tr></thead>
          <tbody>${gensRows || `<tr><td colspan="5" class="muted">No generations yet.</td></tr>`}</tbody></table>
        </div>
      </div>
    `;
    res.send(layout({ title: "Overview", active: "/", body }));
  } catch (e) {
    next(e);
  }
});

// ── Users ───────────────────────────────────────────────────────────────────
app.get("/users", async (req, res, next) => {
  try {
    const page = pageParam(req);
    const q = (req.query.q || "").trim();
    const params = [];
    let where = "";
    if (q) {
      params.push(`%${q}%`);
      where = `WHERE u.email ILIKE $${params.length} OR u.display_name ILIKE $${params.length}`;
    }
    params.push(PAGE_SIZE + 1, (page - 1) * PAGE_SIZE);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;

    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.display_name, u.coins, u.is_active, u.last_login_at, u.created_at,
              COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), '{}') AS roles
         FROM users u
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN roles r ON r.id = ur.role_id
         ${where}
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    const hasMore = rows.length > PAGE_SIZE;
    const pageRows = rows.slice(0, PAGE_SIZE);

    const trs = pageRows
      .map((u) => {
        const roleBadges = (u.roles || []).map((r) => `<span class="badge ${esc(r)}">${esc(r)}</span>`).join(" ");
        return `<tr>
          <td>${esc(u.email)}</td>
          <td>${esc(u.display_name || "—")}</td>
          <td>${roleBadges || '<span class="muted">—</span>'}</td>
          <td>${esc(u.coins)}</td>
          <td>${u.is_active ? "Active" : '<span class="badge inactive">Disabled</span>'}</td>
          <td class="muted">${fmtDate(u.last_login_at)}</td>
          <td class="muted">${fmtDate(u.created_at)}</td>
          <td>
            <form method="post" action="/users/${u.id}/toggle-active" style="display:inline">
              <button class="btn ${u.is_active ? "danger" : ""}" type="submit"
                onclick="return confirm('${u.is_active ? "Disable" : "Re-enable"} ${esc(u.email)}?')">
                ${u.is_active ? "Disable" : "Enable"}
              </button>
            </form>
          </td>
        </tr>`;
      })
      .join("");

    const body = `
      <h1>Users</h1>
      <p class="sub">${esc(pageRows.length)} shown${q ? ` for “${esc(q)}”` : ""}. Disabling blocks login without deleting any data.</p>
      <form class="toolbar" method="get" action="/users">
        <input type="text" name="q" placeholder="Search by email or name…" value="${esc(q)}" />
        <button class="btn" type="submit">Search</button>
        ${q ? `<a class="btn" href="/users">Clear</a>` : ""}
      </form>
      <table>
        <thead><tr><th>Email</th><th>Name</th><th>Roles</th><th>Coins</th><th>Status</th><th>Last login</th><th>Joined</th><th></th></tr></thead>
        <tbody>${trs || `<tr><td colspan="8" class="muted">No users found.</td></tr>`}</tbody>
      </table>
      ${pager(`/users${q ? `?q=${encodeURIComponent(q)}` : ""}`, page, hasMore)}
    `;
    res.send(layout({ title: "Users", active: "/users", body }));
  } catch (e) {
    next(e);
  }
});

app.post("/users/:id/toggle-active", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.redirect("/users");
    await pool.query("UPDATE users SET is_active = NOT is_active WHERE id = $1", [id]);
    res.redirect("/users");
  } catch (e) {
    next(e);
  }
});

// ── Teachers ────────────────────────────────────────────────────────────────
app.get("/teachers", async (req, res, next) => {
  try {
    const page = pageParam(req);
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.display_name, u.created_at,
              COUNT(DISTINCT c.id)::int AS class_count,
              COUNT(DISTINCT cm.student_id) FILTER (WHERE cm.status = 'approved')::int AS student_count,
              COUNT(DISTINCT g.id)::int AS generation_count
         FROM users u
         JOIN user_roles ur ON ur.user_id = u.id
         JOIN roles r ON r.id = ur.role_id AND r.code = 'teacher'
         LEFT JOIN classes c ON c.teacher_id = u.id
         LEFT JOIN class_members cm ON cm.class_id = c.id
         LEFT JOIN generations g ON g.user_id = u.id
        GROUP BY u.id
        ORDER BY generation_count DESC, u.created_at DESC
        LIMIT $1 OFFSET $2`,
      [PAGE_SIZE + 1, (page - 1) * PAGE_SIZE]
    );
    const hasMore = rows.length > PAGE_SIZE;
    const pageRows = rows.slice(0, PAGE_SIZE);

    const trs = pageRows
      .map(
        (t) =>
          `<tr><td>${esc(t.email)}</td><td>${esc(t.display_name || "—")}</td>` +
          `<td>${esc(t.class_count)}</td><td>${esc(t.student_count)}</td><td>${esc(t.generation_count)}</td>` +
          `<td class="muted">${fmtDate(t.created_at)}</td></tr>`
      )
      .join("");

    const body = `
      <h1>Teachers</h1>
      <p class="sub">Ranked by generations created.</p>
      <table>
        <thead><tr><th>Email</th><th>Name</th><th>Classes</th><th>Students (approved)</th><th>Generations</th><th>Joined</th></tr></thead>
        <tbody>${trs || `<tr><td colspan="6" class="muted">No teachers yet.</td></tr>`}</tbody>
      </table>
      ${pager("/teachers", page, hasMore)}
    `;
    res.send(layout({ title: "Teachers", active: "/teachers", body }));
  } catch (e) {
    next(e);
  }
});

// ── Classes ─────────────────────────────────────────────────────────────────
app.get("/classes", async (req, res, next) => {
  try {
    const page = pageParam(req);
    const { rows } = await pool.query(
      `SELECT c.id, c.name, c.join_code, c.created_at, u.email AS teacher_email,
              COUNT(cm.id) FILTER (WHERE cm.status = 'approved')::int AS approved_count,
              COUNT(cm.id) FILTER (WHERE cm.status = 'pending')::int AS pending_count
         FROM classes c
         JOIN users u ON u.id = c.teacher_id
         LEFT JOIN class_members cm ON cm.class_id = c.id
        GROUP BY c.id, u.email
        ORDER BY c.created_at DESC
        LIMIT $1 OFFSET $2`,
      [PAGE_SIZE + 1, (page - 1) * PAGE_SIZE]
    );
    const hasMore = rows.length > PAGE_SIZE;
    const pageRows = rows.slice(0, PAGE_SIZE);

    const trs = pageRows
      .map(
        (c) =>
          `<tr><td>${esc(c.name)}</td><td>${esc(c.teacher_email)}</td><td class="mono">${esc(c.join_code)}</td>` +
          `<td>${esc(c.approved_count)}</td><td>${esc(c.pending_count)}</td><td class="muted">${fmtDate(c.created_at)}</td></tr>`
      )
      .join("");

    const body = `
      <h1>Classes</h1>
      <table>
        <thead><tr><th>Name</th><th>Teacher</th><th>Join code</th><th>Students</th><th>Pending</th><th>Created</th></tr></thead>
        <tbody>${trs || `<tr><td colspan="6" class="muted">No classes yet.</td></tr>`}</tbody>
      </table>
      ${pager("/classes", page, hasMore)}
    `;
    res.send(layout({ title: "Classes", active: "/classes", body }));
  } catch (e) {
    next(e);
  }
});

// ── Generations ─────────────────────────────────────────────────────────────
app.get("/generations", async (req, res, next) => {
  try {
    const page = pageParam(req);
    const status = ["done", "error", "running", "pending"].includes(req.query.status)
      ? req.query.status
      : null;
    const params = [];
    let where = "";
    if (status) {
      params.push(status);
      where = `WHERE g.status = $${params.length}`;
    }
    params.push(PAGE_SIZE + 1, (page - 1) * PAGE_SIZE);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;

    const { rows } = await pool.query(
      `SELECT g.id, g.subject, g.topic, g.type, g.status, g.lang, g.created_at, u.email
         FROM generations g JOIN users u ON u.id = g.user_id
         ${where}
        ORDER BY g.created_at DESC
        LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    const hasMore = rows.length > PAGE_SIZE;
    const pageRows = rows.slice(0, PAGE_SIZE);

    const trs = pageRows
      .map(
        (g) =>
          `<tr><td>${esc(g.email)}</td><td>${esc(g.subject)} — ${esc(g.topic)}</td><td>${esc(g.type)}</td>` +
          `<td>${esc(g.lang)}</td><td><span class="badge ${esc(g.status)}">${esc(g.status)}</span></td>` +
          `<td class="muted">${fmtDate(g.created_at)}</td></tr>`
      )
      .join("");

    const filterLinks = ["done", "error", "running", "pending"]
      .map(
        (s) =>
          `<a class="btn${status === s ? " primary" : ""}" href="/generations?status=${s}">${s}</a>`
      )
      .join(" ");

    const body = `
      <h1>Generations</h1>
      <p class="sub">Lesson plans and tests created across all teachers.</p>
      <div class="toolbar">
        <a class="btn${!status ? " primary" : ""}" href="/generations">All</a>
        ${filterLinks}
      </div>
      <table>
        <thead><tr><th>User</th><th>Subject / Topic</th><th>Type</th><th>Lang</th><th>Status</th><th>When</th></tr></thead>
        <tbody>${trs || `<tr><td colspan="6" class="muted">Nothing here.</td></tr>`}</tbody>
      </table>
      ${pager(`/generations${status ? `?status=${status}` : ""}`, page, hasMore)}
    `;
    res.send(layout({ title: "Generations", active: "/generations", body }));
  } catch (e) {
    next(e);
  }
});

// ── Rate limits / abuse ─────────────────────────────────────────────────────
app.get("/abuse", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT bucket, hits, window_start FROM rate_limits ORDER BY hits DESC LIMIT 100`
    );
    const trs = rows
      .map(
        (r) =>
          `<tr><td class="mono">${esc(r.bucket)}</td><td>${esc(r.hits)}</td><td class="muted">${fmtDate(r.window_start)}</td></tr>`
      )
      .join("");
    const body = `
      <h1>Rate limits</h1>
      <p class="sub">Top 100 buckets by hit count — spot abuse or a misbehaving client. See backend/src/RateLimiter.php for bucket naming.</p>
      <table>
        <thead><tr><th>Bucket</th><th>Hits</th><th>Window start</th></tr></thead>
        <tbody>${trs || `<tr><td colspan="3" class="muted">No rate-limit activity recorded.</td></tr>`}</tbody>
      </table>
    `;
    res.send(layout({ title: "Rate limits", active: "/abuse", body }));
  } catch (e) {
    next(e);
  }
});

app.use((req, res) => {
  res.status(404).send(
    layout({ title: "Not found", active: "", body: "<h1>404</h1><p class='sub'>Nothing here.</p>" })
  );
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(
    layout({
      title: "Error",
      active: "",
      body: `<h1>Something broke</h1><p class="sub">${esc(err.message)}</p>`,
    })
  );
});

app.listen(PORT, () => {
  console.log(`[admin] listening on :${PORT}`);
});
