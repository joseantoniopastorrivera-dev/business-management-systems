const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'mrp.mrp_production_action', '1');
  await page.locator('.o_cp_switch_buttons button, .o_switch_view').filter({ has: page.locator('.oi-view-list, .fa-list-ul') }).first().click().catch(() => {}); await L.esperar(page);
  await shot('ordenes-de-fabricacion-fab-creadas-por-el-planificador');
  await page.locator('.o_data_row', { hasText: 'FAB/MO/00005' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await shot('orden-fab-mo-00005-ipa-componentes-no-disponibles');
  await L.abrir(page, BASE, 'purchase.purchase_rfq', '1');
  await shot('peticiones-de-presupuesto-generadas-por-reglas');
  for (const [po, slug] of [['P00001', 'maltas-del-duero'], ['P00002', 'lupulos-de-leon'], ['P00003', 'levaduras-ibericas'], ['P00004', 'envases-del-henares']]) {
    await page.locator('.o_data_row', { hasText: po }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await page.mouse.move(1350, 860); await shot('sdp-' + po.toLowerCase() + '-' + slug + '-borrador');
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Confirmar pedido' }).first().click(); await L.esperar(page, 2000);
    await page.mouse.move(1350, 860); await shot('pedido-' + po.toLowerCase() + '-' + slug + '-confirmado');
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  await shot('pedidos-de-compra-confirmados');
  log(JSON.stringify(await call('stock.picking', 'search_read', [[['picking_type_code', '=', 'incoming']]], { fields: ['name', 'partner_id', 'origin', 'state', 'location_dest_id'] })));
  log(JSON.stringify(await call('purchase.order.line', 'search_read', [[]], { fields: ['order_id', 'product_id', 'product_qty', 'product_uom', 'price_unit', 'price_subtotal'] })));
};
