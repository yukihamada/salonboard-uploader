// debug_upload_area.js - アップロードエリアの詳細調査
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    devtools: true // 開発者ツールを開く
  });

  try {
    const page = await browser.newPage();
    
    console.log('🔍 SalonBoard画像アップロードエリア調査\n');
    
    // ログイン
    console.log('1️⃣ ログイン...');
    await page.goto('https://salonboard.com/login/');
    await page.waitForTimeout(2000);
    
    await page.fill('input[name="userId"]', process.env.SB_ID);
    await page.fill('input[name="password"]', process.env.SB_PASS);
    await page.click('a:has-text("ログイン"):visible');
    await page.waitForTimeout(3000);
    
    // スタイル編集画面へ
    console.log('2️⃣ スタイル編集画面へ移動...\n');
    await page.goto('https://salonboard.com/CNB/draft/styleEdit/');
    await page.waitForTimeout(3000);
    
    // すべてのクリック可能な要素を調査
    console.log('3️⃣ アップロード関連要素を調査...\n');
    
    // 画像関連の要素をすべて取得
    const imageElements = await page.$$eval('*', elements => {
      const results = [];
      elements.forEach(el => {
        const text = el.textContent || '';
        const className = el.className || '';
        const id = el.id || '';
        
        // 画像アップロード関連のキーワード
        if (text.includes('画像') || text.includes('アップロード') || 
            className.includes('upload') || className.includes('image') ||
            id.includes('upload') || id.includes('image')) {
          
          const rect = el.getBoundingClientRect();
          results.push({
            tag: el.tagName,
            text: text.substring(0, 50),
            className: className,
            id: id,
            onclick: el.onclick ? 'あり' : 'なし',
            position: `(${Math.round(rect.x)}, ${Math.round(rect.y)})`,
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            visible: rect.width > 0 && rect.height > 0
          });
        }
      });
      return results;
    });
    
    console.log('見つかった要素:');
    imageElements.filter(el => el.visible).forEach((el, i) => {
      console.log(`\n[${i}] ${el.tag}`);
      console.log(`  テキスト: ${el.text}`);
      console.log(`  class: ${el.className}`);
      console.log(`  id: ${el.id}`);
      console.log(`  位置: ${el.position}`);
      console.log(`  サイズ: ${el.size}`);
      console.log(`  onclick: ${el.onclick}`);
    });
    
    // input[type="file"]を探す
    console.log('\n\n4️⃣ ファイル入力要素を調査...\n');
    const fileInputs = await page.$$eval('input[type="file"]', inputs => {
      return inputs.map(input => ({
        name: input.name,
        id: input.id,
        className: input.className,
        accept: input.accept,
        multiple: input.multiple,
        visible: input.offsetWidth > 0 && input.offsetHeight > 0,
        disabled: input.disabled,
        parent: input.parentElement?.tagName + '.' + input.parentElement?.className
      }));
    });
    
    console.log(`input[type="file"]の数: ${fileInputs.length}`);
    fileInputs.forEach((input, i) => {
      console.log(`\n[${i}] ファイル入力`);
      console.log(`  name: ${input.name}`);
      console.log(`  id: ${input.id}`);
      console.log(`  class: ${input.className}`);
      console.log(`  accept: ${input.accept}`);
      console.log(`  表示: ${input.visible ? '○' : '×'}`);
      console.log(`  有効: ${!input.disabled ? '○' : '×'}`);
      console.log(`  親要素: ${input.parent}`);
    });
    
    // 青い枠の画像エリアを直接操作
    console.log('\n\n5️⃣ 画像エリアを直接操作...\n');
    
    // イベントリスナーを追加して、クリックイベントを監視
    await page.evaluate(() => {
      document.addEventListener('click', (e) => {
        console.log('クリック検出:', e.target.tagName, e.target.className);
      }, true);
    });
    
    // 画像エリアの要素を取得して情報表示
    const uploadAreas = await page.$$('.image-upload-area, [class*="upload"], .dropzone, .file-drop-area');
    console.log(`アップロードエリア候補: ${uploadAreas.length}個`);
    
    // 各エリアの詳細情報
    for (let i = 0; i < uploadAreas.length && i < 3; i++) {
      const info = await uploadAreas[i].evaluate(el => {
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          class: el.className,
          cursor: styles.cursor,
          position: `(${Math.round(rect.x)}, ${Math.round(rect.y)})`,
          size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
          zIndex: styles.zIndex,
          onclick: !!el.onclick,
          events: Object.keys(el).filter(k => k.startsWith('on'))
        };
      });
      
      console.log(`\nエリア[${i}]:`, JSON.stringify(info, null, 2));
    }
    
    console.log('\n\n⏸️  ブラウザを開いたままにします。');
    console.log('📌 開発者ツールで要素を調査してください。');
    console.log('📌 手動でクリックして動作を確認してください。');
    console.log('📌 確認後、Ctrl+C で終了してください。\n');
    
    // 無限待機
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
  }
})();