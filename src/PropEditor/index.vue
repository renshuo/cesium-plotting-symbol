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
              @input="(e) => value.value=e"
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
import TextEditor from './TextEditor.vue'
import NumberEditor from './NumberEditor.vue'
import BooleanCheck from './BooleanCheck.vue'

export default {
  name: 'PropEditor',
  components: {
    ColorEditor,
    TextEditor,
    NumberEditor,
    BooleanCheck
  },
  data () {
    return {
      props: {}
    }
  },
  computed: {
  },
  methods: {
    getCompByType (type) {
      switch (type) {
        case 'number': return 'number-editor'
        case 'string': return 'text-editor'
        case 'color': return 'color-editor'
        case 'boolean': return 'boolean-check'
      }
    }
  },
  mounted () {
	 window.addEventListener('ppe', (e) => {
    this.$data.props = e.props
   })
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