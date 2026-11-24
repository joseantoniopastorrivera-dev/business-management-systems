const L = require('./lib');
const MOS = [[5, 'llamarada-moe-ipa'], [6, 'springfield-lager'], [7, 'springfield-stout'], [8, 'trigo-de-shelbyville']];
module.exports = async ({ page, shot, log, call, BASE }) => {
  for (const [id, slug] of MOS) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=mrp.production&id=' + id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
    if (id === 5) {
      await page.locator('.o_notebook .nav-link', { hasText: 'Órdenes de trabajo' }).click(); await page.waitForTimeout(700);
      await page.mouse.move(1350, 860); await shot('incidencia-of-ipa-duraciones-con-la-capacidad-antigua');
      await page.locator('.o_control_panel button, .oe_stat_button', { hasText: 'Vista general' }).first().click(); await L.esperar(page, 3000);
      await shot('incidencia-of-ipa-vista-general-coste-382-euros-por-barril');
      await page.locator('.o_breadcrumb a').last().click().catch(() => {}); await page.goBack().catch(() => {}); await L.esperar(page, 2000);
      await page.goto(BASE + '/web?r=' + Date.now() + '#model=mrp.production&id=5&view_type=form&cids=1', { waitUntil: 'domcontentloaded' }); await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
    }
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Desmontar' }).first().click(); await page.waitForSelector('.modal'); await page.waitForTimeout(1200);
    await shot('desmontar-of-' + slug + '-asistente');
    await page.locator('.modal-footer button', { hasText: 'Desmontar' }).click(); await L.esperar(page, 3000);
    if (await page.locator('.modal').count()) { await shot('desmontar-of-' + slug + '-aviso'); log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 600)); break; }
    await page.mouse.move(1350, 860); await shot('desmontar-of-' + slug + '-hecho');
  }
  log(JSON.stringify(await call('mrp.unbuild', 'search_read', [[]], { fields: ['name', 'product_id', 'product_qty', 'lot_id', 'state', 'mo_id'] })));
  log(JSON.stringify(await call('stock.quant', 'search_read', [[['location_id.usage', '=', 'internal']]], { fields: ['product_id', 'location_id', 'quantity', 'lot_id', 'value'] })));
};
