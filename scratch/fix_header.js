import fs from 'fs';

const filePath = 'frontend/src/styles.css';
let content = fs.readFileSync(filePath, 'utf8');

const target = `.tx-nav-wrap {
  max-width: 100%;
  margin: 0 auto;
  height: 84px;
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  border-radius: 0 0 1.2rem 1.2rem;
  padding: 0 3rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-top: none;
  width: min(1280px, calc(100vw - 2rem));
  margin: 0 auto;
}`;

const replacement = `.tx-nav-wrap {
  max-width: 100%;
  margin: 0 auto;
  height: 84px;
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 0 0 1.2rem 1.2rem;
  padding: 0 3rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-top: none;
  width: min(1280px, calc(100vw - 2rem));
  margin: 0 auto;
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: auto; /* Re-enable clicks for the nav content */
}

.tx-header.is-scrolled .tx-nav-wrap {
  height: 72px;
  margin-top: 0.8rem;
  border-radius: 1.2rem;
  width: min(1200px, calc(100vw - 3.2rem));
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(190, 24, 93, 0.12);
}`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated styles.css');
} else {
    console.log('Target string not found in styles.css');
    // Try a more fuzzy match or check line endings
    const targetLF = target.replace(/\r\n/g, '\n');
    const contentLF = content.replace(/\r\n/g, '\n');
    if (contentLF.includes(targetLF)) {
        const newContentLF = contentLF.replace(targetLF, replacement.replace(/\r\n/g, '\n'));
        fs.writeFileSync(filePath, newContentLF);
        console.log('Successfully updated styles.css (normalized line endings)');
    } else {
        console.log('Fuzzy target also not found');
    }
}
