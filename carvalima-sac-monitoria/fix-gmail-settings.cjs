const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let text = fs.readFileSync(file, 'utf8');
const MARK = 'CARVALIMA_GMAIL_SETTINGS_V1';
if (text.includes(MARK)) process.exit(0);

const importMarker = "import GmailScriptSettingsView from './GmailScriptSettingsView';";
if (!text.includes(importMarker)) {
  text = text.replace("import React, { useState, useMemo, useEffect, useRef } from 'react';", "import React, { useState, useMemo, useEffect, useRef } from 'react';\n" + importMarker);
}

if (!text.includes("currentTab === 'gmail'")) {
  const anchor = "          <SidebarButton active={currentTab === 'configuracoes'";
  const item = "          <SidebarButton active={currentTab === 'gmail'} onClick={() => { setCurrentTab('gmail'); setMonitoriaEditando(null); }} icon={<Icons.Settings />} label=\"Script Gmail\" expanded={sidebarExpanded} />\n";
  if (text.includes(anchor)) text = text.replace(anchor, item + anchor);

  const viewAnchor = "        {currentTab === 'configuracoes'";
  const view = "        {currentTab === 'gmail' && <GmailScriptSettingsView darkMode={darkMode} showToast={showToast} />}\n";
  if (text.includes(viewAnchor)) text = text.replace(viewAnchor, view + viewAnchor);
}

text += `\n/* ${MARK} */\n`;
fs.writeFileSync(file, text, 'utf8');
console.log('Configuração do Script Gmail integrada.');
