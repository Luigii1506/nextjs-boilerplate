/**
 * 🧾 Receipt Formatter
 * ====================
 *
 * Utilidades para formatear recibos de POS.
 * Genera texto formateado para impresión.
 *
 * @module pos/utils/receipt.formatter
 * @version 1.0.0
 */

import type { POSTransaction } from "../types/models";
import { formatCurrency, formatTransactionDate } from "../server/mappers";

// ========================================
// TYPES
// ========================================

export interface ReceiptConfig {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  taxId: string;
  footer?: string;
  locale?: string;
}

export interface ReceiptData extends POSTransaction {
  cashierName?: string;
  storeName?: string;
}

// ========================================
// RECEIPT FORMATTER
// ========================================

/**
 * Formatear recibo completo para impresión
 */
export function formatReceipt(
  transaction: ReceiptData,
  config: ReceiptConfig
): string {
  const lines: string[] = [];
  const width = 42; // Ancho típico de impresora térmica

  // Helper para centrar texto
  const center = (text: string) => {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2));
    return " ".repeat(spaces) + text;
  };

  // Helper para línea con padding
  const line = (left: string, right: string) => {
    const spaces = Math.max(1, width - left.length - right.length);
    return left + " ".repeat(spaces) + right;
  };

  // Header
  lines.push(center("=".repeat(width)));
  lines.push(center(config.storeName.toUpperCase()));
  lines.push(center(config.storeAddress));
  lines.push(center(config.storePhone));
  lines.push(center(`RFC: ${config.taxId}`));
  lines.push(center("=".repeat(width)));
  lines.push("");

  // Transaction info
  lines.push(line("Ticket:", transaction.transactionNumber));
  lines.push(
    line("Fecha:", formatTransactionDate(transaction.createdAt, config.locale))
  );
  if (transaction.cashierName) {
    lines.push(line("Cajero:", transaction.cashierName));
  }
  lines.push("");
  lines.push("-".repeat(width));

  // Items
  lines.push(center("PRODUCTOS"));
  lines.push("-".repeat(width));

  for (const item of transaction.items) {
    // Nombre del producto
    lines.push(item.productName);

    // Cantidad, precio unitario y total
    const qtyLine = line(
      `  ${item.quantity} x ${formatCurrency(item.unitPrice, config.locale)}`,
      formatCurrency(item.total, config.locale)
    );
    lines.push(qtyLine);

    // Descuento si aplica
    if (item.discount > 0) {
      lines.push(
        line(
          `    Descuento:`,
          `-${formatCurrency(item.discount, config.locale)}`
        )
      );
    }
  }

  lines.push("-".repeat(width));

  // Totals
  lines.push(
    line("Subtotal:", formatCurrency(transaction.subtotal, config.locale))
  );

  if (transaction.discount > 0) {
    lines.push(
      line(
        "Descuento:",
        `-${formatCurrency(transaction.discount, config.locale)}`
      )
    );
  }

  lines.push(
    line(
      "IVA (16%):",
      formatCurrency(transaction.tax, config.locale)
    )
  );
  lines.push("=".repeat(width));
  lines.push(
    line(
      "TOTAL:",
      formatCurrency(transaction.total, config.locale).toUpperCase()
    )
  );
  lines.push("=".repeat(width));

  // Payment info
  lines.push("");
  lines.push(line("Método de pago:", getPaymentMethodLabel(transaction.paymentMethod)));
  lines.push(
    line("Pagado:", formatCurrency(transaction.amountPaid, config.locale))
  );

  if (transaction.changeDue > 0) {
    lines.push(
      line("Cambio:", formatCurrency(transaction.changeDue, config.locale))
    );
  }

  // Footer
  lines.push("");
  lines.push("-".repeat(width));
  if (config.footer) {
    lines.push(center(config.footer));
  }
  lines.push(center("¡Gracias por su compra!"));
  lines.push(center("Conserve su ticket"));
  lines.push("-".repeat(width));

  return lines.join("\n");
}

/**
 * Formatear recibo simple (para vista previa)
 */
export function formatReceiptSimple(transaction: ReceiptData): string {
  const lines: string[] = [];

  lines.push(`Ticket: ${transaction.transactionNumber}`);
  lines.push(`Fecha: ${formatTransactionDate(transaction.createdAt)}`);
  lines.push("");

  lines.push("Productos:");
  for (const item of transaction.items) {
    lines.push(
      `  ${item.quantity}x ${item.productName} - ${formatCurrency(item.total)}`
    );
  }

  lines.push("");
  lines.push(`Subtotal: ${formatCurrency(transaction.subtotal)}`);
  lines.push(`IVA: ${formatCurrency(transaction.tax)}`);
  lines.push(`TOTAL: ${formatCurrency(transaction.total)}`);
  lines.push(`Pagado: ${formatCurrency(transaction.amountPaid)}`);

  if (transaction.changeDue > 0) {
    lines.push(`Cambio: ${formatCurrency(transaction.changeDue)}`);
  }

  return lines.join("\n");
}

