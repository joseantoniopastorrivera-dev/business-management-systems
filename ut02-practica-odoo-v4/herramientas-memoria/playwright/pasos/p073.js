const L = require('./lib');
const H = [['Año Nuevo', '01/01'], ['Epifanía del Señor', '06/01'], ['Jueves Santo', '02/04'], ['Viernes Santo', '03/04'], ['Fiesta del Trabajo', '01/05'], ['Fiesta de la Comunidad de Madrid', '02/05'], ['Santos Niños Justo y Pastor (fiesta local de Alcalá)', '06/08'], ['Asunción de la Virgen', '15/08'], ['Fiesta local de Alcalá de Henares', '09/10'], ['Fiesta Nacional de España', '12/10'], ['Lunes siguiente a Todos los Santos', '02/11'], ['Lunes siguiente al Día de la Constitución', '07/12'], ['Inmaculada Concepción', '08/12'], ['Natividad del Señor', '25/12']];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.locator('.o_list_button_discard:visible').first().click().catch(() => {}); await page.waitForTimeout(800);
  await shot('festivos-publicos-vacio');
  let k = 0;
  for (const [n, d] of H) {
    await page.locator('.o_control_panel button:visible', { hasText: /^\s*Nuevo\s*$/ }).first().click(); await page.waitForTimeout(900);
    const r = page.locator('.o_data_row.o_selected_row');
    await r.locator('td[name=name] input').fill(n);
    for (const [f, v] of [['date_from', d + '/2026 00:00:00'], ['date_to', d + '/2026 23:59:59']]) { const c = r.locator(`td[name=${f}] input`); await c.click(); await c.fill(v); await page.keyboard.press('Enter'); await page.waitForTimeout(300); }
    if (k === 0) { await page.mouse.move(1350, 860); await shot('festivo-ano-nuevo-editando'); }
    await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page, 900); k++;
  }
  await page.mouse.move(1350, 860); await shot('festivos-2026-alcala-de-henares');
  log(JSON.stringify(await call('resource.calendar.leaves', 'search_read', [[['resource_id', '=', false]]], { fields: ['name', 'date_from', 'date_to', 'company_id'] })).slice(0, 800));
};
