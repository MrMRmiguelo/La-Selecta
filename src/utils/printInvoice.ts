// Utilidad para generar e imprimir facturas

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  nota?: string;
  precioExtra?: number;
}

interface InvoiceData {
  customerName?: string;
  tableNumber?: number;
  items: InvoiceItem[];
  sodas: InvoiceItem[];
  total: number;
  date: Date;
  invoiceType: 'mesa' | 'rapida';
}

export const generateInvoiceHTML = (data: InvoiceData): string => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `L ${amount.toFixed(2)}`;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Factura - La Selecta</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        @page {
          size: 80mm auto; /* Ancho fijo, altura automática */
          margin: 2mm; /* Márgenes mínimos */
        }
        
        html, body {
          height: auto !important;
          min-height: auto !important;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.3;
          width: 80mm;
          background: white;
          display: block;
        }
        
        .invoice-container {
          width: 100%;
          padding: 3mm;
          display: block;
          height: auto;
          min-height: auto;
        }
        
        .header {
          text-align: center;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
          margin-bottom: 6px;
        }
        
        .restaurant-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 2px;
          line-height: 1.1;
        }
        
        .invoice-info {
          margin-bottom: 6px;
          border-bottom: 1px dashed #000;
          padding-bottom: 4px;
          font-size: 12px;
          line-height: 1.3;
        }
        
        .invoice-info div {
          margin-bottom: 1px;
        }
        
        .items-section {
          margin-bottom: 6px;
        }
        
        .section-title {
          font-weight: bold;
          margin-bottom: 3px;
          font-size: 16px;
          text-align: center;
          text-decoration: underline;
        }
        
        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
          font-size: 14px;
          line-height: 1.2;
          border-bottom: 1px dotted #ccc;
          padding: 2px 0;
        }
        
        .item-details {
          flex: 1;
          padding-right: 3px;
        }
        
        .item-price {
          text-align: right;
          min-width: 40px;
          font-weight: bold;
        }
        
        .item-note {
          font-size: 11px;
          color: #666;
          margin-left: 6px;
          font-style: italic;
          margin-top: 1px;
          line-height: 1.2;
        }
        
        .total-section {
          border-top: 1px solid #000;
          padding-top: 4px;
          margin-top: 6px;
        }
        
        .total {
          font-size: 20px;
          font-weight: bold;
          text-align: right;
        }
        
        .footer {
          text-align: center;
          margin-top: 8px;
          border-top: 1px dashed #000;
          padding-top: 4px;
          font-size: 10px;
          line-height: 1.2;
        }
        
        .footer div {
          margin-bottom: 1px;
        }
        
        @media print {
          @page {
            size: 80mm auto !important;
            margin: 1mm !important;
          }
          
          html {
            height: auto !important;
            overflow: visible !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            height: auto !important;
            min-height: auto !important;
            font-size: 16px !important;
            overflow: visible !important;
          }
          
          .invoice-container {
            padding: 2mm !important;
            height: auto !important;
            min-height: auto !important;
            page-break-after: auto !important;
          }
          
          .header {
            margin-bottom: 4px !important;
            padding-bottom: 3px !important;
          }
          
          .restaurant-name {
            font-size: 20px !important;
          }
          
          .invoice-info {
            margin-bottom: 4px !important;
            padding-bottom: 3px !important;
            font-size: 14px !important;
          }
          
          .items-section {
            margin-bottom: 4px !important;
          }
          
          .item {
            font-size: 14px !important;
            margin-bottom: 0.5px !important;
          }
          
          .item-note {
            font-size: 12px !important;
          }
          
          .total-section {
            padding-top: 3px !important;
            margin-top: 4px !important;
          }
          
          .total {
            font-size: 18px !important;
          }
          
          .footer {
            margin-top: 6px !important;
            padding-top: 3px !important;
            font-size: 12px !important;
          }
          
          /* Evitar saltos de página y espacios innecesarios */
          .item, .invoice-info div, .footer div {
            page-break-inside: avoid !important;
            orphans: 2 !important;
            widows: 2 !important;
          }
          
          /* Eliminar espacios extra */
          * {
            max-height: none !important;
          }
          
          /* Asegurar que no haya altura fija */
          html, body, .invoice-container {
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
          }
        }
        
        @media screen {
          body {
            background: #f0f0f0;
            padding: 20px;
          }
          
          .invoice-container {
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin: 0 auto;
            max-width: 80mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="restaurant-name">LA SELECTA</div>
          <div>Restaurante</div>
        </div>
        
        <div class="invoice-info">
          <div><strong>Fecha:</strong> ${formatDate(data.date)}</div>
          ${data.tableNumber ? `<div><strong>Mesa:</strong> ${data.tableNumber}</div>` : ''}
          ${data.customerName ? `<div><strong>Cliente:</strong> ${data.customerName}</div>` : ''}
          <div><strong>Tipo:</strong> ${data.invoiceType === 'mesa' ? 'Facturación Mesa' : 'Facturación Rápida'}</div>
        </div>
        
        ${data.items.length > 0 ? `
          <div class="items-section">
            <div class="section-title">COMIDA:</div>
            ${data.items.map(item => `
              <div class="item">
                <div class="item-details">
                  ${item.quantity}x ${item.name}
                  ${item.nota ? `<div class="item-note">Nota: ${item.nota}</div>` : ''}
                  ${item.precioExtra && item.precioExtra > 0 ? `<div class="item-note">Extra: ${formatCurrency(item.precioExtra)}</div>` : ''}
                </div>
                <div class="item-price">${formatCurrency(item.subtotal)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${data.sodas.length > 0 ? `
          <div class="items-section">
            <div class="section-title">BEBIDAS:</div>
            ${data.sodas.map(soda => `
              <div class="item">
                <div class="item-details">
                  ${soda.quantity}x ${soda.name}
                  ${soda.nota ? `<div class="item-note">Nota: ${soda.nota}</div>` : ''}
                </div>
                <div class="item-price">${formatCurrency(soda.subtotal)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="total-section">
          <div class="total">TOTAL: ${formatCurrency(data.total)}</div>
        </div>
        
        <div class="footer">
          <div>¡Gracias por su visita!</div>
          <div>La Selecta - Restaurante</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const printInvoice = (data: InvoiceData): void => {
  const invoiceHTML = generateInvoiceHTML(data);
  
  // Crear una nueva ventana para la impresión
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Esperar a que se cargue el contenido y luego imprimir
    printWindow.onload = () => {
      printWindow.print();
      // Cerrar la ventana después de imprimir
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  } else {
    // Fallback si no se puede abrir la ventana
    alert('No se pudo abrir la ventana de impresión. Por favor, verifique que las ventanas emergentes estén habilitadas.');
  }
};

// Función para descargar la factura como HTML
export const downloadInvoice = (data: InvoiceData): void => {
  const invoiceHTML = generateInvoiceHTML(data);
  const blob = new Blob([invoiceHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `factura_${data.invoiceType}_${data.tableNumber || 'rapida'}_${new Date().getTime()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};