const fs=require('fs');
const path=require('path');
const appFile=path.join(__dirname,'src','App.jsx');

let s=fs.readFileSync(appFile,'utf8');
const MARK='CARVALIMA_SUPERVISOR_REPORTS_V1';

if(!s.includes(MARK)){
  const imp="import SupervisorFeedbackView from './SupervisorFeedbackView';";
  if(!s.includes("import SupervisorReportView from './SupervisorReportView';")){
    if(!s.includes(imp)) throw new Error('Import do SupervisorFeedbackView não encontrado.');
    s=s.replace(imp,imp+"\nimport SupervisorReportView from './SupervisorReportView';");
  }

  const feedbackTab='<SidebarButton active={currentTab === \'feedback\'} onClick={() => { setCurrentTab(\'feedback\'); setMonitoriaEditando(null); setRascunhoEditando(null); }} icon={<Icons.CheckSquare />} label="Feedback Supervisor" expanded={sidebarExpanded} />';
  if(s.includes(feedbackTab)&&!s.includes('label="Relatórios Supervisor"')){
    s=s.replace(feedbackTab,feedbackTab+'\n          <SidebarButton active={currentTab === \'relatorios\'} onClick={() => { setCurrentTab(\'relatorios\'); setMonitoriaEditando(null); setRascunhoEditando(null); }} icon={<Icons.CheckSquare />} label="Relatórios Supervisor" expanded={sidebarExpanded} />');
  }

  const view='{currentTab === \'feedback\' && <SupervisorFeedbackView monitorias={monitorias} darkMode={darkMode} onUpdateMonitoria={handleUpdateMonitoria} />}';
  if(s.includes(view)&&!s.includes("currentTab === 'relatorios' && <SupervisorReportView")){
    s=s.replace(view,view+"\n        {currentTab === 'relatorios' && <SupervisorReportView monitorias={monitorias} darkMode={darkMode} departamentos={DEPARTAMENTOS} />}");
  }

  s+='\n/* '+MARK+' */\n';
  fs.writeFileSync(appFile,s,'utf8');
  console.log('Integração dos relatórios de supervisor aplicada.');
}else{
  console.log('Integração dos relatórios de supervisor já aplicada.');
}

// O SupervisorReportView é mantido como fonte JSX estática e validável;
// este script não o modifica durante o build.
