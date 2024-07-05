<template>
  <q-scroll-area class="q-pa-none bg-white" style="height: calc(100vh - 100px)">
    <q-card-section class="row justify-between" v-if="availableReportType">
      <p style="font-size: 17px" class="q-ma-none">
        {{ addSpaceBetweenCaptials(availableReportType) }}
      </p>
    </q-card-section>

    <q-separator v-if="availableReportType" />

    <q-card-section
      class="row justify-center q-py-lg"
      v-if="availableReportType"
    >
      <component
        v-if="availableReportType"
        :is="availableReportType"
        :reportType="availableReportType"
        ref="reportForm"
      ></component>
      <p v-else class="text-grey-7 q-ma-none">No Data</p>
    </q-card-section>

    <q-separator v-if="availableReportType" />

    <q-card-section
      class="row justify-between q-gutter-sm"
      v-if="availableReportType"
    >
      <q-btn color="grey-4" class="text-black" @click="onGoBack">Go Back</q-btn>

      <q-btn color="positive" :disabled="loading" @click="onGenerate"
        >Run Report</q-btn
      >
    </q-card-section>
  </q-scroll-area>
</template>

<script>
import { availableReports } from "../../boot/shared.js";

import InvalidNumberReport from "./Forms/InvalidNumberReport.vue";
import SentWithRepliesReport from "./Forms/SentWithRepliesReport.vue";
import AdditionalShiftsRequestedReport from "./Forms/AdditionalShiftsRequestedReport.vue";
import ResponseAlertAcknowledgementsReport from "./Forms/ResponseAlertAcknowledgementsReport.vue";
import TasksheetReport from "./Forms/TasksheetReport.vue";
import TimecardReport from "./Forms/TimecardReport.vue";
import MonthlyBillingReport from "./Forms/MonthlyBillingReport.vue";
import ExpiringServiceRequirementReport from "./Forms/ExpiringServiceRequirementReport.vue";

export default {
  name: "RunReportScreen",
  components: {
    InvalidNumberReport,
    SentWithRepliesReport,
    AdditionalShiftsRequestedReport,
    ResponseAlertAcknowledgementsReport,
    TasksheetReport,
    TimecardReport,
    MonthlyBillingReport,
    ExpiringServiceRequirementReport
  },
  methods: {
    createValue(val, done) {
      done(val, "add-unique");
    },
    addSpaceBetweenCaptials(s) {
      return s ? s.replace(/([A-Z])/g, " $1").trim() : s;
    },
    onGenerate() {
      this.$refs.reportForm.onGenerate();
    },
    onGoBack() {
      this.$router.replace("/Report");
    }
  },
  async mounted() {
    this.loading = true;

    Object.keys(availableReports).forEach(group => {
      const foundReport = availableReports[group].find(
        report =>
          report.toLowerCase().trim() ===
          this.$route.params.report.toLowerCase().trim()
      );

      if (foundReport) this.availableReportType = foundReport;
    });

    this.loading = false;
  },
  data: function() {
    return {
      loading: false,
      availableReportType: null
    };
  }
};
</script>

<style lang="scss" scoped>
.label {
  font-size: 17px;
  margin-bottom: 5px;
  color: rgb(116, 116, 116);
  font-weight: 400;
}
</style>
