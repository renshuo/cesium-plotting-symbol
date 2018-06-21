import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    count: 0,
    prop: {}
  },
  getters: {
    props: state => {
      return state.prop
    }
  },
  mutations: {
    increment (state) {
      state.count++
    },
    selected0 (state, data) {
      console.log('vuex: ', state, data)
      state.prop = {}
      state.prop = data
    },
    updateValue (state, data) {
      state.prop[data.name].value = data.value
    }
  },
  actions: {
    selected (context, data) {
      console.log('vuex act: ', context.state, data)
      context.commit('selected0', {})
      context.commit('selected0', data)
    }
  }
})

export default store