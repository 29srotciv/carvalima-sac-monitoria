const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'carvalima-sac-monitoria', 'src', 'App.jsx');
let text = fs.readFileSync(appPath, 'utf8');

if (text.includes('CARVALIMA_SUPERVISOR_COMMUNICATION_V1')) process.exit(0);

const importMarker = "import SupervisorCommunicationView from './SupervisorCommunicationView';";
if (!text.includes(importMarker)) {
  text = text.replace(/(import[^\n]+;\n)/, `$1${importMarker}\n`);
}

// The communication view contains the Gmail settings tab itself. Keep the existing
// Google Sheets settings untouched and expose Gmail as a first-class configuration tab.
// This patch only adds the integration state/handlers and navigation; the view owns its UI.

if (!text.includes("gmailUrl")) {
  text = text.replace(
    "const [supervisores, setSupervisores] = useState([]);",
    "const [supervisores, setSupervisores] = useState([]);\n  const [gmailConfigured, setGmailConfigured] = useState(false);"
  );
}

// If the previous patch already injected communication state under a different shape,
// do not duplicate it. The actual Gmail configuration is persisted by GmailScriptSettingsView.

const sidebarNeedle = "label: 'Supervisores & Retornos'";
if (!text.includes(sidebarNeedle)) {
  // Try common sidebar item arrays used by the app.
  text = text.replace(
    /(label:\s*['\"]Configurações['\"][^\n]*\n?[^}]*})/,
    `$1,\n    { id: 'comunicacao', label: 'Supervisores & Retornos', icon: '✉' }`
  );
}

if (!text.includes("currentTab === 'comunicacao'")) {
  text = text.replace(
    /(<[^>]*\bcurrentTab\b[^>]*\/>)/,
    `$1\n      {currentTab === 'comunicacao' && <SupervisorCommunicationView monitorias={monitorias} supervisores={supervisores} onUpdateSupervisores={handleUpdateSupervisores} onUpdateMonitoria={handleUpdateMonitoria} darkMode={darkMode} showToast={showToast} />} `
  );
}

text += "\n/* CARVALIMA_SUPERVISOR_COMMUNICATION_V1 */\n";
fs.writeFileSync(appPath, text);
