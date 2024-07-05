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
    </div>

    <div div :class="$q.screen.gt.xs ? 'column col' : 'column col-12'">
      <label class="label">Start Date</label>
      <q-input
        dense
        filled
        :error="startDateError !== null"
        :error-message="startDateError"
        v-model="startDate">
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="startDateRef" transition-show="scale" transition-hide="scale">
              <q-date today-btn color="primary" v-model="startDate" @update:model-value="$refs.startDateRef.hide()" mask="YYYY-MM-DD" no-unset>
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
      <label class="label">End Date</label>
      <q-input
        dense
        filled
        :error="endDateError !== null"
        :error-message="endDateError"
        v-model="endDate">
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="endDateRef" transition-show="scale" transition-hide="scale">
              <q-date today-btn color="primary" v-model="endDate" @update:model-value="$refs.endDateRef.hide()" mask="YYYY-MM-DD" no-unset>
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
    </div>
  </div>
</template>

<script>
  import reportApi from "src/api/report";
  import timekeepingApi from "src/api/timekeeping";
  import { exportFile } from "quasar";
  import moment from "moment";

  export default {
    name: "TimecardReport",
    props: {
      reportType: {}
    },
    async mounted() {
      const employees = await timekeepingApi.getAllEmployees();
      const timekeepingOptions = await timekeepingApi.getSettings();
      this.employees = employees;
      this.endOfPayPeriod = timekeepingOptions.endOfPayPeriod;
    },
    computed: {
      jobOptions() {
        return this.jobs
          .filter(job => !this.jobSearchTerm || job.name.toLowerCase().indexOf(this.jobSearchTerm?.toLowerCase()) > -1)
          .map(job => ({
            label: job.name,
            value: job.id
          }));
      },
      employeeOptions() {
        return this.employees
          .filter(employee => !this.employeeSearchTerm ||
            `${employee.firstName} ${employee.lastName}`
              .toLowerCase()
              .indexOf(this.employeeSearchTerm?.toLowerCase()) > -1)
          .map(employee => ({
            label: `${employee.firstName} ${employee.lastName}`,
            value: employee.employeeId
          }));
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

        this.startDateError = null;
        this.endDateError = null;

        if (!this.startDate) {
          this.startDateError = "Start date is required";
          errors = true;
        }

        if (!this.endDate) {
          this.endDateError = "End date is required";
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
            startDate: this.startDate,
            endDate: this.endDate,
          }

          const { fileName, file } = await reportApi.timecardReport(payload);
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
        endOfPayPeriod: 0,
        employees: [],
        selectedEmployees: [],
        selectedJobs: [],
        startDate: null,
        startDateError: null,
        endDate: null,
        endDateError: null,
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
