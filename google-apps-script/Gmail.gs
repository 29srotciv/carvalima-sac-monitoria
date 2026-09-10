/**
 * CARVALIMA SAC — Script Gmail para Supervisores
 *
 * ESTE PROJETO É SEPARADO DO SCRIPT DE SINCRONIZAÇÃO DO GOOGLE SHEETS.
 *
 * Configure em Configurações do projeto > Propriedades do script:
 *   GMAIL_SECURITY_TOKEN = segredo exclusivo deste script
 *   GMAIL_SPREADSHEET_ID = ID da planilha do Carvalima QA
 *
 * Publique este projeto como Aplicativo da Web.
 * Execute como: Eu
 * Acesso: Qualquer pessoa
 *
 * O Gmail usado para os envios será a conta Google que publicar/autorizar este Web App.
 */

function gmailConfig_() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('GMAIL_SECURITY_TOKEN');
  var spreadsheetId = props.getProperty('GMAIL_SPREADSHEET_ID');
  if (!token || !spreadsheetId) {
    throw new Error('Configure GMAIL_SECURITY_TOKEN e GMAIL_SPREADSHEET_ID nas propriedades deste Script Gmail.');
  }
  return { token: token, spreadsheetId: spreadsheetId };
}

function gmailAuth_(payload) {
  var cfg = gmailConfig_();
  if (!payload || payload.tokenSeguranca !== cfg.token) throw new Error('Token do Script Gmail inválido.');
  return cfg;
}

function gmailBook_(cfg) { return SpreadsheetApp.openById(cfg.spreadsheetId); }

function gmailSheet_(book, name, headers) {
  var sheet = book.getSheetByName(name) || book.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

function gmailJson_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function gmailFindRow_(sheet, column, value) {
  if (sheet.getLastRow() < 2) return -1;
  var values = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(value)) return i + 2;
  }
  return -1;
}

function gmailUpsert_(sheet, keyColumn, key, rowValues) {
  var row = gmailFindRow_(sheet, keyColumn, key);
  if (row < 0) { sheet.appendRow(rowValues); return sheet.getLastRow(); }
  sheet.getRange(row, 1, 1, rowValues.length).setValues([rowValues]);
  return row;
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || '{}');
    var action = payload.action || '';
    if (action === 'sendSupervisorEmail') return gmailSendSupervisorEmail_(payload);
    if (action === 'getSupervisorRequest') return gmailGetSupervisorRequest_(payload);
    if (action === 'submitSupervisorFeedback') return gmailSubmitSupervisorFeedback_(payload);
    if (action === 'saveSupervisor') return gmailSaveSupervisor_(payload);
    return gmailJson_({ success: false, error: 'Ação não reconhecida.' });
  } catch (err) {
    return gmailJson_({ success: false, error: err.message || String(err) });
  }
}

function doGet() {
  try {
    gmailConfig_();
    return gmailJson_({ success: true, service: 'Carvalima SAC Script Gmail', time: new Date().toISOString() });
  } catch (err) {
    return gmailJson_({ success: false, error: err.message || String(err) });
  }
}

function gmailHeaders_() {
  return ['responseToken','monitoriaId','supervisorNome','supervisorEmail','departamento','agente','nota','enviadoAt','responseUrl','respondidoAt','decisao','mensagem','proximoPasso','status'];
}

