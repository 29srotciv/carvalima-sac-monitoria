const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, 'src', 'App.jsx');
const COMM = path.join(__dirname, 'src', 'SupervisorCommunicationView.jsx');
const MARK = 'CARVALIMA_QUALITY_HARDENING_V1';

let app = fs.readFileSync(APP, 'utf8');
if (!app.includes(MARK)) {
  const start = app.indexOf('  const handleExportPDF = async (filtrado = true) => {');
  const end = app.indexOf('\n  return (', start);
  if (start < 0 || end < 0) throw new Error('handleExportPDF não encontrado em App.jsx.');

  const fn = [
    '  const handleExportPDF = async (filtrado = true) => {',
    '    const dataset = (filtrado ? dadosFiltrados : monitorias).filter(m => !m.deleted);',
    "    if (!dataset.length) { showToast('Nenhum dado para exportar.', 'error'); return; }",
    '    setExportando(true); setModalExportOpen(false);',
    "    showToast('Gerando relatório executivo em PDF...', 'info');",
    '    try {',
    "      const J = window.jspdf?.jsPDF || window.jsPDF;",
    "      if (!J) throw new Error('Biblioteca PDF não carregada.');",
    "      const settings = StorageService.getSettings ? StorageService.getSettings() : {};",
    "      const primaryHex = settings.primaryColor || '#2563EB';",
    "      const secondaryHex = settings.secondaryColor || '#1E3A8A';",
    '      const hexRgb = (hex, fallback) => {',
    '        const v = String(hex || "").replace("#", "");',
    '        if (!/^[0-9a-fA-F]{6}$/.test(v)) return fallback;',
    '        return [parseInt(v.slice(0,2),16), parseInt(v.slice(2,4),16), parseInt(v.slice(4,6),16)];',
    '      };',
    '      const primary = hexRgb(primaryHex, [37,99,235]);',
    '      const secondary = hexRgb(secondaryHex, [30,58,138]);',
    '      const dark = [23,32,42], muted = [100,116,139], line = [226,232,240];',
    '      const pdf = new J({ orientation: "portrait", unit: "mm", format: "a4", compress: true });',
    '      const W = 210, M = 16, CW = W - M * 2, FOOT = 283;',
    '      let page = 1, y = 17;',
    '      const clean = (v) => String(v == null ? "" : v).replace(/[\\u0000-\\u001F]/g, " ").replace(/&amp;/gi, "&").replace(/&nbsp;/gi, " ").replace(/\\s+/g, " ").trim();',
    '      const score = (m) => Math.max(0, Math.min(10, Number(m?.nota) || 0));',
    '      const status = (m) => score(m) >= 9 ? "CONFORME" : score(m) >= 7 ? "EM ATENÇÃO" : "CRÍTICO";',
    '      const rowsOf = (m) => {',
    '        const out = [], seen = new Set();',
    '        const add = (id, r, fallback) => {',
    '          if (!r || typeof r !== "object" || typeof r.atendeu !== "boolean") return;',
    '          const title = clean(r.titulo || fallback || id); if (!title) return;',
    '          const key = title.toLowerCase() + "|" + r.atendeu; if (seen.has(key)) return; seen.add(key);',
    '          out.push({ titulo: title, atendeu: r.atendeu, evidencia: clean(r.evidencia || "") });',
    '        };',
    '        const criteria = Array.isArray(m.criterios) ? m.criterios : [];',
    '        const byId = {}; criteria.forEach(c => { byId[String(c.id)] = c.titulo; });',
    '        Object.entries(m.detalhes || {}).forEach(([id,r]) => add(id,r,byId[id]));',
    '        Object.entries(m.respostas || {}).forEach(([id,r]) => add(id,r,byId[id]));',
    '        (Array.isArray(m.resumoCriterios) ? m.resumoCriterios : []).forEach((r,i) => add(r?.id || ("r" + i), r, r?.titulo));',
    '        return out;',
    '      };',
    '      const allRows = dataset.flatMap(rowsOf);',
    '      const failures = {}; allRows.filter(r => !r.atendeu).forEach(r => { failures[r.titulo] = (failures[r.titulo] || 0) + 1; });',
    '      const failureList = Object.entries(failures).map(([label,count]) => ({label,count})).sort((a,b) => b.count-a.count).slice(0,8);',
    '      const recurrence = {}; dataset.forEach(m => rowsOf(m).filter(r => !r.atendeu).forEach(r => { const key = clean(m.agente || "Não informado") + "|" + r.titulo; recurrence[key] = recurrence[key] || {agente:clean(m.agente || "Não informado"), criterio:r.titulo, vezes:0}; recurrence[key].vezes++; }));',
    '      const recurrenceList = Object.values(recurrence).filter(x => x.vezes >= 2).sort((a,b) => b.vezes-a.vezes).slice(0,8);',
    '      const total = dataset.length, avg = total ? dataset.reduce((s,m) => s + score(m), 0) / total : 0;',
    '      const conformes = dataset.filter(m => score(m) >= 9).length, atencao = dataset.filter(m => score(m) >= 7 && score(m) < 9).length, criticos = dataset.filter(m => score(m) < 7).length;',
    '      const conformidade = total ? (conformes / total) * 100 : 0;',
    '      const dept = {}; dataset.forEach(m => { const d = clean(m.departamento || "Não informado"); dept[d] = (dept[d] || 0) + 1; });',
    '      const deptList = Object.entries(dept).sort((a,b) => b[1]-a[1]);',
    '      const plans = dataset.filter(m => m.planoAcao && m.statusPlano !== "Concluído").length;',
    '      const fmtDate = (v) => { if (!v) return "—"; const d = new Date(String(v).length === 10 ? String(v) + "T00:00:00" : v); return Number.isNaN(d.getTime()) ? clean(v) : d.toLocaleDateString("pt-BR"); };',
    '      const header = () => {',
    '        pdf.setFillColor(...primary); pdf.rect(0,0,W,7,"F");',
    '        pdf.setFont("helvetica","bold"); pdf.setFontSize(8); pdf.setTextColor(...primary); pdf.text("CARVALIMA • CENTRAL DE QUALIDADE", M, 13);',
    '        pdf.setFont("helvetica","normal"); pdf.setFontSize(7); pdf.setTextColor(...muted); pdf.text("Relatório executivo de monitorias", W-M, 13, {align:"right"});',
    '      };',
    '      const footer = () => { pdf.setDrawColor(...line); pdf.line(M,FOOT,W-M,FOOT); pdf.setFont("helvetica","normal"); pdf.setFontSize(7); pdf.setTextColor(...muted); pdf.text("Carvalima • Sistema de Gestão de Qualidade • Movidos pela confiança", M, 289); pdf.text("Página " + page, W-M, 289, {align:"right"}); };',
    '      const newPage = () => { footer(); pdf.addPage(); page++; y = 20; header(); };',
    '      const ensure = (h) => { if (y + h > 276) newPage(); };',
    '      const title = (txt) => { ensure(14); pdf.setFont("helvetica","bold"); pdf.setFontSize(12); pdf.setTextColor(...secondary); pdf.text(clean(txt), M, y); y += 7; pdf.setDrawColor(...line); pdf.line(M,y,W-M,y); y += 6; };',
    '      const para = (txt, size=8.5, color=dark, max=CW, gap=4.4) => { const parts = pdf.splitTextToSize(clean(txt) || "—", max); pdf.setFont("helvetica","normal"); pdf.setFontSize(size); pdf.setTextColor(...color); parts.forEach(p => { ensure(gap+1); pdf.text(p,M,y); y += gap; }); };',
    '      const kpi = (x, label, value, sub) => { pdf.setFillColor(248,250,252); pdf.setDrawColor(...line); pdf.roundedRect(x,y,42,24,3,3,"FD"); pdf.setFont("helvetica","bold"); pdf.setFontSize(6.8); pdf.setTextColor(...muted); pdf.text(label.toUpperCase(),x+4,y+6); pdf.setFontSize(15); pdf.setTextColor(...secondary); pdf.text(value,x+4,y+15); pdf.setFont("helvetica","normal"); pdf.setFontSize(6.5); pdf.setTextColor(...muted); pdf.text(sub,x+4,y+20); };',
    '      header();',
    '      pdf.setFont("helvetica","bold"); pdf.setFontSize(21); pdf.setTextColor(...dark); pdf.text("Relatório executivo de qualidade", M, 27);',
    '      pdf.setFont("helvetica","normal"); pdf.setFontSize(8.5); pdf.setTextColor(...muted); pdf.text((filtrado ? "Resultados conforme filtros aplicados" : "Base completa de monitorias"), M, 34);',
    '      pdf.text("Emitido em " + new Date().toLocaleString("pt-BR"), W-M, 34, {align:"right"}); y = 47;',
    '      kpi(M,"Monitorias",String(total),"registros"); kpi(M+44,"Nota média",avg.toFixed(1),"escala 0–10"); kpi(M+88,"Conformidade",conformidade.toFixed(1)+"%",conformes+" conformes"); kpi(M+132,"Atenção",String(atencao),"7,0 a 8,9");',
    '      y += 31; title("Resumo executivo");',
    '      let resumo = "Foram analisadas " + total + " monitorias, com nota média de " + avg.toFixed(1) + "/10. ";',
    '      resumo += conformes + " avaliações estão conformes, " + atencao + " em atenção e " + criticos + " em situação crítica. ";',
    '      if (deptList.length) resumo += "O departamento com maior volume de avaliações foi " + deptList[0][0] + " (" + deptList[0][1] + " registros). ";',
    '      if (failureList.length) resumo += "A principal oportunidade identificada foi " + failureList[0].label + " (" + failureList[0].count + " ocorrência(s)).";',
    '      para(resumo,8.8,[51,65,85],CW,4.7);',
    '      title("Principais oportunidades de melhoria");',
    '      if (!failureList.length) para("Não foram identificadas falhas registradas nos critérios estruturados.",8.5,[51,65,85],CW,4.5);',
    '      failureList.forEach((x,i) => { ensure(9); pdf.setFont("helvetica","bold"); pdf.setFontSize(8.2); pdf.setTextColor(...dark); pdf.text((i+1)+". "+clean(x.label),M,y); pdf.setFont("helvetica","normal"); pdf.setFontSize(8); pdf.setTextColor(...muted); pdf.text(x.count+" ocorrência(s)",W-M,y,{align:"right"}); y += 6; });',
    '      if (recurrenceList.length) { title("Recorrências por colaborador"); recurrenceList.forEach((x,i) => { ensure(11); pdf.setFont("helvetica","bold"); pdf.setFontSize(8); pdf.setTextColor(...dark); pdf.text((i+1)+". "+clean(x.agente),M,y); pdf.setFont("helvetica","normal"); pdf.setTextColor(...muted); pdf.text(clean(x.criterio),M+58,y); pdf.text(x.vezes+"x",W-M,y,{align:"right"}); y += 6; }); }',
    '      title("Planos de ação"); para(plans ? (plans + " monitoria(s) possuem plano de ação pendente.") : "Não há planos de ação pendentes na seleção.",8.5,[51,65,85],CW,4.5);',
    '      title("Detalhamento das monitorias");',
    '      dataset.forEach((m,i) => {',
    '        const rows = rowsOf(m), st = status(m); ensure(25);',
    '        const boxTop = y; pdf.setFillColor(248,250,252); pdf.setDrawColor(...line); pdf.roundedRect(M,boxTop,CW,18,3,3,"FD");',
    '        pdf.setFont("helvetica","bold"); pdf.setFontSize(8.5); pdf.setTextColor(...secondary); pdf.text((i+1)+" • "+clean(m.id || "Sem ID"),M+5,boxTop+6);',
    '        pdf.setFont("helvetica","normal"); pdf.setFontSize(7.2); pdf.setTextColor(...muted); pdf.text(clean(m.agente || "Não informado"),M+48,boxTop+6); pdf.text(clean(m.departamento || "—"),M+48,boxTop+11);',
    '        pdf.text(fmtDate(m.dataAtendimento),M+125,boxTop+6); pdf.text(clean(m.unidade || "—"),M+125,boxTop+11);',
    '        pdf.setFont("helvetica","bold"); pdf.setFontSize(9); pdf.setTextColor(...(score(m)>=9?[22,101,52]:score(m)>=7?[146,64,14]:[185,28,28])); pdf.text("Nota "+score(m).toFixed(1)+" • "+st,W-M-5,boxTop+8,{align:"right"});',
    '        y = boxTop + 23;',
    '        if (rows.length) { rows.forEach(r => { const prefix = r.atendeu ? "✓ " : "✕ "; const ev = r.evidencia ? " — " + r.evidencia : ""; const txt = prefix + clean(r.titulo) + ev; const parts = pdf.splitTextToSize(txt,CW-8); ensure(Math.min(parts.length,2)*4+5); pdf.setFont("helvetica",r.atendeu?"normal":"bold"); pdf.setFontSize(7.6); pdf.setTextColor(...(r.atendeu?[51,65,85]:[153,27,27])); pdf.text(parts.slice(0,2),M+4,y); y += Math.min(parts.length,2)*4+2; }); }',
    '        else { para(clean(m.feedback || "Sem detalhamento estruturado."),7.8,[51,65,85],CW-8,4.1); }',
    '        if (m.planoAcao) { ensure(8); pdf.setFont("helvetica","bold"); pdf.setFontSize(7.5); pdf.setTextColor(...secondary); pdf.text("Plano de ação: ",M+4,y); pdf.setFont("helvetica","normal"); pdf.setTextColor(...dark); const pp=pdf.splitTextToSize(clean(m.planoAcao),CW-38); pdf.text(pp.slice(0,2),M+34,y); y += Math.min(pp.length,2)*4+2; }',
    '        y += 4;',
    '      });',
    '      footer();',
    '      const safe = (filtrado ? "Filtrado" : "Geral") + "_" + new Date().toISOString().slice(0,10);',
    '      pdf.save("Carvalima_QA_Relatorio_Executivo_" + safe + ".pdf");',
    '      setExportando(false); showToast("Relatório executivo em PDF gerado com sucesso!", "success");',
    '    } catch (err) { console.error(err); setExportando(false); showToast("Erro ao gerar relatório PDF: " + (err.message || "falha desconhecida"), "error"); }',
    '  };',
    '  // ' + MARK
  ].join('\n');
  app = app.slice(0, start) + fn + app.slice(end);
  fs.writeFileSync(APP, app, 'utf8');
  console.log('Exportação PDF executiva reescrita.');
} else console.log('Hardening já presente em App.jsx.');

