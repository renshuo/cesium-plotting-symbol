<template>
  <input v-model="xvalue" data-jscolor="{}" @change="emit('input', xvalue)"
    :style="{backgroundColor: xvalue, color: xvalue}" :disabled="disabled" />
</template>


<script setup>
import {ref, defineExpose, onMounted} from 'vue'

import Color from 'color'
import jscolor from 'jscolor'

const  prop = defineProps({
  value: String,
  disabled: {
    default: false,
    type: Boolean
  }
})

const xvalue = ref()

const emit = defineEmits(["input"])

onMounted( () => {
  xvalue.value = prop.value
})

</script>

<style>
</style>
