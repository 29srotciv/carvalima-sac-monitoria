const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let s = fs.readFileSync(file, 'utf8');
const MARK = 'CARVALIMA_TOKEN_COMPAT_V1';
if (s.includes(MARK)) {
  console.log('Compatibilidade de token já aplicada.');
  process.exit(0);
}

// Compatibilidade entre as duas convenções que já foram usadas pelos Apps Scripts:
// token e tokenSeguranca. O valor continua sendo o mesmo segredo configurado pelo usuário.
s = s.replace(
  "        token: config.gasToken,\n        action: 'sync',",
  "        token: String(config.gasToken || '').trim(),\n        tokenSeguranca: String(config.gasToken || '').trim(),\n        action: 'sync',"
);

// Se o Apps Script responder texto/HTML em vez de JSON, mostrar uma mensagem útil em vez de um erro genérico.
s = s.replace(
  "      const result = await response.json();\n      if (result.success) {",
  "      const rawResponse = await response.text();\n      let result;\n      try { result = JSON.parse(rawResponse); } catch {\n        throw new Error(`O Web App respondeu algo que não é JSON (HTTP ${response.status}). Verifique se a implantação está como Web App e acessível para quem possui o link.`);\n      }\n      if (result.success) {"
);

s += `\n/* ${MARK} */\n`;
fs.writeFileSync(file, s, 'utf8');
console.log('Compatibilidade de token aplicada.');
