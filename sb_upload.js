// sb_upload.js ── Playwright自動化: SalonBoard画像アップロード
import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// 環境変数読み込み
dotenv.config({ path: '.env.local' });

const CONFIG = {
  // 認証情報（環境変数から取得）
  SB_ID: process.env.SB_ID || '',
  SB_PASS: process.env.SB_PASS || '',
  
  // アップロード画像パス
  IMAGES: {
    FRONT: process.env.IMG_FRONT || './images/front.jpg',
    SIDE: process.env.IMG_SIDE || './images/side.jpg', 
    BACK: process.env.IMG_BACK || './images/back.jpg'
  },
  
  // タイムアウト設定
  TIMEOUT: {
    DEFAULT: 30000,
    UPLOAD: 60000
  },
  
  // ヘッドレスモード（デバッグ時はfalse）
  HEADLESS: process.env.DEBUG !== 'true'
};

class SalonBoardUploader {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init() {
    // 認証情報チェック
    if (!CONFIG.SB_ID || !CONFIG.SB_PASS) {
      throw new Error('環境変数 SB_ID, SB_PASS を設定してください');
    }

    // ブラウザ起動
    this.browser = await chromium.launch({
      headless: CONFIG.HEADLESS,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 1024 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo'
    });

    this.page = await this.context.newPage();
    
