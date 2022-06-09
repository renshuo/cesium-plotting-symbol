<template>

  <div class="propeditor" :hidden="!isShow">

        <div v-for="(value, key) in prop" :key="key">

          <div v-if="value.show === undefined || value.show === true"  class="propItem">
            <span class="propName">{{value.title}}: </span>
              <component
                :is="comps[value.type]"
                v-bind="value"
                @input="(e) => value.value=e"
                :disabled="value.editable === false"
                class="propValue"
              >
              </component>

          </div>
        </div>

  </div>
</template>

<script setup lang="ts">
import EditMode from '../EditMode.js'
import {ref, defineExpose} from 'vue'

import ColorEditor from './ColorEditor.vue'
import TextEditor from './TextEditor.vue'
import NumberEditor from './NumberEditor.vue'
import BooleanCheck from './BooleanCheck.vue'

const isShow = ref(false)
const prop = ref({})

const comps = {
  number: NumberEditor,
  string: TextEditor,
  color: ColorEditor,
  boolean: BooleanCheck
}

function show (isShow0, props) {
  isShow.value = isShow0
  if (isShow0) {
    prop.value = {}
    // 这里如果不将props置空，直接更新props
    // 会导致vue复用之前的组件，导致编辑界面的组件不更新
    // 所以用timeout异步更新props
    setTimeout(() => {
      prop.value = props
    }, 1)
  }
}

defineExpose({show})

</script>

<style>
.propeditor {
  position: absolute;
  float: right;
  top: 100px;
  right: 10px;
}

.editor {
  width: 100%
}


.propItem {
  display: flex;
  margin: 3px;
}

.propName {
  color: #ddd;
  width: 90px;
  font-size: 14px;
  margin-right: 12px;
  text-align: right;
}

.propValue {
  background:transparent;
  background-color: #59f2;
  border: 1px solid #59f;
  border-radius: 2px;
  flex-grow: 2;
  width: 100px;
  color: #eee;
}


.propValue:disabled {
  color: #aaa;
  border-width: 0px;

}
</style>
