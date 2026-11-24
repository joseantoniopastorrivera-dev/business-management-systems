module.exports = async ({ page, shot, BASE }) => {
  await page.goto(BASE + '/web/login?db=cerveceria', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(2000);
  await shot('incidencia-sesion-cerrada-tras-abrir-el-quiosco');
  const l = page.locator('#login'); if (await l.count()) { await l.fill('admin'); await page.focus('#password'); }
};
