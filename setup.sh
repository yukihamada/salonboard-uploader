#!/bin/bash
# SalonBoard Uploader 自動セットアップスクリプト

echo "🚀 SalonBoard Uploader セットアップを開始します..."

# Node.jsチェック
if ! command -v node &> /dev/null; then
    echo "❌ Node.jsがインストールされていません"
    echo "👉 https://nodejs.org/ からインストールしてください"
    exit 1
fi

# リポジトリクローン
echo "📦 リポジトリをクローン中..."
git clone https://github.com/yukihamada/salonboard-uploader.git
cd salonboard-uploader

# 依存関係インストール
echo "📚 依存関係をインストール中..."
npm install

# Playwrightセットアップ
echo "🎭 Playwrightブラウザをインストール中..."
npx playwright install chromium

# 環境変数ファイル作成
echo "🔧 環境変数ファイルを作成中..."
cat > .env.local << EOF
# SalonBoard認証情報
SB_ID=your_id_here
SB_PASS=your_password_here

# 画像パス（オプション）
IMG_FRONT=./images/front.jpg
IMG_SIDE=./images/side.jpg
IMG_BACK=./images/back.jpg

# デバッグモード
DEBUG=false
EOF

# サンプル画像生成
echo "🎨 サンプル画像を生成中..."
node create_real_images.js

echo "✅ セットアップ完了！"
echo ""
echo "📝 次のステップ:"
echo "1. .env.local を編集して認証情報を設定"
echo "   nano .env.local"
echo ""
echo "2. 実行"
echo "   npm start"
echo ""
echo "詳細は README.md を参照してください"