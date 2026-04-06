// =====================================================
// CONFIGURAÇÃO
// =====================================================

var SPREADSHEET_ID = '1way5JCh_coXiff7ZuLD5_I1VGyX-aVxiVcXsAbUHeG8';

var SHEET_PROCESSOS = 'Processos';
var SHEET_CLIENTES = 'Clientes';
var SHEET_UNIDADES = 'Unidades';
var SHEET_PRODUTOS = 'Produtos';

// =====================================================
// WEB APP — Ponto de entrada
// =====================================================
function doGet(e) {
    return HtmlService
        .createTemplateFromFile('index')
        .evaluate()
        .setTitle('SAP Banestes')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// =====================================================
// UTILITÁRIOS
// =====================================================

/**
 * Lê uma aba do Sheets e retorna array de objetos {coluna: valor}.
 */
function getSheetData(sheetName) {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(sheetName);
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    return rows.slice(1).map(function (row) {
        var obj = {};
        headers.forEach(function (h, i) { obj[h] = row[i]; });
        return obj;
    });
}

/** Cria um mapa {id → objeto} a partir de um array. */
function indexBy(arr, key) {
    var map = {};
    arr.forEach(function (item) { map[item[key]] = item; });
    return map;
}

/** Formata Date para 'DD/MM/YYYY, HH:MM:SS' */
function formatDate(date) {
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear() +
        ', ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
}

// =====================================================
// LOOKUP TABLES — expostas ao frontend
// =====================================================
function getClientes() { return getSheetData(SHEET_CLIENTES); }
function getUnidades() { return getSheetData(SHEET_UNIDADES); }
function getProdutos() { return getSheetData(SHEET_PRODUTOS); }

// =====================================================
// PROCESSOS — leitura com join de dados relacionados
// =====================================================
function getProcessos() {
    var processos = getSheetData(SHEET_PROCESSOS);
    var clientes = indexBy(getSheetData(SHEET_CLIENTES), 'ID');
    var unidades = indexBy(getSheetData(SHEET_UNIDADES), 'ID');
    var produtos = indexBy(getSheetData(SHEET_PRODUTOS), 'ID');

    return processos.map(function (p) {
        var clienteId = p['CLIENTE ID'];
        var unidadeId = p['UNIDADE ID'];
        var produtoId = p['PRODUTO ID'];

        return {
            id: p['ID'],
            clienteId: clienteId,
            clienteNome: clientes[clienteId] ? clientes[clienteId]['NOME'] : clienteId,
            clienteDoc: clientes[clienteId] ? clientes[clienteId]['CPF/CNPJ'] : '',
            produtoId: produtoId,
            produtoNome: produtos[produtoId] ? produtos[produtoId]['NOME'] : produtoId,
            unidadeId: unidadeId,
            unidadeNome: unidades[unidadeId] ? unidades[unidadeId]['NOME'] : unidadeId,
            contrato: p['CÓD. DO CONTRATO'],
            valor: p['VALOR DO CONTRATO'],
            garantia: p['TIPO DE GARANTIA'],
            andamento: p['ANDAMENTO'],
            dataCriacao: p['DATA DA CRIAÇÃO'],
            dataAtualizacao: p['DATA DA ATUALIZAÇÃO']
        };
    });
}

// =====================================================
// CRUD — Processos
// =====================================================

/**
 * Insere um novo processo na aba Processos.
 */
function createProcesso(data) {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_PROCESSOS);
    var rows = sheet.getDataRange().getValues();
    var newId = 'PROCESSO_' + rows.length; // rows.length já inclui o header
    var now = formatDate(new Date());

    sheet.appendRow([
        newId,
        data.clienteId,
        data.produtoId,
        data.unidadeId,
        data.contrato,
        data.valor,
        data.garantia,
        data.andamento,
        now,
        now
    ]);
    return newId;
}

/**
 * Atualiza um processo existente pelo ID (coluna A).
 */
function updateProcesso(data) {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_PROCESSOS);
    var rows = sheet.getDataRange().getValues();

    for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.id) {
            var now = formatDate(new Date());
            sheet.getRange(i + 1, 1, 1, 10).setValues([[
                data.id,
                data.clienteId,
                data.produtoId,
                data.unidadeId,
                data.contrato,
                data.valor,
                data.garantia,
                data.andamento,
                rows[i][8], // mantém dataCriacao original
                now
            ]]);
            return true;
        }
    }
    return false;
}

/**
 * Remove um processo pelo ID.
 */
function deleteProcesso(id) {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_PROCESSOS);
    var rows = sheet.getDataRange().getValues();

    for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === id) {
            sheet.deleteRow(i + 1);
            return true;
        }
    }
    return false;
}

// =====================================================
// DEBUG — execute no editor GAS para verificar dados
// =====================================================
function debug() {
  var ss     = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ss.getSheets().map(function(s) { return s.getName(); });

  Logger.log('=== SHEETS ENCONTRADAS ===');
  Logger.log(sheets.join(', '));

  Logger.log('\n=== CONTAGEM DE LINHAS ===');
  sheets.forEach(function(nome) {
    var count = ss.getSheetByName(nome).getLastRow();
    Logger.log(nome + ': ' + count + ' linhas (incluindo cabeçalho)');
  });

  Logger.log('\n=== CABEÇALHO — Processos ===');
  var headers = ss.getSheetByName('Processos').getRange(1, 1, 1, 10).getValues()[0];
  Logger.log(JSON.stringify(headers));

  Logger.log('\n=== PRIMEIRO PROCESSO (raw) ===');
  var firstRow = ss.getSheetByName('Processos').getRange(2, 1, 1, 10).getValues()[0];
  Logger.log(JSON.stringify(firstRow));

  Logger.log('\n=== PRIMEIRO PROCESSO (getProcessos) ===');
  var processos = getProcessos();
  Logger.log('Total retornado: ' + processos.length);
  if (processos.length > 0) {
    Logger.log(JSON.stringify(processos[0]));
  }
}
