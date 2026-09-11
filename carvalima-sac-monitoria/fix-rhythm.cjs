const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'ModernDashboard.jsx');
let s = fs.readFileSync(file, 'utf8');
const MARK = 'CARVALIMA_RITMO_META_DIARIA_V2';
if (s.includes(MARK)) {
  console.log('Ritmo da monitoria V2 já aplicado.');
  process.exit(0);
}

const oldCalc = "const total = filtered.length; const avg = total ? filtered.reduce((s, m) => s + scoreOf(m), 0) / total : 0;";
const newCalc = [
  'const total = filtered.length; const avg = total ? filtered.reduce((s, m) => s + scoreOf(m), 0) / total : 0;',
  "  const metaDepartamento = filters?.departamento && filters.departamento !== 'TODOS' ? (metas?.[filters.departamento] || metas?.TOTAL || {}) : (metas?.TOTAL || {});",
  '  const metaDiaria = Math.max(0, Number(metaDepartamento?.dia || 0));',
  '  const metaMensal = Math.max(0, Number(metaDepartamento?.mes || (metaDiaria * 20) || 0));',
  "  const localDate = (value) => { const d = new Date(value); return Number.isNaN(d.getTime()) ? '' : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };",
  '  const businessDays = (start, end) => { let count = 0; if (!start || !end || start > end) return 0; const d = new Date(start + "T12:00:00"); const last = new Date(end + "T12:00:00"); while (d <= last) { const day = d.getDay(); if (day !== 0 && day !== 6) count++; d.setDate(d.getDate() + 1); } return count; };',
  '  const firstDayMonth = currentMonth + "-01";',
  '  const ritmoRange = (() => {',
  "    if (filters?.periodo === 'HOJE') return { start: localToday, end: localToday };",
  "    if (filters?.periodo === 'ESTE_MES') return { start: firstDayMonth, end: localToday };",
  '    if (filters?.periodo === "ULTIMOS_7") { const d = new Date(localToday + "T12:00:00"); d.setDate(d.getDate() - 6); return { start: localDate(d), end: localToday }; }',
  '    if (filters?.periodo === "ULTIMOS_30") { const d = new Date(localToday + "T12:00:00"); d.setDate(d.getDate() - 29); return { start: localDate(d), end: localToday }; }',
  "    if (filters?.dataInicio || filters?.dataFim) return { start: filters.dataInicio || firstDayMonth, end: filters.dataFim || localToday };",
  '    return { start: firstDayMonth, end: localToday };',
  '  })();',
  '  const diasUteisRitmo = businessDays(ritmoRange.start, ritmoRange.end);',
  '  const metaEsperadaRitmo = metaDiaria * diasUteisRitmo;',
  '  const realizadoRitmo = filtered.filter(m => { const d = dateOf(m); return d >= ritmoRange.start && d <= ritmoRange.end; }).length;',
  '  const atingimentoRitmo = metaEsperadaRitmo > 0 ? realizadoRitmo / metaEsperadaRitmo * 100 : 0;',
  '  const realizadoHoje = filtered.filter(m => dateOf(m) === localToday).length;',
  "  const ritmoStatus = metaEsperadaRitmo <= 0 ? 'Meta não configurada' : atingimentoRitmo >= 100 ? 'Acima do ritmo' : atingimentoRitmo >= 80 ? 'No ritmo' : 'Abaixo do ritmo';"
].join('\n');

if (!s.includes(oldCalc)) throw new Error('Âncora do cálculo do dashboard não encontrada.');
s = s.replace(oldCalc, newCalc);

const anchor = '<div className="max-w-[1600px] mx-auto p-5 md:p-8 xl:p-10 space-y-5">';
const block = [
  '<section className={`${card} p-4 md:p-5`}>',
  '<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div>',
  '<span className={`text-[9px] uppercase font-black tracking-wider ${muted}`}>Produtividade</span>',
  '<h2 className="text-base font-black mt-1">Ritmo da Monitoria</h2>',
  '<p className={`text-xs mt-1 ${muted}`}>A meta diária é acumulada pelos dias úteis do período selecionado.</p>',
  '</div><div className="text-right"><div className="text-[9px] uppercase font-black text-slate-400">Status</div><div className="text-sm font-black mt-1">{ritmoStatus}</div></div></div>',
  '<div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">',
  '<div className="rounded-xl border p-3"><div className="text-[9px] uppercase font-black text-slate-400">Meta diária</div><div className="text-2xl font-black mt-1">{metaDiaria}</div><div className={`text-[10px] ${muted}`}>monitorias/dia</div></div>',
  '<div className="rounded-xl border p-3"><div className="text-[9px] uppercase font-black text-slate-400">Dias úteis</div><div className="text-2xl font-black mt-1">{diasUteisRitmo}</div><div className={`text-[10px] ${muted}`}>{ritmoRange.start} a {ritmoRange.end}</div></div>',
  '<div className="rounded-xl border p-3"><div className="text-[9px] uppercase font-black text-slate-400">Meta acumulada</div><div className="text-2xl font-black mt-1">{metaEsperadaRitmo}</div><div className={`text-[10px] ${muted}`}>até o momento</div></div>',
  '<div className="rounded-xl border p-3"><div className="text-[9px] uppercase font-black text-slate-400">Realizado</div><div className="text-2xl font-black mt-1">{realizadoRitmo}</div><div className={`text-[10px] ${muted}`}>{realizadoHoje} hoje</div></div>',
  '<div className="rounded-xl border p-3"><div className="text-[9px] uppercase font-black text-slate-400">Atingimento</div><div className="text-2xl font-black mt-1">{fmt(atingimentoRitmo)}%</div><div className={`text-[10px] ${muted}`}>{Math.max(0, metaEsperadaRitmo - realizadoRitmo)} para alcançar o ritmo</div></div>',
  '</div>',
  '<div className="mt-4 h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/60 overflow-hidden"><div className="h-full rounded-full bg-blue-600" style={{ width: Math.min(100, Math.max(0, atingimentoRitmo)) + "%" }} /></div>',
  '<div className={`flex justify-between mt-2 text-[10px] ${muted}`}><span>{filters?.departamento && filters.departamento !== "TODOS" ? filters.departamento : "Meta total"}</span><span>Meta mensal de referência: {metaMensal}</span></div>',
  '</section>'
].join('');
if (!s.includes(anchor)) throw new Error('Âncora visual do dashboard não encontrada.');
s = s.replace(anchor, `${anchor}${block}`);
s += `\n/* ${MARK} */\n`;
fs.writeFileSync(file, s, 'utf8');
console.log('Ritmo da monitoria V2 aplicado com meta diária acumulada.');
