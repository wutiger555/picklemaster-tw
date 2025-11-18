# PostCSS 配置問題快速修復指南

## 問題描述
如果你在本地運行 `npm run dev` 時看到以下錯誤：
```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin...
```

## ✅ 已嘗試的修復

已更新 `postcss.config.js` 為正確的 ESM 格式：
```javascript
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss,
    autoprefixer,
  ],
};
```

## 🔧 如果問題仍然存在

### 方法 1: 清理並重新安裝依賴

```bash
# 刪除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安裝
npm install

# 啟動開發服務器
npm run dev
```

### 方法 2: 使用 CommonJS 格式 (備用方案)

如果 ESM 格式有問題，可以嘗試將 `postcss.config.js` 改名為 `postcss.config.cjs` 並使用 CommonJS 格式：

```javascript
// postcss.config.cjs
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 方法 3: 確保版本一致

檢查 `package.json` 確保以下版本：
- `tailwindcss`: `^3.4.18` ✅
- `postcss`: `^8.5.6` ✅
- `autoprefixer`: `^10.4.22` ✅
- `vite`: `^7.2.2` ✅

### 方法 4: 驗證 Tailwind 配置導入

確保 `tailwind.config.js` 中的 import 路徑正確：
```javascript
import designTokens from './src/styles/designTokens';
// 或者使用絕對路徑
import designTokens from './src/styles/designTokens.ts';
```

## 🐛 調試步驟

1. **檢查 Node.js 版本**
   ```bash
   node --version  # 應該是 v18+ 或 v20+
   ```

2. **檢查是否有多個 PostCSS 配置文件**
   ```bash
   ls -la | grep postcss
   # 確保只有一個 postcss.config.js 或 postcss.config.cjs
   ```

3. **檢查 Tailwind CSS 是否正確安裝**
   ```bash
   npm list tailwindcss
   # 應該顯示 3.4.18
   ```

4. **清理 Vite 快取**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

## ✨ 測試修復

修復後，應該能夠正常運行：
```bash
npm run dev
```

你應該看到：
```
  VITE v7.2.2  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

並且能夠訪問 http://localhost:5173/ 看到完整的應用。

## 📝 其他注意事項

- ✅ 這個問題不會影響生產構建 (`npm run build`)
- ✅ GitHub Actions 自動部署不受影響
- ✅ 所有功能依然正常運作

## 🆘 如果所有方法都失敗

請提供以下資訊以便進一步診斷：
```bash
# 1. Node 版本
node --version

# 2. npm 版本
npm --version

# 3. Tailwind CSS 版本
npm list tailwindcss

# 4. PostCSS 配置內容
cat postcss.config.js

# 5. 完整錯誤訊息
npm run dev 2>&1 | tee error.log
```

---

**最後更新**: 2025-11-17
**狀態**: PostCSS 配置已更新為 ESM 格式
