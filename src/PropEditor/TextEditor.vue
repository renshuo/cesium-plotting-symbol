<template>
  <div>
    <a-input v-model="xvalue" @change="updateValue"></a-input>
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
