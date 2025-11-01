const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  /**
   * Dados fixos da Coinage para o informe
   */
  getCoinageCompanyData() {
    return {
      name: 'Coinage',
      cnpj: '02.332.886/0001-04',
      alias: 'coinage'
    };
  }

  /**
   * Formatar valor em BRL
   */
  formatBRL(value) {
    if (value == null || isNaN(value)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Formatar número com decimais
   */
  formatNumber(value, decimals = 2) {
    if (value == null || isNaN(value)) {
      return '0' + (decimals > 0 ? ',' + '0'.repeat(decimals) : '');
    }
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Formatar data
   */
  formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Desenhar header do documento
   */
  drawHeader(doc, data) {
    const pageWidth = doc.page.width;
    const marginLeft = 50;

    // Fundo do header
    doc.rect(0, 0, pageWidth, 140).fill('#1a73e8');

    // Tentar adicionar logo PNG (versão branca para fundo azul)
    try {
      const logoPath = path.join(__dirname, '../../../frontend/public/assets/images/logo/logo-white.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, marginLeft, 20, {
          width: 120,
          fit: [120, 50],
          align: 'left'
        });
        console.log('[PDF] ✅ Logo carregada com sucesso');
      } else {
        // Fallback para texto se não encontrar a logo
        console.log('[PDF] ⚠️  Logo não encontrada, usando texto');
        doc
          .fillColor('#ffffff')
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('COINAGE', marginLeft, 30, {
            width: 200,
            align: 'left',
          });
      }
    } catch (error) {
      console.log('[PDF] ❌ Erro ao carregar logo:', error.message);
      // Fallback para texto em caso de erro
      doc
        .fillColor('#ffffff')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('COINAGE', marginLeft, 30, {
          width: 200,
          align: 'left',
        });
    }

    // Obter anos corretos
    const reportYear = data.period?.informeYear || data.period?.year || new Date().getFullYear();
    const calendarYear = data.period?.calendarYear || (reportYear - 1);

    // Título do documento (centralizado abaixo) - em BRANCO sobre fundo azul
    doc
      .fillColor('#ffffff')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(`INFORME DE RENDIMENTOS FINANCEIROS ${reportYear}`, marginLeft, 90, {
        width: pageWidth - (marginLeft * 2),
        align: 'center',
      });

    doc
      .fillColor('#ffffff')
      .fontSize(14)
      .font('Helvetica')
      .text(`ANO CALENDÁRIO ${calendarYear}`, marginLeft, 112, {
        width: pageWidth - (marginLeft * 2),
        align: 'center',
      });

    // Reset cor para o restante do documento
    doc.fillColor('#000000');
  }

  /**
   * Desenhar seção de identificação
   */
  drawIdentificationSection(doc, data) {
    const marginLeft = 50;
    let y = 170; // Ajustado para dar mais espaço após o novo header

    // Obter dados fixos da Coinage
    const coinageData = this.getCoinageCompanyData();

    // Título da seção
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1a73e8')
      .text('1. IDENTIFICAÇÃO DA FONTE PAGADORA', marginLeft, y);

    y += 30;
    doc.fillColor('#000000').fontSize(10).font('Helvetica');

    // Box de informações da empresa
    doc
      .roundedRect(marginLeft, y, doc.page.width - 100, 60, 5)
      .stroke('#cccccc');

    y += 15;
    doc.font('Helvetica-Bold').text('Nome Empresarial:', marginLeft + 15, y);
    doc
      .font('Helvetica')
      .text(coinageData.name, marginLeft + 150, y, {
        width: doc.page.width - 200,
      });

    y += 20;
    doc.font('Helvetica-Bold').text('CNPJ:', marginLeft + 15, y);
    doc.font('Helvetica').text(coinageData.cnpj, marginLeft + 150, y);

    y += 50;

    // Título da seção beneficiário
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1a73e8')
      .text('2. PESSOA FÍSICA BENEFICIÁRIA DOS RENDIMENTOS', marginLeft, y);

    y += 30;
    doc.fillColor('#000000').fontSize(10).font('Helvetica');

    // Box de informações do beneficiário
    doc
      .roundedRect(marginLeft, y, doc.page.width - 100, 80, 5)
      .stroke('#cccccc');

    y += 15;
    doc.font('Helvetica-Bold').text('Nome Completo:', marginLeft + 15, y);
    doc
      .font('Helvetica')
      .text(data.beneficiary?.name || 'Não informado', marginLeft + 150, y, {
        width: doc.page.width - 200,
      });

    y += 20;
    doc.font('Helvetica-Bold').text('CPF:', marginLeft + 15, y);
    doc.font('Helvetica').text(data.beneficiary?.cpf || 'Não informado', marginLeft + 150, y);

    y += 20;
    doc.font('Helvetica-Bold').text('Email:', marginLeft + 15, y);
    doc.font('Helvetica').text(data.beneficiary?.email || 'Não informado', marginLeft + 150, y);

    return y + 50;
  }

  /**
   * Desenhar seção de saldos
   */
  drawBalancesSection(doc, data, startY) {
    const marginLeft = 50;
    let y = startY;

    // Título da seção
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1a73e8')
      .text('3. RESUMO DE SALDOS', marginLeft, y);

    y += 30;
    doc.fillColor('#000000').fontSize(10).font('Helvetica');

    // Obter datas dos snapshots (ou usar datas padrão)
    const reportYear = data.period?.informeYear || data.period?.year || new Date().getFullYear();
    const calendarYear = data.period?.calendarYear || (reportYear - 1);
    const previousYear = calendarYear - 1;

    // Formatar datas dos snapshots
    const initialDate = data.balances?.initialDate
      ? this.formatDate(data.balances.initialDate)
      : `31/12/${previousYear}`;

    const finalDate = data.balances?.finalDate
      ? this.formatDate(data.balances.finalDate)
      : `31/12/${calendarYear}`;

    const initialNoData = data.balances?.initialNoData || false;
    const finalNoData = data.balances?.finalNoData || false;

    // ===== TABELA 1: SALDO INICIAL (31/12 do ano anterior) =====
    const table1Top = y;
    const table1Width = doc.page.width - 100;

    // Header da tabela 1
    doc
      .rect(marginLeft, table1Top, table1Width, 25)
      .fillAndStroke('#e3f2fd', '#1976d2');

    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(`SALDO EM ${initialDate}`, marginLeft + 10, table1Top + 8);

    y = table1Top + 25;

    // Sub-header com colunas
    const col1Width = 80;
    const col2Width = 110;
    const col3Width = 110;
    const col4Width = 110;
    const col5Width = 110;

    doc
      .rect(marginLeft, y, table1Width, 20)
      .fillAndStroke('#f5f5f5', '#cccccc');

    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('Token', marginLeft + 5, y + 6)
      .text('Disponível', marginLeft + col1Width + 5, y + 6)
      .text('Em Ordens', marginLeft + col1Width + col2Width + 5, y + 6)
      .text('Em Stake', marginLeft + col1Width + col2Width + col3Width + 5, y + 6)
      .text('Total', marginLeft + col1Width + col2Width + col3Width + col4Width + 5, y + 6);

    y += 20;

    // Dados iniciais
    const initialBalances = data.balances?.initial || {};
    const initialOrders = data.balances?.initialOrders || {};
    const initialStakes = data.balances?.initialStakes || {};
    const initialTotal = data.balances?.initialTotal || {};

    const initialTokens = new Set([
      ...Object.keys(initialBalances),
      ...Object.keys(initialTotal),
    ].filter(k => initialBalances[k] != null || initialTotal[k] != null));

    doc.font('Helvetica').fontSize(7);

    if (initialTokens.size === 0 || initialNoData) {
      doc.fillColor('#666666').text('Nenhum saldo registrado', marginLeft + 10, y + 5);
      y += 20;
    } else {
      initialTokens.forEach((token, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#fafafa';
        doc.rect(marginLeft, y, table1Width, 18).fill(bgColor);

        const available = parseFloat(initialBalances[token]) || 0;
        const orders = parseFloat(initialOrders[token]) || 0;
        const stakes = parseFloat(initialStakes[token]) || 0;
        const total = parseFloat(initialTotal[token]) || 0;

        doc
          .fillColor('#000000')
          .text(token, marginLeft + 5, y + 5)
          .text(this.formatNumber(available, 4), marginLeft + col1Width + 5, y + 5)
          .text(this.formatNumber(orders, 4), marginLeft + col1Width + col2Width + 5, y + 5)
          .text(this.formatNumber(stakes, 4), marginLeft + col1Width + col2Width + col3Width + 5, y + 5)
          .text(this.formatNumber(total, 4), marginLeft + col1Width + col2Width + col3Width + col4Width + 5, y + 5);

        y += 18;
      });
    }

    // Borda da tabela 1
    doc
      .rect(marginLeft, table1Top, table1Width, y - table1Top)
      .stroke('#1976d2');

    y += 20;

    // ===== TABELA 2: SALDO FINAL (última data registrada) =====
    const table2Top = y;

    // Header da tabela 2
    doc
      .rect(marginLeft, table2Top, table1Width, 25)
      .fillAndStroke('#e8f5e9', '#388e3c');

    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(`SALDO EM ${finalDate}`, marginLeft + 10, table2Top + 8);

    y = table2Top + 25;

    // Sub-header com colunas (mesmo layout)
    doc
      .rect(marginLeft, y, table1Width, 20)
      .fillAndStroke('#f5f5f5', '#cccccc');

    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('Token', marginLeft + 5, y + 6)
      .text('Disponível', marginLeft + col1Width + 5, y + 6)
      .text('Em Ordens', marginLeft + col1Width + col2Width + 5, y + 6)
      .text('Em Stake', marginLeft + col1Width + col2Width + col3Width + 5, y + 6)
      .text('Total', marginLeft + col1Width + col2Width + col3Width + col4Width + 5, y + 6);

    y += 20;

    // Dados finais
    const finalBalances = data.balances?.available || data.balances?.final || {};
    const finalOrders = data.balances?.inOrders || {};
    const finalStakes = data.balances?.inStake || {};
    const finalTotal = data.balances?.total || {};

    const finalTokens = new Set([
      ...Object.keys(finalBalances),
      ...Object.keys(finalTotal),
    ].filter(k => finalBalances[k] != null || finalTotal[k] != null));

    doc.font('Helvetica').fontSize(7);

    if (finalTokens.size === 0 || finalNoData) {
      doc.fillColor('#666666').text('Nenhum saldo registrado', marginLeft + 10, y + 5);
      y += 20;
    } else {
      finalTokens.forEach((token, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#fafafa';
        doc.rect(marginLeft, y, table1Width, 18).fill(bgColor);

        const available = parseFloat(finalBalances[token]) || 0;
        const orders = parseFloat(finalOrders[token]) || 0;
        const stakes = parseFloat(finalStakes[token]) || 0;
        const total = parseFloat(finalTotal[token]) || 0;

        doc
          .fillColor('#000000')
          .text(token, marginLeft + 5, y + 5)
          .text(this.formatNumber(available, 4), marginLeft + col1Width + 5, y + 5)
          .text(this.formatNumber(orders, 4), marginLeft + col1Width + col2Width + 5, y + 5)
          .text(this.formatNumber(stakes, 4), marginLeft + col1Width + col2Width + col3Width + 5, y + 5)
          .text(this.formatNumber(total, 4), marginLeft + col1Width + col2Width + col3Width + col4Width + 5, y + 5);

        y += 18;
      });
    }

    // Borda da tabela 2
    doc
      .rect(marginLeft, table2Top, table1Width, y - table2Top)
      .stroke('#388e3c');

    return y + 30;
  }

  /**
   * Desenhar seção de rendimentos
   */
  drawEarningsSection(doc, data, startY) {
    const marginLeft = 50;
    let y = startY;

    const hasProducts = data.products && data.products.length > 0;

    // Não adicionar página se não há produtos (conteúdo mínimo)
    if (!hasProducts) {
      // Título da seção
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1a73e8')
        .text('4. RENDIMENTOS POR PRODUTO', marginLeft, y);

      y += 30;

      // Se não há rendimentos, mostrar mensagem
      doc
        .fillColor('#666666')
        .fontSize(10)
        .font('Helvetica')
        .text('Nenhum rendimento registrado neste período', marginLeft + 15, y);

      y += 30;
      return y + 20;
    }

    // Se há produtos, verificar espaço
    const spaceAvailable = doc.page.height - 80 - y;
    if (spaceAvailable < 200) {
      console.log('[PDF] Adicionando nova página para rendimentos');
      // Desenhar footer na página atual ANTES de adicionar nova
      this.drawFooterOnCurrentPage(doc);
      doc.addPage();
      doc._pageCount++;
      y = 50;
    }

    // Título da seção
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1a73e8')
      .text('4. RENDIMENTOS POR PRODUTO', marginLeft, y);

    y += 30;

    // Para cada produto
    data.products.forEach((product, index) => {
      // Verificar espaço disponível
      if (y > doc.page.height - 150) {
        // Desenhar footer na página atual ANTES de adicionar nova
        this.drawFooterOnCurrentPage(doc);
        doc.addPage();
        doc._pageCount++;
        y = 50;
      }

      // Título do produto
      doc
        .fillColor('#000000')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`4.${index + 1} ${product.productName}`, marginLeft, y);

      y += 20;
      doc.fontSize(9).font('Helvetica');

      // Informações do produto
      const infoY = y;
      doc
        .text(`Token: ${product.tokenSymbol}`, marginLeft + 15, infoY)
        .text(`Tipo: ${this.getProductTypeLabel(product.productType)}`, marginLeft + 200, infoY)
        .text(`Total de Distribuições: ${product.count}`, marginLeft + 380, infoY);

      y += 25;

      // Totais do produto em box destacado
      doc
        .roundedRect(marginLeft + 15, y, doc.page.width - 130, 60, 5)
        .fillAndStroke('#f8f9fa', '#cccccc');

      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .text('Rendimentos Totais Recebidos:', marginLeft + 25, y + 15)
        .text(
          `${this.formatNumber(product.totalAmount, 8)} ${product.tokenSymbol}`,
          marginLeft + 250,
          y + 15
        );

      doc
        .text('Valor Aproximado em BRL:', marginLeft + 25, y + 35)
        .text(this.formatBRL(product.totalValueBRL), marginLeft + 250, y + 35);

      y += 75;

      // Se há distribuições, mostrar tabela detalhada
      if (product.distributions && product.distributions.length > 0) {
        // Título da tabela de distribuições
        doc
          .fillColor('#666666')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('Detalhamento das Distribuições:', marginLeft + 15, y);

        y += 20;

        // Cabeçalho da tabela
        const tableLeft = marginLeft + 15;
        const colDate = tableLeft;
        const colAmount = tableLeft + 80;
        const colQuote = tableLeft + 220;
        const colValue = tableLeft + 360;
        const tableWidth = doc.page.width - (marginLeft + 30);
        const rowHeight = 18;

        doc
          .rect(tableLeft, y, tableWidth, rowHeight)
          .fillAndStroke('#f0f0f0', '#cccccc');

        doc
          .fillColor('#000000')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('Data', colDate + 5, y + 5)
          .text('Quantidade', colAmount + 5, y + 5)
          .text('Cotação (BRL)', colQuote + 5, y + 5)
          .text('Valor (BRL)', colValue + 5, y + 5);

        y += rowHeight;

        // Listar cada distribuição
        product.distributions.forEach((dist, idx) => {
          // Verificar se precisa de nova página
          if (y > doc.page.height - 150) {
            // Desenhar footer e adicionar nova página
            this.drawFooterOnCurrentPage(doc);
            doc.addPage();
            doc._pageCount++;
            y = 50;
          }

          const bgColor = idx % 2 === 0 ? '#ffffff' : '#fafafa';
          doc.rect(tableLeft, y, tableWidth, rowHeight).fill(bgColor);

          doc
            .fillColor('#000000')
            .fontSize(8)
            .font('Helvetica')
            .text(this.formatDate(dist.date), colDate + 5, y + 5)
            .text(this.formatNumber(dist.amount, 8), colAmount + 5, y + 5)
            .text(this.formatBRL(dist.quote), colQuote + 5, y + 5)
            .text(this.formatBRL(dist.valueBRL), colValue + 5, y + 5);

          y += rowHeight;
        });

        // Borda da tabela
        const tableHeight = (product.distributions.length + 1) * rowHeight;
        const tableTop = y - tableHeight;
        doc
          .rect(tableLeft, tableTop, tableWidth, tableHeight)
          .stroke('#cccccc');

        y += 15; // Espaço após a tabela
      }
    });

    return y + 20;
  }

  /**
   * Desenhar seção de totais
   */
  drawTotalsSection(doc, data, startY) {
    const marginLeft = 50;
    let y = startY;

    // Calcular espaço necessário
    const byTokenArray = Array.isArray(data.totals?.byToken) ? data.totals.byToken : [];
    const totalsHeight = 30 + 80 + (Math.max(byTokenArray.length, 1) * 18) + 50; // título + box + tokens + margem
    const spaceAvailable = doc.page.height - 80 - y;

    // Só adicionar página se REALMENTE não couber (com margem de segurança menor)
    if (totalsHeight > spaceAvailable) {
      console.log('[PDF] Adicionando nova página para totais (necessário: %d, disponível: %d)', totalsHeight, spaceAvailable);
      // Desenhar footer na página atual ANTES de adicionar nova
      this.drawFooterOnCurrentPage(doc);
      doc.addPage();
      doc._pageCount++;
      y = 50;
    }

    // Título da seção
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1a73e8')
      .text('5. TOTAL DE RENDIMENTOS', marginLeft, y);

    y += 30;

    // Box de totais
    doc
      .roundedRect(marginLeft, y, doc.page.width - 100, 80, 5)
      .fillAndStroke('#e8f5e9', '#4caf50');

    y += 15;
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10);

    // Total por token (já declarado acima)
    if (byTokenArray.length > 0) {
      byTokenArray.forEach((token, index) => {
        doc.text(
          `Total ${token.symbol || 'N/A'}: ${this.formatNumber(token.totalAmount, 8)} ${token.symbol || ''} ~ ${this.formatBRL(token.totalValueBRL)}`,
          marginLeft + 15,
          y + index * 18,
          {
            lineBreak: false,
          }
        );
      });
      y += byTokenArray.length * 18 + 10;
    } else {
      doc
        .fillColor('#666666')
        .fontSize(10)
        .font('Helvetica')
        .text('Nenhum rendimento registrado neste período', marginLeft + 15, y);
      y += 25;
    }

    // Grande total
    doc
      .fontSize(12)
      .fillColor('#2e7d32')
      .font('Helvetica-Bold')
      .text('TOTAL GERAL EM BRL:', marginLeft + 15, y)
      .text(this.formatBRL(data.totals?.grandTotalBRL || 0), marginLeft + 250, y);

    return y + 50;
  }

  /**
   * Desenhar observações
   */
  drawNotesSection(doc, data, startY) {
    const marginLeft = 50;
    let y = startY;

    // Calcular espaço necessário para observações
    const notesHeight = 25 + (5 * 20) + 30; // título + 5 notas + margem
    const spaceAvailable = doc.page.height - 80 - y; // espaço até o footer

    // Só adicionar página se REALMENTE não couber
    if (notesHeight > spaceAvailable) {
      console.log('[PDF] Adicionando nova página para observações (necessário: %d, disponível: %d)', notesHeight, spaceAvailable);
      // Desenhar footer na página atual ANTES de adicionar nova
      this.drawFooterOnCurrentPage(doc);
      doc.addPage();
      doc._pageCount++;
      y = 50;
    }

    // Título da seção
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1a73e8')
      .text('6. OBSERVAÇÕES', marginLeft, y);

    y += 25;

    // Observações
    doc.fillColor('#000000').fontSize(9).font('Helvetica');

    // Obter data real do snapshot final ou usar data padrão
    const finalDate = data.balances?.finalDate
      ? this.formatDate(data.balances.finalDate)
      : `31/12/${data.period?.calendarYear || new Date().getFullYear()}`;

    const notes = [
      `• Os valores em reais (BRL) são aproximados, baseados nas cotações do último dia registrado (${finalDate}).`,
      '• Os saldos apresentados correspondem às datas dos snapshots mais próximos disponíveis.',
      '• Este documento serve apenas como informe de rendimentos, não substitui a declaração oficial de imposto de renda.',
      '• Os rendimentos são referentes a operações realizadas em contratos inteligentes (blockchain) na plataforma.',
      '• Para mais informações ou dúvidas, entre em contato através do suporte da plataforma.',
    ];

    notes.forEach((note) => {
      doc.text(note, marginLeft, y, {
        width: doc.page.width - 100,
        align: 'left',
      });
      y += 20;
    });

    return y + 30;
  }

  /**
   * Desenhar footer na página atual com contador incremental
   */
  drawFooterOnCurrentPage(doc) {
    const pageHeight = doc.page.height;
    const marginLeft = 50;
    const footerY = pageHeight - 80;
    const data = doc._reportData;

    // Inicializar contador de footers se não existir
    if (!doc._footerCount) {
      doc._footerCount = 0;
    }
    doc._footerCount++;

    // Linha separadora
    doc
      .moveTo(marginLeft, footerY)
      .lineTo(doc.page.width - marginLeft, footerY)
      .stroke('#cccccc');

    // Informações do footer
    doc
      .fillColor('#666666')
      .fontSize(8)
      .font('Helvetica')
      .text(
        `Documento gerado em ${this.formatDate(data.metadata.generatedAt)}`,
        marginLeft,
        footerY + 15,
        {
          width: doc.page.width - 150,
          align: 'left',
          lineBreak: false,
          continued: false,
        }
      );

    // Número da página atual (será "Página X de Y" depois)
    doc
      .fillColor('#666666')
      .fontSize(8)
      .font('Helvetica')
      .text(
        `Página ${doc._footerCount} de ${doc._pageCount}`,
        doc.page.width - 150,
        footerY + 15,
        {
          width: 100,
          align: 'right',
          lineBreak: false,
          continued: false,
        }
      );

    // Restaurar cor para o conteúdo
    doc.fillColor('#000000');
  }

  /**
   * Obter label do tipo de produto
   */
  getProductTypeLabel(type) {
    const labels = {
      stake: 'Stake Tradicional',
      privateOffer: 'Oferta Privada',
      fixed: 'Renda Fixa Digital',
      variable: 'Renda Variável Digital',
      pratique: 'Pedacinho Pratique',
    };

    return labels[type] || type;
  }

  /**
   * Gerar PDF do informe de rendimentos
   */
  async generateIncomeReportPDF(reportData) {
    return new Promise((resolve, reject) => {
      try {
        console.log('[PDF Service] Iniciando geração do PDF...');
        console.log('[PDF Service] Dados recebidos:', {
          hasCompany: !!reportData.company,
          hasBeneficiary: !!reportData.beneficiary,
          hasPeriod: !!reportData.period,
          productsCount: reportData.products?.length || 0,
        });

        // Validar dados essenciais
        if (!reportData.company || !reportData.beneficiary || !reportData.period) {
          throw new Error('Dados incompletos para gerar o PDF');
        }

        // Criar documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          bufferPages: true, // NECESSÁRIO para switchToPage() funcionar
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
          info: {
            Title: `Informe de Rendimentos ${reportData.period?.informeYear || reportData.period?.year || new Date().getFullYear()}`,
            Author: reportData.company.name || 'Coinage Platform',
            Subject: 'Informe de Rendimentos Financeiros',
            Keywords: 'informe, rendimentos, imposto de renda, IRPF',
          },
        });

        // Rastrear páginas e armazenar dados para footer
        doc._pageCount = 1;
        doc._reportData = reportData;

        // Buffer para armazenar o PDF
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          console.log('[PDF Service] PDF finalizado com sucesso');
          resolve(Buffer.concat(chunks));
        });
        doc.on('error', (err) => {
          console.error('[PDF Service] Erro no documento PDF:', err);
          reject(err);
        });

        // Desenhar header
        console.log('[PDF Service] Desenhando header...');
        this.drawHeader(doc, reportData);

        // Desenhar seção de identificação
        console.log('[PDF Service] Desenhando identificação...');
        let y = this.drawIdentificationSection(doc, reportData);
        console.log(`[PDF Service] Após identificação: ${doc._pageCount} páginas, y=${y}`);

        // Desenhar seção de saldos
        console.log('[PDF Service] Desenhando saldos...');
        y = this.drawBalancesSection(doc, reportData, y);
        console.log(`[PDF Service] Após saldos: ${doc._pageCount} páginas, y=${y}`);

        // Desenhar seção de rendimentos
        console.log('[PDF Service] Desenhando rendimentos...');
        y = this.drawEarningsSection(doc, reportData, y);
        console.log(`[PDF Service] Após rendimentos: ${doc._pageCount} páginas, y=${y}`);

        // Desenhar seção de totais
        console.log('[PDF Service] Desenhando totais...');
        y = this.drawTotalsSection(doc, reportData, y);
        console.log(`[PDF Service] Após totais: ${doc._pageCount} páginas, y=${y}`);

        // Desenhar observações
        console.log('[PDF Service] Desenhando observações...');
        y = this.drawNotesSection(doc, reportData, y);
        console.log(`[PDF Service] Após observações: ${doc._pageCount} páginas, y=${y}`);

        // Desenhar footer na última página
        console.log('[PDF Service] Desenhando footer na última página...');
        this.drawFooterOnCurrentPage(doc);
        console.log(`[PDF Service] Páginas finais: ${doc._pageCount}`);

        // Finalizar documento
        console.log('[PDF Service] Finalizando documento...');
        doc.end();
      } catch (error) {
        console.error('[PDF Service] Erro ao gerar PDF:', error);
        console.error('[PDF Service] Stack:', error.stack);
        reject(error);
      }
    });
  }
}

module.exports = new PDFService();
