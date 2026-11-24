const L = require('./lib');
module.exports = async ({ page, shot, BASE }) => {
  await L.abrir(page, BASE, 'hr_attendance.hr_attendance_action', '1', '.o_list_view');
  { const x = page.locator('.o_searchview_facet .o_facet_remove'); while (await x.count()) { await x.first().click(); await L.esperar(page); } }
  await page.mouse.move(1350, 860); await shot('asistencias-con-horas-extra-javier-1-5-h');
};
