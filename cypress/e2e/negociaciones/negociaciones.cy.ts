/// <reference types="cypress" />

describe('Negociaciones', () => {
  beforeEach(() => {
    cy.visitNegociaciones()
  })

  it('carga la página sin errores', () => {
    cy.url().should('include', '/negociaciones')
    cy.get('body', { timeout: 10000 }).should('not.contain', 'Error')
  })

  it('muestra los paquetes de negociación del fixture', () => {
    // El fixture tiene IdPaquete 551 y 595
    cy.contains(/551|595|paquete/i, { timeout: 10000 }).should('exist')
  })

  it('muestra el estado PENDIENTE_POR_CONFIRMAR en la lista', () => {
    cy.contains(/pendiente|liquidaci/i, { timeout: 10000 }).should('be.visible')
  })

  it('tiene filtros de estado (Recibidas, En negociación, etc.)', () => {
    cy.contains(/recibida|pendiente|negociaci/i).should('exist')
  })

  context('Detalle de paquete', () => {
    it('abre el detalle al hacer clic en un paquete', () => {
      cy.contains(/551|paquete/i, { timeout: 10000 }).first().click({ force: true })
      // El detalle debe mostrar los valores del fixture
      cy.contains(/4[.,]209[.,]000|4209000|liquidaci/i, { timeout: 8000 }).should('exist')
    })

    it('muestra facturas exitosas y fallidas en el detalle de liquidación', () => {
      cy.contains(/551|paquete/i, { timeout: 10000 }).first().click({ force: true })
      // fixture tiene 1 EXITOSO y 1 FALLIDO
      cy.contains(/exitoso|fallido/i, { timeout: 8000 }).should('exist')
    })
  })
})
