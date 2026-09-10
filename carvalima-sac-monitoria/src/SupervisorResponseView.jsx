import React, { useEffect, useState } from 'react';

export default function SupervisorResponseView() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('supervisor_token') || '';
  const [apiUrl, setApiUrl] = useState('');
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [decisao, setDecisao] = useState('Ciente');
  const [proximoPasso, setProximoPasso] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const api = params.get('gas') || '';
    setApiUrl(api);
    if (!token || !api) { setErro('Link de retorno inválido ou incompleto.'); setLoading(false); return; }
    fetch(api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'getSupervisorRequest', responseToken: token }) })
      .then((r) => r.json()).then((r) => { if (!r.success) throw new Error(r.error || 'Solicitação não encontrada.'); setDados(r.data); if (r.data?.respondido) setSucesso(true); })
      .catch((e) => setErro(e.message)).finally(() => setLoading(false));
  }, [token]);

  const enviar = async () => {
    if (!mensagem.trim()) { setErro('Informe o retorno do supervisor.'); return; }
    setEnviando(true); setErro('');
    try {
      const r = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'submitSupervisorFeedback', responseToken: token, decisao, mensagem, proximoPasso }) }).then((x) => x.json());
      if (!r.success) throw new Error(r.error || 'Não foi possível registrar o retorno.');
      setSucesso(true);
    } catch (e) { setErro(e.message); } finally { setEnviando(false); }
  };

  if (loading) return <Page><p className="text-sm text-slate-500">Validando solicitação...</p></Page>;
  if (erro && !dados) return <Page><div className="text-rose-600 font-bold text-sm">{erro}</div></Page>;
  if (sucesso) return <Page><div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 grid place-items-center text-2xl">✓</div><h1 className="text-2xl font-black mt-5">Retorno registrado</h1><p className="text-sm text-slate-500 mt-2">Obrigado. O retorno foi encaminhado para o sistema de monitoria da Carvalima.</p></Page>;

  return <Page><div className="text-[10px] uppercase tracking-[.2em] font-black text-blue-600">Carvalima • Qualidade</div><h1 className="text-2xl md:text-3xl font-black mt-3">Retorno da monitoria</h1><p className="text-sm text-slate-500 mt-1">Solicitação direcionada a <b>{dados?.supervisorNome || 'Supervisor'}</b>.</p><div className="mt-6 rounded-2xl border p-5 bg-slate-50"><div className="grid grid-cols-2 gap-4 text-xs"><div><span className="text-slate-400 block">Colaborador</span><b>{dados?.agente || '—'}</b></div><div><span className="text-slate-400 block">Departamento</span><b>{dados?.departamento || '—'}</b></div><div><span className="text-slate-400 block">Monitoria</span><b>{dados?.monitoriaId || '—'}</b></div><div><span className="text-slate-400 block">Nota</span><b>{dados?.nota ?? '—'}</b></div></div></div><div className="mt-5 space-y-4"><label className="block text-xs font-black">Posicionamento<select value={decisao} onChange={(e) => setDecisao(e.target.value)} className="mt-2 w-full border rounded-xl px-3 py-3 text-xs"><option>Ciente</option><option>Orientação realizada</option><option>Plano de ação acordado</option><option>Discordo da avaliação</option><option>Necessita análise conjunta</option></select></label><label className="block text-xs font-black">Retorno do supervisor<textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Descreva o retorno, orientação realizada e/ou justificativa..." className="mt-2 w-full h-36 border rounded-xl px-3 py-3 text-xs resize-none" /></label><label className="block text-xs font-black">Próximo passo<textarea value={proximoPasso} onChange={(e) => setProximoPasso(e.target.value)} placeholder="Opcional: ação combinada, prazo ou acompanhamento..." className="mt-2 w-full h-24 border rounded-xl px-3 py-3 text-xs resize-none" /></label></div>{erro && <div className="mt-4 text-xs text-rose-600 font-bold">{erro}</div>}<button disabled={enviando} onClick={enviar} className="mt-5 w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-black disabled:opacity-50">{enviando ? 'Enviando retorno...' : 'Enviar retorno ao SAC'}</button><p className="text-[10px] text-slate-400 text-center mt-4">Este formulário registra apenas o retorno desta solicitação de monitoria.</p></Page>;
}

function Page({ children }) { return <div className="min-h-screen bg-slate-100 flex items-center justify-center p-5"><div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 p-7 md:p-10">{children}</div></div>; }
