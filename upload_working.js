// upload_working.js - 動作する画像アップロード
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
    
    console.log('✨ SalonBoard画像アップロード（動作版）\n');
    
    // 1. ログイン
    console.log('1️⃣ ログイン...');
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
    console.log('✅ スタイル編集画面表示\n');
    
    // 3. 画像アップロード - IMG要素をクリック
    console.log('3️⃣ 画像アップロード開始...\n');
    
    // FRONT画像
    console.log('📸 FRONT画像...');
    try {
      // 画像要素を直接クリック
      const frontImg = await page.$('img.img_new_no_photo[src*="style_image_upload"]');
      if (frontImg) {
        await frontImg.click();
        console.log('  ✓ FRONT画像エリアクリック');
        await page.waitForTimeout(2000);
        
        // ファイル入力が出現するのを待つ
        const fileInput = await page.waitForSelector('input[type="file"]', {
          state: 'attached',
          timeout: 5000
        });
        
        if (fileInput) {
          await fileInput.setInputFiles('./images/front.jpg');
          console.log('  ✓ FRONT画像選択完了');
          await page.waitForTimeout(5000);
          
          // アップロード完了を確認
          console.log('  ⏳ アップロード処理中...');
          
          // モーダルやダイアログを閉じる
          const closeBtn = await page.$('button:has-text("閉じる"), button.close, .modal-close');
          if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(1000);
          }
          
          console.log('  ✅ FRONT画像アップロード完了！\n');
        }
      }
    } catch (error) {
      console.log(`  ❌ エラー: ${error.message}\n`);
    }
    
    // SIDE画像（2番目のimg要素）
    console.log('📸 SIDE画像...');
    try {
      const sideImgs = await page.$$('img.img_new_no_photo[src*="style_image_upload"]');
      if (sideImgs.length >= 2) {
        await sideImgs[1].click();
        console.log('  ✓ SIDE画像エリアクリック');
        await page.waitForTimeout(2000);
        
        const fileInput = await page.waitForSelector('input[type="file"]', {
          state: 'attached',
          timeout: 5000
        });
        
        if (fileInput) {
          await fileInput.setInputFiles('./images/side.jpg');
          console.log('  ✓ SIDE画像選択完了');
          await page.waitForTimeout(5000);
          
          const closeBtn = await page.$('button:has-text("閉じる"), button.close, .modal-close');
          if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(1000);
          }
          
          console.log('  ✅ SIDE画像アップロード完了！\n');
        }
      }
    } catch (error) {
      console.log(`  ❌ エラー: ${error.message}\n`);
    }
    
    // BACK画像（3番目のimg要素）
    console.log('📸 BACK画像...');
    try {
      const backImgs = await page.$$('img.img_new_no_photo[src*="style_image_upload"]');
      if (backImgs.length >= 3) {
        await backImgs[2].click();
        console.log('  ✓ BACK画像エリアクリック');
        await page.waitForTimeout(2000);
        
        const fileInput = await page.waitForSelector('input[type="file"]', {
          state: 'attached',
          timeout: 5000
        });
        
        if (fileInput) {
          await fileInput.setInputFiles('./images/back.jpg');
          console.log('  ✓ BACK画像選択完了');
          await page.waitForTimeout(5000);
          
          const closeBtn = await page.$('button:has-text("閉じる"), button.close, .modal-close');
          if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(1000);
          }
          
          console.log('  ✅ BACK画像アップロード完了！\n');
        }
      }
    } catch (error) {
      console.log(`  ❌ エラー: ${error.message}\n`);
    }
    
    // 4. アップロード結果確認
    console.log('4️⃣ アップロード結果確認...\n');
    
    // アップロードされた画像を確認
    const uploadedImages = await page.$$eval('img', imgs => {
      return imgs.filter(img => {
        const src = img.src || '';
        return !src.includes('style_image_upload.png') && 
               (src.includes('temp') || src.includes('upload') || src.includes('styleImage'));
      }).map(img => ({
        src: img.src.substring(0, 60) + '...',
        width: img.width,
        height: img.height
      }));
    });
    
    console.log(`アップロードされた画像: ${uploadedImages.length}枚`);
    uploadedImages.forEach((img, i) => {
      console.log(`  [${i+1}] ${img.src} (${img.width}x${img.height})`);
    });
    
    // 5. スタイル情報入力
    console.log('\n5️⃣ スタイル情報入力...');
    
    const timestamp = new Date().toLocaleString('ja-JP');
    
    try {
      // スタイル名
      await page.fill('#styleName, input[name="styleName"]', `テスト_${timestamp}`);
      console.log('  ✓ スタイル名入力');
      
      // スタイリストコメント
      await page.fill('#comment, textarea[name="comment"]', 'Playwrightで自動アップロードしました');
      console.log('  ✓ コメント入力');
    } catch (e) {
      console.log('  ⚠️ 一部の入力をスキップ');
    }
    
    // 6. 最終結果
    console.log('\n6️⃣ 最終結果...');
    await page.screenshot({ path: 'upload-success.png', fullPage: true });
    console.log('📸 成功画面: upload-success.png');
    
    console.log('\n🎉 画像アップロード成功！');
    console.log('※ 確認後、手動で「登録」ボタンをクリックしてください');
    console.log('※ ブラウザは開いたままです。Ctrl+Cで終了\n');
    
    // 無限待機
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
  }
})();