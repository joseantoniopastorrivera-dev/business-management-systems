const L = require('./lib');
const tz = async (page) => { const s = page.locator('.o_field_widget[name=tz] select'); await s.selectOption('"Europe/Madrid"').catch(async () => s.selectOption({ label: 'Europe/Madrid' })); await page.waitForTimeout(500); };
module.exports = async ({ page, shot, log, call, BASE }) => {
  // Usuario administrador: zona horaria
  await page.goto(BASE + '/web?r=' + Date.now() + '#action=base.action_res_users&model=res.users&id=2&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view .o_notebook'); await L.esperar(page, 1500);
  await page.locator('.o_notebook .nav-link', { hasText: 'Preferencias' }).click(); await page.waitForTimeout(600);
  await page.mouse.move(1350, 860); await shot('incidencia-usuario-admin-zona-horaria-europe-berlin');
  await tz(page); await page.mouse.move(1350, 860); await shot('usuario-admin-zona-horaria-europe-madrid');
  await L.guardar(page);
  // Horarios estándar de las dos empresas
  await page.goto(BASE + '/web?debug=1&r=' + Date.now() + '#action=resource.action_resource_calendar_form&cids=1-2', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_list_view'); await L.esperar(page);
  for (const n of ['Standard 40 hours/week', 'Estándar de 40 horas a la semana']) {
    await page.locator('.o_data_row', { hasText: n }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await tz(page); await L.guardar(page);
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  // horario sobrante creado al abrir un formulario nuevo
  await page.locator('.o_data_row', { hasText: 'Horas laborables de Cervecería' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await page.locator('.o_cp_action_menus button').first().click(); await page.waitForTimeout(600);
  await page.locator('.dropdown-item', { hasText: 'Archivar' }).first().click(); await page.waitForTimeout(800);
  await page.locator('.modal-footer button', { hasText: /Archivar|Aceptar|Ok/ }).first().click(); await L.esperar(page, 1500);
  await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  await shot('horarios-de-trabajo-en-europe-madrid');
  log(JSON.stringify(await call('resource.calendar', 'search_read', [['|', ['active', '=', true], ['active', '=', false]]], { fields: ['name', 'tz', 'active'] })));
  log(JSON.stringify(await call('res.users', 'read', [[2], ['tz']])));
};
