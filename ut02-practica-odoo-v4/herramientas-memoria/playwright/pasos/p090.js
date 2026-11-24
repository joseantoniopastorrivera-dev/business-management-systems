const L = require('./lib');
module.exports = async ({ page, shot, log, BASE }) => {
  await L.abrir(page, BASE, 'hr_attendance.action_hr_attendance_settings', '1', '.o_setting_container');
  const f = page.locator('.o_field_widget[name=attendance_kiosk_url]').first();
  await f.scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
  const antes = (await f.innerText()).split('\n')[0].trim();
  await page.mouse.move(1350, 860); await shot('seguridad-url-del-quiosco-antigua-visible-en-las-capturas');
  await page.locator('button, a', { hasText: /Generar una nueva URL/i }).first().click(); await L.esperar(page, 2500);
  if (await page.locator('.modal').count()) { log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 300)); await page.locator('.modal-footer button').first().click(); await L.esperar(page, 2500); }
  await page.locator('.o_field_widget[name=attendance_kiosk_url]').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
  const despues = (await page.locator('.o_field_widget[name=attendance_kiosk_url]').first().innerText()).split('\n')[0].trim();
  log('cambiada=' + (antes !== despues && despues.length > 20));
  await page.evaluate(() => { const e = document.querySelector('.o_field_widget[name=attendance_kiosk_url]'); if (e) e.style.filter = 'blur(7px)'; });
  await page.mouse.move(1350, 860); await shot('seguridad-url-del-quiosco-regenerada-y-oculta');
  await page.evaluate(() => { const e = document.querySelector('.o_field_widget[name=attendance_kiosk_url]'); if (e) e.style.filter = ''; });
};
