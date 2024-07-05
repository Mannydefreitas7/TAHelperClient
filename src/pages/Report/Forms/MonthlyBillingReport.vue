<template>
  <div class="row col-12 q-gutter-sm q-pt-sm q-pb-md">
    <div :class="$q.screen.gt.xs ? 'column col' : 'column col-12'">
      <label class="label">Year</label>
      <q-input
        dense
        filled
        readonly
        :error="yearError !== null"
        :error-message="yearError"
        v-model="year"
      >
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              transition-show="scale"
              transition-hide="scale"
              ref="year"
            >
              <q-date
                v-model="year"
                navigation-min-year-month="2023/07"
                color="primary"
                mask="YYYY"
                minimal
                no-unset
                emit-immediately
                default-view="Years"
                @update:model-value="$refs.year.hide()"
              >
                <div class="row justify-end">
                  <q-btn label="Close" color="primary" flat v-close-popup />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <div div :class="$q.screen.gt.xs ? 'column col' : 'column col-12'">
      <label class="label">Month</label>
      <q-input
        dense
        filled
        readonly
        :error="monthError !== null"
        :error-message="monthError"
        v-model="month"
      >
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              transition-show="scale"
              transition-hide="scale"
              ref="month"
            >
              <q-date
                v-model="month"
                today-btn
                minimal
                color="primary"
                mask="MMMM"
                no-unset
                emit-immediately
                default-view="Months"
                @update:model-value="$refs.month.hide()"
              >
                <div class="row justify-end">
                  <q-btn label="Close" color="primary" flat v-close-popup />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script>
import reportApi from "src/api/report";
import { exportFile } from "quasar";
import moment from "moment";

export default {
  name: "AdditionalShiftsRequestedReport",
  props: {
    reportType: {}
  },
  mounted() {
    this.onProjectSelected();
  },
  methods: {
    onProjectSelected() {
      return null;
    },
    validateReportParameters() {
      let errors = false;

      this.yearError = null;
      this.monthError = null;

      if (!this.year) {
        this.yearError = "Year is required";
        errors = true;
      }
      if (!this.month) {
        this.monthError = "Month is required";
        errors = true;
      }
      if (this.year <= 2023 && moment().month(this.month).format("M") <= 6) {
        this.monthError = "Report cannot be run before 2023/7";
        errors = true;
      }

      const now = new Date();
      if (this.year && this.year > now.getFullYear()) {
        this.yearError = "Cannot run for future dates";
        errors = true;
      }
      if (
        this.year == now.getFullYear() &&
        this.month != null &&
        moment()
          .month(this.month)
          .format("M") > moment(now).format("M")
      ) {
        this.monthError = "Cannot run for future dates";
        errors = true;
      }

      return errors;
    },
    getParameters() {
      return {};
    },
    getReportDescription(parameters) {
      let description = "";

      return description;
    },
    async onGenerate() {
      try {
        if (this.validateReportParameters()) {
          return;
        }

        this.loading = true;

        const payload = {
          month: this.month,
          year: this.year
        };

        const { fileName, file } = await reportApi.campaignsAndChatsReport(
          payload
        );
        exportFile(fileName, file);
      } catch (error) {
        console.error(error.response.data ?? "Unable to generate report");
      } finally {
        this.loading = false;
      }
    },
    fillParameters(parameters) {
      return null;
    }
  },
  data: function() {
    return {
      loading: false,
      month: null,
      monthError: null,
      year: new Date().getFullYear(),
      yearError: null
    };
  }
};
</script>

<style lang="scss" scoped>
.label {
  margin-bottom: 5px;
  color: rgb(116, 116, 116);
  font-weight: 400;
}
</style>
