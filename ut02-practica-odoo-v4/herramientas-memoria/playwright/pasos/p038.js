const L = require('./lib');
const LOTES = {
  1: [['Malta Pale Ale', 'MD261116-PAL'], ['Malta Pilsen', 'MD261116-PIL'], ['Malta Caramelo', 'MD261109-CAR'], ['Malta de trigo', 'MD261112-TRI'], ['Malta tostada', 'MD261105-TOS']],
  2: [['Lúpulo Cascade', 'LL-2026-CAS-041'], ['Lúpulo Saaz', 'LL-2026-SAA-017'], ['Lúpulo Fuggle', 'LL-2026-FUG-009']],
  3: [['Levadura US-05', 'LI-US05-26K19'], ['Levadura W-34/70', 'LI-W3470-26K12'], ['Levadura WB-06', 'LI-WB06-26J28'], ['Levadura S-04', 'LI-S04-26K02']],
  4: [],
};
const SLUG = { 1: 'maltas-del-duero', 2: 'lupulos-de-leon', 3: 'levaduras-ibericas', 4: 'envases-del-henares' };
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'stock.action_picking_tree_all', '1');
  await shot('traslados-recepciones-pendientes');
  for (const id of [1, 2, 3, 4]) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.picking&id=' + id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page, 2000);
    const nombre = (await page.locator('.o_form_view .oe_title, .o_form_view h1').first().innerText()).trim().replace(/\W+/g, '-').toLowerCase();
    await page.mouse.move(1350, 860); await shot('recepcion-' + nombre + '-' + SLUG[id] + '-pendiente');
    let k = 0;
    for (const [p, lote] of LOTES[id]) {
      await page.locator('.o_field_widget[name=move_ids_without_package] .o_data_row', { hasText: p }).first().locator('button[name="Open Move"]').click();
      await page.waitForSelector('.modal .o_data_row'); await page.waitForTimeout(800);
      const c = page.locator('.modal .o_data_row').first().locator('td[name=lot_name]'); await c.click(); await page.waitForTimeout(300);
      await c.locator('input').fill(lote); await page.waitForTimeout(300);
      await page.locator('.modal-header').click(); await page.waitForTimeout(500);
      if (k === 0) await shot('recepcion-' + SLUG[id] + '-lote-' + lote.toLowerCase());
      await page.locator('.modal-footer button', { hasText: 'Guardar' }).click(); await page.waitForTimeout(1200);
      k++;
    }
    await page.mouse.move(1350, 860); await shot('recepcion-' + SLUG[id] + '-con-lotes-antes-de-validar');
    await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Validar\s*$/ }).first().click(); await L.esperar(page, 2500);
    if (await page.locator('.modal').count()) { await shot('recepcion-' + SLUG[id] + '-aviso-al-validar'); log('MODAL ' + await page.locator('.modal').innerText()); }
    await page.mouse.move(1350, 860); await shot('recepcion-' + SLUG[id] + '-validada');
  }
  log(JSON.stringify(await call('stock.picking', 'search_read', [[['picking_type_code', '=', 'incoming']]], { fields: ['name', 'state'] })));
  log(JSON.stringify(await call('stock.lot', 'search_read', [[]], { fields: ['name', 'product_id', 'product_qty', 'expiration_date', 'alert_date'] })));
  log(JSON.stringify(await call('stock.quant', 'search_read', [[['location_id.usage', '=', 'internal']]], { fields: ['product_id', 'location_id', 'quantity', 'lot_id', 'value'] })));
};
