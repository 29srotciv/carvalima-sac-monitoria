import React, { useEffect, useMemo, useRef, useState } from 'react';
const KEY = 'carvalima_qa_drafts';
const oldKey = 'carvalima_qa_active_draft';
const score = (responses, criteria) => criteria.length ? Number((Object.values(responses).filter(x => x?.atendeu === true).length / criteria.length * 10).toFixed(1)) : 0;
const status = n => n >= 9 ? 'Conforme' : n >= 7 ? 'Em Atenção' : 'Crítico';
const norm = (v = '') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const nextMonitoriaId = (monitorias = []) => {
  const year = String(new Date().getFullYear());
  const pattern = new RegExp(`^${year}([1-9]\\d*)$`);
  let maxSequence = 0;
  monitorias.forEach(m => {
    const match = String(m?.id || '').trim().match(pattern);
    if (match) maxSequence = Math.max(maxSequence, Number(match[1]));
  });
  return `${year}${maxSequence + 1}`;
};
const extractSummaryCriteria = (text, criteria) => {
  const raw = String(text || '');
  if (!raw) return {};
  const lines = raw.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const negativeStart = lines.findIndex(x => /oportunidades?\s+de\s+melhoria|pontos?\s+de\s+aten[cç][aã]o|falhas?|n[aã]o\s+conforme/i.test(x));
  const positiveStart = lines.findIndex(x => /pontos?\s+positivos?|pontos?\s+fortes?/i.test(x));
  const actionStart = lines.findIndex((x, i) => i > Math.max(negativeStart, positiveStart) && /plano\s+de\s+a[cç][aã]o|plano\s+de\s+ação\s+sugerido/i.test(x));
  const negativeLines = negativeStart >= 0 ? lines.slice(negativeStart + 1, actionStart >= 0 ? actionStart : lines.length) : [];
  const positiveLines = positiveStart >= 0 ? lines.slice(positiveStart + 1, negativeStart >= 0 ? negativeStart : (actionStart >= 0 ? actionStart : lines.length)) : [];
  const out = {};
  const markLines = (source, atendeu) => source.filter(x => /^[-•*]\s*|^\d+[.)]\s*/.test(x)).forEach(line => {
    const clean = line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').replace(/^\s*(?:✅|⚠️|❌)\s*/, '').trim();
    criteria.forEach(c => {
      const title = norm(c.titulo);
      const normalizedLine = norm(clean);
      if (title && (normalizedLine === title || normalizedLine.startsWith(`${title} (`) || normalizedLine.startsWith(`${title}:`) || normalizedLine.includes(title))) {
        const evidence = atendeu === false ? (clean.match(/\((.*?)\)/)?.[1] || '') : '';
        out[c.id] = { atendeu, evidencia: evidence, titulo: c.titulo };
      }
    });
  });
  markLines(negativeLines, false); markLines(positiveLines, true);
  if (!Object.keys(out).length && /excelente atendimento/i.test(raw)) criteria.forEach(c => { out[c.id] = { atendeu: true, evidencia: '', titulo: c.titulo }; });
  return out;
};
const buildCriteriaForEdit = (monitoria, fallbackCriteria) => {
  const savedCriteria = Array.isArray(monitoria?.criterios) && monitoria.criterios.length ? monitoria.criterios : [];
  const detailTitles = Object.values(monitoria?.detalhes || {}).map(r => r?.titulo).filter(Boolean);
  const base = savedCriteria.length ? savedCriteria : fallbackCriteria;
  const byTitle = new Map(base.map(c => [norm(c.titulo), c]));
  const recovered = detailTitles.filter(t => !byTitle.has(norm(t))).map((t, i) => ({ id: `legacy-${i}`, titulo: t, desc: 'Critério recuperado do registro da monitoria.' }));
  return [...base, ...recovered];
};

