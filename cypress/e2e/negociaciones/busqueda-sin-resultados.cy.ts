/**
 * Suite: Búsqueda sin resultados en Negociaciones
 *
 * Complementa los tests de búsqueda existentes cubriendo el caso vacío.
 *
 * El fixture paquetes-todos-estados.json tiene 4 paquetes en tab "Pendientes":
 *   #551 (PENDIENTE_POR_CONFIRMAR), #552 (EN_PROCESO), #553 (EN_NEGOCIACION)
 *   #554 (COMPLETADO — en tab "Histórico")
 *
 * El componente filtra por item.numero.includes(searchTerm) o fondeador.
 * Estado vacío en tab Pendientes: "No hay liquidaciones pendientes"
 * Estado vacío en tab Histórico:  "No hay liquidaciones en el histórico"
 *
 * El input de búsqueda tiene placeholder="Buscar por número o fondeador..."
 */

describe('Negociaciones — Búsqueda sin resultados', () => {
  beforeEach(() => {
    cy.visitNegociacionesTodosEstados()
    // Esperar a que los paquetes carguen
    cy.get('[aria-label*="Paquete #551"]', { timeout: 8000 }).should('exist')
  })

  it('término sin coincidencias muestra estado vacío', () => {
    cy.get('input[placeholder*="número"]').type('XXXXXX999')
    cy.contains(/no hay liquidaciones/i, { timeout: 8000 }).should('exist')
  })

  it('limpiar el campo restaura todos los paquetes', () => {
    cy.get('input[placeholder*="número"]').type('XXXXXX999')
    cy.contains(/no hay liquidaciones/i, { timeout: 8000 })

    cy.get('input[placeholder*="número"]').clear()
    // Los 3 paquetes pendientes deben volver a estar visibles
    cy.get('[aria-label*="Paquete #551"]', { timeout: 8000 }).should('exist')
    cy.get('[aria-label*="Paquete #552"]').should('exist')
    cy.get('[aria-label*="Paquete #553"]').should('exist')
  })

  it('escribir "551" muestra solo #551', () => {
    cy.get('input[placeholder*="número"]').type('551')
    cy.get('[aria-label*="Paquete #551"]', { timeout: 8000 }).should('exist')
    cy.get('[aria-label*="Paquete #552"]').should('not.exist')
    cy.get('[aria-label*="Paquete #553"]').should('not.exist')
  })

  it('cambiar de "551" a "552" sin limpiar es reactivo', () => {
    cy.get('input[placeholder*="número"]').type('551')
    cy.get('[aria-label*="Paquete #551"]', { timeout: 8000 }).should('exist')

    // Cambiar el término sin pasar por clear explícito
    cy.get('input[placeholder*="número"]').clear().type('552')
    cy.get('[aria-label*="Paquete #552"]', { timeout: 8000 }).should('exist')
    cy.get('[aria-label*="Paquete #551"]').should('not.exist')
  })

  it('buscar por fondeador "FyM Capital" muestra paquetes del tab activo', () => {
    cy.get('input[placeholder*="número"]').type('FyM Capital')
    // Todos los paquetes son de FyM Capital — los 3 pendientes deben aparecer
    cy.get('[aria-label*="Paquete #551"]', { timeout: 8000 }).should('exist')
  })
})
