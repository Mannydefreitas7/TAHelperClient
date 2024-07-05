<template>
  <div class="full-height">
    <q-table
      v-if="!selectedEmployee"
      class="full-width"
      row-key="id"
      :rows="employees"
      :columns="timecardIndexColumns"
      :pagination="initialPagination"
      :filter="tasksheetSearchTerm"
      no-data-label="No Timecards Available"
      no-results-label="No Timecards Available">
      <template #top-left>
        <div class="text-h6 row items-center q-gutter-x-sm">
          <q-icon name="calendar_today" size="25px"></q-icon>
          <span>Weekly Tasksheets</span>
        </div>
      </template>

      <template #top-right>
        <q-input
          class="q-mr-sm"
          filled
          dense
          debounce="300"
          v-model="tasksheetSearchTerm"
          placeholder="Search"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-input readonly dense filled :model-value="selectedPayPeriod" label="Pay Period">
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale" ref="payPeriodDatePicker">
                <q-date
                  color="primary"
                  :first-day-of-week="endOfPayPeriod"
                  :options="isValidPickerDate"
                  v-model="selectedPayPeriod"
                  @update:model-value="val =>{getEmployees(val); $refs.payPeriodDatePicker.hide()}"
                  mask="MM/DD/YYYY"
                  no-unset>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </template>

      <template v-slot:body="props">
        <q-tr
          :class="{ 'bg-red-2': !props.row.status.id || props.row.status.id === 5, 'bg-green-2': props.row.status.id === 3, 'bg-blue-2': props.row.status.id === 4 || props.row.status.id === 6 }"
          :props="props"
          @click="selectEmployee({ ...props.row })">
          <q-td key="firstName" :props="props">
            {{ props.row.firstName }}
          </q-td>
          <q-td key="lastName" :props="props">
            {{ props.row.lastName }}
          </q-td>
          <q-td key="occupation" :props="props">
            {{ props.row.occupation }}
          </q-td>
          <q-td key="status" :props="props">
            <div class="row justify-between items-center">
              <span>
                {{ props.row.status.tooltip }}
              </span>
              <q-btn
                flat
                icon="edit"
                size="13px"
                dense
                @click.stop.prevent="selectEmployee({ ...props.row })"></q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <div v-else>
      <component
        :is="'TasksheetV1'"
        :timecards="selectedEmployee.timecards"
        :current-employee="selectedEmployee"
        :pay-period="selectedPayPeriod"
        :jobs="jobs"
        :tasks="tasks"
        @save-timecard="onSaveTimecard"
        @save-entry="onSaveEntry"
        @go-back="selectedEmployee = null"
        ref="tasksheetForm"></component>
    </div>
  </div>
</template>

<script>
  import { mainMixin } from "src/mixins/index";
  import { mapState } from "pinia";
  import { useTenantStore } from "src/stores/tenantStore";
  import tasksheetApi from "src/api/tasksheet";
  import timekeepingApi from "src/api/timekeeping";
  import moment from "moment";

  import TasksheetV1 from "./Tasksheets/TasksheetV1.vue";

  const timecardIndexColumns = [
    {
      name: "firstName",
      align: "left",
      label: "First Name",
      field: "firstName",
      sortable: true,
    },
    {
      name: "lastName",
      align: "left",
      label: "Last Name",
      field: "lastName",
      sortable: true,
    },
    {
      name: "occupation",
      align: "left",
      label: "Classification",
      field: "occupation",
      sortable: true,
    },
    {
      name: "status",
      align: "left",
      label: "Status",
      field: "status",
      sortable: true,
    },
  ];

  export default {
    name: "Tasksheets",

    mixins: [mainMixin],

    props: {
      size: Object,
    },

    components: {
      TasksheetV1
    },

    watch: {
      activeTenant: {
        immediate: true,
        async handler() {
          if (!this.activeTenant) {
            return;
          }

          this.statuses = await tasksheetApi.getTimecardStatuses();
          this.endOfPayPeriod = (await timekeepingApi.getSettings()).endOfPayPeriod || 0;
          this.jobs = await tasksheetApi.getJobs();
          this.tasks = await tasksheetApi.getTasks();
          await this.setDefaultPayPeriod();
        },
        deep: true,
      },
    },

    computed: {
      ...mapState(useTenantStore, ["activeTenant", "user"]),
      availablePayTypes() {
        return this.payTypes.map(payType => ({
          label: payType.name,
          value: payType.id
        }));
      }
    },

    methods: {
      isValidPickerDate(date) {
        const dateDow = moment(date).format("dddd");
        const payPeriodDow = moment().weekday(this.endOfPayPeriod).format("dddd");
        return dateDow === payPeriodDow;
      },
      onSaveTimecard(timecard) {
        try {
          const timecardIndex = this.selectedEmployee.timecards.findIndex(t => t.id === timecard.id);
          this.selectedEmployee.timecards.splice(timecardIndex, 1, timecard);
        } catch (error) {
          console.error(error);
        }
      },
      onSaveEntry({ entry, timecardId }) {
        try {
          const timecardIndex = this.selectedEmployee.timecards.findIndex(t => t.id === timecardId);
          const timecard = this.selectedEmployee.timecards.find(t => t.id === timecardId);
          const entryIndex = timecard.entries.findIndex(e => e.id === entry.id);
          timecard.entries.splice(entryIndex, 1, entry);
          this.selectedEmployee.timecards.splice(timecardIndex, 1, timecard);
        } catch (error) {
          console.error(error);
        }
      },
      async setDefaultPayPeriod() {
        const today = moment().isoWeekday();
        let endOfWorkWeek = null;

        if (today <= this.endOfPayPeriod) {
          endOfWorkWeek = moment().isoWeekday(this.endOfPayPeriod).format("MM/DD/YYYY");
        } else {
          endOfWorkWeek = moment().add(1, 'weeks').isoWeekday(this.endOfPayPeriod).format("MM/DD/YYYY");
        }

        this.selectedPayPeriod = endOfWorkWeek;
        await this.getEmployees(endOfWorkWeek);
      },
      async getEmployees(date) {
        try {
          if (!date) {
            return;
          }

          const response = await tasksheetApi.getEmployees(date);
          this.employees = response
            .map(employee => ({...employee, status: {...this.statuses[employee.status], id: employee.status}}));
        } catch (error) {
          console.error(error);
        }
      },
      async selectEmployee(employee) {
        try {
          const response = await tasksheetApi.getEmployeeTasksheets({
            employeeId: employee.id,
            payPeriod: this.selectedPayPeriod,
          });
          this.selectedEmployee = {...employee, timecards: response};
        } catch (error) {
          console.error(error);
        }
      },
    },

    data: () => {
      return {
        timecardIndexColumns,
        endOfPayPeriod: 0,
        tasks: [],
        jobs: [],
        payTypes: [],
        employees: [],
        statuses: {},
        selectedPayPeriod: null,
        selectedEmployee: null,
        clientSignatureOpen: false,
        employeeSignatureOpen: false,
        homemakerSupervisorSignatureOpen: false,
        tasksheetSearchTerm: '',
        entryForm: {
          open: false,
          entry: {},
          error: false,
        },
        initialPagination: {
          sortBy: "firstName",
          descending: false,
          rowsPerPage: 250,
        },
      };
    },
  }
</script>

<style lang="scss" scoped>
  .red-border {
    border: solid 6px $red-2;
  }
</style>
