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
      <q-tab
        name="corrections"
        icon="description"
        label="Submissions"
        no-caps
      />
      <q-tab
        name="activity-sheets"
        icon="calendar_today"
        label="Activity Sheets"
        no-caps
      />
      <q-tab
        name="tasksheets"
        icon="calendar_today"
        label="Tasksheets"
        no-caps
      />
      <q-tab name="timecards" icon="calendar_today" label="Timecards" no-caps />
    </q-tabs>
    <q-tab-panels
      v-model="tab"
      animated
      swipeable
      vertical
      transition-next="jump-up"
      transition-before="jump-up"
    >
      <q-tab-panel name="corrections" class="q-pa-sm">
        <timecard-corrections @count="timecardCorrectionCount = $event" :size="size"></timecard-corrections>
      </q-tab-panel>
      <q-tab-panel name="tasksheets" class="q-pa-sm">
        <tasksheets :size="size"></tasksheets>
      </q-tab-panel>
      <q-tab-panel name="activity-sheets" class="q-pa-sm">
        <activity-sheets :size="size"></activity-sheets>
      </q-tab-panel>
      <q-tab-panel name="timecards" class="q-pa-sm">
        <timecard-tracking :size="size"></timecard-tracking>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";

import TimecardCorrections from "./TimecardCorrections.vue";
import TimecardTracking from "./TimecardTracking.vue";
import ActivitySheets from "./ActivitySheets.vue";
import Tasksheets from "./Tasksheets.vue";

export default {
  name: "Timekeeping",
  components: {
    TimecardCorrections,
    TimecardTracking,
    ActivitySheets,
    Tasksheets
  },
  watch: {
    activeTenant: {
      immediate: true,
      async handler(activeTenant) {
        if (!activeTenant) {
          return;
        }

        const module = this.$route.params.module;
        if (!!module) {
          this.tab = module.toLowerCase();
        }

        const tenantId = this.$route.query.tenantId;
        if (!!tenantId && activeTenant.id != tenantId) {
          const foundTenant = this.tenants.find(
            tenant => tenant.id == tenantId
          );
          await this.selectTenant(foundTenant);
        }

        if (this.$route.query.hasOwnProperty("timecardId")) {
          this.tab = "timecards";
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "tenants"])
  },
  methods: {
    ...mapActions(useTenantStore, ["selectTenant"])
  },
  data: () => {
    return {
      tab: "corrections",
      size: {},
    };
  }
};
</script>
