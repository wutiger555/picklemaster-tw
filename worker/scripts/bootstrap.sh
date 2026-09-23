#!/usr/bin/env bash
# Phase 0：在新的 Cloudflare 帳號建立揪團約打的全部雲端資源。
# 可重複執行：已經存在的東西會沿用，不會重建。全程不印出任何密鑰。
#
# 前提：token 已存進鑰匙圈
#   security add-generic-password -a picklemaster -s picklemaster-cloudflare -w
set -euo pipefail
cd "$(dirname "$0")/.."

SITE_DOMAIN=picklemastertw.com   # 主站網域，只給 Turnstile 白名單用；網域本身留在原帳號
DB_NAME=picklemaster-play
WIDGET_NAME=picklemaster-play
REPO=wutiger555/picklemaster-tw

say() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
die() { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

CLOUDFLARE_API_TOKEN="$(security find-generic-password -s picklemaster-cloudflare -w 2>/dev/null)" \
  || die "鑰匙圈裡找不到 picklemaster-cloudflare，請先照搬家清單第 13 步存 token"
export CLOUDFLARE_API_TOKEN

cf() { # cf METHOD PATH [JSON]
  curl -sS -X "$1" "https://api.cloudflare.com/client/v4$2" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H 'Content-Type: application/json' ${3:+--data "$3"}
}
jqpy() { python3 -c "import json,sys; d=json.load(sys.stdin); $1"; }

say "驗證 token"
cf GET /user/tokens/verify | jqpy "assert d['success'] and d['result']['status']=='active', d; print('token 有效')"

say "找帳號"
CLOUDFLARE_ACCOUNT_ID="$(cf GET '/accounts?per_page=5' | jqpy "r=d['result']; assert len(r)==1, f'token 看得到 {len(r)} 個帳號，應該只有 1 個'; print(r[0]['id'])")"
export CLOUDFLARE_ACCOUNT_ID
echo "帳號 ID：$CLOUDFLARE_ACCOUNT_ID"

say "workers.dev 子網域"
SUB="$(cf GET "/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/subdomain" | jqpy "print((d.get('result') or {}).get('subdomain') or '')")"
if [ -z "$SUB" ]; then
  SUB="picklemaster-$(openssl rand -hex 3)"
  cf PUT "/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/subdomain" "{\"subdomain\":\"$SUB\"}" | jqpy "assert d['success'], d['errors']"
  echo "已建立 $SUB.workers.dev"
else
  echo "沿用 $SUB.workers.dev"
fi
API_URL="https://picklemaster-play.$SUB.workers.dev"

say "D1 資料庫"
DB_ID="$(npx wrangler d1 list --json 2>/dev/null | jqpy "print(next((x['uuid'] for x in d if x['name']=='$DB_NAME'), ''))")"
if [ -z "$DB_ID" ]; then
  npx wrangler d1 create "$DB_NAME" --location apac >/dev/null
  DB_ID="$(npx wrangler d1 list --json | jqpy "print(next(x['uuid'] for x in d if x['name']=='$DB_NAME'))")"
  echo "已建立 $DB_NAME"
else
  echo "沿用既有的 $DB_NAME"
fi
python3 - "$DB_ID" <<'PY'
import re, sys
p = 'wrangler.jsonc'; s = open(p).read()
s2 = re.sub(r'"database_id": "[0-9a-f-]+"', f'"database_id": "{sys.argv[1]}"', s)
open(p, 'w').write(s2)
print('wrangler.jsonc 的 database_id 已更新' if s2 != s else 'database_id 本來就是最新的')
PY
npx wrangler d1 migrations apply "$DB_NAME" --remote

say "部署 Worker"
npx wrangler deploy

say "密鑰"
EXISTING="$(npx wrangler secret list --format json 2>/dev/null | jqpy "print(' '.join(x['name'] for x in d))" || true)"
if [[ " $EXISTING " != *" TOKEN_SECRET "* ]]; then
  openssl rand -base64 48 | tr -d '\n' | npx wrangler secret put TOKEN_SECRET >/dev/null
  echo "TOKEN_SECRET 已設定"
else
  echo "TOKEN_SECRET 已存在，不覆寫（覆寫會讓所有球友的身分失效）"
fi

say "Turnstile（無感模式）"
WIDGET="$(cf GET "/accounts/$CLOUDFLARE_ACCOUNT_ID/challenges/widgets?per_page=50" | jqpy "
w=[x for x in d['result'] if x['name']=='$WIDGET_NAME']; print(w[0]['sitekey'] if w else '')")"
if [ -z "$WIDGET" ]; then
  RESP="$(cf POST "/accounts/$CLOUDFLARE_ACCOUNT_ID/challenges/widgets" \
    "{\"name\":\"$WIDGET_NAME\",\"domains\":[\"$SITE_DOMAIN\",\"www.$SITE_DOMAIN\",\"localhost\"],\"mode\":\"invisible\"}")"
  WIDGET="$(printf '%s' "$RESP" | jqpy "assert d['success'], d['errors']; print(d['result']['sitekey'])")"
  printf '%s' "$RESP" | jqpy "print(d['result']['secret'], end='')" | npx wrangler secret put TURNSTILE_SECRET >/dev/null
  echo "已建立 widget，TURNSTILE_SECRET 已設定"
else
  echo "沿用既有 widget"
fi
echo "Turnstile site key（公開值，前端用）：$WIDGET"

say "GitHub Actions 密鑰"
printf '%s' "$CLOUDFLARE_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN --repo "$REPO"
printf '%s' "$CLOUDFLARE_ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID --repo "$REPO"
if ! security find-generic-password -s picklemaster-backup-passphrase >/dev/null 2>&1; then
  # 備份金鑰同時存在鑰匙圈，才解得開備份
  security add-generic-password -a picklemaster -s picklemaster-backup-passphrase -w "$(openssl rand -base64 36)"
fi
security find-generic-password -s picklemaster-backup-passphrase -w | tr -d '\n' | gh secret set BACKUP_PASSPHRASE --repo "$REPO"
echo "CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID、BACKUP_PASSPHRASE 已設定"

say "健康檢查"
for i in 1 2 3 4 5 6; do
  if curl -sf "$API_URL/api/health" >/dev/null; then
    echo "$API_URL/api/health 正常"
    echo
    echo "前端要填的兩個值（公開值，不是密鑰）："
    echo "  PLAY_API = $API_URL"
    echo "  TURNSTILE_SITE_KEY = $WIDGET"
    exit 0
  fi
  echo "等待 workers.dev 生效（$i/6）…"; sleep 15
done
die "$API_URL 還連不上，幾分鐘後再試：curl $API_URL/api/health"
