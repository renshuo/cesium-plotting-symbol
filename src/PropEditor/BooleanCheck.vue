<template>
  <div>
    <a-checkbox
      :checked="xvalue"
      @change="updateValue"
      :disabled="disabled"
    >
    </a-checkbox>
  </div>
</template>

<script>

import Vue from 'vue'
import { Checkbox } from 'ant-design-vue'
Vue.component(Checkbox.name, Checkbox)

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
      this.$data.xvalue = v.target.checked
      this.$emit('input', v.target.checked)
    }
  }
}
</script>

<style>
</style>
