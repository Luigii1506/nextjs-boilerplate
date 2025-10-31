# POS Unit Testing Setup

## Stack
- **Vitest**: test runner (`npm run test:vitest`, `npm run test:vitest:watch`).
- **@testing-library/react**: render hooks/components (`renderHook`).
- **TanStack Query**: wrapped via `tests/utils/renderHookWithQueryClient.tsx`.

## Utilities
- `tests/utils/mockPrisma.ts`: shared Prisma client mock (actions stubbed).
- `tests/utils/posFactories.ts`: factories for sessions, sale payloads, transaction results.
- `tests/utils/renderHookWithQueryClient.tsx`: helper to test hooks relying on `QueryClient`.

## Coverage Map (POS)
- **Use-cases**: `session.use-cases.test.ts`, `processPayment.use-case.test.ts`.
- **Server actions**: `session/server/__tests__/actions.test.ts`.
- **Stores**: `session/state/__tests__/session.store.test.ts`, `sale/state/__tests__/sale.store.test.ts`.
- **Hooks**: `hooks/__tests__/usePOSInvalidations.test.ts`.

## Run tests
```bash
npm run test:vitest        # ejecutar una vez
npm run test:vitest:watch  # modo watch
```

## Añadir nuevos tests
1. Crear fixtures con `tests/utils/posFactories` en lugar de duplicarlos.
2. Mockear dependencias (`openSessionAction`, `prisma`, `useQueryClient`) con `vi.mock`.
3. Para hooks, usar `renderHookWithQueryClient` y espiar helpers (`vi.spyOn(queryKeysModule, ...)`).
4. Asegurar reset de Zustand stores (`useXStore.setState(initialState, true)`).

`vitest.config.ts` usa **jsdom** para permitir pruebas de hooks y configura coverage en `coverage/vitest`.
