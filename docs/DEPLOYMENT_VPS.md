# VPS Deployment Guide

Complete guide for deploying MemeNano to a Virtual Private Server (VPS) using Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Server Requirements](#server-requirements)
- [Initial Server Setup](#initial-server-setup)
- [Docker Installation](#docker-installation)
- [Application Deployment](#application-deployment)
- [Nginx Reverse Proxy Setup](#nginx-reverse-proxy-setup)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- VPS with Ubuntu 22.04 LTS (or similar Linux distribution)
- Root or sudo access
- Domain name pointing to your VPS IP address
- Basic Linux command line knowledge

## Server Requirements

**Minimum:**
- 1 CPU core
- 1 GB RAM
- 10 GB disk space
- Ubuntu 22.04 LTS or newer

**Recommended:**
- 2 CPU cores
- 2 GB RAM
- 20 GB disk space
- Ubuntu 22.04 LTS

## Initial Server Setup

### 1. Update System

```bash
# Update package list
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git vim ufw
```

### 2. Configure Firewall

```bash
# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 3. Create Application User (Optional but Recommended)

```bash
# Create user
sudo adduser memenano

# Add to sudo group
sudo usermod -aG sudo memenano

# Switch to new user
su - memenano
```

## Docker Installation

### 1. Install Docker

```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Verify installation
docker --version
```

### 2. Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Apply executable permissions
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 3. Configure Docker for Non-Root User

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Apply group changes (or logout and login)
newgrp docker

# Test Docker without sudo
docker ps
```

## Application Deployment

### 1. Clone Repository

```bash
# Navigate to home directory
cd ~

# Create app directory
mkdir -p apps
cd apps

# Clone repository (replace with your repo)
git clone https://github.com/yourusername/meme-nano-web.git
cd meme-nano-web
```

### 2. Configure Environment (Optional)

If you need environment variables:

```bash
# Create .env file
nano .env
```

Add any environment variables:
```env
NODE_ENV=production
PORT=3000
```

### 3. Build Docker Image

```bash
# Build the Docker image
docker build -t meme-nano-web:latest .

# Verify image
docker images | grep meme-nano
```

### 4. Run with Docker Compose

```bash
# Start application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f meme-nano-web

# Stop application
docker-compose down
```

### 5. Verify Application

```bash
# Check if app is running
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"MemeNano","version":"1.0.0"}
```

## Nginx Reverse Proxy Setup

### 1. Install Nginx

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 2. Configure Nginx for MemeNano

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/meme-nano
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000/_next/static;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Client max body size
    client_max_body_size 10M;
}
```

### 3. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/meme-nano /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## SSL Certificate Setup

### 1. Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect option (recommended: Yes)
```

### 3. Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
# Dry run renewal
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

### 4. Updated Nginx Configuration

After SSL setup, your Nginx config will be automatically updated. Verify:

```bash
sudo nano /etc/nginx/sites-available/meme-nano
```

Should now include SSL configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # ... rest of configuration
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Maintenance

### 1. View Application Logs

```bash
# Docker Compose logs
docker-compose logs -f meme-nano-web

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 2. Container Management

```bash
# Stop container
docker-compose down

# Start container
docker-compose up -d

# Restart container
docker-compose restart

# View container stats
docker stats meme-nano-web

# Execute command in container
docker-compose exec meme-nano-web sh
```

### 3. Application Updates

```bash
# Navigate to app directory
cd ~/apps/meme-nano-web

# Pull latest changes
git pull origin main

# Rebuild image
docker-compose build

# Restart with new image
docker-compose down
docker-compose up -d

# Clean up old images
docker image prune -a
```

### 4. Backup

```bash
# Create backup script
nano ~/backup.sh
```

Add the following:
```bash
#!/bin/bash
BACKUP_DIR="/home/memenano/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/meme-nano-app-$DATE.tar.gz ~/apps/meme-nano-web

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t meme-nano-app-*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup completed: meme-nano-app-$DATE.tar.gz"
```

Make executable and add to cron:
```bash
chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /home/memenano/backup.sh
```

### 5. Monitoring with Uptime Checks

Set up basic monitoring:

```bash
# Install monitoring tool
sudo apt install -y monit

# Configure for MemeNano
sudo nano /etc/monit/conf.d/meme-nano
```

Add configuration:
```
check process meme-nano-web matching "node server.js"
  start program = "/usr/local/bin/docker-compose -f /home/memenano/apps/meme-nano-web/docker-compose.yml up -d"
  stop program = "/usr/local/bin/docker-compose -f /home/memenano/apps/meme-nano-web/docker-compose.yml down"
  if failed host localhost port 3000 protocol http
    and request "/api/health"
    with timeout 10 seconds
    then restart
  if 3 restarts within 5 cycles then timeout
```

Enable Monit:
```bash
sudo systemctl enable monit
sudo systemctl start monit
sudo monit status
```

## Troubleshooting

### Application Not Starting

```bash
# Check Docker logs
docker-compose logs meme-nano-web

# Check container status
docker ps -a

# Restart container
docker-compose restart

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

### Memory Issues

```bash
# Check memory usage
free -h

# Check Docker memory
docker stats

# Increase swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Nginx Not Working

```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check Nginx SSL configuration
sudo nginx -t
```

### Docker Issues

```bash
# Restart Docker service
sudo systemctl restart docker

# Clean up Docker system
docker system prune -a

# Check Docker status
sudo systemctl status docker

# View Docker logs
sudo journalctl -u docker
```

## Performance Optimization

### 1. Enable Nginx Caching

Edit Nginx config:
```nginx
# Add to http block
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=meme_cache:10m max_size=100m inactive=60m;

# Add to location /
proxy_cache meme_cache;
proxy_cache_valid 200 10m;
proxy_cache_bypass $http_cache_control;
add_header X-Cache-Status $upstream_cache_status;
```

### 2. Enable Gzip Compression

Add to Nginx server block:
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### 3. Docker Resource Limits

Update docker-compose.yml:
```yaml
services:
  meme-nano-web:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Enable automatic security updates:**
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

3. **Configure fail2ban:**
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

4. **Disable root SSH login:**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   sudo systemctl restart sshd
   ```

5. **Regular backups:** Run backup script daily

6. **Monitor logs:** Check logs regularly for suspicious activity

## Next Steps

- Set up monitoring with Uptime Robot or similar service
- Configure backup restoration process
- Set up CI/CD pipeline for automatic deployments
- Consider using Docker Swarm or Kubernetes for scaling
- Implement log aggregation with ELK stack

## Support

For issues and questions:
- Check application logs: `docker-compose logs -f`
- Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- See main documentation: `docs/README.md`
- Report issues on GitHub repository