module.exports = async ({ call, log }) => {
  const m = await call('stock.move', 'search_read', [[['raw_material_production_id', '=', 5]]], { fields: ['product_id', 'product_uom_qty', 'quantity', 'picked', 'state', 'move_line_ids'] });
  log(JSON.stringify(m));
  log(JSON.stringify(await call('stock.move.line', 'search_read', [[['move_id', 'in', m.map(x => x.id)]]], { fields: ['product_id', 'lot_id', 'quantity', 'picked', 'location_id'] })));
  log(JSON.stringify(await call('mrp.workorder', 'search_read', [[['production_id', '=', 5]]], { fields: ['name', 'workcenter_id', 'duration_expected', 'date_start', 'date_finished'] })));
};
