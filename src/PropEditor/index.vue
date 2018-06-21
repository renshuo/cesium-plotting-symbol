<template>
  <div class="propeditor" id="app">
    <a-collapse :bordered="false" activeKey="1">
      <a-collapse-panel header="属性编辑" key="1">
        <div v-for="(value, key) in props" :key="key">
          <a-row>
            <a-col :span="6">{{value.title}}</a-col>
            <a-col :span="18">
              <component 
              :is="getCompByType(value.type)"
              v-bind="value"
              v-model="value.value"
              :disabled="value.editable === false">
              </component>
            </a-col>
          </a-row>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
import ColorEditor from './ColorEditor.vue'

export default {
  name: 'App',
  components: {
    ColorEditor
  },
  data () {
    return {
    }
  },
  computed: {
    props () {
      return this.$store.getters.props
    }
  },
  watch: {

  },
  methods: {
    updateValue (name, value) {
      this.$store.commit('updateValue', {name, value})
    },
    getCompByType (type) {
      switch (type) {
        case 'number': return 'a-input-number'
        case 'string': return 'a-input'
        case 'color': return 'color-editor'
      }
    }
  },
  created () {
  }
}
</script>

<style>
.propeditor {
  position: absolute;
  float: right;
  top: 120px;
  right: 12px;
  width: 300px;
}

.editor {
  width: 100%
}

</style>

ipoint