/// <reference types="cypress" />

/**
 * Suite completa de pruebas para el flujo de Negociaciones:
 *   Facturas disponibles → crear paquete → redirige a /negociaciones?openPaquete=id
 *   → modal detalle → confirmar / declinar / filtros / paginación / búsqueda / vistas
 *
 * Fixture de paquetes: paquetes-todos-estados.json
 *   #551 PENDIENTE_POR_CONFIRMAR (lista_negociar) — acciones Declinar + Negociar habilitadas
 *   #552 EN_PROCESO_LIQUIDACION  (en_proceso)      — acciones deshabilitadas (liquidando)
 *   #553 EN_NEGOCIACION          (en_negociacion)   — sin acciones (en Tab Pendientes)
 *   #554 COMPLETADO              (negociada)        — sin acciones (en Tab Histórico)
 */

// ─── Stat cards ───────────────────────────────────────────────────────────────
describe('Negociaciones — Filtros de estado (Stat Cards)', () => {
  beforeEach(() => {
    cy.visitNegociacionesTodosEstados()
  })

  it('muestra los 4 stat cards de estado', () => {
    cy.get('[aria-label*="Filtrar por en proceso"]').should('exist')
    cy.get('[aria-label*="Filtrar por por confirmar"]').should('exist')
    cy.get('[aria-label*="Filtrar por en negociación"]').should('exist')
    cy.get('[aria-label*="Filtrar por completados"]').should('exist')
  })

  it('los stat cards muestran los conteos correctos del fixture', () => {
    cy.get('[aria-label*="Filtrar por en proceso (1)"]').should('exist')
    cy.get('[aria-label*="Filtrar por por confirmar (1)"]').should('exist')
    cy.get('[aria-label*="Filtrar por en negociación (1)"]').should('exist')
    cy.get('[aria-label*="Filtrar por completados (1)"]').should('exist')
  })

  it('filtra paquetes al hacer clic en "Por confirmar"', () => {
    cy.get('[aria-label*="Filtrar por por confirmar"]').click()
    cy.get('[aria-pressed="true"]').should('exist')
    // Sólo el paquete 551 (PENDIENTE_POR_CONFIRMAR) debe ser visible
    // Las tarjetas muestran el número como "#551", no "Paquete #551"
    cy.get('[aria-label*="Paquete #551"]').should('exist')
    cy.get('[aria-label*="Paquete #552"]').should('not.exist')
  })

  it('filtra paquetes al hacer clic en "En proceso"', () => {
    cy.get('[aria-label*="Filtrar por en proceso"]').click()
    cy.get('[aria-pressed="true"]').should('exist')
    cy.get('[aria-label*="Paquete #552"]').should('exist')
    cy.get('[aria-label*="Paquete #551"]').should('not.exist')
  })

  it('filtra por "En negociación" y permanece en tab Pendientes', () => {
    cy.get('[aria-label*="Filtrar por en negociación"]').click()
    cy.contains('#553', { timeout: 8000 }).should('exist')
    // Tab Pendientes activo (en_negociacion NO cambia a Histórico)
    cy.get('[role="tab"][data-state="active"]').should('contain', 'Pendiente')
  })

  it('filtra por "Completados" y cambia automáticamente al tab Histórico', () => {
    cy.get('[aria-label*="Filtrar por completados"]').click()
    cy.contains('#554', { timeout: 8000 }).should('exist')
    // Tab Histórico se activa al filtrar por negociada
    cy.get('[role="tab"][data-state="active"]').should('contain', 'Hist')
  })

  it('desactiva el filtro al hacer clic en el mismo stat card (toggle)', () => {
    cy.get('[aria-label*="Filtrar por por confirmar"]').click()
    cy.get('[aria-pressed="true"]').should('exist')
    // Segundo clic limpia el filtro
    cy.get('[aria-label*="Filtrar por por confirmar"]').click()
    cy.get('[aria-pressed="true"]').should('not.exist')
  })
})

