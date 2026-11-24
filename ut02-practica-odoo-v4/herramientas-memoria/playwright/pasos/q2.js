module.exports = async ({ page, log }) => {
  log(await page.evaluate(() => [...document.querySelectorAll('input[type=submit],button')].map(b => `${b.tagName}|${b.type}|${b.value||b.innerText}|vis=${!!b.offsetParent}|form=${b.form&&b.form.action}`).join('\n')));
};
