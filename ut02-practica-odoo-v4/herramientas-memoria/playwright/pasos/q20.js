module.exports = async ({ page, log }) => {
  const g = page.locator('.o_group_header', { hasText: 'PT-IPA-30' }).first();
  await g.click(); await page.waitForTimeout(1200);
  log('HDR=' + (await page.locator('.o_group_header', { hasText: 'PT-IPA-30' }).first().innerHTML()).slice(0, 2000));
  await page.screenshot({ path: __dirname + '/q20.png' });
};
