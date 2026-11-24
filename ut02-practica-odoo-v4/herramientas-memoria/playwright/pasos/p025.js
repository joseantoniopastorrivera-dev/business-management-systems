const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.locator('.o_form_button_cancel:visible').first().click().catch(() => {}); await page.waitForTimeout(1000);
  await L.abrir(page, BASE, 'product.product_category_action_form', '1');
  const MP = ['310000', '601000', '611000', '700000', '601000'];
  const cats = [
    ['Materias primas', 'All', 'All', 'FIFO', MP, 'materias-primas'],
    ['Maltas', 'Materias primas', 'All / Materias primas', 'FIFO', MP, 'maltas'],
    ['Lúpulos', 'Materias primas', 'All / Materias primas', 'FEFO', MP, 'lupulos'],
    ['Levaduras', 'Materias primas', 'All / Materias primas', 'FEFO', MP, 'levaduras'],
    ['Envases', 'Materias primas', 'All / Materias primas', 'FIFO', ['327000', '602000', '612000', '704000', '602000'], 'envases'],
    ['Cerveza en barril', 'All', 'All', 'FEFO', ['350000', '712000', '712000', '701000', '601000'], 'cerveza-en-barril'],
    ['Subproductos', 'All', 'All', 'FIFO', ['360000', '713000', '713000', '703000', '601000'], 'subproductos'],
    ['Vinos', 'All', 'All', 'FIFO', null, 'vinos'],
  ];
  for (const [n, padreBusca, padre, salida, cu, slug] of cats) {
    await L.nuevo(page);
    await L.campo(page, 'name', n);
    await L.m2o(page, 'parent_id', padreBusca, null, padre);
    await L.m2o(page, 'removal_strategy_id', salida, null, salida);
    if (cu) {
      await page.locator('.o_field_widget[name=property_cost_method] select').selectOption({ label: 'Coste promedio (AVCO)' }); await page.waitForTimeout(400);
      await page.locator('.o_field_widget[name=property_valuation] select').selectOption({ label: 'Automatizado' }); await page.waitForTimeout(800);
      const [val, ent, sal, ing, gas] = cu;
      await L.m2o(page, 'property_account_income_categ_id', ing, null, ing);
      await L.m2o(page, 'property_account_expense_categ_id', gas, null, gas);
      await L.m2o(page, 'property_stock_valuation_account_id', val, null, val);
      await L.m2o(page, 'property_stock_account_input_categ_id', ent, null, ent);
      await L.m2o(page, 'property_stock_account_output_categ_id', sal, null, sal);
    }
    await shot('categoria-' + slug + '-datos-y-cuentas');
    await L.guardar(page);
    await shot('categoria-' + slug + '-guardada');
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  await shot('categorias-de-producto-de-la-fabrica');
  log(JSON.stringify(await call('product.category', 'search_read', [[]], { fields: ['complete_name', 'property_cost_method', 'property_valuation', 'removal_strategy_id', 'property_stock_valuation_account_id'] })));
};
