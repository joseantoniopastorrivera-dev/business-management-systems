const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  // Ubicaciones de la fábrica
  log('empresa=' + await L.abrir(page, BASE, 'stock.action_location_form', '1'));
  await shot('ubicaciones-iniciales-de-la-fabrica');
  for (const [n, slug] of [['Materias primas', 'materias-primas'], ['Cámara fría', 'camara-fria']]) {
    await L.nuevo(page);
    await L.campo(page, 'name', n);
    await L.m2o(page, 'location_id', 'FAB/Stock', null, 'FAB/Stock');
    await shot('ubicacion-' + slug + '-datos');
    await L.guardar(page);
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  await shot('ubicaciones-con-materias-primas-y-camara-fria');
  // Unidades de medida: categoría Peso
  await L.abrir(page, BASE, 'uom.product_uom_categ_form_action', '1');
  await shot('categorias-de-unidades-de-medida');
  await page.locator('.o_data_row', { hasText: /^\s*Peso/ }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await shot('categoria-peso-unidades-iniciales');
  const add = async (nombre, tipo, ratio) => {
    await page.locator('.o_field_x2many_list_row_add a').first().click(); await page.waitForTimeout(800);
    const row = page.locator('.o_data_row.o_selected_row');
    await row.locator('[name=name] input').fill(nombre);
    await row.locator('[name=uom_type] select').selectOption({ label: tipo });
    await page.waitForTimeout(500);
    await row.locator('[name=factor_inv] input, [name=factor] input').first().fill(String(ratio));
    await page.waitForTimeout(400);
  };
  await add('Saco de 25 kg', 'Más grande que la unidad de medida de referencia', '25');
  await add('Sobre de 500 g', 'Más pequeña que la unidad de medida de referencia', '2');
  await shot('categoria-peso-saco-25-kg-y-sobre-500-g');
  await L.guardar(page); await shot('categoria-peso-guardada');
  log(JSON.stringify(await call('uom.uom', 'search_read', [[['category_id.name', 'in', ['Weight', 'Peso']]]], { fields: ['name', 'uom_type', 'factor', 'ratio'] })));
};
