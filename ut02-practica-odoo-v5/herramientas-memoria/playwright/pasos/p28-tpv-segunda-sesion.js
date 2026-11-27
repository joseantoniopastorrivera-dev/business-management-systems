// Cap. 5 · Segunda sesión de la barra (25/11): comprobar que, con el IVA incluido, los pedidos que daban un céntimo
// de menos cuadran (21,50 y 9,40) y que la numeración ya es BARRA/…; cierre de caja.
const PEDIDOS = [
  { lineas: [['Pinta Trigo de Shelbyville', 3], ['Caña Llamarada Moe IPA', 2]], metodo: 'Banco', capt: true },
  { lineas: [['Caña Trigo de Shelbyville', 2], ['Caña Springfield Lager', 2]], metodo: 'Efectivo' },
  { lineas: [['Pinta Springfield Lager', 2], ['Pinta Llamarada Moe IPA', 2]], metodo: 'Efectivo' },
];
module.exports = async ({ page, shot, BASE, call, log, L }) => {
  const C = { context: { allowed_company_ids: [2] } };
  // El TPV solo abre si la compañía activa es la taberna (cookie cids): se pasa antes por el backend con cids=2.
  await L.abrir(page, BASE, 'point_of_sale.action_pos_config_kanban', '2', '.o_kanban_view');
  // Sin sesión abierta, /pos/ui devuelve al tablero: la sesión se crea con «Nueva sesión» (o se retoma con «Continuar»).
  await page.locator('.o_kanban_record button', { hasText: /Nueva sesión|Continuar la venta|Abrir registro/ }).first().click();
  await page.locator('.product').first().waitFor({ timeout: 120000 }); await page.waitForTimeout(2000);
  const abrir = page.locator('button', { hasText: 'Abrir sesión' });
  if (await abrir.count()) {
    const caja = page.locator('.opening-cash-control input, .popup input, .modal-dialog input').first();
    await caja.click(); await caja.fill('172,59'); await page.waitForTimeout(300);
    await shot('tpv-31-apertura-segunda-sesion', { zona: abrir.locator('xpath=ancestor::div[contains(@class,"modal-content") or contains(@class,"popup")][1]'), borrador: 'Apertura con 172,59 € (lo que quedó ayer)' });
    await abrir.click(); await page.waitForTimeout(2000);
  }
  const [ses] = await call('pos.session', 'search_read', [[['config_id', '=', 2], ['state', '=', 'opened']]], { fields: ['id', 'name'], ...C });
  const hechos = await call('pos.order', 'search_count', [[['session_id', '=', ses.id]]], C);
  for (const [n, p] of PEDIDOS.entries()) {
    if (n < hechos) continue;
    for (const [prod, cant] of p.lineas)
      for (let i = 0; i < cant; i++) { await page.locator('.product', { hasText: prod }).first().click(); await page.waitForTimeout(250); }
    if (p.capt) await shot('tpv-32-pedido-que-ahora-cuadra', { borrador: '3 pintas Trigo + 2 cañas IPA = 21,50 €' });
    await page.locator('.pay-order-button').first().click(); await page.waitForTimeout(1200);
    await page.locator('.paymentmethod, .payment-method-display, button', { hasText: p.metodo }).first().click(); await page.waitForTimeout(600);
    await page.locator('button, .button', { hasText: /^\s*Validar\s*$/ }).first().click(); await page.waitForTimeout(2500);
    if (p.capt) await shot('tpv-33-recibo-que-cuadra', { borrador: 'Recibo 21,50 €' });
    await page.locator('button, .button', { hasText: /Nueva orden|Nuevo pedido/ }).first().click(); await page.waitForTimeout(1200);
  }
  log(JSON.stringify(await call('pos.order', 'search_read', [[['session_id', '=', ses.id]]], { fields: ['name', 'amount_total', 'amount_tax'], ...C })));
  // cierre
  const modal = page.locator('.close-pos-popup').first();
  if (!(await modal.isVisible())) { await page.locator('.fa-bars').first().click(); await page.waitForTimeout(800); await page.locator('.dropdown-item:visible', { hasText: 'Cerrar sesión' }).first().click(); await page.waitForTimeout(2500); }
  await modal.waitFor();
  const esperado = (await modal.innerText()).match(/Efectivo\s+([\d.,]+)\s*€/);
  log('esperado efectivo', esperado && esperado[1]);
  const inp = modal.locator('input').first(); await inp.click(); await inp.fill(esperado ? esperado[1] : '0'); await page.waitForTimeout(800);
  await shot('tpv-34-cierre-segunda-sesion', { zona: modal, borrador: 'Cierre de la segunda sesión' });
  await modal.locator('footer button.btn-primary', { hasText: /Cerrar sesión/ }).first().click(); await page.waitForTimeout(6000);
  log(JSON.stringify(await call('pos.session', 'search_read', [[['id', '=', ses.id]]], { fields: ['name', 'state', 'cash_register_balance_start', 'cash_register_balance_end_real', 'cash_register_difference', 'move_id'], ...C })));
};
