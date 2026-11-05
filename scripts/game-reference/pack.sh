#!/usr/bin/env bash
# 把參考包連同引擎原始碼快照複製到手機專案：scripts/game-reference/pack.sh <目的地>
set -euo pipefail
dest="${1:?用法：pack.sh <目的地，例如 ../pickle-gang/reference/web-v1>}"
root="$(cd "$(dirname "$0")/../.." && pwd)"
mkdir -p "$dest"
cp -R "$root/game-reference/." "$dest/"
rm -rf "$dest/engine-src"
mkdir -p "$dest/engine-src"
cp -R "$root/src/components/game/engine/." "$dest/engine-src/"
cp "$root/src/components/game/characters.ts" "$dest/engine-src/characters.ts"
git -C "$root" rev-parse HEAD > "$dest/VERSION"
echo "參考包已複製到 $dest（commit $(cat "$dest/VERSION" | cut -c1-8)）"
