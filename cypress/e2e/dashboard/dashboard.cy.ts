/// <reference types="cypress" />

describe('Dashboard', () => {
  beforeEach(() => {
    cy.visitDashboard()
  })

  it('carga sin errores y permanece en /dashboard', () => {
    cy.url().should('include', '/dashboard')
  })

  it('muestra el resumen de facturas con los estados del fixture', () => {
    cy.contains(/disponibles/i, { timeout: 10000 }).should('be.visible')
    cy.contains(/no negociables/i).should('be.visible')
  })

  it('muestra el total de 321 facturas según fixture', () => {
    cy.contains('321').should('exist')
  })

  it('muestra el menú de navegación principal', () => {
    cy.contains(/facturas/i).first().should('be.visible')
    cy.contains(/negociaci/i).first().should('be.visible')
  })
})
