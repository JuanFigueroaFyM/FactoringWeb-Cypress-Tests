/// <reference types="cypress" />

describe('Vinculaciones', () => {
  beforeEach(() => {
    cy.visitVinculaciones()
  })

  it('carga la página sin errores', () => {
    cy.url().should('include', '/vinculaciones')
    cy.get('body', { timeout: 10000 }).should('not.contain', 'Error')
  })

  it('muestra las vinculaciones del fixture', () => {
    // fixture tiene: BANCO COMERCIAL AV VILLAS y ACCIONA S.A.S.
    cy.contains(/banco comercial av villas|acciona/i, { timeout: 10000 }).should('be.visible')
  })

  it('muestra el estado Activa en las vinculaciones', () => {
    cy.contains(/activa/i, { timeout: 10000 }).should('be.visible')
  })
})
