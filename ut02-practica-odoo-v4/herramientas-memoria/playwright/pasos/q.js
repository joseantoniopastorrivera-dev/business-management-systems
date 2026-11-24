module.exports = async ({ page, ctx, log }) => {
  for (const p of ctx.pages()) log('TAB ' + p.url());
  log(await page.evaluate(() => document.title + ' | ' + document.body.innerText.slice(0, 400)));
  await page.screenshot({ path: __dirname + '/../q.png' });
};
