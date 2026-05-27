/**
 * Suite: Flujos de acción sobre paquetes — Confirmar y Declinar
 *
 * Verifica que los botones Negociar (confirmar) y Declinar del paquete #551
 * (PENDIENTE_POR_CONFIRMAR) ejecutan la acción correcta y muestran el
 * toast de resultado correspondiente.
 *
 * Mocks usados:
 *   - mockPaginaNegociacionesTodosEstados() incluye:
 *     - factoring/paquetes → paquetes-todos-estados.json (paquete #551 con TotalLiquidadasExitosas=3)
 *     - detalles-liquidacion → liquidacion-detalles.json (1 EXITOSO, 1 FALLIDO)
 *     - /confirmar → negociaciones/confirmar.json { success: true }
 *     - /declinar  → negociaciones/declinar.json  { success: true }
 *
 * El componente LiquidacionDetailModal muestra:
 *   - Confirmar exitoso: toast.success("Paquete en proceso de negociación")
 *   - Declinar exitoso:  toast.info("Paquete declinado")
 */

describe('Negociaciones — Confirmar paquete', () => {
  beforeEach(() => {
    cy.visitNegociacionesTodosEstados()
    // Abrir el modal del paquete #551 (PENDIENTE_POR_CONFIRMAR)
    cy.get('[aria-label="Paquete #551 — Pendiente por confirmar"]', { timeout: 8000 }).click()
    cy.get('[role="dialog"]', { timeout: 8000 }).should('exist')
  })

  it('muestra el botón Negociar habilitado', () => {
    cy.contains('button', /^Negociar/i, { timeout: 8000 })
      .should('exist')
      .and('not.be.disabled')
  })

  it('click en Negociar muestra toast de éxito', () => {
    cy.contains('button', /^Negociar/i, { timeout: 8000 }).click()
    // La respuesta de /confirmar es { success: true } sin campo Message
    // → el componente hace toast.success("Paquete en proceso de negociación")
    cy.contains(/paquete en proceso de negociaci/i, { timeout: 8000 }).should('exist')
  })

  it('no aparece "Error inesperado" después de confirmar', () => {
    cy.contains('button', /^Negociar/i, { timeout: 8000 }).click()
    cy.contains(/paquete en proceso de negociaci/i, { timeout: 8000 })
    cy.get('body').should('not.contain', 'Error inesperado')
  })
})

describe('Negociaciones — Declinar paquete', () => {
  beforeEach(() => {
    cy.visitNegociacionesTodosEstados()
    cy.get('[aria-label="Paquete #551 — Pendiente por confirmar"]', { timeout: 8000 }).click()
    cy.get('[role="dialog"]', { timeout: 8000 }).should('exist')
  })

  it('muestra el botón Declinar habilitado', () => {
    cy.contains('button', /^Declinar$/i, { timeout: 8000 })
      .should('exist')
      .and('not.be.disabled')
  })

  it('click en Declinar muestra toast de resultado', () => {
    cy.contains('button', /^Declinar$/i, { timeout: 8000 }).click()
    // La respuesta de /declinar es { success: true } sin campo Message
    // → el componente hace toast.info("Paquete declinado")
    cy.contains(/paquete declinado/i, { timeout: 8000 }).should('exist')
  })

  it('no aparece "Error inesperado" después de declinar', () => {
    cy.contains('button', /^Declinar$/i, { timeout: 8000 }).click()
    cy.contains(/paquete declinado/i, { timeout: 8000 })
    cy.get('body').should('not.contain', 'Error inesperado')
  })
})
