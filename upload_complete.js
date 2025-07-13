// upload_complete.js - 完全な画像アップロードスクリプト
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config({ path: '.env.local' });

class SalonBoardCompleteUploader {
  constructor() {
    this.browser = null;
    this.page = null;
    this.uploadedImages = [];
  }

  async init() {
    console.log('🚀 SalonBoard画像アップローダー起動...\n');
    
    this.browser = await chromium.launch({
      headless: false, // 動作確認のため表示
      slowMo: 300
    });

    this.page = await this.browser.newPage();
    
    // レスポンス監視
    this.page.on('response', response => {
      if (response.url().includes('upload') || response.url().includes('image')) {
        console.log(`📡 ${response.status()} - ${response.url().substring(0, 60)}...`);
      }
    });
  }

  async login() {
    console.log('🔐 ログイン処理開始...');
    
    await this.page.goto('https://salonboard.com/login/');
    await this.page.waitForLoadState('networkidle');
    
    // ログイン情報入力
    await this.page.fill('input[name="userId"]', process.env.SB_ID);
    await this.page.fill('input[name="password"]', process.env.SB_PASS);
    
    // ログインボタンクリック
    await this.page.click('a:has-text("ログイン"):visible');
    
    // ログイン完了待機
    try {
      await this.page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
      console.log('✅ ログイン成功\n');
    } catch {
      await this.page.waitForTimeout(3000);
    }
    
    const currentUrl = this.page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('ログインに失敗しました');
    }
  }

  async navigateToStyleEdit() {
    console.log('📝 スタイル編集画面へ移動...');
    
    await this.page.goto('https://salonboard.com/CNB/draft/styleEdit/');
    await this.page.waitForLoadState('networkidle');
    
    const url = this.page.url();
    if (!url.includes('styleEdit')) {
      throw new Error('スタイル編集画面への遷移に失敗しました');
    }
    
    console.log('✅ スタイル編集画面表示完了\n');
  }

  async uploadImage(position, imagePath) {
    console.log(`📸 ${position}画像アップロード開始...`);
    
    // ファイル存在確認
    try {
      await fs.access(imagePath);
    } catch {
      console.log(`⚠️  ${position}画像がありません: ${imagePath}`);
      return null;
    }

    try {
      // 画像アップロードエリアを探す
      // 様々なセレクタを試す
      const selectors = [
        `[data-position="${position}"]`,
        `[class*="${position.toLowerCase()}"]`,
        `.image-upload-${position.toLowerCase()}`,
        `#${position.toLowerCase()}Image`,
        `[name*="${position.toLowerCase()}"]`
      ];

      let uploadArea = null;
      for (const selector of selectors) {
        const elements = await this.page.$$(selector);
        if (elements.length > 0) {
          uploadArea = elements[0];
          console.log(`  ✓ アップロードエリア発見: ${selector}`);
          break;
        }
      }

      // 見つからない場合は、すべてのアップロードエリアから順番に選択
      if (!uploadArea) {
        const allUploadAreas = await this.page.$$('[class*="upload"], [class*="image"], .dropzone, .file-upload');
        const index = position === 'FRONT' ? 0 : position === 'SIDE' ? 1 : 2;
        
        if (allUploadAreas.length > index) {
          uploadArea = allUploadAreas[index];
          console.log(`  ✓ アップロードエリア[${index}]を使用`);
        }
      }

      if (!uploadArea) {
        console.log(`  ❌ ${position}用のアップロードエリアが見つかりません`);
        return null;
      }

      // クリックしてファイル選択ダイアログを開く
      await uploadArea.click();
      await this.page.waitForTimeout(1000);

      // ファイル入力を探す
      const fileInput = await this.page.waitForSelector('input[type="file"]', {
        state: 'attached',
        timeout: 5000
      });

      // ファイルをセット
      await fileInput.setInputFiles(imagePath);
      console.log(`  ✓ ファイルを選択: ${path.basename(imagePath)}`);

      // アップロード完了待機
      await this.page.waitForTimeout(3000);

      // 成功メッセージや画像プレビューを確認
      const preview = await this.page.$(`img[src*="blob"], img[src*="temp"], .preview-image`);
      if (preview) {
        console.log(`  ✓ ${position}画像プレビュー確認`);
      }

      console.log(`✅ ${position}画像アップロード完了\n`);
      this.uploadedImages.push(position);
      return true;

    } catch (error) {
      console.log(`❌ ${position}画像アップロードエラー: ${error.message}\n`);
      return false;
    }
  }

  async fillStyleInfo() {
    console.log('📋 スタイル情報を入力...');
    
    const timestamp = new Date().toLocaleString('ja-JP');
    const styleName = `テストスタイル_${timestamp}`;

    try {
      // スタイル名
      const nameInputs = await this.page.$$('input[name*="style"], input[name*="name"], input[placeholder*="スタイル"]');
      if (nameInputs.length > 0) {
        await nameInputs[0].fill(styleName);
        console.log(`  ✓ スタイル名: ${styleName}`);
      }

      // 説明文
      const descInputs = await this.page.$$('textarea[name*="desc"], textarea[name*="comment"], textarea[placeholder*="説明"]');
      if (descInputs.length > 0) {
        await descInputs[0].fill('Playwrightで自動アップロードしたテストスタイルです。');
        console.log('  ✓ 説明文入力完了');
      }

      // カテゴリ（もしあれば）
      const categorySelect = await this.page.$('select[name*="category"]');
      if (categorySelect) {
        const options = await categorySelect.$$('option');
        if (options.length > 1) {
          await categorySelect.selectOption({ index: 1 });
          console.log('  ✓ カテゴリ選択完了');
        }
      }

      console.log('✅ スタイル情報入力完了\n');
    } catch (error) {
      console.log(`⚠️  スタイル情報入力エラー: ${error.message}\n`);
    }
  }

  async saveStyle(isDraft = true) {
    console.log(`💾 スタイルを${isDraft ? '下書き' : ''}保存中...`);

    try {
      // 保存ボタンを探す
      const saveButtons = await this.page.$$('button[type="submit"], button:has-text("保存"), button:has-text("登録"), input[type="submit"]');
      
      if (saveButtons.length > 0) {
        // 下書き保存か本保存かで異なるボタンを選択
        let targetButton = null;
        for (const button of saveButtons) {
          const text = await button.textContent();
          if (isDraft && text && text.includes('下書き')) {
            targetButton = button;
            break;
          } else if (!isDraft && text && (text.includes('登録') || text.includes('公開'))) {
            targetButton = button;
            break;
          }
        }

        if (!targetButton && saveButtons.length > 0) {
          targetButton = saveButtons[0];
        }

        if (targetButton) {
          await targetButton.click();
          console.log('  ✓ 保存ボタンをクリック');
          
          await this.page.waitForTimeout(3000);
          
          // 成功メッセージを確認
          const successMsg = await this.page.$('[class*="success"], [class*="complete"]');
          if (successMsg) {
            console.log('✅ 保存成功！\n');
          } else {
            console.log('⚠️  保存完了（確認メッセージなし）\n');
          }
        }
      } else {
        console.log('⚠️  保存ボタンが見つかりません\n');
      }
    } catch (error) {
      console.log(`❌ 保存エラー: ${error.message}\n`);
    }
  }

  async captureResult() {
    const timestamp = Date.now();
    const screenshotPath = `result-${timestamp}.png`;
    
    await this.page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`📸 結果画面を保存: ${screenshotPath}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// メイン処理
async function main() {
  const uploader = new SalonBoardCompleteUploader();
  
  try {
    // 初期化
    await uploader.init();
    
    // ログイン
    await uploader.login();
    
    // スタイル編集画面へ
    await uploader.navigateToStyleEdit();
    
    // 画像アップロード
    console.log('🖼️  画像アップロード開始...\n');
    
    const images = [
      { position: 'FRONT', path: './images/front.jpg' },
      { position: 'SIDE', path: './images/side.jpg' },
      { position: 'BACK', path: './images/back.jpg' }
    ];
    
    for (const image of images) {
      await uploader.uploadImage(image.position, image.path);
      await uploader.page.waitForTimeout(1000);
    }
    
    // スタイル情報入力
    await uploader.fillStyleInfo();
    
    // 保存（下書きとして）
    await uploader.saveStyle(true);
    
    // 結果をキャプチャ
    await uploader.captureResult();
    
    console.log('🎉 処理完了！');
    console.log(`アップロードした画像: ${uploader.uploadedImages.join(', ')}`);
    
    // 15秒待機して確認
    console.log('\n※ 15秒後に自動で閉じます...');
    await uploader.page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    
    if (uploader.page) {
      await uploader.page.screenshot({ path: `error-${Date.now()}.png` });
      console.log('📸 エラー時のスクリーンショットを保存しました');
    }
  } finally {
    await uploader.close();
  }
}

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SalonBoardCompleteUploader, main };