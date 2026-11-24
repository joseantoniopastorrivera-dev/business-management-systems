const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'product.product_category_action_form', '1');
  await shot('categorias-de-producto-iniciales');
  const cats = [
    ['Materias primas', 'All', 'FIFO', 'materias-primas'],
    ['Maltas', 'All / Materias primas', 'FIFO', 'maltas'],
    ['Lúpulos', 'All / Materias primas', 'FEFO', 'lupulos'],
    ['Levaduras', 'All / Materias primas', 'FEFO', 'levaduras'],
    ['Envases', 'All / Materias primas', 'FIFO', 'envases'],
    ['Cerveza en barril', 'All', 'FEFO', 'cerveza-en-barril'],
    ['Subproductos', 'All', 'FIFO', 'subproductos'],
    ['Vinos', 'All', 'FIFO', 'vinos'],
  ];
  let first = true;
  for (const [n, padre, salida, slug] of cats) {
    await L.nuevo(page);
    await L.campo(page, 'name', n);
    await L.m2o(page, 'parent_id', padre.split(' / ').pop(), null, padre);
    await L.m2o(page, 'removal_strategy_id', salida, null, salida);
    if (n !== 'Vinos') {
      await page.locator('.o_field_widget[name=property_cost_method] select').selectOption({ label: 'Costo promedio (AVCO)' }).catch(async () => { log('opts cost=' + await page.locator('.o_field_widget[name=property_cost_method]').innerText()); });
      await page.waitForTimeout(400);
      await page.locator('.o_field_widget[name=property_valuation] select').selectOption({ label: 'Automatizado' }).catch(async () => { log('opts val=' + await page.locator('.o_field_widget[name=property_valuation]').innerText()); });
      await page.waitForTimeout(800);
    }
    if (first) { await shot('categoria-' + slug + '-formulario-con-valoracion'); first = false; }
    await L.guardar(page);
    await shot('categoria-' + slug + '-guardada');
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  await shot('categorias-de-producto-de-la-fabrica');
  log(JSON.stringify(await call('product.category', 'search_read', [[]], { fields: ['complete_name', 'property_cost_method', 'property_valuation', 'removal_strategy_id', 'property_stock_valuation_account_id'] })));
};
