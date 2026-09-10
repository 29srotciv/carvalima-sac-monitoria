const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let s = fs.readFileSync(file, 'utf8');

// Atualiza a correção anterior (paisagem) para A4 retrato.
if (s.includes('PDF A4 landscape fix v2')) {
  s = s.replace(
    "/* PDF A4 landscape fix v2: largura útil compatível com A4 horizontal. */\n      container.style.width = '281mm';\n      container.style.maxWidth = '281mm';",
    "/* PDF A4 portrait fix v3: largura útil compatível com A4 vertical. */\n      container.style.width = '194mm';\n      container.style.maxWidth = '194mm';"
  );

  s = s.replace("@page { size: A4 landscape; margin: 8mm; }", "@page { size: A4 portrait; margin: 8mm; }");
  s = s.replace(".pdf-report { width: 281mm; max-width: 281mm;", ".pdf-report { width: 194mm; max-width: 194mm;");
  s = s.replace("<div class=\"pdf-report\" style=\"width: 281mm; max-width: 281mm;", "<div class=\"pdf-report\" style=\"width: 194mm; max-width: 194mm;");
  s = s.replace("clonedReport.style.width = '281mm';", "clonedReport.style.width = '194mm';");
  s = s.replace("clonedReport.style.maxWidth = '281mm';", "clonedReport.style.maxWidth = '194mm';");
  s = s.replace("windowWidth: 1062,\n          width: 1062,", "windowWidth: 733,\n          width: 733,");

  s = s.replace("format: 'a4',\n        orientation: 'landscape'", "format: 'a4',\n        orientation: 'portrait'");

  // Remove the old landscape marker so this script remains idempotent.
  s = s.replace('PDF A4 landscape fix v2', 'PDF A4 portrait fix v3');

  fs.writeFileSync(file, s, 'utf8');
  console.log('PDF A4: alterado de paisagem para retrato com sucesso.');
  process.exit(0);
}

// Caso a correção anterior ainda não esteja no App.jsx, aplica uma correção mínima
// diretamente sobre a configuração original do PDF.
if (s.includes("orientation: 'landscape'")) {
  s = s.replace("orientation: 'landscape'", "orientation: 'portrait'");
}

if (s.includes("container.style.width = '1120px';")) {
  s = s.replace(
    "container.style.width = '1120px';",
    "/* PDF A4 portrait fix v3: largura útil compatível com A4 vertical. */\n      container.style.width = '194mm';\n      container.style.maxWidth = '194mm';"
  );
}

if (s.includes('windowWidth: 1120')) {
  s = s.replace('windowWidth: 1120', 'windowWidth: 733,\n          width: 733');
}

if (s.includes('PDF A4 portrait fix v3') || s.includes("orientation: 'portrait'")) {
  fs.writeFileSync(file, s, 'utf8');
  console.log('PDF A4: configuração em retrato aplicada.');
  process.exit(0);
}

throw new Error('Não foi possível localizar a configuração da exportação PDF.');
