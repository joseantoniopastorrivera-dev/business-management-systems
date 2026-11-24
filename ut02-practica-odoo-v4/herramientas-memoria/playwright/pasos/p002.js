// Comprueba que las contraseñas están escritas (sin leerlas), captura y crea la BD
module.exports = async ({ page, shot, log }) => {
  const st = await page.evaluate(() => ({ m: !!document.querySelector('.modal.show [name=master_pwd]').value, p: !!document.querySelector('.modal.show [name=password]').value, db: document.querySelector('.modal.show [name=name], .modal.show #dbname').value, l: document.querySelector('.modal.show [name=login]').value, d: document.querySelector('.modal.show #load_demo_checkbox').checked }));
  log(JSON.stringify(st));
  if (!st.m || !st.p) throw new Error('faltan contraseñas');
  // asegurar que se ven como puntos
  await page.evaluate(() => { document.querySelector('.modal.show [name=master_pwd]').type = 'password'; document.querySelector('.modal.show [name=password]').type = 'password'; });
  await shot('gestor-bd-formulario-cerveceria-con-contrasenas-ocultas');
  await page.locator('.modal.show button[type=submit], .modal.show input[type=submit]').first().click();
  await page.waitForTimeout(3000);
  await shot('creando-bd-cerveceria');
  await page.waitForURL(/\/(web|odoo)(\?|#|$)/, { timeout: 600000 });
  await page.waitForSelector('.o_main_navbar, .o_home_menu, .o_apps', { timeout: 300000 });
  await page.waitForTimeout(3000);
  await shot('cerveceria-pantalla-inicial-tras-crear');
};
