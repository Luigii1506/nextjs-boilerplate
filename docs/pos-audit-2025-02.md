# POS Technical & Product Audit (2025-02)

## 1. Executive Summary
- **Fortalezas actuales**: arquitectura feature-first bien separada, stores Zustand preparados para React 19, capa de servicio/mappers que aislan Prisma, documentación técnica base.
- **Dolencias críticas**: validaciones incompletas (`CreatePOSTransactionSchema`), server actions con `any` y logging en caliente, queries sin invalidación global, bugs latentes (`usePOSData` usa `session.user.id`), ausencia de tests automáticos.
- **Brecha funcional vs. POS profesional**: solo se cubre el flujo básico de venta; faltan RBAC, devoluciones, manejo de clientes, reportes robustos, integraciones de pago, modo offline y soporte multi-sucursal.
- **Prioridad inmediata**: endurecer transacciones y sesiones, limpiar logging, tipar server actions y cubrir con pruebas end-to-end el flujo completo POS.

---

## 2. Technical Findings

### 2.1 Critical bugs
- `usePOSData` referencia `session.user.id` (no existe) → crash en dashboard (`src/features/pos/hooks/usePOSData.ts:40`).
- `CreatePOSTransactionSchema` no exige totales ni items; tras el parse, server action dependía de campos eliminados.
- `voidTransactionAction` persiste en `referenceNumber` (columna inexistente) y no incluye `tax` por item (`src/features/pos/payment/server/actions.ts:340+`).
- `sale/server/queries.ts` suma `Number(item.subtotal)` aunque `CartItem` no dispone de ese campo.

### 2.2 Refactors prioritarios
- Tipar `ActionResult<T>` en server actions (elimina `any`).
- Sustituir `console.log` / emojis por logger estructurado con niveles (`info`, `warn`, `error`).
- Extraer invalidación TanStack Query fuera de los stores (crear hooks específicos).
- Actualizar README/doc para reflejar stores en `*/state/`.

### 2.3 Cleanliness & Patterns
- Mantener stores delgados; mover concatenación de responsabilidades (auth/queryClient) a hooks.
- Refactorizar `processPaymentAction` para que delegue en un use-case/service y la server action solo reciba input + llame al caso de uso.
- Homogeneizar naming: `PaymentStoreFacade` vs `usePaymentStoreFacade` vs legacy `usePayment`.

### 2.4 Testing & QA
- No hay unit ni e2e específicos para POS.  
  - Crear suites: `sale/store`, `payment/server/actions`, `session/validation`.  
  - Playwright: “abrir sesión → agregar producto → pagar → ver historial”.

### 2.5 Observability
- Carece de logs estructurados, métricas, tracing. Se recomienda integración con OpenTelemetry + dashboards (éxitos/fallos por método de pago, tiempos de respuesta, sesiones abiertas sin cierre).

---

## 3. Functional Gap Analysis vs. POS profesionales

| Funcionalidad | Estado actual | Gap |
| --- | --- | --- |
| Apertura/cierre caja | Parcial | Falta conciliación completo (arqueo parcial, cashdrawer, multi-turno). |
| Roles/Permisos | Ausente | No hay RBAC; cualquier usuario puede cerrar sesión o void. |
| Ventas/Devoluciones | Parcial | Venta OK; void/reembolso sin UI ni políticas. Sin notas de crédito. |
| Tickets/Facturas/Impuestos | Básico | IVA fijo; sin propinas, exenciones, facturación electrónica. |
| Catálogo/Variantes | Limitado | Sin variantes ni bundles, solo SKU plano. |
| Pagos | Parcial | Cash/Card/Transfer definidas, sin gateway real ni conciliación terminal. |
| CRM/Clientes | Ausente | No se guardan clientes ni historial. |
| Reportes Financieros | Básico | Totales simples; falta breakdown por método, impuestos, export contable. |
| Turnos/Sesiones | Parcial | Control básico; no soporta múltiples cajeros simultáneos. |
| Funciones extra | Ausente | Sin modo offline, sin hardware (impresoras, escáner), sin multi-sucursal. |

---

## 4. MVP vs Full POS Roadmap

### MVP (obligatorio)
- Sesiones robustas con conciliación de efectivo.
- Ventas con impuestos correctos y métodos de pago (cash/card/transfer).
- Reportes diarios con breakdown.
- RBAC mínimo (cajero/admin).
- Test unitario + e2e de flujo completo.

