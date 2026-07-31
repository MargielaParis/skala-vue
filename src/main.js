import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

/* app -> 루트(최상위) 컴포넌트 */
const app = createApp(App)

app.use(createPinia())
app.use(router)

/*
index.html의
<div id = "app"></div>에 물리적으로 넣음
-> 화면 렌더링 시작
*/
app.mount('#app')
