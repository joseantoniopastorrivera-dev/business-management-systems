const L = require('./lib');
module.exports = async ({ page, log, call, BASE }) => {
  await L.abrir(page, BASE, 'hr_recruitment.action_hr_job', '1', '.o_kanban_view, .o_list_view');
  log('JOBS=' + (await page.locator('.o_kanban_renderer, .o_list_view').first().innerText()).slice(0, 600));
  await L.abrir(page, BASE, 'hr_recruitment.crm_case_categ0_act_job', '1', '.o_kanban_view, .o_list_view');
  await L.nuevo(page).catch(e => log('nuevo ' + e.message));
  log('F=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_form_view .o_field_widget[name]')].map(e => e.getAttribute('name')))));
  log('SB=' + await page.locator('.o_form_statusbar').innerText().catch(() => ''));
  log(JSON.stringify(await call('hr.recruitment.stage', 'search_read', [[]], { fields: ['name', 'hired_stage'], context: { lang: 'es_ES' } })));
};
