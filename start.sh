#!/bin/bash
cd qr_event
php artisan migrate --force
php artisan config:cache
php -S 0.0.0.0:${PORT:-8000} -t public
