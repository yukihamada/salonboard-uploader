// upload_with_images.js - 画像アップロード実装版
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config({ path: '.env.local' });

(async () => {
  const browser = await chromium.launch({
    headless: false, // ブラウザを表示
    slowMo: 500 // 動作を遅くして確認
  });

  try {
    const page = await browser.newPage();
    
    console.log('1. SalonBoardへアクセス...');
    await page.goto('https://salonboard.com/login/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    
    console.log('2. ログイン情報入力...');
    await page.fill('input[type="text"]', process.env.SB_ID);
    await page.fill('input[type="password"]', process.env.SB_PASS);
    
    console.log('3. ログインボタンクリック...');
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && text.includes('ログイン')) {
        await button.click();
        break;
      }
    }
    
    console.log('4. ログイン完了待機...');
    await page.waitForTimeout(5000);
    
    console.log('5. スタイル編集画面へ移動...');
    await page.goto('https://salonboard.com/CNB/draft/styleEdit/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    
    console.log('6. 画像アップロード開始...');
    
    // FRONT画像
    try {
      console.log('  - FRONT画像を探しています...');
      const uploadAreas = await page.$$('.image-upload-area, .upload-box, div[class*="upload"]');
      
      if (uploadAreas.length >= 1) {
        console.log('  - FRONT画像エリアをクリック...');
        await uploadAreas[0].click();
        await page.waitForTimeout(1000);
        
        const fileInput = await page.waitForSelector('input[type="file"]', { 
          state: 'attached',
          timeout: 5000 
        });
        
        console.log('  - FRONT画像をセット...');
        await fileInput.setInputFiles('./images/front.jpg');
        await page.waitForTimeout(3000);
        console.log('  ✅ FRONT画像アップロード完了');
      }
    } catch (error) {
      console.log('  ⚠️  FRONT画像アップロードをスキップ:', error.message);
    }
    
    // スタイル情報入力
    console.log('7. スタイル情報入力...');
    const styleName = `テストスタイル_${new Date().toLocaleString('ja-JP')}`;
    
    try {
      await page.fill('input[name="styleName"], input[placeholder*="スタイル名"]', styleName);
      console.log('  ✅ スタイル名入力完了');
    } catch (error) {
      console.log('  ⚠️  スタイル名入力をスキップ');
    }
    
    try {
      await page.fill('textarea[name="description"], textarea[placeholder*="説明"]', 
        'Playwrightで自動投稿したテストスタイルです。');
      console.log('  ✅ 説明文入力完了');
    } catch (error) {
      console.log('  ⚠️  説明文入力をスキップ');
    }
    
    console.log('\n✅ 処理完了！');
    console.log('スタイル名:', styleName);
    console.log('\n※ ブラウザは10秒後に自動で閉じます');
    
    // 確認のため10秒待機
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    
    // スクリーンショット保存
    try {
      const screenshot = `error-${Date.now()}.png`;
      await page.screenshot({ path: screenshot });
      console.log(`📸 エラー画面: ${screenshot}`);
    } catch {}
  } finally {
    await browser.close();
  }
})();