const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  const ratio = async (val) => {
    const row = page.locator('.o_data_row.o_selected_row');
    const cell = row.locator('td[name=factor_inv], td[name=ratio], td[name=factor]').first();
    log('celda=' + await cell.getAttribute('name'));
    await cell.click(); await page.waitForTimeout(400);
    const inp = cell.locator('input'); await inp.fill(val); await page.waitForTimeout(400);
  };
  await ratio('25');
  await page.locator('.o_field_x2many_list_row_add a').first().click(); await page.waitForTimeout(800);
  let row = page.locator('.o_data_row.o_selected_row');
  await row.locator('td[name=name] input').fill('Sobre de 500 g');
  await row.locator('td[name=uom_type] select').selectOption({ label: 'Más pequeña que la unidad de medida de referencia' }); await page.waitForTimeout(500);
  await ratio('2');
  await page.locator('.o_form_view .o_field_widget[name=name]').first().click().catch(() => {}); await page.waitForTimeout(500);
  await shot('categoria-peso-saco-25-kg-y-sobre-500-g');
  await L.guardar(page); await shot('categoria-peso-guardada');
  log(JSON.stringify(await call('uom.uom', 'search_read', [[['category_id', '=', 2]]], { fields: ['name', 'uom_type', 'factor', 'ratio'] })));
  log(JSON.stringify(await call('stock.location', 'search_read', [[['name', 'in', ['Materias primas', 'Cámara fría']]]], { fields: ['complete_name', 'company_id'] })));
};
