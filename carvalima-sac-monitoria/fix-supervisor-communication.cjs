const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'App.jsx');
let s = fs.readFileSync(file, 'utf8');
const MARK = 'CARVALIMA_SUPERVISOR_COMMUNICATION_V1';
if (s.includes(MARK)) { console.log('Comunicação com supervisores já aplicada.'); process.exit(0); }

s = s.replace(
  "import SupervisorFeedbackView from './SupervisorFeedbackView';",
  "import SupervisorFeedbackView from './SupervisorFeedbackView';\nimport SupervisorCommunicationView from './SupervisorCommunicationView';\nimport SupervisorResponseView from './SupervisorResponseView';"
);

s = s.replace(
  "  const [colaboradores, setColaboradores] = useState([]);",
  "  const [colaboradores, setColaboradores] = useState([]);\n  const [supervisores, setSupervisores] = useState([]);"
);

s = s.replace(
  "      setColaboradores(colabs);",
  "      setColaboradores(colabs);\n      const sups = await StorageService.get('supervisores');\n      setSupervisores(sups);"
);

s = s.replace(
  "      const result = await response.json();\n      if (result.success) {",
  "      const result = await response.json();\n      if (result.success) {\n        if (Array.isArray(result.monitorias)) {\n          await StorageService.saveAll('monitorias', result.monitorias);\n          setMonitorias(result.monitorias.sort((a,b) => new Date(b.dataAtendimento || 0) - new Date(a.dataAtendimento || 0)));\n        }"
);

s = s.replace(
  "  const showToast = (message, type = 'success') => setToast({ message, type });",
  "  const handleUpdateSupervisores = async (lista) => {\n    await StorageService.saveAll('supervisores', lista);\n    setSupervisores(lista);\n    const cfg = StorageService.getSettings();\n    if (cfg.gasUrl && cfg.gasToken) {\n      const ativos = lista.filter(s => s.ativo !== false);\n      for (const supervisor of ativos) {\n        try {\n          await fetch(cfg.gasUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'saveSupervisor', tokenSeguranca: cfg.gasToken, supervisor }) });\n        } catch (e) { console.warn('Supervisor salvo localmente; falha no espelho remoto.', e); }\n      }\n    }\n  };\n\n  const showToast = (message, type = 'success') => setToast({ message, type });"
);

const gate = "  const publicSupervisorToken = new URLSearchParams(window.location.search).get('supervisor_token');\n  if (publicSupervisorToken) return <SupervisorResponseView />;\n\n";
s = s.replace("  if (loading) return (", gate + "  if (loading) return (");

const sidebarAnchor = '<SidebarButton active={currentTab === \'feedback\'} onClick={() => { setCurrentTab(\'feedback\'); setMonitoriaEditando(null); setRascunhoEditando(null); }} icon={<Icons.CheckSquare />} label="Feedback Supervisor" expanded={sidebarExpanded} />';
const sidebarInsert = sidebarAnchor + "\n          <SidebarButton active={currentTab === 'comunicacao'} onClick={() => { setCurrentTab('comunicacao'); setMonitoriaEditando(null); setRascunhoEditando(null); }} icon={<Icons.CloudSync />} label=\"Supervisores & Retornos\" expanded={sidebarExpanded} />";
if (s.includes(sidebarAnchor) && !s.includes('label="Supervisores & Retornos"')) s = s.replace(sidebarAnchor, sidebarInsert);

const viewAnchor = "{currentTab === 'feedback' && <SupervisorFeedbackView monitorias={monitorias} darkMode={darkMode} onUpdateMonitoria={handleUpdateMonitoria} />}";
const viewInsert = viewAnchor + "\n        {currentTab === 'comunicacao' && <SupervisorCommunicationView monitorias={monitorias} supervisores={supervisores} onUpdateSupervisores={handleUpdateSupervisores} onUpdateMonitoria={handleUpdateMonitoria} darkMode={darkMode} showToast={showToast} />}";
if (s.includes(viewAnchor) && !s.includes("currentTab === 'comunicacao'")) s = s.replace(viewAnchor, viewInsert);

s += `\n/* ${MARK} */\n`;
fs.writeFileSync(file, s, 'utf8');
console.log('Comunicação com supervisores aplicada.');
