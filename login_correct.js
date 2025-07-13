// login_correct.js - 正しいログインフロー
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
    
    console.log('🌐 SalonBoardログイン開始...\n');
    
    console.log('1. ログインページへアクセス...');
    await page.goto('https://salonboard.com/login/');
    await page.waitForLoadState('networkidle');
    
    console.log('2. ID入力: ' + process.env.SB_ID);
    await page.fill('input[name="userId"]', process.env.SB_ID);
    
    console.log('3. パスワード入力: ****');
    await page.fill('input[name="password"]', process.env.SB_PASS);
    
    console.log('4. ログインボタンをクリック...');
    // 青い「ログイン」ボタン
    await page.click('a:has-text("ログイン"):visible');
    
    console.log('5. ページ遷移を待機...');
    try {
      await page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
      console.log('✅ ログイン成功！\n');
    } catch {
      // URLが変わらない場合も、内容が変わっている可能性があるので続行
      await page.waitForTimeout(3000);
    }
    
    const currentUrl = page.url();
    console.log('現在のURL:', currentUrl);
    
    if (!currentUrl.includes('/login') || currentUrl.includes('/CNB/')) {
      console.log('🎯 ログイン成功を確認');
      
      console.log('\n6. スタイル編集画面へ移動...');
      await page.goto('https://salonboard.com/CNB/draft/styleEdit/');
      await page.waitForLoadState('networkidle');
      
      console.log('7. スタイル編集画面を確認...');
      const finalUrl = page.url();
      console.log('最終URL:', finalUrl);
      
      if (finalUrl.includes('styleEdit')) {
        console.log('✅ スタイル編集画面への遷移成功！');
        
        // 画像アップロードエリアを探す
        console.log('\n8. 画像アップロードエリアを確認...');
        const uploadAreas = await page.$$('[class*="upload"], [class*="image"], .dropzone');
        console.log(`画像アップロードエリア: ${uploadAreas.length}個発見`);
        
        await page.screenshot({ path: 'style-edit-success.png', fullPage: true });
        console.log('📸 スクリーンショット保存: style-edit-success.png');
      }
    } else {
      console.log('❌ ログインに失敗した可能性があります');
      
      // エラーメッセージを探す
      const errorMsg = await page.$('[class*="error"], [class*="alert"]');
      if (errorMsg) {
        const text = await errorMsg.textContent();
        console.log('エラーメッセージ:', text);
      }
      
      await page.screenshot({ path: 'login-error.png' });
      console.log('📸 エラー画面: login-error.png');
    }
    
    console.log('\n※ 15秒後に自動で閉じます...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    
    try {
      const page = browser.pages()[0];
      if (page) {
        await page.screenshot({ path: 'error-screenshot.png' });
        console.log('📸 エラー時のスクリーンショット: error-screenshot.png');
      }
    } catch {}
  } finally {
    await browser.close();
    console.log('\n🔚 処理を終了しました');
  }
})();