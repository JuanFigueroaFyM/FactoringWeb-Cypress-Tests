/// <reference types="cypress" />

describe('Subir Facturas (CUFE)', () => {
  beforeEach(() => {
    cy.visitCufe()
  })

  it('carga la página sin errores', () => {
    cy.url().should('include', '/cufe-upload')
    cy.get('body', { timeout: 10000 }).should('not.contain', 'Error')
  })

  it('muestra el historial de archivos subidos', () => {
    // fixture: cabecera-masivos tiene CUFE_060426_JT_5.csv
    cy.contains(/CUFE_060426_JT_5|procesado/i, { timeout: 10000 }).should('exist')
  })

  it('tiene opción para subir archivo CSV', () => {
    cy.contains(/subir|cargar|csv|archivo/i).should('exist')
  })
})
