// Cap. 8 · V-4 Margen por cerveza: Contabilidad → Contabilidad analítica → Apuntes analíticos, en tabla dinámica con
// filas por cuenta del plan «Cervezas» y columnas por categoría (factura, factura de proveedor, OF, otros = nómina).
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  await L.abrir(page, BASE, 'analytic.account_analytic_line_action_entries', '1', '.o_list_view, .o_pivot_view, .o_graph_view');
  const piv = page.locator('.o_switch_view.o_pivot'); if (await piv.count()) { await piv.click(); await page.waitForSelector('.o_pivot table'); await L.esperar(page); }
  const t = page.locator('.o_pivot table').first();
  const agrupar = async (cab, texto) => {
    // una cabecera abierta se pliega con un clic; una plegada abre el menú de agrupación
    if ((await cab.getAttribute('class')).includes('opened')) { await cab.click(); await L.esperar(page, 400); }
    await cab.click(); await L.esperar(page, 500);
    const it = page.locator('.dropdown-item:visible', { hasText: new RegExp('^\\s*' + texto + '\\s*$') }).first();
    if (await it.count()) { await it.click(); await L.esperar(page); return true; }
    // grupo personalizado
    const sel = page.locator('.o-dropdown--menu select:visible').first();
    if (await sel.count()) { await sel.selectOption({ label: texto }); await L.esperar(page); return true; }
    await page.keyboard.press('Escape'); return false;
  };
  // filas: Cervezas
  const filas = t.locator('tbody tr').first().locator('th').first();
  if (!(await t.innerText()).includes('Barril de Navidad')) log('filas', await agrupar(filas, 'Cervezas'));
  // columnas: Categoría
  const col = t.locator('thead th.o_pivot_header_cell_closed, thead th.o_pivot_header_cell_opened').first();
  if (!(await t.innerText()).includes('Factura')) log('cols', await agrupar(col, 'Categoría'));
  log(await t.innerText());
  await shot('cierre-14-margen-por-cerveza', { zona: t, borrador: 'Apuntes analíticos por cerveza y categoría' });
};
