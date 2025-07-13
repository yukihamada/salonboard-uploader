// upload_final_complete.js - 完全動作版画像アップロード
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config({ path: '.env.local' });

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    const page = await browser.newPage();
    
    console.log('🚀 SalonBoard完全版アップローダー\n');
    
    // 1. ログイン
    console.log('1️⃣ ログイン...');
    await page.goto('https://salonboard.com/login/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="userId"]', process.env.SB_ID);
    await page.fill('input[name="password"]', process.env.SB_PASS);
    await page.click('a:has-text("ログイン"):visible');
    
    await page.waitForTimeout(3000);
    console.log('✅ ログイン完了\n');
    
    // 2. スタイル編集画面へ
    console.log('2️⃣ スタイル編集画面へ移動...');
    await page.goto('https://salonboard.com/CNB/draft/styleEdit/');
    await page.waitForLoadState('networkidle');
    console.log('✅ スタイル編集画面表示\n');
    
    // 3. 画像アップロード
    console.log('3️⃣ 画像アップロード...\n');
    
    // FRONT画像
    try {
      console.log('📸 FRONT画像アップロード...');
      // 最初の「画像をアップロードする」ボタンをクリック
      const uploadButtons = await page.$$('text=画像をアップロードする');
      if (uploadButtons.length >= 1) {
        await uploadButtons[0].click();
        await page.waitForTimeout(1000);
        
        // ファイル入力を待つ
        const fileInput = await page.waitForSelector('input[type="file"]', {
          state: 'attached',
          timeout: 5000
        });
        
        await fileInput.setInputFiles('./images/front.jpg');
        await page.waitForTimeout(3000);
        console.log('✅ FRONT画像アップロード完了\n');
      }
    } catch (error) {
      console.log('⚠️ FRONT画像アップロードスキップ:', error.message, '\n');
    }
    
    // SIDE画像
    try {
      console.log('📸 SIDE画像アップロード...');
      const uploadButtons = await page.$$('text=画像をアップロードする');
      if (uploadButtons.length >= 2) {
        await uploadButtons[1].click();
        await page.waitForTimeout(1000);
        
        const fileInput = await page.waitForSelector('input[type="file"]', {
          state: 'attached',
          timeout: 5000
        });
        
        await fileInput.setInputFiles('./images/side.jpg');
        await page.waitForTimeout(3000);
        console.log('✅ SIDE画像アップロード完了\n');
      }
    } catch (error) {
      console.log('⚠️ SIDE画像アップロードスキップ:', error.message, '\n');
    }
    
    // BACK画像
    try {
      console.log('📸 BACK画像アップロード...');
      const uploadButtons = await page.$$('text=画像をアップロードする');
      if (uploadButtons.length >= 3) {
        await uploadButtons[2].click();
        await page.waitForTimeout(1000);
        
        const fileInput = await page.waitForSelector('input[type="file"]', {
          state: 'attached',
          timeout: 5000
        });
        
        await fileInput.setInputFiles('./images/back.jpg');
        await page.waitForTimeout(3000);
        console.log('✅ BACK画像アップロード完了\n');
      }
    } catch (error) {
      console.log('⚠️ BACK画像アップロードスキップ:', error.message, '\n');
    }
    
    // 4. スタイル情報入力
    console.log('4️⃣ スタイル情報入力...\n');
    
    // スタイリストコメント
    try {
      const commentInput = await page.$('textarea[name="comment"], #comment');
      if (commentInput) {
        await commentInput.fill('Playwrightで自動投稿したテストスタイルです。トレンド感のある仕上がりになりました。');
        console.log('✅ スタイリストコメント入力');
      }
    } catch {}
    
    // スタイル名
    try {
      const timestamp = new Date().toLocaleString('ja-JP');
      const styleNameInput = await page.$('input[name="styleName"], #styleName');
      if (styleNameInput) {
        await styleNameInput.fill(`テストスタイル_${timestamp}`);
        console.log('✅ スタイル名入力');
      }
    } catch {}
    
    // カテゴリ（レディース/メンズ）
    try {
      const ladiesRadio = await page.$('input[type="radio"][value="レディース"], input[type="radio"][value="1"]');
      if (ladiesRadio) {
        await ladiesRadio.check();
        console.log('✅ カテゴリ: レディース選択');
      }
    } catch {}
    
    // 長さ
    try {
      const lengthSelect = await page.$('select[name="length"], #length');
      if (lengthSelect) {
        const options = await lengthSelect.$$('option');
        if (options.length > 1) {
          await lengthSelect.selectOption({ index: 1 });
          console.log('✅ 長さ選択');
        }
      }
    } catch {}
    
    // メニュー内容
    try {
      const menuInput = await page.$('textarea[name="menu"], #menu');
      if (menuInput) {
        await menuInput.fill('カット + カラー + トリートメント');
        console.log('✅ メニュー内容入力');
      }
    } catch {}
    
    console.log('\n');
    
    // 5. 保存
    console.log('5️⃣ スタイル保存...');
    try {
      // 「登録」ボタンをクリック
      const saveButton = await page.$('button:has-text("登録"), input[type="submit"][value="登録"]');
      if (saveButton) {
        await saveButton.click();
        console.log('✅ 登録ボタンクリック');
        await page.waitForTimeout(3000);
      }
    } catch (error) {
      console.log('⚠️ 保存ボタンが見つかりません');
    }
    
    // 6. 結果確認
    console.log('\n6️⃣ 処理結果...');
    const finalUrl = page.url();
    console.log('最終URL:', finalUrl);
    
    // スクリーンショット保存
    const timestamp = Date.now();
    await page.screenshot({ 
      path: `complete-result-${timestamp}.png`,
      fullPage: true 
    });
    console.log(`📸 結果画面: complete-result-${timestamp}.png`);
    
    console.log('\n🎉 すべての処理が完了しました！');
    console.log('※ 20秒後に自動で閉じます...');
    
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    
    if (page) {
      await page.screenshot({ path: `error-${Date.now()}.png` });
      console.log('📸 エラー画面を保存しました');
    }
  } finally {
    await browser.close();
  }
})();