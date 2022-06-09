<template>
  <input :min="min" :max="max" :step="step" v-model="xvalue" @change="updateValue" :disabled="disabled" />
</template>

<script setup>
import {ref, defineExpose, onMounted} from 'vue'

const prop = defineProps({
  value: Number,
  min: Number,
  max: Number,
  step: Number,
  disabled: {
    default: false,
    type: Boolean
  }
})

const xvalue = ref()

const emit = defineEmits(["input"])
function updateValue (v) {
  emit('input', xvalue.value)
}
onMounted( () => {
  xvalue.value = prop.value
})

</script>

<style>
</style>
