// Cap. 8 · La factura de suministros se creó por la API sin plazo de pago y Odoo puso de vencimiento la fecha de
// creación (27/11), anterior a la de la factura (30/11). Se pasa a borrador, se pone el plazo «30 días» y se vuelve a publicar.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const [f] = await call('account.move', 'search_read', [[['ref', '=', 'EH-2026-11-0457']]], { fields: ['id', 'invoice_date_due'], ...C });
  if (f.invoice_date_due !== '2026-12-30') {
    const [pt] = await call('account.payment.term', 'search_read', [[['name', 'in', ['30 días', '30 Days']]]], { fields: ['id'], ...C });
    await call('account.move', 'button_draft', [[f.id]], C);
    await call('account.move', 'write', [[f.id], pt ? { invoice_payment_term_id: pt.id } : { invoice_date_due: '2026-12-30' }], C);
    await call('account.move', 'action_post', [[f.id]], C);
  }
  await page.goto(BASE + '/web?r=' + Date.now() + `#model=account.move&id=${f.id}&view_type=form&cids=1`); await page.waitForSelector('.o_form_view'); await L.esperar(page, 1200);
  await shot('cierre-12-factura-suministros', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Factura de luz y agua con reparto analítico' });
  await page.locator('.o_notebook .nav-link', { hasText: 'Apuntes contables' }).first().click(); await L.esperar(page, 600);
  await shot('cierre-13-apuntes-suministros', { zona: '.o_notebook', borrador: 'Apuntes: 628, 472 y 410' });
  log(JSON.stringify(await call('account.move', 'read', [[f.id], ['name', 'invoice_date', 'invoice_date_due', 'state']], C)));
};
