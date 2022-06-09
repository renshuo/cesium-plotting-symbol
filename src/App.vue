<template>
  <div style="position: relative">
    <div id="mapContainer"></div>
    <TopPane :gm="gm" style="position: absolute; top: 0px" />
    <PropEditor ref="popEdit" />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
window.CESIUM_BASE_URL = '/Cesium';
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

import TopPane from './TopPane.vue'

import cps from './cps/index.js'
import {PropEditor} from './cps/index.js'

const gm = ref()
const popEdit = ref()

onMounted(() => {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNWY5YzhhMS05ZmYxLTQ5NzgtOTcwNC0zZmViNGFjZjc4ODEiLCJpZCI6ODU0MjMsImlhdCI6MTY0Njk4ODA1NX0.4-plF_5ZfEMMpHqJyefkDCFC8JWkFw39s3yKVcNg55c';
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
    100, 30, 110, 40
  )
  let viewer = new Cesium.Viewer('mapContainer', {});

  gm.value = new cps(viewer, {
    propEditor: popEdit,
    layerId: 'testbh1',
    editAfterCreate: true
  })
  viewer.cps = gm.value

})

</script>

<style>
</style>
