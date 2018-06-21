import Vue from 'vue'
import App from './index.vue'

import 'vue-antd-ui/dist/antd.css';
import antd from 'vue-antd-ui'

import store from '../src/store/index.js'

Vue.use(antd)

window.vue = new Vue()

new Vue({
    el: "#app",
    store,
    components: { App },
    template: '<App/>'
})
