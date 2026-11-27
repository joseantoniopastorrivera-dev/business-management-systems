// Cap. 5 · Cuatro pedidos en la barra (24/11 por la noche). Pedido 1 capturado pantalla a pantalla.
const PEDIDOS = [
  { lineas: [['Pinta Llamarada Moe IPA', 2], ['Caña Springfield Lager', 1]], metodo: 'Efectivo', entrega: '20', capt: true },
  { lineas: [['Pinta Trigo de Shelbyville', 3], ['Caña Llamarada Moe IPA', 2]], metodo: 'Banco' },
  { lineas: [['Pinta Springfield Lager', 4], ['Pinta Llamarada Moe IPA', 1]], metodo: 'Banco' },
  { lineas: [['Caña Trigo de Shelbyville', 2], ['Caña Springfield Lager', 2]], metodo: 'Efectivo' },
];
module.exports = async ({ page, shot, BASE, call, log }) => {
  const C = { context: { allowed_company_ids: [2] } };
  const hechos = await call('pos.order', 'search_count', [[['config_id', '=', 2]]], C);
  log('pedidos ya hechos', hechos);
  if (!page.url().includes('/pos/ui')) { await page.goto(BASE + '/pos/ui?config_id=2', { waitUntil: 'domcontentloaded' }); }
  await page.locator('.product').first().waitFor({ timeout: 120000 }); await page.waitForTimeout(1500);
  for (const [n, p] of PEDIDOS.entries()) {
    if (n < hechos) continue;
    for (const [prod, cant] of p.lineas)
      for (let i = 0; i < cant; i++) { await page.locator('.product', { hasText: prod }).first().click(); await page.waitForTimeout(250); }
    if (p.capt) await shot('tpv-20-pedido-1-lineas', { borrador: 'Pedido 1 con sus líneas' });
    await page.locator('.pay-order-button').first().click(); await page.waitForTimeout(1200);
    await page.locator('.paymentmethod, .payment-method-display, button', { hasText: p.metodo }).first().click(); await page.waitForTimeout(600);
    if (p.entrega) {
      // importe entregado por el cliente: se borra el propuesto y se teclea en el teclado numérico
      for (let i = 0; i < 6; i++) await page.keyboard.press('Backspace');
      await page.keyboard.type(p.entrega); await page.waitForTimeout(600);
    }
    if (p.capt) await shot('tpv-21-pedido-1-pago-efectivo', { borrador: 'Pantalla de pago: efectivo 20 €, cambio' });
    await page.locator('button, .button', { hasText: /^\s*Validar\s*$/ }).first().click(); await page.waitForTimeout(2500);
    if (p.capt) await shot('tpv-22-pedido-1-recibo', { borrador: 'Recibo del pedido 1' });
    await page.locator('button, .button', { hasText: /Nueva orden|Nuevo pedido/ }).first().click(); await page.waitForTimeout(1200);
    log('pedido', n + 1, 'ok');
  }
  log(JSON.stringify(await call('pos.order', 'search_read', [[['config_id', '=', 2]]], { fields: ['name', 'amount_total', 'amount_tax', 'state', 'payment_ids'], ...C })));
};