### Profesional (recomendado)
- Devoluciones parciales, notas de crédito.
- CRM básico (clientes, historial, loyalty).
- Descuentos/promociones avanzadas.
- Dashboard multi-sucursal, modo offline, impresora tickets.
- Integración con pasarela (Stripe Terminal / Square).

### Premium (opcional)
- Integraciones contables (QuickBooks, Xero), fiscalidad local.
- Analytics avanzados / BI.
- Event sourcing / auditoría profunda.
- Marketplace de extensiones, multi-sucursal con roles por ubicación.

---

## 5. Action Plan

### Sprint 1 – Hardening (2-3 semanas)
1. Corregir `usePOSData`, `CreatePOSTransactionSchema`, `voidTransactionAction`.
2. Introducir logger estructurado y eliminar logs debug.
3. Tipar `ActionResult<T>` y Prisma payloads (usar tipos generados).
4. Tests unitarios para `sale` y `payment`, e2e Playwright.
5. Actualizar documentación (README, docs).

### Sprint 2 – POS 0.9 (4-6 semanas)
1. RBAC (admin/manager/cashier) + permisos en server actions.
2. Reportes diarios y exportación (CSV/PDF).
3. UI/servicios para void/refund con validaciones supervisor.
4. Sistema de descuentos/promo codes.
5. Módulo clientes + asignación venta.

### Sprint 3 – POS 1.0 profesional (8-12 semanas)
1. Multi-sucursal: `locationId` en entidades, switch UI.
2. Integración Stripe Terminal / pasarela local.
3. Soporte hardware (impresora tickets, scanner).
4. Modo offline con IndexedDB + sync.
5. Observabilidad (OTEL + dashboards).

### Sprint 4 – Enterprise
1. Integraciones contables/ERP, loyalty, analytics.
2. Event sourcing / cola de eventos.
3. Portal multi-sucursal con reporting consolidado.

---

## 6. Detailed Backlog (en progreso)

- [ ] Fix `usePOSData` (usar `user.id`) y añadir manejo de errores.
- [ ] Actualizar `CreatePOSTransactionSchema` con totales + items requeridos.
- [ ] Refactor `processPaymentAction`: separar validación, mapping, persistencia.
- [ ] Tipar `ActionResult` y reemplazar `any` en server actions.
- [ ] Eliminar logs debug (emojis) de server actions / contextos.
- [ ] Añadir suites Jest (sale/payment/session) + Playwright.
- [ ] Implementar invalidadores centralizados TanStack Query.
- [ ] Integrar RBAC y proteger server actions.
- [ ] Módulo de devoluciones/void con UI.
- [ ] Reportes: ventas por método, impuestos, exportables.
- [ ] CRM básico (clientes + historial).
- [ ] Modo offline + hardware + multi-sucursal (etapa avanzada).

---

## 7. Architecture & Scalability Recommendations

- **Multi-sucursal**: agregar `locationId` a sesiones, transacciones, productos; TenantContext + scoping en queries.
- **Seguridad**: RBAC con `next-auth` + middlewares; doble confirmación supervisor para void/refund.
- **CQRS/Event Bus**: considerar publicar eventos (`SaleCompleted`, `SessionClosed`) a una cola para auditoría y reporting near-real-time.
- **Integraciones**: Stripe Terminal/Square para pagos; Avalara/TaxJar para impuestos; QuickBooks/Xero para contabilidad.
- **Observabilidad**: OpenTelemetry, logs estructurados y alertas (ventas fallidas, sesiones sin cerrar).
- **Base de código**: pattern “usecase + action” para separar orquestación de lógica.

---

## 8. Industry Standards Checklist

**Obligatorio:**  
- Control caja, ventas con impuestos, RBAC, reportes diarios, soporte hardware básico, test & QA automatizados.

**Recomendado:**  
- CRM, devoluciones/void completos, multi-sucursal, integraciones pago, descuentos/promo codes.

**Opcional/Premium:**  
- Loyalty, modo offline, analytics avanzados, event sourcing, marketplace integraciones.

---

## 9. Recursos & Referencias
- Stripe Terminal Docs: https://stripe.com/terminal  
- Square POS API: https://developer.squareup.com  
- Avalara / TaxJar para cálculos impuestos.  
- OpenTelemetry (observabilidad): https://opentelemetry.io/  
- Libro “Designing Data-Intensive Applications” (para CQRS/Event sourcing).

---

_Prepared: 2025-02 - POS Audit Report_
