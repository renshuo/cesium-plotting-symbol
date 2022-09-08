<template>
  <div style="position: relative">
    <div id="mapContainer"></div>
    <TopPane :gm="gm" style="position: absolute; top: 0px" />
    <PropEditor ref="propEdit" />
    <div>
      <input type="text" value="" />
      <button @click="getCurrentEnt" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
window.CESIUM_BASE_URL = "/Cesium";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import TopPane from "./TopPane.vue";

import { GraphManager } from "./cps/index.ts";
import PropEditor from "./cps/PropEditor/index.vue";
import Graph from "./cps/Graph";

const gm = ref();
const propEdit = ref();

function getCurrentEnt() {
  console.log("", gm.value.em.currentEditEnt);
}
onMounted(() => {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNWY5YzhhMS05ZmYxLTQ5NzgtOTcwNC0zZmViNGFjZjc4ODEiLCJpZCI6ODU0MjMsImlhdCI6MTY0Njk4ODA1NX0.4-plF_5ZfEMMpHqJyefkDCFC8JWkFw39s3yKVcNg55c";
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
    100,
    30,
    110,
    40
  );
  let viewer = new Cesium.Viewer("mapContainer", {
    infoBox: false, //是否显示信息框
    selectionIndicator: false, //是否显示选取指示器组件
    timeline: false, //是否显示时间轴
    animation: false, //是否创建动画小器件，左下角仪表
    terrainProvider: Cesium.createWorldTerrain()
  });

  viewer.scene.fog.enabled = false

  gm.value = new GraphManager(viewer, {
    layerId: "testbh1",
    editAfterCreate: true,
  });

  gm.value.setGraphSelectHandler( (ent: Graph) => {
    if (ent) {
      propEdit.value.show(true, ent)
      let propDefs = ent.propDefs
      let props = ent.props
      console.log("handle select ent in top", propDefs, props)
    } else {
      propEdit.value.show(false, ent)
      console.log("unselect")
    }
  })

  gm.value.setGraphFinishHandler( (ent: Graph) => {
    console.log("handler graph finish: ", ent)
  })
});
</script>

<style></style>
