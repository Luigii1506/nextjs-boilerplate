# Storefront TODO

Este documento resume pendientes tras la migración a Zustand para carrito y checkout.

## QA y verificación
- [ ] Recorrer flujo invitado → login y confirmar merge de carrito sin duplicados.
- [ ] Validar checkout completo (pago guardado + tarjeta nueva) en entorno de pruebas Stripe.
- [ ] Confirmar que `CartDebugPanel` se activa solo en `NODE_ENV=development` y refleja el nuevo store.

## Refactor y limpieza adicionales
- [ ] Revisar `CartSummary` para exponer breakdown real (precio/calculo) usando selectores del store, eliminando props dummy.
- [ ] Completar manejadores faltantes en `ShippingAddressSection` para crear/editar direcciones (actualmente TODO).
- [ ] Extraer estilos y componentes compartidos (badges, spinners) en `/shared/ui` para reducir duplicaciones en checkout.
- [ ] Revisar documentación en `docs/` (Quick Reference, Architecture) para alinear con stores Zustand.

## Observabilidad / métricas
- [ ] Instrumentar logs (eventos) para tiempos de carga de carrito y confirmación de pedido.
- [ ] Añadir métricas básicas (por ejemplo, contador de merges invitado→usuario) si se dispone de analytics.

