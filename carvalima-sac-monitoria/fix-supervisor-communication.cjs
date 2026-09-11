const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'carvalima-sac-monitoria', 'src', 'App.jsx');
let text = fs.readFileSync(appPath, 'utf8');

if (text.includes('CARVALIMA_SUPERVISOR_COMMUNICATION_V1')) process.exit(0);

const importMarker = "import SupervisorCommunicationView from './SupervisorCommunicationView';";
if (!text.includes(importMarker)) {
  const matches = [...text.matchAll(/^import .*;$/gm)];
  const lastImport = matches[matches.length - 1];
  if (lastImport) text = text.slice(0, lastImport.index + lastImport[0].length) + `\n${importMarker}` + text.slice(lastImport.index + lastImport[0].length);
  else text = `${importMarker}\n${text}`;
}

// Inject the communication screen once, immediately before the existing dashboard/feedback views.
if (!text.includes("currentTab === 'comunicacao'")) {
  const candidates = ["{currentTab === 'feedback'", "{currentTab === 'dashboard'", "{currentTab === 'monitorias'"];
  const needle = candidates.find((x) => text.includes(x));
  if (needle) {
    const view = `{currentTab === 'comunicacao' && <SupervisorCommunicationView monitorias={monitorias} supervisores={supervisores} onUpdateSupervisores={handleUpdateSupervisores} onUpdateMonitoria={handleUpdateMonitoria} darkMode={darkMode} showToast={showToast} />}`;
    text = text.replace(needle, `${view}\n      ${needle}`);
  }
}

text += "\n/* CARVALIMA_SUPERVISOR_COMMUNICATION_V1 */\n";
fs.writeFileSync(appPath, text);