let comm = fs.readFileSync(COMM, 'utf8');
if (!comm.includes(MARK)) {
  const start = comm.indexOf('const criteriaLines = (m = {}) => {');
  const end = comm.indexOf('\n\nconst cleanText', start);
  if (start >= 0 && end >= 0) {
    const parser = [
      'const criteriaLines = (m = {}) => {',
      '  const rows = [], seen = new Set();',
      '  const base = Array.isArray(m.criterios) ? m.criterios : [];',
      '  const byId = {}; base.forEach(c => { byId[String(c.id)] = c.titulo; });',
      '  const add = (id, r, fallback) => {',
      '    if (!r || typeof r !== "object" || typeof r.atendeu !== "boolean") return;',
      '    const titulo = cleanText(r.titulo || fallback || id); if (!titulo) return;',
      '    const key = String(titulo).toLowerCase() + "|" + String(r.atendeu); if (seen.has(key)) return; seen.add(key);',
      '    rows.push({ id, titulo, atendeu: r.atendeu, evidencia: cleanText(r.evidencia || "") });',
      '  };',
      '  Object.entries(m.detalhes || {}).forEach(([id,r]) => add(id,r,byId[id]));',
      '  Object.entries(m.respostas || {}).forEach(([id,r]) => add(id,r,byId[id]));',
      '  (Array.isArray(m.resumoCriterios) ? m.resumoCriterios : []).forEach((r,i) => add(r?.id || ("r"+i),r,r?.titulo));',
      '  if (!rows.length) {',
      '    const text = String(m.feedback || m.resumo || m.resumoCriteriosTexto || "");',
      '    const lines = text.split(/\\r?\\n/).map(x => x.trim()).filter(Boolean);',
      '    const neg = lines.findIndex(x => /oportunidades?\\s+de\\s+melhoria|pontos?\\s+de\\s+aten[cç][aã]o|falhas?/i.test(x));',
      '    const pos = lines.findIndex(x => /pontos?\\s+positivos?|pontos?\\s+fortes?/i.test(x));',
      '    if (pos >= 0) lines.slice(pos+1, neg >= 0 ? neg : lines.length).filter(x => /^[-•*]\\s*|^\\d+[.)]\\s*/.test(x)).forEach((x,i) => add("pos-"+i,{atendeu:true,titulo:x.replace(/^[-•*\\d.)\\s]+/,"")},""));',
      '    if (neg >= 0) lines.slice(neg+1).filter(x => /^[-•*]\\s*|^\\d+[.)]\\s*/.test(x)).forEach((x,i) => add("neg-"+i,{atendeu:false,titulo:x.replace(/^[-•*\\d.)\\s]+/,""),evidencia:(x.match(/\\((.*?)\\)/)||[])[1]||""},""));',
      '  }',
      '  return rows;',
      '};',
      '',
      '// ' + MARK
    ].join('\n');
    comm = comm.slice(0, start) + parser + comm.slice(end);
    fs.writeFileSync(COMM, comm, 'utf8');
    console.log('Parser do PDF de supervisor reforçado.');
  }
} else console.log('Hardening já presente em SupervisorCommunicationView.jsx.');
