// Cap. 3 · Plan analítico «Cervezas» y una cuenta analítica por cerveza (fábrica).
const CUENTAS = [
  ['Llamarada Moe IPA', 'IPA'], ['Springfield Lager', 'LAG'],
  ['Springfield Stout', 'STO'], ['Trigo de Shelbyville', 'TRI'],
];
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  // 1) plan
  const hay = await call('account.analytic.plan', 'search_count', [[['name', '=', 'Cervezas']]]);
  if (!hay) {
    await L.abrir(page, BASE, 'analytic.account_analytic_plan_action', '1');
    await L.nuevo(page);
    await L.campo(page, 'name', 'Cervezas');
    await L.guardar(page);
    await shot('analitica-02-plan-cervezas', { zona: '.o_form_sheet', borrador: 'Plan analítico Cervezas' });
  }
  // 2) cuentas
  for (const [i, [nombre, codigo]] of CUENTAS.entries()) {
    if (await call('account.analytic.account', 'search_count', [[['code', '=', codigo]]])) continue;
    await L.abrir(page, BASE, 'analytic.action_account_analytic_account_form', '1');
    await L.nuevo(page);
    await L.campo(page, 'name', nombre);
    await L.campo(page, 'code', codigo);
    await L.m2o(page, 'plan_id', 'Cervezas');
    const cia = await L.widget(page, 'company_id').locator('input').inputValue().catch(() => '');
    if (!cia.includes('Springfield')) await L.m2o(page, 'company_id', 'Cervecería artesana');
    if (i === 0) await shot('analitica-03-cuenta-ipa', { zona: '.o_form_sheet', foco: ['.o_field_widget[name=code]', '.o_field_widget[name=plan_id]'], borrador: 'Cuenta analítica de la IPA' });
    await L.guardar(page);
  }
  await L.abrir(page, BASE, 'analytic.action_account_analytic_account_form', '1');
  await shot('analitica-04-cuentas-por-cerveza', { zona: '.o_list_renderer table', borrador: 'Las cuatro cuentas analíticas' });
  log(JSON.stringify(await call('account.analytic.account', 'search_read', [[]], { fields: ['name', 'code', 'plan_id', 'company_id'] })));
};
