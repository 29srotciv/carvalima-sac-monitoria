const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'ModernDashboard.jsx');
let s = fs.readFileSync(file, 'utf8');
const MARK = 'CARVALIMA_ACTION_PLAN_V1';
if (s.includes(MARK)) {
  console.log('Plano de ação V1 já aplicado.');
  process.exit(0);
}

const helper = `
// ${MARK}
const actionPlanDate = (m) => m?.prazoPlano || '';
const actionPlanState = (m) => m?.statusPlano || (m?.planoAcao ? 'Pendente' : '');
const actionPlanPriority = (m) => {
  if (!m?.planoAcao) return 'Sem plano';
  if (actionPlanState(m) === 'Concluído') return 'Concluído';
  if (!actionPlanDate(m)) return 'Sem prazo';
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(`${actionPlanDate(m)}T00:00:00`);
  if (!Number.isNaN(due.getTime()) && due < today) return 'Atrasado';
  if (!Number.isNaN(due.getTime()) && Math.ceil((due - today) / 86400000) <= 3) return 'Próximo do prazo';
  return 'No prazo';
};
const actionPlanDays = (m) => {
  if (!actionPlanDate(m)) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(`${actionPlanDate(m)}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  return Math.ceil((due - today) / 86400000);
};
`;

if (!s.includes('const actionPlanDate =')) {
  s = s.replace('const evaluationEntries = (m) => {', helper + '\nconst evaluationEntries = (m) => {');
}

const endNeedle = "  const ranking = useMemo(() => {";
const actionMemo = `  const actionPlans = useMemo(() => filtered.filter(m => m?.planoAcao && actionPlanState(m) !== 'Concluído').map(m => ({ monitoria: m, prioridade: actionPlanPriority(m), dias: actionPlanDays(m) })).sort((a, b) => { const rank = { 'Atrasado': 0, 'Próximo do prazo': 1, 'Sem prazo': 2, 'No prazo': 3 }; return (rank[a.prioridade] ?? 9) - (rank[b.prioridade] ?? 9) || (a.dias ?? 999) - (b.dias ?? 999); }).slice(0, 8), [filtered]);\n`;
if (!s.includes('const actionPlans = useMemo')) {
  const pos = s.indexOf(endNeedle);
  if (pos < 0) throw new Error('Âncora do ranking não encontrada.');
  s = s.slice(0, pos) + actionMemo + s.slice(pos);
}

const panelNeedle = '<section className="grid grid-cols-1 xl:grid-cols-2 gap-5"><Panel title="Ranking de colaboradores"';
const actionSection = `<section className="rounded-2xl border p-5 shadow-sm"><div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4"><div><span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Gestão de melhoria</span><h2 className="text-lg font-black mt-1">Planos de ação</h2><p className="text-[10px] text-slate-400">Acompanhe pendências, prazos e conclusão das ações definidas nas monitorias.</p></div><div className="flex gap-2"><span className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 text-[10px] font-black">{actionPlans.length} pendentes</span></div></div>{actionPlans.length ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{actionPlans.map(({ monitoria: m, prioridade, dias }) => <div key={m.id} className="rounded-xl border border-slate-100 dark:border-[#24313B] p-4"><div className="flex items-start gap-3"><div className=\`w-9 h-9 rounded-xl grid place-items-center text-[9px] font-black \${prioridade === 'Atrasado' ? 'bg-rose-500/10 text-rose-500' : prioridade === 'Próximo do prazo' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}\`}>{prioridade === 'Atrasado' ? '!' : '→'}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><b className="text-xs truncate">{m.agente || 'Sem colaborador'}</b><span className="text-[8px] text-slate-400">{m.id}</span></div><p className="text-[10px] mt-2 leading-relaxed">{m.planoAcao}</p><div className="flex flex-wrap gap-2 mt-3"><span className=\`px-2 py-1 rounded-lg text-[8px] font-black \${prioridade === 'Atrasado' ? 'bg-rose-500/10 text-rose-500' : prioridade === 'Próximo do prazo' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}\`}>{prioridade}</span>{m.prazoPlano && <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[8px] font-bold">Prazo: {new Date(`${m.prazoPlano}T00:00:00`).toLocaleDateString('pt-BR')}</span>}{dias !== null && <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[8px] font-bold">{dias < 0 ? `${Math.abs(dias)} dia(s) em atraso` : dias === 0 ? 'Vence hoje' : `${dias} dia(s)`}</span>}</div></div><button onClick={() => onUpdateMonitoria?.({ ...m, statusPlano: 'Concluído', updated_at: new Date().toISOString() })} className="shrink-0 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-[9px] font-black">Concluir</button></div></div>)}</div> : <Empty text="Nenhum plano de ação pendente na visão atual."/>}</section>`;
if (!s.includes('Gestão de melhoria</span><h2 className="text-lg font-black mt-1">Planos de ação')) {
  const pos = s.indexOf(panelNeedle);
  if (pos < 0) throw new Error('Âncora do ranking não encontrada para o painel de planos.');
  s = s.slice(0, pos) + actionSection + s.slice(pos);
}

fs.writeFileSync(file, s, 'utf8');
console.log('Plano de ação V1 aplicado.');
