const fs=require('fs');const path=require('path');
const file=path.join(__dirname,'src','App.jsx');
let s=fs.readFileSync(file,'utf8');
const MARK='CARVALIMA_MONITORIA_ID_MIGRATION_V2';
if(s.includes(MARK)){console.log('Migração de IDs V2 já aplicada.');process.exit(0);}
const start=s.indexOf('// CARVALIMA_MONITORIA_ID_MIGRATION_V1');
const end=s.indexOf('\nconst hexToRgba',start);
if(start<0||end<0) throw new Error('Bloco de migração V1 não encontrado.');
const helper=[
'// '+MARK,
'// Normaliza IDs antigos. A persistência é feita com a API existente saveItem; não usa saveAll.',
'const migrateMonitoriaIdsV2 = async (items = []) => {',
"  if (!Array.isArray(items) || !items.length) return items;",
"  try { if (localStorage.getItem('carvalima_monitoria_ids_v2_migrated') === '1') return items; } catch {}",
'  const parseDate = (item) => { const raw=item?.dataAtendimento || item?.data || item?.created_at || item?.updated_at; const d=raw?new Date(String(raw).length===10?String(raw)+"T00:00:00":raw):new Date(0); return Number.isNaN(d.getTime())?new Date(0):d; };',
'  const fingerprint = (item) => JSON.stringify([item?.dataAtendimento||item?.data||"",String(item?.agente||"").trim().toUpperCase(),String(item?.unidade||"").trim().toUpperCase(),String(item?.departamento||"").trim().toUpperCase(),String(item?.cliente||"").trim().toUpperCase(),String(item?.protocolo||"").trim(),String(item?.nota??""),String(item?.feedback||"").trim()]);',
'  const unique=[]; const seen=new Set(); [...items].sort((a,b)=>parseDate(a)-parseDate(b)).forEach(item=>{ const fp=fingerprint(item); if(seen.has(fp)) return; seen.add(fp); unique.push(item); });',
'  const counters={}; return unique.map(item=>{ const year=String(parseDate(item).getFullYear()); const safeYear=/^\\d{4}$/.test(year)&&year!=="1970"?year:String(new Date().getFullYear()); counters[safeYear]=(counters[safeYear]||0)+1; return {...item,id:safeYear+counters[safeYear]}; });',
'};'
].join('\n');
s=s.slice(0,start)+helper+s.slice(end);
// Não execute a migração durante o boot. Ela é preparada para uma ação explícita,
// evitando travar o carregamento caso o banco local contenha registros legados.
fs.writeFileSync(file,s,'utf8');console.log('Migração de IDs V2 preparada sem alterar o boot.');
