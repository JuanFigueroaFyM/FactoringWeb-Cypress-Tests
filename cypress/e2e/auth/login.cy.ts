/// <reference types="cypress" />

describe('Login', () => {
  context('Formulario', () => {
    beforeEach(() => {
      cy.visit('/auth')
    })

    it('muestra el formulario de autenticación', () => {
      cy.get('#identifier').should('be.visible')
      cy.get('#password').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('no navega si los campos están vacíos', () => {
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/auth')
    })
  })

  context('Login exitoso', () => {
    it('redirige al dashboard después del login', () => {
      cy.loginUI(Cypress.env('TEST_IDENTIFIER'), Cypress.env('TEST_PASSWORD'))
      cy.url({ timeout: 15000 }).should('include', '/dashboard')
    })
  })

  context('Login fallido', () => {
    it('muestra mensaje de error con credenciales incorrectas', () => {
      cy.loginUIConError(Cypress.env('TEST_IDENTIFIER'), 'contraseña-incorrecta')
      cy.contains(/incorrecto|inválid|error/i, { timeout: 8000 }).should('be.visible')
      cy.url().should('include', '/auth')
    })
  })

  context('Rutas protegidas sin sesión', () => {
    const rutasProtegidas = ['/dashboard', '/facturas', '/negociaciones', '/cufe-upload', '/vinculaciones']

    rutasProtegidas.forEach((ruta) => {
      it(`redirige a /auth al intentar acceder a ${ruta}`, () => {
        cy.visit(ruta)
        cy.url({ timeout: 10000 }).should('include', '/auth')
      })
    })
  })
})
