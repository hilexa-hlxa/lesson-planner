#!/usr/bin/env sh
# Проверка синтаксиса всего PHP в backend/ (php -l по каждому файлу).
#
# Зачем отдельный скрипт, а не строка в workflow: ровно эта же проверка
# нужна локально (`make lint`) и в CI (.github/workflows/ci.yml). Одно
# определение вместо двух расходящихся копий — иначе локально и в CI
# «залинтить PHP» со временем начинает означать разное.
#
# Почему это вообще важно: у бэкенда нет ни тестов, ни типов, ни сборки —
# синтаксическая ошибка в .php ничем не ловится до момента, когда Apache
# отдаёт 500 живому пользователю. `php -l` стоит секунду и закрывает
# именно этот случай.
#
# vendor/ исключён: это код Composer'а, не наш, и он всё равно в .gitignore.

set -eu

cd "$(dirname "$0")/.."

if ! command -v php >/dev/null 2>&1; then
  echo "lint-php: php не найден в PATH" >&2
  exit 127
fi

status=0
count=0

# read -r в цикле, а не xargs: нужен свой код возврата и внятный вывод по
# каждому упавшему файлу, а не общий «xargs: exited with status 255».
while IFS= read -r file; do
  count=$((count + 1))
  if ! output=$(php -l "$file" 2>&1); then
    echo "$output" >&2
    status=1
  fi
done <<EOF
$(find backend -name '*.php' -not -path 'backend/vendor/*' | sort)
EOF

if [ "$count" -eq 0 ]; then
  echo "lint-php: не найдено ни одного .php — проверка бессмысленна, что-то не так с путями" >&2
  exit 1
fi

if [ "$status" -eq 0 ]; then
  echo "lint-php: ok ($count files, $(php -r 'echo PHP_VERSION;'))"
fi

exit "$status"
