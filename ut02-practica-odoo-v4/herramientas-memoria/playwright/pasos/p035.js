const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  // Evidencia: OF con prefijo WH
  await L.abrir(page, BASE, 'mrp.mrp_production_action', '1');
  await page.locator('.o_cp_switch_buttons button, .o_switch_view').filter({ has: page.locator('.oi-view-list, .fa-list-ul') }).first().click().catch(() => {}); await L.esperar(page);
  await shot('incidencia-ordenes-de-fabricacion-con-prefijo-wh');
  // Secuencias
  await page.goto(BASE + '/web?debug=1&r=' + Date.now() + '#action=base.ir_sequence_form&cids=1-2', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_list_view'); await L.esperar(page, 1500);
  await page.locator('.o_searchview_input').fill('Secuencia de'); await page.keyboard.press('Enter'); await L.esperar(page);
  await shot('secuencias-con-prefijos-wh-y-la-ta');
  const fix = [['My Company Secuencia de producción', 'FAB/MO/', 'Fábrica de Alcalá Secuencia de producción'], ['My Company Secuencia de picking antes de fabricación', 'FAB/PC/', 'Fábrica de Alcalá Secuencia de picking antes de fabricación'], ['My Company Secuencia de stock después de fabricación', 'FAB/SFP/', 'Fábrica de Alcalá Secuencia de stock después de fabricación'],
    ['La taberna de Moe, S.L. Secuencia de producción', 'BAR/MO/', 'Bar de la taberna Secuencia de producción'], ['La taberna de Moe, S.L. Secuencia de picking antes de fabricación', 'BAR/PC/', 'Bar de la taberna Secuencia de picking antes de fabricación'], ['La taberna de Moe, S.L. Secuencia de stock después de fabricación', 'BAR/SFP/', 'Bar de la taberna Secuencia de stock después de fabricación']];
  let k = 0;
  for (const [viejo, pref, nuevo] of fix) {
    await page.locator('.o_data_row', { hasText: viejo }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    if (k === 0) await shot('secuencia-produccion-wh-mo-antes');
    await L.campo(page, 'name', nuevo); await L.campo(page, 'prefix', pref);
    if (k === 0) { await page.mouse.move(1350, 860); await shot('secuencia-produccion-fab-mo-corregida'); }
    await L.guardar(page);
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
    k++;
  }
  await shot('secuencias-corregidas-fab-y-bar');
  log(JSON.stringify(await call('ir.sequence', 'search_read', [['|', ['prefix', 'like', 'WH/'], ['prefix', 'like', 'La ta']]], { fields: ['name', 'prefix'] })));
};
