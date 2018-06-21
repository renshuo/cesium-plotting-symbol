<template>
  <div>
    <a-input @click="togglePicker" v-model="colors.hex" 
    :style="{backgroundColor: colors.hex, color: textColor}"></a-input>
    <div :bordered=false :hidden="!isShowPicker" class="colorpane">
            <photoshop-picker v-model="colors" 
            @input="updateValue"
      @ok="updateColor" @cancel="cancleColor"/>
    </div>
  </div>
</template>

<script>
import * as vc from 'vue-color'
import Color from 'color'

export default {
  name: 'colorEditor',
  components: {
    'photoshop-picker': vc.Sketch
  },
  props: {
    value: {}
  },
  data () {
    return {
      message: '',
      isShowPicker: false,
      colors: {
        hex: this.$props.value
      }
    }
  },
  computed: {
    colorText () {
      let hex = this.$data.colors.hex
      let alpha = this.$data.colors.alpha
      console.log('get color text: ', hex, alpha)
      return '0'
    },
    textColor () {
      let hex = this.$data.colors.hex
      let c = Color(hex)
      let hsv = c.hsv()
      if (hsv.color[1] < 50 && hsv.color[2] > 50) {
        return '#000000'
      } else {
        return '#ffffff'
      }
    }
  },
  methods: {
    togglePicker () {
      this.$data.isShowPicker = !this.$data.isShowPicker
    },
    updateColor () {
      this.$data.isShowPicker = false
    },
    cancleColor () {
      this.$data.isShowPicker = false
    },
    updateValue () {
      this.$emit('input', this.$data.colors.hex)
    }
  },
  mounted () {
    console.log('color editor.', )
  }
}
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
