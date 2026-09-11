/**
 * CARVALIMA SAC — Script Gmail
 * Projeto separado do Apps Script de Google Sheets.
 *
 * Propriedades do script:
 *   GMAIL_SECURITY_TOKEN = token secreto usado pelo sistema
 *   GMAIL_SPREADSHEET_ID = ID da planilha que receberá os registros de envio/retorno
 */

function cfg_() {
  var p = PropertiesService.getScriptProperties();
  var token = p.getProperty('GMAIL_SECURITY_TOKEN');
  var spreadsheetId = p.getProperty('GMAIL_SPREADSHEET_ID');
  if (!token || !spreadsheetId) throw new Error('Configure GMAIL_SECURITY_TOKEN e GMAIL_SPREADSHEET_ID nas propriedades do Script Gmail.');
  return { token: token, spreadsheetId: spreadsheetId };
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  try {
    cfg_();
    return json_({ success: true, service: 'Carvalima Script Gmail', version: '1.1' });
  } catch (err) {
    return json_({ success: false, error: err.message || String(err) });
  }
}

function doPost(e) {
  try {
    var body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    var action = body.action || '';
    if (action === 'getSupervisorRequest') return getSupervisorRequest_(body);
    if (action === 'submitSupervisorFeedback') return submitSupervisorFeedback_(body);
    if (action === 'sendSupervisorEmail') return sendSupervisorEmail_(body);
    if (action === 'syncSupervisorReturns') return syncSupervisorReturns_(body);
    return json_({ success: false, error: 'Ação não reconhecida.' });
  } catch (err) {
    return json_({ success: false, error: err.message || String(err) });
  }
}

function authorized_(body) {
  var cfg = cfg_();
  if (!body || body.tokenSeguranca !== cfg.token) throw new Error('Token do Script Gmail inválido.');
  return cfg;
}

function sheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sh;
}

function sendSupervisorEmail_(body) {
  var cfg = authorized_(body);
  var sup = body.supervisor || {};
  var m = body.monitoria || {};
  var responseToken = String(body.responseToken || '').trim();
  var responseUrl = String(body.responseUrl || '').trim();
  if (!responseToken || !responseUrl) throw new Error('Token ou link de retorno não informado.');
  if (!sup.email) throw new Error('E-mail do supervisor não informado.');

  var ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  var sh = sheet_(ss, 'CARVALIMA_GMAIL_ENVIOS', [
    'responseToken','monitoriaId','supervisorNome','supervisorEmail','departamento','agente','nota','enviadoEm','responseUrl','statusRetorno'
  ]);

  var subject = 'Carvalima SAC | Retorno de monitoria ' + (m.id || 'sem ID');
  var plain = 'Olá, ' + (sup.nome || 'Supervisor') + '.\n\n' +
    'Encaminhamos para sua análise a monitoria ' + (m.id || '—') + ', realizada com ' + (m.agente || '—') + '.\n' +
    'Departamento: ' + (m.departamento || '—') + '\n' +
    'Nota: ' + (m.nota != null ? m.nota : '—') + '\n\n' +
    'O PDF da monitoria está anexado a este e-mail. Solicitamos seu retorno sobre a orientação realizada, ciência dos pontos identificados e próximos passos.\n\n' +
    'Responder pelo portal: ' + responseUrl + '\n\n' +
    'Atenciosamente,\nVictor Silva\nAnalista SAC | Carvalima';

  var html = '<div style="font-family:Arial,sans-serif;color:#17202A;line-height:1.55">' +
    '<h2 style="color:#2563EB;margin-bottom:4px">Carvalima • SAC</h2>' +
    '<p>Olá, <b>' + esc_(sup.nome || 'Supervisor') + '</b>.</p>' +
    '<p>Encaminhamos para sua análise a monitoria <b>' + esc_(m.id || '—') + '</b>, realizada com <b>' + esc_(m.agente || '—') + '</b>.</p>' +
    '<p><b>Departamento:</b> ' + esc_(m.departamento || '—') + '<br><b>Nota:</b> ' + esc_(m.nota != null ? m.nota : '—') + '</p>' +
    '<p>O PDF da monitoria está anexado. Solicitamos seu retorno sobre a orientação realizada, ciência dos pontos identificados e próximos passos para acompanhamento.</p>' +
    '<p><a href="' + esc_(responseUrl) + '" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">Responder monitoria</a></p>' +
    '<p style="font-size:12px;color:#64748B">O link é específico desta solicitação de monitoria.</p>' +
    '<p>Atenciosamente,<br><b>Victor Silva</b><br>Analista SAC | Carvalima</p></div>';

  var options = { htmlBody: html, name: 'Carvalima SAC' };
  if (body.pdfBase64) {
    var bytes = Utilities.base64Decode(body.pdfBase64);
    options.attachments = [Utilities.newBlob(bytes, 'application/pdf', 'Monitoria_' + String(m.id || 'Carvalima') + '.pdf')];
  }
  GmailApp.sendEmail(String(sup.email), subject, plain, options);

  sh.appendRow([
    responseToken, m.id || '', sup.nome || '', sup.email || '', sup.departamento || '', m.agente || '', m.nota != null ? m.nota : '', new Date(), responseUrl, 'Pendente'
  ]);
  return json_({ success: true, message: 'E-mail enviado pelo Gmail.', responseToken: responseToken });
}

