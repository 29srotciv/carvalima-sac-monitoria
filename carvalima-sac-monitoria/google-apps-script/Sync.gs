/**
 * CARVALIMA SAC — Google Sheets Sync
 * Versão: 2026-09-11
 *
 * Propriedades obrigatórias do projeto Apps Script:
 *   CARVALIMA_SYNC_TOKEN
 *   CARVALIMA_SYNC_SPREADSHEET_ID
 *
 * A planilha deve conter a aba "Monitorias". Os cabeçalhos ficam na linha 5.
 * O endpoint deve ser publicado como Web App.
 */

const SYNC_VERSION = '2026-09-11';
const SYNC_SHEET_NAME = 'Monitorias';
const SYNC_HEADER_ROW = 5;

function doGet() {
  return jsonResponse({
    ok: true,
    service: 'carvalima-sac-sync',
    version: SYNC_VERSION
  });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const configuredToken = String(PropertiesService.getScriptProperties().getProperty('CARVALIMA_SYNC_TOKEN') || '').trim();
    const receivedToken = String(payload.token || payload.tokenSeguranca || '').trim();

    if (!configuredToken) {
      return jsonResponse({ success: false, error: 'Token do servidor não configurado.' }, 500);
    }

    if (!receivedToken || receivedToken !== configuredToken) {
      return jsonResponse({ success: false, error: 'Token inválido ou não autorizado.' }, 401);
    }

    if (String(payload.action || '').trim() !== 'sync') {
      return jsonResponse({ success: false, error: 'Ação não reconhecida.' }, 400);
    }

    const monitorias = Array.isArray(payload.monitorias) ? payload.monitorias : [];
    const result = syncMonitorias_(monitorias);

    return jsonResponse({
      success: true,
      version: SYNC_VERSION,
      created: result.created,
      updated: result.updated,
      received: monitorias.length,
      returned: result.returned,
      monitorias: result.monitorias
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      success: false,
      error: error && error.message ? error.message : 'Erro interno na sincronização.'
    }, 500);
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || typeof e.postData.contents !== 'string') {
    throw new Error('Requisição POST sem corpo JSON.');
  }

  const raw = e.postData.contents.trim();
  if (!raw) throw new Error('Corpo da requisição vazio.');

  try {
    return JSON.parse(raw);
  } catch (_) {
    throw new Error('Corpo recebido não é JSON válido.');
  }
}

function syncMonitorias_(monitorias) {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = String(props.getProperty('CARVALIMA_SYNC_SPREADSHEET_ID') || '').trim();
  if (!spreadsheetId) throw new Error('ID da planilha não configurado no servidor.');

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(SYNC_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SYNC_SHEET_NAME);

  const normalized = monitorias
    .filter(item => item && typeof item === 'object')
    .map(normalizeMonitoria_)
    .filter(item => item.id);

  const headers = ensureHeaders_(sheet, normalized);
  const existing = readExisting_(sheet, headers);
  const rowsToWrite = [];
  let created = 0;
  let updated = 0;

  normalized.forEach(item => {
    const row = existing.byId[item.id];
    const values = objectToRow_(item, headers);
    if (row) {
      sheet.getRange(row, 1, 1, headers.length).setValues([values]);
      updated++;
    } else {
      rowsToWrite.push(values);
      created++;
    }
  });

  if (rowsToWrite.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToWrite.length, headers.length).setValues(rowsToWrite);
  }

  const returned = readAllMonitorias_(sheet, headers);
  return { created, updated, returned: returned.length, monitorias: returned };
}

function normalizeMonitoria_(item) {
  const copy = Object.assign({}, item);
  copy.id = String(copy.id || copy.monitoriaId || '').trim();
  return copy;
}

function ensureHeaders_(sheet, monitorias) {
  let lastColumn = Math.max(sheet.getLastColumn(), 1);
  let headers = sheet.getRange(SYNC_HEADER_ROW, 1, 1, lastColumn).getValues()[0].map(String);
  while (headers.length && !headers[headers.length - 1].trim()) headers.pop();

  const required = ['id'];
  monitorias.forEach(item => Object.keys(item).forEach(key => {
    if (!required.includes(key)) required.push(key);
  }));

  const normalizedHeaders = headers.map(h => h.trim());
  required.forEach(key => {
    if (!normalizedHeaders.includes(key)) normalizedHeaders.push(key);
  });

  sheet.getRange(SYNC_HEADER_ROW, 1, 1, normalizedHeaders.length).setValues([normalizedHeaders]);
  return normalizedHeaders;
}

function readExisting_(sheet, headers) {
  const byId = {};
  const idColumn = headers.indexOf('id') + 1;
  if (idColumn < 1 || sheet.getLastRow() <= SYNC_HEADER_ROW) return { byId };

  const values = sheet.getRange(SYNC_HEADER_ROW + 1, 1, sheet.getLastRow() - SYNC_HEADER_ROW, headers.length).getValues();
  values.forEach((row, index) => {
    const id = String(row[idColumn - 1] || '').trim();
    if (id) byId[id] = SYNC_HEADER_ROW + 1 + index;
  });
  return { byId };
}

function readAllMonitorias_(sheet, headers) {
  if (sheet.getLastRow() <= SYNC_HEADER_ROW) return [];
  const values = sheet.getRange(SYNC_HEADER_ROW + 1, 1, sheet.getLastRow() - SYNC_HEADER_ROW, headers.length).getValues();
  return values.map(row => {
    const item = {};
    headers.forEach((header, index) => {
      if (header) item[header] = deserializeCell_(row[index]);
    });
    return item;
  }).filter(item => item.id);
}

function objectToRow_(item, headers) {
  return headers.map(header => serializeCell_(item[header]));
}

function serializeCell_(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

function deserializeCell_(value) {
  if (typeof value !== 'string') return value;
  const text = value.trim();
  if (!text) return '';
  if ((text[0] === '{' && text[text.length - 1] === '}') || (text[0] === '[' && text[text.length - 1] === ']')) {
    try { return JSON.parse(text); } catch (_) {}
  }
  return value;
}

function jsonResponse(body, status) {
  // Apps Script ContentService does not expose a custom HTTP status API.
  // The response body therefore always contains the canonical success/error state.
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
