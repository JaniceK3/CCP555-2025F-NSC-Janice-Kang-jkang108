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

---

## 7. Deploy the published Docker image (preferred for EC2)

GitHub Actions (`.github/workflows/ci.yml`) builds and pushes the `janicek3/fragments` image to Docker Hub on every commit to `main`. The repository is public: https://hub.docker.com/r/janicek3/fragments. You can confirm availability directly on EC2 by running `docker pull janicek3/fragments:latest`.

### 7.1 Install Docker on Amazon Linux 2023

```bash
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
exit  # log back in so group membership refreshes
```

### 7.2 Prepare runtime secrets

Create an environment file (e.g., `fragments.env`) in your home directory. Include the same variables the Node server expects (Cognito, Basic Auth, API URL, etc.). Example:

```
NODE_ENV=production
PORT=8080
API_URL=https://<your-domain>
BASIC_AUTH_FILE=/app/tests/.htpasswd
# ...other secrets...
```

Copy your `.htpasswd` file alongside `fragments.env` so Docker can mount or read it later if you override credentials.

### 7.3 Run the published container

```bash
docker pull janicek3/fragments:latest
docker run -d \
  --name fragments \
  --env-file ~/fragments.env \
  -p 8080:8080 \
  janicek3/fragments:latest
```

The container image already includes the bundled `tests/.htpasswd` file and defaults to the non-root `app` user. Check logs with `docker logs -f fragments`.

### 7.4 Updating to new builds

Each push to `main` produces three tags: `latest`, `main`, and a commit-specific `sha-<git-sha>` (see the `docker-hub` job in the CI workflow). To upgrade:

```bash
docker pull janicek3/fragments:latest
docker stop fragments && docker rm fragments
docker run -d --name fragments --env-file ~/fragments.env -p 8080:8080 janicek3/fragments:latest
```

Reuse the SHA tag if you want deterministic rollbacks:

```bash
docker pull janicek3/fragments:sha-<commit>
docker run -d --name fragments --env-file ~/fragments.env -p 8080:8080 janicek3/fragments:sha-<commit>
```

Smoke test the deployed container exactly as before (`curl -i http://<dns>:8080/` etc.). This workflow ensures EC2 never builds images locally—you always pull the tested artifact from Docker Hub.
