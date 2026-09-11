const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let text = fs.readFileSync(appPath, 'utf8');
const MARK = 'CARVALIMA_SUPERVISOR_COMMUNICATION_V2';
if (text.includes(MARK)) process.exit(0);

const importMarker = "import SupervisorCommunicationView from './SupervisorCommunicationView';";
if (!text.includes(importMarker)) {
  text = text.replace("import React, { useState, useMemo, useEffect, useRef } from 'react';", "import React, { useState, useMemo, useEffect, useRef } from 'react';\n" + importMarker);
}

if (!text.includes('const [supervisores, setSupervisores]')) {
  text = text.replace("  const [colaboradores, setColaboradores] = useState([]);", "  const [colaboradores, setColaboradores] = useState([]);\n  const [supervisores, setSupervisores] = useState([]);");
}

if (!text.includes("localStorage.getItem('carvalima_qa_supervisores')")) {
  text = text.replace("      setColaboradores(colabs);", "      setColaboradores(colabs);\n      try {\n        const savedSup = JSON.parse(localStorage.getItem('carvalima_qa_supervisores') || '[]');\n        setSupervisores(Array.isArray(savedSup) ? savedSup : []);\n      } catch { setSupervisores([]); }");
}

if (!text.includes('const handleUpdateSupervisores = async')) {
  const anchor = "  const handleSave = async (monitoria) => {";
  const handlers = `  const handleUpdateSupervisores = async (items) => {\n    const next = Array.isArray(items) ? items : [];\n    setSupervisores(next);\n    localStorage.setItem('carvalima_qa_supervisores', JSON.stringify(next));\n  };\n\n  const handleUpdateMonitoria = async (updated) => {\n    await StorageService.saveItem('monitorias', updated);\n    const atualizadas = await StorageService.get('monitorias');\n    setMonitorias(atualizadas.sort((a,b) => new Date(b.dataAtendimento || 0) - new Date(a.dataAtendimento || 0)));\n  };\n\n`;
  if (text.includes(anchor)) text = text.replace(anchor, handlers + anchor);
}

if (!text.includes("currentTab === 'comunicacao'")) {
  const anchor = "        {currentTab === 'dashboard'";
  const view = "        {currentTab === 'comunicacao' && <SupervisorCommunicationView monitorias={monitorias} supervisores={supervisores} onUpdateSupervisores={handleUpdateSupervisores} onUpdateMonitoria={handleUpdateMonitoria} darkMode={darkMode} showToast={showToast} />}\n";
  if (text.includes(anchor)) text = text.replace(anchor, view + anchor);
}

if (!text.includes('label="Supervisores & Retornos"')) {
  const anchor = "          <SidebarButton active={currentTab === 'configuracoes'";
  const item = "          <SidebarButton active={currentTab === 'comunicacao'} onClick={() => { setCurrentTab('comunicacao'); setMonitoriaEditando(null); }} icon={<Icons.CheckSquare />} label=\"Supervisores & Retornos\" expanded={sidebarExpanded} />\n";
  if (text.includes(anchor)) text = text.replace(anchor, item + anchor);
}

text += `\n/* ${MARK} */\n`;
fs.writeFileSync(appPath, text, 'utf8');
console.log('Integração de Supervisores & Retornos aplicada.');
