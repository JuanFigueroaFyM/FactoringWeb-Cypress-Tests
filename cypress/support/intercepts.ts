/**
 * intercepts.ts — Router centralizado de mocks
 *
 * Patrón: UN SOLO cy.intercept() por test que enruta internamente.
 * Evita el problema de múltiples interceptores encadenados que compiten
 * por la misma URL y pueden perderse entre sí.
 *
 * La app tiene dos modos (VITE_USE_DIRECT_API):
 *   false (npm run dev)     → POST .../functions/v1/api-proxy  (body.endpoint = ruta)
 *   true  (dev:avvillas...) → GET/POST directo a VITE_API_URL/ruta
 *
 * setupRouter() registra intercepts para AMBOS modos simultáneamente.
 */

const API_PROXY  = '**/functions/v1/api-proxy'
const DIRECT_API = '**/api/**'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type RouteMap = Record<string, string>
// key   = fragmento del endpoint (case-insensitive includes)
// value = ruta al fixture, ej: 'facturas/disponibles.json'
// Las rutas más específicas van PRIMERO (se evalúan en orden).

// ─── Router central ───────────────────────────────────────────────────────────
function setupRouter(routes: RouteMap) {
  const entries = Object.entries(routes)

  // Modo SUPABASE PROXY — body: { endpoint: '/Facturas/obtenerfacturas?...', ... }
  cy.intercept('POST', API_PROXY, (req) => {
    const endpoint: string = (req.body?.endpoint ?? '').toLowerCase()
    const match = entries.find(([pattern]) => endpoint.includes(pattern.toLowerCase()))
    if (match) {
      req.reply({ fixture: match[1] })
    } else {
      req.continue()
    }
  }).as('apiProxy')

  // Modo DIRECT API — URL: http://IP/api/Facturas/obtenerfacturas?...
  cy.intercept(DIRECT_API, (req) => {
    const parsed = new URL(req.url)
    const urlPath = (parsed.pathname + parsed.search).toLowerCase()
    const match = entries.find(([pattern]) => urlPath.includes(pattern.toLowerCase()))
    if (match) {
      req.reply({ fixture: match[1] })
    } else {
      req.continue()
    }
  }).as('directApi')
}

// ─── Rutas compartidas (presentes en TODAS las páginas autenticadas) ──────────
// No incluye login — esa ruta solo la usan los tests de auth.
const SHARED_ROUTES: RouteMap = {
  'obtenerinformacionusuario':   'shared/usuario-info.json',
  'obtenerfondeadores':          'shared/fondeadores.json',
  'obtenervinculaciones':        'shared/vinculaciones.json',
}

// ─── Setup por página ─────────────────────────────────────────────────────────

/** Login exitoso.
 *  Incluye las rutas del dashboard porque después del login la app
 *  redirige a /dashboard y carga esos endpoints inmediatamente.
 *  Sin estos mocks, el Supabase real rechaza el JWT falso con 401
 *  → expireSession() → redirige de vuelta a /auth → test falla.
 */
export function mockLogin() {
  setupRouter({
    '/login/autenticacion':      'auth/login-success.json',
    ...SHARED_ROUTES,
    'obtenerresumeninicio':      'dashboard/resumen-inicio.json',
    'obtenerliquidaciones':      'dashboard/liquidaciones.json',
    'factoring/paquetes':        'dashboard/paquetes-recientes.json',
  })
}

/** Login que devuelve error de credenciales */
export function mockLoginError() {
  setupRouter({
    '/login/autenticacion': 'auth/login-error.json',
  })
}

/** Dashboard */
export function mockDashboard() {
  setupRouter({
    ...SHARED_ROUTES,
    'obtenerresumeninicio':         'dashboard/resumen-inicio.json',
    'obtenerliquidaciones':         'dashboard/liquidaciones.json',
    // paquetes recientes (dashboard usa estados=10,20,30,35)
    'factoring/paquetes':           'dashboard/paquetes-recientes.json',
  })
}

/** Página de Facturas
 *  Orden importa: los patrones más específicos van PRIMERO.
 */
export function mockPaginaFacturas() {
  setupRouter({
    ...SHARED_ROUTES,
    // Facturas por estado (más específicos primero)
    'shestado=10':                  'facturas/disponibles.json',
    'shestado=9':                   'facturas/en-proceso.json',
    'shestado=16':                  'shared/vacio.json',
    // Otros endpoints de facturas
    'obtenerdocregistrados':          'facturas/registradas.json',
    'obtenerfacturasenconsignacion':  'shared/vacio.json',
    'obtenerfacturasconsignadas':     'shared/vacio.json',
    'obtenerdocnonegociables':        'facturas/no-negociables.json',
    'detallefacturascandidatas':      'facturas/candidatas.json',
    'actualizarfechadepago':          'facturas/actualizar-fecha.json',
    // Paquetes (se llama desde facturas al negociar)
    'factoring/paquetes':           'negociaciones/paquetes-lista.json',
  })
}

