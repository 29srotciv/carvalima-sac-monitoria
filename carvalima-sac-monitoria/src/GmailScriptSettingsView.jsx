import React, { useEffect, useState } from 'react';

const readSettings = () => {
  try { return JSON.parse(localStorage.getItem('carvalima_qa_settings')) || {}; } catch { return {}; }
};

export default function GmailScriptSettingsView({ darkMode = false, showToast }) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const cfg = readSettings();
    setUrl(cfg.gmailUrl || '');
    setToken(cfg.gmailToken || '');
  }, []);

  const salvar = () => {
    const cfg = readSettings();
    localStorage.setItem('carvalima_qa_settings', JSON.stringify({ ...cfg, gmailUrl: url.trim(), gmailToken: token.trim() }));
    window.dispatchEvent(new Event('carvalima-settings-updated'));
    setSalvando(true);
    setTimeout(() => setSalvando(false), 350);
    setStatus('Configuração salva neste navegador.');
    showToast?.('Script Gmail salvo.', 'success');
  };

  const testar = async () => {
    if (!url.trim()) { showToast?.('Informe a URL do Script Gmail.', 'error'); return; }
    setTestando(true); setStatus('Testando conexão...');
    try {
      const r = await fetch(url.trim(), { method: 'GET' }).then((x) => x.json());
      if (!r.success) throw new Error(r.error || 'O Script Gmail respondeu com erro.');
      setStatus(`Conexão OK • ${r.service || 'Script Gmail'}`);
      showToast?.('Conexão com o Script Gmail funcionando.', 'success');
    } catch (e) {
      setStatus(e.message || 'Não foi possível conectar.');
      showToast?.(e.message || 'Falha na conexão.', 'error');
    } finally { setTestando(false); }
  };

  const card = `rounded-2xl border p-6 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`;
  const input = `w-full border rounded-xl px-4 py-3 text-xs outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`;

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 ${darkMode ? 'bg-[#0B1117] text-white' : 'bg-[#F5F7F8] text-slate-900'}`}>
      <header>
        <span className="text-[9px] font-black uppercase tracking-[.22em] text-blue-500">Integração • comunicação</span>
        <h1 className="text-3xl font-black mt-2">Script Gmail</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">Integração exclusiva para envio de monitorias pelo Gmail e recebimento do retorno dos supervisores. Ela fica separada da integração usada para sincronizar o Google Sheets.</p>
      </header>

      <section className={card}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white grid place-items-center text-xl">✉</div>
          <div><h2 className="text-base font-black">Conexão do Web App Gmail</h2><p className="text-[10px] text-slate-400 mt-1">Cole aqui a URL do novo Google Apps Script publicado como Aplicativo da Web.</p></div>
        </div>
        <div className="mt-6 space-y-4">
          <label className="block text-xs font-black">URL DO WEB APP GMAIL<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" className={`${input} mt-2`} /></label>
          <label className="block text-xs font-black">TOKEN DO SCRIPT GMAIL<input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Token exclusivo do novo script" className={`${input} mt-2`} /></label>
        </div>
        <div className="flex flex-wrap gap-3 mt-5">
          <button onClick={salvar} className="px-5 py-3 rounded-xl bg-blue-600 text-white text-xs font-black">{salvando ? 'Salvo ✓' : 'Salvar configuração'}</button>
          <button onClick={testar} disabled={testando} className={`px-5 py-3 rounded-xl text-xs font-black border ${darkMode ? 'border-[#33424F]' : 'border-slate-200'} disabled:opacity-50`}>{testando ? 'Testando...' : 'Testar conexão'}</button>
        </div>
        {status && <div className="mt-4 text-xs font-bold text-slate-500">{status}</div>}
      </section>

      <section className={card}>
        <h2 className="text-base font-black">Como será usado</h2>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl border p-4"><b className="text-xs">1. Sistema</b><p className="text-[10px] text-slate-400 mt-1">O sistema identifica o supervisor pelo departamento e envia a monitoria.</p></div>
          <div className="rounded-xl border p-4"><b className="text-xs">2. Gmail</b><p className="text-[10px] text-slate-400 mt-1">O novo Apps Script envia o e-mail formal e anexa o PDF.</p></div>
          <div className="rounded-xl border p-4"><b className="text-xs">3. Retorno</b><p className="text-[10px] text-slate-400 mt-1">O supervisor abre o link, responde e o retorno fica registrado na planilha.</p></div>
        </div>
      </section>
    </div>
  );
}
