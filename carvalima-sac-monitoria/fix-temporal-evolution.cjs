const fs=require('fs');
const path=require('path');
const file=path.join(__dirname,'src','ModernDashboard.jsx');
let s=fs.readFileSync(file,'utf8');
const MARK='CARVALIMA_TEMPORAL_EVOLUTION_V2';
if(s.includes(MARK)){console.log('Evolução temporal V2 já aplicada.');process.exit(0)};

const helper=`const normalizeDate = (value = '') => {\n  const raw = String(value || '').trim();\n  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(raw)) return raw;\n  const br = raw.match(/^(\\d{2})\\/(\\d{2})\\/(\\d{4})$/);\n  if (br) return \`${br[3]}-\${br[2]}-\${br[1]}\`;\n  return '';\n};\nconst dateOf = (m) => normalizeDate(m?.dataAtendimento || m?.data || '');`;
s=s.replace("const dateOf = (m) => m?.dataAtendimento || '';",helper);

const block=`  const temporalEvolution = useMemo(() => {\n    const map = {};\n    filtered.forEach(m => {\n      const d = normalizeDate(m?.dataAtendimento || m?.data || '');\n      if (!d) return;\n      const month = d.slice(0, 7);\n      if (!map[month]) map[month] = { periodo: month, total: 0, soma: 0, conformes: 0, criticos: 0 };\n      const x = map[month];\n      x.total++;\n      x.soma += scoreOf(m);\n      if (isConforme(m)) x.conformes++;\n      if (scoreOf(m) < 7) x.criticos++;\n    });\n    return Object.values(map).sort((a,b) => a.periodo.localeCompare(b.periodo)).map(x => ({\n      ...x,\n      media: x.total ? x.soma / x.total : 0,\n      conformidade: x.total ? x.conformes / x.total * 100 : 0\n    }));\n  }, [filtered]);\n`;

const temporalRegex=/\\s*const temporalEvolution = useMemo\\(\\(\\) => \\{[\\s\\S]*?\\}, \\[filtered\\]\\);/;
if(temporalRegex.test(s)) s=s.replace(temporalRegex,`\n${block}`); else {
  const anchor="  const recurrence = useMemo(() =>";
  if(!s.includes(anchor)) throw new Error('Âncora da recorrência não encontrada.');
  s=s.replace(anchor,block+anchor);
}

const ui=`<section className={card+" p-5"}><div className="flex flex-col md:flex-row md:items-end justify-between gap-3"><div><span className={\`text-[9px] uppercase font-black tracking-wider \${muted}\`}>Evolução temporal</span><h2 className="text-base font-black mt-1">Qualidade ao longo do tempo</h2><p className={\`text-xs mt-1 \${muted}\`}>Acompanhe volume, nota média, conformidade e críticos por mês.</p></div><div className="text-[10px] font-bold text-slate-400">{temporalEvolution.length} período(s)</div></div>{temporalEvolution.length ? <div className="overflow-x-auto mt-4"><table className="w-full text-xs"><thead><tr className="text-left text-[9px] uppercase tracking-wider text-slate-400 border-b"><th className="py-3 pr-4">Período</th><th className="py-3 pr-4">Monitorias</th><th className="py-3 pr-4">Nota média</th><th className="py-3 pr-4">Conformidade</th><th className="py-3">Críticos</th></tr></thead><tbody>{temporalEvolution.map(x => <tr key={x.periodo} className="border-b last:border-0"><td className="py-3 pr-4 font-black">{x.periodo.split('-').reverse().join('/')}</td><td className="py-3 pr-4">{x.total}</td><td className="py-3 pr-4 font-black">{fmt(x.media)}</td><td className="py-3 pr-4 font-black">{fmt(x.conformidade)}%</td><td className="py-3">{x.criticos}</td></tr>)}</tbody></table></div> : <div className={\`mt-4 p-5 rounded-xl text-xs \${muted}\`}>Ainda não há monitorias com data válida para montar a evolução.</div>}</section>`;
const insertBefore='<section className={`${card} p-4`}>';
const pos=s.indexOf(insertBefore);
if(pos<0) throw new Error('Âncora da UI do dashboard não encontrada.');
s=s.slice(0,pos)+ui+s.slice(pos);
s+=`\n/* ${MARK} */\n`;
fs.writeFileSync(file,s,'utf8');
console.log('Evolução temporal V2 aplicada.');