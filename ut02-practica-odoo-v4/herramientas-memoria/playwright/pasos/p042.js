const L = require('./lib');
const MOS = [[5, 'IPA-261123-01', 'llamarada-moe-ipa', true], [6, 'LAG-261123-01', 'springfield-lager', false], [7, 'STO-261123-01', 'springfield-stout', false], [8, 'TRI-261123-01', 'trigo-de-shelbyville', false]];
module.exports = async ({ page, shot, log, call, BASE }) => {
  for (const [id, lote, slug, detalle] of MOS) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=mrp.production&id=' + id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page, 2000);
    await page.mouse.move(1350, 860); await shot('of-' + slug + '-componentes-disponibles');
    await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Planificar\s*$/ }).first().click(); await L.esperar(page, 2000);
    await page.locator('.o_notebook .nav-link', { hasText: 'Órdenes de trabajo' }).click(); await page.waitForTimeout(800);
    await page.mouse.move(1350, 860); await shot('of-' + slug + '-planificada-ordenes-de-trabajo');
    // lote del producto terminado
    const inp = page.locator('.o_field_widget[name=lot_producing_id] input'); await inp.click(); await inp.type(lote, { delay: 40 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: 'Crear' }).first().click(); await page.waitForTimeout(1200);
    if (await page.locator('.modal').count()) { await page.locator('.modal-footer button').first().click(); await page.waitForTimeout(800); }
    await page.locator('.o_notebook .nav-link', { hasText: 'Componentes' }).click(); await page.waitForTimeout(600);
    await page.mouse.move(1350, 860); await shot('of-' + slug + '-lote-' + lote.toLowerCase() + '-asignado');
    if (detalle) { await page.locator('.o_notebook .nav-link', { hasText: 'Subproductos' }).click(); await page.waitForTimeout(600); await page.mouse.move(1350, 860); await shot('of-' + slug + '-subproducto-bagazo-previsto'); }
    await page.locator('.o_form_statusbar button:visible', { hasText: /Producir todo/ }).first().click(); await L.esperar(page, 3000);
    if (await page.locator('.modal').count()) { await shot('of-' + slug + '-aviso-al-producir'); log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 400)); await page.locator('.modal-footer button').first().click(); await L.esperar(page, 3000); }
    await page.locator('.o_notebook .nav-link', { hasText: 'Componentes' }).click(); await page.waitForTimeout(600);
    await page.mouse.move(1350, 860); await shot('of-' + slug + '-hecha');
    if (detalle) {
      await page.locator('.o_notebook .nav-link', { hasText: 'Órdenes de trabajo' }).click(); await page.waitForTimeout(700); await page.mouse.move(1350, 860); await shot('of-' + slug + '-ordenes-de-trabajo-terminadas');
      await page.locator('.o_notebook .nav-link', { hasText: 'Subproductos' }).click(); await page.waitForTimeout(600); await page.mouse.move(1350, 860); await shot('of-' + slug + '-bagazo-producido');
    }
  }
  log(JSON.stringify(await call('mrp.production', 'search_read', [[['id', 'in', [5, 6, 7, 8]]]], { fields: ['name', 'state', 'lot_producing_id', 'date_finished'] })));
  log(JSON.stringify(await call('stock.lot', 'search_read', [[['name', 'like', '-261123-01']]], { fields: ['name', 'product_qty', 'expiration_date', 'use_date', 'removal_date', 'alert_date'] })));
  log(JSON.stringify(await call('stock.quant', 'search_read', [[['location_id.usage', '=', 'internal'], ['product_id.categ_id.name', 'in', ['Cerveza en barril', 'Subproductos']]]], { fields: ['product_id', 'location_id', 'quantity', 'lot_id', 'value'] })));
};
