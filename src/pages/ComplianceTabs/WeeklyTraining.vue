<template>
  <div class="full-height">
    <q-table
      v-if="!selectedEmployee"
      class="full-width"
      row-key="id"
      :rows="employees"
      :columns="indexColumns"
      :pagination="initialPagination"
      :filter="searchTerm"
      no-data-label="No Training Available"
      no-results-label="No Training Available"
    >
      <template #top-left>
        <div class="text-h6 row items-center q-gutter-x-sm">
          <q-icon name="calendar_today" size="25px"></q-icon>
          <span>Weekly Training</span>
        </div>
      </template>

      <template #top-right>
        <q-input
          class="q-mr-sm"
          outlined
          dense
          debounce="300"
          v-model="searchTerm"
          placeholder="Search"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-input
          readonly
          dense
          filled
          :model-value="selectedPayPeriod"
          label="Pay Period Ending"
        >
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                transition-show="scale"
                transition-hide="scale"
                ref="payPeriodDatePicker"
              >
                <q-date
                  color="primary"
                  :first-day-of-week="endOfPayPeriod"
                  :options="isValidPickerDate"
                  v-model="selectedPayPeriod"
                  @update:model-value="
                    (val) => {
                      getEmployees(val);
                      $refs.payPeriodDatePicker.hide();
                    }
                  "
                  mask="MM/DD/YYYY"
                  no-unset
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-btn
          icon="download"
          tooltip="Download"
          color="primary"
          unelevated
          class="q-ml-sm"
          @click="downloadTrainingReport"
        >
          <q-tooltip>Download report as Excel spreadsheet</q-tooltip>
        </q-btn>
      </template>

      <template v-slot:body="props">
        <q-tr
          :class="{
            'bg-red-2': false,
            'bg-green-2': false,
            'bg-blue-2': false,
          }"
          :props="props"
          @click="selectEmployee({ ...props.row })"
        >
          <q-td key="firstName" :props="props">
            {{ props.row.FirstName }}
          </q-td>
          <q-td key="lastName" :props="props">
            {{ props.row.LastName }}
          </q-td>
          <q-td key="department" :props="props">
            {{ props.row.Department }}
          </q-td>
          <q-td key="serviceRequirement" :props="props">
            {{ props.row.serviceRequirement }}
          </q-td>
          <q-td key="totalTime" :props="props">
            {{ formatSeconds(Math.ceil(props.row.totalSeconds)) }}
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <div v-else>
      <div v-if="selectedEmployee.sessions" class="q-ma-lg">
        <div class="text-h6 q-mb-md">
          Training Summary for {{ selectedEmployee.LastName }},
          {{ selectedEmployee.FirstName }}
        </div>
        <q-expansion-item
          :label="
            `Training sessions for ${getDtFormatted(selectedPayPeriod, 'MM/DD/YYYY')} - ${formatSeconds(Math.ceil(selectedEmployee.totalSeconds))}`
          "
          header-class="bg-grey-3 text-bold"
        >
          <ul class="q-ml-md">
            <li v-for="session in selectedEmployee.sessions">
              {{ getDtFormatted(session.StartDateTime) }}
              -
              {{ getDtFormatted(session.EndDateTime) }}
            </li>
          </ul>
        </q-expansion-item>
        <q-expansion-item
          v-if="selectedEmployee.completedTasks.length > 0"
          :label="`Completed Tasks - ${selectedEmployee.completedTasks.length}`"
          header-class="bg-grey-3 text-bold"
        >
          <ul class="q-ml-md">
            <li v-for="task in selectedEmployee.completedTasks">
              {{ task }}
            </li>
          </ul>
        </q-expansion-item>
        <q-expansion-item
          v-if="selectedEmployee.outstandingTasks.length > 0"
          :label="
            `Outstanding Tasks - ${selectedEmployee.outstandingTasks.length}`
          "
          header-class="bg-grey-3 text-bold"
        >
          <ul class="q-ml-md">
            <li v-for="task in selectedEmployee.outstandingTasks">
              {{ task }}
            </li>
          </ul>
        </q-expansion-item>
        <q-btn
          class="q-mt-md"
          label="Go Back"
          @click="selectedEmployee = null"
          color="primary"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mainMixin } from "../../mixins/index";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import expiringServiceRequirementsApi from "../../api/expiringServiceRequirements";
