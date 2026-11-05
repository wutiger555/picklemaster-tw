# 參考包匯出紀錄

- 來源 commit：`741c65715820e268733fb0f85ed062a2cee24bae`（加上同一個 PR 裡 engine/game.ts 的分身 lastHitter 修正；合併後重跑結果相同）
- 匯出日期：2026-11-05
- 引擎原始碼：`src/components/game/engine/`（同一個 commit）
- 重新產生：`npm run reference:export`（約 15 分鐘）；`npm run reference:check` 用同種子驗證引擎沒被改到

## 交付給手機專案時

```bash
scripts/game-reference/pack.sh <目的地>/reference/web-v1
```

會把這個資料夾加上 `engine-src/`（引擎原始碼快照）複製過去，並寫入 `VERSION`。
手機專案只讀 `params.json`、`FEEL.md`、`fixtures/bands.json`、`fixtures/rules/`；`fixtures/events/` 是網頁版自己的回歸資料。
