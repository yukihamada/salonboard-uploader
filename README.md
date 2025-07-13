# SalonBoard 自動画像アップロードツール

Playwrightを使用してSalonBoardへの画像アップロードを自動化するツールです。

## 機能

- 自動ログイン
- FRONT/SIDE/BACK 3枚の画像自動アップロード
- スタイル情報の自動入力
- エラー時のスクリーンショット保存
- 環境変数による設定管理

## セットアップ

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
`.env.local` ファイルは既に作成済みです（認証情報含む）

3. 画像の準備
```bash
mkdir images
# front.jpg, side.jpg, back.jpg を images/ に配置
```

## 使い方

### 基本実行
```bash
npm start
```

### デバッグモード（ブラウザ表示）
```bash
npm run debug
```

### 動作テスト（ログインのみ）
```bash
npm test
```

## プロジェクト構成

```
.
├── sb_upload.js      # メインスクリプト
├── test_upload.js    # テストスクリプト
├── .env.local        # 環境変数（Git管理外）
├── .gitignore        # Git除外設定
├── package.json      # プロジェクト設定
├── README.md         # このファイル
└── images/           # アップロード画像フォルダ
    ├── front.jpg
    ├── side.jpg
    └── back.jpg
```

## 注意事項

- `.env.local` ファイルはGitにコミットされません
- 本番環境での実行は慎重に行ってください
- エラー時のスクリーンショットは自動保存されます

## トラブルシューティング

### ログインできない場合
- 環境変数 `SB_ID`, `SB_PASS` を確認
- ネットワーク接続を確認

### 画像アップロードエラー
- 画像ファイルが存在するか確認
- ファイルサイズが適切か確認（推奨: 5MB以下）

### タイムアウトエラー
- `DEBUG=true` でブラウザ動作を確認
- ネットワーク速度を確認