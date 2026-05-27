/**
 * Suite: Tabs del módulo de Facturas
 *
 * Cubre los tabs que facturas.cy.ts no prueba:
 * En proceso de liquidación, Negociables sin eventos (candidatas),
 * No negociables, Recibidas, y el cambio reactivo de tab.
 *
 * Usa mockPaginaFacturas() (a través de cy.visitFacturas()) que ya
 * mocka todos los endpoints necesarios para cada tab.
 */

// Abre el selector "Tipo de facturas" y elige una opción.
function selectTab(label: string) {
  // El SelectTrigger del filtro de estado es un button[role="combobox"] dentro
  // del div cuyo label dice "Tipo de facturas".
  cy.contains('Tipo de facturas')
    .parent()
    .find('[role="combobox"]')
    .click()
  cy.contains('[role="option"]', label).click()
}

describe('Facturas — Tabs adicionales', () => {
  describe('Tab En proceso de liquidación', () => {
    beforeEach(() => {
      cy.visitFacturas()
      selectTab('En proceso de liquidación')
    })

    it('URL incluye estado=en_liquidacion', () => {
      cy.url().should('include', 'estado=en_liquidacion')
    })

    it('muestra facturas del fixture en-proceso.json', () => {
      // en-proceso.json tiene SETT-466874 y SETT-602558
      cy.contains('466874', { timeout: 8000 }).should('exist')
    })

    it('no muestra texto Error', () => {
      cy.contains('466874', { timeout: 8000 })
      cy.get('body').should('not.contain', 'Error')
    })
  })

  describe('Tab Negociables sin eventos (candidatas)', () => {
    beforeEach(() => {
      cy.visitFacturas()
      selectTab('Negociables sin eventos')
    })

    it('URL incluye estado=negociables_sin_eventos', () => {
      cy.url().should('include', 'estado=negociables_sin_eventos')
    })

    it('muestra SETT4972109 del fixture candidatas.json', () => {
      cy.contains('SETT4972109', { timeout: 8000 }).should('exist')
    })

    it('muestra el valor $1.000.000 del fixture', () => {
      // ValorTotalFactura = 1000000.24 → formatCurrency → "$1.000.000" (es-CO, 0 decimales)
      cy.contains(/1[.,]000[.,]000/, { timeout: 8000 }).should('exist')
    })
  })

  describe('Tab No negociables', () => {
    beforeEach(() => {
      cy.visitFacturas()
      selectTab('No negociables')
    })

    it('URL incluye estado=no_negociables', () => {
      cy.url().should('include', 'estado=no_negociables')
    })

    it('muestra la factura del fixture no-negociables.json', () => {
      // Facturas[0] del fixture: Prefijo=SETT, NumeroFactura=4972109
      cy.contains('4972109', { timeout: 8000 }).should('exist')
    })

    it('no muestra texto Error', () => {
      cy.contains('4972109', { timeout: 8000 })
      cy.get('body').should('not.contain', 'Error')
    })
  })

  describe('Tab Recibidas', () => {
    beforeEach(() => {
      cy.visitFacturas()
      selectTab('Recibidas')
    })

    it('URL incluye estado=recibidas', () => {
      cy.url().should('include', 'estado=recibidas')
    })

    it('carga sin errores y muestra datos del fixture registradas.json', () => {
      // registradas.json tiene NumeroFactura=SETT602504, NombreCliente=MAKRO SUPERMAYORISTA
      cy.get('body').should('not.contain', 'Error')
      cy.contains(/SETT602504|MAKRO/i, { timeout: 8000 }).should('exist')
    })
  })

  describe('Cambio reactivo de tabs', () => {
    it('cambiar entre tabs no produce el texto Error', () => {
      cy.visitFacturas()

      selectTab('En proceso de liquidación')
      cy.url().should('include', 'estado=en_liquidacion')
      cy.get('body').should('not.contain', 'Error')

      selectTab('No negociables')
      cy.url().should('include', 'estado=no_negociables')
      cy.get('body').should('not.contain', 'Error')

      selectTab('Recibidas')
      cy.url().should('include', 'estado=recibidas')
      cy.get('body').should('not.contain', 'Error')

      selectTab('Disponibles para negociar')
      cy.url().should('include', 'estado=disponible')
      cy.contains('466872', { timeout: 8000 }).should('exist')
    })
  })
})
