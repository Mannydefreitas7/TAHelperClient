<template>
  <p class="text-grey-7 text-center q-mb-none">Please run report below for this tenant</p>
</template>

<script>
  import reportApi from "src/api/report";
  import { exportFile } from "quasar";

  export default {
    name: "InvalidNumberReport",
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
        return false;
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

          const { fileName, file } = await reportApi.invalidNumberReport();
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
        loading: false
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
