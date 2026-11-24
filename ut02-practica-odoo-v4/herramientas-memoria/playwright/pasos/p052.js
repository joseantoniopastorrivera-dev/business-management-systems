const L = require('./lib');
const LIN = [['Llamarada Moe IPA', '6'], ['Springfield Lager', '4'], ['Springfield Stout', '2'], ['Trigo de Shelbyville', '2']];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'sale.action_quotations_with_onboarding', '1');
  await shot('fabrica-ventas-presupuestos-vacio');
  await L.nuevo(page);
  await shot('fabrica-presupuesto-nuevo');
  await L.m2o(page, 'partner_id', 'La taberna', null, 'La taberna de Moe, S.L.');
  await L.m2o(page, 'payment_term_id', '30', null, '30 días');
  for (const [p, q] of LIN) {
    await page.locator('.o_field_widget[name=order_line] .o_field_x2many_list_row_add a').first().click(); await page.waitForTimeout(800);
    const row = page.locator('.o_field_widget[name=order_line] .o_data_row.o_selected_row');
    const i = row.locator('td[name=product_template_id] input, td[name=product_id] input').first(); await i.type(p, { delay: 30 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: p }).first().click(); await page.waitForTimeout(900);
    const c = row.locator('td[name=product_uom_qty]'); await c.click(); await c.locator('input').fill(q); await page.waitForTimeout(500);
  }
  await page.locator('.o_form_sheet .oe_title, .o_form_sheet h1').first().click(); await page.waitForTimeout(800);
  await page.mouse.move(1350, 860); await shot('fabrica-presupuesto-taberna-lineas-de-barriles');
  await page.locator('.o_notebook .nav-link', { hasText: 'Otra información' }).click(); await page.waitForTimeout(600);
  await L.campo(page, 'client_order_ref', 'P00005');
  await page.mouse.move(1350, 860); await shot('fabrica-presupuesto-referencia-del-cliente-p00005');
  await L.guardar(page);
  await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Confirmar\s*$/ }).first().click(); await L.esperar(page, 2500);
  await page.locator('.o_notebook .nav-link', { hasText: 'Líneas del pedido' }).click().catch(() => {}); await page.waitForTimeout(600);
  await page.mouse.move(1350, 860); await shot('fabrica-pedido-de-venta-confirmado-con-entrega');
  log(JSON.stringify(await call('sale.order', 'search_read', [[]], { fields: ['name', 'partner_id', 'client_order_ref', 'amount_untaxed', 'amount_total', 'state', 'picking_ids'] })));
};
