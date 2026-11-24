// Gestor de bases de datos: lista inicial y formulario de la BD nueva relleno (sin contraseñas)
module.exports = async ({ page, shot, log, BASE }) => {
  await page.goto(BASE + '/web/database/manager', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_database_list', { timeout: 60000 });
  log(await page.locator('.o_database_list').innerText());
  await shot('gestor-bd-antes-de-crear-cerveceria');
  await page.locator('button', { hasText: 'Create Database' }).first().click();
  await page.waitForSelector('#dbname', { state: 'visible' });
  await page.waitForTimeout(800);
  await shot('gestor-bd-formulario-crear-vacio');
  await page.fill('#dbname', 'cerveceria');
  await page.fill('#login', 'admin');
  await page.selectOption('#lang', 'es_ES');
  await page.selectOption('#country', { label: 'Spain' }).catch(async () => page.selectOption('#country', 'es'));
  const demo = page.locator('#load_demo_checkbox');
  if (await demo.isChecked()) await demo.uncheck();
  log('campos=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.modal.show input, .modal.show select')].map(e => [e.id || e.name, e.type, e.type === 'password' ? '(vacío=' + !e.value + ')' : (e.type === 'checkbox' ? e.checked : e.value)]))));
  await page.locator('#master_pwd').first().focus().catch(() => {});
  await shot('gestor-bd-formulario-cerveceria-relleno-sin-contrasenas');
};
