// Recaptura (sin cambiar datos): RINV/2026/00001 cancelada, con la nota que explica por qué.
module.exports = async ({ page, shot, BASE, L, call }) => {
  const [m] = await call('account.move', 'search_read', [[['name', '=', 'RINV/2026/00001']]], { fields: ['id'] });
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=account.move&id=' + m.id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 1200);
  const msg = page.locator('.o-mail-Message', { hasText: 'Anulada antes de enviarla' }).first();
  await msg.scrollIntoViewIfNeeded(); await L.esperar(page, 400);
  await shot('retirada-15-rectificativa-erronea-cancelada', { zona: msg, borrador: 'Nota de anulación en RINV/2026/00001' });
  await page.evaluate(() => window.scrollTo(0, 0)); await page.locator('.o_content').evaluate(e => e.scrollTo(0, 0)).catch(() => {});
  await L.esperar(page, 400);
  await shot('retirada-15b-rectificativa-erronea-estado', { zona: ['.o_form_statusbar', '.o_form_sheet .oe_title'], borrador: 'Estado Cancelado' });
};
