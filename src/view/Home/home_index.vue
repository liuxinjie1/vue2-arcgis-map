<template>
  <div id="body" style="width: 100%; height: 100%">
    <esri-map ref="esriMap" style="flex: 1" @initCompleted="initCompleted"></esri-map>
  </div>
</template>

<script>
import esriMap from "../../components/mapplugin/mapdetail";

export default {
  components: {
    esriMap,
  },

  data() {
    return {
    };
  },

  mounted() {
  },
  beforeDestroy() {
  },
  Updated() {
  },

  methods: {
    initCompleted() { },
    getShapearea() { },
  },
};
</script>

<style lang="scss" scoped></style>