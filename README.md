# eBill Factoring — Pruebas E2E

Proyecto independiente con las pruebas Cypress de eBill Factoring.
No requiere tener el frontend corriendo localmente: todos los endpoints de la API
están mockeados mediante fixtures JSON.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Ejecutar pruebas

### Contra `localhost:8080` (dev server del frontend corriendo localmente)

```bash
npm run cy:open   # abre la interfaz gráfica de Cypress
npm run cy:run    # ejecuta todas las pruebas en modo headless
```

> El frontend debe estar corriendo en `http://localhost:8080`. Desde el repo
> del frontend: `npm run dev`.

### Contra los entornos remotos (sin frontend local)

| Entorno | Comando |
|---|---|
| Desarrollo (Azure Static) | `npm run cy:run:dev` |
| QA / Testing | `npm run cy:run` |

> En entornos remotos las pruebas usan intercepts para mockear la API, por lo que
> no se realizan llamadas reales al backend.

## Estructura

```
cypress/
  e2e/                  # Specs organizados por módulo
    auth/
    dashboard/
    facturas/
    negociaciones/
    vinculaciones/
  fixtures/             # Respuestas JSON mockeadas de la API
    auth/
    dashboard/
    facturas/
    negociaciones/
    convenios/
    cufe/
    shared/
  support/
    commands.ts         # Comandos personalizados (visitDashboard, loginUI, etc.)
    intercepts.ts       # Router central de mocks — un intercept por test
    e2e.ts              # Setup global (limpia localStorage antes de cada test)
cypress.config.ts       # Configuración principal de Cypress
```

## Variables de entorno para tests de login real

Los tests de autenticación usan credenciales configuradas en `cypress.config.ts`:

```bash
CYPRESS_TEST_IDENTIFIER=+573176699440
CYPRESS_TEST_PASSWORD=TestPassword123!
```

Para sobreescribirlas sin tocar el config:

```bash
CYPRESS_TEST_IDENTIFIER=otro@email.com CYPRESS_TEST_PASSWORD=OtraClave npm run cy:run
```

## Agregar una prueba nueva

1. Crear el spec en `cypress/e2e/<modulo>/nombre.cy.ts`
2. Usar los comandos de navegación disponibles en `commands.ts`:
   - `cy.visitDashboard()`
   - `cy.visitFacturas()`
   - `cy.visitNegociaciones()`
   - `cy.visitCufe()`
   - `cy.visitVinculaciones()`
   - `cy.loginUI(identifier, password)`
3. Si la prueba necesita datos distintos, agregar o modificar fixtures en `cypress/fixtures/`
   y registrar la ruta en `cypress/support/intercepts.ts`.
