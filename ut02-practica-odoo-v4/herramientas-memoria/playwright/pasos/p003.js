module.exports = async ({ page, shot, log, BASE }) => {
  await page.goto(BASE + '/web/login?db=cerveceria', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#login');
  await page.fill('#login', 'admin');
  log(await page.locator('body').innerText());
  await shot('login-bd-cerveceria');
  await page.focus('#password');
};
