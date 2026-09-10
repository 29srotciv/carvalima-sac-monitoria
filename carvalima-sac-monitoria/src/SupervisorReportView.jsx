import React, { useMemo, useRef, useState } from 'react';

const norm = (v = '') =>
  String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const score = (m) => Math.max(0, Math.min(10, Number(m?.nota) || 0));

const dateBR = (v) => {
  if (!v) return '—';
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('pt-BR');
};

const clean = (s) =>
  String(s || '')
    .replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '')
    .replace(/^\s*(?:✅|⚠️|❌|🏆)\s*/, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();

const criteria = (m) => {
  const base = Array.isArray(m?.criterios) ? m.criterios : [];
  const byId = new Map(base.map((c) => [String(c.id), c]));
  const out = [];

  const add = (id, r) => {
    if (!r || typeof r !== 'object' || typeof r.atendeu !== 'boolean') return;
    const c = byId.get(String(id));
    out.push({
      id: String(id),
      titulo: r.titulo || c?.titulo || String(id),
      atendeu: r.atendeu,
      evidencia: r.evidencia || '',
    });
  };

  Object.entries(m?.detalhes || {}).forEach(([id, r]) => add(id, r));
  Object.entries(m?.respostas || {}).forEach(([id, r]) => {
    if (!out.some((x) => String(x.id) === String(id))) add(id, r);
  });

  (Array.isArray(m?.resumoCriterios) ? m.resumoCriterios : []).forEach((r, i) =>
    add(r?.id || `r${i}`, r)
  );

  const text = String(m?.feedback || m?.resumo || m?.resumoCriteriosTexto || '');
  const lines = text
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

  const neg = lines.findIndex((x) =>
    /oportunidades?\s+de\s+melhoria|pontos?\s+de\s+aten[cç][aã]o|falhas?/i.test(x)
  );
  const pos = lines.findIndex((x) =>
    /pontos?\s+positivos?|pontos?\s+fortes?/i.test(x)
  );

  if (neg >= 0) {
    const end = lines.findIndex(
      (x, i) => i > neg && /plano\s+de\s+a[cç][aã]o/i.test(x)
    );
    lines
      .slice(neg + 1, end >= 0 ? end : lines.length)
      .filter((x) => /^[-•*]\s*|^\d+[.)]\s*/.test(x))
      .forEach((x) => {
        const titulo = clean(x);
        if (titulo) {
          out.push({
            id: `neg-${titulo}`,
            titulo,
            atendeu: false,
            evidencia: x.match(/\((.*?)\)/)?.[1] || '',
          });
        }
      });
  }

  if (pos >= 0) {
    const end = neg >= 0 ? neg : lines.length;
    lines
      .slice(pos + 1, end)
      .filter((x) => /^[-•*]\s*|^\d+[.)]\s*/.test(x))
      .forEach((x) => {
        const titulo = clean(x);
        if (titulo) {
          out.push({
            id: `pos-${titulo}`,
            titulo,
            atendeu: true,
            evidencia: '',
          });
        }
      });
  }

  const map = new Map();
  out.forEach((x) => map.set(`${x.atendeu}-${norm(x.titulo)}`, x));
  return [...map.values()];
};

