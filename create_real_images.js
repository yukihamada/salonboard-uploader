// create_real_images.js - 実際の画像を生成
import { createCanvas, registerFont } from 'canvas';
import fs from 'fs';

// 日本語フォントが使える場合は登録（オプション）
// registerFont('./fonts/NotoSansJP-Regular.otf', { family: 'Noto Sans JP' });

function createStyledImage(position, filename) {
  const canvas = createCanvas(1200, 1600);
  const ctx = canvas.getContext('2d');
  
  // 背景グラデーション
  const gradient = ctx.createLinearGradient(0, 0, 0, 1600);
  if (position === 'FRONT') {
    gradient.addColorStop(0, '#f8e5e5');
    gradient.addColorStop(1, '#f0d0d0');
  } else if (position === 'SIDE') {
    gradient.addColorStop(0, '#e5f0f8');
    gradient.addColorStop(1, '#d0e0f0');
  } else {
    gradient.addColorStop(0, '#e5f8e5');
    gradient.addColorStop(1, '#d0f0d0');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 1600);
  
  // ヘアスタイル図形（シンプルな表現）
  ctx.fillStyle = '#444';
  ctx.beginPath();
  
  if (position === 'FRONT') {
    // 正面の髪型シルエット
    ctx.arc(600, 500, 280, Math.PI, 0, false);
    ctx.bezierCurveTo(880, 500, 850, 800, 800, 1000);
    ctx.lineTo(400, 1000);
    ctx.bezierCurveTo(350, 800, 320, 500, 600, 500);
  } else if (position === 'SIDE') {
    // 横からの髪型シルエット
    ctx.arc(500, 500, 280, Math.PI * 1.2, Math.PI * 0.2, false);
    ctx.bezierCurveTo(700, 600, 680, 900, 650, 1100);
    ctx.lineTo(350, 1100);
    ctx.bezierCurveTo(320, 900, 300, 600, 500, 500);
  } else {
    // 後ろからの髪型シルエット
    ctx.arc(600, 500, 300, Math.PI, 0, false);
    ctx.bezierCurveTo(900, 500, 880, 850, 850, 1100);
    ctx.lineTo(350, 1100);
    ctx.bezierCurveTo(320, 850, 300, 500, 600, 500);
  }
  
  ctx.closePath();
  ctx.fill();
  
  // 装飾的な要素
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 5]);
  ctx.strokeRect(50, 50, 1100, 1500);
  ctx.setLineDash([]);
  
  // テキスト
  ctx.fillStyle = '#333';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(position, 600, 1400);
  
  // サブテキスト
  ctx.font = '40px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText('Hair Style Sample', 600, 1480);
  
  // ファイル保存
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  fs.writeFileSync(filename, buffer);
  console.log(`✅ ${filename} を作成しました`);
}

// 実際のスタイル画像を生成
console.log('🎨 ヘアスタイル画像を生成中...\n');

createStyledImage('FRONT', './images/front.jpg');
createStyledImage('SIDE', './images/side.jpg');
createStyledImage('BACK', './images/back.jpg');

console.log('\n🎉 すべての画像を生成しました！');