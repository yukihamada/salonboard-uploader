// create_sample_images.js - サンプル画像生成
import { createCanvas } from 'canvas';
import fs from 'fs';

function createSampleImage(text, filename) {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // 背景
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 800, 600);
  
  // 枠線
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 780, 580);
  
  // テキスト
  ctx.fillStyle = '#333';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 400, 300);
  
  // ファイル保存
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(filename, buffer);
  console.log(`✅ ${filename} を作成しました`);
}

// サンプル画像生成
createSampleImage('FRONT', './images/front.jpg');
createSampleImage('SIDE', './images/side.jpg');
createSampleImage('BACK', './images/back.jpg');

console.log('\n🎉 すべてのサンプル画像を作成しました！');