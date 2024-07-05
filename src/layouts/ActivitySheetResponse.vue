<template>
  <q-layout view="lHh Lpr lFf" class="bg-indigo-1">
    <q-page-container id="wrapper">
      <div
        v-if="logoUrl && !pinRequired && version !== 'v3'"
        class="row justify-center full-width q-py-lg"
      >
        <q-img
          :src="logoUrl"
          basic
          style="max-width: 250px"
          spinner-color="white"
          class="rounded-borders"
        />
      </div>

      <div v-if="pinRequired" class="q-pa-md q-gutter-md fixed-top">
        <div class="row justify-center full-width">
          <q-img
            :src="logoUrl"
            style="max-width: 150px"
            basic
            spinner-color="white"
            class="rounded-borders vertical-top"
          />
        </div>
        <form @submit.prevent>
          <q-input
            rounded
            outlined
            v-model.trim="pinCode"
            type="text"
            pattern="[0-9]*"
            label="Please enter your PIN"
            required
          >
            <template v-slot:prepend>
              <q-icon name="dialpad" />
            </template>
            <template v-slot:append>
              <q-btn
                rounded
                color="indigo-5"
                label="Submit"
                type="submit"
                @click="onLogin"
              />
            </template>
          </q-input>
          <div class="q-pt-md q-gutter-sm vertical-top">
            <q-banner rounded class="bg-purple-4 text-white">
              <template v-slot:avatar>
                <q-icon name="policy" color="white" />
              </template>
              <div class="row justify-between">
                <p class="text-subtitle1 q-mb-none q-mt-xs">
                  {{ this.getDisclaimer() }}
                </p>
              </div>
            </q-banner>
          </div>
        </form>
      </div>

      <component
        :is="'ActivitySheet' + version.toUpperCase()"
        :name="name"
        :pin-code="pinCode"
        :survey-id="surveyId"
        :pin-required="pinRequired"
        :end-of-pay-period="endOfPayPeriod"
        @set-pin-required="val => (pinRequired = val)"
        ref="activitySheet"
      ></component>
    </q-page-container>
  </q-layout>
</template>

<script>
import { getPageData, login } from "../api/activitySheet";
import { extend } from "quasar";
import { mainMixin } from "../mixins/index";

import ActivitySheetV1 from "../components/ActivitySheets/ActivitySheetV1.vue";
import ActivitySheetV2 from "../components/ActivitySheets/ActivitySheetV2.vue";
import ActivitySheetV3 from "../components/ActivitySheets/ActivitySheetV3.vue";

export default {
  name: "ActivitySheetResponse",

  mixins: [mainMixin],

  components: {
    ActivitySheetV1,
    ActivitySheetV2,
    ActivitySheetV3
  },

  async created() {
    try {
      const sheetId = this.$route.params.id;
      this.surveyId = this.$route.params.surveyId;
      this.version = this.$route.params.version;

      const response = await getPageData(this.surveyId, sheetId);
      this.logoUrl = response.logo;
      this.name = response.name;
      this.endOfPayPeriod = response.endOfPayPeriod;
      this.pinRequired = !!response.pinRequired;
      if (!!response.jwt) {
        this.pinRequired = false;
        localStorage.setItem("caregiver_jwt", response.jwt);
        this.setDefaults();
      }
    } catch (error) {
      console.error(error);
    }
  },

  methods: {
    getDisclaimer() {
      return import.meta.env.DISCLAIMER;
    },
    setDefaults() {
      this.$nextTick(async () => {
        const ref = this.$refs.activitySheet;
        if (ref.version === 1) {
          const formattedSheet = ref.setFormattedSheet({});
          ref.originalSheet = extend(true, {}, formattedSheet);
        } else if (ref.version === 2 || ref.version === 3) {
          await ref.fetchData(this.$route.params.id);
        }
      });
    },
    async onLogin() {
      try {
        const response = await login({
          pinCode: this.pinCode,
          surveyId: this.surveyId,
        });

        localStorage.setItem("caregiver_jwt", response.jwt);
        this.pinRequired = false;
        this.setDefaults();
      } catch (error) {
        console.error('Error: ', error);
        if (error.response?.status === 401) {
          this.showErrorMessage("Invalid pin. Please try again.");
        }
      }
    },
  },

  data() {
    return {
      pinRequired: true,
      endOfPayPeriod: 0,
      version: "",
      pinCode: "",
      surveyId: "",
      logoUrl: "",
      name: "",
      pageHeader: "",
      searchTerm: "",
      originalSheet: {},
      sheet: {},
      sheetTasks: {},
      signatureForm: {
        open: false,
        type: "",
        refName: null
      }
    };
  }
};
</script>

<style>
#wrapper {
  margin: auto;
}
#submit-button {
  margin-left: 10px;
}
.center-page {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 800px;
  width: 100vw;
}
canvas {
  z-index: 5000000000;
}
</style>
