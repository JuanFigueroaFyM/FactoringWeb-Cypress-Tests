/// <reference types="cypress" />

describe('Facturas', () => {
  beforeEach(() => {
    cy.visitFacturas()
  })

  it('carga la página sin errores', () => {
    cy.url().should('include', '/facturas')
    cy.get('body', { timeout: 10000 }).should('not.contain', 'Error')
  })

  it('muestra facturas disponibles (SETT466872) del fixture', () => {
    cy.contains('466872', { timeout: 10000 }).should('be.visible')
  })

  it('muestra el nombre del pagador (COLOMBIANA DE COMERCIO)', () => {
    cy.contains(/colombiana de comercio/i, { timeout: 10000 }).should('be.visible')
  })

  it('muestra el valor de las facturas formateado', () => {
    // El fixture tiene $1.700.000 — verificamos que aparece en algún formato numérico
    cy.contains(/1[.,]700[.,]000/i, { timeout: 10000 }).should('exist')
  })

  it('tiene acción para subir facturas (CUFE)', () => {
    cy.contains(/subir|cargar|cufe/i).should('exist')
  })

  context('Selección de factura', () => {
    it('permite hacer clic en una factura sin crashear la página', () => {
      cy.contains('466872', { timeout: 10000 })
        .click({ force: true })

      // La página debe seguir mostrando el número de factura (no hubo crash)
      cy.contains('466872').should('exist')
    })
  })
})
