# Fragments API Deployment Guide

## 1. Launch + prepare EC2

1. Launch an EC2 instance (t3.micro is enough for the assignment) with Amazon Linux 2023.
2. Open the security group to allow inbound HTTP traffic to `PORT` (typically TCP 8080).
3. SSH into the instance and install Node 20 + Git:

   ```bash
   sudo dnf install -y nodejs git
   node --version   # verify >= 20.x
   npm --version
   ```

4. (Optional) Install `pm2` globally for process management: `sudo npm install -g pm2`.

---

## 2. Copy the project

There are two easy options:

- **Git pull**: push your repository to GitHub and clone on EC2  
  ```bash
  git clone https://github.com/<you>/<repo>.git
  cd CCP555-2025F-NSC-Janice-Kang-jkang108/fragments
  ```

- **Upload zip**: compress locally, `scp` to EC2, unzip in `/home/ec2-user`.

Once the code is on the instance, install dependencies:

```bash
npm ci
```

Run the test/lint suite once to verify the environment:

```bash
npm run lint
npm test
```

---

## 3. Configure runtime env

Create a `.env` file (same directory as `package.json`) with production values:

Because `src/index.js` calls `require('dotenv').config()`, these values are loaded automatically when the server starts.

---

## 4. Start the server

### 4.1 Simple foreground start

```bash
npm start
```

Keep the terminal open; `CTRL+C` stops the server. Useful while debugging.

### 4.2 Background with `pm2` (recommended)

```bash
pm2 start src/index.js --name fragments --env production
pm2 save
pm2 startup systemd  # prints a command; run it once to register on boot
```

`pm2 logs fragments` tails the logs; `pm2 restart fragments` restarts after deploying updates.

### 4.3 systemd service (alternative)

Create `/etc/systemd/system/fragments.service` (requires sudo):

```
[Unit]
Description=Fragments API
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/ec2-user/CCP555-2025F-NSC-Janice-Kang-jkang108/fragments
EnvironmentFile=/home/ec2-user/CCP555-2025F-NSC-Janice-Kang-jkang108/fragments/.env
ExecStart=/usr/bin/node src/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable + start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable fragments
sudo systemctl start fragments
sudo systemctl status fragments
```

---

## 5. Smoke test

From your laptop:

```bash
curl -i http://<ec2-public-dns>:8080/
curl -i -u you@example.com:password http://<ec2-public-dns>:8080/v1/fragments
```

You should see the JSON health response and an authenticated fragments payload. Capture screenshots for the technical report.

---

## 6. Deploying updates

1. Pull the latest code (`git pull` or copy new build).
2. Run `npm ci`, `npm run lint`, `npm test`.
3. Restart the process manager (`pm2 restart fragments` or `sudo systemctl restart fragments`).
4. Re-run the health check.

Keep the `.env` file out of version control to avoid leaking secrets—SCP it to EC2 separately or use AWS SSM Parameter Store for long-term storage.

---

With the API running on EC2, point the fragments UI’s `API_URL` at the public DNS (or an HTTPS reverse proxy) so the web app talks to your deployed backend. That completes the deployment portion of Assignment 1.
