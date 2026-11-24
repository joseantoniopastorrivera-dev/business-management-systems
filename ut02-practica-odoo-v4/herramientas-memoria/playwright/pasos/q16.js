module.exports = async ({ call, log }) => {
  log(JSON.stringify(await call('mrp.workorder', 'search_read', [[['production_id', 'in', [5, 6]]]], { fields: ['production_id', 'name', 'duration_expected', 'duration', 'costs_hour', 'state'] })));
  log(JSON.stringify(await call('mrp.production', 'read', [[5], ['extra_cost', 'move_finished_ids']])));
  const m = await call('stock.move', 'search_read', [[['production_id', '=', 5]]], { fields: ['product_id', 'price_unit', 'cost_share', 'quantity'] });
  log(JSON.stringify(m));
  log(JSON.stringify(await call('stock.valuation.layer', 'search_read', [[['product_id.default_code', 'in', ['PT-IPA-30', 'SP-BAGAZO']]]], { fields: ['product_id', 'quantity', 'unit_cost', 'value', 'description'] })));
};
