<template>
  <div>
    <a-input-number v-model="xvalue" @change="updateValue"></a-input-number>
  </div>
</template>

<script>

export default {
  name: 'colorEditor',
  props: {
    value: {}
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
