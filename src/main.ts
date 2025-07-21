// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vue
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDateInput } from 'vuetify/labs/VDateInput'

// Custom Vuetify
import { customDefaults, customTheme } from '@/utils/vuetify/config'

// Icons
import '@mdi/font/css/materialdesignicons.css'

// Font
import { createFont } from './utils/vuetify/font'

createFont()

const app = createApp(App)

const vuetify = createVuetify({
  theme: {
    themes: customTheme,
  },
  defaults: customDefaults,
  components: {
    ...components,
    VDateInput,
  },
  directives,
})

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
