const L = require('./lib');
const H = [['Epifanía del Señor', '06/01'], ['Jueves Santo', '02/04'], ['Viernes Santo', '03/04'], ['Fiesta del Trabajo', '01/05'], ['Fiesta de la Comunidad de Madrid', '02/05'], ['Santos Niños Justo y Pastor (fiesta local de Alcalá)', '06/08'], ['Asunción de la Virgen', '15/08'], ['Fiesta local de Alcalá de Henares', '09/10'], ['Fiesta Nacional de España', '12/10'], ['Lunes siguiente a Todos los Santos', '02/11'], ['Lunes siguiente al Día de la Constitución', '07/12'], ['Inmaculada Concepción', '08/12'], ['Natividad del Señor', '25/12']];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.locator('.o_list_button_discard:visible').first().click().catch(() => {}); await page.waitForTimeout(800);
  for (const [n, d] of H) {
    await page.locator('.o_control_panel button:visible', { hasText: /^\s*Nuevo\s*$/ }).first().click(); await page.waitForTimeout(900);
    await page.keyboard.type(n, { delay: 5 });
    await page.keyboard.press('Tab'); await page.keyboard.press('Control+A'); await page.keyboard.type(d + '/2026 00:00:00'); 
    await page.keyboard.press('Tab'); await page.keyboard.press('Control+A'); await page.keyboard.type(d + '/2026 23:59:59');
    await page.keyboard.press('Tab'); await page.waitForTimeout(400);
    await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page, 900);
  }
  await page.mouse.move(1350, 860); await shot('festivos-2026-alcala-de-henares');
  const r = await call('resource.calendar.leaves', 'search_read', [[['resource_id', '=', false]]], { fields: ['name', 'date_from', 'date_to'] });
  log(r.length + ' ' + JSON.stringify(r.map(x => x.date_from.slice(0, 10) + ' ' + x.date_to.slice(0, 10) + ' ' + x.name)));
};
