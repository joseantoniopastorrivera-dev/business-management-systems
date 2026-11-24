module.exports = async ({ page, log }) => {
  log('URL ' + page.url());
  log('F=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_form_view .o_field_widget[name], .modal .o_field_widget[name]')].map(e => e.getAttribute('name') + '=' + ((e.querySelector('input,select') || {}).value || '').slice(0, 30)))));
  await page.screenshot({ path: __dirname + '/q29.png' });
};
