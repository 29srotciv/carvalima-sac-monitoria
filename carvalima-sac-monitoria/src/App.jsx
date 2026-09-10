import React, { useState, useMemo, useEffect, useRef } from 'react';

const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  Monitorias: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
  CheckSquare: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Import: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  Export: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>,
  Pdf: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>,
  CloudSync: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v6m0 0l-3-3m3 3l3-3"/></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Sun: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  Moon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  Filter: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>,
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
};

const UNIDADES_INICIAIS = ['CGB', 'ROO', 'CGR', 'DRD', 'LDB', 'CWB', 'JVE', 'NGT', 'ITAJAI', 'SAO', 'RBO', 'PVH', 'JIP', 'VHA', 'BEL', 'MATRIZ'];
const DEPARTAMENTOS = ['Filiais - Comercial', 'Filiais - Financeiro', 'Filiais - Pendência', 'Unidades', 'Embarcadoras'];
const CANAIS_ATENDIMENTO = ['Telefone', 'Sacflow'];

const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

const DEFAULT_FILTERS = {
  busca: '',
  periodo: 'TODOS',
  dataInicio: '',
  dataFim: '',
  departamento: 'TODOS',
  colaborador: 'TODOS',
  unidade: 'TODOS',
  canal: 'TODOS',
  status: 'TODOS',
  notaMin: '',
  notaMax: ''
};

const DEFAULT_THEME = {
  primaryColor: '#2563EB',
  secondaryColor: '#1E3A8A'
};

