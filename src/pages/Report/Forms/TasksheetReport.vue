<template>
  <div class="row col-12 q-gutter-sm q-pt-sm q-pb-md">
    <div :class="$q.screen.gt.xs ? 'column col' : 'column col-12'">
      <label class="label">Employees</label>
      <q-select
        dense
        filled
        clearable
        bottom-slots
        emit-value
        map-options
        use-input
        multiple
        use-chips
        @filter="(val, done) => {
          employeeSearchTerm = val.toLowerCase();
          done();
        }"
        :options="employeeOptions"
        v-model="selectedEmployees"
        input-debounce="0"
        @blur="employeeSearchTerm = null">
        <template v-if="!selectedEmployees.length && !employeeSearchTerm" v-slot:selected>
          Any
        </template>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey text-center">No Data</q-item-section>
          </q-item>
        </template>
      </q-select>

      <label class="label">Jobs</label>
      <q-select
        dense
        filled
        clearable
        bottom-slots
        emit-value
        map-options
        use-input
        multiple
        use-chips
        @filter="(val, done) => {
          jobSearchTerm = val.toLowerCase();
          done();
        }"
        :options="jobOptions"
        v-model="selectedJobs"
        input-debounce="0"
        @blur="jobSearchTerm = null">
        <template v-if="!selectedJobs.length && !jobSearchTerm" v-slot:selected>
          Any
        </template>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey text-center">No Data</q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <div div :class="$q.screen.gt.xs ? 'column col' : 'column col-12'">
      <label class="label">Pay Period</label>
      <q-input
        readonly
        dense
        filled
        :error="payPeriodError !== null"
        :error-message="payPeriodError"
        v-model="payPeriod">
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale" ref="payPeriodProxyRef">
              <q-date
                color="primary"
                :first-day-of-week="endOfPayPeriod"
                :options="isValidPickerDate"
                v-model="payPeriod"
                mask="YYYY-MM-DD" no-unset
                @update:model-value="$refs.payPeriodProxyRef.hide()">
                <div class="row justify-end">
                  <q-btn
                    label="Close"
                    color="primary"
                    flat
                    v-close-popup />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-checkbox
        v-model="onlyShowApproved"
        label="Approved Only"
        class="q-mt-lg" />
    </div>
  </div>
</template>

<script>
  import reportApi from "src/api/report";
  import tasksheetApi from "src/api/tasksheet";
  import timekeepingApi from "src/api/timekeeping";
  import { exportFile } from "quasar";
  import moment from "moment";

  export default {
    name: "TasksheetReport",
    props: {
      reportType: {}
    },
    async mounted() {
      const jobs = await tasksheetApi.getJobs();
      const employees = await timekeepingApi.getAllEmployees();
      const timekeepingOptions = await timekeepingApi.getSettings();
      this.jobs = jobs;
      this.employees = employees;
      this.endOfPayPeriod = timekeepingOptions.endOfPayPeriod;
    },
    computed: {
      jobOptions() {
        return this.jobs.filter(job => {
          if (!this.jobSearchTerm || job.name.toLowerCase().indexOf(this.jobSearchTerm?.toLowerCase()) > -1) {
            return true;
          }

          return false;
        }).map(job => ({
          label: job.name,
          value: job.id
        })).sort((a, b) => a.label.localeCompare(b.label));
      },
      employeeOptions() {
        return this.employees.filter(employee => {
          if (!this.employeeSearchTerm || `${employee.firstName} ${employee.lastName}`.toLowerCase().indexOf(this.employeeSearchTerm?.toLowerCase()) > -1) {
            return true;
          }

          return false;
        }).map(employee => ({
          label: `${employee.lastName}, ${employee.firstName}`,
          value: employee.id
        })).sort((a, b) => a.label.localeCompare(b.label));
      },
    },
    methods: {
      isValidPickerDate(date) {
        const dateDow = moment(date).format("dddd");
        const payPeriodDow = moment().weekday(this.endOfPayPeriod).format("dddd");
        return dateDow === payPeriodDow;
      },
      validateReportParameters() {
        let errors = false;

        this.payPeriodError = null;

        if (!this.payPeriod) {
          this.payPeriodError = "Pay period is required";
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
            employeeIds: this.selectedEmployees,
            jobIds: this.selectedJobs,
            payPeriod: this.payPeriod,
            onlyShowApproved: this.onlyShowApproved,
          }

          const { fileName, file } = await reportApi.tasksheetReport(payload);
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
        employeeSearchTerm: "",
        jobSearchTerm: "",
        endOfPayPeriod: 0,
        jobs: [],
        employees: [],
        selectedEmployees: [],
        selectedJobs: [],
        payPeriod: null,
        payPeriodError: null,
        onlyShowApproved: false,
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
