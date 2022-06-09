<template>
  <input type="checkbox"
    :checked="xvalue"
    @change="updateValue"
    :disabled="disabled"
  />
</template>

<script setup>
import {ref, defineExpose} from 'vue'

const prop = defineProps({
  value: Boolean,
  disabled: {
    default: false,
    type: Boolean
  }
})

const xvalue = ref()

const emit = defineEmits(["input"])
function updateValue (v) {
  xvalue.value = v.target.checked
  emit('input', v.target.checked)
}
</script>

