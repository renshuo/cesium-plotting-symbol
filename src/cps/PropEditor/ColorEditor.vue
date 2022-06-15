<template>
  <input v-model="xvalue" type="color" @change="emit('input', xvalue)" :disabled="disabled" />
</template>


<script setup>
import {ref, onMounted} from 'vue'

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
