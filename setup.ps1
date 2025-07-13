# SalonBoard Uploader 自動セットアップスクリプト（Windows）

Write-Host "🚀 SalonBoard Uploader セットアップを開始します..." -ForegroundColor Green

# Node.jsチェック
try {
    node --version | Out-Null
} catch {
    Write-Host "❌ Node.jsがインストールされていません" -ForegroundColor Red
    Write-Host "👉 https://nodejs.org/ からインストールしてください" -ForegroundColor Yellow
    exit 1
}

# Git チェック
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ Gitがインストールされていません" -ForegroundColor Red
    Write-Host "👉 https://git-scm.com/ からインストールしてください" -ForegroundColor Yellow
    exit 1
}

# リポジトリクローン
Write-Host "📦 リポジトリをクローン中..." -ForegroundColor Yellow
git clone https://github.com/yukihamada/salonboard-uploader.git
Set-Location salonboard-uploader

# 依存関係インストール
Write-Host "📚 依存関係をインストール中..." -ForegroundColor Yellow
npm install

# Playwrightセットアップ
Write-Host "🎭 Playwrightブラウザをインストール中..." -ForegroundColor Yellow
npx playwright install chromium

# 環境変数ファイル作成
Write-Host "🔧 環境変数ファイルを作成中..." -ForegroundColor Yellow
@"
# SalonBoard認証情報
SB_ID=your_id_here
SB_PASS=your_password_here

# 画像パス（オプション）
IMG_FRONT=./images/front.jpg
IMG_SIDE=./images/side.jpg
IMG_BACK=./images/back.jpg

# デバッグモード
DEBUG=false
"@ | Out-File -FilePath .env.local -Encoding UTF8

# サンプル画像生成
Write-Host "🎨 サンプル画像を生成中..." -ForegroundColor Yellow
node create_real_images.js

Write-Host "✅ セットアップ完了！" -ForegroundColor Green
Write-Host ""
Write-Host "📝 次のステップ:" -ForegroundColor Cyan
Write-Host "1. .env.local を編集して認証情報を設定" -ForegroundColor White
Write-Host "   notepad .env.local" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 実行" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "詳細は README.md を参照してください" -ForegroundColor White