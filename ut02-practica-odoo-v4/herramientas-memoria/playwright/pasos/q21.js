module.exports = async ({ page, log }) => {
  await page.locator('.o_group_header', { hasText: 'PT-IPA-30' }).first().locator('button[name=action_revaluation]').click();
  await page.waitForSelector('.modal'); await page.waitForTimeout(1200);
  log('F=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.modal .o_field_widget[name]')].map(e => e.getAttribute('name') + '=' + ((e.querySelector('input,select') || {}).value || e.innerText)))));
  log('BTN=' + await page.locator('.modal-footer').innerText());
  await page.screenshot({ path: __dirname + '/q21.png' });
  await page.locator('.modal-footer button', { hasText: 'Descartar' }).click();
};