function getSupervisorRequest_(body) {
  var token = String(body.responseToken || '').trim();
  if (!token) return json_({ success: false, error: 'Token de retorno ausente.' });
  var cfg = cfg_();
  var ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  var sh = ss.getSheetByName('CARVALIMA_GMAIL_ENVIOS');
  if (!sh || sh.getLastRow() < 2) return json_({ success: false, error: 'Solicitação não encontrada.' });
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var idx = {}; headers.forEach(function(h, i) { idx[h] = i; });
  for (var i = values.length - 1; i >= 1; i--) {
    if (String(values[i][idx.responseToken] || '') === token) {
      return json_({ success: true, data: {
        supervisorNome: values[i][idx.supervisorNome], supervisorEmail: values[i][idx.supervisorEmail],
        departamento: values[i][idx.departamento], agente: values[i][idx.agente], monitoriaId: values[i][idx.monitoriaId],
        nota: values[i][idx.nota], respondido: retornoExiste_(ss, token)
      }});
    }
  }
  return json_({ success: false, error: 'Solicitação não encontrada ou expirada.' });
}

function submitSupervisorFeedback_(body) {
  var token = String(body.responseToken || '').trim();
  if (!token) return json_({ success: false, error: 'Token de retorno ausente.' });
  var cfg = cfg_();
  var ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  var envios = ss.getSheetByName('CARVALIMA_GMAIL_ENVIOS');
  if (!envios || envios.getLastRow() < 2) return json_({ success: false, error: 'Solicitação não encontrada.' });
  var values = envios.getDataRange().getValues();
  var headers = values[0], idx = {}; headers.forEach(function(h, i) { idx[h] = i; });
  var found = null;
  for (var i = values.length - 1; i >= 1; i--) if (String(values[i][idx.responseToken] || '') === token) { found = values[i]; break; }
  if (!found) return json_({ success: false, error: 'Solicitação não encontrada ou expirada.' });

  var sh = sheet_(ss, 'CARVALIMA_GMAIL_RETORNOS', [
    'responseToken','monitoriaId','supervisorNome','supervisorEmail','decisao','feedbackSupervisor','proximoPasso','respondidoEm'
  ]);
  if (retornoExiste_(ss, token)) return json_({ success: false, error: 'Esta solicitação já possui um retorno registrado.' });
  sh.appendRow([token, found[idx.monitoriaId], found[idx.supervisorNome], found[idx.supervisorEmail], body.decisao || '', body.mensagem || '', body.proximoPasso || '', new Date()]);

  var envRow = values.findIndex(function(row, n) { return n > 0 && String(row[idx.responseToken] || '') === token; });
  if (envRow > 0 && idx.statusRetorno != null) envios.getRange(envRow + 1, idx.statusRetorno + 1).setValue('Respondido');
  return json_({ success: true });
}

function syncSupervisorReturns_(body) {
  var cfg = authorized_(body);
  var ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  var sh = ss.getSheetByName('CARVALIMA_GMAIL_RETORNOS');
  if (!sh || sh.getLastRow() < 2) return json_({ success: true, returns: [] });
  var values = sh.getDataRange().getValues();
  var headers = values[0], idx = {}; headers.forEach(function(h, i) { idx[h] = i; });
  var returns = values.slice(1).map(function(row) {
    return {
      responseToken: String(row[idx.responseToken] || ''),
      monitoriaId: String(row[idx.monitoriaId] || ''),
      supervisorNome: String(row[idx.supervisorNome] || ''),
      supervisorEmail: String(row[idx.supervisorEmail] || ''),
      decisao: String(row[idx.decisao] || ''),
      feedbackSupervisor: String(row[idx.feedbackSupervisor] || ''),
      proximoPasso: String(row[idx.proximoPasso] || ''),
      respondidoEm: row[idx.respondidoEm] ? new Date(row[idx.respondidoEm]).toISOString() : ''
    };
  }).filter(function(r) { return r.monitoriaId && r.responseToken; });
  return json_({ success: true, returns: returns });
}

function retornoExiste_(ss, token) {
  var sh = ss.getSheetByName('CARVALIMA_GMAIL_RETORNOS');
  if (!sh || sh.getLastRow() < 2) return false;
  var values = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  return values.some(function(r) { return String(r[0] || '') === token; });
}

function esc_(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
