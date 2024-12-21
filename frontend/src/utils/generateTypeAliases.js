// scripts/generateTypeAliases.js
const fs = require('fs');
const path = require('path');

const inputFilePath = path.resolve(__dirname, '../types/swagger.d.ts');
const outputFilePath = path.resolve(__dirname, '../types/types.ts');

const generateTypeAliases = () => {
  const inputFileContent = fs.readFileSync(inputFilePath, 'utf-8');
  const typeAliasLines = [];

  const regex = /(\w+):\s*{\s*([^}]*)\s*};/g;
  let match;

  while ((match = regex.exec(inputFileContent)) !== null) {
    const typeName = match[1];
    typeAliasLines.push(`export type ${typeName} = components['schemas']['${typeName}'];`);
  }

  const outputFileContent = typeAliasLines.join('\n');
  fs.writeFileSync(outputFilePath, outputFileContent, 'utf-8');
  console.log(`Type aliases generated and saved to ${outputFilePath}`);
};

generateTypeAliases();