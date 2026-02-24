FROM php:8.4-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    sqlite3 \
    libsqlite3-dev \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_sqlite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy entire project
COPY . .

WORKDIR /app/qr_event

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies
RUN npm ci

# Build frontend
RUN npm run build

# Set up Laravel
RUN php artisan config:cache
RUN php artisan route:cache

# Make start.sh executable
RUN chmod +x /app/start.sh

EXPOSE 8000

CMD ["/bin/bash", "/app/start.sh"]