const hexToRgba = (hex, alpha = 1) => {
  const value = String(hex || '').replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return `rgba(37, 99, 235, ${alpha})`;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const AGENTES_COMERCIAL = [
  'CASSIO EICH', 'ESDRAS COUTINHO DE OLIVEIRA', 'FAGNER MORAES', 'GLAUBER SALVADOR',
  'JESSICA ROCHA', 'JOSÉ LUCAS', 'KAROLINE BARBOSA', 'LAURA MADEIRA LEMOS',
  'LESLIE MANOELA', 'LOHRANY OLIVEIRA', 'MARCOS VINICIUS OLIVEIRA',
  'PAOLA CRISTINA GONCALVES', 'ROSANGELA BATISTA', 'SIDNEY MATHEUS', 'WEDERSON MARQUES'
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

const METAS_MONITORIA = {
  'Filiais - Comercial': { dia: 7, mes: 140 },
  'Filiais - Financeiro': { dia: 1, mes: 20 },
  'Filiais - Pendência': { dia: 1, mes: 20 },
  'Unidades': { dia: 5, mes: 100 },
  'Embarcadoras': { dia: 1, mes: 20 },
  'TOTAL': { dia: 15, mes: 300 }
};

const CRITERIOS_GENERICOS_COMERCIAL = [
  { id: 'c1', titulo: 'Atender o Cliente', desc: 'Realiza o script de atendimento inicial corretamente.' },
  { id: 'c2', titulo: 'Personalização', desc: 'Anota e utiliza o nome do cliente no mínimo 3 vezes durante a ligação.' },
  { id: 'c3', titulo: 'Sondagem Completa', desc: 'Faz as perguntas certas e investiga a necessidade do cliente.' },
  { id: 'c4', titulo: 'Analisa e Repassa Informações', desc: 'Acessa rapidamente o sistema e transmite com clareza.' },
  { id: 'c5', titulo: 'Tempo', desc: 'Realiza o atendimento em tempo hábil.' },
  { id: 'c6', titulo: 'Procedimento', desc: 'Segue as regras e processos internos para cotações e rastreio.' },
  { id: 'c7', titulo: 'Demonstra Interesse', desc: 'Escuta ativamente, não interrompe e mostra empatia.' },
  { id: 'c8', titulo: 'Cordialidade e Linguagem', desc: 'Usa tom de voz agradável e não usa gírias.' },
  { id: 'c9', titulo: 'Compromisso de Follow-up', desc: 'Se aplicável, compromete-se com prazo para retorno e o realiza.' },
  { id: 'c10', titulo: 'Encerramento', desc: 'Pergunta se há algo mais a ajudar e se despede cordialmente.' }
];

const CRITERIOS_POR_DEPARTAMENTO = {
  'Filiais - Comercial': CRITERIOS_GENERICOS_COMERCIAL,
  'Unidades': CRITERIOS_GENERICOS_COMERCIAL,
  'Embarcadoras': CRITERIOS_GENERICOS_COMERCIAL,
  'Filiais - Pendência': [
    { id: 'p1', titulo: 'Atender o Cliente', desc: 'Inicia o contato ou responde à tratativa de forma profissional.' },
    { id: 'p2', titulo: 'Personalização', desc: 'Trata o cliente pelo nome durante a interação.' },
    { id: 'p3', titulo: 'Demonstra Interesse', desc: 'Empatia e proatividade na busca pela solução da pendência.' },
    { id: 'p4', titulo: 'Analisa o Sistema', desc: 'Verifica todo o histórico da nota antes de passar posição.' },
    { id: 'p5', titulo: 'Repassa as Informações', desc: 'Comunica o status real de forma transparente.' },
    { id: 'p6', titulo: 'Procedimento', desc: 'Aciona corretamente as filiais e motoristas.' },
    { id: 'p7', titulo: 'Tempo', desc: 'Dá andamento rápido, cumprindo o SLA.' },
    { id: 'p8', titulo: 'Resolução / Conclusão', desc: 'Foca em fechar a pendência de forma definitiva.' },
    { id: 'p9', titulo: 'Cordialidade e Linguagem', desc: 'Mantém o profissionalismo.' },
    { id: 'p10', titulo: 'Encerramento', desc: 'Confirma o entendimento da tratativa.' }
  ],
  'Filiais - Financeiro': [
    { id: 'f1', titulo: 'Atender o Cliente', desc: 'Abertura padrão, identificando-se.' },
    { id: 'f2', titulo: 'Personalização', desc: 'Uso do nome do cliente ou da empresa.' },
    { id: 'f3', titulo: 'Identificação da Solicitação', desc: 'Entende se é 2ª via, prorrogação ou conciliação.' },
    { id: 'f4', titulo: 'Análise Financeira', desc: 'Checa relatórios e baixas com precisão.' },
    { id: 'f5', titulo: 'Sondagem Completa', desc: 'Questiona dados cruciais (CNPJ).' },
    { id: 'f6', titulo: 'Resolução', desc: 'Emite boletos ou transfere corretamente.' },
    { id: 'f7', titulo: 'Demonstra Interesse', desc: 'Age como facilitador para regularização.' },
    { id: 'f8', titulo: 'Cordialidade e Linguagem', desc: 'Comunicações claras sobre juros e prazos.' },
    { id: 'f9', titulo: 'Tempo', desc: 'Agilidade no envio de documentos.' },
    { id: 'f10', titulo: 'Encerramento', desc: 'Garante que não restam dúvidas.' }
  ]
};

const filterMonitorias = (monitorias, filters) => {
  return monitorias.filter(m => {
    if (m.deleted) return false;

    if (filters.busca && filters.busca.trim() !== '') {
      const q = filters.busca.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      const targetText = [
        m.id, m.protocolo, m.agente, m.cliente, m.departamento, m.unidade,
        m.canal, m.feedback
      ].filter(Boolean).join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      if (!targetText.includes(q)) return false;
    }

    if (filters.periodo && filters.periodo !== 'TODOS') {
      const dataAtend = m.dataAtendimento;
      if (!dataAtend) return false;
      const hojeStr = getLocalDateString();
      
      if (filters.periodo === 'HOJE') {
        if (dataAtend !== hojeStr) return false;
      } else if (filters.periodo === 'ONTEM') {
        const ontem = new Date(); ontem.setDate(ontem.getDate() - 1);
        if (dataAtend !== getLocalDateString(ontem)) return false;
      } else if (filters.periodo === 'ULTIMOS_7') {
        const limite = new Date(); limite.setDate(limite.getDate() - 7);
        if (dataAtend < getLocalDateString(limite)) return false;
      } else if (filters.periodo === 'ULTIMOS_30') {
        const limite = new Date(); limite.setDate(limite.getDate() - 30);
        if (dataAtend < getLocalDateString(limite)) return false;
      } else if (filters.periodo === 'ESTE_MES') {
        const mesAtual = hojeStr.substring(0, 7);
        if (!dataAtend.startsWith(mesAtual)) return false;
      } else if (filters.periodo === 'MES_ANTERIOR') {
        const dAnt = new Date(); dAnt.setMonth(dAnt.getMonth() - 1);
        const mesAntStr = getLocalDateString(dAnt).substring(0, 7);
        if (!dataAtend.startsWith(mesAntStr)) return false;
      } else if (filters.periodo === 'PERSONALIZADO') {
        if (filters.dataInicio && dataAtend < filters.dataInicio) return false;
        if (filters.dataFim && dataAtend > filters.dataFim) return false;
      }
    }

    if (filters.departamento && filters.departamento !== 'TODOS') {
      if (m.departamento !== filters.departamento) return false;
    }

    if (filters.colaborador && filters.colaborador !== 'TODOS') {
      if ((m.agente || '').trim().toUpperCase() !== filters.colaborador.trim().toUpperCase()) return false;
    }

    if (filters.unidade && filters.unidade !== 'TODOS') {
      if ((m.unidade || '').trim().toUpperCase() !== filters.unidade.trim().toUpperCase()) return false;
    }

    if (filters.canal && filters.canal !== 'TODOS') {
      if ((m.canal || 'Telefone') !== filters.canal) return false;
    }

    if (filters.status && filters.status !== 'TODOS') {
      if ((m.status || '').trim().toLowerCase() !== filters.status.trim().toLowerCase()) return false;
    }

    const notaNum = Number(m.nota);
    if (filters.notaMin !== '' && !isNaN(Number(filters.notaMin))) {
      if (notaNum < Number(filters.notaMin)) return false;
    }
    if (filters.notaMax !== '' && !isNaN(Number(filters.notaMax))) {
      if (notaNum > Number(filters.notaMax)) return false;
    }

    return true;
  });
};

const DB_NAME = 'CarvalimaQA_DB';
const DB_VERSION = 12;

const StorageService = {
  db: null,
  useFallback: false,

  async init() {
    if (!window.indexedDB) { this.useFallback = true; return; }
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('monitorias')) db.createObjectStore('monitorias', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('auditoria')) db.createObjectStore('auditoria', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('colaboradores')) db.createObjectStore('colaboradores', { keyPath: 'id' });
      };
      request.onsuccess = (e) => { this.db = e.target.result; resolve(); };
      request.onerror = () => { this.useFallback = true; resolve(); };
    });
  },

  async get(storeName) {
    if (this.useFallback) {
      const data = JSON.parse(localStorage.getItem(`carvalima_fallback_${storeName}`)) || [];
      return data.filter(i => !i.deleted);
    }
    return new Promise((resolve) => {
      if(!this.db) return resolve([]);
      const tx = this.db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => {
        const data = req.result || [];
        resolve(data.filter(i => !i.deleted));
      };
      req.onerror = () => resolve([]);
    });
  },

  async saveItem(storeName, item) {
    item.updated_at = item.updated_at || new Date().toISOString();
    if (this.useFallback) {
      const items = JSON.parse(localStorage.getItem(`carvalima_fallback_${storeName}`)) || [];
      const idx = items.findIndex(i => i.id === item.id);
      if(idx >= 0) items[idx] = item; else items.unshift(item);
      localStorage.setItem(`carvalima_fallback_${storeName}`, JSON.stringify(items));
      return;
    }
    return new Promise((resolve) => {
      if(!this.db) return resolve();
      const tx = this.db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(item);
      tx.oncomplete = () => resolve();
    });
  },

  async deleteItem(storeName, id) {
    if (this.useFallback) {
      const items = JSON.parse(localStorage.getItem(`carvalima_fallback_${storeName}`)) || [];
      const idx = items.findIndex(i => i.id === id);
      if(idx >= 0) {
        items[idx].deleted = true;
        items[idx].updated_at = new Date().toISOString();
        localStorage.setItem(`carvalima_fallback_${storeName}`, JSON.stringify(items));
      }
      return;
    }
    return new Promise((resolve) => {
      if(!this.db) return resolve();
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => {
        const item = req.result;
        if(item) {
          item.deleted = true;
          item.updated_at = new Date().toISOString();
          store.put(item);
        }
      };
      tx.oncomplete = () => resolve();
    });
  },

  async saveAll(storeName, items) {
    if (this.useFallback) {
      localStorage.setItem(`carvalima_fallback_${storeName}`, JSON.stringify(items));
      return;
    }
    return new Promise((resolve) => {
      if(!this.db) return resolve();
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      items.forEach(item => store.put(item));
      tx.oncomplete = () => resolve();
    });
  },

  getSettings() { try { return JSON.parse(localStorage.getItem('carvalima_qa_settings')) || {}; } catch { return {}; } },
  saveSettings(config) { localStorage.setItem('carvalima_qa_settings', JSON.stringify(config)); }
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3500); return () => clearTimeout(timer); }, [onClose]);
  const bg = type === 'success' ? 'bg-blue-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-900';
  return (
    <div className={`fixed bottom-6 right-6 ${bg} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-bounce text-sm font-semibold border border-white/10`}>
      {type === 'success' ? <Icons.Check /> : <Icons.Alert />}<span>{message}</span>
    </div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  const [monitorias, setMonitorias] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [monitoriaEditando, setMonitoriaEditando] = useState(null);
  const [monitoriaDetalhe, setMonitoriaDetalhe] = useState(null);
  const [unidades, setUnidades] = useState(UNIDADES_INICIAIS);
  const [historicoAuditoria, setHistoricoAuditoria] = useState([]);
  
  const [darkMode, setDarkMode] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [themeColors, setThemeColors] = useState(DEFAULT_THEME);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    const initializeApp = async () => {
      await StorageService.init();
      const savedTheme = StorageService.getSettings().darkMode;
      if (savedTheme !== undefined) setDarkMode(savedTheme);

      let m = await StorageService.get('monitorias');
      let u = StorageService.getSettings().unidades;
      if (!u || u.length === 0) { u = UNIDADES_INICIAIS; StorageService.saveSettings({...StorageService.getSettings(), unidades: u}); }
      let aud = await StorageService.get('auditoria');
      let colabs = await StorageService.get('colaboradores');
      
      setMonitorias(m);
      setUnidades(u);
      setHistoricoAuditoria(aud);
      setColaboradores(colabs);
      
      const cfg = StorageService.getSettings();
      if(cfg.lastSync) setLastSyncTime(cfg.lastSync);
      setThemeColors({
        primaryColor: cfg.primaryColor || DEFAULT_THEME.primaryColor,
        secondaryColor: cfg.secondaryColor || DEFAULT_THEME.secondaryColor
      });

      setLoading(false);
    };
    initializeApp();
  }, []);

  useEffect(() => {
    const handleThemeUpdated = (event) => {
      const detail = event.detail || {};
      setThemeColors({
        primaryColor: detail.primaryColor || DEFAULT_THEME.primaryColor,
        secondaryColor: detail.secondaryColor || DEFAULT_THEME.secondaryColor
      });
    };
    window.addEventListener('carvalima-theme-updated', handleThemeUpdated);
    return () => window.removeEventListener('carvalima-theme-updated', handleThemeUpdated);
  }, []);

  const handleSync = async () => {
    const config = StorageService.getSettings();
    if (!config.gasUrl || !config.gasToken) {
      showToast('Configure a URL e o Token do Apps Script nas Configurações.', 'error');
      setCurrentTab('configuracoes');
      return;
    }

    setIsSyncing(true);
    showToast('Sincronizando com Google Sheets...', 'info');

    try {
      const payload = {
        token: config.gasToken,
        action: 'sync',
        monitorias: monitorias
      };

      const response = await fetch(config.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        const now = new Date().toISOString();
        StorageService.saveSettings({ ...config, lastSync: now });
        setLastSyncTime(now);
        showToast(`Sincronização concluída! ${result.created || 0} novas, ${result.updated || 0} atualizadas.`, 'success');
        registrarAuditoria('Sincronização', `Sincronizado com Google Sheets com sucesso.`);
      } else {
        showToast(`Erro na sincronização: ${result.error || 'Erro desconhecido'}`, 'error');
      }
    } catch (err) {
      showToast('Falha de conexão com o Google Sheets. Verifique a URL.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  const registrarAuditoria = async (acao, detalhes) => {
    const novaAudit = { 
      id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2,4)}`, 
      data: new Date().toLocaleDateString('pt-BR'), 
      hora: new Date().toLocaleTimeString('pt-BR'), 
      usuario: 'Victor Silva (Analista SAC)',
      acao, 
      detalhes 
    };
    await StorageService.saveItem('auditoria', novaAudit);
    const atualizado = await StorageService.get('auditoria');
    setHistoricoAuditoria(atualizado.reverse());
  };

  const handleSave = async (monitoria) => {
    const isEdicao = monitorias.some(m => m.id === monitoria.id);
    await StorageService.saveItem('monitorias', monitoria);
    
    if (monitoria.departamento !== 'Filiais - Comercial') {
      const agenteUpper = (monitoria.agente || '').trim().toUpperCase();
      const colabExiste = colaboradores.some(c => c.nome === agenteUpper);
      if (!colabExiste && agenteUpper) {
        const novoColab = {
          id: `COLAB-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
          nome: agenteUpper,
          departamento: monitoria.departamento,
          unidade: monitoria.unidade,
          ativo: true,
          origem: 'Automático (Monitoria)',
          updated_at: new Date().toISOString()
        };
        await StorageService.saveItem('colaboradores', novoColab);
        const atualizados = await StorageService.get('colaboradores');
        setColaboradores(atualizados);
        registrarAuditoria('Criação Auto', `Colaborador ${agenteUpper} cadastrado via monitoria.`);
      }
    }

    if (isEdicao) registrarAuditoria('Edição', `Monitoria ${monitoria.id} atualizada.`);
    else registrarAuditoria('Criação', `Nova monitoria ${monitoria.id} salva.`);
    
    const atualizadas = await StorageService.get('monitorias');
    setMonitorias(atualizadas.sort((a,b) => new Date(b.dataAtendimento || 0) - new Date(a.dataAtendimento || 0)));
    
    setCurrentTab('dashboard'); setMonitoriaEditando(null);
    showToast(isEdicao ? 'Alterações salvas com sucesso!' : 'Monitoria salva permanentemente!', 'success');
  };

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0B1117] text-white font-bold">
      <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500 flex items-center justify-center animate-pulse mb-4 text-blue-400 font-black text-xl">C</div>
      <p className="text-sm font-medium tracking-wide text-slate-400">Carregando Carvalima QA V2...</p>
    </div>
  );

  return (
    <>
      <style>{`
        :root {
          --carvalima-primary: ${themeColors.primaryColor};
          --carvalima-secondary: ${themeColors.secondaryColor};
        }
        .bg-blue-600 { background-color: var(--carvalima-primary) !important; }
        .bg-blue-500 { background-color: var(--carvalima-secondary) !important; }
        .text-blue-500 { color: var(--carvalima-primary) !important; }
        .text-blue-400 { color: var(--carvalima-primary) !important; }
        .border-blue-500 { border-color: var(--carvalima-primary) !important; }
        .bg-blue-500\/10 { background-color: ${hexToRgba(themeColors.primaryColor, 0.10)} !important; }
        .border-blue-500\/20 { border-color: ${hexToRgba(themeColors.primaryColor, 0.20)} !important; }
      `}</style>
      <div className={`${darkMode ? 'dark bg-[#0B1117] text-[#F4F7F8]' : 'bg-[#F5F7F8] text-[#17202A]'} flex h-screen font-sans overflow-hidden w-full transition-colors duration-300`}>
      
      <aside className={`flex flex-col border-r transition-all duration-300 z-30 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-[#17202A] border-slate-800 text-white'} ${sidebarExpanded ? 'w-64' : 'w-20'}`}>
        
        <div className={`p-5 flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} border-b ${darkMode ? 'border-[#24313B]' : 'border-slate-800'}`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shrink-0 shadow-md">
              <span className="text-lg font-black tracking-tighter">C</span>
            </div>
            {sidebarExpanded && (
              <div className="truncate">
                <h1 className="font-black text-sm tracking-wide text-white">carvalima</h1>
                <p className="text-[10px] tracking-wider text-blue-400 font-semibold uppercase">movidos pela confiança</p>
              </div>
            )}
          </div>
          <button onClick={() => setSidebarExpanded(!sidebarExpanded)} className="text-slate-400 hover:text-white p-1 rounded-lg hidden md:block" title="Expandir/Recolher">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarExpanded ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"}/></svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{sidebarExpanded ? 'Principal' : '...'}</div>
          <SidebarButton active={currentTab === 'dashboard'} onClick={() => { setCurrentTab('dashboard'); setMonitoriaEditando(null); }} icon={<Icons.Dashboard />} label="Dashboard" expanded={sidebarExpanded} />
          <SidebarButton active={currentTab === 'monitorias'} onClick={() => { setCurrentTab('monitorias'); setMonitoriaEditando(null); }} icon={<Icons.Monitorias />} label="Monitorias" expanded={sidebarExpanded} />
          <SidebarButton active={currentTab === 'nova'} onClick={() => { setCurrentTab('nova'); setMonitoriaEditando(null); }} icon={<Icons.Plus />} label="Nova Monitoria" expanded={sidebarExpanded} highlight />
          
          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{sidebarExpanded ? 'Gestão & Dados' : '...'}</div>
          <SidebarButton active={currentTab === 'auditoria'} onClick={() => { setCurrentTab('auditoria'); setMonitoriaEditando(null); }} icon={<Icons.Shield />} label="Histórico & Auditoria" expanded={sidebarExpanded} />
          <SidebarButton active={currentTab === 'importar'} onClick={() => { setCurrentTab('importar'); setMonitoriaEditando(null); }} icon={<Icons.Import />} label="Importar / Exportar" expanded={sidebarExpanded} />
          <SidebarButton active={currentTab === 'configuracoes'} onClick={() => { setCurrentTab('configuracoes'); setMonitoriaEditando(null); }} icon={<Icons.Settings />} label="Configurações" expanded={sidebarExpanded} />
        </nav>

        <div className={`p-4 border-t ${darkMode ? 'border-[#24313B] bg-[#0B1117]/50' : 'border-slate-800 bg-slate-900/50'} flex items-center justify-between`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow">VS</div>
            {sidebarExpanded && (
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">Victor Silva</p>
                <p className="text-[10px] text-slate-400 truncate">Analista SAC</p>
              </div>
            )}
          </div>
          <button onClick={() => {const n = !darkMode; setDarkMode(n); StorageService.saveSettings({...StorageService.getSettings(), darkMode: n})}} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" title="Alternar Tema">
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <header className={`h-16 px-6 border-b flex items-center justify-between shrink-0 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Sheets:</span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${lastSyncTime ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {lastSyncTime ? `Sincronizado (${new Date(lastSyncTime).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})})` : 'Pendente de Sincronização'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handleSync} disabled={isSyncing} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow flex items-center space-x-2 transition-all">
              <Icons.CloudSync />
              <span>{isSyncing ? 'Sincronizando...' : '🔄 Sincronizar Google Sheets'}</span>
            </button>
          </div>
        </header>

        {currentTab === 'dashboard' && <DashboardView monitorias={monitorias} unidades={unidades} darkMode={darkMode} filters={filters} setFilters={setFilters} />}
        {currentTab === 'monitorias' && <TabelasView monitorias={monitorias} unidades={unidades} darkMode={darkMode} onEdit={(m) => {setMonitoriaEditando(m); setCurrentTab('nova');}} onDelete={handleDelete} onViewDetail={setMonitoriaDetalhe} showToast={showToast} filters={filters} setFilters={setFilters} />}
        {currentTab === 'nova' && <NovaMonitoriaView unidades={unidades} monitorias={monitorias} colaboradores={colaboradores} onSave={handleSave} onCancel={() => setCurrentTab('dashboard')} monitoriaEdit={monitoriaEditando} darkMode={darkMode} showToast={showToast} />}
        {currentTab === 'auditoria' && <AuditoriaView historico={historicoAuditoria} darkMode={darkMode} />}
        {currentTab === 'importar' && <ImportarArquivoView monitorias={monitorias} colaboradores={colaboradores} onUpdateMonitorias={async (m) => { await StorageService.saveAll('monitorias', m); setMonitorias(m); registrarAuditoria('Importação', `${m.length} monitorias sincronizadas via importação.`); }} onUpdateColaboradores={async (c) => { await StorageService.saveAll('colaboradores', c); setColaboradores(c); registrarAuditoria('Importação', `Colaboradores atualizados via importação.`); }} darkMode={darkMode} showToast={showToast} />}
        {currentTab === 'configuracoes' && <ConfiguracoesView unidades={unidades} onUpdateUnidades={(u) => { setUnidades(u); StorageService.saveSettings({...StorageService.getSettings(), unidades: u}); }} darkMode={darkMode} showToast={showToast} />}
      </main>

      {monitoriaDetalhe && <ModalDetalheMonitoria monitoria={monitoriaDetalhe} onClose={() => setMonitoriaDetalhe(null)} darkMode={darkMode} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  );

  async function handleDelete(id) {
    await StorageService.deleteItem('monitorias', id);
    const atu = await StorageService.get('monitorias');
    setMonitorias(atu.sort((a,b) => new Date(b.dataAtendimento || 0) - new Date(a.dataAtendimento || 0)));
    registrarAuditoria('Exclusão', `Monitoria ${id} marcada como deletada.`);
    showToast('Monitoria marcada como deletada.', 'success');
  }
}

function SidebarButton({ active, onClick, icon, label, expanded, highlight }) {
  return (
    <button onClick={onClick} title={!expanded ? label : ''} className={`w-full flex items-center ${expanded ? 'px-3.5 py-2.5 space-x-3' : 'justify-center p-3'} rounded-xl transition-all duration-200 group ${highlight ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 font-bold' : active ? 'bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}>
      <span className="shrink-0">{icon}</span>
      {expanded && <span className="text-xs tracking-wide truncate">{label}</span>}
    </button>
  );
}

