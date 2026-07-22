#!/usr/bin/env python3
"""
產生 OG 圖用的 subset 字型（scripts/assets/og-font.ttf）。
只在資料新增了新字時需要重跑：
  1) 下載 Noto Sans TC 可變字型到 /tmp/NotoSansTC.ttf
     curl -sL -o /tmp/NotoSansTC.ttf "https://github.com/google/fonts/raw/main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf"
  2) python3 scripts/build-og-font.py /tmp/NotoSansTC.ttf
CI 不需要 python/fonttools —— 只用 commit 進 repo 的 og-font.ttf。
"""
import sys, os, json, re, glob
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/NotoSansTC.ttf'
OUT = os.path.join(ROOT, 'scripts', 'assets', 'og-font.ttf')

chars = set()

# 固定字元：英數、標點、OG 卡片會用到的固定標籤字
FIXED = ('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
         ' .,·、，。：；！？（）()[]「」【】—-–—/｜|&#%+’\'"…°'
         '匹克球場地圖城市縣區室內戶外風雨免費收費付費面座職業選手深度專欄技巧'
         '百科訓練菜單學習路徑新手懶人包球拍裝備規則賽事術語字典評級名人堂台灣全')
chars.update(FIXED)

# courts.json：球場名、縣市、行政區
with open(os.path.join(ROOT, 'public', 'data', 'courts.json'), encoding='utf-8') as f:
    data = json.load(f)
for c in data['courts']:
    chars.update(c.get('name', ''))
    loc = c.get('location', {})
    chars.update(loc.get('city', ''))
    chars.update(loc.get('district', ''))

# 資料 .ts 檔：抓所有中文字（涵蓋標題/名稱，確保任何 OG 文字都有字模）
for fn in glob.glob(os.path.join(ROOT, 'src', 'data', '*.ts')) + [os.path.join(ROOT, 'src', 'utils', 'cityData.ts')]:
    with open(fn, encoding='utf-8') as f:
        chars.update(re.findall(r'[一-鿿　-〿＀-￯]', f.read()))

# 1) 可變字型 → 固定 wght=700
font = TTFont(SRC)
if 'fvar' in font:
    instantiateVariableFont(font, {'wght': 700}, inplace=True)
tmp = '/tmp/og-font-700.ttf'
font.save(tmp)

# 2) subset 到用到的字
ss = subset.Subsetter(options=subset.Options(layout_features='*', notdef_outline=True, recalc_bounds=True))
f2 = subset.load_font(tmp, subset.Options())
ss.populate(unicodes=[ord(ch) for ch in chars])
ss.subset(f2)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
subset.save_font(f2, OUT, subset.Options())

sz = os.path.getsize(OUT)
print(f'OG font: {len(chars)} chars → {OUT} ({sz//1024} KB)')
