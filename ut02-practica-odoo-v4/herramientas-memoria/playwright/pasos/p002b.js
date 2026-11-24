module.exports = async ({ page, shot, log }) => {
  const btn = page.locator('input[type=submit][value=Continue]:visible, button:visible:has-text("Continue")').first();
  log('n=' + await btn.count());
  await btn.click();
  await page.waitForTimeout(3000);
  await shot('creando-bd-cerveceria');
  await page.waitForURL(u => !String(u).includes('/database/'), { timeout: 600000 });
  await page.waitForSelector('.o_main_navbar', { timeout: 300000 });
  await page.waitForTimeout(3000);
  await shot('cerveceria-pantalla-inicial-tras-crear');
};
