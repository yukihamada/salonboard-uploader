// test_upload.js ── 簡易テストスクリプト
import { SalonBoardUploader } from './sb_upload.js';

async function quickTest() {
  const uploader = new SalonBoardUploader();
  
  console.log('🧪 SalonBoardアップローダー動作テスト開始...\n');
  
  try {
    // 1. 初期化テスト
    console.log('1️⃣ ブラウザ初期化...');
    await uploader.init();
    console.log('✅ ブラウザ起動成功\n');
    
    // 2. ログインテスト
    console.log('2️⃣ ログインテスト...');
    await uploader.login();
    console.log('✅ ログイン成功\n');
    
    // 3. ページ遷移テスト
    console.log('3️⃣ スタイル編集画面遷移...');
    await uploader.navigateToStyleEdit();
    console.log('✅ ページ遷移成功\n');
    
    console.log('🎉 基本動作テスト完了！');
    console.log('画像アップロードは本番実行で確認してください。');
    
  } catch (error) {
    console.error('❌ テスト失敗:', error.message);
    
    if (uploader.page) {
      const screenshotPath = `test-error-${Date.now()}.png`;
      await uploader.page.screenshot({ path: screenshotPath });
      console.log(`📸 エラースクリーンショット: ${screenshotPath}`);
    }
  } finally {
    await uploader.close();
  }
}

quickTest();