/**
 * Formatear recibo HTML (para email o vista web)
 */
export function formatReceiptHTML(
  transaction: ReceiptData,
  config: ReceiptConfig
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
    .info { margin: 10px 0; }
    .items { margin: 20px 0; }
    .item { margin: 5px 0; }
    .totals { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
    .total { font-weight: bold; font-size: 1.2em; }
    .footer { text-align: center; border-top: 2px solid #000; margin-top: 20px; padding-top: 10px; }
    .row { display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <h2>${config.storeName}</h2>
    <p>${config.storeAddress}</p>
    <p>${config.storePhone}</p>
    <p>RFC: ${config.taxId}</p>
  </div>

  <div class="info">
    <div class="row">
      <span>Ticket:</span>
      <span>${transaction.transactionNumber}</span>
    </div>
    <div class="row">
      <span>Fecha:</span>
      <span>${formatTransactionDate(transaction.createdAt, config.locale)}</span>
    </div>
    ${
      transaction.cashierName
        ? `<div class="row"><span>Cajero:</span><span>${transaction.cashierName}</span></div>`
        : ""
    }
  </div>

  <div class="items">
    <h3>Productos</h3>
    ${transaction.items
      .map(
        (item) => `
      <div class="item">
        <div>${item.productName}</div>
        <div class="row">
          <span>${item.quantity} x ${formatCurrency(item.unitPrice, config.locale)}</span>
          <span>${formatCurrency(item.total, config.locale)}</span>
        </div>
        ${
          item.discount > 0
            ? `<div class="row"><span>Descuento:</span><span>-${formatCurrency(item.discount, config.locale)}</span></div>`
            : ""
        }
      </div>
    `
      )
      .join("")}
  </div>

  <div class="totals">
    <div class="row">
      <span>Subtotal:</span>
      <span>${formatCurrency(transaction.subtotal, config.locale)}</span>
    </div>
    ${
      transaction.discount > 0
        ? `<div class="row"><span>Descuento:</span><span>-${formatCurrency(transaction.discount, config.locale)}</span></div>`
        : ""
    }
    <div class="row">
      <span>IVA (16%):</span>
      <span>${formatCurrency(transaction.tax, config.locale)}</span>
    </div>
    <div class="row total">
      <span>TOTAL:</span>
      <span>${formatCurrency(transaction.total, config.locale)}</span>
    </div>
  </div>

  <div class="info">
    <div class="row">
      <span>Método de pago:</span>
      <span>${getPaymentMethodLabel(transaction.paymentMethod)}</span>
    </div>
    <div class="row">
      <span>Pagado:</span>
      <span>${formatCurrency(transaction.amountPaid, config.locale)}</span>
    </div>
    ${
      transaction.changeDue > 0
        ? `<div class="row"><span>Cambio:</span><span>${formatCurrency(transaction.changeDue, config.locale)}</span></div>`
        : ""
    }
  </div>

  <div class="footer">
    ${config.footer ? `<p>${config.footer}</p>` : ""}
    <p>¡Gracias por su compra!</p>
    <p>Conserve su ticket</p>
  </div>
</body>
</html>
  `;
}

// ========================================
// HELPERS
// ========================================

/**
 * Obtener etiqueta del método de pago
 */
function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    CASH: "Efectivo",
    CARD: "Tarjeta",
    TRANSFER: "Transferencia",
    MIXED: "Mixto",
  };

  return labels[method] || method;
}

/**
 * Generar JSON del recibo para APIs
 */
export function formatReceiptJSON(transaction: ReceiptData): string {
  return JSON.stringify(
    {
      transactionNumber: transaction.transactionNumber,
      date: transaction.createdAt.toISOString(),
      type: transaction.type,
      paymentMethod: transaction.paymentMethod,
      items: transaction.items.map((item) => ({
        name: item.productName,
        sku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.total,
      })),
      subtotal: transaction.subtotal,
      tax: transaction.tax,
      discount: transaction.discount,
      total: transaction.total,
      amountPaid: transaction.amountPaid,
      changeDue: transaction.changeDue,
    },
    null,
    2
  );
}
