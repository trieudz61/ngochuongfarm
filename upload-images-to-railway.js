// Script để upload tất cả hình ảnh từ server/uploads lên Railway
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = 'https://web-production-335ab.up.railway.app';
const UPLOADS_DIR = path.join(__dirname, 'server', 'uploads');

console.log('📤 Uploading images to Railway backend...');

// Get all image files
const imageFiles = fs.readdirSync(UPLOADS_DIR).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
});

console.log(`📊 Found ${imageFiles.length} images to upload:`);
imageFiles.forEach(file => console.log(`   - ${file}`));

// Function to upload a single file
const uploadFile = (filePath, fileName) => {
  return new Promise((resolve, reject) => {
    const boundary = '----formdata-boundary-' + Math.random().toString(36);
    const fileBuffer = fs.readFileSync(filePath);
    const fileExtension = path.extname(fileName).toLowerCase();
    
    // Determine content type
    let contentType = 'image/jpeg';
    if (fileExtension === '.png') contentType = 'image/png';
    if (fileExtension === '.gif') contentType = 'image/gif';
    if (fileExtension === '.webp') contentType = 'image/webp';

    // Create form data
    const formData = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="image"; filename="${fileName}"`,
      `Content-Type: ${contentType}`,
      '',
      ''
    ].join('\r\n');

    const endBoundary = `\r\n--${boundary}--\r\n`;
    
    const formDataBuffer = Buffer.from(formData, 'utf8');
    const endBoundaryBuffer = Buffer.from(endBoundary, 'utf8');
    
    const totalLength = formDataBuffer.length + fileBuffer.length + endBoundaryBuffer.length;

    const options = {
      hostname: 'web-production-335ab.up.railway.app',
      port: 443,
      path: '/api/products/upload-image',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalLength
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300 && response.success) {
            resolve({
              originalName: fileName,
              uploadedUrl: response.data.url || response.data.imageUrl,
              success: true
            });
          } else {
            reject(new Error(`Upload failed: ${response.error || data}`));
          }
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}, Response: ${data}`));
        }
      });
    });

    req.on('error', reject);

    // Write the multipart form data
    req.write(formDataBuffer);
    req.write(fileBuffer);
    req.write(endBoundaryBuffer);
    req.end();
  });
};

// Upload all images
async function uploadAllImages() {
  const results = {
    success: [],
    failed: []
  };

  console.log('\n🚀 Starting upload process...\n');

  for (let i = 0; i < imageFiles.length; i++) {
    const fileName = imageFiles[i];
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    try {
      console.log(`📤 Uploading ${i + 1}/${imageFiles.length}: ${fileName}...`);
      const result = await uploadFile(filePath, fileName);
      console.log(`✅ Success: ${result.uploadedUrl}`);
      results.success.push(result);
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Failed: ${fileName} - ${error.message}`);
      results.failed.push({ fileName, error: error.message });
    }
  }

  // Summary
  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successful uploads: ${results.success.length}`);
  console.log(`❌ Failed uploads: ${results.failed.length}`);

  if (results.success.length > 0) {
    console.log('\n✅ Successfully uploaded images:');
    results.success.forEach(item => {
      console.log(`   ${item.originalName} → ${item.uploadedUrl}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed uploads:');
    results.failed.forEach(item => {
      console.log(`   ${item.fileName}: ${item.error}`);
    });
  }

  // Save mapping to file for reference
  const mapping = {
    uploadDate: new Date().toISOString(),
    successful: results.success,
    failed: results.failed
  };
  
  fs.writeFileSync('image-upload-mapping.json', JSON.stringify(mapping, null, 2));
  console.log('\n💾 Upload mapping saved to image-upload-mapping.json');

  return results;
}

uploadAllImages().catch(console.error);