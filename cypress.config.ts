import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "a8g8i4",

  e2e: {
    baseUrl:
      process.env.CYPRESS_BASE_URL ??
      "https://ebillswtestfactoringweb.facturaenlinea.co",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    video: !!process.env.CI,
    env: {
      API_MODE: process.env.CYPRESS_API_MODE ?? "proxy",
      TEST_IDENTIFIER: process.env.CYPRESS_TEST_IDENTIFIER ?? "+573176699440",
      TEST_PASSWORD: process.env.CYPRESS_TEST_PASSWORD ?? "TestPassword123!",
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
