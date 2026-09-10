/**
 * CARVALIMA SAC — Comunicação com Supervisores
 *
 * Use este arquivo no mesmo projeto Google Apps Script que atende o gasUrl do sistema.
 * Configure nas propriedades do projeto:
 *   SECURITY_TOKEN = um segredo forte compartilhado com o sistema
 *   SPREADSHEET_ID = ID da planilha usada pelo Carvalima QA
 *
 * O e-mail é enviado pela conta Google que publicar este Web App.
 */

function carvalimaConfig_() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('SECURITY_TOKEN');
  var spreadsheetId = props.getProperty('SPREADSHEET_ID');
  if (!token || !spreadsheetId) throw new Error('Configure SECURITY_TOKEN e SPREADSHEET_ID nas propriedades do Apps Script.');
  return { token: token, spreadsheetId: spreadsheetId };
}
function carvalimaAuth_(payload) { var cfg = carvalimaConfig_(); if (!payload || payload.tokenSeguranca !== cfg.token) throw new Error('Token de segurança inválido.'); return cfg; }
function carvalimaBook_(cfg) { return SpreadsheetApp.openById(cfg.spreadsheetId); }
function carvalimaSheet_(book, name, headers) { var sheet = book.getSheetByName(name) || book.insertSheet(name); if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]); return sheet; }
function carvalimaJson_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function carvalimaFindRow_(sheet, column, value) { if (sheet.getLastRow() < 2) return -1; var values = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).getValues(); for (var i = 0; i < values.length; i++) if (String(values[i][0]) === String(value)) return i + 2; return -1; }
function carvalimaUpsert_(sheet, keyColumn, key, rowValues) { var row = carvalimaFindRow_(sheet, keyColumn, key); if (row < 0) { sheet.appendRow(rowValues); return sheet.getLastRow(); } sheet.getRange(row, 1, 1, rowValues.length).setValues([rowValues]); return row; }

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || '{}');
    var action = payload.action || '';
    if (action === 'sendSupervisorEmail') return carvalimaSendSupervisorEmail_(payload);
    if (action === 'getSupervisorRequest') return carvalimaGetSupervisorRequest_(payload);
    if (action === 'submitSupervisorFeedback') return carvalimaSubmitSupervisorFeedback_(payload);
    if (action === 'saveSupervisor') return carvalimaSaveSupervisor_(payload);
    if (action === 'sync') return carvalimaSync_(payload);
    return carvalimaJson_({ success: false, error: 'Ação não reconhecida.' });
  } catch (err) { return carvalimaJson_({ success: false, error: err.message || String(err) }); }
}
function doGet(e) { return carvalimaJson_({ success: true, service: 'Carvalima SAC Supervisor API', time: new Date().toISOString() }); }

function carvalimaSendSupervisorEmail_(p) {
  var cfg = carvalimaAuth_(p); var book = carvalimaBook_(cfg);
  var sh = carvalimaSheet_(book, 'CARVALIMA_ENVIO_SUPERVISOR', ['responseToken','monitoriaId','supervisorNome','supervisorEmail','departamento','agente','nota','enviadoAt','responseUrl','respondidoAt','decisao','mensagem','proximoPasso','status']);
  var s = p.supervisor || {}, m = p.monitoria || {};
  if (!s.email || !m.id || !p.responseToken || !p.pdfBase64 || !p.responseUrl) throw new Error('Dados insuficientes para envio.');
  var subject = 'Retorno de monitoria SAC — ' + (m.agente || 'Colaborador') + ' — ' + (m.id || 'Monitoria');
  var bodyText = ['Prezado(a) ' + (s.nome || 'Supervisor(a)') + ',', '', 'Encaminhamos para sua ciência e retorno a monitoria de atendimento realizada pelo SAC.', '', 'Colaborador: ' + (m.agente || '—'), 'Departamento: ' + (m.departamento || '—'), 'Unidade: ' + (m.unidade || '—'), 'Monitoria: ' + (m.id || '—'), 'Nota: ' + (m.nota || '—'), '', 'Solicitamos a análise da avaliação, a orientação do colaborador quando aplicável e o registro do retorno pelo link abaixo:', p.responseUrl, '', 'O retorno ficará registrado para acompanhamento da evolução e dos planos de ação do SAC.', '', 'Atenciosamente,', 'Victor Silva', 'Analista SAC — Carvalima'].join('\n');
  var blob = Utilities.newBlob(Utilities.base64Decode(p.pdfBase64), MimeType.PDF, 'Carvalima_Monitoria_' + m.id + '.pdf');
  GmailApp.sendEmail(s.email, subject, bodyText, { name: 'Carvalima SAC — Qualidade', attachments: [blob] });
  var now = new Date();
  carvalimaUpsert_(sh, 1, p.responseToken, [p.responseToken, m.id, s.nome || '', s.email, s.departamento || '', m.agente || '', m.nota || '', now, p.responseUrl, '', '', '', '', 'Enviado']);
  return carvalimaJson_({ success: true, sentAt: now.toISOString() });
}

