// Script untuk membantu deployment
import fs from 'fs';
import path from 'path';

// Function untuk membuat .env template
function createEnvTemplate() {
  const envTemplate = `# Environment Variables untuk Deployment
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=5000

# Untuk development (tidak perlu diubah)
# DATABASE_URL sudah di-set otomatis oleh Replit
`;

  fs.writeFileSync('.env.example', envTemplate);
  console.log('✅ File .env.example dibuat!');
}

// Function untuk cek konfigurasi deployment
function checkDeployConfig() {
  const requiredFiles = [
    'railway.toml',
    'render.yaml', 
    'koyeb.yaml',
    'netlify.toml'
  ];

  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - OK`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  });

  if (allFilesExist) {
    console.log('\n🎉 Semua file konfigurasi deployment ready!');
    console.log('📖 Baca DEPLOYMENT_GUIDE.md untuk panduan lengkap');
  } else {
    console.log('\n⚠️  Beberapa file konfigurasi hilang');
  }
}

// Run based on command line argument
const command = process.argv[2];

switch(command) {
  case 'create-env':
    createEnvTemplate();
    break;
  case 'check-deploy':
    checkDeployConfig();
    break;
  default:
    console.log('Available commands:');
    console.log('  npm run create-env  - Buat template .env');
    console.log('  npm run check-deploy - Cek konfigurasi deployment');
}