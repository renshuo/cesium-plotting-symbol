import Vue from 'vue'
import App from './index.vue'

import 'vue-antd-ui/dist/antd.css'
import antd from 'vue-antd-ui'

Vue.use(antd)

new Vue({
    el: "#app",
    components: { App },
    template: '<App/>'
})
