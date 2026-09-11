const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, 'src', 'App.jsx');
const MARKER = 'CARVALIMA_MONITORIA_ID_MIGRATION_V1';

let source = fs.readFileSync(APP, 'utf8');
if (source.includes(MARKER)) {
  console.log('Migração de IDs já integrada.');
  process.exit(0);
}

const helper = `\n// ${MARKER}\n// Converte IDs antigos das monitorias para ANO + sequência, preservando a ordem cronológica.\nconst migrateMonitoriaIds = (items = []) => {\n  if (!Array.isArray(items) || !items.length) return items;\n  try {\n    if (localStorage.getItem('carvalima_monitoria_ids_v1_migrated') === '1') return items;\n  } catch {}\n\n  const parseDate = (item) => {\n    const raw = item?.dataAtendimento || item?.data || item?.created_at || item?.updated_at;\n    const date = raw ? new Date(raw) : new Date(0);\n    return Number.isNaN(date.getTime()) ? new Date(0) : date;\n  };\n\n  const sorted = [...items].sort((a, b) => {\n    const diff = parseDate(a).getTime() - parseDate(b).getTime();\n    if (diff !== 0) return diff;\n    return String(a?.created_at || a?.updated_at || a?.id || '').localeCompare(String(b?.created_at || b?.updated_at || b?.id || ''));\n  });\n\n  const counters = {};\n  const migrated = sorted.map((item) => {\n    const year = String(parseDate(item).getFullYear());\n    const safeYear = /^\\d{4}$/.test(year) && year !== '1970' ? year : String(new Date().getFullYear());\n    counters[safeYear] = (counters[safeYear] || 0) + 1;\n    return { ...item, id: safeYear + counters[safeYear] };\n  });\n\n  try { localStorage.setItem('carvalima_monitoria_ids_v1_migrated', '1'); } catch {}\n  return migrated;\n};\n`;

const anchor = "const hexToRgba = (hex, alpha = 1) => {";
const pos = source.indexOf(anchor);
if (pos < 0) throw new Error('Âncora do tema não encontrada em App.jsx.');
source = source.slice(0, pos) + helper + '\n' + source.slice(pos);

const loadAnchor = "      let m = await StorageService.get('monitorias');";
const loadPos = source.indexOf(loadAnchor);
if (loadPos < 0) throw new Error('Carregamento de monitorias não encontrado em App.jsx.');
const replacement = "      let m = await StorageService.get('monitorias');\n      const migratedMonitorias = migrateMonitoriaIds(m);\n      if (migratedMonitorias !== m) {\n        for (const item of migratedMonitorias) await StorageService.saveItem('monitorias', item);\n        m = migratedMonitorias;\n      }";
source = source.replace(loadAnchor, replacement);

fs.writeFileSync(APP, source);
console.log('Migração de IDs das monitorias integrada com sucesso.');
