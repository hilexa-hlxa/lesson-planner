# 1. Берем официальный образ PHP с Apache (веб-сервером)
FROM php:8.2-apache

# 2. Системные зависимости: PostgreSQL плюс расширения, которые требует
# phpoffice/phpword (gd и zip) — без них composer install падает на проверке
# платформы, а экспорт в DOCX не работает.
RUN apt-get update && apt-get install -y --no-install-recommends \
      libpq-dev libzip-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql gd zip \
    && rm -rf /var/lib/apt/lists/*

# 3. Включаем модуль Apache для путей (mod_rewrite)
RUN a2enmod rewrite

# 3.1 Composer и зависимости PHP. Без этого шага vendor/autoload.php в образе
# нет, и экспорт в DOCX падает: маршрут /api/generations/{id}/export-docx
# делает require этого файла. Ставим до копирования кода, чтобы слой с
# зависимостями кешировался и не пересобирался на каждую правку.
RUN apt-get update && apt-get install -y --no-install-recommends git unzip \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY composer.json composer.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# 4. Копируем код нашего бэкенда внутрь контейнера
COPY . /var/www/html/

# 5. Меняем конфиг Apache, чтобы он смотрел в папку public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# 6. Открываем 80-й порт
EXPOSE 80