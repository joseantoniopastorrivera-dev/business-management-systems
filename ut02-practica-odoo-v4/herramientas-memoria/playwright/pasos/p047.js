const L = require('./lib');
const REV = [['PT-IPA-30', '-3115,50', 'llamarada-moe-ipa'], ['PT-LAG-30', '-5257,50', 'springfield-lager'], ['PT-STO-30', '-3115,50', 'springfield-stout'], ['PT-TRI-30', '-2707,50', 'trigo-de-shelbyville']];
module.exports = async ({ page, shot, log, call, BASE }) => {
  // 1) borrar el desmontaje en borrador
  await L.abrir(page, BASE, 'mrp.mrp_unbuild', '1');
  await shot('desmontaje-ub-00001-en-borrador');
  await page.locator('.o_data_row', { hasText: 'UB/00001' }).locator('.o_list_record_selector input').check(); await page.waitForTimeout(500);
  await page.locator('.o_cp_action_menus button').first().click(); await page.waitForTimeout(500);
  await page.locator('.dropdown-item', { hasText: 'Eliminar' }).first().click(); await page.waitForTimeout(800);
  await page.locator('.modal-footer button', { hasText: /Eliminar|Aceptar|Ok/ }).first().click(); await L.esperar(page, 1500);
  // 2) coste por hora real de los fermentadores
  await L.abrir(page, BASE, 'mrp.mrp_workcenter_action', '1');
  await page.locator('.o_data_row', { hasText: 'Fermentadores' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await L.campo(page, 'costs_hour', '0,25'); await page.mouse.move(1350, 860); await shot('centro-fermentadores-coste-0-25-euros-hora');
  await L.guardar(page);
  // 3) revalorización
  await L.abrir(page, BASE, 'stock_account.stock_valuation_layer_action', '1');
  await shot('incidencia-valoracion-de-barriles-inflada');
  for (const [ref, val, slug] of REV) {
    const h = page.locator('.o_group_header', { hasText: ref }).first();
    if (!(await h.locator('button[name=action_revaluation]').count())) { await h.click(); await page.waitForTimeout(1000); }
    await page.locator('.o_group_header', { hasText: ref }).first().locator('button[name=action_revaluation]').click();
    await page.waitForSelector('.modal .o_field_widget[name=added_value]'); await page.waitForTimeout(800);
    const m = page.locator('.modal');
    await L.campo(page, 'added_value', val, m);
    await L.campo(page, 'reason', 'Corrección del coste de fabricación: las órdenes de trabajo se crearon con la capacidad antigua del centro (10 ciclos de cocción y 3 de fermentación) y con 1,50 €/h en fermentadores', m);
    await L.m2o(page, 'account_id', '712000', m, '712000');
    await page.locator('.modal .modal-title').click(); await page.waitForTimeout(600);
    await shot('revalorizacion-' + slug);
    await m.locator('.modal-footer button', { hasText: 'Revalorizar' }).click(); await L.esperar(page, 2000);
  }
  await page.reload(); await page.waitForSelector('.o_list_view'); await L.esperar(page, 2000);
  await shot('valoracion-de-barriles-corregida');
  log(JSON.stringify(await call('stock.quant', 'search_read', [[['product_id.default_code', 'like', 'PT-']]], { fields: ['product_id', 'quantity', 'value'] })));
  log(JSON.stringify(await call('account.move', 'search_read', [[['ref', 'ilike', 'revalor']]], { fields: ['name', 'ref', 'amount_total', 'state'] })));
};
