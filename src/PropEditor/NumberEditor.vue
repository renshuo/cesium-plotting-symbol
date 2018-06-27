<template>
  <div>
    <a-input-number :min="min" :max="max" :step="step" v-model="xvalue" @change="updateValue"></a-input-number>
  </div>
</template>

<script>

export default {
  name: 'colorEditor',
  props: {
    value: {},
    min: {},
    max: {},
    step: {},
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