import timekeepingApi from "../../api/timekeeping";
import moment from "moment";
import session1TrainingData from "../../layouts/ServiceRequirementComponents/InserviceTrainingSession1Tasks";

const indexColumns = [
  {
    name: "firstName",
    align: "left",
    label: "First Name",
    field: "FirstName",
    sortable: true,
  },
  {
    name: "lastName",
    align: "left",
    label: "Last Name",
    field: "LastName",
    sortable: true,
  },
  {
    name: "department",
    align: "left",
    label: "Department",
    field: "department",
    sortable: true,
  },
  {
    name: "serviceRequirement",
    align: "left",
    label: "Service Requirement",
    field: "serviceRequirement",
    sortable: true,
  },
  {
    name: "totalTime",
    align: "left",
    label: "Total Time",
    field: "totalTime",
    sortable: true,
  },
];

export default {
  name: "WeeklyTraining",

  mixins: [mainMixin],

  props: {
    size: Object,
  },

  components: {},

  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        this.endOfPayPeriod =
          (await timekeepingApi.getSettings()).endOfPayPeriod || 0;
        await this.setDefaultPayPeriod();
      },
      deep: true,
    },
  },

  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"]),
  },

  methods: {
    isValidPickerDate(date) {
      const dateDow = moment(date).format("dddd");
      const payPeriodDow = moment()
        .weekday(this.endOfPayPeriod)
        .format("dddd");
      return dateDow === payPeriodDow;
    },
    async setDefaultPayPeriod() {
      const today = moment().isoWeekday();
      let endOfWorkWeek = null;

      if (today <= this.endOfPayPeriod) {
        endOfWorkWeek = moment()
          .isoWeekday(this.endOfPayPeriod)
          .format("MM/DD/YYYY");
      } else {
        endOfWorkWeek = moment()
          .add(1, "weeks")
          .isoWeekday(this.endOfPayPeriod)
          .format("MM/DD/YYYY");
      }

      this.selectedPayPeriod = endOfWorkWeek;
      await this.getEmployees(endOfWorkWeek);
    },
    async getEmployees(date) {
      try {
        if (!date) {
          return;
        }

        const response = await expiringServiceRequirementsApi.getEmployees(date);
        const sessions = response.map((e) => ({
          ...e,
          serviceRequirement:
            e.DeliveryMethod ===
            "ServiceRequirementInServiceTrainingSession1Response"
              ? "In-service Training-First Session"
              : "",
        }));
        this.employees = sessions.reduce((value, item) => {
          const employee = value.find(
            (v) =>
              v.FirstName === item.FirstName &&
              v.LastName === item.LastName &&
              v.Department === item.Department &&
              v.serviceRequirement === item.serviceRequirement
          );
          if (employee) {
            employee.totalSeconds += item.SessionSeconds;
            employee.sessions.push(item);
          } else {
            value.push({
              ...item,
              totalSeconds: item.SessionSeconds,
              sessions: [item],
            });
          }
          return value;
        }, []);
      } catch (error) {
        console.error(error);
      }
    },
    async selectEmployee(employee) {
      try {
        const tasks = await expiringServiceRequirementsApi.fetchEmployeeProgress(
          {
            id: employee.EmployeeId,
            deliveryMethod: employee.DeliveryMethod,
          }
        );
        const taskNames = tasks.map((t) => t.taskName);
        this.selectedEmployee = {
          ...employee,
          completedTasks: taskNames,
          outstandingTasks: Object.values(session1TrainingData.videos)
            .map((v) => v.label)
            .filter((l) => !taskNames.includes(l)),
        };
      } catch (error) {
        console.error(error);
      }
    },
    async downloadTrainingReport() {
      await expiringServiceRequirementsApi.downloadTrainingReport(this.selectedPayPeriod);
    },
  },

  data: () => {
    return {
      indexColumns,
      endOfPayPeriod: 0,
      employees: [],
      selectedPayPeriod: null,
      selectedEmployee: null,
      searchTerm: "",
      initialPagination: {
        sortBy: "firstName",
        descending: false,
        rowsPerPage: 250,
      },
    };
  },
};
</script>

<style lang="scss" scoped>
.red-border {
  border: solid 6px $red-2;
}
</style>
