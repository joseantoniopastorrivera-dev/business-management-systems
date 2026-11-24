const L = require('./lib');
const MOS = [[5, 'llamarada-moe-ipa', true], [6, 'springfield-lager', false], [7, 'springfield-stout', false], [8, 'trigo-de-shelbyville', false]];
module.exports = async ({ page, shot, log, call, BASE }) => {
  for (const [id, slug, detalle] of MOS) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=mrp.production&id=' + id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page, 2000);
    log('BTN ' + await page.locator('.o_form_statusbar .o_statusbar_buttons').innerText());
    await page.locator('.o_form_statusbar button:visible', { hasText: /Desprogramar|Anular planificación|Anular la planificación/ }).first().click(); await L.esperar(page, 2000);
    await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Planificar\s*$/ }).first().click(); await L.esperar(page, 2000);
    await page.locator('.o_notebook .nav-link', { hasText: 'Órdenes de trabajo' }).click(); await page.waitForTimeout(800);
    await page.mouse.move(1350, 860); await shot('of-' + slug + '-replanificada-con-capacidad-real');
    await page.locator('.o_notebook .nav-link', { hasText: 'Componentes' }).click(); await page.waitForTimeout(600);
    const filas = page.locator('.o_notebook .tab-pane.active .o_data_row');
    const n = await filas.count();
    for (let i = 0; i < n; i++) { const c = filas.nth(i).locator('td[name=picked] input[type=checkbox]'); if (await c.count() && !(await c.isChecked())) { await c.click({ force: true }); await page.waitForTimeout(500); } }
    await page.mouse.move(1350, 860); await shot('of-' + slug + '-componentes-consumidos-con-sus-lotes');
    await page.locator('.o_form_statusbar button:visible', { hasText: /Producir todo|Marcar como hecho/ }).first().click(); await L.esperar(page, 3000);
    if (await page.locator('.modal').count()) { await shot('of-' + slug + '-aviso-al-producir'); log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 500)); await page.locator('.modal-footer button').first().click(); await L.esperar(page, 3000); }
    await page.mouse.move(1350, 860); await shot('of-' + slug + '-hecha');
    if (detalle) {
      await page.locator('.o_notebook .nav-link', { hasText: 'Órdenes de trabajo' }).click(); await page.waitForTimeout(700); await page.mouse.move(1350, 860); await shot('of-' + slug + '-ordenes-de-trabajo-terminadas');
      await page.locator('.o_notebook .nav-link', { hasText: 'Subproductos' }).click(); await page.waitForTimeout(600); await page.mouse.move(1350, 860); await shot('of-' + slug + '-bagazo-producido');
    }
  }
  log(JSON.stringify(await call('mrp.production', 'search_read', [[['id', 'in', [5, 6, 7, 8]]]], { fields: ['name', 'state', 'lot_producing_id', 'date_start', 'date_finished'] })));
  log(JSON.stringify(await call('stock.quant', 'search_read', [[['location_id.usage', '=', 'internal'], ['product_id.categ_id.name', 'in', ['Cerveza en barril', 'Subproductos']]]], { fields: ['product_id', 'location_id', 'quantity', 'lot_id', 'value'] })));
};
