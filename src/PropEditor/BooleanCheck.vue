<template>
  <div>
    <a-checkbox
        :checked="xvalue"
        @change="updateValue"
      >
    </a-checkbox>
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
      this.$data.xvalue = v.target.checked
      this.$emit('input', v.target.checked)
    }
  }
}
</script>

<style>
</style>