    // コンソールログ出力
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('ブラウザエラー:', msg.text());
      }
    });
  }

  async login() {
    console.log('🔐 ログイン開始...');
    
    await this.page.goto('https://salonboard.com/login/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // ログインフォーム入力
    await this.page.fill('input[name="userId"]', CONFIG.SB_ID);
    await this.page.fill('input[name="password"]', CONFIG.SB_PASS);

    // ログインボタンクリックと遷移待機
    await Promise.all([
      this.page.waitForNavigation({ 
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.TIMEOUT.DEFAULT 
      }),
      this.page.click('a:has-text("ログイン"):visible')
    ]);

    // ログイン成功確認
    const currentUrl = this.page.url();
    if (currentUrl.includes('/login/')) {
      throw new Error('ログイン失敗: 認証情報を確認してください');
    }

    console.log('✅ ログイン成功');
  }

  async navigateToStyleEdit() {
    console.log('📝 スタイル編集画面へ移動...');
    
    await this.page.goto('https://salonboard.com/CNB/draft/styleEdit/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // ページ読み込み確認
    await this.page.waitForSelector('text=スタイル投稿', {
      timeout: CONFIG.TIMEOUT.DEFAULT
    });

    console.log('✅ スタイル編集画面表示完了');
  }

  async uploadImage(position, imagePath) {
    // ファイル存在確認
    try {
      await fs.access(imagePath);
    } catch {
      console.warn(`⚠️  ${position}画像がありません: ${imagePath}`);
      return null;
    }

    console.log(`📸 ${position}画像アップロード開始: ${imagePath}`);

    // 画像アップロードボタンを探す（位置別）
    const uploadButtonSelector = position === 'FRONT' 
      ? '.front-image-upload button:has-text("画像をアップロードする")'
      : position === 'SIDE'
      ? '.side-image-upload button:has-text("画像をアップロードする")'
      : '.back-image-upload button:has-text("画像をアップロードする")';

    try {
      // アップロードボタンクリック
      await this.page.click(uploadButtonSelector, {
        timeout: CONFIG.TIMEOUT.DEFAULT
      });
    } catch {
      // セレクタが見つからない場合は汎用的なセレクタを試す
      const buttons = await this.page.$$('button:has-text("画像をアップロードする")');
      const buttonIndex = position === 'FRONT' ? 0 : position === 'SIDE' ? 1 : 2;
      
      if (buttons[buttonIndex]) {
        await buttons[buttonIndex].click();
      } else {
        throw new Error(`${position}用のアップロードボタンが見つかりません`);
      }
    }

    // モーダル内のfile input待機
    const fileInput = await this.page.waitForSelector('input[type="file"]', {
      state: 'attached',
      timeout: CONFIG.TIMEOUT.DEFAULT
    });

    // ファイルセット
    await fileInput.setInputFiles(imagePath);

    // アップロード完了待機
    const response = await this.page.waitForResponse(
      resp => resp.url().includes('/styleImage/upload') && resp.status() === 200,
      { timeout: CONFIG.TIMEOUT.UPLOAD }
    );

    // レスポンス確認
    const responseData = await response.json();
    const imageId = responseData.imageId || responseData.id;

    if (!imageId) {
      throw new Error(`${position}画像アップロード失敗: IDが取得できません`);
    }

    // hidden inputの値確認
    const hiddenInputName = `${position.toLowerCase()}ImgId`;
    const hiddenValue = await this.page.getAttribute(`input[name="${hiddenInputName}"]`, 'value');

    if (!hiddenValue) {
      // 手動でセット（フォールバック）
      await this.page.evaluate((name, id) => {
        const input = document.querySelector(`input[name="${name}"]`);
        if (input) input.value = id;
      }, hiddenInputName, imageId);
    }

    console.log(`✅ ${position}画像アップロード成功 (ID: ${imageId})`);
    
    // モーダルを閉じる
    try {
      await this.page.click('button:has-text("閉じる")', { timeout: 5000 });
    } catch {
      // ESCキーでも閉じる
      await this.page.keyboard.press('Escape');
    }

    await this.page.waitForTimeout(1000); // 安定化待機

    return imageId;
  }

  async fillStyleInfo(styleData) {
    console.log('📋 スタイル情報入力...');

    // スタイル名
    if (styleData.styleName) {
      await this.page.fill('input[name="styleName"]', styleData.styleName);
    }

    // カテゴリ選択
    if (styleData.category) {
      await this.page.selectOption('select[name="categoryId"]', { label: styleData.category });
    }

    // 説明文
    if (styleData.description) {
      await this.page.fill('textarea[name="description"]', styleData.description);
    }

    // タグ
    if (styleData.tags && styleData.tags.length > 0) {
      const tagInput = await this.page.$('input[name="tags"]');
      if (tagInput) {
        for (const tag of styleData.tags) {
          await tagInput.type(tag);
          await this.page.keyboard.press('Enter');
          await this.page.waitForTimeout(500);
        }
      }
    }

    console.log('✅ スタイル情報入力完了');
  }

  async saveStyle(isDraft = false) {
    console.log(`💾 スタイル${isDraft ? '下書き' : ''}保存中...`);

    const buttonText = isDraft ? '下書き保存' : '登録';
    
    await Promise.all([
      this.page.waitForNavigation({
        waitUntil: 'networkidle',
        timeout: CONFIG.TIMEOUT.DEFAULT
      }),
      this.page.click(`button:has-text("${buttonText}")`)
    ]);

    // 保存成功確認
    const successMessage = await this.page.$('text=保存しました');
    if (!successMessage) {
      console.warn('⚠️  保存確認メッセージが表示されませんでした');
    }

    console.log(`✅ スタイル${isDraft ? '下書き' : ''}保存完了`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// メイン実行
async function main() {
  const uploader = new SalonBoardUploader();
  
  try {
    // 初期化
    await uploader.init();
    
    // ログイン
    await uploader.login();
    
    // スタイル編集画面へ
    await uploader.navigateToStyleEdit();
    
    // 画像アップロード（3枚）
    const uploadResults = {
      front: await uploader.uploadImage('FRONT', CONFIG.IMAGES.FRONT),
      side: await uploader.uploadImage('SIDE', CONFIG.IMAGES.SIDE),
      back: await uploader.uploadImage('BACK', CONFIG.IMAGES.BACK)
    };

    // スタイル情報入力
    await uploader.fillStyleInfo({
      styleName: 'テストスタイル ' + new Date().toLocaleDateString('ja-JP'),
      category: 'ショート',
      description: 'Playwrightで自動投稿したテストスタイルです。',
      tags: ['ショート', 'ナチュラル', 'オフィス']
    });

    // 保存（下書きとして保存）
    await uploader.saveStyle(true);

    console.log('🎉 すべての処理が完了しました！');
    console.log('アップロード結果:', uploadResults);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    
    // スクリーンショット保存
    if (uploader.page) {
      const screenshotPath = `error-${Date.now()}.png`;
      await uploader.page.screenshot({ path: screenshotPath });
      console.log(`📸 エラー時のスクリーンショット: ${screenshotPath}`);
    }
    
    throw error;
  } finally {
    await uploader.close();
  }
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SalonBoardUploader, main };