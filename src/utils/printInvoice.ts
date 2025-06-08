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
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 20px;
          max-width: 300px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .restaurant-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .invoice-info {
          margin-bottom: 15px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .items-section {
          margin-bottom: 15px;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .item-details {
          flex: 1;
        }
        .item-price {
          text-align: right;
          min-width: 60px;
        }
        .item-note {
          font-size: 10px;
          color: #666;
          margin-left: 10px;
          font-style: italic;
        }
        .total-section {
          border-top: 2px solid #000;
          padding-top: 10px;
          margin-top: 15px;
        }
        .total {
          font-size: 14px;
          font-weight: bold;
          text-align: right;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          border-top: 1px dashed #000;
          padding-top: 10px;
          font-size: 10px;
        }
        @media print {
          body {
            margin: 0;
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
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
          <div><strong>COMIDA:</strong></div>
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
          <div><strong>BEBIDAS:</strong></div>
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