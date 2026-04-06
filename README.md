> [!IMPORTANT]  
> **Nota de Propriedade e Contato:** Este projeto está vinculado à conta **lfilipe051@gmail.com**, porém o cadastro do processo para o desafio técnico foi realizado sob o e-mail **contatoluizfbm@gmail.com**. Ambas as contas pertencem a mim (Luiz Filipe Bungenstab Miranda).

# 🏦 SAP Banestes — Sistema de Acompanhamento de Processos

O **SAP Banestes** é uma solução completa de Gestão de Processos Judiciais e Administrativos, desenvolvida como um Web App utilizando **Google Apps Script** e **Google Sheets**. A aplicação oferece uma interface moderna para o monitoramento de contratos, clientes e garantias, com foco em análise de viabilidade financeira.

## 🌟 Destaques do Projeto

- **Arquitetura Baseada em Nuvem**: Hospedado inteiramente no ecossistema Google, dispensando servidores externos.
- **Interface Premium**: Design responsivo construído com **Tailwind CSS**, seguindo a identidade visual corporativa do Banestes.
- **Inteligência de Dados**: Cálculos em tempo real de estatísticas de carteira e alertas de risco para processos de baixo valor.

---

## 🛠️ Stack Tecnológica

### Backend
- **Google Apps Script (GAS)**: Motor de execução JavaScript no lado do servidor.
- **Google Sheets API**: Utilizado como banco de dados NoSQL/Relacional para persistência.

### Frontend
- **HTML5 & CSS3**: Estrutura semântica e estilização customizada (`styles.html`).
- **Tailwind CSS**: Framework CSS utilitário para design rápido e consistente.
- **JavaScript Moderno**: Manipulação de DOM assíncrona e comunicação bidirecional via `google.script.run`.

---

## 📂 Estrutura de Arquivos

```text
├── code.js           # Backend: Rotas, CRUD e lógica de integração com Sheets
├── index.html        # Estrutura principal do App (Dashboard e Modais)
├── scripts.html      # Lógica Client-side: Eventos, Renderização e chamadas API
├── styles.html       # Estilização CSS personalizada e componentes UI
├── visualizar.js     # Utilitário Node.js para inspeção de dados CSV locais
└── Orientacoes/      # Documentação do desafio e bases de dados (CSV/XLSX)
```

---

## 🚀 Funcionalidades Detalhadas

### 📊 Dashboard de Monitoramento
Cards dinâmicos que resumem o estado atual da carteira:
- **Total de Processos**: Contagem em tempo real.
- **Valor Total**: Soma financeira de todos os contratos ativos.
- **Garantias Ativas**: Percentual de processos com garantias reais vinculadas.
- **Viabilidade**: Indicador de processos que atendem aos critérios mínimos de ajuizamento.

### 🔍 Sistema de Busca e Filtros
- Busca global por nome de cliente ou número de contrato.
- Filtros rápidos por **Status** (Iniciado, Analisando, Pendente, etc.).
- Filtros por **Tipo de Garantia** (Carro, Moto, Imóvel, Equipamento).

### 📝 Gestão de Processos (CRUD Completo)
- **Criação/Edição**: Formulário inteligente com banners de viabilidade dinâmica.
- **Exclusão**: Fluxo de confirmação para segurança dos dados.
- **Badge System**: Identificação visual de status por cores.

### ⚠️ Análise de Risco (Viabilidade)
A aplicação implementa uma regra de negócio específica para triagem:
- **Alta Viabilidade**: Processos com valor ≥ R$ 15.000,00.
- **Risco Moderado**: Valor < R$ 15.000,00, mas com garantia real.
- **Baixa Viabilidade**: Valor < R$ 15.000,00 e sem garantia vinculada (destacado na tabela).

---

## 🔧 Instalação e Configuração

### 1. Preparação da Planilha
Crie uma planilha Google com as seguintes abas (nomes sensíveis a maiúsculas):
- `Processos`, `Clientes`, `Unidades` e `Produtos`.

### 2. Configuração do Script
1. No editor do Google Apps Script, crie arquivos com os nomes exatos do repositório.
2. No `code.js`, substitua a variável `SPREADSHEET_ID` pelo ID da sua planilha:
   ```javascript
   var SPREADSHEET_ID = 'SEU_ID_AQUI';
   ```

### 3. Implantação
1. Clique em **Implantar** > **Nova implantação**.
2. Tipo: **App da Web**.
3. Configuração: Executar como "Eu", Acesso: "Qualquer pessoa".

---

## 💻 Visualizador Local (Node.js)
Para analisar rapidamente os dados brutos do desafio sem necessidade do ambiente Google:
```bash
node visualizar.js
```

---
*Este projeto foi desenvolvido como submissão técnica para o Banestes.*
