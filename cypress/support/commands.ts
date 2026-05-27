/// <reference types="cypress" />

import {
  mockLogin,
  mockLoginError,
  mockDashboard,
  mockPaginaFacturas,
  mockPaginaNegociaciones,
  mockPaginaNegociacionesTodosEstados,
  mockPaginaFacturasDisponibles,
  mockPaginaCufe,
  mockPaginaVinculaciones,
} from './intercepts'

// ─── Fake JWT (firma inválida — solo para tests) ──────────────────────────────
// Payload: role=Emisor, IdEmpresa=3, IdFondeador=31, exp=año 2286
// Ningún servidor real acepta este token (firma = "fake_signature_for_testing")
const FAKE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJ1bmlxdWVfbmFtZSI6Iis1NzMxNzY2OTk0NDAiLCJOaXRFbXByZXNhIjoiOTAwMzA2ODIzIiwiSWRFbXByZXNhIjoiMyIsInJvbGUiOiJFbWlzb3IiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiKzU3MzE3NjY5OTQ0MCIsIklkRm9uZGVhZG9yIjoiMzEiLCJuYmYiOjE3MDAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNzAwMDAwMDAwLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQ5MjIwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0OTIyMCJ9.' +
  'fake_signature_for_testing'

const FAKE_USER_INFO = {
  NombreEmpresa: 'FyM Technology SAS',
  NitEmpresa: '900306823',
  Usuario: '+573176699440',
  CorreoEmpresa: 'test@fymtechnology.com',
  ActivoDesde: '2/4/2021 3:20:30 PM',
  IdFondeador: 31,
  Rol: 'Emisor',
  ParametrosBasicos: { PermitirModificacionFechaDePago: true },
}

// onBeforeLoad inyecta el token ANTES de que el JS de React corra.
// Si lo hacemos después (cy.window().then(...)), el UserContext ya corrió
// fetchUserInfo() sin token y redirigió a /auth.
function injectSession(win: Window) {
  win.localStorage.setItem('ebill_token', FAKE_JWT)
  win.localStorage.setItem('ebill_user_info', JSON.stringify(FAKE_USER_INFO))
  win.localStorage.setItem('ebill_session_expiry', String(Date.now() + 86400 * 365 * 1000))
}

// ─── Tipado ───────────────────────────────────────────────────────────────────
declare global {
  namespace Cypress {
    interface Chainable {
      visitDashboard(): Chainable<void>
      visitFacturas(): Chainable<void>
      visitNegociaciones(): Chainable<void>
      /** Visita negociaciones con fixture de todos los estados (551/552/553/554) */
      visitNegociacionesTodosEstados(): Chainable<void>
      /** Visita negociaciones con ?openPaquete={id} para auto-apertura del modal */
      visitNegociacionesConPaquete(paqueteId: number): Chainable<void>
      /** Visita facturas en tab disponibles — para el flujo completo de liquidación */
      visitFacturasDisponibles(): Chainable<void>
      visitCufe(): Chainable<void>
      visitVinculaciones(): Chainable<void>
      /** Login via UI — para tests que prueban el flujo de autenticación */
      loginUI(identifier: string, password: string): Chainable<void>
      /** Login via UI simulando credenciales incorrectas */
      loginUIConError(identifier: string, password: string): Chainable<void>
      /** Visita una ruta con sesión EXPIRADA (ebill_session_expiry en el pasado) */
      visitConSesionExpirada(route: string): Chainable<void>
    }
  }
}

// ─── Comandos de navegación ───────────────────────────────────────────────────
// Patrón: registrar mocks PRIMERO, luego visit con onBeforeLoad para inyectar sesión.

Cypress.Commands.add('visitDashboard', () => {
  mockDashboard()
  cy.visit('/dashboard', { onBeforeLoad: injectSession })
})

Cypress.Commands.add('visitFacturas', () => {
  mockPaginaFacturas()
  cy.visit('/facturas?estado=disponible', { onBeforeLoad: injectSession })
})

Cypress.Commands.add('visitNegociaciones', () => {
  mockPaginaNegociaciones()
  cy.visit('/negociaciones', { onBeforeLoad: injectSession })
})

Cypress.Commands.add('visitNegociacionesTodosEstados', () => {
  mockPaginaNegociacionesTodosEstados()
  cy.visit('/negociaciones', { onBeforeLoad: injectSession })
})

Cypress.Commands.add('visitNegociacionesConPaquete', (paqueteId: number) => {
  mockPaginaNegociacionesTodosEstados()
  cy.visit(`/negociaciones?openPaquete=${paqueteId}`, { onBeforeLoad: injectSession })
})

Cypress.Commands.add('visitFacturasDisponibles', () => {
  mockPaginaFacturasDisponibles()
  cy.visit('/facturas?estado=disponible', { onBeforeLoad: injectSession })
})

Cypress.Commands.add('visitCufe', () => {
  mockPaginaCufe()
  cy.visit('/cufe-upload', { onBeforeLoad: injectSession })
})

Cypress.Commands.add('visitVinculaciones', () => {
  mockPaginaVinculaciones()
  cy.visit('/vinculaciones', { onBeforeLoad: injectSession })
})

// ─── Login via UI ─────────────────────────────────────────────────────────────
// Para estas pruebas NO inyectamos sesión — queremos probar el flujo real de login.
Cypress.Commands.add('loginUI', (identifier: string, password: string) => {
  mockLogin()
  cy.visit('/auth')
  cy.get('#identifier').type(identifier)
  cy.get('#password').type(password)
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('loginUIConError', (identifier: string, password: string) => {
  mockLoginError()
  cy.visit('/auth')
  cy.get('#identifier').type(identifier)
  cy.get('#password').type(password)
  cy.get('button[type="submit"]').click()
})

// Visita una ruta con sesión expirada: ebill_session_expiry en el pasado.
// El UserContext detecta ms=0 en el timer y llama expireSession → /auth.
Cypress.Commands.add('visitConSesionExpirada', (route: string) => {
  if (route.includes('facturas')) {
    mockPaginaFacturas()
  } else {
    mockDashboard()
  }
  cy.visit(route, {
    onBeforeLoad: (win: Window) => {
      win.localStorage.setItem('ebill_token', FAKE_JWT)
      win.localStorage.setItem('ebill_session_expiry', String(Date.now() - 1000))
      win.localStorage.setItem('ebill_user_info', JSON.stringify(FAKE_USER_INFO))
    },
  })
})

export {}
