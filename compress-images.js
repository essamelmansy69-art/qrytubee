import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const directory = './src/assets/images';

async function compressAll() {
  if (!fs.existsSync(directory)) {
    console.error(`Directory ${directory} does not exist.`);
    return;
  }

  const files = fs.readdirSync(directory);
  console.log(`Found ${files.length} images in directory.`);
  let totalSaved = 0;
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      const originalSizeKB = stats.size / 1024;
      
      // If it's already under 35KB, skip it
      if (originalSizeKB < 35) {
        console.log(`Skipping ${file} - already small (${originalSizeKB.toFixed(1)} KB)`);
        continue;
      }
      
      console.log(`Compressing ${file} (${originalSizeKB.toFixed(1)} KB)...`);
      try {
        const buffer = fs.readFileSync(filePath);
        
        const optimizedBuffer = await sharp(buffer)
          .resize(350, 350, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 75, mozjpeg: true, progressive: true })
          .toBuffer();
          
        fs.writeFileSync(filePath, optimizedBuffer);
        const newStats = fs.statSync(filePath);
        const newSizeKB = newStats.size / 1024;
        const saved = originalSizeKB - newSizeKB;
        totalSaved += saved;
        
        console.log(`Optimized ${file}: ${originalSizeKB.toFixed(1)} KB -> ${newSizeKB.toFixed(1)} KB (Saved: ${saved.toFixed(1)} KB)`);
      } catch (err) {
        console.error(`Failed to compress ${file}:`, err);
      }
    }
  }
  console.log(`Image optimization complete! Total storage saved: ${(totalSaved / 1024).toFixed(2)} MB`);
}

compressAll();
