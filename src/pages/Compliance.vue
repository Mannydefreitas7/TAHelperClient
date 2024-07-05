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
        name="submissions"
        icon="description"
        label="Submissions"
        no-caps
      />
      <q-tab
        name="weeklyTraining"
        icon="calendar_today"
        label="Weekly Training"
        no-caps
      />
    </q-tabs>
    <q-tab-panels
      v-model="tab"
      animated
      swipeable
      vertical
      transition-next="jump-up"
      transition-before="jump-up"
    >
      <q-tab-panel name="submissions" class="q-pa-sm">
        <submissions></submissions>
      </q-tab-panel>
      <q-tab-panel name="weeklyTraining" class="q-pa-sm">
        <weekly-training></weekly-training>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import Submissions from "./ComplianceTabs/Submissions.vue";
import WeeklyTraining from "./ComplianceTabs/WeeklyTraining.vue";

export default {
  name: "Compliance",
  components: {
    Submissions,
    WeeklyTraining
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
          const { data } = await axiosInstance.get(`${import.meta.env.BASE_URL}/user/tenants`);
          const foundTenant = data.find(tenant => tenant.id == tenantId);
          await this.selectTenant(foundTenant);
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"])
  },
  methods: {
    ...mapActions(useTenantStore, ["selectTenant"]),
  },
  data: () => {
    return {
      tab: "submissions",
    };
  }
};
</script>