function ProgressBar({ label, actual, goal, darkMode }) {
  const percent = Math.min((actual / goal) * 100, 100) || 0;
  const colorClass = percent >= 100 ? 'bg-emerald-500' : percent > 0 ? 'bg-blue-500' : 'bg-slate-300';
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5 tracking-wider">
        <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{label}</span>
        <span className={darkMode ? 'text-slate-300' : 'text-slate-800'}>{actual} / {goal}</span>
      </div>
      <div className={`h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'} border ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
        <div className={`h-full ${colorClass} transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function FiltrosBar({ monitorias, filters, setFilters, darkMode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const departamentosList = useMemo(() => {
    const set = new Set();
    monitorias.forEach(m => { if(m.departamento) set.add(m.departamento); });
    return Array.from(set).sort();
  }, [monitorias]);

  const colaboradoresList = useMemo(() => {
    const set = new Set();
    monitorias.forEach(m => {
      if(m.agente) {
        if(filters.departamento === 'TODOS' || m.departamento === filters.departamento) {
          set.add(m.agente.trim().toUpperCase());
        }
      }
    });
    return Array.from(set).sort();
  }, [monitorias, filters.departamento]);

  const unidadesList = useMemo(() => {
    const set = new Set();
    monitorias.forEach(m => { if(m.unidade) set.add(m.unidade.trim().toUpperCase()); });
    return Array.from(set).sort();
  }, [monitorias]);

  const canaisList = useMemo(() => {
    const set = new Set();
    monitorias.forEach(m => { set.add(m.canal || 'Telefone'); });
    return Array.from(set).sort();
  }, [monitorias]);

  const statusList = useMemo(() => {
    const set = new Set();
    monitorias.forEach(m => { if(m.status) set.add(m.status); });
    return Array.from(set).sort();
  }, [monitorias]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.busca) count++;
    if (filters.periodo !== 'TODOS') count++;
    if (filters.departamento !== 'TODOS') count++;
    if (filters.colaborador !== 'TODOS') count++;
    if (filters.unidade !== 'TODOS') count++;
    if (filters.canal !== 'TODOS') count++;
    if (filters.status !== 'TODOS') count++;
    if (filters.notaMin !== '' || filters.notaMax !== '') count++;
    return count;
  }, [filters]);

  const limparFiltros = () => setFilters(DEFAULT_FILTERS);

  const removeFilter = (key) => {
    if (key === 'nota') setFilters(prev => ({ ...prev, notaMin: '', notaMax: '' }));
    else setFilters(prev => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));
  };

  return (
    <div className={`p-4 rounded-2xl border mb-6 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icons.Filter />
          <span className="text-xs font-bold uppercase tracking-wider">Filtros Avançados</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">{activeFiltersCount}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button onClick={limparFiltros} className="text-xs text-rose-500 font-bold hover:underline">
              [ Limpar Filtros ]
            </button>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold">
            {mobileOpen ? 'Ocultar Filtros' : 'Filtros [ + ]'}
          </button>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t dark:border-[#24313B]">
          {filters.busca && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Busca: "{filters.busca}" <button onClick={() => removeFilter('busca')} className="ml-1 text-blue-500 hover:text-blue-700">×</button>
            </span>
          )}
          {filters.periodo !== 'TODOS' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Período: {filters.periodo} <button onClick={() => removeFilter('periodo')} className="ml-1 text-blue-500">×</button>
            </span>
          )}
          {filters.departamento !== 'TODOS' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Departamento: {filters.departamento} <button onClick={() => removeFilter('departamento')} className="ml-1 text-blue-500">×</button>
            </span>
          )}
          {filters.colaborador !== 'TODOS' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Colaborador: {filters.colaborador} <button onClick={() => removeFilter('colaborador')} className="ml-1 text-blue-500">×</button>
            </span>
          )}
          {filters.unidade !== 'TODOS' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Unidade: {filters.unidade} <button onClick={() => removeFilter('unidade')} className="ml-1 text-blue-500">×</button>
            </span>
          )}
          {filters.canal !== 'TODOS' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Canal: {filters.canal} <button onClick={() => removeFilter('canal')} className="ml-1 text-blue-500">×</button>
            </span>
          )}
          {filters.status !== 'TODOS' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Status: {filters.status} <button onClick={() => removeFilter('status')} className="ml-1 text-blue-500">×</button>
            </span>
          )}
        </div>
      )}

      <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 ${mobileOpen ? 'block' : 'hidden md:grid'}`}>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Período</label>
          <select value={filters.periodo} onChange={e => setFilters({...filters, periodo: e.target.value})} className={`w-full text-xs p-2 rounded-xl border outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`}>
            <option value="TODOS">Todos</option>
            <option value="HOJE">Hoje</option>
            <option value="ONTEM">Ontem</option>
            <option value="ULTIMOS_7">Últimos 7 dias</option>
            <option value="ULTIMOS_30">Últimos 30 dias</option>
            <option value="ESTE_MES">Este mês</option>
            <option value="MES_ANTERIOR">Mês anterior</option>
            <option value="PERSONALIZADO">Personalizado</option>
          </select>
        </div>

        {filters.periodo === 'PERSONALIZADO' && (
          <>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Data Início</label>
              <input type="date" value={filters.dataInicio} onChange={e => setFilters({...filters, dataInicio: e.target.value})} className={`w-full text-xs p-2 rounded-xl border outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Data Fim</label>
              <input type="date" value={filters.dataFim} onChange={e => setFilters({...filters, dataFim: e.target.value})} className={`w-full text-xs p-2 rounded-xl border outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`} />
            </div>
          </>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Departamento</label>
          <select value={filters.departamento} onChange={e => setFilters({...filters, departamento: e.target.value, colaborador: 'TODOS'})} className={`w-full text-xs p-2 rounded-xl border outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`}>
            <option value="TODOS">Todos</option>
            {departamentosList.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Colaborador</label>
          <select value={filters.colaborador} onChange={e => setFilters({...filters, colaborador: e.target.value})} className={`w-full text-xs p-2 rounded-xl border outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`}>
            <option value="TODOS">Todos</option>
            {colaboradoresList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Unidade</label>
          <select value={filters.unidade} onChange={e => setFilters({...filters, unidade: e.target.value})} className={`w-full text-xs p-2 rounded-xl border outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`}>
            <option value="TODOS">Todas</option>
            {unidadesList.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Canal</label>
          <select value={filters.canal} onChange={e => setFilters({...filters, canal: e.target.value})} className={`w-full text-xs p-2 rounded-xl border outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`}>
            <option value="TODOS">Todos</option>
            {canaisList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status Qualidade</label>
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className={`w-full text-xs p-2 rounded-xl border outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`}>
            <option value="TODOS">Todos</option>
            {statusList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ monitorias, unidades, darkMode, filters, setFilters }) {
  const monitoriasFiltradas = useMemo(() => filterMonitorias(monitorias, filters), [monitorias, filters]);

  const analisarStatusMonitoria = (m) => {
    let status = (m.status || '').trim().toLowerCase();
    let nota = Number(m.nota);
    
    if (status.includes('conform') || nota >= 9) return 'conforme';
    if (status.includes('crític') || status.includes('critico') || status.includes('atençã') || status.includes('atencao') || nota < 9) return 'critico';
    return 'conforme';
  };

  const rankingColaboradores = useMemo(() => {
    const mapa = {};
    monitoriasFiltradas.forEach(m => {
      const nome = m.agente || 'Desconhecido';
      if (!mapa[nome]) {
        mapa[nome] = { 
          nome, 
          departamento: m.departamento, 
          unidade: m.unidade, 
          total: 0, 
          somaNota: 0, 
          conformesCount: 0, 
          criticosCount: 0 
        };
      }
      mapa[nome].total += 1;
      mapa[nome].somaNota += Number(m.nota) || 0;
      
      const tipo = analisarStatusMonitoria(m);
      if (tipo === 'conforme') {
        mapa[nome].conformesCount += 1;
      } else {
        mapa[nome].criticosCount += 1;
      }
    });
    return Object.values(mapa).sort((a, b) => b.total - a.total);
  }, [monitoriasFiltradas]);

  const kpis = useMemo(() => {
    const total = monitoriasFiltradas.length;
    let positivas = 0;
    let negativas = 0;

    monitoriasFiltradas.forEach(m => {
      if (analisarStatusMonitoria(m) === 'conforme') positivas++;
      else negativas++;
    });

    const percPositivas = total > 0 ? ((positivas / total) * 100).toFixed(1) : '0';
    
    const somaNotas = monitoriasFiltradas.reduce((acc, m) => acc + (Number(m.nota) || 0), 0);
    const notaMedia = total > 0 ? (somaNotas / total).toFixed(1) : '0.0';

    const hojeStr = getLocalDateString();
    const mesAtualStr = hojeStr.substring(0, 7);

    const monitoriasHoje = monitoriasFiltradas.filter(m => m.dataAtendimento === hojeStr);
    const monitoriasMes = monitoriasFiltradas.filter(m => m.dataAtendimento?.startsWith(mesAtualStr));

    const contagemDia = {};
    const contagemMes = {};
    DEPARTAMENTOS.forEach(d => { contagemDia[d] = 0; contagemMes[d] = 0; });

    monitoriasHoje.forEach(m => { if (contagemDia[m.departamento] !== undefined) contagemDia[m.departamento]++; });
    monitoriasMes.forEach(m => { if (contagemMes[m.departamento] !== undefined) contagemMes[m.departamento]++; });

    return { 
      total, positivas, negativas, percPositivas, notaMedia,
      hojeTotal: monitoriasHoje.length,
      mesTotal: monitoriasMes.length,
      contagemDia,
      contagemMes
    };
  }, [monitoriasFiltradas]);

  const isFiltered = useMemo(() => {
    return Object.keys(DEFAULT_FILTERS).some(k => filters[k] !== DEFAULT_FILTERS[k]);
  }, [filters]);

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-8 ${darkMode ? 'bg-[#0B1117] text-[#F4F7F8]' : 'bg-[#F5F7F8] text-[#17202A]'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Dashboard {isFiltered ? '— Filtrado' : ''}</h1>
            {isFiltered && <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase">Filtros Ativos</span>}
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            {isFiltered ? `Exibindo ${monitoriasFiltradas.length} de ${monitorias.length} monitorias no total.` : 'Visão geral, desempenho e acompanhamento de metas.'}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-xs font-semibold border ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`}>
          📅 {new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' })}
        </div>
      </div>

      <FiltrosBar monitorias={monitorias} filters={filters} setFilters={setFilters} darkMode={darkMode} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Monitorias Analisadas" value={kpis.total} sub={isFiltered ? "Resultado filtrado" : "Base ativa total"} icon={<Icons.Monitorias />} color="blue" darkMode={darkMode} />
        <KpiCard title="Nota Média" value={kpis.notaMedia} sub="Média ponderada" icon={<Icons.CheckSquare />} color="blue" darkMode={darkMode} />
        <KpiCard title="Conformes" value={kpis.positivas} sub={`${kpis.percPositivas}% do total`} icon={<Icons.CheckSquare />} color="blue" darkMode={darkMode} />
        <KpiCard title="Críticas / Atenção" value={kpis.negativas} sub="Atenção requerida" icon={<Icons.Alert />} color="rose" darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <div className={`p-6 rounded-3xl border shadow-sm ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Metas do Dia</h3>
                <p className="text-xs text-slate-400 mt-0.5">Monitorias diárias por setor</p>
              </div>
              <div className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 font-black text-lg">
                {kpis.hojeTotal} <span className="text-xs font-bold text-slate-400">/ {METAS_MONITORIA.TOTAL.dia}</span>
              </div>
            </div>
            <div className="space-y-1">
              {DEPARTAMENTOS.map(d => (
                <ProgressBar key={d} label={d.replace('Filiais - ', '')} actual={kpis.contagemDia[d]} goal={METAS_MONITORIA[d].dia} darkMode={darkMode} />
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-sm ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Metas do Mês</h3>
                <p className="text-xs text-slate-400 mt-0.5">Progresso mensal</p>
              </div>
              <div className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-black text-lg">
                {kpis.mesTotal} <span className="text-xs font-bold text-slate-400">/ {METAS_MONITORIA.TOTAL.mes}</span>
              </div>
            </div>
            <div className="space-y-1">
              {DEPARTAMENTOS.map(d => (
                <ProgressBar key={d} label={d.replace('Filiais - ', '')} actual={kpis.contagemMes[d]} goal={METAS_MONITORIA[d].mes} darkMode={darkMode} />
              ))}
            </div>
          </div>
        </div>

        <div className={`xl:col-span-2 p-6 rounded-3xl border ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Desempenho por Colaborador</h3>
              <p className="text-[11px] text-slate-500 mt-1">Soma automática de monitorias, conformes e críticas extraídas das notas/status.</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold">
              {rankingColaboradores.length} Agentes
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs relative">
              <thead className="sticky top-0 z-10">
                <tr className={`border-b ${darkMode ? 'border-[#24313B] bg-[#111A22] text-slate-400' : 'border-slate-100 bg-white text-slate-500'} uppercase tracking-wider`}>
                  <th className="py-3 px-3 font-bold">Colaborador</th>
                  <th className="py-3 px-3 font-bold text-center">Total</th>
                  <th className="py-3 px-3 font-bold text-center text-emerald-500">Conformes</th>
                  <th className="py-3 px-3 font-bold text-center text-rose-500">Críticas</th>
                  <th className="py-3 px-3 font-bold text-center">Nota Média</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-[#24313B]' : 'divide-slate-100'}`}>
                {rankingColaboradores.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400 font-medium">Nenhum colaborador encontrado com os filtros atuais.</td></tr>
                ) : (
                  rankingColaboradores.map(c => (
                    <tr key={c.nome} className={`hover:${darkMode ? 'bg-[#0B1117]/50' : 'bg-slate-50'} transition-colors`}>
                      <td className="py-3 px-3">
                        <div className="font-bold">{c.nome}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{c.departamento} • {c.unidade}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-black text-blue-500 text-sm">{c.total}</td>
                      <td className="py-3 px-3 text-center font-black text-emerald-500 bg-emerald-500/5 rounded-lg">{c.conformesCount}</td>
                      <td className="py-3 px-3 text-center font-black text-rose-500 bg-rose-500/5 rounded-lg">{c.criticosCount}</td>
                      <td className="py-3 px-3 text-center font-bold">{(c.somaNota / c.total).toFixed(1)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, sub, icon, color, darkMode }) {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  };
  return (
    <div className={`p-5 rounded-2xl border flex flex-col justify-between ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colors[color] || colors.blue}`}>{icon}</div>
      </div>
      <div>
        <div className="text-3xl font-black">{value}</div>
        <p className="text-[11px] text-slate-400 mt-1 font-medium">{sub}</p>
      </div>
    </div>
  );
}

const loadExcelJS = async () => {
  if (window.ExcelJS) return window.ExcelJS;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
    script.onload = () => resolve(window.ExcelJS);
    script.onerror = () => reject(new Error('Falha ao carregar ExcelJS'));
    document.head.appendChild(script);
  });
};

const loadHtml2Pdf = async () => {
  if (window.html2pdf) return window.html2pdf;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => resolve(window.html2pdf);
    script.onerror = () => reject(new Error('Falha ao carregar html2pdf'));
    document.head.appendChild(script);
  });
};

function TabelasView({ monitorias, unidades, darkMode, onEdit, onDelete, onViewDetail, showToast, filters, setFilters }) {
  const [exportando, setExportando] = useState(false);
  const [modalExportOpen, setModalExportOpen] = useState(false);
  const [tipoExportacao, setTipoExportacao] = useState(null); // 'excel' ou 'pdf'

  const [ordenacao, setOrdenacao] = useState({ campo: 'dataAtendimento', direcao: 'desc' });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(25);

  const dadosFiltrados = useMemo(() => filterMonitorias(monitorias, filters), [monitorias, filters]);

  const dadosOrdenados = useMemo(() => {
    return [...dadosFiltrados].sort((a, b) => {
      let valA = a[ordenacao.campo];
      let valB = b[ordenacao.campo];

      if (ordenacao.campo === 'nota') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return ordenacao.direcao === 'asc' ? -1 : 1;
      if (valA > valB) return ordenacao.direcao === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dadosFiltrados, ordenacao]);

  const totalPaginas = Math.ceil(dadosOrdenados.length / itensPorPagina) || 1;
  const dadosPaginados = useMemo(() => {
    const start = (paginaAtual - 1) * itensPorPagina;
    return dadosOrdenados.slice(start, start + itensPorPagina);
  }, [dadosOrdenados, paginaAtual, itensPorPagina]);

  const handleSort = (campo) => {
    if (ordenacao.campo === campo) {
      setOrdenacao({ campo, direcao: ordenacao.direcao === 'asc' ? 'desc' : 'asc' });
    } else {
      setOrdenacao({ campo, direcao: 'asc' });
    }
  };

  const handleExportExcel = async (filtrado = true) => {
    const dataset = filtrado ? dadosFiltrados : monitorias;
    if (dataset.length === 0) { showToast('Nenhum dado para exportar.', 'error'); return; }
    setExportando(true); setModalExportOpen(false); showToast('Preparando planilha Excel...', 'info');

    try {
      const ExcelJS = await loadExcelJS();
      const wb = new ExcelJS.Workbook();
      wb.creator = 'Carvalima QA'; wb.created = new Date();

      const wsMon = wb.addWorksheet('Monitorias', { views: [{ state: 'frozen', ySplit: 5 }] });
      wsMon.pageSetup = { orientation: 'landscape', fitToPage: true };

      wsMon.mergeCells('A1:J2');
      const titleCell = wsMon.getCell('A1');
      titleCell.value = `CARVALIMA — RELATÓRIO ${filtrado ? 'FILTRADO' : 'GERAL'} DE QUALIDADE V2`;
      titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

      wsMon.mergeCells('A3:J3');
      const infoCell = wsMon.getCell('A3');
      infoCell.value = `Exportado em: ${new Date().toLocaleString('pt-BR')}  |  Total de Registros: ${dataset.length}`;
      infoCell.font = { size: 10, italic: true };
      infoCell.alignment = { vertical: 'middle', horizontal: 'center' };

      const colunas = [
        { header: 'ID / Prot.', key: 'id', width: 16 },
        { header: 'Data', key: 'data', width: 12 },
        { header: 'Canal', key: 'canal', width: 12 },
        { header: 'Agente', key: 'agente', width: 25 },
        { header: 'Unidade', key: 'unidade', width: 12 },
        { header: 'Departamento', key: 'depto', width: 22 },
        { header: 'Cliente', key: 'cliente', width: 20 },
        { header: 'Nota', key: 'nota', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Feedback Avaliador', key: 'feedback', width: 45 }
      ];
      wsMon.columns = colunas;

      const headerRow = wsMon.getRow(5);
      headerRow.values = colunas.map(c => c.header);
      headerRow.height = 25;
      headerRow.eachCell((cell) => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }; cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; });
      wsMon.autoFilter = 'A5:J5';

      dataset.forEach((m, idx) => {
        const row = wsMon.addRow({
          id: m.id,
          data: m.dataAtendimento,
          canal: m.canal || 'Telefone',
          agente: m.agente,
          unidade: m.unidade,
          depto: m.departamento,
          cliente: m.cliente,
          nota: Number(m.nota),
          status: m.status?.toUpperCase(),
          feedback: m.feedback
        });

        const isPar = idx % 2 === 0;
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = { top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
          if (isPar) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        });
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `Carvalima_QA_Relatorio_${filtrado ? 'Filtrado' : 'Geral'}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setExportando(false); showToast('Planilha Excel gerada com sucesso!', 'success');
    } catch (err) { setExportando(false); showToast('Erro ao gerar planilha Excel.', 'error'); }
  };

  const handleExportPDF = async (filtrado = true) => {
    const dataset = filtrado ? dadosFiltrados : monitorias;
    if (dataset.length === 0) { showToast('Nenhum dado para exportar.', 'error'); return; }
    setExportando(true); setModalExportOpen(false); showToast('Gerando relatório executivo em PDF...', 'info');

    try {
      const html2pdf = await loadHtml2Pdf();
      const savedTheme = StorageService.getSettings();
      const primaryColor = savedTheme.primaryColor || DEFAULT_THEME.primaryColor;
      const secondaryColor = savedTheme.secondaryColor || DEFAULT_THEME.secondaryColor;
      const primarySoft = hexToRgba(primaryColor, 0.10);
      
      
      // Estatísticas para a Análise de IA
      const total = dataset.length;
      const somaNotas = dataset.reduce((acc, m) => acc + (Number(m.nota) || 0), 0);
      const notaMedia = total > 0 ? (somaNotas / total).toFixed(1) : '0.0';
      
      let conformes = 0;
      let criticos = 0;
      const deptosCount = {};

      dataset.forEach(m => {
        const nota = Number(m.nota) || 0;
        const status = (m.status || '').toLowerCase();
        if (status.includes('conform') || nota >= 9) conformes++;
        else criticos++;

        const dep = m.departamento || 'Geral';
        deptosCount[dep] = (deptosCount[dep] || 0) + 1;
      });

      const percConformes = total > 0 ? ((conformes / total) * 100).toFixed(1) : '0';
      
      // Construção do Resumo Executivo (Interpretação IA)
      let analiseIA = `O presente relatório gerencial consolida um total de ${total} monitorias de atendimento, apresentando uma nota média geral de ${notaMedia}/10. `;
      analiseIA += `Deste volume, ${conformes} avaliações (${percConformes}%) encontram-se em perfeita conformidade com os padrões de excelência da Carvalima, enquanto ${criticos} registros exigem atenção e acompanhamento corretivo. `;
      
      const topDepto = Object.entries(deptosCount).sort((a,b) => b[1] - a[1])[0];
      if (topDepto) {
        analiseIA += `O departamento com maior expressividade de análises foi "${topDepto[0]}" (${topDepto[1]} registros). `;
      }
      
      if (Number(notaMedia) >= 9) {
        analiseIA += `O panorama geral demonstra altíssimo alinhamento com as diretrizes e scripts da empresa, refletindo o compromisso contínuo com o lema "Movidos pela confiança".`;
      } else if (Number(notaMedia) >= 7.5) {
        analiseIA += `O desempenho geral é satisfatório, recomendando-se alinhamentos pontuais em sondagem e follow-up para elevar ainda mais a satisfação dos clientes.`;
      } else {
        analiseIA += `Identificou-se um índice relevante de criticidade nos atendimentos, sendo recomendada a aplicação de planos de ação direcionados.`;
      }

      const container = document.createElement('div');
      container.style.padding = '24px';
      container.style.fontFamily = 'Helvetica, Arial, sans-serif';
      container.style.color = '#1e293b';
      container.style.background = '#ffffff';
      container.style.boxSizing = 'border-box';
      container.style.lineHeight = '1.35';
      container.style.wordBreak = 'break-word';
      container.style.width = '1120px';

      let html = `
        <style>
          * { box-sizing: border-box; }
          .pdf-section, .pdf-kpi, .pdf-monitoria { page-break-inside: avoid; break-inside: avoid; }
          h1, h2, h3, p { page-break-after: avoid; }
        </style>
        <!-- Cabeçalho Institucional -->
        <div style="border-bottom: 4px solid ${primaryColor}; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="color: ${secondaryColor}; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">CARVALIMA TRANSPORTES</h1>
            <p style="color: ${primaryColor}; margin: 3px 0 0 0; font-size: 11px; font-weight: bold; text-transform: uppercase;">Sistema de Gestão de Qualidade V2 • Relatório Executivo</p>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748b;">
            <p style="margin: 0;">Emitido em: ${new Date().toLocaleString('pt-BR')}</p>
            <p style="margin: 2px 0 0 0; font-weight: bold; color: #1e293b;">Escopo: ${filtrado ? 'Resultados Filtrados' : 'Base Completa'}</p>
          </div>
        </div>

        <!-- Resumo e Interpretação Analítica (IA) -->
        <div class="pdf-section" style="background: #f1f5f9; border-left: 5px solid ${primaryColor}; padding: 16px; border-radius: 0 12px 12px 0; margin-bottom: 25px;">
          <h3 style="margin: 0 0 8px 0; color: ${secondaryColor}; font-size: 13px; text-transform: uppercase; font-weight: 900;">
            🤖 Resumo e Interpretação Analítica (IA)
          </h3>
          <p style="margin: 0; font-size: 11px; line-height: 1.6; color: #334155;">
            ${analiseIA}
          </p>
        </div>

        <!-- Cards de KPIs -->
        <div class="pdf-section" style="display: flex; gap: 15px; margin-bottom: 25px;">
          <div class="pdf-kpi" style="flex: 1; background: ${primarySoft}; border: 1px solid ${hexToRgba(primaryColor, 0.25)}; padding: 12px; border-radius: 10px; text-align: center;">
            <span style="font-size: 9px; font-weight: bold; color: ${primaryColor}; text-transform: uppercase;">Total Monitorias</span>
            <div style="font-size: 20px; font-weight: 900; color: ${secondaryColor}; margin-top: 4px;">${total}</div>
          </div>
          <div class="pdf-kpi" style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px; text-align: center;">
            <span style="font-size: 9px; font-weight: bold; color: #15803d; text-transform: uppercase;">Nota Média Ponderada</span>
            <div style="font-size: 20px; font-weight: 900; color: #166534; margin-top: 4px;">${notaMedia} / 10</div>
          </div>
          <div class="pdf-kpi" style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px; text-align: center;">
            <span style="font-size: 9px; font-weight: bold; color: #15803d; text-transform: uppercase;">Conformes</span>
            <div style="font-size: 20px; font-weight: 900; color: #166534; margin-top: 4px;">${conformes} (${percConformes}%)</div>
          </div>
          <div class="pdf-kpi" style="flex: 1; background: #fff1f2; border: 1px solid #fecdd3; padding: 12px; border-radius: 10px; text-align: center;">
            <span style="font-size: 9px; font-weight: bold; color: #be123c; text-transform: uppercase;">Críticas / Atenção</span>
            <div style="font-size: 20px; font-weight: 900; color: #9f1239; margin-top: 4px;">${criticos}</div>
          </div>
        </div>

        <!-- Cabeçalho Seção Detalhada -->
        <div style="margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
          <h3 style="margin: 0; font-size: 13px; font-weight: 900; color: ${secondaryColor}; text-transform: uppercase;">Detalhamento Individual das Monitorias</h3>
        </div>

        <!-- Lista de Monitorias Individuais -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
      `;

      dataset.forEach((m, idx) => {
        const notaNum = Number(m.nota) || 0;
        const badgeBg = notaNum >= 9 ? '#dcfce7' : notaNum >= 7 ? '#fef9c3' : '#fee2e2';
        const badgeColor = notaNum >= 9 ? '#166534' : notaNum >= 7 ? '#854d0e' : '#991b1b';

        html += `
          <div class="pdf-monitoria" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${hexToRgba(secondaryColor, 0.18)}; padding-bottom: 8px; margin-bottom: 8px;">
              <div>
                <span style="font-size: 11px; font-weight: 900; color: ${secondaryColor};">#${idx + 1} — ID: ${m.id}</span>
                <span style="font-size: 10px; color: #64748b; margin-left: 10px;">Data: ${m.dataAtendimento || 'N/A'}</span>
                <span style="font-size: 10px; color: ${primaryColor}; font-weight: bold; margin-left: 10px;">Canal: ${m.canal || 'Telefone'}</span>
              </div>
              <div style="background: ${badgeBg}; color: ${badgeColor}; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 900;">
                Nota: ${m.nota} — ${m.status || 'Conforme'}
              </div>
            </div>

            <div style="display: flex; gap: 15px; font-size: 10px; margin-bottom: 6px;">
              <div><span style="color: #64748b;">Colaborador:</span> <strong>${m.agente}</strong></div>
              <div><span style="color: #64748b;">Unidade:</span> <strong>${m.unidade}</strong></div>
              <div><span style="color: #64748b;">Departamento:</span> <strong>${m.departamento}</strong></div>
              <div><span style="color: #64748b;">Cliente:</span> <strong>${m.cliente || 'Não informado'}</strong></div>
            </div>

            ${m.feedback ? `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; font-size: 10px; color: #334155; margin-top: 6px; white-space: pre-line;">
                <strong>Feedback / Avaliação:</strong><br/>${m.feedback}
              </div>
            ` : ''}
          </div>
        `;
      });

      html += `
        </div>

        <!-- Rodapé -->
        <div style="margin-top: 30px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          Carvalima Transportes — Sistema Integrado de Gestão de Qualidade V2 • Movidos pela confiança
        </div>
      `;

      container.innerHTML = html;
      document.body.appendChild(container);

      const opt = {
        margin: [8, 8, 10, 8],
        filename: `Carvalima_QA_Relatorio_Executivo_${filtrado ? 'Filtrado' : 'Geral'}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          letterRendering: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1120
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: ['.pdf-section', '.pdf-kpi', '.pdf-monitoria']
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'landscape',
          compress: true
        }
      };

      await html2pdf().from(container).set(opt).save();
      document.body.removeChild(container);
      setExportando(false);
      showToast('Relatório executivo em PDF gerado com sucesso!', 'success');
    } catch (err) {
      setExportando(false);
      showToast('Erro ao gerar relatório PDF.', 'error');
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 ${darkMode ? 'bg-[#0B1117] text-[#F4F7F8]' : 'bg-[#F5F7F8] text-[#17202A]'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Monitorias ({dadosFiltrados.length})</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">Gerencie e exporte todas as avaliações de qualidade realizadas.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => { setTipoExportacao('excel'); setModalExportOpen(true); }} disabled={exportando} className="px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-all">
            <Icons.Export /><span>Exportar Excel</span>
          </button>
          <button onClick={() => { setTipoExportacao('pdf'); setModalExportOpen(true); }} disabled={exportando} className="px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white transition-all">
            <Icons.Pdf /><span>Exportar PDF</span>
          </button>
        </div>
      </div>

      <FiltrosBar monitorias={monitorias} filters={filters} setFilters={setFilters} darkMode={darkMode} />

      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-[#24313B] text-slate-400' : 'border-slate-100 text-slate-500'} uppercase tracking-wider`}>
                <th onClick={() => handleSort('id')} className="py-4 px-6 font-bold cursor-pointer hover:text-blue-500">ID / Data ↕</th>
                <th onClick={() => handleSort('agente')} className="py-4 px-6 font-bold cursor-pointer hover:text-blue-500">Colaborador / Unidade ↕</th>
                <th onClick={() => handleSort('departamento')} className="py-4 px-6 font-bold cursor-pointer hover:text-blue-500">Departamento / Canal ↕</th>
                <th onClick={() => handleSort('nota')} className="py-4 px-6 font-bold text-center cursor-pointer hover:text-blue-500">Nota / Status ↕</th>
                <th className="py-4 px-6 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-[#24313B]' : 'divide-slate-100'}`}>
              {dadosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold text-slate-500">Nenhuma monitoria encontrada.</p>
                    <p className="text-xs text-slate-400 mt-1">Tente remover ou alterar os filtros aplicados.</p>
                    <button onClick={() => setFilters(DEFAULT_FILTERS)} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Limpar filtros</button>
                  </td>
                </tr>
              ) : (
                dadosPaginados.map(item => (
                  <tr key={item.id} className={`hover:${darkMode ? 'bg-[#0B1117]/50' : 'bg-slate-50'}`}>
                    <td className="py-3 px-6"><div className="font-bold">{item.id}</div><div className="text-[10px] text-slate-400">{item.dataAtendimento}</div></td>
                    <td className="py-3 px-6"><div className="font-bold">{item.agente}</div><div className="text-[10px] text-slate-400">{item.unidade}</div></td>
                    <td className="py-3 px-6"><div className="text-slate-300 font-semibold">{item.departamento}</div><div className="text-[10px] text-blue-500 font-bold uppercase mt-0.5">{item.canal || 'Telefone'}</div></td>
                    <td className="py-3 px-6 text-center"><span className="font-black text-sm">{item.nota}</span><div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{item.status}</div></td>
                    <td className="py-3 px-6 text-center space-x-1">
                      <button onClick={() => onViewDetail(item)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl" title="Detalhes"><Icons.Eye/></button>
                      <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl" title="Editar"><Icons.Edit/></button>
                      <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl" title="Excluir"><Icons.Trash/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={`p-4 border-t flex flex-col sm:flex-row justify-between items-center text-xs ${darkMode ? 'border-[#24313B] bg-[#111A22]' : 'border-slate-200 bg-slate-50'}`}>
          <div className="text-slate-400 mb-2 sm:mb-0">
            Mostrando {dadosPaginados.length > 0 ? (paginaAtual - 1) * itensPorPagina + 1 : 0}–{Math.min(paginaAtual * itensPorPagina, dadosOrdenados.length)} de {dadosOrdenados.length} monitorias
          </div>
          <div className="flex items-center space-x-3">
            <select value={itensPorPagina} onChange={e => { setItensPorPagina(Number(e.target.value)); setPaginaAtual(1); }} className={`p-1.5 rounded-lg border outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-white border-slate-300'}`}>
              <option value="25">25 por pág.</option>
              <option value="50">50 por pág.</option>
              <option value="100">100 por pág.</option>
            </select>
            <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-40">Anterior</button>
            <span className="font-bold">Pág. {paginaAtual} de {totalPaginas}</span>
            <button disabled={paginaAtual >= totalPaginas} onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-40">Próxima</button>
          </div>
        </div>
      </div>

      {modalExportOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md ${darkMode ? 'bg-[#111A22] border-[#24313B] text-white' : 'bg-white border-slate-200 text-slate-800'} rounded-3xl p-6 shadow-2xl border space-y-4`}>
            <div className="flex justify-between items-center border-b pb-3 dark:border-[#24313B]">
              <h3 className="text-base font-black">Exportar Relatório em {tipoExportacao === 'pdf' ? 'PDF' : 'Excel'}</h3>
              <button onClick={() => setModalExportOpen(false)} className="p-2 rounded-xl bg-slate-800 text-slate-300"><Icons.X /></button>
            </div>
            <p className="text-xs text-slate-400">Escolha o escopo dos dados que deseja exportar com base nos filtros atuais:</p>
            <div className="space-y-3 pt-2">
              <button 
                onClick={() => tipoExportacao === 'pdf' ? handleExportPDF(true) : handleExportExcel(true)} 
                className="w-full p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex justify-between items-center shadow"
              >
                <span>Exportar resultados filtrados</span>
                <span className="px-2 py-0.5 rounded bg-white/20 text-[10px]">{dadosFiltrados.length} registros</span>
              </button>
              <button 
                onClick={() => tipoExportacao === 'pdf' ? handleExportPDF(false) : handleExportExcel(false)} 
                className="w-full p-4 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex justify-between items-center shadow"
              >
                <span>Exportar todos os dados</span>
                <span className="px-2 py-0.5 rounded bg-white/20 text-[10px]">{monitorias.length} registros</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NovaMonitoriaView({ unidades, monitorias, colaboradores, onSave, onCancel, monitoriaEdit, darkMode, showToast }) {
  const [etapa, setEtapa] = useState(1);
  const [unidadeSel, setUnidadeSel] = useState('');
  const [unidadeManual, setUnidadeManual] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [agente, setAgente] = useState('');
  const [canal, setCanal] = useState('Telefone');
  const [protocolo, setProtocolo] = useState('');
  const [dataAtendimento, setDataAtendimento] = useState('');
  const [horario, setHorario] = useState('');
  const [cliente, setCliente] = useState('');
  const [respostas, setRespostas] = useState({});
  const [criterios, setCriterios] = useState([]);
  const [feedbackIA, setFeedbackIA] = useState('');

  useEffect(() => {
    if (monitoriaEdit) {
      if (unidades.includes(monitoriaEdit.unidade)) setUnidadeSel(monitoriaEdit.unidade);
      else { setUnidadeSel('OUTRA'); setUnidadeManual(monitoriaEdit.unidade); }
      setDepartamento(monitoriaEdit.departamento); setAgente(monitoriaEdit.agente);
      setCanal(monitoriaEdit.canal || 'Telefone'); setProtocolo(monitoriaEdit.protocolo || '');
      setDataAtendimento(monitoriaEdit.dataAtendimento || ''); setHorario(monitoriaEdit.horario || '');
      setCliente(monitoriaEdit.cliente || ''); setFeedbackIA(monitoriaEdit.feedback || '');
      
      const crits = CRITERIOS_POR_DEPARTAMENTO[monitoriaEdit.departamento] || CRITERIOS_GENERICOS_COMERCIAL;
      setCriterios(crits);
      
      const initResps = {};
      const hasDetalhes = monitoriaEdit.detalhes && Object.keys(monitoriaEdit.detalhes).length > 0;
      
      if (hasDetalhes) {
        crits.forEach(c => {
          initResps[c.id] = monitoriaEdit.detalhes[c.id] || { atendeu: null, evidencia: '' };
        });
      } else if (monitoriaEdit.feedback) {
         const fText = monitoriaEdit.feedback || '';
         const positiveIndex = fText.indexOf('✅ Pontos Positivos:');
         const negativeIndex = fText.indexOf('⚠️ Oportunidades de Melhoria:');
         const actionIndex = fText.indexOf('💡 Plano de Ação:');

         let posText = '', negText = '';
         if (positiveIndex !== -1) posText = fText.substring(positiveIndex, negativeIndex !== -1 ? negativeIndex : (actionIndex !== -1 ? actionIndex : fText.length));
         if (negativeIndex !== -1) negText = fText.substring(negativeIndex, actionIndex !== -1 ? actionIndex : fText.length);
         const isPerfect = fText.toLowerCase().includes('excelente atendimento');

         crits.forEach(c => {
            let atendeu = null;
            let evidencia = '';
            
            const tRegex = c.titulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
            const negRegex = new RegExp(`-\\s*${tRegex}(?:\\s*\\((.*?)\\)|\\s*:\\s*(.*))?`, 'i');
            const posRegex = new RegExp(`-\\s*${tRegex}`, 'i');

            const negMatch = negText.match(negRegex);
            
            if (negMatch) {
               atendeu = false; 
               evidencia = (negMatch[1] || negMatch[2] || 'Extraído do feedback importado.').trim();
            } else if (posRegex.test(posText)) {
               atendeu = true; 
            } else if (isPerfect) {
               atendeu = true; 
            }
            
            initResps[c.id] = { atendeu, evidencia };
         });
      } else {
        crits.forEach(c => {
          initResps[c.id] = { atendeu: null, evidencia: '' };
        });
      }
      setRespostas(initResps);
    } else {
       setDataAtendimento(getLocalDateString());
       const crits = CRITERIOS_GENERICOS_COMERCIAL;
       setCriterios(crits);
       const initResps = {};
       crits.forEach(c => { initResps[c.id] = { atendeu: null, evidencia: '' }; });
       setRespostas(initResps);
    }
  }, [monitoriaEdit, unidades]);

  useEffect(() => {
    if (!monitoriaEdit && departamento && CRITERIOS_POR_DEPARTAMENTO[departamento]) {
      const crits = CRITERIOS_POR_DEPARTAMENTO[departamento];
      setCriterios(crits);
      const initResps = {}; 
      crits.forEach(c => { initResps[c.id] = { atendeu: null, evidencia: '' }; });
      setRespostas(initResps); 
    }
  }, [departamento, monitoriaEdit]);

  const handleResponder = (id, atendeu) => setRespostas(prev => ({ ...prev, [id]: { ...prev[id], atendeu } }));
  const handleEvidencia = (id, texto) => setRespostas(prev => ({ ...prev, [id]: { ...prev[id], evidencia: texto } }));

  const colaboradoresSugeridos = useMemo(() => {
    if (departamento === 'Filiais - Comercial') return AGENTES_COMERCIAL;
    const fromMonitorias = monitorias.filter(m => m.departamento === departamento && m.agente).map(m => m.agente);
    const fromColabs = (colaboradores || []).filter(c => c.departamento === departamento).map(c => c.nome);
    return Array.from(new Set([...fromMonitorias, ...fromColabs])).sort((a,b) => a.localeCompare(b, 'pt-BR'));
  }, [departamento, monitorias, colaboradores]);

  const gerarFeedbackLocal = () => {
    let pontosFortes = []; let pontosAtencao = [];
    Object.keys(respostas).forEach(id => {
      const crit = criterios.find(c => c.id === id);
      if (crit) {
        if (respostas[id]?.atendeu === true) pontosFortes.push(crit.titulo);
        if (respostas[id]?.atendeu === false) pontosAtencao.push(`${crit.titulo} (${respostas[id]?.evidencia || 'Sem observação'})`);
      }
    });

    let texto = `Olá ${agente || 'Colaborador'},\n\nAnalisamos seu atendimento do dia ${dataAtendimento} via ${canal}.\n\n`;
    if (pontosFortes.length > 0) texto += `✅ Pontos Positivos:\n- ${pontosFortes.join('\n- ')}\n\n`;
    if (pontosAtencao.length > 0) {
      texto += `⚠️ Oportunidades de Melhoria:\n- ${pontosAtencao.join('\n- ')}\n\n💡 Plano de Ação: Trabalhar os pontos de falha identificados para garantir conformidade rigorosa nos próximos atendimentos.`;
    } else { texto += `🏆 Excelente atendimento! Parabéns por cumprir rigorosamente todos os critérios de qualidade.`; }
    setFeedbackIA(texto);
  };

  const salvar = () => {
    const nota = Object.values(respostas).filter(r => r?.atendeu === true).length;
    let status = nota < 7 ? 'Crítico' : nota < 9 ? 'Em Atenção' : 'Conforme';
    const unidadeFinal = unidadeSel === 'OUTRA' ? unidadeManual.toUpperCase() : unidadeSel;

    const nova = {
      id: monitoriaEdit ? monitoriaEdit.id : `MON-${Date.now()}`,
      data: new Date().toLocaleDateString('pt-BR'),
      avaliador: 'Victor Silva - Analista SAC',
      agente: agente.trim().toUpperCase(), 
      unidade: unidadeFinal, 
      departamento: departamento || 'Filiais - Comercial', 
      canal, 
      protocolo,
      dataAtendimento, 
      horario, 
      cliente, 
      nota, 
      status,
      detalhes: respostas, 
      feedback: feedbackIA,
      updated_at: new Date().toISOString()
    };
    
    onSave(nova);
  };

  const respondidos = Object.values(respostas).filter(r => r?.atendeu !== null && r?.atendeu !== undefined).length;
  const podeAvancar1 = departamento && unidadeSel && agente && dataAtendimento && cliente && canal;
  const podeSalvar = criterios.length > 0 && respondidos === criterios.length;

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center ${darkMode ? 'bg-[#0B1117] text-[#F4F7F8]' : 'bg-[#F5F7F8] text-[#17202A]'}`}>
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center space-x-1"><Icons.X/> <span>Cancelar</span></button>
        <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">Etapa {etapa} de 3</span>
      </div>

      <div className={`w-full max-w-4xl ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'} rounded-2xl border p-6 md:p-8 mb-20`}>
        {etapa === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-3 dark:border-[#24313B]">Etapa 1 — Departamento, Canal e Colaborador</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Departamento / Setor *</label>
                <select 
                  value={departamento} 
                  disabled={!!monitoriaEdit} 
                  onChange={e => { setDepartamento(e.target.value); setAgente(''); }} 
                  className={`w-full ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border py-2.5 px-3 rounded-xl text-xs outline-none font-semibold text-blue-500`}
                >
                  <option value="">Selecione o departamento primeiro...</option>
                  {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Canal de Atendimento *</label>
                <select 
                  value={canal} 
                  onChange={e => setCanal(e.target.value)} 
                  className={`w-full ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border py-2.5 px-3 rounded-xl text-xs outline-none font-semibold text-blue-500`}
                >
                  {CANAIS_ATENDIMENTO.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {departamento ? (
              <div className="space-y-4 pt-4 border-t dark:border-[#24313B] animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Colaborador (Agente) {departamento === 'Filiais - Comercial' ? '(Lista Comercial)' : '(Livre ou Sugerido)'} *
                    </label>
                    {departamento === 'Filiais - Comercial' ? (
                      <select 
                        value={agente} 
                        onChange={e => setAgente(e.target.value)} 
                        className={`w-full ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border py-2.5 px-3 rounded-xl text-xs uppercase outline-none`}
                      >
                        <option value="">Selecione o agente da lista...</option>
                        {AGENTES_COMERCIAL.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    ) : (
                      <>
                        <input 
                          type="text" 
                          list="colaboradores-list" 
                          placeholder="Digite o nome do colaborador..." 
                          value={agente} 
                          onChange={e => setAgente(e.target.value)} 
                          className={`w-full ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border py-2.5 px-3 rounded-xl text-xs uppercase outline-none`} 
                        />
                        <datalist id="colaboradores-list">
                          {colaboradoresSugeridos.map(c => <option key={c} value={c} />)}
                        </datalist>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Unidade / Filial *</label>
                    <select value={unidadeSel} onChange={e => setUnidadeSel(e.target.value)} className={`w-full ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border py-2.5 px-3 rounded-xl text-xs outline-none`}><option value="">Selecione...</option>{unidades.map(u => <option key={u} value={u}>{u}</option>)}<option value="OUTRA">Outra</option></select>
                    {unidadeSel === 'OUTRA' && <input type="text" placeholder="Digite a unidade..." value={unidadeManual} onChange={e => setUnidadeManual(e.target.value)} className={`w-full mt-2 ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border py-2.5 px-3 rounded-xl text-xs uppercase`} />}
                  </div>

                  <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">Data do Atendimento *</label><input type="date" value={dataAtendimento} onChange={e => setDataAtendimento(e.target.value)} className={`w-full ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border py-2.5 px-3 rounded-xl text-xs outline-none`} /></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">Horário</label><input type="time" value={horario} onChange={e => setHorario(e.target.value)} className={`w-full ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border py-2.5 px-3 rounded-xl text-xs outline-none`} /></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">Cliente / Contato *</label><input type="text" placeholder="Nome ou telefone" value={cliente} onChange={e => setCliente(e.target.value)} className={`w-full ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border py-2.5 px-3 rounded-xl text-xs outline-none`} /></div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed rounded-2xl text-slate-400 text-xs">
                👆 Selecione o <strong>Departamento</strong> acima para habilitar a seleção do colaborador e demais dados do atendimento.
              </div>
            )}

            <div className="flex justify-end pt-4"><button disabled={!podeAvancar1} onClick={() => setEtapa(2)} className={`px-6 py-2.5 rounded-xl font-bold text-white text-xs ${podeAvancar1 ? 'bg-blue-600 hover:bg-blue-500 shadow-md' : 'bg-slate-700 opacity-50'}`}>Avançar para Checklist</button></div>
          </div>
        )}

        {etapa === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-3 dark:border-[#24313B]">Etapa 2 — Avaliação por Critérios ({departamento})</h3>
            <div className="space-y-4">
              {criterios.map((c, i) => (
                <div key={c.id} className={`p-4 rounded-2xl border transition-all ${respostas[c.id]?.atendeu === true ? 'border-blue-500/50 bg-blue-500/5' : respostas[c.id]?.atendeu === false ? 'border-rose-500/50 bg-rose-500/5' : darkMode ? 'border-[#24313B] bg-[#0B1117]' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div><h4 className="font-bold text-xs">{i+1}. {c.titulo}</h4><p className="text-slate-400 text-[11px] mt-0.5">{c.desc}</p></div>
                    <div className="flex space-x-2 shrink-0">
                      <button onClick={() => handleResponder(c.id, true)} className={`px-4 py-1.5 rounded-xl font-bold flex items-center space-x-1 text-xs ${respostas[c.id]?.atendeu === true ? 'bg-blue-600 text-white' : darkMode ? 'bg-[#111A22] text-slate-300' : 'bg-slate-200 text-slate-700'}`}><Icons.Check /><span>Sim</span></button>
                      <button onClick={() => handleResponder(c.id, false)} className={`px-4 py-1.5 rounded-xl font-bold flex items-center space-x-1 text-xs ${respostas[c.id]?.atendeu === false ? 'bg-rose-600 text-white' : darkMode ? 'bg-[#111A22] text-slate-300' : 'bg-slate-200 text-slate-700'}`}><Icons.X /><span>Não</span></button>
                    </div>
                  </div>
                  {respostas[c.id]?.atendeu === false && <textarea placeholder="Justificativa obrigatória da falha..." value={respostas[c.id]?.evidencia || ''} onChange={e => handleEvidencia(c.id, e.target.value)} className={`w-full mt-3 ${darkMode ? 'bg-[#0B1117] border-rose-900/50' : 'bg-white border-rose-300'} border rounded-xl p-3 text-xs outline-none h-20 resize-none`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4"><button onClick={() => setEtapa(1)} className="px-5 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 text-xs">Voltar</button><button disabled={!podeSalvar} onClick={() => { gerarFeedbackLocal(); setEtapa(3); }} className={`px-6 py-2.5 rounded-xl font-bold text-white text-xs ${podeSalvar ? 'bg-blue-600 hover:bg-blue-500 shadow-md' : 'bg-slate-700 opacity-50'}`}>Avançar</button></div>
          </div>
        )}

        {etapa === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-3 dark:border-[#24313B]">Etapa 3 — Feedback Gerado (IA)</h3>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Revisão Final do Feedback</label>
              <textarea value={feedbackIA} onChange={e => setFeedbackIA(e.target.value)} className={`w-full ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4 text-xs outline-none h-48 resize-none`} />
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setEtapa(2)} className="px-5 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 text-xs">Voltar</button>
              <button onClick={salvar} className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 text-xs">Salvar Monitoria</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const loadSheetJS = async () => {
  if (window.XLSX) return window.XLSX;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Falha ao carregar SheetJS'));
    document.head.appendChild(script);
  });
};

const parseExcelDate = (val) => {
  if (!val) return getLocalDateString();
  if (typeof val === 'number') {
    const utcDays = Math.floor(val - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    const offset = dateInfo.getTimezoneOffset() * 60000;
    return new Date(dateInfo.getTime() + offset).toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
    }
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return str;
};

const normalizeHeader = (headerStr) => {
  if (!headerStr) return '';
  return String(headerStr)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ');
};

const findHeaderRow = (rows) => {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i];
    if (!row) continue;
    const rowValues = Object.values(row).map(v => normalizeHeader(v));
    const hasId = rowValues.some(v => v.includes('ID') || v.includes('PROT'));
    const hasAgente = rowValues.some(v => v.includes('AGENTE') || v.includes('COLABORADOR'));
    const hasNota = rowValues.some(v => v.includes('NOTA'));
    if ((hasId && hasAgente) || (hasId && hasNota) || (hasAgente && hasNota)) {
      return i;
    }
  }
  return 4;
};

const COLUMN_MAPPING = {
  'ID / PROT.': 'id',
  'ID': 'id',
  'PROTOCOLO': 'id',
  'DATA': 'dataAtendimento',
  'DATA ATENDIMENTO': 'dataAtendimento',
  'CANAL': 'canal',
  'AGENTE': 'agente',
  'COLABORADOR': 'agente',
  'UNIDADE': 'unidade',
  'DEPARTAMENTO': 'departamento',
  'DEPTO': 'departamento',
  'CLIENTE': 'cliente',
  'NOTA': 'nota',
  'STATUS': 'status',
  'FEEDBACK AVALIADOR': 'feedback',
  'FEEDBACK': 'feedback'
};

function ImportarArquivoView({ monitorias, colaboradores, onUpdateMonitorias, onUpdateColaboradores, darkMode, showToast }) {
  const fileInputRef = useRef(null);
  const [etapaImportacao, setEtapaImportacao] = useState('upload');
  const [dadosPreview, setDadosPreview] = useState(null);
  const [progresso, setProgresso] = useState('');

  const processarArquivoLido = async (workbook) => {
    const firstSheetName = workbook.SheetNames[0];
    const targetSheetName = workbook.SheetNames.find(n => n.toUpperCase().includes('MONITORIA')) || firstSheetName;
    const worksheet = workbook.Sheets[targetSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!rawRows || rawRows.length === 0) {
      showToast('O arquivo está vazio.', 'error');
      setEtapaImportacao('upload');
      return;
    }

    setProgresso('Identificando cabeçalho...');
    const headerRowIdx = findHeaderRow(rawRows);
    const headerCols = rawRows[headerRowIdx];
    
    if (!headerCols) {
      showToast('Não foi possível identificar o cabeçalho na planilha.', 'error');
      setEtapaImportacao('upload');
      return;
    }

    setProgresso('Extraindo registros...');
    const dataRows = rawRows.slice(headerRowIdx + 1);
    const parsedRecords = [];

    dataRows.forEach((rowArray, idx) => {
      if (!rowArray || rowArray.length === 0) return;
      const rowObj = {};
      let hasData = false;
      headerCols.forEach((colName, colIdx) => {
        if (!colName) return;
        const val = rowArray[colIdx];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          hasData = true;
        }
        rowObj[String(colName).trim()] = val;
      });

      if (hasData) {
        parsedRecords.push({ _raw: rowObj, _index: idx });
      }
    });

    if (parsedRecords.length === 0) {
      showToast('Nenhum registro encontrado abaixo do cabeçalho.', 'error');
      setEtapaImportacao('upload');
      return;
    }

    let novasCont = 0;
    let atualizadasCont = 0;
    const listaProcessada = [];
    const mapMonitoriasExistentes = new Map(monitorias.map(m => [String(m.id).trim(), m]));

    parsedRecords.forEach(rec => {
      const raw = rec._raw;
      const mapped = {};
      const customFields = {};

      Object.keys(raw).forEach(rawKey => {
        const normKey = normalizeHeader(rawKey);
        const targetField = COLUMN_MAPPING[normKey];
        const val = raw[rawKey];

        if (targetField) {
          mapped[targetField] = val;
        } else if (rawKey && String(rawKey).trim() !== '') {
          customFields[rawKey] = val;
        }
      });

      const id = String(mapped.id || `MON-IMP-${Date.now()}-${rec._index}`).trim();
      const agente = String(mapped.agente || 'COLABORADOR').trim().toUpperCase();
      const departamento = String(mapped.departamento || 'Filiais - Comercial').trim();
      const unidade = String(mapped.unidade || 'MATRIZ').trim().toUpperCase();
      const canal = String(mapped.canal || 'Telefone').trim();
      const cliente = String(mapped.cliente || '').trim();
      const dataAtendimento = parseExcelDate(mapped.dataAtendimento);
      
      let nota = null;
      if (mapped.nota !== undefined && mapped.nota !== null && !isNaN(parseFloat(mapped.nota))) {
        nota = parseFloat(mapped.nota);
      }

      const status = String(mapped.status || (nota !== null && nota < 7 ? 'Crítico' : nota !== null && nota < 9 ? 'Em Atenção' : 'Conforme')).trim();
      const feedback = String(mapped.feedback || '').trim();

      const itemExistente = mapMonitoriasExistentes.get(id);

      let recordFinal;
      if (itemExistente) {
        atualizadasCont++;
        
        recordFinal = {
          ...itemExistente,
          dataAtendimento: dataAtendimento || itemExistente.dataAtendimento,
          canal: canal || itemExistente.canal,
          agente: agente || itemExistente.agente,
          unidade: unidade || itemExistente.unidade,
          departamento: departamento || itemExistente.departamento,
          cliente: cliente || itemExistente.cliente,
          nota: nota !== null ? nota : itemExistente.nota,
          status: status || itemExistente.status,
          feedback: feedback || itemExistente.feedback,
          customFields: { ...(itemExistente.customFields || {}), ...customFields },
          updated_at: new Date().toISOString()
        };
      } else {
        novasCont++;
        recordFinal = {
          id: id,
          data: new Date().toLocaleDateString('pt-BR'),
          dataAtendimento: dataAtendimento,
          canal: canal,
          agente: agente,
          unidade: unidade,
          departamento: departamento,
          cliente: cliente,
          nota: nota !== null ? nota : 10,
          status: status,
          feedback: feedback,
          detalhes: {},
          customFields: customFields,
          updated_at: new Date().toISOString()
        };
      }

      listaProcessada.push(recordFinal);
    });

    setDadosPreview({
      total: parsedRecords.length,
      novas: novasCont,
      atualizadas: atualizadasCont,
      records: listaProcessada,
      filename: targetSheetName
    });
    setEtapaImportacao('preview');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setProgresso('Carregando biblioteca SheetJS...');
    try {
      const XLSX = await loadSheetJS();
      const reader = new FileReader();

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.onload = async (event) => {
          try {
            setProgresso('Lendo arquivo Excel...');
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            await processarArquivoLido(workbook);
          } catch(err) {
            showToast('Erro ao ler arquivo XLSX.', 'error');
            setEtapaImportacao('upload');
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = async (event) => {
          try {
            setProgresso('Lendo arquivo CSV...');
            const text = event.target.result;
            const workbook = XLSX.read(text, { type: 'string' });
            await processarArquivoLido(workbook);
          } catch(err) {
            showToast('Erro ao ler arquivo CSV.', 'error');
            setEtapaImportacao('upload');
          }
        };
        reader.readAsText(file, 'UTF-8');
      }
    } catch(err) {
      showToast('Falha ao inicializar o leitor de planilhas.', 'error');
    }
  };

  const confirmarImportacao = async () => {
    if (!dadosPreview || !dadosPreview.records) return;
    setProgresso('Salvando monitorias no banco local...');
    
    const mapaFinal = new Map(monitorias.map(m => [m.id, m]));
    dadosPreview.records.forEach(r => mapaFinal.set(r.id, r));
    const listaFinal = Array.from(mapaFinal.values());

    if (colaboradores && onUpdateColaboradores) {
      const mapaColabs = new Map(colaboradores.map(c => [c.nome, c]));
      dadosPreview.records.forEach(r => {
        const nomeUpper = String(r.agente || '').trim().toUpperCase();
        if (nomeUpper && r.departamento !== 'Filiais - Comercial' && !mapaColabs.has(nomeUpper)) {
          mapaColabs.set(nomeUpper, {
            id: `COLAB-IMP-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
            nome: nomeUpper,
            departamento: r.departamento,
            unidade: r.unidade,
            ativo: true,
            origem: 'Importação (Planilha)',
            updated_at: new Date().toISOString()
          });
        }
      });
      await onUpdateColaboradores(Array.from(mapaColabs.values()));
    }

    await onUpdateMonitorias(listaFinal);

    showToast(`Importação concluída! ${dadosPreview.novas} novas, ${dadosPreview.atualizadas} atualizadas.`, 'success');
    setEtapaImportacao('upload');
    setDadosPreview(null);
  };

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 ${darkMode ? 'bg-[#0B1117] text-[#F4F7F8]' : 'bg-[#F5F7F8] text-[#17202A]'}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Importar / Exportar (CSV / XLSX)</h1>
        <p className="text-xs text-slate-400 mt-0.5">Restaure ou atualize as colunas que estão presentes no seu arquivo.</p>
      </div>

      {etapaImportacao === 'upload' && (
        <div className={`p-12 rounded-3xl border border-dashed flex flex-col items-center justify-center text-center space-y-4 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-300'}`}>
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><Icons.Import /></div>
          <div>
            <h3 className="font-bold text-sm">Arraste seu arquivo CSV ou XLSX aqui</h3>
            <p className="text-xs text-slate-400 mt-1">{progresso || 'O sistema mapeia apenas o que existe na planilha sem inventar colunas e informações que não estejam lá.'}</p>
          </div>
          <button onClick={() => fileInputRef.current.click()} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg">Selecionar Arquivo</button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx, .xls" className="hidden" />
        </div>
      )}

      {etapaImportacao === 'preview' && dadosPreview && (
        <div className={`p-8 rounded-3xl border space-y-6 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div>
            <h2 className="text-lg font-black">Prévia da Importação</h2>
            <p className="text-xs text-slate-400">Verifique os dados extraídos antes de confirmar a gravação no banco local.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-400 block font-bold">Total Encontrado</span>
              <strong className="text-xl font-black text-blue-500">{dadosPreview.total} registros</strong>
            </div>
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-400 block font-bold">Novas Monitorias</span>
              <strong className="text-xl font-black text-emerald-500">{dadosPreview.novas}</strong>
            </div>
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-400 block font-bold">Atualizações (Upsert)</span>
              <strong className="text-xl font-black text-indigo-500">{dadosPreview.atualizadas}</strong>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-xl dark:border-[#24313B]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-[#24313B] text-slate-400 bg-[#0B1117]' : 'border-slate-200 text-slate-600 bg-slate-100'}`}>
                  <th className="p-3">ID / Prot.</th>
                  <th className="p-3">Agente</th>
                  <th className="p-3">Departamento</th>
                  <th className="p-3 text-center">Nota</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-[#24313B]">
                {dadosPreview.records.map((r, i) => (
                  <tr key={i} className="hover:bg-blue-500/5">
                    <td className="p-3 font-bold">{r.id}</td>
                    <td className="p-3 font-semibold">{r.agente}</td>
                    <td className="p-3 text-slate-400">{r.departamento}</td>
                    <td className="p-3 text-center font-black">{r.nota}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-500">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-[#24313B]">
            <button onClick={() => { setEtapaImportacao('upload'); setDadosPreview(null); }} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700">Cancelar</button>
            <button onClick={confirmarImportacao} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg">Confirmar Importação</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditoriaView({ historico, darkMode }) {
  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 ${darkMode ? 'bg-[#0B1117] text-[#F4F7F8]' : 'bg-[#F5F7F8] text-[#17202A]'}`}>
      <div><h1 className="text-2xl md:text-3xl font-black tracking-tight">Histórico & Auditoria V2</h1><p className="text-xs text-slate-400 mt-0.5">Registro imutável de todas as ações realizadas no sistema.</p></div>
      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`}>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className={`border-b ${darkMode ? 'border-[#24313B] text-slate-400' : 'border-slate-100 text-slate-500'} uppercase tracking-wider`}>
              <th className="py-4 px-6 font-bold">Data / Hora</th>
              <th className="py-4 px-6 font-bold">Usuário</th>
              <th className="py-4 px-6 font-bold">Ação</th>
              <th className="py-4 px-6 font-bold">Detalhes</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-[#24313B]' : 'divide-slate-100'}`}>
            {historico.length === 0 ? <tr><td colSpan="4" className="py-12 text-center text-slate-400">Nenhum registro de auditoria.</td></tr> : historico.map(h => (
              <tr key={h.id} className={`hover:${darkMode ? 'bg-[#0B1117]/50' : 'bg-slate-50'}`}>
                <td className="py-3 px-6 font-bold">{h.data} às {h.hora}</td>
                <td className="py-3 px-6 text-blue-500 font-semibold">{h.usuario || 'Victor Silva'}</td>
                <td className="py-3 px-6 uppercase font-bold text-[10px]">{h.acao}</td>
                <td className="py-3 px-6 text-slate-400">{h.detalhes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConfiguracoesView({ unidades, onUpdateUnidades, darkMode, showToast }) {
  const savedSettings = StorageService.getSettings();
  const [gasUrl, setGasUrl] = useState(savedSettings.gasUrl || '');
  const [gasToken, setGasToken] = useState(savedSettings.gasToken || '');
  const [primaryColor, setPrimaryColor] = useState(savedSettings.primaryColor || DEFAULT_THEME.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(savedSettings.secondaryColor || DEFAULT_THEME.secondaryColor);

  const handleSalvar = () => {
    StorageService.saveSettings({
      ...StorageService.getSettings(),
      gasUrl,
      gasToken,
      primaryColor,
      secondaryColor
    });
    showToast('Configurações salvas com sucesso.', 'success');
    window.dispatchEvent(new CustomEvent('carvalima-theme-updated', {
      detail: { primaryColor, secondaryColor }
    }));
  };

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-4xl ${darkMode ? 'bg-[#0B1117] text-[#F4F7F8]' : 'bg-[#F5F7F8] text-[#17202A]'}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Configurações do Sistema</h1>
        <p className="text-xs text-slate-400 mt-0.5">Gerencie integrações, filiais e a identidade visual da Carvalima.</p>
      </div>

      <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-500">Identidade Visual</h3>
        <p className="text-xs text-slate-400">Escolha as cores principais do layout. Elas também serão utilizadas no relatório executivo em PDF.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Cor primária</label>
            <div className="flex items-center gap-3">
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-12 h-10 rounded-lg border-0 p-0.5 cursor-pointer bg-transparent" />
              <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} maxLength={7} className={`flex-1 border py-2 px-3 rounded-xl text-xs font-mono uppercase outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Botões, destaques e elementos principais.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Cor secundária</label>
            <div className="flex items-center gap-3">
              <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-12 h-10 rounded-lg border-0 p-0.5 cursor-pointer bg-transparent" />
              <input type="text" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} maxLength={7} className={`flex-1 border py-2 px-3 rounded-xl text-xs font-mono uppercase outline-none ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'}`} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Contrastes, subtítulos e detalhes complementares.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: hexToRgba(primaryColor, 0.25), background: `linear-gradient(90deg, ${hexToRgba(primaryColor, 0.10)}, ${hexToRgba(secondaryColor, 0.10)})` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: primaryColor }}>C</div>
          <div className="flex-1">
            <p className="text-xs font-black">Pré-visualização da identidade</p>
            <p className="text-[10px] text-slate-400">A identidade será aplicada ao layout e ao PDF executivo.</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: secondaryColor }}>V2</div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-[#111A22] border-[#24313B]' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-500">Google Apps Script API</h3>
        <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">URL do Web App</label><input type="text" value={gasUrl} onChange={e => setGasUrl(e.target.value)} className={`w-full ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border py-2 px-3 rounded-xl text-xs outline-none`} /></div>
        <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">Token de Segurança</label><input type="password" value={gasToken} onChange={e => setGasToken(e.target.value)} className={`w-full ${darkMode ? 'bg-[#0B1117] border-[#24313B]' : 'bg-slate-50 border-slate-200'} border py-2 px-3 rounded-xl text-xs outline-none`} /></div>
        <button onClick={handleSalvar} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold">Salvar Configurações</button>
      </div>
    </div>
  );
}

function ModalDetalheMonitoria({ monitoria, onClose, darkMode }) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl ${darkMode ? 'bg-[#111A22] border-[#24313B] text-white' : 'bg-white border-slate-200 text-slate-800'} rounded-3xl p-6 shadow-2xl border space-y-4`}>
        <div className="flex justify-between items-center border-b pb-3 dark:border-[#24313B]">
          <h3 className="text-base font-black">Detalhes da Monitoria {monitoria.id}</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-300"><Icons.X /></button>
        </div>
        <div className="text-xs space-y-3">
          <div>Canal: <strong className="text-blue-500 uppercase">{monitoria.canal || 'Telefone'}</strong></div>
          <div>Colaborador (Agente): <strong className="text-blue-500">{monitoria.agente}</strong> ({monitoria.unidade})</div>
          <div>Departamento: <strong>{monitoria.departamento}</strong></div>
          <div>Nota: <span className="font-black text-blue-500 text-base">{monitoria.nota}</span> ({monitoria.status})</div>
          <div className="p-4 rounded-xl border dark:border-[#24313B] bg-slate-500/5 whitespace-pre-line">{monitoria.feedback}</div>
        </div>
      </div>
    </div>
  );
}