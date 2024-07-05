<template>
  <div class="row col-12 q-gutter-sm q-pt-sm q-pb-md">
    <div :class="$q.screen.gt.xs ? 'column col' : 'column col-12'">
      <label class="label">Departments</label>
      <q-input
        dense
        filled
        v-model="departments"
        hint="list separated by comma"
        class="q-mb-sm"
      >
      </q-input>

      <label class="label">Status</label>
      <q-select
        dense
        filled
        clearable
        :options="['Complete', 'Incomplete']"
        v-model="statusFilter"
      >
      </q-select>
    </div>

    <div div :class="$q.screen.gt.xs ? 'column col' : 'column col-12'">
    </div>
  </div>
</template>

<script>
import reportApi from "src/api/report";
import { exportFile } from "quasar";

export default {
  name: "ExpiringServiceRequirementReport",
  props: {
    reportType: {},
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
          departments: this.departments,
          status: this.statusFilter || null,
        };

        const { fileName, file } = await reportApi.incompleteServiceRequirementsReport(payload);
        exportFile(fileName, file);
      } catch (error) {
        console.error(error.response.data ?? "Unable to generate report");
      } finally {
        this.loading = false;
      }
    },
    fillParameters(parameters) {
      return null;
    },
  },
  data: function () {
    return {
      loading: false,
      searchTerm: "",
      departments: "",
      statusFilter: null,
    };
  },
};
</script>

<style lang="scss" scoped>
.label {
  margin-bottom: 5px;
  color: rgb(116, 116, 116);
  font-weight: 400;
}
</style>