function gmailSendSupervisorEmail_(p) {
  var cfg = gmailAuth_(p);
  var book = gmailBook_(cfg);
  var sh = gmailSheet_(book, 'CARVALIMA_ENVIO_SUPERVISOR', gmailHeaders_());
  var s = p.supervisor || {};
  var m = p.monitoria || {};
  if (!s.email || !m.id || !p.responseToken || !p.pdfBase64 || !p.responseUrl) throw new Error('Dados insuficientes para envio.');

  var subject = 'Retorno de monitoria SAC — ' + (m.agente || 'Colaborador') + ' — ' + m.id;
  var bodyText = [
    'Prezado(a) ' + (s.nome || 'Supervisor(a)') + ',',
    '',
    'Encaminhamos para sua ciência e retorno a monitoria de atendimento realizada pelo SAC da Carvalima.',
    '',
    'Colaborador: ' + (m.agente || '—'),
    'Departamento: ' + (m.departamento || '—'),
    'Unidade: ' + (m.unidade || '—'),
    'Monitoria: ' + (m.id || '—'),
    'Nota: ' + (m.nota || '—'),
    '',
    'Solicitamos a análise da avaliação e o registro do seu retorno pelo link abaixo:',
    p.responseUrl,
    '',
    'O retorno ficará registrado para acompanhamento da evolução e dos planos de ação do SAC.',
    '',
    'Atenciosamente,',
    'Victor Silva',
    'Analista SAC — Carvalima'
  ].join('\n');

  var blob = Utilities.newBlob(
    Utilities.base64Decode(p.pdfBase64),
    MimeType.PDF,
    'Carvalima_Monitoria_' + m.id + '.pdf'
  );

  GmailApp.sendEmail(s.email, subject, bodyText, {
    name: 'Carvalima SAC — Qualidade',
    attachments: [blob]
  });

  var now = new Date();
  gmailUpsert_(sh, 1, p.responseToken, [
    p.responseToken, m.id, s.nome || '', s.email, s.departamento || '',
    m.agente || '', m.nota || '', now, p.responseUrl, '', '', '', '', 'Enviado'
  ]);

  return gmailJson_({ success: true, sentAt: now.toISOString() });
}

// Endpoint público. O responseToken é a autorização exclusiva desta solicitação.
function gmailGetSupervisorRequest_(p) {
  var cfg = gmailConfig_();
  var book = gmailBook_(cfg);
  var sh = gmailSheet_(book, 'CARVALIMA_ENVIO_SUPERVISOR', gmailHeaders_());
  var row = gmailFindRow_(sh, 1, p.responseToken);
  if (row < 0) throw new Error('Solicitação de retorno não encontrada ou expirada.');

  var v = sh.getRange(row, 1, 1, 14).getValues()[0];
  return gmailJson_({
    success: true,
    data: {
      responseToken: v[0], monitoriaId: v[1], supervisorNome: v[2], supervisorEmail: v[3],
      departamento: v[4], agente: v[5], nota: v[6], enviadoAt: v[7], respondidoAt: v[9],
      decisao: v[10], mensagem: v[11], proximoPasso: v[12], status: v[13], respondido: !!v[9]
    }
  });
}

// Endpoint público. O responseToken autoriza somente esta solicitação específica.
function gmailSubmitSupervisorFeedback_(p) {
  var cfg = gmailConfig_();
  var book = gmailBook_(cfg);
  var sh = gmailSheet_(book, 'CARVALIMA_ENVIO_SUPERVISOR', gmailHeaders_());
  var row = gmailFindRow_(sh, 1, p.responseToken);
  if (row < 0) throw new Error('Solicitação de retorno não encontrada.');

  var now = new Date();
  sh.getRange(row, 10, 1, 5).setValues([[
    now, p.decisao || 'Ciente', p.mensagem || '', p.proximoPasso || '', 'Respondido'
  ]]);
  return gmailJson_({ success: true, respondidoAt: now.toISOString() });
}

function gmailSaveSupervisor_(p) {
  var cfg = gmailAuth_(p);
  var book = gmailBook_(cfg);
  var sh = gmailSheet_(book, 'CARVALIMA_SUPERVISORES', ['id','nome','email','departamento','ativo','updatedAt']);
  var s = p.supervisor || {};
  if (!s.id || !s.nome || !s.email || !s.departamento) throw new Error('Dados do supervisor incompletos.');
  gmailUpsert_(sh, 1, s.id, [s.id, s.nome, s.email, s.departamento, s.ativo !== false, new Date()]);
  return gmailJson_({ success: true });
}
