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
      <q-pull-to-refresh @refresh="refresh" v-if="!pinRequired">
        <component
          :is="'Tasksheet' + version.toUpperCase()"
          :timecards="timecards"
          :current-employee="currentEmployee"
          :pay-period="payPeriod"
          :end-of-pay-period="endOfPayPeriod"
          :jobs="jobs"
          :tasks="tasks"
          :no-employee="noEmployee"
          @save-timecard="onSaveTimecard"
          @save-entry="onSaveEntry"
          @select-pay-period="onSelectPayPeriod"
          ref="tasksheetForm"></component>
      </q-pull-to-refresh>
    </q-page-container>
  </q-layout>
</template>

<script>
import tasksheetApi from "../api/tasksheet";
import moment from "moment";
import { mainMixin } from "../mixins/index";

import TasksheetV1 from "../components/Tasksheets/TasksheetV1";

export default {
  name: "TasksheetResponse",
  mixins: [mainMixin],
  components: {
    TasksheetV1,
  },
  async created() {
    this.surveyId = this.$route.params.id;
    this.version = this.$route.params.version;

    const response = await tasksheetApi.getPageData(this.surveyId);
    this.logoUrl = response.logo;
    this.pinRequired = response.requiresPin;
    this.endOfPayPeriod = response.endOfPayPeriod;
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
    onSaveTimecard(timecard) {
      try {
        const timecardIndex = this.timecards.findIndex(t => t.id === timecard.id);
        this.timecards.splice(timecardIndex, 1, timecard);
      } catch (error) {
        console.error(error);
      }
    },
    onSaveEntry({ entry, timecardId }) {
      try {
        const timecard = this.timecards.find(t => t.id === timecardId);
        const timecardIndex = this.timecards.findIndex(t => t.id === timecardId);
        const entryIndex = timecard.entries.findIndex(e => e.id === entry.id);
        timecard.entries.splice(entryIndex, 1, entry);
        this.timecards.splice(timecardIndex, 1, timecard);
      } catch (error) {
        console.error(error);
      }
    },
    onSelectPayPeriod(val) {
      if (!val) {
        return;
      }

      this.payPeriod = val;
      this.fetchData(val);
    },
    setDefaultPayPeriod() {
      const today = moment().isoWeekday();
      let endOfWorkWeek = null;

      if (today <= this.endOfPayPeriod) {
        endOfWorkWeek = moment().isoWeekday(this.endOfPayPeriod).format("MM/DD/YYYY");
      } else {
        endOfWorkWeek = moment().add(1, 'weeks').isoWeekday(this.endOfPayPeriod).format("MM/DD/YYYY");
      }

      this.payPeriod = endOfWorkWeek;
      this.fetchData(endOfWorkWeek);
    },
    async refresh(done) {
      await this.fetchData(this.payPeriod);
      done();
    },
    async fetchData(payPeriod) {
      try {
        const payload = {
          surveyId: this.surveyId,
          pinCode: this.pinCode,
          payPeriod,
        };

        const response = await tasksheetApi.getTasksheets(payload);

        this.pinRequired = false;

        if (response.noEmployee) {
          this.noEmployee = true;
          return;
        }

        this.noEmployee = false;
        this.currentEmployee = response.employee || {};
        this.timecards = response.timecards;
        this.tasks = response.tasks;
        this.jobs = response.jobs;
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
      timecards: [],
      jobs: [],
      tasks: [],
      currentEmployee: {},
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
