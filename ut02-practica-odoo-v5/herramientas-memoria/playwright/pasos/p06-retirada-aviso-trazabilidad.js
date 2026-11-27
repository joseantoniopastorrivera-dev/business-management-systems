// Cap. 4 · Retirada del lote STO-261123-01: aviso de la taberna (nota en el lote) y trazabilidad hacia delante.
const AVISO = 'Aviso de La taberna de Moe (24/11/2026, 18:30): los dos barriles de Springfield Stout del lote STO-261123-01 salen turbios y con sabor ácido. Sospecha de contaminación bacteriana. Se abre la retirada del lote completo: se aparta lo que queda en fábrica y se pide la devolución de lo entregado.';
module.exports = async ({ page, shot, BASE, L, call }) => {
  const [lote] = await call('stock.lot', 'search_read', [[['name', '=', 'STO-261123-01'], ['company_id', '=', 1]]], { fields: ['id'] });
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.lot&id=' + lote.id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page);
  const ya = await call('mail.message', 'search_count', [[['model', '=', 'stock.lot'], ['res_id', '=', lote.id], ['body', 'ilike', 'turbios']]]);
  const msg = ya ? page.locator('.o-mail-Message', { hasText: 'turbios' }).first() : await L.nota(page, AVISO);
  await shot('retirada-01-aviso-en-el-lote', { zona: ['.o_form_sheet .oe_title', msg], completa: true, borrador: 'Lote STO con la nota del aviso de la taberna' });
  await page.locator('.oe_stat_button', { hasText: 'Trazabilidad' }).first().click(); await L.esperar(page, 1200);
  await shot('retirada-02-trazabilidad-del-lote', { zona: '.o_stock_reports_table', completa: true, borrador: 'Trazabilidad del lote STO: desecho, entrega a la taberna y OF' });
};
