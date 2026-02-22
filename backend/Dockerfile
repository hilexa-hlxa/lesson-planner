# 1. Берем официальный образ PHP с Apache (веб-сервером)
FROM php:8.2-apache

# 2. Устанавливаем системные зависимости для работы с PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# 3. Включаем модуль Apache для путей (mod_rewrite)
RUN a2enmod rewrite

# 4. Копируем код нашего бэкенда внутрь контейнера
COPY . /var/www/html/

# 5. Меняем конфиг Apache, чтобы он смотрел в папку public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# 6. Открываем 80-й порт
EXPOSE 80