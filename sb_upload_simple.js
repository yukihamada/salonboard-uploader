// sb_upload_simple.js - シンプル版
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

(async () => {
  const browser = await chromium.launch({
    headless: false, // ブラウザを表示
    slowMo: 100 // 動作を遅くして確認しやすく
  });

  try {
    const page = await browser.newPage();
    
    console.log('1. SalonBoardへアクセス...');
    await page.goto('https://salonboard.com/login/');
    
    console.log('2. ログイン情報入力...');
    await page.fill('input[type="text"]', process.env.SB_ID);
    await page.fill('input[type="password"]', process.env.SB_PASS);
    
    console.log('3. ログインボタンクリック...');
    // ボタンを直接探す
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && text.includes('ログイン')) {
        await button.click();
        break;
      }
    }
    
    console.log('4. ログイン完了待機...');
    await page.waitForTimeout(3000);
    
    console.log('5. スタイル編集画面へ移動...');
    await page.goto('https://salonboard.com/CNB/draft/styleEdit/');
    
    console.log('✅ 正常にアクセスできました！');
    
    // 10秒待機して画面確認
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await browser.close();
  }
})();