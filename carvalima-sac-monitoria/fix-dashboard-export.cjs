const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'ModernDashboard.jsx');
let s = fs.readFileSync(file, 'utf8');

if (/export\s+default\s+ModernDashboard\b/.test(s)) {
  console.log('ModernDashboard já possui export default.');
  process.exit(0);
}

if (!/\bModernDashboard\b/.test(s)) {
  throw new Error('Componente ModernDashboard não encontrado.');
}

s += '\n\n// Build compatibility: App.jsx imports the dashboard as default.\nexport default ModernDashboard;\n';
fs.writeFileSync(file, s, 'utf8');
console.log('Export default do ModernDashboard aplicado.');
