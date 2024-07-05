<template>
  <q-card flat class="q-pt-md" style="height: calc(100vh - 50px)">
    <q-tabs
      v-model="tab"
      align="left"
      narrow-indicator
      inline-label
      active-bg-color="grey-4"
      class="bg-grey-3 q-mx-sm"
      indicator-color="transparent"
    >
      <q-tab name="hires" icon="description" label="Hires" no-caps />
    </q-tabs>
    <q-tab-panels
      v-model="tab"
      animated
      swipeable
      vertical
      transition-next="jump-up"
      transition-before="jump-up"
    >
      <q-tab-panel name="hires" class="q-pa-xs">
        <hires-index :size="size"></hires-index>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import HiresIndex from "./HiresIndex.vue";

export default {
  name: "HR",
  components: {
    HiresIndex
  },
  data: () => {
    return {
      tab: "hires",
      size: {}
    };
  }
};
</script>
