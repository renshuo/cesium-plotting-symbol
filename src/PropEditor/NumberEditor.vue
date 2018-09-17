<template>
  <div>
    <a-input-number :min="min" :max="max" :step="step" v-model="xvalue" @change="updateValue" :disabled="disabled"></a-input-number>
  </div>
</template>

<script>

import Vue from 'vue'
import { InputNumber } from 'ant-design-vue'
Vue.component(InputNumber.name, InputNumber)


export default {
  name: 'colorEditor',
  props: {
    value: {},
    min: {},
    max: {},
    step: {},
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
