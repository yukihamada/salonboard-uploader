// complete_style_save.js - スタイル情報入力と保存
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
    
    console.log('🌐 SalonBoardスタイル完全登録\n');
    
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
    
    // 3. スタイル情報入力
    console.log('3️⃣ スタイル情報入力...\n');
    
    const timestamp = new Date().toLocaleString('ja-JP');
    
    // スタイリストコメント
    try {
      const commentField = await page.$('#comment, textarea[name="comment"]');
      if (commentField) {
        await commentField.fill(`自動投稿テスト ${timestamp}\nトレンド感のある仕上がりになりました。`);
        console.log('✅ スタイリストコメント入力');
      }
    } catch (e) {
      console.log('⚠️ コメント入力スキップ');
    }
    
    // スタイル名
    try {
      const styleNameField = await page.$('#styleName, input[name="styleName"]');
      if (styleNameField) {
        await styleNameField.fill(`テストスタイル_${timestamp}`);
        console.log('✅ スタイル名入力');
      }
    } catch (e) {
      console.log('⚠️ スタイル名入力スキップ');
    }
    
    // カテゴリ（レディース選択）
    try {
      const ladiesRadio = await page.$('input[type="radio"][id*="ladies"], input[type="radio"][value*="レディース"]');
      if (ladiesRadio) {
        await ladiesRadio.check();
        console.log('✅ カテゴリ: レディース');
      }
    } catch (e) {
      console.log('⚠️ カテゴリ選択スキップ');
    }
    
    // 長さ（ドロップダウン）
    try {
      const lengthSelect = await page.$('select[name="styleLength"], #styleLength');
      if (lengthSelect) {
        const options = await lengthSelect.$$('option');
        if (options.length > 1) {
          await lengthSelect.selectOption({ index: 1 }); // 最初の有効なオプション
          console.log('✅ 長さ選択');
        }
      }
    } catch (e) {
      console.log('⚠️ 長さ選択スキップ');
    }
    
    // メニュー内容
    try {
      const menuField = await page.$('input[name="menu"], #menu, textarea[name="menu"]');
      if (menuField) {
        await menuField.fill('カット + カラー + トリートメント');
        console.log('✅ メニュー内容入力');
      }
    } catch (e) {
      console.log('⚠️ メニュー入力スキップ');
    }
    
    // ハッシュタグ
    try {
      const hashtagField = await page.$('#hashtag, input[name="hashtag"]');
      if (hashtagField) {
        await hashtagField.fill('#テスト #自動投稿');
        console.log('✅ ハッシュタグ入力');
      }
    } catch (e) {
      console.log('⚠️ ハッシュタグスキップ');
    }
    
    console.log('\n');
    
    // 4. 画面の状態を確認
    console.log('4️⃣ 現在の入力状態を確認...');
    await page.screenshot({ path: 'before-save.png', fullPage: true });
    console.log('📸 保存前の画面: before-save.png\n');
    
    // 5. 保存実行
    console.log('5️⃣ スタイル保存...');
    
    // 登録ボタンを探す
    const saveButtons = await page.$$('button:has-text("登録"), input[type="submit"][value="登録"], button.btn-primary');
    console.log(`保存ボタン候補: ${saveButtons.length}個`);
    
    if (saveButtons.length > 0) {
      console.log('⏳ 登録ボタンクリック...');
      await saveButtons[0].click();
      
      // 確認ダイアログが出る場合
      page.on('dialog', async dialog => {
        console.log('📢 確認ダイアログ:', dialog.message());
        await dialog.accept();
      });
      
      await page.waitForTimeout(5000);
      
      // URL変化を確認
      const newUrl = page.url();
      console.log('新しいURL:', newUrl);
      
      if (newUrl.includes('complete') || newUrl.includes('success') || !newUrl.includes('styleEdit')) {
        console.log('✅ 保存成功！');
      } else {
        console.log('⚠️ 保存後もまだ編集画面です');
        
        // エラーメッセージを確認
        const errors = await page.$$('.error, .alert-danger, [class*="error"]');
        for (const error of errors) {
          const text = await error.textContent();
          console.log('❌ エラー:', text);
        }
      }
    } else {
      console.log('❌ 保存ボタンが見つかりません');
    }
    
    // 6. 最終結果
    console.log('\n6️⃣ 最終結果...');
    await page.screenshot({ path: 'final-result.png', fullPage: true });
    console.log('📸 最終画面: final-result.png');
    
    console.log('\n🎉 処理完了！');
    console.log('※ 30秒後に自動で閉じます...');
    
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();