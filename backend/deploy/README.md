# Deploying to a GCE Ubuntu VM

One-time setup, then a one-line redeploy for future pushes.

## 1. Firewall + DNS (GCP Console)

- VPC network → Firewall → allow ingress TCP 80 and 443 for tag `http-server`/`https-server` (0.0.0.0/0).
- Reserve a static external IP for the VM (VM instances → edit → make IP static), so the IP survives restarts.
- Point a DNS A record — `api.dhimaninteriors.in` — at that static IP.

## 2. SSH in and install packages

```bash
gcloud compute ssh <instance-name> --zone=<zone>
# or use the "SSH" button in the GCP console

sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-venv python3-pip nginx git certbot python3-certbot-nginx
```

## 3. Clone and set up the app

```bash
git clone https://github.com/dhimanromanregins/carpenter.git
cd carpenter/backend
python3 -m venv myenv
source myenv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env   # set CORS_ORIGINS to your production frontend domain(s), see below
```

`.env` for production:

```
DATABASE_URL=sqlite:///./carpenter.db
CORS_ORIGINS=https://dhimaninteriors.in,https://www.dhimaninteriors.in
GEMINI_API_KEY=<if used>
```

Sanity check it runs:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
# in another terminal: curl http://localhost:8000/health
# Ctrl+C once confirmed
```

## 4. systemd service (keeps it running, restarts on crash/reboot)

```bash
sudo cp deploy/dhiman-backend.service /etc/systemd/system/
sudo nano /etc/systemd/system/dhiman-backend.service   # replace <user> with `whoami`
sudo systemctl daemon-reload
sudo systemctl enable --now dhiman-backend
sudo systemctl status dhiman-backend
```

## 5. Nginx reverse proxy + HTTPS

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/dhiman-backend
sudo ln -s /etc/nginx/sites-available/dhiman-backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

sudo certbot --nginx -d api.dhimaninteriors.in   # sets up HTTPS + auto-renewal
```

## 6. Point the frontend at it

In the frontend's production env (e.g. Vercel project settings):

```
VITE_API_URL=https://api.dhimaninteriors.in/api
```

Redeploy the frontend after setting this.

## 7. Future updates

```bash
cd carpenter/backend
bash deploy/redeploy.sh
```

This does `git pull` → `pip install -r requirements.txt` → `systemctl restart dhiman-backend`.

## Notes

- SQLite (`carpenter.db`) lives on the VM's disk — back it up periodically (`scp` or a cron job copying it somewhere durable). It's fine for a single-VM setup but doesn't support horizontal scaling.
- `uvicorn` binds to `127.0.0.1` only — nginx is the only thing exposed to the internet (port 80/443), which is why the systemd service is safe without its own auth.