// Endpoint público: o responseToken é o segredo do link enviado por e-mail. Não exige o SECURITY_TOKEN do sistema.
function carvalimaGetSupervisorRequest_(p) {
  var cfg = carvalimaConfig_(); var book = carvalimaBook_(cfg);
  var sh = carvalimaSheet_(book, 'CARVALIMA_ENVIO_SUPERVISOR', ['responseToken','monitoriaId','supervisorNome','supervisorEmail','departamento','agente','nota','enviadoAt','responseUrl','respondidoAt','decisao','mensagem','proximoPasso','status']);
  var row = carvalimaFindRow_(sh, 1, p.responseToken);
  if (row < 0) throw new Error('Solicitação de retorno não encontrada ou expirada.');
  var v = sh.getRange(row, 1, 1, 14).getValues()[0];
  return carvalimaJson_({ success: true, data: { responseToken: v[0], monitoriaId: v[1], supervisorNome: v[2], supervisorEmail: v[3], departamento: v[4], agente: v[5], nota: v[6], enviadoAt: v[7], respondidoAt: v[9], decisao: v[10], mensagem: v[11], proximoPasso: v[12], status: v[13], respondido: !!v[9] } });
}

// Endpoint público: o responseToken autoriza apenas esta solicitação específica.
function carvalimaSubmitSupervisorFeedback_(p) {
  var cfg = carvalimaConfig_(); var book = carvalimaBook_(cfg);
  var sh = carvalimaSheet_(book, 'CARVALIMA_ENVIO_SUPERVISOR', ['responseToken','monitoriaId','supervisorNome','supervisorEmail','departamento','agente','nota','enviadoAt','responseUrl','respondidoAt','decisao','mensagem','proximoPasso','status']);
  var row = carvalimaFindRow_(sh, 1, p.responseToken);
  if (row < 0) throw new Error('Solicitação de retorno não encontrada.');
  var now = new Date();
  sh.getRange(row, 10, 1, 5).setValues([[now, p.decisao || 'Ciente', p.mensagem || '', p.proximoPasso || '', 'Respondido']]);
  return carvalimaJson_({ success: true, respondidoAt: now.toISOString() });
}

function carvalimaSaveSupervisor_(p) {
  var cfg = carvalimaAuth_(p); var book = carvalimaBook_(cfg);
  var sh = carvalimaSheet_(book, 'CARVALIMA_SUPERVISORES', ['id','nome','email','departamento','ativo','updatedAt']);
  var s = p.supervisor || {};
  if (!s.id || !s.nome || !s.email || !s.departamento) throw new Error('Dados do supervisor incompletos.');
  carvalimaUpsert_(sh, 1, s.id, [s.id, s.nome, s.email, s.departamento, s.ativo !== false, new Date()]);
  return carvalimaJson_({ success: true });
}

function carvalimaSync_(p) {
  var cfg = carvalimaAuth_(p); var book = carvalimaBook_(cfg);
  var sh = carvalimaSheet_(book, 'CARVALIMA_MONITORIAS', ['id','payload','updatedAt']);
  var incoming = Array.isArray(p.monitorias) ? p.monitorias : []; var created = 0; var updated = 0;
  incoming.forEach(function(m) { if (!m || !m.id) return; var row = carvalimaFindRow_(sh, 1, m.id); var payload = JSON.stringify(m); if (row < 0) { sh.appendRow([m.id, payload, new Date(m.updated_at || Date.now())]); created++; } else { sh.getRange(row, 2, 1, 2).setValues([[payload, new Date(m.updated_at || Date.now())]]); updated++; } });
  var out = [];
  if (sh.getLastRow() >= 2) sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function(r) { if (!r[1]) return; try { out.push(JSON.parse(r[1])); } catch (e) {} });
  var env = book.getSheetByName('CARVALIMA_ENVIO_SUPERVISOR');
  if (env && env.getLastRow() >= 2) {
    var ev = env.getRange(2, 1, env.getLastRow() - 1, 14).getValues(), byId = {};
    ev.forEach(function(r) { if (r[1]) byId[String(r[1])] = r; });
    out = out.map(function(m) { var r = byId[String(m.id)]; if (!r) return m; return Object.assign({}, m, { supervisorNome: r[2], supervisorEmail: r[3], supervisorDepartamento: r[4], supervisorToken: r[0], supervisorEnvioAt: r[7] ? new Date(r[7]).toISOString() : m.supervisorEnvioAt, supervisorStatus: r[13] || m.supervisorStatus, supervisorRetornoAt: r[9] ? new Date(r[9]).toISOString() : m.supervisorRetornoAt, feedbackSupervisor: r[11] || m.feedbackSupervisor, statusFeedback: r[13] === 'Respondido' ? 'Concluído' : m.statusFeedback, feedbackSupervisorAt: r[9] ? new Date(r[9]).toISOString() : m.feedbackSupervisorAt, decisaoSupervisor: r[10] || m.decisaoSupervisor, proximoPassoSupervisor: r[12] || m.proximoPassoSupervisor }); });
  }
  return carvalimaJson_({ success: true, created: created, updated: updated, monitorias: out });
}