// ─── Tabs ─────────────────────────────────────────────────────────────────────
describe('Negociaciones — Tabs Pendientes / Histórico', () => {
  beforeEach(() => {
    cy.visitNegociacionesTodosEstados()
  })

  it('tab Pendientes muestra paquetes en proceso y por confirmar', () => {
    cy.contains(/551|552|553/i, { timeout: 10000 }).should('exist')
  })

  it('tab Histórico muestra sólo paquetes completados', () => {
    cy.contains(/histór/i, { timeout: 8000 }).click()
    cy.get('[aria-label*="Paquete #554"]', { timeout: 8000 }).should('exist')
    cy.get('[aria-label*="Paquete #551"]').should('not.exist')
  })

  it('puede volver al tab Pendientes desde Histórico', () => {
    cy.contains(/histór/i).click()
    cy.contains(/pendiente/i).click()
    cy.contains(/551|552|553/i, { timeout: 8000 }).should('exist')
  })
})

// ─── Búsqueda ─────────────────────────────────────────────────────────────────
describe('Negociaciones — Búsqueda', () => {
  beforeEach(() => {
    cy.visitNegociacionesTodosEstados()
  })

  it('busca por número de paquete', () => {
    cy.get('input[placeholder*="número"]', { timeout: 8000 }).type('551')
    cy.get('[aria-label*="Paquete #551"]', { timeout: 8000 }).should('exist')
    cy.get('[aria-label*="Paquete #552"]').should('not.exist')
  })

  it('busca por nombre de fondeador', () => {
    cy.get('input[placeholder*="número"]').type('FyM Capital')
    cy.contains(/551|552|553|554/i, { timeout: 8000 }).should('exist')
  })

  it('limpiar búsqueda restaura todos los paquetes', () => {
    cy.get('input[placeholder*="número"]').type('551').clear()
    cy.contains(/552|553/i, { timeout: 8000 }).should('exist')
  })
})

// ─── Vista toggle ─────────────────────────────────────────────────────────────
describe('Negociaciones — Toggle de vista', () => {
  beforeEach(() => {
    cy.visitNegociacionesTodosEstados()
  })

  it('cambia entre vista de tarjetas y tabla sin errores', () => {
    // ViewToggle tiene botones con texto "Tarjetas" y "Lista"
    cy.contains('button', /^Lista$/i, { timeout: 8000 })
      .click({ force: true })
    cy.get('body').should('not.contain', 'Error inesperado')
  })
})

