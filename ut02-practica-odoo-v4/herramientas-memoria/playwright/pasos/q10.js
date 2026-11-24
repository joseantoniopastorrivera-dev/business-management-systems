module.exports = async ({ call, log }) => {
  log(JSON.stringify(await call('ir.sequence', 'search_read', [['|', ['prefix', 'like', 'WH/'], ['prefix', 'like', 'La ta']]], { fields: ['name', 'prefix', 'company_id', 'number_next_actual'] })));
  log(JSON.stringify(await call('ir.sequence', 'search_read', [['|', '|', ['prefix', 'like', 'BAR/'], ['prefix', 'like', 'BOD/'], ['prefix', 'like', 'FAB/']]], { fields: ['name', 'prefix'] })));
  log(JSON.stringify(await call('stock.picking.type', 'search_read', [[]], { fields: ['name', 'sequence_code', 'warehouse_id', 'sequence_id'] })));
};
