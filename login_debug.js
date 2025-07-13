// login_debug.js - ログインプロセスをデバッグ
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // 動作を見やすくする
  });

  try {
    const page = await browser.newPage();
    
    // ネットワークレスポンスを監視
    page.on('response', response => {
      if (response.url().includes('login') || response.url().includes('auth')) {
        console.log(`📡 Response: ${response.url()} - ${response.status()}`);
      }
    });
    
    console.log('1. ログインページへアクセス...');
    await page.goto('https://salonboard.com/login/');
    await page.waitForTimeout(2000);
    
    console.log('2. 現在のURL:', page.url());
    
    console.log('3. ID入力...');
    await page.fill('input[type="text"]', process.env.SB_ID);
    
    console.log('4. パスワード入力...');
    await page.fill('input[type="password"]', process.env.SB_PASS);
    
    console.log('5. ログインボタンを探す...');
    const buttons = await page.$$('button');
    console.log(`   見つかったボタン数: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`   ボタン${i}: "${text}"`);
      if (text && text.includes('ログイン')) {
        console.log('6. ログインボタンをクリック！');
        await buttons[i].click();
        break;
      }
    }
    
    console.log('7. ページ遷移を待機...');
    await page.waitForTimeout(5000);
    
    console.log('8. ログイン後のURL:', page.url());
    console.log('9. ページタイトル:', await page.title());
    
    // エラーメッセージを確認
    const errorMessages = await page.$$('.error, .alert, [class*="error"], [class*="alert"]');
    if (errorMessages.length > 0) {
      console.log('⚠️  エラーメッセージが見つかりました:');
      for (const msg of errorMessages) {
        const text = await msg.textContent();
        console.log(`   - ${text}`);
      }
    }
    
    // ログイン成功の判定
    const currentUrl = page.url();
    if (currentUrl.includes('/login/')) {
      console.log('❌ まだログインページにいます');
      
      // スクリーンショット保存
      await page.screenshot({ path: 'login-failed.png' });
      console.log('📸 スクリーンショット: login-failed.png');
    } else {
      console.log('✅ ログインに成功しました！');
      console.log('10. マイページへ移動を試みます...');
      
      // リンクを探してクリック
      const myPageLink = await page.$('a[href*="mypage"], a[href*="CNB"], a:has-text("マイページ")');
      if (myPageLink) {
        await myPageLink.click();
        await page.waitForTimeout(3000);
        console.log('マイページURL:', page.url());
      }
    }
    
    // 10秒待機
    console.log('\n※ 10秒後に自動で閉じます...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();