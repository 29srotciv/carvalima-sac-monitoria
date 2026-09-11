import React, { useEffect, useMemo, useState } from 'react';
import GmailScriptSettingsView from './GmailScriptSettingsView';

const norm = (v = '') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const safeToken = () => window.crypto?.randomUUID ? window.crypto.randomUUID() : `SUP-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

const criteriaLines = (m = {}) => {
  const rows = [];
  Object.entries(m.detalhes || {}).forEach(([id, r]) => {
    if (typeof r?.atendeu === 'boolean') rows.push({ id, titulo: r.titulo || id, atendeu: r.atendeu, evidencia: r.evidencia || '' });
  });
  if (!rows.length && Array.isArray(m.resumoCriterios)) {
    m.resumoCriterios.forEach((r, i) => {
      if (typeof r?.atendeu === 'boolean') rows.push({ id: r.id || `r${i}`, titulo: r.titulo || r.id || `Critério ${i + 1}`, atendeu: r.atendeu, evidencia: r.evidencia || '' });
    });
  }
  return rows;
};

const cleanText = (value = '') => String(value)
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  .replace(/&amp;/gi, '&').replace(/&nbsp;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const makePdf = (m, supervisor) => {
  const J = window.jspdf?.jsPDF || window.jsPDF;
  if (!J) throw new Error('Biblioteca PDF não carregada.');

  const pdf = new J({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const W = 210, H = 297, margin = 18, contentW = W - margin * 2;
  const primary = [37, 99, 235], dark = [23, 32, 42], muted = [100, 116, 139], lineColor = [226, 232, 240];
  let y = 18;
  let pageNo = 1;

  const footer = () => {
    pdf.setDrawColor(...lineColor);
    pdf.line(margin, 284, W - margin, 284);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(...muted);
    pdf.text('Carvalima • Central de Qualidade • Uso interno', margin, 290);
    pdf.text(`Página ${pageNo}`, W - margin, 290, { align: 'right' });
  };

  const newPage = () => {
    footer(); pdf.addPage(); pageNo += 1; y = 18;
  };

  const ensure = (height = 10) => { if (y + height > 278) newPage(); };

  const text = (value, size = 9, bold = false, color = dark, maxW = contentW, gap = 4.5) => {
    const str = cleanText(value) || '—';
    pdf.setFont('helvetica', bold ? 'bold' : 'normal'); pdf.setFontSize(size); pdf.setTextColor(...color);
    const parts = pdf.splitTextToSize(str, maxW);
    parts.forEach((part) => { ensure(gap + 1); pdf.text(part, margin, y); y += gap; });
  };

  const section = (title) => {
    ensure(13); y += 3;
    pdf.setFillColor(...primary); pdf.roundedRect(margin, y - 3.5, 2.5, 6.5, 1.2, 1.2, 'F');
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); pdf.setTextColor(...dark); pdf.text(title, margin + 6, y + 1.5); y += 8;
  };

  // Cabeçalho institucional
  pdf.setFillColor(...primary); pdf.rect(0, 0, W, 7, 'F');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); pdf.setTextColor(...primary); pdf.text('CARVALIMA • CENTRAL DE QUALIDADE', margin, y + 2);
  y += 12;
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(21); pdf.setTextColor(...dark); pdf.text('Monitoria de atendimento', margin, y); y += 6;
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(...muted);
  pdf.text(`Documento para acompanhamento do supervisor ${cleanText(supervisor?.nome || '')}`.trim(), margin, y); y += 10;

  // Identificação
  pdf.setFillColor(248, 250, 252); pdf.setDrawColor(...lineColor); pdf.roundedRect(margin, y, contentW, 31, 4, 4, 'FD');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(...muted);
  pdf.text('IDENTIFICAÇÃO DA MONITORIA', margin + 6, y + 7);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(...dark);
  pdf.text(`ID: ${cleanText(m.id || '—')}`, margin + 6, y + 14);
  pdf.text(`Data: ${cleanText(m.dataAtendimento || '—')}`, margin + 6, y + 21);
  pdf.text(`Departamento: ${cleanText(m.departamento || '—')}`, margin + 6, y + 28);
  pdf.text(`Colaborador: ${cleanText(m.agente || '—')}`, margin + 105, y + 14);
  pdf.text(`Unidade: ${cleanText(m.unidade || '—')}`, margin + 105, y + 21);
  pdf.text(`Canal: ${cleanText(m.canal || 'Telefone')}`, margin + 105, y + 28);
  y += 38;

  // Resultado
  const nota = Number(m.nota || 0).toFixed(1);
  const status = cleanText(m.status || (Number(m.nota || 0) >= 9 ? 'CONFORME' : 'ATENÇÃO'));
  pdf.setFillColor(...primary); pdf.roundedRect(margin, y, contentW, 24, 4, 4, 'F');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(219, 234, 254); pdf.text('RESULTADO DA MONITORIA', margin + 6, y + 7);
  pdf.setFontSize(16); pdf.setTextColor(255, 255, 255); pdf.text(`Nota ${nota}`, margin + 6, y + 17);
  pdf.setFontSize(9); pdf.text(status.toUpperCase(), W - margin - 6, y + 16, { align: 'right' });
  y += 32;

  const rows = criteriaLines(m);
  const positives = rows.filter((r) => r.atendeu);
  const improvements = rows.filter((r) => !r.atendeu);

  section('Resumo da avaliação');
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(...dark);
  text(`Foram avaliados ${rows.length || 0} critérios. ${positives.length} atendido(s) e ${improvements.length} oportunidade(s) de melhoria identificada(s).`, 9, false, [51, 65, 85], contentW, 5);

  if (positives.length) {
    ensure(10); y += 2; text('Pontos positivos', 9.5, true, [22, 101, 52], contentW, 5);
    positives.forEach((r) => text(`• ${r.titulo}`, 8.5, false, [51, 65, 85], contentW - 4, 4.5));
  }

  if (improvements.length) {
    ensure(10); y += 2; text('Oportunidades de melhoria', 9.5, true, [185, 28, 28], contentW, 5);
    improvements.forEach((r) => text(`• ${r.titulo}${r.evidencia ? ` — ${r.evidencia}` : ''}`, 8.5, false, [51, 65, 85], contentW - 4, 4.5));
  }

  if (!rows.length && (m.feedback || m.resumo)) {
    text(m.feedback || m.resumo, 8.8, false, [51, 65, 85], contentW, 4.7);
  }

  if (rows.length) {
    section('Critérios avaliados');
    rows.forEach((r, i) => {
      ensure(18);
      const rowH = r.evidencia ? 17 : 12;
      pdf.setFillColor(i % 2 ? 255 : 248, i % 2 ? 255 : 250, i % 2 ? 255 : 252);
      pdf.setDrawColor(...lineColor); pdf.roundedRect(margin, y - 2, contentW, rowH, 2.5, 2.5, 'FD');
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.2); pdf.setTextColor(...dark);
      const titleLines = pdf.splitTextToSize(`${i + 1}. ${cleanText(r.titulo || r.id)}`, contentW - 43);
      pdf.text(titleLines.slice(0, 2), margin + 5, y + 5);
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.3); pdf.setTextColor(...(r.atendeu ? [22, 101, 52] : [185, 28, 28]));
      pdf.text(r.atendeu ? 'ATENDEU' : 'NÃO ATENDEU', W - margin - 5, y + 5, { align: 'right' });
      if (r.evidencia) {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.3); pdf.setTextColor(...muted);
        const ev = pdf.splitTextToSize(cleanText(r.evidencia), contentW - 10);
        pdf.text(ev.slice(0, 2), margin + 5, y + 11);
      }
      y += rowH + 2;
    });
  }

  if (m.planoAcao) {
    section('Plano de ação');
    text(m.planoAcao, 8.8, false, [51, 65, 85], contentW, 4.7);
    text(`Prazo: ${cleanText(m.prazoPlano || 'Não definido')} • Status: ${cleanText(m.statusPlano || 'Pendente')}`, 8, true, muted, contentW, 4.5);
  }

  section('Retorno do supervisor');
  pdf.setFillColor(248, 250, 252); pdf.setDrawColor(...lineColor); pdf.roundedRect(margin, y, contentW, 25, 4, 4, 'FD');
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(...[51, 65, 85]);
  const returnText = 'Solicitamos a análise da avaliação e o registro do retorno sobre a orientação realizada, ciência dos pontos identificados e próximos passos para acompanhamento.';
  pdf.text(pdf.splitTextToSize(returnText, contentW - 12), margin + 6, y + 8);
  y += 33;

  footer();
  return pdf.output('datauristring').split(',')[1];
};

export default function SupervisorCommunicationView({ monitorias = [], supervisores = [], onUpdateSupervisores, onUpdateMonitoria, darkMode = false, showToast }) {
  const [aba, setAba] = useState('envios');
  const [form, setForm] = useState({ id: '', nome: '', email: '', departamento: '' });
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState('');
  const [sincronizandoRetornos, setSincronizandoRetornos] = useState(false);

  const settings = () => { try { return JSON.parse(localStorage.getItem('carvalima_qa_settings')) || {}; } catch { return {}; } };
  const responsavel = (m) => supervisores.find((s) => norm(s.departamento) === norm(m.departamento) && s.ativo !== false);
  const pendentes = useMemo(() => monitorias.filter((m) => !m.deleted && !m.supervisorEnvioAt), [monitorias]);

  const sincronizarRetornos = async (silencioso = false) => {
    const cfg = settings();
    if (!cfg.gmailUrl || !cfg.gmailToken) {
      if (!silencioso) showToast?.('Configure o Script Gmail antes de atualizar os retornos.', 'error');
      return;
    }
    setSincronizandoRetornos(true);
    try {
      const result = await fetch(cfg.gmailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'syncSupervisorReturns', tokenSeguranca: cfg.gmailToken })
      }).then((r) => r.json());
      if (!result.success) throw new Error(result.error || 'Não foi possível consultar os retornos.');
      let atualizados = 0;
      for (const retorno of result.returns || []) {
        const m = monitorias.find((item) => String(item.id) === String(retorno.monitoriaId));
        if (!m) continue;
        const jaIgual = m.supervisorRetornoStatus === 'Respondido' &&
          String(m.feedbackSupervisor || '') === String(retorno.feedbackSupervisor || '') &&
          String(m.supervisorRetornoAt || '') === String(retorno.respondidoEm || '');
        if (jaIgual) continue;
        await onUpdateMonitoria({
          ...m,
          supervisorStatus: 'Respondido',
          supervisorRetornoStatus: 'Respondido',
          supervisorDecisao: retorno.decisao || '',
          feedbackSupervisor: retorno.feedbackSupervisor || '',
          proximoPassoSupervisor: retorno.proximoPasso || '',
          supervisorRetornoAt: retorno.respondidoEm || new Date().toISOString(),
          supervisorRetornoToken: retorno.responseToken || m.supervisorToken || ''
        });
        atualizados += 1;
      }
      showToast?.(atualizados ? `${atualizados} retorno(s) atualizado(s) no sistema.` : 'Nenhum retorno novo encontrado.', atualizados ? 'success' : 'info');
    } catch (e) {
      console.error(e);
      showToast?.(`Falha ao atualizar retornos: ${e.message}`, 'error');
    } finally {
      setSincronizandoRetornos(false);
    }
  };

  useEffect(() => {
    sincronizarRetornos(true);
  }, []);

  const salvarSupervisor = async () => {
    const nome = form.nome.trim(), email = form.email.trim(), departamento = form.departamento.trim();
    if (!nome || !email || !departamento) { showToast?.('Preencha nome, e-mail e departamento.', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast?.('Informe um e-mail válido.', 'error'); return; }
    const item = { id: form.id || `SUP-${Date.now()}`, nome, email, departamento, ativo: true, updated_at: new Date().toISOString() };
    await onUpdateSupervisores(form.id ? supervisores.map((s) => s.id === form.id ? item : s) : [...supervisores, item]);
    setForm({ id: '', nome: '', email: '', departamento: '' });
    showToast?.('Supervisor salvo.', 'success');
  };

  const excluirSupervisor = async (id) => {
    if (!window.confirm('Desativar este supervisor?')) return;
    await onUpdateSupervisores(supervisores.map((s) => s.id === id ? { ...s, ativo: false } : s));
  };

  const enviar = async (m) => {
    const supervisor = responsavel(m), cfg = settings();
    if (!supervisor) throw new Error(`Nenhum supervisor cadastrado para ${m.departamento || 'o departamento'}.`);
    if (!cfg.gmailUrl || !cfg.gmailToken) throw new Error('Configure o Script Gmail em Supervisores & Retornos > Script Gmail.');
    const token = m.supervisorToken || safeToken();
    const responseUrl = `${window.location.origin}${window.location.pathname}?supervisor_token=${encodeURIComponent(token)}&gas=${encodeURIComponent(cfg.gmailUrl)}`;
    const payload = {
      action: 'sendSupervisorEmail', tokenSeguranca: cfg.gmailToken, responseToken: token,
      supervisor: { nome: supervisor.nome, email: supervisor.email, departamento: supervisor.departamento },
      monitoria: { id: m.id, agente: m.agente, departamento: m.departamento, unidade: m.unidade, dataAtendimento: m.dataAtendimento, nota: m.nota, status: m.status },
      pdfBase64: makePdf(m, supervisor), responseUrl, enviadoPor: 'Victor Silva (Analista SAC)'
    };
    const result = await fetch(cfg.gmailUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) }).then((r) => r.json());
    if (!result.success) throw new Error(result.error || 'Falha ao enviar o e-mail.');
    await onUpdateMonitoria({ ...m, supervisorNome: supervisor.nome, supervisorEmail: supervisor.email, supervisorDepartamento: supervisor.departamento, supervisorToken: token, supervisorEnvioAt: new Date().toISOString(), supervisorStatus: 'Enviado', supervisorRetornoStatus: 'Pendente' });
  };

  const enviarUm = async (m) => { setEnviando(true); setProgresso(`Enviando ${m.id}...`); try { await enviar(m); showToast?.(`Monitoria ${m.id} enviada para ${responsavel(m)?.nome}.`, 'success'); } catch (e) { showToast?.(e.message, 'error'); } finally { setEnviando(false); setProgresso(''); } };

  const enviarTodos = async () => {
    const lista = pendentes.filter((m) => responsavel(m));
    if (!lista.length) { showToast?.('Não há monitorias pendentes com supervisor cadastrado.', 'info'); return; }
    if (!window.confirm(`Enviar ${lista.length} monitorias aos supervisores responsáveis?`)) return;
    setEnviando(true); let ok = 0;
    for (let i = 0; i < lista.length; i += 1) { setProgresso(`Enviando ${i + 1} de ${lista.length}...`); try { await enviar(lista[i]); ok += 1; } catch (e) { console.error(e); } }
    setEnviando(false); setProgresso(''); showToast?.(`${ok} de ${lista.length} monitorias enviadas.`, ok ? 'success' : 'error');
  };

  const card = `rounded-2xl border p-5 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`;
  const activeSup = supervisores.filter((s) => s.ativo !== false);
  const retornoPendenteCount = monitorias.filter((m) => !m.deleted && m.supervisorEnvioAt && m.supervisorRetornoStatus !== 'Respondido').length;
  const retornoRecebidoCount = monitorias.filter((m) => !m.deleted && m.supervisorRetornoStatus === 'Respondido').length;

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 ${darkMode ? 'bg-[#0B1117] text-white' : 'bg-[#F5F7F8] text-slate-900'}`}>
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[.22em] text-blue-500">Comunicação • ciclo de acompanhamento</span>
          <h1 className="text-3xl font-black mt-2">Supervisores & retornos</h1>
          <p className="text-xs text-slate-400 mt-1">Cadastre responsáveis, envie as monitorias e acompanhe o retorno sem precisar escrever e-mail manualmente.</p>
        </div>
        {aba === 'envios' && <div className="flex flex-wrap gap-2 justify-end">
          <button disabled={sincronizandoRetornos || enviando} onClick={() => sincronizarRetornos(false)} className="px-4 py-3 rounded-2xl border border-blue-200 bg-white text-blue-600 text-xs font-black disabled:opacity-50">{sincronizandoRetornos ? 'Atualizando...' : `↻ Atualizar retornos (${retornoPendenteCount})`}</button>
          <button disabled={enviando} onClick={enviarTodos} className="px-5 py-3 rounded-2xl bg-blue-600 text-white text-xs font-black disabled:opacity-50">{enviando ? progresso || 'Enviando...' : `Enviar todas as pendentes (${pendentes.length})`}</button>
        </div>}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={card}><div className="text-[9px] uppercase tracking-wider text-slate-400 font-black">Pendentes de envio</div><div className="text-2xl font-black mt-1">{pendentes.length}</div></div>
        <div className={card}><div className="text-[9px] uppercase tracking-wider text-slate-400 font-black">Aguardando supervisor</div><div className="text-2xl font-black mt-1 text-amber-500">{retornoPendenteCount}</div></div>
        <div className={card}><div className="text-[9px] uppercase tracking-wider text-slate-400 font-black">Retornos recebidos</div><div className="text-2xl font-black mt-1 text-emerald-500">{retornoRecebidoCount}</div></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setAba('envios')} className={`px-4 py-2 rounded-xl text-xs font-black ${aba === 'envios' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>Monitorias</button>
        <button onClick={() => setAba('cadastro')} className={`px-4 py-2 rounded-xl text-xs font-black ${aba === 'cadastro' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>Supervisores ({activeSup.length})</button>
        <button onClick={() => setAba('gmail')} className={`px-4 py-2 rounded-xl text-xs font-black ${aba === 'gmail' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>Script Gmail</button>
      </div>

      {aba === 'gmail' && <GmailScriptSettingsView darkMode={darkMode} showToast={showToast} />}

      {aba === 'cadastro' && <div className="space-y-5">
        <section className={card}>
          <h2 className="text-base font-black">Cadastrar supervisor</h2>
          <p className="text-[10px] text-slate-400 mt-1 mb-4">O departamento será usado para identificar automaticamente o responsável nas monitorias.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do supervisor" className="border rounded-xl px-3 py-3 text-xs bg-transparent" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E-mail corporativo" className="border rounded-xl px-3 py-3 text-xs bg-transparent" />
            <select value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} className="border rounded-xl px-3 py-3 text-xs bg-transparent"><option value="">Departamento</option>{['Filiais - Comercial','Filiais - Financeiro','Filiais - Pendência','Unidades','Embarcadoras'].map((d) => <option key={d}>{d}</option>)}</select>
          </div>
          <div className="flex justify-end mt-4"><button onClick={salvarSupervisor} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black">{form.id ? 'Atualizar supervisor' : 'Cadastrar supervisor'}</button></div>
        </section>
        <section className={card}>
          <h2 className="text-base font-black mb-3">Supervisores cadastrados</h2>
          <div className="space-y-2">{activeSup.map((s) => <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border"><div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 grid place-items-center font-black">{s.nome.slice(0,1).toUpperCase()}</div><div className="flex-1 min-w-0"><div className="text-xs font-black truncate">{s.nome}</div><div className="text-[10px] text-slate-400 truncate">{s.email} • {s.departamento}</div></div><button onClick={() => setForm(s)} className="text-[10px] font-black text-blue-500">Editar</button><button onClick={() => excluirSupervisor(s.id)} className="text-[10px] font-black text-rose-500">Desativar</button></div>)}</div>
        </section>
      </div>}

      {aba === 'envios' && <section className={card}>
        <div className="flex items-center justify-between mb-4"><div><h2 className="text-base font-black">Monitorias salvas</h2><p className="text-[10px] text-slate-400 mt-1">O responsável é definido automaticamente pelo departamento da monitoria.</p></div></div>
        <div className="space-y-2">
          {monitorias.filter((m) => !m.deleted).slice(0, 100).map((m) => {
            const s = responsavel(m); const enviado = !!m.supervisorEnvioAt; const respondido = m.supervisorRetornoStatus === 'Respondido';
            return <div key={m.id} className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 rounded-xl border">
              <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><b className="text-xs">{m.id}</b><span className="text-[10px] text-slate-400 truncate">{m.agente}</span></div><div className="text-[10px] text-slate-400 mt-1">{m.departamento} • Nota {Number(m.nota || 0).toFixed(1)} • {m.dataAtendimento || '—'}</div></div>
              <div className="text-[10px] min-w-[220px]">{s ? <><b>{s.nome}</b><div className="text-slate-400">{s.email}</div></> : <span className="text-rose-500 font-bold">Supervisor não cadastrado</span>}</div>
              <div className="text-[10px] font-bold min-w-[110px]">{respondido ? <span className="text-emerald-500">Retorno recebido</span> : enviado ? <span className="text-amber-500">Aguardando retorno</span> : <span className="text-amber-500">Pendente de envio</span>}</div>
              <button disabled={enviando || !s} onClick={() => enviarUm(m)} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black disabled:opacity-40">{enviado ? 'Reenviar' : 'Enviar ao supervisor'}</button>
            </div>;
          })}
        </div>
      </section>}
    </div>
  );
}
