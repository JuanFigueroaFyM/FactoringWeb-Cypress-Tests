/**
 * e2e.ts — Setup global que corre ANTES de cada test.
 * Importa comandos. No pongas lógica de negocio aquí.
 */
import './commands'

// Ignora errores conocidos que no son parte de los tests:
// - reCAPTCHA: el SDK de Google puede fallar silenciosamente en entornos de test
// - ResizeObserver: error inofensivo de algunos componentes UI
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('grecaptcha') ||
    err.message.includes('recaptcha') ||
    err.message.includes('ResizeObserver loop')
  ) {
    return false
  }
  return true
})

// Limpia localStorage y cookies antes de cada test para garantizar
// que ningún test hereda estado del test anterior.
beforeEach(() => {
  cy.clearLocalStorage()
  cy.clearCookies()
})
