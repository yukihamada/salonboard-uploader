// login_basic.js - 最も基本的なログイン
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // ゆっくり動作
  });

  try {
    const page = await browser.newPage();
    
    console.log('1. ログインページへアクセス...');
    await page.goto('https://salonboard.com/login/');
    await page.waitForTimeout(3000);
    
    console.log('2. 入力フィールドを探す...');
    
    // すべてのinput要素を取得
    const inputs = await page.$$('input');
    console.log(`   見つかったinput要素: ${inputs.length}個`);
    
    // テキストタイプのinputにIDを入力
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const name = await inputs[i].getAttribute('name');
      const placeholder = await inputs[i].getAttribute('placeholder');
      
      console.log(`   Input[${i}]: type="${type}", name="${name}", placeholder="${placeholder}"`);
      
      if (type === 'text' && !await inputs[i].isDisabled()) {
        console.log(`   → ID欄に入力: ${process.env.SB_ID}`);
        await inputs[i].fill(process.env.SB_ID);
        break;
      }
    }
    
    await page.waitForTimeout(1000);
    
    // パスワードタイプのinputにパスワードを入力
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      
      if (type === 'password' && !await inputs[i].isDisabled()) {
        console.log(`   → パスワード欄に入力`);
        await inputs[i].fill(process.env.SB_PASS);
        break;
      }
    }
    
    await page.waitForTimeout(1000);
    
    console.log('3. フォーム内のボタンや画像を探す...');
    
    // input type="image" を探す（画像ボタン）
    const imageButtons = await page.$$('input[type="image"]');
    console.log(`   画像ボタン: ${imageButtons.length}個`);
    
    if (imageButtons.length > 0) {
      console.log('   → 画像ボタンをクリック');
      await imageButtons[0].click();
    } else {
      // 通常のボタンを探す
      const buttons = await page.$$('button, input[type="submit"]');
      console.log(`   通常のボタン: ${buttons.length}個`);
      
      if (buttons.length > 0) {
        console.log('   → 最初のボタンをクリック');
        await buttons[0].click();
      }
    }
    
    console.log('4. ページ遷移を待機...');
    await page.waitForTimeout(5000);
    
    console.log('5. ログイン後の状態:');
    console.log('   URL:', page.url());
    console.log('   タイトル:', await page.title());
    
    // ログイン成功判定
    if (!page.url().includes('/login')) {
      console.log('✅ ログイン成功！');
      
      // スタイル編集ページへ
      console.log('6. スタイル編集ページへ移動...');
      await page.goto('https://salonboard.com/CNB/draft/styleEdit/');
      await page.waitForTimeout(3000);
      
      console.log('   URL:', page.url());
      await page.screenshot({ path: 'success.png' });
      console.log('📸 成功画面: success.png');
    } else {
      console.log('❌ ログイン失敗');
      await page.screenshot({ path: 'failed.png' });
      console.log('📸 失敗画面: failed.png');
    }
    
    console.log('\n※ 15秒後に自動で閉じます...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await browser.close();
  }
})();