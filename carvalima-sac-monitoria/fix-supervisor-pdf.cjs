const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'SupervisorCommunicationView.jsx');
const templatePath = path.join(__dirname, 'src', 'SupervisorCommunicationPdfV2.txt');
let text = fs.readFileSync(appPath, 'utf8');
const MARK = 'CARVALIMA_SUPERVISOR_PDF_V2';

if (text.includes(MARK)) process.exit(0);

const start = text.indexOf('const makePdf = (m, supervisor) => {');
const endMarker = '\n\nexport default function SupervisorCommunicationView';
const end = text.indexOf(endMarker, start);

if (start < 0 || end < 0) {
  throw new Error('Não foi possível localizar a função makePdf em SupervisorCommunicationView.jsx');
}

const newMakePdf = fs.readFileSync(templatePath, 'utf8').trim();
text = text.slice(0, start) + newMakePdf + text.slice(end);
text += `\n/* ${MARK} */\n`;
fs.writeFileSync(appPath, text, 'utf8');
console.log('PDF de Supervisores atualizado para a versão executiva.');
