import fs from 'fs';
import path from 'path';

// read all files recursively
function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.ts')) files.push(name);
    }
  }
  return files;
}

const files = getFiles('./src');
console.log('Found TS files:', files);

// delete types folder
fs.rmSync('./src/types', { recursive: true, force: true });
const remainingFiles = files.filter(f => !f.includes('/types/'));

// We will use Babel or just basic regex to strip types.
// Since these files are simple, we can install babel to strip them perfectly.