/** Página de Negociaciones */
export function mockPaginaNegociaciones() {
  setupRouter({
    ...SHARED_ROUTES,
    // Detalle de un paquete específico (más específico que la lista)
    'detalles-liquidacion':         'negociaciones/liquidacion-detalles.json',
    'detalles-negociacion':         'negociaciones/paquetes-vacio.json',
    '/confirmar':                   'negociaciones/confirmar.json',
    '/declinar':                    'negociaciones/declinar.json',
    // Lista de paquetes (menos específico, va al final)
    'factoring/paquetes':           'negociaciones/paquetes-lista.json',
  })
}

/** Página de Subir Facturas (CUFE) */
export function mockPaginaCufe() {
  setupRouter({
    ...SHARED_ROUTES,
    'consultarcabecera':            'cufe/cabecera-masivos.json',
    'consultardetalle':             'cufe/cabecera-masivos.json',
    'consultarcufe':                'cufe/consultar-cufe.json',
    'registrarcufesmasivos':        'shared/vacio.json',
    'radiacarcufeunitario':         'shared/vacio.json',
  })
}

/** Página de Vinculaciones */
export function mockPaginaVinculaciones() {
  setupRouter({
    ...SHARED_ROUTES,
    'obtenerconveniosproveedor':    'convenios/lista.json',
  })
}

/** Página de Negociaciones — fixture con los 4 estados (551 PENDIENTE, 552 EN_PROCESO, 553 EN_NEGOCIACION, 554 COMPLETADO) */
export function mockPaginaNegociacionesTodosEstados() {
  setupRouter({
    ...SHARED_ROUTES,
    // Detalle de paquetes (más específicos primero)
    'detalles-liquidacion':         'negociaciones/liquidacion-detalles.json',
    'detalles-negociacion':         'negociaciones/negociacion-detalles.json',
    '/confirmar':                   'negociaciones/confirmar.json',
    '/declinar':                    'negociaciones/declinar.json',
    // Lista de paquetes — incluye paquete 551, 552, 553 y 554
    'factoring/paquetes':           'negociaciones/paquetes-todos-estados.json',
  })
}

/** Página de Facturas — facturas disponibles + flujo completo de liquidación hacia Negociaciones */
export function mockPaginaFacturasDisponibles() {
  // Rutas para este flujo — el POST crear-paquete se maneja dentro del mismo handler
  // para evitar problemas de encadenamiento LIFO con req.continue().
  const routes: RouteMap = {
    ...SHARED_ROUTES,
    'shestado=10':                  'facturas/disponibles.json',
    'detalles-liquidacion':         'negociaciones/liquidacion-detalles.json',
    'detalles-negociacion':         'negociaciones/negociacion-detalles.json',
    '/confirmar':                   'negociaciones/confirmar.json',
    '/declinar':                    'negociaciones/declinar.json',
    'factoring/paquetes':           'negociaciones/paquetes-lista.json',
  }
  const entries = Object.entries(routes)

  // Modo SUPABASE PROXY — un único handler que distingue POST crear-paquete del resto
  cy.intercept('POST', API_PROXY, (req) => {
    const endpoint: string = (req.body?.endpoint ?? '').toLowerCase()
    const method: string   = (req.body?.method   ?? 'GET').toUpperCase()
    if (method === 'POST' && endpoint === '/factoring/paquetes') {
      req.reply({ fixture: 'negociaciones/crear-paquete.json' })
      return
    }
    const match = entries.find(([pattern]) => endpoint.includes(pattern.toLowerCase()))
    if (match) req.reply({ fixture: match[1] })
    else req.continue()
  }).as('apiProxy')

  // Modo DIRECT API
  cy.intercept(DIRECT_API, (req) => {
    const parsed = new URL(req.url)
    const urlPath = (parsed.pathname + parsed.search).toLowerCase()
    if (req.method === 'POST' && parsed.pathname.toLowerCase().endsWith('/factoring/paquetes')) {
      req.reply({ fixture: 'negociaciones/crear-paquete.json' })
      return
    }
    const match = entries.find(([pattern]) => urlPath.includes(pattern.toLowerCase()))
    if (match) req.reply({ fixture: match[1] })
    else req.continue()
  }).as('directApi')
}
