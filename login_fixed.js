// login_fixed.js - 修正版ログインスクリプト
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
    
    console.log('1. ログインページへアクセス...');
    await page.goto('https://salonboard.com/login/');
    await page.waitForLoadState('networkidle');
    
    console.log('2. ログイン情報入力...');
    // IDフィールドを正確に特定
    await page.locator('input[type="text"][name="loginid"], input#loginid, input[placeholder*="ID"]').first().fill(process.env.SB_ID);
    
    // パスワードフィールドを正確に特定
    await page.locator('input[type="password"][name="password"], input#password').first().fill(process.env.SB_PASS);
    
    console.log('3. ログインボタンをクリック...');
    // 画像ボタンまたは通常のボタンを探す
    const loginButton = await page.locator('button.btn-primary, input[type="image"], input[type="submit"], button[type="submit"], .btn-lg').first();
    
    if (await loginButton.count() > 0) {
      await loginButton.click();
    } else {
      // フォームを直接送信
      console.log('   ボタンが見つからないのでフォームを送信...');
      await page.locator('form').first().evaluate(form => form.submit());
    }
    
    console.log('4. ページ遷移を待機...');
    try {
      await page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
      console.log('✅ ログイン成功！');
    } catch {
      console.log('⚠️  ページ遷移がタイムアウト');
    }
    
    await page.waitForTimeout(3000);
    
    console.log('5. 現在のURL:', page.url());
    console.log('6. ページタイトル:', await page.title());
    
    // エラーメッセージを確認
    const errorText = await page.locator('.error, .alert-danger, .alert-error, [class*="error"]').first().textContent().catch(() => null);
    if (errorText) {
      console.log('❌ エラーメッセージ:', errorText.trim());
    }
    
    // ログイン成功の判定
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      console.log('✅ ログインに成功しました！');
      
      // スタイル編集画面へ移動
      console.log('7. スタイル編集画面へ移動...');
      await page.goto('https://salonboard.com/CNB/draft/styleEdit/');
      await page.waitForLoadState('networkidle');
      
      console.log('8. スタイル編集画面のURL:', page.url());
      
      // スクリーンショット保存
      await page.screenshot({ path: 'style-edit-page.png' });
      console.log('📸 スタイル編集画面: style-edit-page.png');
    } else {
      console.log('❌ ログインに失敗しました');
      await page.screenshot({ path: 'login-failed.png' });
    }
    
    console.log('\n※ 10秒後に自動で閉じます...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await browser.close();
  }
})();