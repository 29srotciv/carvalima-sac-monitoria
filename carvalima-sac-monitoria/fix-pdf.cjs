const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let s = fs.readFileSync(file, 'utf8');
const MARKER = 'PDF A4 portrait isolated fix v4';

const start = s.indexOf('const handleExportPDF = async');
const end = s.indexOf('  return (', start);
if (start < 0 || end < 0) throw new Error('Função handleExportPDF não encontrada.');

let pdf = s.slice(start, end);
if (pdf.includes(MARKER)) {
  console.log('PDF A4 retrato: correção já aplicada.');
  process.exit(0);
}

pdf = pdf.replace("      container.style.padding = '24px';", "      container.style.padding = '0';");
pdf = pdf.replace(/      container\.style\.width = '1120px';/,
`      /* ${MARKER}: renderização isolada em largura fixa, sem depender de mm no HTML. */
      container.style.width = '794px';
      container.style.maxWidth = '794px';
      container.style.margin = '0';
      container.style.position = 'absolute';
      container.style.left = '-10000px';
      container.style.top = '0';`);
pdf = pdf.replace(/      \/\* PDF A4 landscape fix v2:[\s\S]*?      container\.style\.left = '0';/,
`      /* ${MARKER}: renderização isolada em largura fixa, sem depender de mm no HTML. */
      container.style.width = '794px';
      container.style.maxWidth = '794px';
      container.style.margin = '0';
      container.style.position = 'absolute';
      container.style.left = '-10000px';
      container.style.top = '0';`);

pdf = pdf.replace(/          \* \{ box-sizing: border-box; \}\n          \.pdf-section, \.pdf-kpi, \.pdf-monitoria \{ page-break-inside: avoid; break-inside: avoid; \}\n          h1, h2, h3, p \{ page-break-after: avoid; \}/,
`          * { box-sizing: border-box; }
          @page { size: A4 portrait; margin: 0; }
          html, body { margin: 0 !important; padding: 0 !important; }
          .pdf-report { width: 794px; max-width: 794px; margin: 0; padding: 24px; overflow: visible; box-sizing: border-box; }
          .pdf-page { width: 794px; min-height: 1123px; padding: 30px; margin: 0; box-sizing: border-box; }
          .pdf-section, .pdf-kpi { page-break-inside: avoid; break-inside: avoid; }
          .pdf-monitoria { page-break-inside: auto; break-inside: auto; }
          h1, h2, h3, p { page-break-after: avoid; }
          .pdf-monitoria * { max-width: 100%; }
          .pdf-monitoria-list { display: block; }
          .pdf-monitoria-list > .pdf-monitoria { margin-bottom: 12px; }
          .pdf-meta-row { display: flex; flex-wrap: wrap; gap: 10px 15px; }`);

pdf = pdf.replace(/@page \{ size: A4 landscape; margin: 8mm; \}/g, '@page { size: A4 portrait; margin: 0; }');
pdf = pdf.replace(/\.pdf-report \{ width: 281mm; max-width: 281mm; margin: 0; padding: 0; overflow: visible; \}/g,
  '.pdf-report { width: 794px; max-width: 794px; margin: 0; padding: 24px; overflow: visible; box-sizing: border-box; }');
pdf = pdf.replace(/\.pdf-section, \.pdf-kpi, \.pdf-monitoria \{ page-break-inside: avoid; break-inside: avoid; \}/g,
  '.pdf-section, .pdf-kpi { page-break-inside: avoid; break-inside: avoid; }\n          .pdf-monitoria { page-break-inside: auto; break-inside: auto; }');

pdf = pdf.replace('<div class="pdf-report" style="width: 281mm; max-width: 281mm; margin: 0; padding: 0;">',
  '<div class="pdf-report" style="width: 794px; max-width: 794px; margin: 0; padding: 24px; box-sizing: border-box;">');
if (!pdf.includes('class="pdf-report"')) {
  pdf = pdf.replace('<!-- Cabeçalho Institucional -->',
    '<div class="pdf-report" style="width: 794px; max-width: 794px; margin: 0; padding: 24px; box-sizing: border-box;">\n        <!-- Cabeçalho Institucional -->');
}

pdf = pdf.replace(/<div style="display: flex; flex-direction: column; gap: 12px;">/g,
  '<div class="pdf-monitoria-list">');
pdf = pdf.replace(/<div style="display: flex; gap: 15px; font-size: 10px; margin-bottom: 6px;">/g,
  '<div class="pdf-meta-row" style="display: flex; flex-wrap: wrap; gap: 10px 15px; font-size: 10px; margin-bottom: 6px;">');

const footer = `        <div style="margin-top: 30px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          Carvalima Transportes — Sistema Integrado de Gestão de Qualidade V2 • Movidos pela confiança
        </div>`;
if (pdf.includes(footer)) {
  const afterFooter = pdf.indexOf(footer) + footer.length;
  if (!pdf.slice(afterFooter).includes('</div>')) {
    pdf = pdf.slice(0, afterFooter) + '\n        </div>' + pdf.slice(afterFooter);
  }
}

pdf = pdf.replace(/windowWidth: 1120/g, 'windowWidth: 794');
pdf = pdf.replace(/windowWidth: 1062/g, 'windowWidth: 794');
pdf = pdf.replace(/width: 1062/g, 'width: 794');
if (!pdf.includes('windowWidth: 794,\n          width: 794')) {
  pdf = pdf.replace(/windowWidth: 794,/, 'windowWidth: 794,\n          width: 794,');
}
pdf = pdf.replace(/const clonedContainer = clonedDoc\.querySelector\([\s\S]*?\n          \}/,
`const clonedReport = clonedDoc.querySelector('.pdf-report');
            if (clonedReport) {
              clonedReport.style.width = '794px';
              clonedReport.style.maxWidth = '794px';
              clonedReport.style.margin = '0';
            }
          }`);

pdf = pdf.replace(/margin: \[8, 8, 10, 8\]/g, 'margin: [10, 10, 10, 10]');
pdf = pdf.replace(/orientation: 'landscape'/g, "orientation: 'portrait'");

if (!pdf.includes(MARKER)) throw new Error('Marcador da nova correção não foi aplicado.');
if (!pdf.includes("orientation: 'portrait'")) throw new Error('Orientação portrait não foi aplicada.');
if (!pdf.includes("container.style.width = '794px';")) throw new Error('Largura 794px não foi aplicada.');
if (!pdf.includes('class="pdf-report"')) throw new Error('Wrapper pdf-report não foi aplicado.');

s = s.slice(0, start) + pdf + s.slice(end);
fs.writeFileSync(file, s, 'utf8');
console.log('PDF A4 retrato: correção v4 aplicada com sucesso.');
