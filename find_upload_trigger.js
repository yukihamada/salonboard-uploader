// find_upload_trigger.js - アップロードトリガーを探す
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
    
    console.log('🔍 画像アップロードトリガー調査\n');
    
    // ログイン
    await page.goto('https://salonboard.com/login/');
    await page.waitForTimeout(2000);
    await page.fill('input[name="userId"]', process.env.SB_ID);
    await page.fill('input[name="password"]', process.env.SB_PASS);
    await page.click('a:has-text("ログイン"):visible');
    await page.waitForTimeout(3000);
    
    // スタイル編集画面
    await page.goto('https://salonboard.com/CNB/draft/styleEdit/');
    await page.waitForTimeout(3000);
    
    console.log('📍 画像エリア内のすべての要素を調査...\n');
    
    // 画像エリア内のクリック可能な要素を探す
    const clickableElements = await page.$$eval('#photoArea *', elements => {
      const results = [];
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        
        // クリック可能な要素の条件
        if (rect.width > 0 && rect.height > 0 && 
            (el.tagName === 'A' || el.tagName === 'BUTTON' || 
             el.tagName === 'IMG' || styles.cursor === 'pointer' ||
             el.onclick || el.getAttribute('onclick'))) {
          
          results.push({
            tag: el.tagName,
            text: el.textContent?.trim().substring(0, 30),
            className: el.className,
            id: el.id,
            src: el.src || el.getAttribute('src'),
            href: el.href,
            onclick: el.getAttribute('onclick'),
            cursor: styles.cursor,
            position: `(${Math.round(rect.x)}, ${Math.round(rect.y)})`,
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`
          });
        }
      });
      return results;
    });
    
    console.log('クリック可能な要素:');
    clickableElements.forEach((el, i) => {
      console.log(`\n[${i}] ${el.tag}`);
      if (el.text) console.log(`  text: ${el.text}`);
      if (el.className) console.log(`  class: ${el.className}`);
      if (el.src) console.log(`  src: ${el.src}`);
      if (el.onclick) console.log(`  onclick: ${el.onclick}`);
      console.log(`  cursor: ${el.cursor}`);
      console.log(`  位置: ${el.position}, サイズ: ${el.size}`);
    });
    
    // 画像エリアの枠内をクリックしてみる
    console.log('\n\n🖱️ 画像エリアを順番にクリック...\n');
    
    // FRONT, SIDE, BACKの位置（推定）
    const positions = [
      { name: 'FRONT', x: 275, y: 1420 },
      { name: 'SIDE', x: 575, y: 1420 },
      { name: 'BACK', x: 875, y: 1420 }
    ];
    
    for (const pos of positions) {
      console.log(`\n📍 ${pos.name}エリアをクリック (${pos.x}, ${pos.y})`);
      
      // クリック前にリスナー設定
      await page.evaluate(() => {
        window.lastClickEvent = null;
        document.addEventListener('click', (e) => {
          window.lastClickEvent = {
            target: e.target.tagName + '.' + e.target.className,
            bubbled: e.eventPhase === 3
          };
        }, true);
      });
      
      await page.mouse.click(pos.x, pos.y);
      await page.waitForTimeout(2000);
      
      // クリック結果を確認
      const clickResult = await page.evaluate(() => window.lastClickEvent);
      if (clickResult) {
        console.log(`  クリックされた要素: ${clickResult.target}`);
      }
      
      // 新しい要素が表示されたか確認
      const newElements = await page.$$('.modal, .popup, [class*="dialog"], [class*="overlay"], input[type="file"]');
      console.log(`  新規要素: ${newElements.length}個`);
      
      // input[type="file"]が出現したか確認
      const fileInputs = await page.$$('input[type="file"]');
      if (fileInputs.length > 0) {
        console.log('  ✅ ファイル入力発見！');
        
        // 画像をアップロード
        try {
          await fileInputs[0].setInputFiles(`./images/${pos.name.toLowerCase()}.jpg`);
          console.log(`  ✅ ${pos.name}画像アップロード成功！`);
          await page.waitForTimeout(3000);
        } catch (e) {
          console.log(`  ❌ アップロードエラー: ${e.message}`);
        }
      }
      
      // モーダルを閉じる
      const closeButtons = await page.$$('button:has-text("閉じる"), button:has-text("×"), .close, .modal-close');
      if (closeButtons.length > 0) {
        await closeButtons[0].click();
        await page.waitForTimeout(1000);
      }
    }
    
    // 結果確認
    console.log('\n\n📸 最終結果...');
    await page.screenshot({ path: 'upload-investigation.png', fullPage: true });
    console.log('スクリーンショット: upload-investigation.png');
    
    console.log('\n⏸️ ブラウザは開いたままです。手動で確認してください。');
    console.log('Ctrl+C で終了');
    
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
})();