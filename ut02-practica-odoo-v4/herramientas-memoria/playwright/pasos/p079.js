const L = require('./lib');
module.exports = async ({ page, shot, log, call }) => {
  await page.locator('.modal-footer button:visible', { hasText: 'Guardar y cerrar' }).last().click(); await L.esperar(page, 2500);
  await page.mouse.move(1350, 860); await shot('tablero-ausencias-marta-vacaciones-a-aprobar');
  log(JSON.stringify(await call('hr.leave', 'search_read', [[]], { fields: ['employee_id', 'request_date_from', 'request_date_to', 'number_of_days', 'state', 'name'] })));
};
