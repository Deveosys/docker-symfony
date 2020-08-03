FROM php:fpm-alpine

EXPOSE 9000
ENV APP_ENV=prod
ENV APP_DEBUG=0

COPY --from=composer /usr/bin/composer /usr/bin/composer
CMD composer install --optimize-autoloader --no-interaction --no-ansi --no-dev ; php bin/console doctrine:migrations:migrate --no-interaction ; php-fpm 
