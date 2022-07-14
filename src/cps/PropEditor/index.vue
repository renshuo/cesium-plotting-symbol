<template>
  <div class="propeditor" :hidden="!isShow">
    <div v-for="(value, key) in graph.propDefs" :key="value.name">
      <div v-if="value.show === undefined || value.show === true" class="propItem">
        <span class="propName">{{ value.title }}:</span>
        <component
          :is="comps[value.type]"
          :value="getValue(value.name)"
          @input="(e) => (graph.props[value.name] = e)"
          :disabled="value.editable === false"
          :min="value.min"
          :max="value.max"
          :step="value.step"
          class="propValue"
        ></component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineExpose, ref } from "vue";

import BooleanCheck from "./BooleanCheck.vue";
import ColorEditor from "./ColorEditor.vue";
import NumberEditor from "./NumberEditor.vue";
import TextEditor from "./TextEditor.vue";

const isShow = ref(false);
const graph = ref([]);

const comps = {
  number: NumberEditor,
  string: TextEditor,
  color: ColorEditor,
  boolean: BooleanCheck,
};

function getValue(name) {
  return graph.value.props[name];
}

function show(isShow0, graph0: Graph) {
  isShow.value = isShow0;
  if (isShow0) {
    // // 这里如果不将props置空，直接更新props
    // // 会导致vue复用之前的组件，导致编辑界面的组件不更新
    // // 所以用timeout异步更新props
    graph.value = {};
    setTimeout(() => {
      graph.value = graph0
    }, 10)
  }
}

defineExpose({ show });
</script>

<style>
.propeditor {
  position: absolute;
  float: right;
  top: 100px;
  right: 10px;
}

.editor {
  width: 100%;
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
  background: transparent;
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
