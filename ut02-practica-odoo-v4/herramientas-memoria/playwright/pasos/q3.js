module.exports = async ({ call, log }) => {
  log(JSON.stringify(await call('ir.module.module', 'search_read', [[['name', 'in', ['stock','purchase','mrp','sale_management','hr','hr_attendance','hr_holidays','hr_recruitment','hr_contract','product_expiry','stock_landed_costs','hr_skills','mrp_account']]]], { fields: ['name','shortdesc'], context: { lang: 'es_ES' } })));
};
