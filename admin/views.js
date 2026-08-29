// Простые HTML-шаблоны через template strings — без движка шаблонов (ejs/pug),
// чтобы не тащить лишнюю зависимость ради внутреннего инструмента на одного
// администратора. esc() обязателен на любом значении из базы: subject/topic/
// display_name/note и т.д. — это ввод учителей и учеников из основного
// приложения, а не наш собственный контент.
"use strict";

function esc(v) {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

const NAV = [
  ["/", "Overview"],
  ["/users", "Users"],
  ["/teachers", "Teachers"],
  ["/classes", "Classes"],
  ["/generations", "Generations"],
  ["/abuse", "Rate limits"],
];

function layout({ title, active, body }) {
  const nav = NAV.map(
    ([href, label]) =>
      `<a href="${href}" class="nav-link${active === href ? " active" : ""}">${esc(label)}</a>`
  ).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${esc(title)} — Lesson Planner Admin</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #f8fafc; color: #0f172a; font-size: 14px;
  }
  header {
    background: #0f172a; color: #fff; padding: 14px 24px;
    display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
  }
  header .brand { font-weight: 800; letter-spacing: -0.02em; font-size: 15px; }
  header .brand span { color: #34d399; }
  nav { display: flex; gap: 4px; flex-wrap: wrap; flex: 1; }
  .nav-link {
    color: #cbd5e1; text-decoration: none; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600;
  }
  .nav-link:hover { background: #1e293b; color: #fff; }
  .nav-link.active { background: #059669; color: #fff; }
  form.logout button {
    background: transparent; border: 1px solid #334155; color: #cbd5e1; border-radius: 8px;
    padding: 6px 12px; font-size: 13px; cursor: pointer; font-weight: 600;
  }
  form.logout button:hover { background: #1e293b; }
  main { max-width: 1180px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; letter-spacing: -0.02em; }
  .sub { color: #64748b; margin: 0 0 20px; font-size: 13px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 28px; }
  .card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;
  }
  .card .n { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
  .card .l { color: #64748b; font-size: 12px; margin-top: 2px; }
  a { color: #059669; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
  th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  th { background: #f8fafc; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f8fafc; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; }
  .badge.teacher { background: #d1fae5; color: #065f46; }
  .badge.student { background: #dbeafe; color: #1e40af; }
  .badge.parent { background: #fef3c7; color: #92400e; }
  .badge.done { background: #d1fae5; color: #065f46; }
  .badge.error { background: #fee2e2; color: #991b1b; }
  .badge.running, .badge.pending { background: #fef3c7; color: #92400e; }
  .badge.inactive { background: #f1f5f9; color: #64748b; }
  .toolbar { display: flex; gap: 8px; margin-bottom: 14px; align-items: center; flex-wrap: wrap; }
  .toolbar input[type=text] {
    padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; min-width: 220px;
  }
  .toolbar button, .btn {
    padding: 8px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; font-size: 13px;
    font-weight: 600; cursor: pointer; color: #0f172a; text-decoration: none; display: inline-block;
  }
  .btn.primary { background: #059669; border-color: #059669; color: #fff; }
  .btn.danger { background: #fff; border-color: #fca5a5; color: #b91c1c; }
  .pager { display: flex; gap: 8px; margin-top: 14px; }
  .muted { color: #94a3b8; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  .kv { display: grid; grid-template-columns: 140px 1fr; gap: 8px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
  .kv dt { color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; align-self: center; }
  .kv dd { margin: 0; align-self: center; }
  .section-title { font-size: 14px; margin: 0 0 10px; font-weight: 800; }
  .back-link { display: inline-block; margin-bottom: 12px; font-size: 13px; font-weight: 600; color: #64748b; text-decoration: none; }
  .back-link:hover { color: #059669; }
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; }
  .login-box {
    background: #fff; border-radius: 16px; padding: 32px; width: 320px; box-shadow: 0 20px 60px rgba(0,0,0,0.35);
  }
  .login-box h1 { font-size: 18px; margin-bottom: 4px; }
  .login-box p { color: #64748b; font-size: 13px; margin: 0 0 20px; }
  .login-box input { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; margin-bottom: 12px; }
  .login-box button { width: 100%; padding: 10px; border-radius: 8px; border: none; background: #059669; color: #fff; font-weight: 700; cursor: pointer; }
  .err { background: #fee2e2; color: #991b1b; padding: 8px 12px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; }
</style>
</head>
<body>
  <header>
    <div class="brand">LESSON<span>.</span>LAB <span style="color:#94a3b8; font-weight: 600;">admin</span></div>
    <nav>${nav}</nav>
    <form class="logout" method="post" action="/logout"><button type="submit">Log out</button></form>
  </header>
  <main>${body}</main>
</body>
</html>`;
}

function loginPage({ error }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Sign in — Lesson Planner Admin</title>
<style>
  * { box-sizing: border-box; }
  body { margin:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; }
  .login-box { background: #fff; border-radius: 16px; padding: 32px; width: 320px; box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
  .login-box h1 { font-size: 18px; margin: 0 0 4px; letter-spacing: -0.02em; }
  .login-box p { color: #64748b; font-size: 13px; margin: 0 0 20px; }
  .login-box input { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; margin-bottom: 12px; }
  .login-box button { width: 100%; padding: 10px; border-radius: 8px; border: none; background: #059669; color: #fff; font-weight: 700; cursor: pointer; font-size: 14px; }
  .err { background: #fee2e2; color: #991b1b; padding: 8px 12px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; }
</style>
</head>
<body>
  <div class="login-wrap">
    <div class="login-box">
      <h1>Lesson Planner <span style="color:#059669">Admin</span></h1>
      <p>Internal dashboard. Not indexed, not linked from the main site.</p>
      ${error ? `<div class="err">${esc(error)}</div>` : ""}
      <form method="post" action="/login">
        <input type="password" name="password" placeholder="Admin password" autofocus required />
        <button type="submit">Sign in</button>
      </form>
    </div>
  </div>
</body>
</html>`;
}

function pager(base, page, hasMore) {
  const qs = (p) => {
    const u = new URL(base, "http://x");
    u.searchParams.set("page", p);
    return u.pathname + "?" + u.searchParams.toString();
  };
  return `<div class="pager">
    ${page > 1 ? `<a class="btn" href="${qs(page - 1)}">← Prev</a>` : `<span class="btn" style="opacity:.4;pointer-events:none">← Prev</span>`}
    <span class="muted" style="align-self:center">Page ${page}</span>
    ${hasMore ? `<a class="btn" href="${qs(page + 1)}">Next →</a>` : `<span class="btn" style="opacity:.4;pointer-events:none">Next →</span>`}
  </div>`;
}

module.exports = { esc, fmtDate, layout, loginPage, pager };
