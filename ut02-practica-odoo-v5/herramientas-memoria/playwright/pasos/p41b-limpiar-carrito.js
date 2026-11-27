// Cap. 6 · Limpieza: S00002 es el carrito abandonado del primer intento de compra (antes de elegir la BD en la URL el
// invitado no llegó a pagar). Se cancela con una nota; P00009 y P00014 son solicitudes de presupuesto que generaron
// las reglas de reabastecimiento (OP/…) de malta y barriles PET al bajar el stock: se dejan en borrador para el cierre.
module.exports = async ({ call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const [s] = await call('sale.order', 'read', [[2], ['state']], C);
  if (s.state !== 'cancel') {
    await call('sale.order', 'message_post', [[2]], { body: 'Carrito abandonado del primer intento de compra en la tienda (sin pago). Se cancela.', ...C });
    log(JSON.stringify(await call('sale.order', 'action_cancel', [[2]], C)));
  }
  log(JSON.stringify(await call('sale.order', 'read', [[2], ['name', 'state']], C)));
};
