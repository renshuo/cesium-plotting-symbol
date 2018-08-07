import Vue from 'vue'
import App from './index.vue'

Vue.use(antd)

new Vue({
    el: "#app",
    components: { App },
    template: '<App/>'
})
