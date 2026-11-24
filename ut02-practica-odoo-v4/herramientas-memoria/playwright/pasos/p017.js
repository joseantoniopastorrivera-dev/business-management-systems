const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web#action=stock.action_warehouse_form&cids=1-2', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_list_view'); await L.esperar(page, 2000);
  await shot('almacenes-creados-solos-con-nombres-por-defecto');
  const editar = async (texto, nombre, codigo, slug) => {
    await page.locator('.o_data_row', { hasText: texto }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await shot('almacen-' + slug + '-antes');
    await L.campo(page, 'name', nombre); await L.campo(page, 'code', codigo);
    await shot('almacen-' + slug + '-renombrado');
    await L.guardar(page);
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  };
  await editar('My Company', 'Fábrica de Alcalá', 'FAB', 'fabrica');
  await editar('La ta', 'Bar de la taberna', 'BAR', 'bar');
  await shot('almacenes-fab-y-bar');
  log(JSON.stringify(await call('stock.warehouse', 'search_read', [[]], { fields: ['name', 'code', 'company_id', 'lot_stock_id'] })));
};
