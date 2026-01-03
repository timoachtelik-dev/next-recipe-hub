# Production deploy (VPS + Caddy)

Target domain: `demo-recipe-hub.timo-achtelik.de` (A/AAAA -> `185.248.141.199`)

## 1) App directory

```bash
sudo mkdir -p /var/www/demo-recipe-hub
sudo chown -R $USER:$USER /var/www/demo-recipe-hub
git clone <repo-url> /var/www/demo-recipe-hub
cd /var/www/demo-recipe-hub
npm ci
```

## 2) Environment

```bash
cp deploy/.env.production.example /var/www/demo-recipe-hub/.env.production
# edit secrets + URLs
```

## 3) Database

```bash
docker compose up -d
npm run db:migrate
# optional: seed demo data
npm run import:from-json
```

## 4) Build + start

```bash
npm run build
sudo cp deploy/systemd/demo-recipe-hub.service /etc/systemd/system/demo-recipe-hub.service
sudo systemctl daemon-reload
sudo systemctl enable --now demo-recipe-hub
```

If you want to run under a different user, edit `User=` and `Group=` in
`deploy/systemd/demo-recipe-hub.service`.

## 5) Caddy

Copy `deploy/caddy/demo-recipe-hub.caddy` into your Caddy config directory
(` /var/snap/caddy/common/ `) and import it from the main Caddyfile.

```bash
sudo systemctl reload caddy
```

## Logs

```bash
journalctl -u demo-recipe-hub -f
```
