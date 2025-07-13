# SalonBoard 自動画像アップロードツール

Playwrightを使用してSalonBoardへの画像アップロードを自動化するツールです。

## 📋 目次

1. [機能](#機能)
2. [必要な環境](#必要な環境)
3. [セットアップ](#セットアップ)
4. [使い方](#使い方)
5. [トラブルシューティング](#トラブルシューティング)
6. [プロジェクト構成](#プロジェクト構成)
7. [注意事項](#注意事項)
8. [開発者向け情報](#開発者向け情報)

## 機能

- 🔐 自動ログイン
- 📸 FRONT/SIDE/BACK 3枚の画像自動アップロード
- 📝 スタイル情報の自動入力
- 🖼️ エラー時のスクリーンショット保存
- 🔧 環境変数による設定管理
- 🐛 デバッグモード（ブラウザ表示）

## 必要な環境

- Node.js 18.0.0以上
- npm または yarn
- SalonBoardのアカウント情報（ID/パスワード）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/yukihamada/salonboard-uploader.git
cd salonboard-uploader
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Playwrightブラウザのインストール

```bash
npx playwright install chromium
```

### 4. 環境変数の設定

`.env.local` ファイルを作成し、認証情報を設定：

```bash
# .env.local
SB_ID=your_salon_board_id
SB_PASS=your_password

# 画像パス（オプション）
IMG_FRONT=./images/front.jpg
IMG_SIDE=./images/side.jpg
IMG_BACK=./images/back.jpg

# デバッグモード
DEBUG=false
```

### 5. 画像の準備

```bash
# 画像フォルダにアップロードする画像を配置
cp /path/to/your/front.jpg ./images/
cp /path/to/your/side.jpg ./images/
cp /path/to/your/back.jpg ./images/
```

または、サンプル画像を自動生成：

```bash
node create_real_images.js
```

## 使い方

### 基本的な使い方

#### 1. テスト実行（ログインのみ）

まずログインが正常に動作するか確認：

```bash
npm test
```

#### 2. 本番実行（画像アップロード）

```bash
npm start
```

#### 3. デバッグモード（ブラウザ表示）

動作を目視で確認したい場合：

```bash
npm run debug
# または
DEBUG=true npm start
```

### 高度な使い方

#### シンプル版スクリプトの実行

より安定した動作が必要な場合：

```bash
node sb_upload_simple.js
```

#### 画像付きアップロード実行

```bash
node upload_with_images.js
```

## トラブルシューティング

### 🔴 認証エラー「認証エラーです。ログインしなおしてください。」

**原因と対処法：**

1. **セッションタイムアウト**
   - SalonBoardは一定時間でセッションが切れます
   - 解決策：スクリプトを再実行

2. **多重ログイン制限**
   - 同一アカウントで複数箇所からログインしている
   - 解決策：他のブラウザ/デバイスでログアウト

3. **アカウントロック**
   - 短時間に複数回ログインを試みた
   - 解決策：5-10分待ってから再実行

4. **認証情報の誤り**
   ```bash
   # .env.localを確認
   cat .env.local
   
   # 手動でログインテスト
   DEBUG=true npm test
   ```

### 🔴 タイムアウトエラー

**対処法：**

1. タイムアウト時間を延長
   ```javascript
   // sb_upload.js の CONFIG を編集
   TIMEOUT: {
     DEFAULT: 60000,  // 60秒に延長
     UPLOAD: 120000   // 120秒に延長
   }
   ```

2. ネットワーク接続を確認
   ```bash
   ping salonboard.com
   ```

3. より安定したネットワーク環境で実行

### 🔴 要素が見つからないエラー

**対処法：**

1. デバッグモードで実際の画面を確認
   ```bash
   DEBUG=true npm start
   ```

2. スクリーンショットを確認
   ```bash
   ls -la *.png
   open error-*.png  # macOS
   ```

3. セレクタを調整（開発者ツールで確認）

### 🔴 画像アップロードが失敗する

**対処法：**

1. 画像ファイルを確認
   ```bash
   ls -la images/
   file images/*.jpg
   ```

2. 画像サイズを確認（推奨: 5MB以下）
   ```bash
   du -h images/*.jpg
   ```

3. 画像形式を確認（JPEG推奨）

## プロジェクト構成

```
salonboard-uploader/
├── sb_upload.js           # メインスクリプト（完全版）
├── sb_upload_simple.js    # シンプル版（安定動作優先）
├── upload_with_images.js  # 画像アップロード特化版
├── test_upload.js         # テストスクリプト
├── create_real_images.js  # サンプル画像生成
├── .env.local            # 環境変数（Git管理外）
├── .gitignore            # Git除外設定
├── package.json          # プロジェクト設定
├── README.md             # このファイル
└── images/               # アップロード画像フォルダ
    ├── front.jpg         # 正面画像
    ├── side.jpg          # 横画像
    └── back.jpg          # 後ろ画像
```

## 注意事項

### セキュリティ

- ⚠️ `.env.local` ファイルは絶対にGitにコミットしない
- ⚠️ 認証情報は安全に管理する
- ⚠️ 公開リポジトリにパスワードを含めない

### 使用上の注意

- 🚫 短時間に大量のリクエストを送らない（アカウントロックの可能性）
- 🚫 営業時間外の深夜早朝の使用は避ける
- ✅ テスト環境で十分に動作確認してから本番利用
- ✅ エラー時はスクリーンショットを確認

### 本番環境での使用

1. 必ず事前にテスト環境で確認
2. 画像は適切なサイズ・形式で準備
3. ネットワークが安定した環境で実行
4. エラー時の対処方法を理解してから使用

## 開発者向け情報

### カスタマイズ方法

#### 1. セレクタの変更

SalonBoardのUIが変更された場合、セレクタを更新：

```javascript
// sb_upload.js
// ログインボタンのセレクタを変更
const buttons = await this.page.$$('新しいセレクタ');
```

#### 2. 追加フィールドの入力

```javascript
// スタイル情報に新しいフィールドを追加
await uploader.fillStyleInfo({
  styleName: 'スタイル名',
  category: 'カテゴリ',
  description: '説明',
  tags: ['タグ1', 'タグ2'],
  // 新しいフィールドを追加
  price: '5000円'
});
```

#### 3. 待機時間の調整

```javascript
// 環境に応じて調整
await page.waitForTimeout(5000); // 5秒待機
```

### デバッグ方法

1. **コンソールログの追加**
   ```javascript
   console.log('現在のURL:', page.url());
   console.log('ページタイトル:', await page.title());
   ```

2. **要素の存在確認**
   ```javascript
   const element = await page.$('セレクタ');
   if (element) {
     console.log('要素が見つかりました');
   }
   ```

3. **ネットワークログの監視**
   ```javascript
   page.on('response', response => {
     console.log('Response:', response.url(), response.status());
   });
   ```

### 貢献方法

1. Issueで問題を報告
2. Pull Requestで改善を提案
3. ドキュメントの改善

## ライセンス

MIT License

## サポート

問題が発生した場合：

1. このREADMEのトラブルシューティングを確認
2. [Issues](https://github.com/yukihamada/salonboard-uploader/issues)で既知の問題を検索
3. 新しいIssueを作成（エラーメッセージとスクリーンショットを含める）

---

Made with ❤️ by [yukihamada](https://github.com/yukihamada)