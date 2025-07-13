// upload_by_click.js - 画像エリアを直接クリック
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    const page = await browser.newPage();
    
    console.log('🌐 SalonBoard画像アップロード（エリアクリック版）\n');
    
    // 1. ログイン
    console.log('1️⃣ ログイン...');
    await page.goto('https://salonboard.com/login/');
    await page.waitForTimeout(2000);
    
    await page.fill('input[name="userId"]', process.env.SB_ID);
    await page.fill('input[name="password"]', process.env.SB_PASS);
    await page.click('a:has-text("ログイン"):visible');
    await page.waitForTimeout(3000);
    
    // 2. スタイル編集画面へ
    console.log('2️⃣ スタイル編集画面へ移動...');
    await page.goto('https://salonboard.com/CNB/draft/styleEdit/');
    await page.waitForTimeout(3000);
    
    console.log('3️⃣ 画像アップロードエリアをクリック...\n');
    
    // 画像アップロードエリア（青い枠の部分）を直接クリック
    try {
      console.log('📸 FRONT画像エリア...');
      
      // 青い枠の画像アップロードエリアを探す
      const uploadAreas = await page.$$('.image-upload-area, [class*="upload"], .upload-box, .dropzone');
      console.log(`アップロードエリア発見: ${uploadAreas.length}個`);
      
      if (uploadAreas.length >= 1) {
        // 最初のエリアをクリック
        await uploadAreas[0].click();
        console.log('  ✓ エリアクリック');
        await page.waitForTimeout(2000);
        
        // ファイル入力を探す
        let fileInput = await page.$('input[type="file"]:visible');
        
        if (!fileInput) {
          // 隠れているfile inputを探す
          fileInput = await page.$('input[type="file"]');
        }
        
        if (fileInput) {
          await fileInput.setInputFiles('./images/front.jpg');
          console.log('  ✓ FRONT画像選択');
          await page.waitForTimeout(5000);
        }
      }
    } catch (error) {
      console.log('  ❌ エラー:', error.message);
    }
    
    // 座標でクリックする方法も試す
    console.log('\n📍 座標クリックでも試す...');
    
    // FRONT画像の位置（スクリーンショットから推定）
    await page.mouse.click(137, 710);
    await page.waitForTimeout(2000);
    
    // file inputを再度探す
    const fileInputs = await page.$$('input[type="file"]');
    console.log(`File input発見: ${fileInputs.length}個`);
    
    if (fileInputs.length > 0) {
      try {
        await fileInputs[0].setInputFiles('./images/front.jpg');
        console.log('✅ FRONT画像アップロード成功！');
        await page.waitForTimeout(5000);
      } catch (error) {
        console.log('❌ ファイル設定エラー:', error.message);
      }
    }
    
    // 結果確認
    console.log('\n4️⃣ 結果確認...');
    await page.screenshot({ path: 'click-result.png', fullPage: true });
    console.log('📸 結果: click-result.png');
    
    // アップロードされた画像を確認
    const images = await page.$$('img');
    let uploadedCount = 0;
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src && (src.includes('blob:') || src.includes('temp') || src.includes('upload'))) {
        uploadedCount++;
        console.log(`  ✓ アップロード画像発見: ${src.substring(0, 50)}...`);
      }
    }
    
    console.log(`\nアップロードされた画像: ${uploadedCount}枚`);
    console.log('\n※ 30秒後に自動で閉じます...');
    
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
  } finally {
    await browser.close();
  }
})();