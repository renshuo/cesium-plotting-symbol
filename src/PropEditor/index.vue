<template>
  <div class="propeditor" id="app" :hidden="!isShow">
    <a-collapse :bordered="false" activeKey="1">
      <a-collapse-panel header="属性编辑" key="1">
        <div v-for="(value, key) in prop" :key="key">
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
import EditMode from '../EditMode.js'

import 'vue-antd-ui/dist/antd.css'
import antd from 'vue-antd-ui'

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
      prop: {},
      isShow: false
    }
  },
  methods: {
    getCompByType (type) {
      switch (type) {
        case 'number': return 'number-editor'
        case 'string': return 'text-editor'
        case 'color': return 'color-editor'
        case 'boolean': return 'boolean-check'
      }
    },
    show (isShow, props) {
      this.isShow = isShow
      if (isShow) {
        this.$data.prop = {}
        // 这里如果不将props置空，直接更新props
        // 会导致vue复用之前的组件，导致编辑界面的组件不更新
        // 所以用timeout异步更新props
        setTimeout(() => {
          this.$data.prop = props
        }, 1)
      }
    }
  }
}
</script>

<style>
.propeditor {
  position: absolute;
  float: right;
  top: 100px;
  right: 10px;
  width: 20%;
  max-width: 400px;
}

.editor {
  width: 100%
}

</style>