// ─── Modal de detalle — Paquete PENDIENTE_POR_CONFIRMAR (#551) ─────────────────
describe('Negociaciones — Modal detalle (Pendiente por confirmar)', () => {
  beforeEach(() => {
    cy.visitNegociacionesTodosEstados()
    cy.get('[aria-label="Paquete #551 — Pendiente por confirmar"]', { timeout: 10000 })
      .click({ force: true })
  })

  it('abre el modal con el número de paquete correcto', () => {
    cy.contains(/Paquete #551/i, { timeout: 8000 }).should('exist')
  })

  it('muestra el estado "Lista para negociar" o "Pendiente"', () => {
    cy.contains(/lista para negociar|pendiente/i, { timeout: 8000 }).should('exist')
  })

  it('muestra los botones Declinar y Negociar', () => {
    cy.contains(/^Declinar$/i, { timeout: 8000 }).should('exist')
    // El botón muestra "Negociar (N)" con el conteo de exitosas
    cy.contains(/^Negociar/i, { timeout: 8000 }).should('exist')
  })

  it('muestra facturas del detalle (exitosas y fallidas)', () => {
    cy.contains(/EXITOSO|FALLIDO/i, { timeout: 10000 }).should('exist')
  })

  it('ejecuta Negociar sin errores', () => {
    cy.contains(/^Negociar/i, { timeout: 8000 }).click({ force: true })
    cy.get('body').should('not.contain', 'Error inesperado')
  })

  it('ejecuta Declinar sin errores', () => {
    cy.contains(/^Declinar$/i, { timeout: 8000 }).click({ force: true })
    cy.get('body').should('not.contain', 'Error inesperado')
  })

  it('filtra facturas exitosas', () => {
    cy.contains(/^Exitosas?$/i, { timeout: 8000 }).click({ force: true })
    cy.get('body').should('not.contain', 'Error inesperado')
  })

  it('filtra facturas fallidas', () => {
    cy.contains(/^Fallidas?$/i, { timeout: 8000 }).click({ force: true })
    cy.get('body').should('not.contain', 'Error inesperado')
  })

  it('cambia la vista del modal entre lista y tabla', () => {
    // ViewToggle dentro del modal tiene botones "Tarjetas" y "Lista"
    cy.get('[role="dialog"]')
      .contains('button', /^Lista$/i)
      .click({ force: true })
    cy.get('body').should('not.contain', 'Error inesperado')
  })

  it('cierra el modal sin errores', () => {
    cy.get('[role="dialog"]')
      .find('button[aria-label="Cerrar"], button:has(.lucide-x)')
      .first()
      .click({ force: true })
    cy.get('[role="dialog"]').should('not.exist')
  })
})

// ─── Modal de detalle — Paquete EN_PROCESO (#552) ─────────────────────────────
describe('Negociaciones — Modal detalle (En proceso de liquidación)', () => {
  beforeEach(() => {
    cy.visitNegociacionesTodosEstados()
    cy.get('[aria-label="Paquete #552 — En proceso"]', { timeout: 10000 })
      .click({ force: true })
  })

  it('muestra el banner "En proceso de liquidación"', () => {
    cy.contains(/en proceso de liquidaci/i, { timeout: 8000 }).should('exist')
  })

  it('botones Negociar y Declinar están deshabilitados', () => {
    cy.contains(/^Negociar/i, { timeout: 8000 }).should('be.disabled')
    cy.contains(/^Declinar$/i, { timeout: 8000 }).should('be.disabled')
  })
})

// ─── Modal de detalle — Paquete EN_NEGOCIACION (#553) ────────────────────────
describe('Negociaciones — Modal detalle (En negociación)', () => {
  beforeEach(() => {
    cy.visitNegociacionesTodosEstados()
    cy.get('[aria-label="Paquete #553 — En negociación"]', { timeout: 10000 })
      .click({ force: true })
  })

  it('muestra el banner "En negociación"', () => {
    cy.contains(/en negociaci/i, { timeout: 8000 }).should('exist')
  })

  it('no muestra botones Declinar ni Negociar', () => {
    cy.contains(/^Declinar$/i).should('not.exist')
    cy.contains(/^Negociar$/i).should('not.exist')
  })
})

// ─── Modal abierto automáticamente por URL param ──────────────────────────────
describe('Negociaciones — Auto-apertura del modal por ?openPaquete', () => {
  it('abre el modal automáticamente con ?openPaquete=551', () => {
    cy.visitNegociacionesConPaquete(551)
    cy.get('[role="dialog"]', { timeout: 10000 }).should('exist')
    cy.contains(/Paquete #551/i, { timeout: 8000 }).should('exist')
  })
})

// ─── Flujo completo: Facturas → Liquidar → Negociaciones ──────────────────────
describe('Flujo completo: seleccionar facturas → crear paquete → navegar a negociaciones', () => {
  it('selecciona una factura disponible, crea el paquete y navega a negociaciones', () => {
    cy.visitFacturasDisponibles()

    // Esperar que carguen las facturas disponibles (466872 viene de disponibles.json)
    cy.contains(/466872|colombiana de comercio/i, { timeout: 10000 }).should('exist')

    // Seleccionar la primera factura disponible
    // shadcn <Checkbox> renderiza como button[role="checkbox"], no como input
    cy.get('[role="checkbox"]', { timeout: 8000 })
      .first()
      .click({ force: true })

    // La barra de selección debe aparecer con "Liquidar documentos"
    cy.contains(/liquidar document/i, { timeout: 8000 }).click({ force: true })

    // Confirmar en el AlertDialog
    cy.contains(/continuar/i, { timeout: 6000 }).click({ force: true })

    // El modal de liquidación crea el paquete automáticamente
    cy.contains(/paquete creado exitosamente|paquete #551/i, { timeout: 12000 }).should('exist')

    // Navegar a la sección de negociaciones
    cy.contains(/ver en negociaciones/i, { timeout: 6000 }).click({ force: true })

    // La app navega a /negociaciones?openPaquete=551 y luego limpia el param
    // después de abrir el modal (useEffect + setSearchParams). Verificamos que:
    // 1. La URL llegó a /negociaciones
    // 2. El modal de detalle se abrió automáticamente
    cy.url({ timeout: 10000 }).should('include', '/negociaciones')
    cy.get('[role="dialog"]', { timeout: 10000 }).should('exist')
  })
})
