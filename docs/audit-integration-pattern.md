# Audit Integration Pattern (POS Example)

> Objetivo: capturar eventos críticos de cada módulo reutilizando la infraestructura de `AuditEvent`, manteniendo los efectos laterales fuera de los use-cases principales.

## 1. Actualizar el catálogo global

Ruta: `src/features/audit/constants.ts`

- Agrega acciones y recursos del nuevo dominio en `AUDIT_ACTIONS`/`AUDIT_RESOURCES`.
- Define `AUDIT_ACTION_LABELS`, `AUDIT_ACTION_COLORS`, `AUDIT_RESOURCE_LABELS`, `AUDIT_RESOURCE_COLORS` para que UI/tables se actualicen automáticamente.
- Si requieren severidades específicas usa `AUDIT_SEVERITIES`.

> **Tip**: las validaciones (`auditValidators.validateCreateAuditEvent`) leen estos catálogos. Si omites un valor, las inserciones arrojarán `ValidationError`.

## 2. Exponer helpers de auditoría por dominio

Ejemplo POS: `src/features/pos/audit/posAudit.service.ts`

1. Resuelve `userRole` con `getUserById` (útil cuando la acción viene desde session/pago).
2. Prepara un `context` (`userId`, `userRole`, `ipAddress`, `userAgent`) y métadatos de negocio.
3. Usa `AuditService.createAuditEvent` para escribir el evento.

```ts
await recordPOSAuditEvent(context, {
  action: "open_register",
  resource: "pos_session",
  resourceId: session.id,
  description: `Caja abierta con $${session.initialCash.toFixed(2)}`,
  severity: "medium",
  metadata: { /* payload dominio */ },
  changes: [
    { field: "status", oldValue: "CLOSED", newValue: "OPEN" },
  ],
});
```

### Buenas prácticas

- **Metadata JSON-friendly**: evita `Date` sin serializar, usa `toISOString` si necesitas exactitud.
- **changes**: `type` es opcional (el servicio calcula `added/modified/removed`).
- **Logs durante desarrollo**: `console.log` o `logger.*` ayudan a detectar problemas si el evento no aparece.

## 3. Propagar contexto desde las server actions

Para Next.js 15, `headers()` es asíncrono:

```ts
const resolveRequestContext = async () => {
  const headerList = await headers();
  return {
    ipAddress: headerList.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? headerList.get("x-real-ip") ?? undefined,
    userAgent: headerList.get("user-agent") ?? undefined,
  };
};
```

Llama al helper en cada acción/handler relevante pasando ese contexto.

```ts
const requestContext = await resolveRequestContext();
await auditSessionClosed({ session, totals, context: requestContext });
```

## 4. Mantener los use-cases limpios

- Los use-cases ejecutan la lógica principal (crear/cerrar sesión, procesar pago).
- Después del `await` del repositorio, invocan el helper de auditoría.
- En caso de error en la auditoría, registra un warning y permite que la operación principal continúe (decisión subjetiva). Si la auditoría debe ser crítica, propaga la excepción para que el flujo falle.

## 5. UI/Toasts

- Los helpers sólo escriben en base de datos; no disparan UI. Si quieres notificar al usuario del fallo de auditoría, captura la excepción en la server action, devuélvela en el `ActionResult` y deja que el store/hook muestre el toast.
- Sigue el patrón POS: estado principal se mantiene, pero `logger.error` y `console.error` (durante debug) dejan rastro.

## 6. Checklist al integrar un nuevo módulo

1. [ ] Extender `AUDIT_ACTIONS`/`AUDIT_RESOURCES` y labels correspondiente.
2. [ ] Crear archivo `feature/audit/<feature>Audit.service.ts` con helpers.
3. [ ] Reutilizar `AuditService` y validar `userRole`.
4. [ ] Recolectar contexto (`headers`) en server actions y pasarlo al helper.
5. [ ] Añadir metadatos y `changes` significativos para reportes.
6. [ ] Probar manualmente (verificar tabla `audit_events`) o usar seed tests.

Con este patrón los módulos sólo necesitan importar su helper y mantener la infraestructura centralizada sin duplicar lógica de validación ni escritura. Cuando sea necesario agregar más acciones o columnas, el ajuste en `audit/constants.ts` se propaga inmediatamente a todo el sistema.*** End Patch
