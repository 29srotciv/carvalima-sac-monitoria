const fs=require('fs');const path=require('path');
const file=path.join(__dirname,'src','App.jsx');
let s=fs.readFileSync(file,'utf8');
const MARK='CARVALIMA_SHEETS_SYNC_HARDENING_V1';
if(s.includes(MARK)){console.log('Sheets sync hardening já aplicado.');process.exit(0);}
const old='token: config.gasToken';
if(s.includes(old)) s=s.replace(old,'tokenSeguranca: config.gasToken');
const toast="        showToast(`Sincronização concluída! ${result.created || 0} novas, ${result.updated || 0} atualizadas.`, 'success');";
if(s.includes(toast)&&!s.includes("Array.isArray(result.monitorias)")){
 s=s.replace(toast,[
 '        if (Array.isArray(result.monitorias)) {',
 "          await StorageService.saveAll('monitorias', result.monitorias);",
 "          setMonitorias([...result.monitorias].filter(m => !m.deleted).sort((a,b) => new Date(b.dataAtendimento || 0) - new Date(a.dataAtendimento || 0)));",
 '        }',toast].join('\n'));
}
s += '\n/* '+MARK+' */\n';
fs.writeFileSync(file,s,'utf8');
console.log('Sheets sync hardening aplicado.');
