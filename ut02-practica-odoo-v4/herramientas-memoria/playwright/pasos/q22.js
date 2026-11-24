const L = require('./lib');
module.exports = async ({ page, log, BASE }) => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=purchase.order&id=1&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
  log('BTN=' + await page.locator('.o_form_statusbar .o_statusbar_buttons').innerText());
};
