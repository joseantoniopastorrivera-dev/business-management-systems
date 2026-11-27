// Cap. 5 · Control de mermas: unidades vendidas por producto en las dos sesiones (Informes → Pedidos, tabla dinámica).
// La vista por defecto ya agrupa por producto y trae «Cantidad de producto»: basta con abrirla en modo tabla.
// Los litros se calculan en la memoria (pinta 0,5 L, caña 0,2 L) y se comparan con los 30 L de cada barril pinchado.
module.exports = async ({ page, shot, BASE, L, log }) => {
  await L.abrir(page, BASE, 'point_of_sale.action_report_pos_order_all', '2', '.o_pivot_view, .o_graph_view');
  const piv = page.locator('.o_switch_view.o_pivot');
  if (await piv.count()) { await piv.click(); await page.waitForSelector('.o_pivot table'); await L.esperar(page); }
  // Si las filas no salen por producto, se reagrupan: clic en «Total» (pliega) y otra vez (menú de agrupación) → Producto.
  const t = page.locator('.o_pivot table').first();
  if (!(await t.innerText()).includes('BAR-PIN')) {
    const tot = t.locator('tbody tr').first().locator('th').first();
    await tot.click(); await L.esperar(page, 400);
    await tot.click(); await L.esperar(page, 400);
    await page.locator('.dropdown-item:visible', { hasText: /^s*Productos*$/ }).first().click(); await L.esperar(page);
  }
  log(await page.locator('.o_pivot table').first().innerText());
  await shot('tpv-35-unidades-vendidas-por-producto', { zona: page.locator('.o_pivot table').first(), borrador: 'Unidades vendidas por producto en las dos sesiones' });
};
