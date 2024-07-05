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
      <q-tab name="consent" icon="o_task_alt" label="Consent" no-caps />
    </q-tabs>
    <q-tab-panels
      v-model="tab"
      animated
      swipeable
      vertical
      transition-next="jump-up"
      transition-before="jump-up"
    >
      <q-tab-panel name="consent" class="q-pa-sm">
        <consent @count="consentCount = $event" :size="size"></consent>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import Consent from "./Consent.vue";

export default {
  name: "Forms",
  components: {
    Consent,
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
          const foundTenant = data.find((tenant) => tenant.id == tenantId);
          await this.selectTenant(foundTenant);
        }

        if (this.$route.query.hasOwnProperty("consentId")) {
          this.tab = "consent";
        }
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "tenants"]),
  },
  methods: {
    ...mapActions(useTenantStore, ["selectTenant"]),
  },
  data: () => {
    return {
      tab: "consent",
      size: {},
    };
  },
};
</script>
