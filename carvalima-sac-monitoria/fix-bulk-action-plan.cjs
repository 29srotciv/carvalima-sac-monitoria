const fs=require('fs');const path=require('path');const file=path.join(__dirname,'src','SupervisorFeedbackView.jsx');let s=fs.readFileSync(file,'utf8');const MARK='CARVALIMA_BULK_ACTION_PLAN_V1';if(s.includes(MARK)){console.log('Planos de ação em lote já aplicados.');process.exit(0);}
const helper=`
const buildAutoPlan = m => {
  const failures=[];
  const add=r=>{if(r&&r.atendeu===false&&r.titulo)failures.push(String(r.titulo));};
  Object.values(m?.detalhes||{}).forEach(add);Object.values(m?.respostas||{}).forEach(add);
  (Array.isArray(m?.resumoCriterios)?m.resumoCriterios:[]).forEach(add);
  if(!failures.length){const text=String(m?.feedback||m?.resumo||m?.resumoCriteriosTexto||'');text.split(/\\r?\\n/).map(x=>x.trim()).filter(x=>/^[-•*]\\s*|^\\d+[.)]\\s*/.test(x)).forEach(x=>{if(/oportunidades? de melhoria|pontos? de atenção|plano de ação/i.test(x))return;const t=x.replace(/^[-•*]|^\\d+[.)]/,'').replace(/^\\s*(?:⚠️|❌)\\s*/,'').replace(/\\s*\\([^)]*\\)\\s*$/,'').trim();if(t)failures.push(t);});}
  const unique=[...new Map(failures.map(x=>[norm(x),x])).values()].slice(0,4);
  if(unique.length)return 'Reforçar os seguintes pontos: '+unique.join('; ')+'. Realizar orientação individual, acompanhar as próximas monitorias e validar a evolução até a correção das oportunidades identificadas.';
  if(Number(m?.nota||0)<7)return 'Realizar devolutiva individual, reforçar os padrões de atendimento e acompanhar as próximas monitorias para recuperar o desempenho.';
  if(Number(m?.nota||0)<9)return 'Realizar devolutiva individual, reforçar os pontos de melhoria identificados e acompanhar as próximas monitorias para consolidar a evolução.';
  return 'Manter os padrões de atendimento apresentados e realizar acompanhamento nas próximas monitorias para garantir a consistência do desempenho.';
};
`;
if(!s.includes('const buildAutoPlan'))s=s.replace("const pendentes = useMemo","const norm = v => String(v || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();"+helper+"\n  const pendentes = useMemo");
const target="  const save = async () => { if (!m) return; setSending(true); await onUpdateMonitoria?.({ ...m, feedbackSupervisor: feedback.trim(), statusFeedback: status, feedbackSupervisorAt: new Date().toISOString() }); setSending(false); };";
const replacement=target+`\n  const planosSemRegistro=useMemo(()=>monitorias.filter(x=>!x.planoAcao||!String(x.planoAcao).trim()),[monitorias]);
  const [bulkSaving,setBulkSaving]=useState(false);
  const gerarPlanosEmLote=async()=>{
    if(!planosSemRegistro.length||bulkSaving)return;
    const ok=window.confirm('Gerar automaticamente planos de ação para '+planosSemRegistro.length+' monitorias sem plano registrado? Os planos serão baseados nas falhas e/ou nota de cada monitoria e ficarão como Pendente.');
    if(!ok)return;setBulkSaving(true);
    try{for(const item of planosSemRegistro){await onUpdateMonitoria?.({...item,planoAcao:buildAutoPlan(item),statusPlano:'Pendente',prazoPlano:item.prazoPlano||'',updated_at:new Date().toISOString()});}}finally{setBulkSaving(false);}
  };`;
if(!s.includes('const planosSemRegistro')){if(!s.includes(target))throw new Error('Função save não encontrada.');s=s.replace(target,replacement);}
const needle='<Kpi label="Planos pendentes" value={monitorias.filter(m => m.planoAcao && m.statusPlano !== \'Concluído\').length}/>';
if(!s.includes('Gerar planos automaticamente')){if(!s.includes(needle))throw new Error('KPI de planos não encontrado.');s=s.replace(needle,needle+`<div className="md:col-span-3 flex justify-end"><button onClick={gerarPlanosEmLote} disabled={bulkSaving||!planosSemRegistro.length} className="px-5 py-3 rounded-xl bg-blue-600 text-white text-xs font-black shadow-sm disabled:opacity-50">{bulkSaving?'Gerando planos...':'Gerar planos automaticamente ('+planosSemRegistro.length+')'}</button></div>`);}
s+='\n/* '+MARK+' */\n';fs.writeFileSync(file,s,'utf8');console.log('Planos de ação em lote aplicados.');
