// semi_auto_upload.js - 半自動アップロード（ログインまで自動化）
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  try {
    const page = await browser.newPage();
    
    console.log('🤖 SalonBoard半自動アップローダー\n');
    console.log('ログインとページ遷移を自動化し、画像アップロードは手動で行います。\n');
    
    // 1. ログイン
    console.log('1️⃣ 自動ログイン中...');
    await page.goto('https://salonboard.com/login/');
    await page.waitForTimeout(2000);
    
    await page.fill('input[name="userId"]', process.env.SB_ID);
    await page.fill('input[name="password"]', process.env.SB_PASS);
    await page.click('a:has-text("ログイン"):visible');
    await page.waitForTimeout(3000);
    console.log('✅ ログイン完了\n');
    
    // 2. スタイル編集画面へ
    console.log('2️⃣ スタイル編集画面へ移動...');
    await page.goto('https://salonboard.com/CNB/draft/styleEdit/');
    await page.waitForTimeout(3000);
    console.log('✅ スタイル編集画面を開きました\n');
    
    // 3. スタイル情報を事前入力
    console.log('3️⃣ スタイル情報を事前入力...');
    
    const timestamp = new Date().toLocaleString('ja-JP');
    
    try {
      // スタイル名
      const styleNameInput = await page.$('#styleName, input[name="styleName"]');
      if (styleNameInput) {
        await styleNameInput.fill(`テストスタイル_${timestamp}`);
        console.log('  ✓ スタイル名入力');
      }
      
      // スタイリストコメント
      const commentInput = await page.$('#comment, textarea[name="comment"]');
      if (commentInput) {
        await commentInput.fill('SalonBoard自動投稿テスト');
        console.log('  ✓ コメント入力');
      }
      
      // カテゴリ（レディース）
      const ladiesCheckbox = await page.$('input[type="checkbox"]#ladies, input[type="radio"]#ladies');
      if (ladiesCheckbox) {
        await ladiesCheckbox.check();
        console.log('  ✓ カテゴリ: レディース');
      }
    } catch (e) {
      console.log('  ⚠️ 一部の入力をスキップ');
    }
    
    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 手動操作ガイド');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n以下の手順で画像をアップロードしてください：\n');
    console.log('1. 画面中央の「画像をアップロードする」と書かれた青い枠をクリック');
    console.log('   - FRONT: 左側の枠');
    console.log('   - SIDE: 中央の枠');
    console.log('   - BACK: 右側の枠\n');
    console.log('2. ファイル選択ダイアログで画像を選択');
    console.log('   - images/front.jpg');
    console.log('   - images/side.jpg');
    console.log('   - images/back.jpg\n');
    console.log('3. 「通信に失敗しました」エラーが出た場合:');
    console.log('   - エラーダイアログを閉じる');
    console.log('   - 少し待ってから再度クリック');
    console.log('   - それでもダメな場合は、ページをリロード（F5）\n');
    console.log('4. すべての画像をアップロード後、ページ下部の「登録」ボタンをクリック\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // ページを少し下にスクロールして画像エリアを表示
    await page.evaluate(() => window.scrollBy(0, 500));
    
    console.log('✨ ブラウザを開いたままにしています。');
    console.log('✨ 手動で画像をアップロードしてください。');
    console.log('✨ 完了したらCtrl+Cで終了してください。\n');
    
    // 定期的に状態を確認
    setInterval(async () => {
      try {
        // アップロードされた画像数を確認
        const uploadedCount = await page.$$eval('img', imgs => {
          return imgs.filter(img => {
            const src = img.src || '';
            return !src.includes('style_image_upload.png') && 
                   !src.includes('no_photo') &&
                   (src.includes('temp') || src.includes('uploaded') || src.includes('styleImage'));
          }).length;
        });
        
        if (uploadedCount > 0) {
          console.log(`\n📊 現在のアップロード状況: ${uploadedCount}枚完了`);
        }
      } catch {
        // エラーは無視
      }
    }, 10000); // 10秒ごとにチェック
    
    // 無限待機
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
  }
})();