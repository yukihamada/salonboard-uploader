// login_final.js - 画像リンクも含めて探す
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
    await page.waitForTimeout(3000);
    
    console.log('2. ログイン情報入力...');
    // name属性で直接指定
    await page.fill('input[name="userId"]', process.env.SB_ID);
    await page.fill('input[name="password"]', process.env.SB_PASS);
    
    console.log('3. ログインボタンを探す...');
    
    // いろいろな方法でログインボタンを探す
    const selectors = [
      'a[href*="javascript"]',  // JavaScriptリンク
      'a[onclick]',             // onclickイベントがあるリンク
      'img[alt*="ログイン"]',   // ログイン画像
      'a img[src*="login"]',    // login画像を含むリンク
      '[class*="btn"][class*="login"]',
      '[id*="login"]',
      'form a',                 // フォーム内のリンク
    ];
    
    let clicked = false;
    for (const selector of selectors) {
      const elements = await page.$$(selector);
      console.log(`   ${selector}: ${elements.length}個`);
      
      if (elements.length > 0) {
        // 親要素がリンクの場合はそれをクリック
        const parent = await elements[0].$('xpath=..');
        if (parent && await parent.evaluate(el => el.tagName) === 'A') {
          console.log('   → 親リンクをクリック');
          await parent.click();
          clicked = true;
          break;
        } else {
          console.log('   → 要素をクリック');
          await elements[0].click();
          clicked = true;
          break;
        }
      }
    }
    
    if (!clicked) {
      console.log('4. フォームを直接送信...');
      // フォームを探して送信
      await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        if (forms.length > 0) {
          forms[0].submit();
        }
      });
    }
    
    console.log('5. ページ遷移を待機...');
    await page.waitForTimeout(5000);
    
    console.log('6. ログイン結果:');
    console.log('   URL:', page.url());
    console.log('   タイトル:', await page.title());
    
    // エラーメッセージを確認
    const errorElement = await page.$('.error-message, .alert, [class*="error"]');
    if (errorElement) {
      const errorText = await errorElement.textContent();
      console.log('   ❌ エラー:', errorText.trim());
    }
    
    if (!page.url().includes('/login')) {
      console.log('✅ ログイン成功！');
      
      console.log('7. スタイル編集ページへ移動...');
      await page.goto('https://salonboard.com/CNB/draft/styleEdit/');
      await page.waitForTimeout(3000);
      
      console.log('   最終URL:', page.url());
      await page.screenshot({ path: 'style-edit-success.png' });
      console.log('📸 スタイル編集画面: style-edit-success.png');
    } else {
      console.log('❌ ログインページのまま');
      await page.screenshot({ path: 'login-still-failed.png' });
      
      // ページのHTMLを一部出力してデバッグ
      const formHtml = await page.$eval('form', el => el.outerHTML).catch(() => 'フォームが見つかりません');
      console.log('\nフォームのHTML（抜粋）:');
      console.log(formHtml.substring(0, 500) + '...');
    }
    
    console.log('\n※ 20秒後に自動で閉じます...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();