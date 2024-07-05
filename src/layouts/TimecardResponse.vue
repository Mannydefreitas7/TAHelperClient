<template>
  <q-layout view="lHh Lpr lFf" class="bg-indigo-1">
    <q-page-container id="wrapper">
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
                @click="setDefaultPayPeriod"
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
      <div v-if="!pinRequired">
        <component
          :is="'Timecard' + version.toUpperCase()"
          :timecard="timecard"
          :end-of-pay-period="endOfPayPeriod"
          :no-employee="noEmployee"
          :pay-period="payPeriod"
          :survey-id="surveyId"
          :pin-code="pinCode"
          :name="name"
          @select-pay-period="onSelectPayPeriod"
          @save-timecard="onSaveTimecard"
          ref="timecardForm"></component>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import timecardApi from "../api/employeeTimecard";
import moment from "moment";
import { mainMixin } from "../mixins/index";

import TimecardV1 from "../components/Timecards/TimecardV1";

export default {
  name: "TimecardResponse",
  mixins: [mainMixin],
  components: {
    TimecardV1,
  },
  async created() {
    this.surveyId = this.$route.params.id;
    this.version = this.$route.params.version;

    const response = await timecardApi.getPageData(this.surveyId);
    this.logoUrl = response.logo;
    this.pinRequired = response.requiresPin;
    this.endOfPayPeriod = response.endOfPayPeriod;
    this.previousWeekPayPeriod = response.previousWeekPayPeriod;
  },
  computed: {
    formattedSqlData() {
      const { timecardForm } = this.$refs;
      if (timecardForm) {
        return timecardForm.formatSqlData(this.entries);
      }
    }
  },
  methods: {
    getDisclaimer() {
      return import.meta.env.DISCLAIMER;
    },
    setDefaultPayPeriod() {
      const today = moment().isoWeekday();
      let endOfWorkWeek = null;

      if (today <= this.endOfPayPeriod) {
        let day = moment().isoWeekday(this.endOfPayPeriod);
        if (this.previousWeekPayPeriod) {
          day = day.subtract(1, 'week');
        }

        endOfWorkWeek = day.format("MM/DD/YYYY");
      } else {
        let day = moment().add(1, 'weeks').isoWeekday(this.endOfPayPeriod);
        if (this.previousWeekPayPeriod) {
          day = day.subtract(1, 'week');
        }

        endOfWorkWeek = day.format("MM/DD/YYYY");
      }

      this.payPeriod = endOfWorkWeek;
      this.fetchData(endOfWorkWeek);
    },
    onSaveTimecard(timecard) {
      this.timecard = timecard;
    },
    async onSelectPayPeriod(payPeriod) {
      this.payPeriod = payPeriod;
      await this.fetchData(payPeriod);

      this.$refs.timecardForm.setTimecardEntryLines(this.timecard.entries);
    },
    async fetchData(payPeriod) {
      try {
        const payload = {
          surveyId: this.surveyId,
          pinCode: this.pinCode,
          payPeriod,
        };

        const response = await timecardApi.getTimecard(payload);

        this.pinRequired = false;

        if (response.noEmployee) {
          this.noEmployee = true;
          return;
        }

        this.noEmployee = false;
        this.timecard = response;
        this.name = response.firstName + ' ' + response.lastName;
      } catch (error) {
        if (error.response?.status === 401) {
          console.error("Invalid Pin");
          this.pinRequired = true;
          this.showErrorMessage(error.response?.message || "Invalid pin. Please try again");
        }

        console.error(error.response?.message || error);
      }
    },
  },
  data() {
    return {
      pinRequired: true,
      noEmployee: false,
      version: "",
      pinCode: "",
      surveyId: "",
      logoUrl: "",
      payPeriod: null,
      endOfPayPeriod: 0,
      timecard: {},
      name: '',
      previousWeekPayPeriod: false,
    };
  },
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
