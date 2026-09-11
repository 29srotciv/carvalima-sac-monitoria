const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'carvalima-sac-monitoria', 'src', 'App.jsx');
let text = fs.readFileSync(appPath, 'utf8');

if (text.includes('CARVALIMA_SUPERVISOR_COMMUNICATION_V1')) process.exit(0);

const importMarker = "import SupervisorCommunicationView from './SupervisorCommunicationView';";
if (!text.includes(importMarker)) {
  text = text.replace(/(import[^\n]+;\n)/, `$1${importMarker}\n`);
}

// Expose the communication area. GmailScriptSettingsView is already owned by
// SupervisorCommunicationView, so the Gmail configuration is kept separate from Sheets.
if (!text.includes("currentTab === 'comunicacao'")) {
  const renderNeedle = "{currentTab === 'feedback'";
  if (text.includes(renderNeedle)) {
    text = text.replace(renderNeedle, "{currentTab === 'comunicacao' && <SupervisorCommunicationView monitorias={monitorias} supervisores={supervisores} onUpdateSupervisores={handleUpdateSupervisores} onUpdateMonitoria={handleUpdateMonitoria} darkMode={darkMode} showToast={showToast} />}\n      " + renderNeedle);
  }
}

text += "\n/* CARVALIMA_SUPERVISOR_COMMUNICATION_V1 */\n";
fs.writeFileSync(appPath, text);
