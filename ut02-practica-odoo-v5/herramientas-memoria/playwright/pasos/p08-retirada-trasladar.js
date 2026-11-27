// Cap. 4 · Los 7 barriles del lote que quedan en la cámara fría pasan a FAB/Cuarentena con «Trasladar» (Odoo 17).
async function filtrarLote(page, BASE, L) {
  await L.abrir(page, BASE, 'stock.dashboard_open_quants', '1');
  const g = page.locator('.o_searchview_facet', { hasText: 'Ubicación' }).locator('.o_facet_remove');
  if (await g.count()) { await g.click(); await L.esperar(page); }
  const sv = page.locator('.o_searchview_input'); await sv.fill('STO-261123-01'); await L.esperar(page, 600);
  await page.locator('.o_searchview_autocomplete li', { hasText: 'Número de lote' }).first().click(); await L.esperar(page);
}
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const enCamara = await call('stock.quant', 'search_count', [[['lot_id.name', '=', 'STO-261123-01'], ['location_id.name', '=', 'Cámara fría'], ['quantity', '>', 0]]]);
  await filtrarLote(page, BASE, L);
  if (enCamara) {
    await page.locator('.o_data_row', { hasText: 'Cámara fría' }).first().locator('.o_list_record_selector input').check({ force: true }); await L.esperar(page, 400);
    await shot('retirada-04-existencias-del-lote', { zona: ['.o_control_panel', '.o_list_renderer table'], foco: '.o_control_panel button:visible:has-text("Trasladar")', borrador: 'Existencias del lote seleccionadas y botón Trasladar' });
    await page.locator('.o_control_panel button:visible', { hasText: 'Trasladar' }).click();
    const modal = page.locator('.modal-content').first(); await modal.waitFor(); await L.esperar(page);
    log('campos asistente', (await modal.locator('.o_field_widget[name]').evaluateAll(es => es.map(e => e.getAttribute('name')))).join(','));
    await L.m2o(page, 'dest_location_id', 'Cuarentena', modal, 'FAB/Cuarentena');
    const msg = modal.locator('.o_field_widget[name=message] textarea, .o_field_widget[name=message] input').first();
    if (await msg.count()) await msg.fill('Retirada del lote STO-261123-01: barriles apartados hasta su destrucción');
    await shot('retirada-05-asistente-trasladar', { zona: modal, borrador: 'Asistente Trasladar a FAB/Cuarentena' });
    await page.locator('.modal button:visible', { hasText: 'Confirmar' }).first().click(); await L.esperar(page, 1200);
    await filtrarLote(page, BASE, L);
  }
  await shot('retirada-06-lote-en-cuarentena', { zona: '.o_list_renderer table', borrador: 'Los 7 barriles ya en FAB/Cuarentena' });
  log(JSON.stringify(await call('stock.quant', 'search_read', [[['lot_id.name', '=', 'STO-261123-01'], ['quantity', '!=', 0]]], { fields: ['location_id', 'quantity', 'company_id'], context: { allowed_company_ids: [1, 2] } })));
};
