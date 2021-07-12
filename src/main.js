import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VModal from 'vue-js-modal/dist/index.nocss.js'
import 'vue-js-modal/dist/styles.css'




Vue.config.productionTip = false

Vue.use(VModal)

import VTooltip from 'v-tooltip'

Vue.use(VTooltip)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
