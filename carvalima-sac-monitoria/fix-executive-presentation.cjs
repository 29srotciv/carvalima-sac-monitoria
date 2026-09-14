const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src', 'ModernDashboard.jsx');
let s = fs.readFileSync(file, 'utf8');

const importLine = "import ExecutivePresentationView from './ExecutivePresentationView';";
if (!s.includes(importLine)) {
  s = s.replace(
    "import React, { useMemo, useState } from 'react';",
    "import React, { useMemo, useState } from 'react';\n" + importLine
  );
}

if (!s.includes('const [presentationOpen, setPresentationOpen]')) {
  s = s.replace(
    'const [filtersOpen, setFiltersOpen] = useState(false);',
    'const [filtersOpen, setFiltersOpen] = useState(false); const [presentationOpen, setPresentationOpen] = useState(false);'
  );
}

const reportButton = '<button type="button" onClick={() => setPresentationOpen(true)} className="px-5 py-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-600 text-xs font-black shadow-sm hover:bg-blue-500/20 transition-colors">Relatório executivo</button>';
if (!s.includes('setPresentationOpen(true)')) {
  const target = '<button onClick={onNewMonitoria}';
  if (!s.includes(target)) throw new Error('Botão Nova monitoria não encontrado para inserir Relatório executivo.');
  s = s.replace(target, reportButton + target);
}

const renderMarker = '{/* CARVALIMA_EXECUTIVE_PRESENTATION_RENDER */}';
if (!s.includes(renderMarker)) {
  const target = '<style>{`.dash{width:100%;padding:.6rem .7rem;';
  const idx = s.indexOf(target);
  if (idx < 0) throw new Error('Ponto de renderização do Dashboard não encontrado.');
  const insertAt = s.lastIndexOf('</div>', idx);
  if (insertAt < 0) throw new Error('Container final do Dashboard não encontrado.');
  const overlay = `${renderMarker}{presentationOpen && <ExecutivePresentationView monitorias={filtered} darkMode={darkMode} onClose={() => setPresentationOpen(false)} />}`;
  s = s.slice(0, insertAt) + overlay + s.slice(insertAt);
}

fs.writeFileSync(file, s);
console.log('Executive presentation integration ready.');