export default function SupervisorReportView({
  monitorias = [],
  darkMode = false,
  departamentos = [],
}) {
  const [tipo, setTipo] = useState('colaborador');
  const [selecionado, setSelecionado] = useState('');
  const [gerando, setGerando] = useState(false);
  const reportRef = useRef(null);

  const colaboradores = useMemo(
    () =>
      [...new Set(monitorias.map((m) => m.agente).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      ),
    [monitorias]
  );

  const data = useMemo(
    () =>
      selecionado
        ? monitorias.filter((m) =>
            tipo === 'colaborador'
              ? norm(m.agente) === norm(selecionado)
              : norm(m.departamento) === norm(selecionado)
          )
        : [],
    [monitorias, tipo, selecionado]
  );

  const stats = useMemo(() => {
    const total = data.length;
    const avg = total ? data.reduce((s, m) => s + score(m), 0) / total : 0;
    const conformes = data.filter((m) => score(m) >= 9).length;
    const criticos = data.filter((m) => score(m) < 7).length;
    const atencao = total - conformes - criticos;
    const fail = {};
    const good = {};
    const rec = {};

    data.forEach((m) => {
      criteria(m).forEach((c) => {
        const k = c.titulo || 'Critério';
        if (c.atendeu === false) {
          fail[k] = (fail[k] || 0) + 1;
          rec[k] = (rec[k] || 0) + 1;
        } else if (c.atendeu === true) {
          good[k] = (good[k] || 0) + 1;
        }
      });
    });

    const list = (o) =>
      Object.entries(o)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

    return {
      total,
      avg,
      conformes,
      criticos,
      atencao,
      conformidade: total ? (conformes / total) * 100 : 0,
      fail: list(fail),
      good: list(good),
      rec: list(rec).filter((x) => x.count >= 2),
      plans: data.filter((m) => m.planoAcao && m.statusPlano !== 'Concluído'),
      feedbacks: data.filter((m) => m.feedbackSupervisor).length,
      latest: [...data].sort((a, b) =>
        String(b.dataAtendimento || '').localeCompare(String(a.dataAtendimento || ''))
      ),
    };
  }, [data]);

  const departmentRanking = useMemo(() => {
    if (tipo !== 'departamento') return [];

    const map = {};
    data.forEach((m) => {
      const k = m.agente || 'Não informado';
      if (!map[k]) map[k] = { nome: k, total: 0, soma: 0, conformes: 0 };
      map[k].total += 1;
      map[k].soma += score(m);
      if (score(m) >= 9) map[k].conformes += 1;
    });

    return Object.values(map)
      .map((x) => ({
        ...x,
        media: x.soma / x.total,
        taxa: (x.conformes / x.total) * 100,
      }))
      .sort((a, b) => b.media - a.media || b.total - a.total);
  }, [data, tipo]);

  const collectiveActions = useMemo(
    () =>
      stats.fail.slice(0, 3).map(
        (x) =>
          `Reforçar ${x.label} com reciclagem, acompanhamento em monitoria e devolutiva direcionada.`
      ),
    [stats.fail]
  );

  const exportPDF = async () => {
    if (!data.length || !reportRef.current) return;

    setGerando(true);
    try {
      const h = window.html2canvas;
      const J = window.jspdf?.jsPDF || window.jsPDF;

      if (!h || !J) {
        window.print();
        return;
      }

      const canvas = await h(reportRef.current, {
        scale: 1.5,
        backgroundColor: '#fff',
        useCORS: true,
        windowWidth: 794,
        width: 794,
      });

      const pdf = new J({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageW = 210;
      const pageH = 297;
      const pagePx = Math.floor((canvas.width * pageH) / pageW);
      let y = 0;
      let p = 0;

      while (y < canvas.height) {
        const sh = Math.min(pagePx, canvas.height - y);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sh;
        slice
          .getContext('2d')
          .drawImage(canvas, 0, y, canvas.width, sh, 0, 0, canvas.width, sh);

        if (p++) pdf.addPage();

        pdf.addImage(
          slice.toDataURL('image/jpeg', 0.92),
          'JPEG',
          0,
          0,
          pageW,
          (sh * pageW) / canvas.width,
          undefined,
          'FAST'
        );

        y += sh;
      }

      const safe =
        norm(selecionado).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
        'relatorio';

      pdf.save(
        `Carvalima_Relatorio_${
          tipo === 'colaborador' ? 'Colaborador' : 'Departamento'
        }_${safe}.pdf`
      );
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setGerando(false);
    }
  };

  const card = `rounded-2xl border p-5 shadow-sm ${
    darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200'
  }`;
  const options = tipo === 'colaborador' ? colaboradores : departamentos;

  return (
    <div
      className={`flex-1 overflow-y-auto ${
        darkMode ? 'bg-[#0B1117] text-white' : 'bg-[#F4F7F9] text-slate-900'
      }`}
    >
      <div className="max-w-[1600px] mx-auto p-5 md:p-8 xl:p-10 space-y-5">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[.22em] text-blue-500">
              Central de qualidade • supervisor
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-2">
              Relatórios para encaminhamento
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Selecione uma única pessoa ou um departamento para gerar uma apresentação executiva.
            </p>
          </div>

          {data.length > 0 && (
            <button
              onClick={exportPDF}
              disabled={gerando}
              className="px-5 py-3 rounded-2xl bg-blue-600 text-white text-xs font-black shadow-lg disabled:opacity-60"
            >
              {gerando ? 'Gerando PDF...' : 'Exportar apresentação em PDF'}
            </button>
          )}
        </header>

        <section className={card}>
          <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] gap-4 items-end">
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 mb-2">
                Tipo
              </label>
              <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setTipo('colaborador');
                    setSelecionado('');
                  }}
                  className={`px-3 py-2.5 rounded-lg text-[10px] font-black ${
                    tipo === 'colaborador' ? 'bg-blue-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Colaborador
                </button>
                <button
                  onClick={() => {
                    setTipo('departamento');
                    setSelecionado('');
                  }}
                  className={`px-3 py-2.5 rounded-lg text-[10px] font-black ${
                    tipo === 'departamento' ? 'bg-blue-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Departamento
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 mb-2">
                {tipo === 'colaborador' ? 'Selecione o colaborador' : 'Selecione o departamento'}
              </label>
              <select
                value={selecionado}
                onChange={(e) => setSelecionado(e.target.value)}
                className="w-full rounded-xl border px-3 py-3 text-xs font-bold bg-transparent"
              >
                <option value="">Selecione...</option>
                {options.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
          </div>

          {!selecionado && (
            <p className="text-[10px] text-slate-400 mt-3">
              A seleção é obrigatória. No modo colaborador, o PDF contém somente as monitorias da pessoa escolhida.
            </p>
          )}

          {selecionado && !data.length && (
            <p className="text-[10px] text-rose-500 mt-3 font-bold">
              Não há monitorias registradas para esta seleção.
            </p>
          )}
        </section>

        {data.length > 0 && (
          <>
            <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Metric l="Monitorias" v={stats.total} d={darkMode} />
              <Metric l="Nota média" v={stats.avg.toFixed(1)} d={darkMode} />
              <Metric l="Conformidade" v={`${stats.conformidade.toFixed(0)}%`} d={darkMode} />
              <Metric l="Críticas" v={stats.criticos} d={darkMode} />
              <Metric l="Feedbacks" v={`${stats.feedbacks}/${stats.total}`} d={darkMode} />
            </section>

            {tipo === 'departamento' && (
              <section className={card}>
                <h2 className="text-lg font-black">Comparação do departamento</h2>
                <p className="text-[10px] text-slate-400 mt-1 mb-4">
                  Desempenho das pessoas monitoradas dentro do departamento selecionado.
                </p>

                <div className="space-y-2">
                  {departmentRanking.slice(0, 10).map((x, i) => (
                    <div
                      key={x.nome}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-[#24313B]"
                    >
                      <b className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 grid place-items-center text-[9px]">
                        {i + 1}
                      </b>
                      <span className="text-[10px] font-bold flex-1 truncate">{x.nome}</span>
                      <span className="text-[10px] text-slate-400">{x.total} monitorias</span>
                      <b className="text-sm">{x.media.toFixed(1)}</b>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-amber-500/10 p-4">
                  <div className="text-[9px] uppercase font-black text-amber-600">
                    Plano de ação coletivo sugerido
                  </div>
                  <div className="mt-2 space-y-1">
                    {collectiveActions.length ? (
                      collectiveActions.map((x, i) => (
                        <div key={i} className="text-[10px] font-semibold">• {x}</div>
                      ))
                    ) : (
                      <div className="text-[10px] text-slate-500">
                        Sem falhas suficientes para sugerir ação coletiva.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Panel title="Pareto de falhas" items={stats.fail} />
              <Panel title="Maiores acertos" items={stats.good} good />
              <Panel title="Reincidências" items={stats.rec} />
              <Panel
                title="Planos de ação pendentes"
                items={stats.plans.map((m) => ({ label: m.planoAcao, count: 1 }))}
                amber
              />
            </section>

            <section className={card}>
              <h2 className="text-lg font-black">Monitorias e feedbacks</h2>
              <p className="text-[10px] text-slate-400 mt-1 mb-4">
                Todas as avaliações incluídas no relatório.
              </p>
              <div className="space-y-2">
                {stats.latest.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl p-3 ${darkMode ? 'bg-[#0B1117]' : 'bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <b className="text-sm">{m.id || '—'}</b>
                      <span className="text-[10px] text-slate-400">{dateBR(m.dataAtendimento)}</span>
                      <span className="text-[10px] font-black ml-auto">Nota {score(m).toFixed(1)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">
                      {m.feedbackSupervisor || m.feedback || m.resumo || 'Sem feedback registrado.'}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div
              ref={reportRef}
              style={{
                position: 'absolute',
                left: '-10000px',
                top: 0,
                width: 794,
                background: '#fff',
                color: '#0F172A',
                padding: 32,
                fontFamily: 'Arial,sans-serif',
              }}
            >
              <div style={{ borderBottom: '3px solid #2563EB', paddingBottom: 18, marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#2563EB' }}>
                  CARVALIMA • CENTRAL DE QUALIDADE
                </div>
                <div style={{ fontSize: 27, fontWeight: 900, marginTop: 8 }}>
                  Relatório de {tipo === 'colaborador' ? 'desempenho individual' : 'qualidade do departamento'}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, marginTop: 6 }}>{selecionado}</div>
                <div style={{ fontSize: 10, color: '#64748B', marginTop: 7 }}>
                  Documento para acompanhamento do supervisor • {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>

              <PrintTitle t="Resumo executivo" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
                {[
                  ['Monitorias', stats.total],
                  ['Nota média', stats.avg.toFixed(1)],
                  ['Conformidade', `${stats.conformidade.toFixed(0)}%`],
                  ['Críticas', stats.criticos],
                ].map(([l, v]) => (
                  <div key={l} style={{ border: '1px solid #E2E8F0', borderRadius: 9, padding: 11 }}>
                    <div style={{ fontSize: 9, color: '#64748B' }}>{l}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>

              {tipo === 'departamento' && (
                <>
                  <PrintTitle t="Comparação do departamento" />
                  {departmentRanking.slice(0, 10).map((x, i) => (
                    <div
                      key={x.nome}
                      style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', padding: '7px 0', fontSize: 9 }}
                    >
                      <b>{i + 1}. {x.nome}</b>
                      <span>{x.total} monitorias • média {x.media.toFixed(1)}</span>
                    </div>
                  ))}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: 9, padding: 10, marginTop: 10, fontSize: 10 }}>
                    <b>Plano de ação coletivo sugerido</b>
                    {collectiveActions.length ? (
                      collectiveActions.map((x, i) => <div key={i} style={{ marginTop: 4 }}>• {x}</div>)
                    ) : (
                      <div style={{ marginTop: 4, color: '#64748B' }}>Sem falhas suficientes para sugerir ação coletiva.</div>
                    )}
                  </div>
                </>
              )}

              <PrintTitle t="Pareto de falhas" />
              <Bars items={stats.fail.slice(0, 10)} color="#EF4444" />
              <PrintTitle t="Maiores acertos" />
              <Bars items={stats.good.slice(0, 10)} color="#10B981" />
              <PrintTitle t="Reincidências" />
              {stats.rec.length ? (
                stats.rec.slice(0, 10).map((x) => (
                  <div key={x.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', padding: '8px 0', fontSize: 10 }}>
                    <b>{x.label}</b>
                    <b style={{ color: '#EF4444' }}>{x.count} ocorrências</b>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: 10, color: '#64748B' }}>Nenhuma reincidência identificada.</p>
              )}

              <PrintTitle t="Planos de ação" />
              {stats.plans.length ? (
                stats.plans.map((m) => (
                  <div key={m.id} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 9, marginBottom: 6, fontSize: 10 }}>
                    <b>{m.id} • {dateBR(m.dataAtendimento)}</b>
                    <div style={{ marginTop: 4 }}>{m.planoAcao}</div>
                    <div style={{ color: '#64748B', marginTop: 3 }}>Prazo: {dateBR(m.prazoPlano)} • Status: {m.statusPlano || 'Pendente'}</div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: 10, color: '#64748B' }}>Nenhum plano de ação pendente.</p>
              )}

              <PrintTitle t={`Monitorias avaliadas (${stats.total})`} />
              {stats.latest.map((m) => (
                <div key={m.id} style={{ borderBottom: '1px solid #E2E8F0', padding: '8px 0', fontSize: 9 }}>
                  <b>{m.id}</b> • {dateBR(m.dataAtendimento)} • Nota <b>{score(m).toFixed(1)}</b>
                  <div style={{ marginTop: 3, color: '#475569' }}>
                    {m.feedbackSupervisor || m.feedback || m.resumo || 'Sem feedback registrado.'}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 22, paddingTop: 10, borderTop: '1px solid #CBD5E1', fontSize: 8, color: '#64748B' }}>
                Carvalima • Movidos pela confiança • Gestão da Qualidade e Performance do SAC
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ l, v, d }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${d ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200'}`}>
      <span className="text-[9px] uppercase font-black text-slate-400">{l}</span>
      <div className="text-2xl font-black text-blue-500 mt-2">{v}</div>
    </div>
  );
}

function Panel({ title, items, good, amber }) {
  return (
    <div className="rounded-2xl border bg-white dark:bg-[#111A22] border-slate-200 dark:border-[#24313B] p-5 shadow-sm">
      <h3 className="text-sm font-black">{title}</h3>
      {items.length ? (
        <div className="mt-4 space-y-2">
          {items.slice(0, 8).map((x, i) => (
            <div key={`${x.label}-${i}`} className="flex gap-3 items-center">
              <span className={`w-7 h-7 rounded-lg grid place-items-center text-[9px] font-black ${good ? 'bg-emerald-500/10 text-emerald-500' : amber ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {x.count}
              </span>
              <span className="text-[10px] font-bold truncate">{x.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-7 text-center text-[10px] text-slate-400">Nenhum registro.</div>
      )}
    </div>
  );
}

function PrintTitle({ t }) {
  return <div style={{ fontSize: 14, fontWeight: 900, marginTop: 20, marginBottom: 8 }}>{t}</div>;
}

function Bars({ items, color }) {
  const max = Math.max(...items.map((x) => x.count), 1);
  if (!items.length) return <p style={{ fontSize: 10, color: '#64748B' }}>Nenhum registro.</p>;

  return (
    <div>
      {items.map((x) => (
        <div key={x.label} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 3 }}>
            <b>{x.label}</b>
            <b>{x.count}</b>
          </div>
          <div style={{ height: 7, background: '#E2E8F0', borderRadius: 4 }}>
            <div style={{ height: 7, width: `${(x.count / max) * 100}%`, background: color, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
