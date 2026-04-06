/**
 * visualizar.js — Visualiza os CSVs do desafio Banestes no terminal
 * Uso: node visualizar.js
 */

const fs   = require('fs');
const path = require('path');

// ── Configuração ────────────────────────────────────────────────
const DIR = path.dirname(__filename);
const ARQUIVOS = {
  Processos: 'Desafio Técnico ─  Processos.csv',
  Clientes:  'Desafio Técnico ─ Clientes.csv',
  Unidades:  'Desafio Técnico ─ Unidades.csv',
  Produtos:  'Desafio Técnico ─  Produtos.csv',
};

// ── Cores ANSI ──────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  blue:   '\x1b[34m',
  gray:   '\x1b[90m',
  white:  '\x1b[97m',
  bgBlue: '\x1b[44m',
};

// ── Parser CSV simples ───────────────────────────────────────────
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines   = content.split(/\r?\n/).filter(l => l.trim());
  
  // Parse respeitando campos entre aspas com vírgulas
  function parseLine(line) {
    const result = [];
    let current  = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { result.push(current); current = ''; continue; }
      current += ch;
    }
    result.push(current);
    return result;
  }

  const headers = parseLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const obj    = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
}

// ── Carregar todos os dados ──────────────────────────────────────
function carregarDados() {
  const dados = {};
  for (const [nome, arquivo] of Object.entries(ARQUIVOS)) {
    const fullPath = path.join(DIR, arquivo);
    if (!fs.existsSync(fullPath)) {
      console.log(`${C.red}✗ Arquivo não encontrado: ${arquivo}${C.reset}`);
      dados[nome] = [];
      continue;
    }
    dados[nome] = parseCSV(fullPath);
  }
  return dados;
}

// ── Exibição ────────────────────────────────────────────────────
function linha(char = '─', tam = 80) {
  return char.repeat(tam);
}

function header(titulo) {
  console.log('\n' + C.bgBlue + C.white + C.bold + `  ${titulo}  ` + C.reset);
  console.log(C.blue + linha() + C.reset);
}

function exibirResumo(dados) {
  header('📊 RESUMO DOS DADOS');
  const rows = [
    ['Aba',       'Registros', 'Status'],
    ['Processos', dados.Processos.length, dados.Processos.length > 0 ? '✅' : '❌'],
    ['Clientes',  dados.Clientes.length,  dados.Clientes.length  > 0 ? '✅' : '❌'],
    ['Unidades',  dados.Unidades.length,  dados.Unidades.length  > 0 ? '✅' : '❌'],
    ['Produtos',  dados.Produtos.length,  dados.Produtos.length  > 0 ? '✅' : '❌'],
  ];
  rows.forEach((r, i) => {
    const cor = i === 0 ? C.bold + C.cyan : C.reset;
    console.log(cor + `  ${String(r[0]).padEnd(12)} ${String(r[1]).padEnd(10)} ${r[2]}` + C.reset);
  });
}

