const L = require('./lib');
module.exports = async ({ page, log, call, BASE }) => {
  await L.abrir(page, BASE, 'hr_attendance.hr_attendance_action', '1', '.o_list_view');
  { const x = page.locator('.o_searchview_facet .o_facet_remove'); while (await x.count()) { await x.first().click(); await L.esperar(page); } }
  await page.reload(); await page.waitForSelector('.o_list_view'); await L.esperar(page, 2000);
  { const x = page.locator('.o_searchview_facet .o_facet_remove'); while (await x.count()) { await x.first().click(); await L.esperar(page); } }
  log(await page.locator('.o_list_view tbody').innerText());
  await page.mouse.move(1350, 860);
  await page.screenshot({ path: 'C:/dev/Sistemas-Gestion-Empresarial/ut02-practica-odoo-v4/capturas/504-asistencias-del-23-11-con-horas-extra.png' });
};
