const fs = require('fs');
const path = require('path');

function patchDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      patchDirectory(fullPath);
    } else if (file === 'route.ts') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('force-dynamic')) {
        content = `export const dynamic = 'force-dynamic';\n\n` + content;
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Patched: ${fullPath}`);
      }
    }
  }
}

patchDirectory(path.join(__dirname, 'src', 'app', 'api'));
console.log('Semua file API telah berhasil dipatch menjadi dinamis!');
