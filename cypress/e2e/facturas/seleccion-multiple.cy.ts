/**
 * Suite: Selección múltiple de facturas
 *
 * El fixture disponibles.json tiene dos facturas disponibles:
 *   - SETT-466872 ($1.700.000) → Total: 1700000
 *   - SETT-466873 ($2.000.000) → Total: 2000000
 *
 * La barra de selección (bg-primary) aparece cuando selectedIds.size > 0
 * y muestra: "{n} de {total} factura(s) seleccionada(s)" y "Total: {formatCurrency}".
 *
 * Los Checkbox de shadcn/Radix se renderizan como button[role="checkbox"].
 * La barra también incluye un botón "Seleccionar todas" con aria-label.
 */

describe('Facturas — Selección múltiple', () => {
  beforeEach(() => {
    // visitFacturasDisponibles usa mockPaginaFacturasDisponibles:
    // shestado=10 → disponibles.json (2 facturas SETT-466872 y SETT-466873)
    cy.visitFacturasDisponibles()
    // Esperar a que las facturas carguen
    cy.contains('466872', { timeout: 10000 }).should('exist')
  })

  it('seleccionar una factura muestra la barra con 1 factura', () => {
    cy.get('[role="checkbox"]').first().click()
    cy.contains(/1 de 2 factura/i, { timeout: 8000 }).should('exist')
  })

  it('seleccionar ambas facturas muestra el contador correcto', () => {
    cy.get('[role="checkbox"]').first().click()
    cy.get('[role="checkbox"]').eq(1).click()
    cy.contains(/2 de 2 factura/i, { timeout: 8000 }).should('exist')
  })

  it('seleccionar ambas facturas muestra el total combinado $3.700.000', () => {
    cy.get('[role="checkbox"]').first().click()
    cy.get('[role="checkbox"]').eq(1).click()
    // 1700000 + 2000000 = 3700000 → "$3.700.000" (formato es-CO)
    cy.contains(/3[.,]700[.,]000/, { timeout: 8000 }).should('exist')
  })

  it('deseleccionar una factura baja el contador a 1', () => {
    cy.get('[role="checkbox"]').first().click()
    cy.get('[role="checkbox"]').eq(1).click()
    cy.contains(/2 de 2 factura/i, { timeout: 8000 })

    // Deseleccionar la primera
    cy.get('[role="checkbox"]').first().click()
    cy.contains(/1 de 2 factura/i, { timeout: 8000 }).should('exist')
  })

  it('deseleccionar la última factura oculta la barra de acción', () => {
    cy.get('[role="checkbox"]').first().click()
    cy.contains(/1 de 2 factura/i, { timeout: 8000 })

    // Deseleccionar la única seleccionada
    cy.get('[role="checkbox"]').first().click()
    // selectedIds.size = 0 → la barra desaparece
    cy.contains(/factura\(s\) seleccionada/i, { timeout: 8000 }).should('not.exist')
  })

  it('seleccionar todas via botón "Seleccionar todas"', () => {
    cy.get('[aria-label="Seleccionar todas las facturas"]', { timeout: 8000 }).click()
    cy.contains(/2 de 2 factura/i, { timeout: 8000 }).should('exist')
  })

  it('deseleccionar todas via botón "Deseleccionar todas"', () => {
    cy.get('[aria-label="Seleccionar todas las facturas"]', { timeout: 8000 }).click()
    cy.contains(/2 de 2 factura/i, { timeout: 8000 })

    // El botón cambia su aria-label al tener todas seleccionadas
    cy.get('[aria-label="Deseleccionar todas las facturas"]').click()
    cy.contains(/factura\(s\) seleccionada/i, { timeout: 8000 }).should('not.exist')
  })
})