export default function ModernNovaMonitoriaView({ unidades = [], monitorias = [], colaboradores = [], onSave, onCancel, monitoriaEdit, rascunhoEdit, onDraftSaved, darkMode = false, departamentos = [], canais = [], criteriosGenericos = [], criteriosPorDepartamento = {}, agentesComercial = [] }) {
  const [etapa, setEtapa] = useState(1), [unidade, setUnidade] = useState(''), [unidadeManual, setUnidadeManual] = useState(''), [departamento, setDepartamento] = useState(''), [agente, setAgente] = useState(''), [canal, setCanal] = useState(canais[0] || 'Telefone'), [protocolo, setProtocolo] = useState(''), [data, setData] = useState(''), [hora, setHora] = useState(''), [cliente, setCliente] = useState(''), [respostas, setRespostas] = useState({}), [criterios, setCriterios] = useState(criteriosGenericos), [feedback, setFeedback] = useState(''), [planoAcao, setPlanoAcao] = useState(''), [prazoPlano, setPrazoPlano] = useState(''), [statusPlano, setStatusPlano] = useState('Pendente'), [saved, setSaved] = useState(null), [ready, setReady] = useState(false);
  const id = useRef(rascunhoEdit?.id || `DRAFT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`); const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return; initialized.current = true;
    const source = rascunhoEdit || monitoriaEdit;
    if (rascunhoEdit && !monitoriaEdit) {
      id.current = rascunhoEdit.id; setEtapa(rascunhoEdit.etapa || 1); setUnidade(rascunhoEdit.unidadeSel || ''); setUnidadeManual(rascunhoEdit.unidadeManual || ''); setDepartamento(rascunhoEdit.departamento || ''); setAgente(rascunhoEdit.agente || ''); setCanal(rascunhoEdit.canal || 'Telefone'); setProtocolo(rascunhoEdit.protocolo || ''); setData(rascunhoEdit.dataAtendimento || ''); setHora(rascunhoEdit.horario || ''); setCliente(rascunhoEdit.cliente || ''); setFeedback(rascunhoEdit.feedback || ''); setPlanoAcao(rascunhoEdit.planoAcao || ''); setPrazoPlano(rascunhoEdit.prazoPlano || ''); setStatusPlano(rascunhoEdit.statusPlano || 'Pendente');
      const cs = rascunhoEdit.criterios?.length ? rascunhoEdit.criterios : (criteriosPorDepartamento[rascunhoEdit.departamento] || criteriosGenericos); setCriterios(cs); const rs = { ...(rascunhoEdit.respostas || {}) }; cs.forEach(c => { if (!rs[c.id]) rs[c.id] = { atendeu: null, evidencia: '' }; }); setRespostas(rs);
    } else if (monitoriaEdit) {
      if (unidades.includes(monitoriaEdit.unidade)) setUnidade(monitoriaEdit.unidade); else { setUnidade('OUTRA'); setUnidadeManual(monitoriaEdit.unidade || ''); }
      setDepartamento(monitoriaEdit.departamento || ''); setAgente(monitoriaEdit.agente || ''); setCanal(monitoriaEdit.canal || 'Telefone'); setProtocolo(monitoriaEdit.protocolo || ''); setData(monitoriaEdit.dataAtendimento || ''); setHora(monitoriaEdit.horario || ''); setCliente(monitoriaEdit.cliente || ''); setFeedback(monitoriaEdit.feedback || ''); setPlanoAcao(monitoriaEdit.planoAcao || ''); setPrazoPlano(monitoriaEdit.prazoPlano || ''); setStatusPlano(monitoriaEdit.statusPlano || 'Pendente');
      const fallback = criteriosPorDepartamento[monitoriaEdit.departamento] || criteriosGenericos;
      const cs = buildCriteriaForEdit(monitoriaEdit, fallback); setCriterios(cs);
      const rs = {}; const detalhes = monitoriaEdit.detalhes || {};
      cs.forEach(c => { const direct = detalhes[c.id]; const byTitle = Object.values(detalhes).find(r => r?.titulo && norm(r.titulo) === norm(c.titulo)); rs[c.id] = direct || byTitle || { atendeu: null, evidencia: '' }; });
      const summary = extractSummaryCriteria(monitoriaEdit.feedback || monitoriaEdit.resumo || monitoriaEdit.resumoCriteriosTexto, cs);
      Object.entries(summary).forEach(([id, value]) => { if (rs[id]?.atendeu === null || rs[id]?.atendeu === undefined) rs[id] = value; });
      setRespostas(rs);
    } else {
      setData(new Date().toISOString().slice(0, 10)); const rs = {}; criteriosGenericos.forEach(c => rs[c.id] = { atendeu: null, evidencia: '' }); setRespostas(rs); setCriterios(criteriosGenericos);
    }
    setReady(true);
  }, [rascunhoEdit, monitoriaEdit]);

  useEffect(() => { if (!ready || monitoriaEdit) return; if (departamento && criteriosPorDepartamento[departamento]) { const cs = criteriosPorDepartamento[departamento]; setCriterios(cs); setRespostas(prev => { const next = {}; cs.forEach(c => next[c.id] = prev[c.id] || { atendeu: null, evidencia: '' }); return next; }); } }, [departamento, ready, monitoriaEdit]);

  const draft = () => ({ id: id.current, etapa, unidadeSel: unidade, unidadeManual, departamento, agente, canal, protocolo, dataAtendimento: data, horario: hora, cliente, respostas, criterios, feedback, planoAcao, prazoPlano, statusPlano, updated_at: new Date().toISOString() });
  const persistDraft = () => { const x = draft(); let arr = []; try { arr = JSON.parse(localStorage.getItem(KEY) || '[]'); if (!Array.isArray(arr)) arr = []; } catch { arr = []; } const legacy = localStorage.getItem(oldKey); if (legacy) { try { const old = JSON.parse(legacy); if (old?.id && !arr.some(d => d.id === old.id)) arr.push(old); } catch {} localStorage.removeItem(oldKey); } arr = [x, ...arr.filter(d => d.id !== x.id)].slice(0, 10); localStorage.setItem(KEY, JSON.stringify(arr)); onDraftSaved?.(x); setSaved(new Date()); return x; };
  useEffect(() => { if (!ready || monitoriaEdit) return; const has = departamento || agente || cliente || protocolo || unidade || etapa > 1 || Object.values(respostas).some(x => x?.atendeu !== null || x?.evidencia); if (!has) return; const t = setTimeout(persistDraft, 450); return () => clearTimeout(t); }, [ready, monitoriaEdit, etapa, unidade, unidadeManual, departamento, agente, canal, protocolo, data, hora, cliente, respostas, criterios, feedback, planoAcao, prazoPlano, statusPlano]);
  useEffect(() => { const fn = () => { if (ready && !monitoriaEdit) persistDraft(); }; addEventListener('beforeunload', fn); return () => removeEventListener('beforeunload', fn); }, [ready, monitoriaEdit, etapa, unidade, unidadeManual, departamento, agente, canal, protocolo, data, hora, cliente, respostas, criterios, feedback, planoAcao, prazoPlano, statusPlano]);

  const respondidos = Object.values(respostas).filter(x => x?.atendeu !== null && x?.atendeu !== undefined).length;
  const nota = score(respostas, criterios); const situacao = status(nota); const p1 = departamento && unidade && agente && data && cliente && canal; const p2 = criterios.length > 0 && respondidos === criterios.length;
  const sugeridos = useMemo(() => departamento === 'Filiais - Comercial' ? agentesComercial : Array.from(new Set([...monitorias.filter(m => m.departamento === departamento && m.agente).map(m => m.agente), ...(colaboradores || []).filter(c => c.departamento === departamento).map(c => c.nome)])).sort(), [departamento, monitorias, colaboradores, agentesComercial]);
  const gerarFeedback = () => { const pos = [], neg = []; criterios.forEach(c => { if (respostas[c.id]?.atendeu === true) pos.push(c.titulo); if (respostas[c.id]?.atendeu === false) neg.push(c.titulo); }); let text = `Olá ${agente || 'Colaborador'},\n\nFoi realizada uma monitoria do seu atendimento de ${data}, pelo canal ${canal}. A nota final foi ${nota.toFixed(1)}/10 — ${situacao}.\n\n`; if (pos.length) text += `Pontos positivos:\n- ${pos.join('\n- ')}\n\n`; if (neg.length) { text += `Oportunidades de melhoria:\n- ${neg.join('\n- ')}\n\n`; text += 'Plano de ação sugerido: reforçar os critérios apontados nas próximas interações e revisar o procedimento correspondente.'; setPlanoAcao(`Reforçar: ${neg.join(', ')}. Realizar acompanhamento em nova monitoria.`); } else text += 'Excelente atendimento! Todos os critérios avaliados foram atendidos.'; setFeedback(text); };
  const salvar = () => {
    const detalhes = {};
    const resumoCriterios = criterios.map(c => ({ id: c.id, titulo: c.titulo, desc: c.desc || '', atendeu: respostas[c.id]?.atendeu ?? null, evidencia: respostas[c.id]?.evidencia || '' }));
    criterios.forEach(c => { detalhes[c.id] = { ...(respostas[c.id] || {}), titulo: c.titulo }; });
    const final = { id: monitoriaEdit?.id || nextMonitoriaId(monitorias), data: new Date().toLocaleDateString('pt-BR'), avaliador: 'Victor Silva - Analista SAC', agente: agente.trim().toUpperCase(), unidade: unidade === 'OUTRA' ? unidadeManual.toUpperCase() : unidade, departamento: departamento || departamentos[0], canal, protocolo, dataAtendimento: data, horario: hora, cliente, nota, status: situacao, detalhes, respostas, criterios, resumoCriterios, feedback, planoAcao, prazoPlano, statusPlano, feedbackSupervisor: monitoriaEdit?.feedbackSupervisor || '', statusFeedback: monitoriaEdit?.statusFeedback || 'Pendente', updated_at: new Date().toISOString(), rascunhoId: rascunhoEdit?.id || null };
    let arr = []; try { arr = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch {}
    localStorage.setItem(KEY, JSON.stringify((Array.isArray(arr) ? arr : []).filter(d => d.id !== id.current))); localStorage.removeItem(oldKey); onSave(final);
  };
  const sair = () => { if (!monitoriaEdit) persistDraft(); onCancel?.(); };
  const f = `w-full px-3 py-2.5 rounded-xl border text-xs outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B] text-white' : 'bg-slate-50 border-slate-200'}`;

  return <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-[#0B1117] text-white' : 'bg-[#F4F7F9] text-slate-900'}`}><div className="max-w-5xl mx-auto p-5 md:p-8"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5"><div><span className="text-[9px] font-black uppercase tracking-[.2em] text-blue-500">Monitoria de qualidade</span><h1 className="text-2xl font-black mt-1">{monitoriaEdit ? 'Editar monitoria' : rascunhoEdit ? 'Continuar rascunho' : 'Nova monitoria'}</h1><p className="text-xs text-slate-400 mt-1">{rascunhoEdit ? 'Seu progresso foi restaurado.' : 'A avaliação é salva automaticamente enquanto você trabalha.'}</p></div><div className="flex gap-2 items-center">{saved && <span className="text-[9px] text-slate-400">Salvo {saved.toLocaleTimeString('pt-BR')}</span>}<button onClick={sair} className="px-3 py-2 rounded-xl border text-xs font-bold">💾 Salvar e sair</button></div></div><div className="grid grid-cols-3 gap-2 mb-5">{[1,2,3].map(n => <div key={n} className={`h-1.5 rounded-full ${n <= etapa ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'}`}/>)}</div>
  <div className={`rounded-3xl border p-6 md:p-8 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`}>
    {etapa === 1 && <div className="space-y-6"><div><span className="text-[9px] font-black uppercase tracking-[.18em] text-blue-500">01 • Contexto</span><h2 className="text-xl font-black mt-1">Identificação do atendimento</h2></div><div className="grid md:grid-cols-2 gap-4"><Field l="Departamento / Setor *"><select disabled={!!monitoriaEdit} value={departamento} onChange={e => { setDepartamento(e.target.value); setAgente(''); }} className={f}><option value="">Selecione...</option>{departamentos.map(x => <option key={x}>{x}</option>)}</select></Field><Field l="Canal *"><select value={canal} onChange={e => setCanal(e.target.value)} className={f}>{canais.map(x => <option key={x}>{x}</option>)}</select></Field>{departamento && <><Field l="Colaborador *">{departamento === 'Filiais - Comercial' ? <select value={agente} onChange={e => setAgente(e.target.value)} className={f}><option value="">Selecione...</option>{agentesComercial.map(x => <option key={x}>{x}</option>)}</select> : <><input list="colabs" value={agente} onChange={e => setAgente(e.target.value)} className={`${f} uppercase`} placeholder="Digite o nome..."/><datalist id="colabs">{sugeridos.map(x => <option key={x} value={x}/>)}</datalist></>}</Field><Field l="Unidade / Filial *"><select value={unidade} onChange={e => setUnidade(e.target.value)} className={f}><option value="">Selecione...</option>{unidades.map(x => <option key={x}>{x}</option>)}<option value="OUTRA">Outra</option></select>{unidade === 'OUTRA' && <input value={unidadeManual} onChange={e => setUnidadeManual(e.target.value)} className={`${f} mt-2 uppercase`} placeholder="Digite a unidade..."/>}</Field><Field l="Data do atendimento *"><input type="date" value={data} onChange={e => setData(e.target.value)} className={f}/></Field><Field l="Horário"><input type="time" value={hora} onChange={e => setHora(e.target.value)} className={f}/></Field><Field l="Cliente / Contato *"><input value={cliente} onChange={e => setCliente(e.target.value)} className={f} placeholder="Nome ou telefone"/></Field><Field l="Protocolo"><input value={protocolo} onChange={e => setProtocolo(e.target.value)} className={f} placeholder="Opcional"/></Field></>}</div><div className="flex justify-end"><button disabled={!p1} onClick={() => setEtapa(2)} className={`px-6 py-3 rounded-xl text-xs font-black text-white ${p1 ? 'bg-blue-600' : 'bg-slate-700 opacity-50'}`}>Avançar para checklist →</button></div></div>}
    {etapa === 2 && <div className="space-y-5"><div><span className="text-[9px] font-black uppercase tracking-[.18em] text-blue-500">02 • Avaliação</span><h2 className="text-xl font-black mt-1">Checklist de qualidade</h2><p className="text-xs text-slate-400 mt-1">{respondidos} de {criterios.length} critérios • nota parcial {nota.toFixed(1)}/10</p></div><div className="space-y-3">{criterios.map((c, i) => <div key={c.id} className={`rounded-2xl border p-4 ${respostas[c.id]?.atendeu === true ? 'border-emerald-500/40 bg-emerald-500/5' : respostas[c.id]?.atendeu === false ? 'border-rose-500/40 bg-rose-500/5' : darkMode ? 'border-[#24313B]' : 'border-slate-200'}`}><div className="flex flex-col md:flex-row justify-between gap-4"><div><b className="text-xs">{i + 1}. {c.titulo}</b><p className="text-[11px] text-slate-400 mt-1">{c.desc}</p></div><div className="flex gap-2"><button onClick={() => setRespostas(p => ({ ...p, [c.id]: { ...p[c.id], atendeu: true } }))} className={`px-4 py-2 rounded-xl text-xs font-black ${respostas[c.id]?.atendeu === true ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>✓ Sim</button><button onClick={() => setRespostas(p => ({ ...p, [c.id]: { ...p[c.id], atendeu: false } }))} className={`px-4 py-2 rounded-xl text-xs font-black ${respostas[c.id]?.atendeu === false ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>× Não</button></div></div>{respostas[c.id]?.atendeu === false && <textarea value={respostas[c.id]?.evidencia || ''} onChange={e => setRespostas(p => ({ ...p, [c.id]: { ...p[c.id], evidencia: e.target.value } }))} className={`${f} mt-3 h-20 resize-none`} placeholder="Justificativa / evidência da falha..."/>}</div>)}</div><div className="flex justify-between"><button onClick={() => setEtapa(1)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold">Voltar</button><button disabled={!p2} onClick={() => { gerarFeedback(); setEtapa(3); }} className={`px-6 py-2.5 rounded-xl text-xs font-black text-white ${p2 ? 'bg-blue-600' : 'bg-slate-700 opacity-50'}`}>Revisar resultado →</button></div></div>}
    {etapa === 3 && <div className="space-y-5"><div className="flex flex-col md:flex-row md:items-start justify-between gap-3"><div><span className="text-[9px] font-black uppercase tracking-[.18em] text-blue-500">03 • Conclusão</span><h2 className="text-xl font-black mt-1">Resultado da monitoria</h2></div><div className={`px-4 py-2 rounded-xl text-xs font-black ${nota >= 9 ? 'bg-emerald-500/10 text-emerald-500' : nota >= 7 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>Nota {nota.toFixed(1)}/10 • {situacao}</div></div><div className="grid md:grid-cols-3 gap-3"><Field l="Prazo do plano"><input type="date" value={prazoPlano} onChange={e => setPrazoPlano(e.target.value)} className={f}/></Field><Field l="Status do plano"><select value={statusPlano} onChange={e => setStatusPlano(e.target.value)} className={f}><option>Pendente</option><option>Em andamento</option><option>Concluído</option></select></Field><div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-3"><span className="text-[9px] uppercase font-black text-slate-400">Indicador</span><b className="block text-lg mt-1">{respondidos}/{criterios.length}</b><span className="text-[9px] text-slate-400">critérios respondidos</span></div></div><Field l="Feedback / devolutiva"><textarea value={feedback} onChange={e => setFeedback(e.target.value)} className={`${f} h-48 resize-none`}/></Field><Field l="Plano de ação"><textarea value={planoAcao} onChange={e => setPlanoAcao(e.target.value)} className={`${f} h-28 resize-none`} placeholder="O que deve ser feito para corrigir ou consolidar o comportamento?"/></Field><div className="flex justify-between"><button onClick={() => setEtapa(2)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold">Voltar</button><div className="flex gap-2"><button onClick={gerarFeedback} className="px-4 py-2.5 rounded-xl border text-xs font-black">Gerar devolutiva</button><button onClick={salvar} className="px-7 py-3 rounded-xl bg-blue-600 text-white text-xs font-black">✓ Salvar monitoria</button></div></div></div>}
  </div></div></div>;
}
function Field({ l, children }) { return <div><label className="block text-[9px] uppercase tracking-wider font-black text-slate-400 mb-1.5">{l}</label>{children}</div>; }
