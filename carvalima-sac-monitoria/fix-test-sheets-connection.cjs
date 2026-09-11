const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let s = fs.readFileSync(file, 'utf8');
const MARK = 'CARVALIMA_SHEETS_CONNECTION_TEST_V1';
if (s.includes(MARK)) {
  console.log('Teste de conexão do Google Sheets já aplicado.');
  process.exit(0);
}

const target = "  const handleSalvar = () => {\n    StorageService.saveSettings({";
const replacement = `  const handleTestarConexao = async () => {
    const url = String(gasUrl || '').trim();
    const token = String(gasToken || '').trim();

    if (!url || !token) {
      showToast('Informe a URL e o Token do Google Apps Script antes de testar.', 'error');
      return;
    }

    try {
      showToast('Testando conexão com Google Sheets...', 'info');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          version: '2026-09-11',
          action: 'sync',
          token,
          tokenSeguranca: token,
          monitorias: []
        })
      });

      const raw = await response.text();
      let result = null;
      try { result = JSON.parse(raw); } catch (_) {}

      if (!response.ok) {
        throw new Error(result?.message || result?.error || \`HTTP \${response.status}\`);
      }

      if (result && result.success === false) {
        throw new Error(result.message || 'O Web App recusou a conexão.');
      }

      if (!result) {
        throw new Error('O Web App respondeu, mas não retornou JSON válido. Verifique a implantação do Apps Script.');
      }

      showToast('Conexão com o Google Apps Script validada com sucesso.', 'success');
    } catch (error) {
      const message = String(error?.message || error || 'Erro desconhecido');
      showToast(\`Falha na conexão: \${message}\`, 'error');
    }
  };

  const handleSalvar = () => {
    StorageService.saveSettings({`;

if (!s.includes(target)) {
  console.error('Alvo do teste de conexão não encontrado.');
  process.exit(1);
}
s = s.replace(target, replacement);

const buttonTarget = "<button onClick={handleSalvar} className=\"px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold\">Salvar Configurações</button>";
const buttonReplacement = `<div className=\"flex flex-wrap gap-2\">
          <button onClick={handleSalvar} className=\"px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold\">Salvar Configurações</button>
          <button onClick={handleTestarConexao} className=\"px-5 py-2.5 rounded-xl border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-bold\">Testar conexão</button>
        </div>`;

if (!s.includes(buttonTarget)) {
  console.error('Botão de configurações não encontrado.');
  process.exit(1);
}
s = s.replace(buttonTarget, buttonReplacement);
s += `\n/* ${MARK} */\n`;
fs.writeFileSync(file, s, 'utf8');
console.log('Botão de teste de conexão do Google Sheets aplicado.');
