// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  
  modules: [],
  
  runtimeConfig: {
    // Private keys (server-only)
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
    googleTemplateSpreadsheetId: process.env.GOOGLE_TEMPLATE_SPREADSHEET_ID,
    googleServiceAccountClientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    
    // Public keys (exposed to client)
    public: {
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'SiapGuru Owner'
    }
  },

  css: ['~/assets/css/globals.css'],

  app: {
    head: {
      title: 'SiapGuru Owner',
      htmlAttrs: {
        lang: 'id'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Dashboard owner/admin untuk provisioning guru dan spreadsheet.' }
      ]
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  }
})
