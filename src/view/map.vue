<template>
  <div style="width: 100%; height: 100vh;">
    <map-multi-compare v-show="false" />
    <map-compare />
  </div>
</template>

<script>
import MapMultiCompare from '@/components/MapMultiCompare.vue'
import MapCompare from '@/components/MapCompare.vue'

export default {
  components: {
    MapMultiCompare,
    MapCompare
  }
}
</script>
