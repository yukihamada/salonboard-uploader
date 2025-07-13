// final_upload_and_save.js - 最終版：画像アップロードと保存
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
    
    console.log('🌐 SalonBoard完全自動投稿\n');
    
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
    
    // 3. 画像アップロード（画像エリアをクリック）
    console.log('3️⃣ 画像アップロード...\n');
    
    // FRONT画像エリアをクリック
    try {
      console.log('📸 FRONT画像エリアクリック...');
      // 左側の画像アップロードエリア
      await page.mouse.click(137, 710);
      await page.waitForTimeout(2000);
      
      // ファイル選択ダイアログが開いたら画像を選択
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles('./images/front.jpg');
        console.log('✅ FRONT画像選択完了');
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('⚠️ FRONT画像スキップ');
    }
    
    // 4. スタイル情報入力
    console.log('\n4️⃣ スタイル情報入力...\n');
    
    const timestamp = new Date().toLocaleString('ja-JP');
    
    // 必須フィールドのみ入力
    try {
      // スタイル名（必須）
      await page.fill('input[name="styleName"], #styleName', `テストスタイル_${timestamp}`);
      console.log('✅ スタイル名入力');
      
      // カテゴリ（必須かも）
      const ladiesCheckbox = await page.$('input[type="checkbox"][value="レディース"], input#ladies');
      if (ladiesCheckbox) {
        await ladiesCheckbox.check();
        console.log('✅ レディース選択');
      }
    } catch (e) {
      console.log('❌ 必須項目入力エラー:', e.message);
    }
    
    console.log('\n');
    
    // 5. ページを下にスクロールして登録ボタンを表示
    console.log('5️⃣ 登録ボタンまでスクロール...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // 6. 登録ボタンをクリック
    console.log('6️⃣ 登録ボタンをクリック...');
    
    // 青い「登録」ボタンを探す
    const registerButton = await page.$('button.btn-primary:has-text("登録"), input[type="submit"][value="登録"], a.btn-primary:has-text("登録")');
    
    if (registerButton) {
      console.log('✅ 登録ボタン発見！');
      
      // 確認ダイアログに備える
      page.on('dialog', async dialog => {
        console.log('📢 確認:', dialog.message());
        await dialog.accept(); // OKをクリック
      });
      
      await registerButton.click();
      console.log('⏳ 登録処理中...');
      
      await page.waitForTimeout(5000);
      
      // 結果確認
      const finalUrl = page.url();
      console.log('\n最終URL:', finalUrl);
      
      if (!finalUrl.includes('styleEdit')) {
        console.log('✅ 登録成功！');
      } else {
        // エラーメッセージを探す
        const errorMessages = await page.$$('.error-message, .alert-danger, [class*="error"]:not([class*="hidden"])');
        if (errorMessages.length > 0) {
          console.log('\n❌ エラーメッセージ:');
          for (const msg of errorMessages) {
            const text = await msg.textContent();
            if (text && text.trim()) {
              console.log('  -', text.trim());
            }
          }
        }
      }
    } else {
      console.log('❌ 登録ボタンが見つかりません');
      
      // ボタンの位置を直接クリック
      console.log('📍 座標で登録ボタンをクリック...');
      await page.mouse.click(448, 1398); // 登録ボタンの推定位置
      await page.waitForTimeout(5000);
    }
    
    // 7. 最終結果
    console.log('\n7️⃣ 最終結果...');
    await page.screenshot({ path: 'upload-complete.png', fullPage: true });
    console.log('📸 完了画面: upload-complete.png');
    
    console.log('\n🎉 すべての処理が完了しました！');
    console.log('※ 画面を確認後、手動で閉じてください');
    
    // 無限待機（手動で閉じるまで）
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    console.error(error.stack);
  }
})();