import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import App from './App.vue'
import router from './router'

/* app -> 루트(최상위) 컴포넌트 */
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '[data-theme="dark"]',
    },
  },
})

/*
index.html의
<div id = "app"></div>에 물리적으로 넣음
-> 화면 렌더링 시작
*/
app.mount('#app')
