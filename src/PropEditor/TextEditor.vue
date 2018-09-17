<template>
  <div>
    <a-input v-model="xvalue" @change="updateValue" :disabled="disabled"></a-input>
  </div>
</template>

<script>

import Vue from 'vue'
import { Input } from 'ant-design-vue'
Vue.component(Input.name, Input)

export default {
  name: 'colorEditor',
  props: {
    value: {},
    disabled: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      xvalue: this.$props.value
    }
  },
  methods: {
    updateValue (v) {
      this.$emit('input', this.$data.xvalue)
    }
  }
}
</script>

<style>
</style>
