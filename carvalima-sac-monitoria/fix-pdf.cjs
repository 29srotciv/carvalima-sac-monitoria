const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let s = fs.readFileSync(file, 'utf8');

if (s.includes('PDF A4 landscape fix v2')) {
  console.log('PDF A4: correção já aplicada.');
  process.exit(0);
}

const widthOld = "      container.style.width = '1120px';";
const widthNew = `      /* PDF A4 landscape fix v2: largura útil compatível com A4 horizontal. */
      container.style.width = '281mm';
      container.style.maxWidth = '281mm';
      container.style.margin = '0';
      container.style.position = 'relative';
      container.style.left = '0';`;

if (!s.includes(widthOld)) throw new Error('Largura original do PDF não encontrada.');
s = s.replace(widthOld, widthNew);

const cssOld = `          * { box-sizing: border-box; }
          .pdf-section, .pdf-kpi, .pdf-monitoria { page-break-inside: avoid; break-inside: avoid; }
          h1, h2, h3, p { page-break-after: avoid; }`;
const cssNew = `          * { box-sizing: border-box; }
          @page { size: A4 landscape; margin: 8mm; }
          html, body { margin: 0 !important; padding: 0 !important; }
          .pdf-report { width: 281mm; max-width: 281mm; margin: 0; padding: 0; overflow: visible; }
          .pdf-section, .pdf-kpi, .pdf-monitoria { page-break-inside: avoid; break-inside: avoid; }
          h1, h2, h3, p { page-break-after: avoid; }
          .pdf-monitoria * { max-width: 100%; }
          .pdf-meta-row { display: flex; flex-wrap: wrap; gap: 10px 15px; }`;
if (!s.includes(cssOld)) throw new Error('CSS original do PDF não encontrado.');
s = s.replace(cssOld, cssNew);

const marker = '<!-- Cabeçalho Institucional -->';
const replacement = `<div class="pdf-report" style="width: 281mm; max-width: 281mm; margin: 0; padding: 0;">
        <!-- Cabeçalho Institucional -->`;
if (!s.includes(marker)) throw new Error('Cabeçalho do PDF não encontrado.');
s = s.replace(marker, replacement);

const metaOld = `            <div style="display: flex; gap: 15px; font-size: 10px; margin-bottom: 6px;">`;
const metaNew = `            <div class="pdf-meta-row" style="display: flex; flex-wrap: wrap; gap: 10px 15px; font-size: 10px; margin-bottom: 6px;">`;
if (!s.includes(metaOld)) throw new Error('Metadados do PDF não encontrados.');
s = s.replace(metaOld, metaNew);

const footerOld = `        <div style="margin-top: 30px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          Carvalima Transportes — Sistema Integrado de Gestão de Qualidade V2 • Movidos pela confiança
        </div>
      \`;`;
const footerNew = `        <div style="margin-top: 30px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          Carvalima Transportes — Sistema Integrado de Gestão de Qualidade V2 • Movidos pela confiança
        </div>
        </div>
      \`;`;
if (!s.includes(footerOld)) throw new Error('Rodapé do PDF não encontrado.');
s = s.replace(footerOld, footerNew);

const canvasOld = '          windowWidth: 1120';
const canvasNew = `          windowWidth: 1062,
          width: 1062,
          onclone: (clonedDoc) => {
            const clonedReport = clonedDoc.querySelector('.pdf-report');
            if (clonedReport) {
              clonedReport.style.width = '281mm';
              clonedReport.style.maxWidth = '281mm';
              clonedReport.style.margin = '0';
            }
          }`;
if (!s.includes(canvasOld)) throw new Error('Configuração html2canvas original não encontrada.');
s = s.replace(canvasOld, canvasNew);

fs.writeFileSync(file, s, 'utf8');
console.log('PDF A4: correção aplicada com sucesso.');
