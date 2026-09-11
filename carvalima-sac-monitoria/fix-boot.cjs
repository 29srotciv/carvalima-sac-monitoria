const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'App.jsx');
let s = fs.readFileSync(file, 'utf8');
const MARK = 'CARVALIMA_BOOT_HARDENING_V1';
if (s.includes(MARK)) {
  console.log('Boot hardening já aplicado.');
  process.exit(0);
}
const oldInit = `  async init() {\n    if (!window.indexedDB) { this.useFallback = true; return; }\n    return new Promise((resolve) => {\n      const request = indexedDB.open(DB_NAME, DB_VERSION);\n      request.onupgradeneeded = (e) => {\n        const db = e.target.result;\n        if (!db.objectStoreNames.contains('monitorias')) db.createObjectStore('monitorias', { keyPath: 'id' });\n        if (!db.objectStoreNames.contains('auditoria')) db.createObjectStore('auditoria', { keyPath: 'id' });\n        if (!db.objectStoreNames.contains('colaboradores')) db.createObjectStore('colaboradores', { keyPath: 'id' });\n      };\n      request.onsuccess = (e) => { this.db = e.target.result; resolve(); };\n      request.onerror = () => { this.useFallback = true; resolve(); };\n    });\n  },`;
const newInit = `  async init() {\n    if (!window.indexedDB) { this.useFallback = true; return; }\n    return new Promise((resolve) => {\n      let finished = false;\n      const finish = (fallback = false) => {\n        if (finished) return;\n        finished = true;\n        if (fallback) this.useFallback = true;\n        resolve();\n      };\n      const timer = setTimeout(() => finish(true), 4000);\n      try {\n        const request = indexedDB.open(DB_NAME, DB_VERSION);\n        request.onupgradeneeded = (e) => {\n          const db = e.target.result;\n          if (!db.objectStoreNames.contains('monitorias')) db.createObjectStore('monitorias', { keyPath: 'id' });\n          if (!db.objectStoreNames.contains('auditoria')) db.createObjectStore('auditoria', { keyPath: 'id' });\n          if (!db.objectStoreNames.contains('colaboradores')) db.createObjectStore('colaboradores', { keyPath: 'id' });\n        };\n        request.onsuccess = (e) => { clearTimeout(timer); this.db = e.target.result; finish(false); };\n        request.onerror = () => { clearTimeout(timer); finish(true); };\n        request.onblocked = () => { clearTimeout(timer); finish(true); };\n      } catch (err) { clearTimeout(timer); finish(true); }\n    });\n  },`;
if (!s.includes(oldInit)) throw new Error('StorageService.init não encontrado.');
s = s.replace(oldInit, newInit);
const oldEffect = `  useEffect(() => {\n    const initializeApp = async () => {\n      await StorageService.init();\n      const savedTheme = StorageService.getSettings().darkMode;`;
const newEffect = `  useEffect(() => {\n    const initializeApp = async () => {\n      try {\n        await StorageService.init();\n      } catch (err) {\n        StorageService.useFallback = true;\n      }\n      const savedTheme = StorageService.getSettings().darkMode;`;
if (!s.includes(oldEffect)) throw new Error('Inicialização do App não encontrada.');
s = s.replace(oldEffect, newEffect);
const oldEnd = `      setLoading(false);\n    };\n    initializeApp();\n  }, []);`;
const newEnd = `      setLoading(false);\n    };\n    initializeApp().catch(() => {\n      StorageService.useFallback = true;\n      setLoading(false);\n    });\n  }, []);\n\n  /* ${MARK} */`;
if (!s.includes(oldEnd)) throw new Error('Final da inicialização não encontrado.');
s = s.replace(oldEnd, newEnd);
fs.writeFileSync(file, s, 'utf8');
console.log('Boot hardening aplicado.');
