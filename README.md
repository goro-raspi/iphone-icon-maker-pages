# iPhone Icon Maker (GitHub Pages)

iPhoneアプリアイコン用の **1024x1024 PNG** をブラウザだけで作るツールです。

## 機能
- PNG / JPEG / WebP 入力
- 中央トリミングで正方形化
- 1024x1024 PNG へ変換
- 512x512 / 180x180 もワンクリック保存
- 透過画像用の背景色指定（デフォルト白）
- 完全クライアントサイド処理（画像アップロードなし）

## ローカル実行
```bash
npm install
npm run dev
```

## ビルド
```bash
npm run build
```

## GitHub Pages デプロイ
- main ブランチへ push すると Actions で `dist/` を Pages 配信
- Workflow: `.github/workflows/deploy-pages.yml`
- Vite `base` は `/iphone-icon-maker-pages/` に設定済み

公開URL（想定）
[`iPhoneアイコン作成アプリ`](https://goro-raspi.github.io/iphone-icon-maker-pages/)
