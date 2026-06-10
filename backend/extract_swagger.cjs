const fs = require('fs');
const path = require('path');

const routesDir = "c:/Users/YADAV/Desktop/Saksham-mehta/backend/src/routes";
const swaggerDir = "c:/Users/YADAV/Desktop/Saksham-mehta/backend/src/swagger";

if (!fs.existsSync(swaggerDir)) {
  fs.mkdirSync(swaggerDir, { recursive: true });
}

const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.routes.js'));

files.forEach(file => {
  const routeFile = path.join(routesDir, file);
  const content = fs.readFileSync(routeFile, 'utf8');

  // Match JSDoc blocks
  const pattern = /\/\*\*[\s\S]*?\*\/\n*/g;
  let match;
  let swaggerBlocks = [];
  let newContent = content;

  while ((match = pattern.exec(content)) !== null) {
    if (match[0].includes('@swagger')) {
      swaggerBlocks.push(match[0]);
      newContent = newContent.replace(match[0], '');
    }
  }

  if (swaggerBlocks.length > 0) {
    fs.writeFileSync(routeFile, newContent, 'utf8');

    const basename = file.replace('.routes.js', '.swagger.js');
    const swaggerFile = path.join(swaggerDir, basename);
    fs.writeFileSync(swaggerFile, swaggerBlocks.join('\n'), 'utf8');
  }
});

console.log("Extraction complete.");
