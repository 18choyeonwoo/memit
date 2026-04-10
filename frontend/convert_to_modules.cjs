const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components');

const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it imports a local css file
    const cssMatch = content.match(/import\s+['"]\.\/([^'"]+)\.css['"];/);
    if (cssMatch) {
      const cssName = cssMatch[1];
      const cssFileName = `${cssName}.css`;
      const moduleFileName = `${cssName}.module.css`;
      
      // Prevent running twice
      if (content.includes(`import styles from './${moduleFileName}';`)) {
          return;
      }
      
      // Update the import
      content = content.replace(
        new RegExp(`import\\s+['"]\\.\\/${cssName}\\.css['"];`),
        `import styles from './${moduleFileName}';`
      );
      
      // 1. Replace simple string classNames: className="my-class" -> className={styles['my-class']}
      content = content.replace(/className=(['"])(.*?)\1/g, (match, quote, classes) => {
         const classList = classes.split(' ').map(c => c.trim()).filter(Boolean);
         if (classList.length === 0) return match;
         if (classList.length === 1) {
             return `className={styles['${classList[0]}']}`;
         }
         const dynamicClasses = classList.map(c => `\${styles['${c}']}`).join(' ');
         return `className={\`${dynamicClasses}\`}`;
      });

      // 2. Replace template literal base classes: className={`some-base ${cond ? 'a' : 'b'}`}
      // Only do a simple targeted replacement for the ones we know exist in Sidebar/MyFeedPage
      content = content.replace(/className=\{`([^`\$]+)\s+\$\{/g, (match, baseClass) => {
          const classList = baseClass.split(' ').map(c => c.trim()).filter(Boolean);
          const mapped = classList.map(c => `\${styles['${c}']}`).join(' ');
          return `className={\`${mapped} \${`;
      });
      
      // 3. Replace fixed strings inside ternary: 'active' : ''
      // E.g., ${page === 'settings' ? 'active' : ''} -> ${page === 'settings' ? styles['active'] : ''}
      content = content.replace(/\? '([^']+)' : '([^']*)'/g, (match, trueClass, falseClass) => {
          const mappedTrue = `styles['${trueClass}']`;
          const mappedFalse = falseClass ? `styles['${falseClass}']` : `''`;
          return `? ${mappedTrue} : ${mappedFalse}`;
      });

      fs.writeFileSync(filePath, content, 'utf8');
      
      // Rename CSS file
      const cssPath = path.join(dir, cssFileName);
      const modulePath = path.join(dir, moduleFileName);
      if (fs.existsSync(cssPath)) {
        fs.renameSync(cssPath, modulePath);
      }
      
      console.log(`Converted ${file} to use CSS modules.`);
    }
  }
});
