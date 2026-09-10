const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'ModernDashboard.jsx');
let s = fs.readFileSync(file, 'utf8');

// ModernDashboard can already use either form below. Never append a second
// default export, because Vite/Rolldown rejects modules with duplicate defaults.
if (/export\s+default\s+function\s+ModernDashboard\b/.test(s) || /export\s+default\s+ModernDashboard\b/.test(s)) {
  console.log('ModernDashboard já possui um único export default.');
  process.exit(0);
}

if (!/\bModernDashboard\b/.test(s)) {
  throw new Error('Componente ModernDashboard não encontrado.');
}

s += '\n\n// Build compatibility: App.jsx imports the dashboard as default.\nexport default ModernDashboard;\n';
fs.writeFileSync(file, s, 'utf8');
console.log('Export default do ModernDashboard aplicado.');
