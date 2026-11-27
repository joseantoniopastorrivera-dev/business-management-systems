// Cap. 5 · TPV de la taberna: instalar Punto de venta (con la taberna como compañía activa).
module.exports = async (ctx) => {
  const { page, shot, BASE, L, call, log } = ctx;
  if ((await L.ok(call, 'point_of_sale')) !== 'installed') {
    await L.abrir(page, BASE, 'base.open_module_tree', '2');
    await L.instalar(ctx, 'Punto de venta', 'Punto de venta', 'tpv-01-instalar-punto-de-venta', 'todas');
  }
  for (const m of ['point_of_sale', 'pos_mrp', 'pos_sale', 'pos_epson_printer']) log(m, await L.ok(call, m).catch(() => '-'));
  log('configs', JSON.stringify(await call('pos.config', 'search_read', [[]], { fields: ['name', 'company_id', 'picking_type_id', 'payment_method_ids'], context: { allowed_company_ids: [1, 2] } })));
  log('métodos', JSON.stringify(await call('pos.payment.method', 'search_read', [[]], { fields: ['name', 'company_id', 'journal_id', 'is_cash_count'], context: { allowed_company_ids: [1, 2] } })));
};
