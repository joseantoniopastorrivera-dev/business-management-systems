const L = require('./lib');
const REC = [[8, 'valdecuevas', [['Crianza', 'Añada 2022'], ['Verdejo', 'Añada 2025']]], [9, 'senorio-del-oja', [['Reserva', 'Añada 2020']]]];
module.exports = async ({ page, shot, log, call, BASE }) => {
  for (const [id, slug, lots] of REC) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.picking&id=' + id + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page, 2000);
    await page.mouse.move(1350, 860); await shot('bodega-recepcion-vino-' + slug + '-pendiente');
    let k = 0;
    for (const [p, lote] of lots) {
      await page.locator('.o_field_widget[name=move_ids_without_package] .o_data_row', { hasText: p }).first().locator('button[name="Open Move"]').click();
      await page.waitForSelector('.modal .o_data_row'); await page.waitForTimeout(800);
      const c = page.locator('.modal .o_data_row').first().locator('td[name=lot_name]'); await c.click(); await c.locator('input').fill(lote);
      await page.locator('.modal-header').click(); await page.waitForTimeout(500);
      if (k === 0) await shot('bodega-recepcion-' + slug + '-lote-' + lote.toLowerCase().replace(/\W+/g, '-').replace('ñ', 'n'));
      await page.locator('.modal-footer button', { hasText: 'Guardar' }).click(); await page.waitForTimeout(1000); k++;
    }
    await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Validar\s*$/ }).first().click(); await L.esperar(page, 2500);
    if (await page.locator('.modal').count()) { log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 300)); await page.locator('.modal-footer button', { hasText: /Deshabilitar SMS|Aplicar|Confirmar/ }).first().click(); await L.esperar(page, 2500); }
    await page.mouse.move(1350, 860); await shot('bodega-recepcion-vino-' + slug + '-validada');
  }
  // traslado bodega → tránsito → bar
  for (const [id, slug] of [[5, 'bod-out-00001-salida-de-la-bodega'], [6, 'bar-in-00001-entrada-en-el-bar']]) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.picking&id=' + id + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page, 2000);
    const btn = page.locator('.o_form_statusbar button:visible', { hasText: /Comprobar disponibilidad/ }); if (await btn.count()) { await btn.first().click(); await L.esperar(page, 1500); }
    await page.mouse.move(1350, 860); await shot('traslado-' + slug + '-reservado');
    await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Validar\s*$/ }).first().click(); await L.esperar(page, 2500);
    if (await page.locator('.modal').count()) { log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 300)); await shot('traslado-' + slug + '-aviso'); await page.locator('.modal-footer button', { hasText: /Deshabilitar SMS|Aplicar|Confirmar/ }).first().click(); await L.esperar(page, 2500); }
    await page.mouse.move(1350, 860); await shot('traslado-' + slug + '-validado');
  }
  log(JSON.stringify(await call('stock.picking', 'search_read', [[['company_id', '=', 2]]], { fields: ['name', 'state'] })));
  log(JSON.stringify(await call('stock.quant', 'search_read', [[['company_id', '=', 2], ['location_id.usage', 'in', ['internal', 'transit']]]], { fields: ['product_id', 'location_id', 'quantity', 'lot_id'] })));
};
