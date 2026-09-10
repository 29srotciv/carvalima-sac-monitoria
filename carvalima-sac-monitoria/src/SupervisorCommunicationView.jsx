import React, { useMemo, useState } from 'react';

const norm = (v = '') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const safeToken = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `SUP-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

const criteriaLines = (m = {}) => {
  const rows = [];
  Object.entries(m.detalhes || {}).forEach(([id, r]) => {
    if (typeof r?.atendeu === 'boolean') rows.push({ id, titulo: r.titulo || id, atendeu: r.atendeu, evidencia: r.evidencia || '' });
  });
  if (!rows.length && Array.isArray(m.resumoCriterios)) return m.resumoCriterios;
  return rows;
};

const makePdf = (m, supervisor) => {
  const J = window.jspdf?.jsPDF || window.jsPDF;
  if (!J) throw new Error('Biblioteca PDF não carregada.');
  const pdf = new J({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 18;
  let y = 20;
  const line = (text, size = 9, bold = false, color = [30, 41, 59], gap = 5) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    const parts = pdf.splitTextToSize(String(text || '—'), pageW - margin * 2);
    parts.forEach((p) => { if (y > 278) { pdf.addPage(); y = 20; } pdf.text(p, margin, y); y += gap; });
  };
  const section = (title) => { if (y > 265) { pdf.addPage(); y = 20; } y += 3; line(title, 11, true, [37, 99, 235], 6); };

  line('CARVALIMA • CENTRAL DE QUALIDADE', 9, true, [37, 99, 235], 6);
  line('Monitoria de atendimento', 20, true, [15, 23, 42], 9);
  line(`Documento para acompanhamento do supervisor ${supervisor?.nome || ''}`, 9, false, [100, 116, 139], 6);
  line(`ID: ${m.id || '—'} • Data: ${m.dataAtendimento || '—'} • Departamento: ${m.departamento || '—'}`, 9, true, [30, 41, 59], 6);
  line(`Colaborador: ${m.agente || '—'} • Unidade: ${m.unidade || '—'} • Canal: ${m.canal || 'Telefone'}`, 9, false, [30, 41, 59], 6);
  line(`Nota: ${Number(m.nota || 0).toFixed(1)} • Status: ${m.status || '—'}`, 10, true, [30, 41, 59], 7);

  section('Resumo da monitoria');
  line(m.feedback || m.resumo || 'Sem resumo registrado.', 9, false, [51, 65, 85], 5);

  const rows = criteriaLines(m);
  if (rows.length) {
    section('Critérios avaliados');
    rows.forEach((r, i) => line(`${i + 1}. ${r.titulo || r.id} — ${r.atendeu ? 'ATENDEU' : 'NÃO ATENDEU'}${r.evidencia ? ` — ${r.evidencia}` : ''}`, 8.5, false, r.atendeu ? [22, 101, 52] : [185, 28, 28], 5));
  }

  if (m.planoAcao) { section('Plano de ação'); line(m.planoAcao, 9, false, [51, 65, 85], 5); line(`Prazo: ${m.prazoPlano || 'Não definido'} • Status: ${m.statusPlano || 'Pendente'}`, 8.5, true, [100, 116, 139], 5); }
  section('Retorno solicitado');
  line('Solicitamos a análise da monitoria e o retorno do supervisor sobre a orientação realizada, ciência dos pontos identificados e próximos passos para acompanhamento.', 9, false, [51, 65, 85], 5);
  return pdf.output('datauristring').split(',')[1];
};

export default function SupervisorCommunicationView({ monitorias = [], supervisores = [], onUpdateSupervisores, onUpdateMonitoria, darkMode = false, showToast }) {
  const [aba, setAba] = useState('envios');
  const [form, setForm] = useState({ id: '', nome: '', email: '', departamento: '' });
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState('');

  const settings = () => {
    try { return JSON.parse(localStorage.getItem('carvalima_qa_settings')) || {}; } catch { return {}; }
  };

  const responsavel = (m) => supervisores.find((s) => norm(s.departamento) === norm(m.departamento) && s.ativo !== false);
  const pendentes = useMemo(() => monitorias.filter((m) => !m.deleted && !m.supervisorEnvioAt), [monitorias]);

  const salvarSupervisor = async () => {
    const nome = form.nome.trim(); const email = form.email.trim(); const departamento = form.departamento.trim();
    if (!nome || !email || !departamento) { showToast?.('Preencha nome, e-mail e departamento.', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast?.('Informe um e-mail válido.', 'error'); return; }
    const item = { id: form.id || `SUP-${Date.now()}`, nome, email, departamento, ativo: true, updated_at: new Date().toISOString() };
    const next = form.id ? supervisores.map((s) => s.id === form.id ? item : s) : [...supervisores, item];
    await onUpdateSupervisores(next);
    setForm({ id: '', nome: '', email: '', departamento: '' });
    showToast?.('Supervisor salvo.', 'success');
  };

  const excluirSupervisor = async (id) => {
    if (!window.confirm('Desativar este supervisor?')) return;
    await onUpdateSupervisores(supervisores.map((s) => s.id === id ? { ...s, ativo: false } : s));
  };

  const enviar = async (m) => {
    const supervisor = responsavel(m);
    const cfg = settings();
    if (!supervisor) throw new Error(`Nenhum supervisor cadastrado para ${m.departamento || 'o departamento'}.`);
    if (!cfg.gasUrl || !cfg.gasToken) throw new Error('Configure o Google Apps Script em Configurações.');
    const token = m.supervisorToken || safeToken();
    const responseUrl = `${window.location.origin}${window.location.pathname}?supervisor_token=${encodeURIComponent(token)}`;
    const pdfBase64 = makePdf(m, supervisor);
    const payload = {
      action: 'sendSupervisorEmail', tokenSeguranca: cfg.gasToken, responseToken: token,
      supervisor: { nome: supervisor.nome, email: supervisor.email, departamento: supervisor.departamento },
      monitoria: { id: m.id, agente: m.agente, departamento: m.departamento, unidade: m.unidade, dataAtendimento: m.dataAtendimento, nota: m.nota, status: m.status },
      pdfBase64, responseUrl, enviadoPor: 'Victor Silva (Analista SAC)'
    };
    const response = await fetch(cfg.gasUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Falha ao enviar o e-mail.');
    const atualizado = { ...m, supervisorNome: supervisor.nome, supervisorEmail: supervisor.email, supervisorDepartamento: supervisor.departamento, supervisorToken: token, supervisorEnvioAt: new Date().toISOString(), supervisorStatus: 'Enviado', supervisorRetornoStatus: 'Pendente' };
    await onUpdateMonitoria(atualizado);
    return atualizado;
  };

  const enviarUm = async (m) => {
    setEnviando(true); setProgresso(`Enviando ${m.id}...`);
    try { await enviar(m); showToast?.(`Monitoria ${m.id} enviada para ${responsavel(m)?.nome}.`, 'success'); }
    catch (e) { showToast?.(e.message, 'error'); }
    finally { setEnviando(false); setProgresso(''); }
  };

  const enviarTodos = async () => {
    const lista = pendentes.filter((m) => responsavel(m));
    if (!lista.length) { showToast?.('Não há monitorias pendentes com supervisor cadastrado.', 'info'); return; }
    if (!window.confirm(`Enviar ${lista.length} monitorias aos supervisores responsáveis?`)) return;
    setEnviando(true);
    let ok = 0;
    for (let i = 0; i < lista.length; i += 1) {
      setProgresso(`Enviando ${i + 1} de ${lista.length}...`);
      try { await enviar(lista[i]); ok += 1; } catch (e) { console.error(e); }
    }
    setEnviando(false); setProgresso(''); showToast?.(`${ok} de ${lista.length} monitorias enviadas.`, ok ? 'success' : 'error');
  };

  const card = `rounded-2xl border p-5 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`;
  const activeSup = supervisores.filter((s) => s.ativo !== false);

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 ${darkMode ? 'bg-[#0B1117] text-white' : 'bg-[#F5F7F8] text-slate-900'}`}>
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div><span className="text-[9px] font-black uppercase tracking-[.22em] text-blue-500">Comunicação • ciclo de acompanhamento</span><h1 className="text-3xl font-black mt-2">Supervisores & retornos</h1><p className="text-xs text-slate-400 mt-1">Cadastre responsáveis, envie as monitorias e acompanhe o retorno sem precisar escrever e-mail manualmente.</p></div>
        {aba === 'envios' && <button disabled={enviando} onClick={enviarTodos} className="px-5 py-3 rounded-2xl bg-blue-600 text-white text-xs font-black disabled:opacity-50">{enviando ? progresso || 'Enviando...' : `Enviar todas as pendentes (${pendentes.length})`}</button>}
      </header>

      <div className="flex gap-2"><button onClick={() => setAba('envios')} className={`px-4 py-2 rounded-xl text-xs font-black ${aba === 'envios' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>Monitorias</button><button onClick={() => setAba('cadastro')} className={`px-4 py-2 rounded-xl text-xs font-black ${aba === 'cadastro' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>Supervisores ({activeSup.length})</button></div>

      {aba === 'cadastro' && (
        <div className="space-y-5">
          <section className={card}>
            <h2 className="text-base font-black">Cadastrar supervisor</h2><p className="text-[10px] text-slate-400 mt-1 mb-4">O departamento será usado para identificar automaticamente o responsável nas monitorias.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do supervisor" className="border rounded-xl px-3 py-3 text-xs bg-transparent" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E-mail corporativo" className="border rounded-xl px-3 py-3 text-xs bg-transparent" />
              <select value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} className="border rounded-xl px-3 py-3 text-xs bg-transparent"><option value="">Departamento</option>{['Filiais - Comercial','Filiais - Financeiro','Filiais - Pendência','Unidades','Embarcadoras'].map((d) => <option key={d}>{d}</option>)}</select>
            </div>
            <div className="flex justify-end mt-4"><button onClick={salvarSupervisor} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black">{form.id ? 'Atualizar supervisor' : 'Cadastrar supervisor'}</button></div>
          </section>
          <section className={card}><h2 className="text-base font-black mb-3">Supervisores cadastrados</h2><div className="space-y-2">{activeSup.map((s) => <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border"><div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 grid place-items-center font-black">{s.nome.slice(0,1).toUpperCase()}</div><div className="flex-1 min-w-0"><div className="text-xs font-black truncate">{s.nome}</div><div className="text-[10px] text-slate-400 truncate">{s.email} • {s.departamento}</div></div><button onClick={() => setForm(s)} className="text-[10px] font-black text-blue-500">Editar</button><button onClick={() => excluirSupervisor(s.id)} className="text-[10px] font-black text-rose-500">Desativar</button></div>)}</div></section>
        </div>
      )}

      {aba === 'envios' && <section className={card}><div className="flex items-center justify-between mb-4"><div><h2 className="text-base font-black">Monitorias salvas</h2><p className="text-[10px] text-slate-400">O responsável é definido automaticamente pelo departamento da monitoria.</p></div></div><div className="space-y-2">{monitorias.filter((m) => !m.deleted).slice(0, 100).map((m) => { const s = responsavel(m); const enviado = !!m.supervisorEnvioAt; return <div key={m.id} className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 rounded-xl border"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><b className="text-xs">{m.id}</b><span className="text-[10px] text-slate-400">{m.agente}</span></div><div className="text-[10px] text-slate-400 mt-1">{m.departamento} • Nota {Number(m.nota || 0).toFixed(1)} • {m.dataAtendimento || '—'}</div></div><div className="text-[10px] min-w-[220px]">{s ? <><b>{s.nome}</b><div className="text-slate-400">{s.email}</div></> : <span className="text-rose-500 font-bold">Supervisor não cadastrado</span>}</div><div className="text-[10px] font-bold">{enviado ? <span className="text-emerald-500">Enviado {new Date(m.supervisorEnvioAt).toLocaleDateString('pt-BR')}</span> : <span className="text-amber-500">Pendente</span>}</div><button disabled={enviando || !s} onClick={() => enviarUm(m)} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black disabled:opacity-40">{enviado ? 'Reenviar' : 'Enviar ao supervisor'}</button></div>; })}</div></section>}
    </div>
  );
}
