# AWS EC2 Deployment Guide (HTTP -> HTTPS)

This guide details how to deploy the UCLA Delivery Network to an AWS EC2 instance (Ubuntu), configure Nginx as a reverse proxy, and secure it with a free SSL certificate from Let's Encrypt.

## Prerequisites

1.  **AWS Account**: Access to the AWS Console.
2.  **Domain Name**: You need a domain (e.g., `myapp.com`) pointing to your EC2 instance's public IP.
    - _Note_: You can use the raw IP for HTTP, but **HTTPS requires a domain name**.

## Step 1: Launch an EC2 Instance

1.  Go to **EC2 Dashboard** > **Launch Instance**.
2.  **Name**: `ucladn`
3.  **OS Image**: **Ubuntu Server 24.04 LTS** (or 22.04).
4.  **Instance Type**: `t2.micro` (Free tier eligible) or `t3.small`.
5.  **Key Pair**: Create a new key pair (e.g., `my-key.pem`) and download it. **Do not lose this.**
6.  **Network Settings**:
    - Allow SSH traffic from **My IP**.
    - Allow HTTP traffic from the internet.
    - Allow HTTPS traffic from the internet.
7.  **Launch Instance**.

## Step 2: Connect to Instance

Open your terminal and run:

```bash
# Set permissions for key
chmod 400 my-key.pem

# SSH into the instance (replace 1.2.3.4 with your EC2 Public IP)
ssh -i "my-key.pem" ubuntu@1.2.3.4
```

## Step 3: Install Dependencies

Update the system and install Node.js, Nginx, Git, and MySQL.

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx (Web Server)
sudo apt install -y nginx

# Install MySQL Server
sudo apt install -y mysql-server

# Verify installations
node -v
npm -v
mysql --version
```

## Step 4: Configure MySQL

Secure the installation and create your database.

```bash
# Secure MySQL (set root password, remove anonymous users, etc.)
sudo mysql_secure_installation

# Log in to MySQL
sudo mysql -u root -p

# (Inside MySQL Shell)
CREATE DATABASE projDB;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON projDB.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 5: Clone and Setup App

```bash
# Clone repository
git clone https://github.com/MagiCarpy/35L_Project.git
cd 35L_Project

# Install Dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Create .env file
nano .env
```

Paste your production environment variables (use the MySQL credentials you just created):

```env
PORT=5000
NODE_ENV=production
MYSQL_HOST=localhost
MYSQL_USER=app_user
MYSQL_PASS=secure_password
MYSQL_DB=projDB
MYSQL_PORT=3306
SESSION_SECRET=very_long_random_string
ORS_API_KEY=your_api_key
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

## Step 6: Build and Run

```bash
# Build the frontend
# build is slow on ec2, just scp local /frontend/dist to the ec2 instance.
npm run build

# Install PM2 (Process Manager) globally
sudo npm install -g pm2

# Start the backend with PM2
cd backend

pm2 start "node server.js" \
  --name "ucladn" \
  --time \
  --env production

# Save PM2 list so it restarts on reboot
pm2 save
pm2 startup
# (Run the command output by pm2 startup)
```

## Step 7: Configure Nginx (Reverse Proxy)

We will tell Nginx to forward traffic from port 80 to our app on port 5000.

```bash
# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Create new config
sudo nano /etc/nginx/sites-available/ucladn
```

Paste the following configuration (replace `yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name yourdomain.org www.yourdomain.org;

    client_max_body_size 20M;

    root /home/ubuntu/35L_Project/frontend/dist;   # ← exact path where you copied dist/
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA routing – critical for React/Vite
    }

    # If you still have API endpoints on Node
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
    }

    # Static files (profile pictures, etc.)
    location /public/ {
        proxy_pass http://127.0.0.1:5000;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/ucladn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 8: Setup HTTPS (SSL)

We will use Certbot to automatically obtain and configure a free Let's Encrypt SSL certificate.

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain Certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically update your Nginx config to redirect HTTP to HTTPS.

## Verification

1.  Visit `https://yourdomain.com`.
2.  You should see your app securely loaded!
