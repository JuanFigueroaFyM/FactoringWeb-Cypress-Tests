/**
 * Suite: Comportamiento con sesión expirada
 *
 * Mecanismo de expiración (UserContext.tsx + jwt.ts):
 *   - ebill_session_expiry en localStorage es la fuente primaria.
 *   - isTokenExpired(token) → Date.now() >= parseInt(session_expiry).
 *   - msUntilExpiry(token) → Math.max(0, parseInt(session_expiry) - Date.now()).
 *   - Tras cargar userInfo (fetchUserInfo), el useEffect del timer evalúa ms <= 0
 *     y llama expireSession() → clearUser() + navigate('/auth').
 *
 * cy.visitConSesionExpirada(route):
 *   - Establece los mocks de la ruta (SHARED_ROUTES incluye obtenerinformacionusuario).
 *   - Inyecta ebill_token + ebill_session_expiry (pasado) + ebill_user_info en localStorage.
 *   - El flujo: fetchUserInfo mocked → userInfo set → timer fires → expireSession → /auth.
 */

describe('Auth — Sesión expirada', () => {
  it('sesión expirada en /dashboard redirige a /auth', () => {
    cy.visitConSesionExpirada('/dashboard')
    cy.url({ timeout: 10000 }).should('include', '/auth')
  })

  it('sesión expirada en /facturas redirige a /auth', () => {
    cy.visitConSesionExpirada('/facturas')
    cy.url({ timeout: 10000 }).should('include', '/auth')
  })

  it('sesión válida en /dashboard NO redirige', () => {
    // cy.visitDashboard() inyecta ebill_session_expiry = Date.now() + 1 año
    // El mecanismo funciona en ambas direcciones: sesión válida → no redirige.
    cy.visitDashboard()
    cy.url().should('include', '/dashboard')
    cy.url().should('not.include', '/auth')
  })
})
