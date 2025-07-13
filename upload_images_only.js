// upload_images_only.js - ログイン済みの状態から画像アップロード
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  try {
    const page = await browser.newPage();
    
    console.log('🌐 SalonBoard画像アップロード\n');
    
    // 1. ログイン
    console.log('1️⃣ ログイン...');
    await page.goto('https://salonboard.com/login/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    
    await page.fill('input[name="userId"]', process.env.SB_ID);
    await page.fill('input[name="password"]', process.env.SB_PASS);
    await page.click('a:has-text("ログイン"):visible');
    
    await page.waitForTimeout(3000);
    
    // 2. スタイル編集画面へ
    console.log('2️⃣ スタイル編集画面へ移動...');
    await page.goto('https://salonboard.com/CNB/draft/styleEdit/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    
    // 現在の画面をキャプチャ
    await page.screenshot({ path: 'before-upload.png' });
    console.log('📸 アップロード前の画面: before-upload.png\n');
    
    // 3. 画像アップロード
    console.log('3️⃣ 画像アップロード開始...\n');
    
    // すべての「画像をアップロードする」ボタンを取得
    const uploadButtons = await page.locator('a:has-text("画像をアップロードする"), button:has-text("画像をアップロードする")').all();
    console.log(`見つかったアップロードボタン: ${uploadButtons.length}個\n`);
    
    // FRONT画像（1つ目のボタン）
    if (uploadButtons.length >= 1) {
      console.log('📸 FRONT画像...');
      await uploadButtons[0].click();
      await page.waitForTimeout(1000);
      
      try {
        // モーダルかポップアップ内のfile inputを待つ
        const fileInput = await page.waitForSelector('input[type="file"]:visible', {
          timeout: 5000
        });
        
        await fileInput.setInputFiles('./images/front.jpg');
        console.log('  ✓ ファイル選択完了');
        
        // アップロード処理を待つ
        await page.waitForTimeout(5000);
        
        // モーダルを閉じる（もしあれば）
        const closeButton = await page.$('button:has-text("閉じる"), button:has-text("×"), .close');
        if (closeButton) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
        
        console.log('  ✅ FRONT画像アップロード完了\n');
      } catch (error) {
        console.log('  ❌ エラー:', error.message, '\n');
      }
    }
    
    // SIDE画像（2つ目のボタン）
    if (uploadButtons.length >= 2) {
      console.log('📸 SIDE画像...');
      await uploadButtons[1].click();
      await page.waitForTimeout(1000);
      
      try {
        const fileInput = await page.waitForSelector('input[type="file"]:visible', {
          timeout: 5000
        });
        
        await fileInput.setInputFiles('./images/side.jpg');
        console.log('  ✓ ファイル選択完了');
        
        await page.waitForTimeout(5000);
        
        const closeButton = await page.$('button:has-text("閉じる"), button:has-text("×"), .close');
        if (closeButton) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
        
        console.log('  ✅ SIDE画像アップロード完了\n');
      } catch (error) {
        console.log('  ❌ エラー:', error.message, '\n');
      }
    }
    
    // BACK画像（3つ目のボタン）
    if (uploadButtons.length >= 3) {
      console.log('📸 BACK画像...');
      await uploadButtons[2].click();
      await page.waitForTimeout(1000);
      
      try {
        const fileInput = await page.waitForSelector('input[type="file"]:visible', {
          timeout: 5000
        });
        
        await fileInput.setInputFiles('./images/back.jpg');
        console.log('  ✓ ファイル選択完了');
        
        await page.waitForTimeout(5000);
        
        const closeButton = await page.$('button:has-text("閉じる"), button:has-text("×"), .close');
        if (closeButton) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
        
        console.log('  ✅ BACK画像アップロード完了\n');
      } catch (error) {
        console.log('  ❌ エラー:', error.message, '\n');
      }
    }
    
    // 4. 結果を確認
    console.log('4️⃣ アップロード結果を確認...\n');
    
    // アップロード後の画面をキャプチャ
    await page.screenshot({ path: 'after-upload.png', fullPage: true });
    console.log('📸 アップロード後の画面: after-upload.png');
    
    // アップロードされた画像のプレビューを確認
    const previews = await page.$$('img[src*="blob"], img[src*="temp"], .preview-image, [class*="preview"]');
    console.log(`画像プレビュー: ${previews.length}個発見`);
    
    // 画像IDが設定されているか確認
    const imageIds = await page.$$('input[name*="imageId"], input[name*="imgId"]');
    console.log(`画像ID入力欄: ${imageIds.length}個発見`);
    
    for (let i = 0; i < imageIds.length; i++) {
      const value = await imageIds[i].getAttribute('value');
      if (value) {
        console.log(`  画像ID[${i}]: ${value}`);
      }
    }
    
    console.log('\n🎉 画像アップロード処理完了！');
    console.log('※ 30秒後に自動で閉じます...');
    
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🔚 終了');
  }
})();