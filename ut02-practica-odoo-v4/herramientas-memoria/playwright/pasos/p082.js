const L = require('./lib');
module.exports = async ({ page, ctx, shot, log, call, BASE }) => {
  await page.locator('.o_field_widget[name=attendance_kiosk_mode] select').selectOption('"manual"'); await page.waitForTimeout(600);
  await L.check(page, 'attendance_kiosk_use_pin', false);
  await L.check(page, 'hr_attendance_overtime', true); await page.waitForTimeout(800);
  await page.locator('.o_field_widget[name=hr_attendance_overtime]').scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  await shot('ajustes-asistencias-quiosco-seleccion-manual-y-horas-extra');
  await L.guardarAjustes(page);
  const url = await page.locator('.o_field_widget[name=attendance_kiosk_url]').innerText().catch(() => '');
  log('url=' + url);
  // Quiosco en otra pestaña
  const k = await ctx.newPage(); await k.setViewportSize({ width: 1440, height: 900 });
  await k.goto(url.trim() || (BASE + '/hr_attendance/kiosk_mode_menu'), { waitUntil: 'domcontentloaded' }); await k.waitForTimeout(4000);
  await shot('quiosco-de-asistencias-pantalla-inicial', { page: k });
  const b = k.locator('button, a', { hasText: /Identificarse manualmente|Identificación manual|manualmente/i }).first(); if (await b.count()) { await b.click(); await k.waitForTimeout(2000); }
  await shot('quiosco-lista-de-empleados', { page: k });
  await k.locator('.o_hr_attendance_kiosk_mode .card, .o_kanban_record, .o_employee_card, button, div', { hasText: /^\s*Daniel Ortega Ruiz\s*$/ }).last().click(); await k.waitForTimeout(3000);
  await shot('quiosco-daniel-ortega-entrada-control-nocturno-fermentadores', { page: k });
  log('K=' + (await k.locator('body').innerText()).slice(0, 400));
  await k.close();
  log(JSON.stringify(await call('hr.attendance', 'search_read', [[]], { fields: ['employee_id', 'check_in', 'check_out'] })));
};
