// upload_with_error_handling.js - エラー処理付き画像アップロード
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
    
    console.log('✨ SalonBoard画像アップロード（エラー処理版）\n');
    
    // エラーダイアログを自動的に閉じる
    page.on('dialog', async dialog => {
      console.log('📢 ダイアログ:', dialog.message());
      await dialog.accept();
    });
    
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
    
    // 通信エラーダイアログを閉じる関数
    const closeErrorDialog = async () => {
      try {
        // エラーダイアログを探す
        const errorDialog = await page.$('.mod_popup_01.dialog:has-text("通信に失敗しました")');
        if (errorDialog) {
          console.log('  ⚠️ エラーダイアログ検出');
          
          // 閉じるボタンを探す
          const closeBtn = await page.$('.mod_popup_01.dialog button:has-text("閉じる"), .mod_popup_01.dialog .close');
          if (closeBtn) {
            await closeBtn.click();
            console.log('  ✓ エラーダイアログを閉じました');
            await page.waitForTimeout(1000);
          }
        }
      } catch (e) {
        // エラーは無視
      }
    };
    
    // 3. 画像アップロード
    console.log('3️⃣ 画像アップロード開始...\n');
    
    // アップロード関数
    const uploadImage = async (position, index) => {
      console.log(`📸 ${position}画像...`);
      
      try {
        // エラーダイアログがあれば閉じる
        await closeErrorDialog();
        
        // 画像要素を取得
        const imgs = await page.$$('img.img_new_no_photo[src*="style_image_upload"]');
        if (imgs.length > index) {
          // クリック
          await imgs[index].click();
          console.log(`  ✓ ${position}画像エリアクリック`);
          
          // エラーダイアログを待つ
          await page.waitForTimeout(2000);
          await closeErrorDialog();
          
          // もう一度クリック（必要な場合）
          const imgs2 = await page.$$('img.img_new_no_photo[src*="style_image_upload"]');
          if (imgs2.length > index) {
            await imgs2[index].click();
            await page.waitForTimeout(2000);
          }
          
          // ファイル入力を探す（短いタイムアウト）
          try {
            const fileInput = await page.waitForSelector('input[type="file"]', {
              state: 'attached',
              timeout: 3000
            });
            
            if (fileInput) {
              await fileInput.setInputFiles(`./images/${position.toLowerCase()}.jpg`);
              console.log(`  ✓ ${position}画像選択完了`);
              await page.waitForTimeout(3000);
              
              // モーダルを閉じる
              const modalClose = await page.$('button:has-text("閉じる"), .modal-close');
              if (modalClose) {
                await modalClose.click();
              }
              
              console.log(`  ✅ ${position}画像アップロード完了！\n`);
              return true;
            }
          } catch (e) {
            console.log(`  ⚠️ ファイル選択ダイアログが開きませんでした\n`);
          }
        }
      } catch (error) {
        console.log(`  ❌ エラー: ${error.message}\n`);
      }
      
      return false;
    };
    
    // 各画像をアップロード
    await uploadImage('FRONT', 0);
    await uploadImage('SIDE', 1);
    await uploadImage('BACK', 2);
    
    // 4. 別の方法を試す
    console.log('4️⃣ 代替方法: 座標クリックで再試行...\n');
    
    // エラーダイアログを閉じる
    await closeErrorDialog();
    
    // 画像の座標を直接クリック
    const positions = [
      { name: 'FRONT', x: 275, y: 1420 },
      { name: 'SIDE', x: 575, y: 1420 },
      { name: 'BACK', x: 875, y: 1420 }
    ];
    
    for (const pos of positions) {
      console.log(`📍 ${pos.name}を座標クリック (${pos.x}, ${pos.y})`);
      
      await closeErrorDialog();
      await page.mouse.click(pos.x, pos.y);
      await page.waitForTimeout(2000);
      
      // ファイル入力を確認
      const inputs = await page.$$('input[type="file"]');
      console.log(`  File input: ${inputs.length}個`);
      
      if (inputs.length > 0) {
        try {
          await inputs[0].setInputFiles(`./images/${pos.name.toLowerCase()}.jpg`);
          console.log(`  ✅ ${pos.name}画像セット完了`);
          await page.waitForTimeout(3000);
        } catch (e) {
          console.log(`  ⚠️ ファイルセットエラー`);
        }
      }
    }
    
    // 5. 最終結果
    console.log('\n5️⃣ 最終結果確認...');
    
    await closeErrorDialog();
    
    // 画面キャプチャ
    await page.screenshot({ path: 'final-upload-result.png', fullPage: true });
    console.log('📸 最終画面: final-upload-result.png');
    
    // アップロードされた画像を確認
    const uploadedCount = await page.$$eval('img', imgs => {
      return imgs.filter(img => {
        const src = img.src || '';
        return src.includes('temp') || src.includes('uploaded') || 
               (src.includes('styleImage') && !src.includes('upload.png'));
      }).length;
    });
    
    console.log(`\nアップロードされた画像: ${uploadedCount}枚`);
    
    if (uploadedCount === 0) {
      console.log('\n⚠️ 画像アップロードができませんでした。');
      console.log('考えられる原因:');
      console.log('1. ネットワークエラー');
      console.log('2. セッションタイムアウト');
      console.log('3. アップロード機能の仕様変更');
      console.log('\n📝 手動でアップロードしてください。');
    } else {
      console.log('\n✅ 画像アップロード成功！');
    }
    
    console.log('\n※ ブラウザは開いたままです。');
    console.log('※ 手動で確認・操作してください。');
    console.log('※ Ctrl+C で終了\n');
    
    // 無限待機
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
  }
})();