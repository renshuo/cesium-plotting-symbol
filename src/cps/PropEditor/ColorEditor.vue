<template>
  <input v-model="xvalue" data-jscolor="{}" @change="emit('input', xvalue)"
    :style="{backgroundColor: xvalue, color: xvalue}" :disabled="disabled" />
</template>


<script setup>
import {ref, defineExpose, onMounted} from 'vue'

import Color from 'color'
import jscolor from 'jscolor'

const  prop = defineProps({
  value: {},
  disabled: {
    default: false,
    type: Boolean
  }
})

const xvalue = ref("")
const emit = defineEmits(["input"])
const isShowPicker = ref(false)

const colors = ref("#fff")
const textColor = ref("#fff")

emit('input', colors.value)

onMounted( () => {
  xvalue.value = prop.value
})

</script>

<style>
.colorpane {
  position: relative;
  float: left;
  width: 260px;
}

input .vc-input__input {
  width: 100%
}
</style>