function exibirProcessos(processos, clientes, unidades, produtos, limite = 10) {
  header(`📋 PROCESSOS (primeiros ${limite} de ${processos.length})`);

  // Índices
  const idxCli = Object.fromEntries(clientes.map(c  => [c['ID'], c]));
  const idxUni = Object.fromEntries(unidades.map(u  => [u['ID'], u]));
  const idxPro = Object.fromEntries(produtos.map(p  => [p['ID'], p]));

  processos.slice(0, limite).forEach((p, i) => {
    const cliente  = idxCli[p['CLIENTE ID']]  || {};
    const unidade  = idxUni[p['UNIDADE ID']]  || {};
    const produto  = idxPro[p['PRODUTO ID']]  || {};
    const valor    = parseFloat(String(p['VALOR DO CONTRATO'] || '0')
                      .replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
    const viavel   = valor >= 15000;
    const numCor   = viavel ? C.green : C.red;
    const garantia = p['TIPO DE GARANTIA'] || 'NENHUMA';

    const andamentoCor = {
      'INICIADO':   C.blue,
      'ANALISANDO': C.yellow,
      'PENDENTE':   C.yellow,
      'PARALISADO': C.red,
      'FINALIZADO': C.green,
    }[p['ANDAMENTO']] || C.gray;

    console.log(C.gray + `  [${String(i+1).padStart(2)}] ` + C.reset +
      C.bold + (p['ID'] || '').padEnd(14) + C.reset +
      andamentoCor + (p['ANDAMENTO'] || '').padEnd(12) + C.reset +
      numCor + String(p['VALOR DO CONTRATO'] || '').padEnd(18) + C.reset +
      C.gray + (garantia).padEnd(18) + C.reset
    );
    console.log('       ' + C.cyan + (cliente['NOME'] || p['CLIENTE ID'] || '').substring(0, 30).padEnd(32) + C.reset +
      C.gray + '@ ' + (unidade['NOME'] || p['UNIDADE ID'] || '') + C.reset
    );
    console.log('       ' + C.gray + (produto['NOME'] || p['PRODUTO ID'] || '').substring(0, 60) + C.reset);
    console.log();
  });
}

function exibirEstatisticas(processos) {
  header('📈 ESTATÍSTICAS DOS PROCESSOS');

  const parseValor = str => parseFloat(String(str || '0').replace(/[R$\s.]/g, '').replace(',', '.')) || 0;

  const total      = processos.length;
  const totalValor = processos.reduce((s, p) => s + parseValor(p['VALOR DO CONTRATO']), 0);
  const comGarant  = processos.filter(p => p['TIPO DE GARANTIA'] && p['TIPO DE GARANTIA'] !== 'NENHUMA').length;
  const viaveis    = processos.filter(p => parseValor(p['VALOR DO CONTRATO']) >= 15000).length;
  const baixoRisco = processos.filter(p => parseValor(p['VALOR DO CONTRATO']) < 15000).length;

  // Agrupamentos
  const porStatus   = {};
  const porGarantia = {};
  processos.forEach(p => {
    porStatus[p['ANDAMENTO']]           = (porStatus[p['ANDAMENTO']]           || 0) + 1;
    porGarantia[p['TIPO DE GARANTIA']]  = (porGarantia[p['TIPO DE GARANTIA']]  || 0) + 1;
  });

  console.log(`  ${C.bold}Total de processos:${C.reset}  ${C.cyan}${total}${C.reset}`);
  console.log(`  ${C.bold}Valor total:${C.reset}         ${C.green}R$ ${totalValor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}${C.reset}`);
  console.log(`  ${C.bold}Com garantia real:${C.reset}   ${C.green}${comGarant}${C.reset} de ${total}`);
  console.log(`  ${C.bold}Viáveis (≥ R$15k):${C.reset}  ${C.green}${viaveis}${C.reset}`);
  console.log(`  ${C.bold}Baixo valor (< 15k):${C.reset} ${C.red}${baixoRisco}${C.reset}`);

  console.log('\n  ' + C.bold + 'Por Status:' + C.reset);
  Object.entries(porStatus).sort((a,b) => b[1]-a[1]).forEach(([s, n]) => {
    const cor = {INICIADO: C.blue, ANALISANDO: C.yellow, PENDENTE: C.yellow, PARALISADO: C.red, FINALIZADO: C.green}[s] || C.gray;
    const bar = '█'.repeat(Math.round(n / total * 20));
    console.log(`    ${cor}${s.padEnd(12)}${C.reset} ${C.cyan}${String(n).padStart(3)}  ${cor}${bar}${C.reset}`);
  });

  console.log('\n  ' + C.bold + 'Por Garantia:' + C.reset);
  Object.entries(porGarantia).sort((a,b) => b[1]-a[1]).forEach(([g, n]) => {
    const bar = '█'.repeat(Math.round(n / total * 20));
    console.log(`    ${C.gray}${g.padEnd(18)}${C.reset} ${C.cyan}${String(n).padStart(3)}  ${C.yellow}${bar}${C.reset}`);
  });
}

// ── Main ─────────────────────────────────────────────────────────
console.log('\n' + C.bgBlue + C.white + C.bold + '  🏦 SAP Banestes — Visualizador de Dados  ' + C.reset);

const dados = carregarDados();
exibirResumo(dados);
exibirEstatisticas(dados.Processos);
exibirProcessos(dados.Processos, dados.Clientes, dados.Unidades, dados.Produtos, 10);

console.log(C.green + C.bold + '  ✅ Dados carregados com sucesso!\n' + C.reset);
