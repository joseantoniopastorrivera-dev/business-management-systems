const L = require('./lib');
const fecha = async (page, name, v, sc) => { const d = (sc || page).locator(`.o_field_widget[name=${name}] input`).first(); await d.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v); await page.keyboard.press('Enter'); await page.waitForTimeout(800); };
module.exports = async ({ page, shot, log, call, BASE }) => {
  for (const [emp, tipo, ini, fin, desc, slug] of [['Marta Sanz', 'Ausencia pagada', '21/12/2026', '23/12/2026', 'Vacaciones de Navidad', 'vacaciones-marta-sanz'], ['Javier Navarro', 'enfermedad', '25/11/2026', '25/11/2026', 'Baja médica de un día (justificante del centro de salud)', 'baja-javier-navarro']]) {
    await L.abrir(page, BASE, 'hr.open_view_employee_list_my', '1', '.o_kanban_view, .o_list_view');
    await page.locator('.o_kanban_record', { hasText: emp }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await page.locator('.o_form_view button.oe_stat_button', { hasText: 'Ausencias' }).first().click(); await L.esperar(page, 2000);
    await L.nuevo(page);
    await page.waitForSelector('.modal .o_field_widget[name=holiday_status_id], .o_form_view .o_field_widget[name=holiday_status_id]');
    const sc = (await page.locator('.modal').count()) ? page.locator('.modal') : page;
    const h = sc.locator('.o_field_widget[name=holiday_status_id] input'); await h.click(); await h.fill(''); await page.keyboard.press('Backspace'); await page.waitForTimeout(1800);
    log('tipos=' + JSON.stringify(await page.locator('.o-autocomplete--dropdown-item').allInnerTexts()));
    await page.locator('.o-autocomplete--dropdown-item', { hasText: new RegExp(tipo, 'i') }).first().click(); await page.waitForTimeout(800);
    for (const [n, v] of [[0, ini], [1, fin]]) { const d = sc.locator('.o_field_widget[name=request_date_from] input').nth(n); await d.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v); await page.keyboard.press('Enter'); await page.waitForTimeout(900); }
    await sc.locator('.modal-title, .o_form_sheet').first().click().catch(() => {}); await page.waitForTimeout(600);
    await L.campo(page, 'name', desc, sc);
    await page.mouse.move(1350, 860); await shot('solicitud-' + slug);
    if (await page.locator('.modal').count()) { log('MB=' + await page.locator('.modal-footer').innerText()); await page.locator('.modal-footer button').first().click(); await L.esperar(page, 2500); }
    else await L.guardar(page);
    log(JSON.stringify(await call('hr.leave', 'search_read', [[['employee_id.name', 'ilike', emp]]], { fields: ['id', 'state', 'number_of_days'] })));
  }
};
