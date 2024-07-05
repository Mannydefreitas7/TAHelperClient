<template>
  <q-layout view="lHh lpR lff" container class="full-width" style="height: calc(100vh - 50px)">
    <q-drawer :width="300" show-if-above bordered :breakpoint="690">
      <q-scroll-area class="fit">
        <div class="row justify-between q-px-md q-py-sm">
          <span class="text-h5 text-weight-bold">Account Settings</span>
        </div>
        <!-- <q-separator /> -->
        <q-list separator>
          <q-item
            class="q-py-md"
            active-class="bg-grey-3"
            clickable
            v-ripple
            separator
            :active="currentComponent === section.currentComponent"
            @click="currentComponent = section.currentComponent"
            v-for="(section, index) in accountSections"
            :key="index"
          >
            <q-item-section avatar>
              <q-avatar :icon="section.icon" size="lg" class="q-mr-sm" color="grey-9" text-color="white" />
            </q-item-section>
            <q-item-section>
              <span class="text-weight-bold">{{ section.name }}</span>
            </q-item-section>
          </q-item>
          <q-separator />
        </q-list>

      </q-scroll-area>
    </q-drawer>

    <q-page-container class="fit">
      <q-page class="fit">
        <q-scroll-area class="q-pa-none bg-white" style="height: calc(100vh - 50px)">
          <q-toolbar class="text-black">
            <q-item class="q-pl-sm q-py-xs">
              <q-item-section>
                <q-item-label lines="1">
                  <span class="text-h5">{{ activeTenant?.name }} - {{ currentComponent.replace(/([A-Z])/g, ' $1').trim() }}</span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-space />
            <q-item-section side>
              <q-btn
                v-if="currentComponent !== 'TeamSettings'"
                label="SAVE"
                unelevated
                color="primary"
                @click="save" />
            </q-item-section>
          </q-toolbar>
          <q-separator />
          <component :is='currentComponent' ref="currentComponentRef"/>
        </q-scroll-area>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import TeamSettings from "components/Account/TeamSettings.vue";
import GeneralSettings from "components/Account/GeneralSettings.vue";
import IntegrationSettings from "components/Account/IntegrationSettings.vue";
import CampaignSettings from "components/Account/CampaignSettings.vue";
import ChatSettings from "components/Account/ChatSettings.vue";
import DocumentSettings from "components/Account/DocumentSettings.vue";
import TimekeepingSettings from "components/Account/TimekeepingSettings.vue";
import SurveySettings from "components/Account/SurveySettings.vue";
import TaskSettings from "components/Account/TaskSettings.vue";

export default {
  name: "Account",
  components: {
    TeamSettings,
    GeneralSettings,
    IntegrationSettings,
    CampaignSettings,
    ChatSettings,
    DocumentSettings,
    TimekeepingSettings,
    SurveySettings,
    TaskSettings,
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"]),
  },
  methods: {
    async save() {
      await this.$refs.currentComponentRef.save();
    }
  },
  data() {
    return {
      currentComponent: 'TeamSettings',
      accountSections: [
        {
          name: "Team",
          icon: "groups",
          currentComponent: 'TeamSettings'
        },
        {
          name: "Account",
          icon: "home_work",
          currentComponent: 'GeneralSettings'
        },
        {
          name: "Integration",
          icon: "construction",
          currentComponent: 'IntegrationSettings'
        },
        {
          name: "Campaign",
          icon: "o_campaign",
          currentComponent: 'CampaignSettings'
        },
        {
          name: "Chat",
          icon: "o_forum",
          currentComponent: 'ChatSettings'
        },
        {
          name: "Document",
          icon: "o_description",
          currentComponent: 'DocumentSettings'
        },
        {
          name: "Timekeeping",
          icon: "o_date_range",
          currentComponent: 'TimekeepingSettings'
        },
        {
          name: "Survey",
          icon: "o_fact_check",
          currentComponent: 'SurveySettings'
        },
        {
          name: "Tasks",
          icon: "o_task",
          currentComponent: 'TaskSettings'
        }
      ],
    };
  },
};
</script>
