import React, { useEffect, useState } from 'react';

const readSettings = () => {
  try { return JSON.parse(localStorage.getItem('carvalima_qa_settings')) || {}; } catch { return {}; }
};

export default function GmailScriptSettingsView({ darkMode = false, showToast }) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const cfg = readSettings();
    setUrl(cfg.gmailUrl || '');
    setToken(cfg.gmailToken || '');
  }, []);

  const salvar = () => {
    const cfg = readSettings();
    localStorage.setItem('carvalima_qa_settings', JSON.stringify({ ...cfg, gmailUrl: url.trim(), gmailToken: token.trim() }));
    window.dispatchEvent(new Event('carvalima-settings-updated'));
    setStatus('Configuração salva neste navegador.');
    showToast?.('Script Gmail salvo.', 'success');
  };

  const testar = async () => {
    if (!url.trim()) { showToast?.('Informe a URL do Script Gmail.', 'error'); return; }
    setBusy(true); setStatus('Testando conexão...');
    try {
      const r = await fetch(url.trim(), { method: 'GET' }).then((x) => x.json());
      if (!r.success) throw new Error(r.error || 'O Script Gmail respondeu com erro.');
      setStatus(`Conexão OK • ${r.service || 'Script Gmail'}`);
      showToast?.('Conexão com o Script Gmail funcionando.', 'success');
    } catch (e) {
      setStatus(e.message || 'Não foi possível conectar.');
      showToast?.(e.message || 'Falha na conexão.', 'error');
    } finally { setBusy(false); }
  };

  const card = `rounded-2xl border p-6 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`;
  const input = `w-full border rounded-xl px-4 py-3 text-xs outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`;

  return (
    <div className="space-y-5">
      <section className={card}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white grid place-items-center text-xl">✉</div>
          <div><h2 className="text-base font-black">Script Gmail</h2><p className="text-[10px] text-slate-400 mt-1">Integração exclusiva para enviar monitorias pelo Gmail e receber o retorno dos supervisores. Ela é independente da integração do Google Sheets.</p></div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4">
          <label className="block text-xs font-black">URL DO WEB APP GMAIL<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" className={`${input} mt-2`} /></label>
          <label className="block text-xs font-black">TOKEN DO SCRIPT GMAIL<input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Token exclusivo do novo script" className={`${input} mt-2`} /></label>
        </div>
        <div className="flex flex-wrap gap-3 mt-5">
          <button onClick={salvar} className="px-5 py-3 rounded-xl bg-blue-600 text-white text-xs font-black">Salvar configuração</button>
          <button onClick={testar} disabled={busy} className={`px-5 py-3 rounded-xl text-xs font-black border ${darkMode ? 'border-[#33424F]' : 'border-slate-200'} disabled:opacity-50`}>{busy ? 'Testando...' : 'Testar conexão'}</button>
        </div>
        {status && <div className="mt-4 text-xs font-bold text-slate-500">{status}</div>}
      </section>
      <section className={card}>
        <h2 className="text-sm font-black">Fluxo</h2>
        <p className="text-[10px] text-slate-400 mt-2">O sistema identifica o supervisor pelo departamento, gera o PDF, envia pelo Gmail e registra o link de retorno. O supervisor responde pelo link e o retorno pode ser sincronizado com o sistema.</p>
      </section>
    </div>
  );
}
