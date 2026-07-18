const fs = require('fs');
const path = require('path');

// Nama file hasil rekapan
const outputFile = 'zora_summary.txt';

// Folder dan file yang DIABAIKAN agar hasil tidak terlalu besar
const ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'build', 'public', '.supabase'];
const ignoreFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.DS_Store', 'export-kode.js', outputFile];
const ignoreExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.mp4', '.pdf', '.zip'];

function readDirRecursive(dir, level = 0) {
    let results = '';
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                results += `${'  '.repeat(level)}📁 ${file}/\n`;
                results += readDirRecursive(filePath, level + 1);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            if (!ignoreFiles.includes(file) && !ignoreExts.includes(ext)) {
                results += `${'  '.repeat(level)}📄 ${file}\n`;
            }
        }
    }
    return results;
}

function readFilesContent(dir) {
    let content = '';
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                content += readFilesContent(filePath);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            if (!ignoreFiles.includes(file) && !ignoreExts.includes(ext)) {
                content += `\n\n========================================\n`;
                content += `FILE: ${filePath.replace(__dirname, '')}\n`;
                content += `========================================\n\n`;
                content += fs.readFileSync(filePath, 'utf8');
            }
        }
    }
    return content;
}

console.log("Mulai membaca folder proyek ZORA...");
let finalOutput = "=== STRUKTUR FOLDER ===\n\n";
finalOutput += readDirRecursive(__dirname);
finalOutput += "\n\n=== ISI FILE ===\n";
finalOutput += readFilesContent(__dirname);

fs.writeFileSync(outputFile, finalOutput);
console.log(`Selesai! File berhasil dibuat: ${outputFile}`);