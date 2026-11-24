module.exports = async ({ page, log }) => {
  log('F=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_setting_container .o_field_widget[name]')].filter(e => e.closest('[data-key=hr_attendance], .app_settings_block[data-key="hr_attendance"]') || true).map(e => e.getAttribute('name') + '=' + ((e.querySelector('input,select') || {}).value || '')).filter(x => /attendance|overtime|kiosk/.test(x)))));
};
