<template>
  <q-form class="row flex-stretch">
    <q-item class="col-12 col-sm-6">
      <q-item-section>
        <q-input
          label="Client Name"
          :model-value="sheetCopy.clientName"
          readonly
          hide-bottom-space
          filled></q-input>
      </q-item-section>
    </q-item>

    <q-item class="col-12 col-sm-6">
      <q-item-section>
        <q-input
          label="Client ID"
          :model-value="sheetCopy.clientId"
          readonly
          hide-bottom-space
          filled></q-input>
      </q-item-section>
    </q-item>

    <!-- Weekdays -->
    <q-item class="col-12" v-if="$q.screen.gt.sm">
      <q-item-section>
        <q-expansion-item label="Times" header-class="bg-grey-3">
          <q-markup-table flat bordered>
            <thead>
              <tr>
                <th class="text-left">Day</th>
                <th class="text-left">Date</th>
                <th class="text-left">Time In</th>
                <th class="text-left">Time Out</th>
                <th class="text-left">Total Hours</th>
                <th class="text-left">Client Signature</th>
                <th class="text-left"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="index in 7" :key="index">
                <td class="text-left">{{ moment().isoWeekday(index).format('dddd') }}</td>
                <td class="text-left">
                  {{sheetCopy['date' + index]}}
                </td>
                <td class="text-left">
                  {{sheetCopy['timeIn' + index]}}
                </td>
                <td class="text-left">
                  {{sheetCopy['timeOut' + index]}}
                </td>
                <td class="text-left">
                  {{sheetCopy['totalHours' + index]}}
                </td>
                <td class="text-left">
                  <div :class="$q.screen.gt.xs ? 'col q-ml-xs' : 'col-12'">
                    <q-img
                      :src="sheetCopy['clientSignature' + index + '_64']"
                      contain
                      width="200px"
                      height="50px"
                      style="border: 1px solid black"></q-img>
                  </div>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-expansion-item>
      </q-item-section>
    </q-item>

    <q-item class="col-12" v-else>
      <q-item-section>
        <q-expansion-item label="Times" header-class="bg-grey-3 shadow-2">
          <div class="row justify-center">
            <q-card
              v-for="index in 7"
              :key="index"
              class="q-my-md q-mx-sm shadow-2">
              <q-card-section>
                <q-item>
                  <h5 class="q-ma-none"><strong>{{ moment().isoWeekday(index).format('dddd') }}</strong></h5>
                </q-item>

                <div class="row">
                  <q-item class="col-12 col-sm-6">
                    <q-input
                      :model-value="sheetCopy['date' + index]"
                      readonly
                      filled
                      label="Date"
                      class="full-width" />
                  </q-item>

                  <q-item class="col-12 col-sm-6">
                    <q-input
                      :model-value="sheetCopy['timeIn' + index]"
                      readonly
                      filled
                      label="Time In"
                      class="full-width" />
                  </q-item>

                  <q-item class="col-12 col-sm-6">
                    <q-input
                      :model-value="sheetCopy['timeOut' + index]"
                      readonly
                      filled
                      label="Time Out"
                      class="full-width" />
                  </q-item>

                  <q-item class="col-12 col-sm-6">
                    <q-input
                      label="Total Hours"
                      class="full-width"
                      :model-value="sheetCopy['totalHours' + index]"
                      readonly
                      hide-bottom-space
                      filled></q-input>
                  </q-item>

                  <q-item class="col-12">
                    <div :class="$q.screen.gt.xs ? 'col q-ml-xs' : 'col-12'">
                      <q-img
                        :src="sheetCopy['clientSignature' + index + '_64']"
                        contain
                        width="100%"
                        height="80px"
                        style="border: 1px solid black"></q-img>
                    </div>
                  </q-item>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-expansion-item>
      </q-item-section>
    </q-item>

    <!-- Tasks -->
    <q-item class="col-12" v-if="$q.screen.gt.sm">
      <q-item-section>
        <q-expansion-item label="Tasks" header-class="bg-grey-3">
          <div class="row justify-end full-width">
            <q-input
              v-model="searchTerm"
              label="Search"
              class="q-ma-md full-width"
              style="max-width: 300px"
              filled
              clearable>
              <template #append>
                <q-icon name="search" class="cursor-pointer"></q-icon>
              </template>
            </q-input>
          </div>

          <q-markup-table separator="cell" flat bordered>
            <thead>
              <tr>
                <th v-for="({name, value}) in sheetTotals" class="text-left">{{name}} ({{value}})</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in availableTasks" :key="task">
                <td class="text-left">
                  {{task}}
                </td>
                <td class="text-left">
                  {{!!sheetCopyTasks[task].sunday ? sheetCopyTasks[task].sunday : 0}}
                </td>
                <td class="text-left">
                  {{!!sheetCopyTasks[task].monday ? sheetCopyTasks[task].monday : 0}}
                </td>
                <td class="text-left">
                  {{!!sheetCopyTasks[task].tuesday ? sheetCopyTasks[task].tuesday : 0}}
                </td>
                <td class="text-left">
                  {{!!sheetCopyTasks[task].wednesday ? sheetCopyTasks[task].wednesday : 0}}
                </td>
                <td class="text-left">
                  {{!!sheetCopyTasks[task].thursday ? sheetCopyTasks[task].thursday : 0}}
                </td>
                <td class="text-left">
                  {{!!sheetCopyTasks[task].friday ? sheetCopyTasks[task].friday : 0}}
                </td>
                <td class="text-left">
                  {{!!sheetCopyTasks[task].saturday ? sheetCopyTasks[task].saturday : 0}}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-expansion-item>
      </q-item-section>
    </q-item>

    <q-item class="col-12" v-else>
      <q-item-section>
        <q-expansion-item label="Tasks" header-class="bg-grey-3 shadow-2">
          <div class="row justify-end full-width">
            <q-input
              :model-value="searchTerm"
              label="Search"
              class="q-mt-md q-mx-sm full-width"
              style="max-width: 300px"
              filled
              clearable>
              <template #append>
                <q-icon name="search" class="cursor-pointer"></q-icon>
              </template>
            </q-input>
          </div>
          <div class="row justify-center">
            <q-card
              v-for="task in availableTasks"
              :key="task"
              class="q-my-md q-mx-sm shadow-2">
              <q-card-section>
                <q-item>
                  <h5 class="q-ma-none"><strong>{{ task }}</strong></h5>
                </q-item>

                <div class="row">
                  <q-item class="col-12 col-sm-6">
                    <q-input
                      class="full-width"
                      label="Sunday"
                      :model-value="sheetCopyTasks[task].sunday"
                      readonly
                      hide-bottom-space
                      filled></q-input>
                  </q-item>
                  <q-item class="col-12 col-sm-6">
                    <q-input
                      class="full-width"
                      label="Monday"
                      :model-value="sheetCopyTasks[task].monday"
                      readonly
                      hide-bottom-space
                      filled></q-input>
                  </q-item>
                  <q-item class="col-12 col-sm-6">
                    <q-input
                      class="full-width"
                      label="Tuesday"
                      :model-value="sheetCopyTasks[task].tuesday"
                      readonly
                      hide-bottom-space
                      filled></q-input>
                  </q-item>
                  <q-item class="col-12 col-sm-6">
                    <q-input
                      class="full-width"
                      label="Wednesday"
                      :model-value="sheetCopyTasks[task].wednesday"
                      readonly
                      hide-bottom-space
                      filled></q-input>
                  </q-item>
                  <q-item class="col-12 col-sm-6">
                    <q-input
                      class="full-width"
                      label="Thursday"
                      :model-value="sheetCopyTasks[task].thursday"
                      readonly
                      hide-bottom-space
                      filled></q-input>
                  </q-item>
                  <q-item class="col-12 col-sm-6">
                    <q-input
                      class="full-width"
                      label="Friday"
                      :model-value="sheetCopyTasks[task].friday"
                      readonly
                      hide-bottom-space
                      filled></q-input>
                  </q-item>
                  <q-item class="col-12 col-sm-6">
                    <q-input
                      class="full-width"
                      label="Saturday"
                      :model-value="sheetCopyTasks[task].saturday"
                      readonly
                      hide-bottom-space
                      filled></q-input>
                  </q-item>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-expansion-item>
      </q-item-section>
    </q-item>

    <q-item class="col-12 col-sm-6">
      <q-item-section>
        <q-input label="Date" :model-value="sheetCopy.employeeSignatureDate" readonly filled />
      </q-item-section>
    </q-item>

    <q-item class="col-12 col-sm-6">
      <q-item-section>
        <q-input
          label="Employee Name"
          :model-value="sheetCopy.employeeName"
          readonly
          filled></q-input>
      </q-item-section>
    </q-item>

    <q-item class="col-12">
      <q-item-section>
        <div :class="$q.screen.gt.xs ? 'col q-ml-xs' : 'col-12'">
          <div class="row items-center justify-between q-mb-sm">
            <label style="margin-left: 3px">Employee Signature</label>
          </div>
          <q-img
            :src="sheetCopy.employeeSignature_64"
            contain
            width="100%"
            height="100px"
            style="border: 1px solid black"></q-img>
        </div>
      </q-item-section>
    </q-item>
  </q-form>
</template>

<script>
import moment from 'moment';
import { date, extend } from 'quasar';
import { mainMixin } from "../../../mixins/index";
import { saveSheet, accept, reject } from '../../../api/activitySheet';

const tasks = [
  "Tub",
  "Shower",
  "Shower w/chair",
  "Sponge bath",
  "Bed bath",
  "Assist with dressing",
  "Hair care",
  "Shampoo",
  "Skin care",
  "Foot care",
  "Check pressure areas",
  "Nail care",
  "Oral care",
  "Clean dentures",
  "Assist with elimination",
  "Assist with ambulation: w/c walker/cane",
  "Catheter care",
  "Empty urinary bag",
  "Empty ostomy bag",
  "Record intake/output",
  "Medication reminder",
  "Passive ROM",
  "Meal preparation",
  "Assist with feeding",
  "Limit/Encourage fluids",
  "Grocery shopping",
  "Wash clothes",
  "Equipment care",
  "Light housekeeping: bedroom/bathroom/kitchen/change linen",
  "Reposition in bed/chair",
]

export default {
  name: "ActivitySheetV1",

  mixins: [mainMixin],

  props: {
    sheet: Object,
    currentEmployee: Object,
  },

  watch: {
    sheet: {
      deep: true,
      immediate: true,
      handler(sheet) {
        this.sheetCopy = {};
        this.sheetCopyTasks = {};
        const payload = extend(true, this.sheetCopy, sheet);

        for (let i = 1; i <= 7; i++) {
          const date = payload['date' + i];
          if (!!date) {
            payload['date' + i] = moment(date).format('MM-DD-YYYY');
          }
        }

        if (!!payload.dateReported) {
          payload.dateReported = moment(payload.dateReported).format('MM-DD-YYYY');
        }

        if (!!payload.employeeSignatureDate) {
          payload.employeeSignatureDate = moment(payload.employeeSignatureDate).format('MM-DD-YYYY');
        }

        if (typeof payload?.tasks === 'string') {
          payload.tasks = JSON.parse(payload.tasks);
        }

        tasks.forEach(taskName => {
          if (!payload.tasks) {
            payload.tasks = {};
          }

          let formattedTasks = {
            monday: null,
            tuesday: null,
            wednesday: null,
            thursday: null,
            friday: null,
            saturday: null,
            sunday: null,
          }

          if (payload.tasks[taskName]) {
            formattedTasks = {...formattedTasks, ...payload.tasks[taskName]};
          }

          payload.tasks[taskName] = {...formattedTasks};
          this.sheetCopyTasks[taskName] = {...formattedTasks};
        });

        this.sheetCopy = payload;
      }
    }
  },

  computed: {
    availableTasks() {
      return tasks
        .filter(
          task => !this.searchTerm
               || task.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1)
    },
    sheetTotals() {
      const totals = this.availableTasks.map(task => this.sheetCopyTasks[task]);
      return totals.reduce((totals, item) => {
        const total = Number(totals.total?.value ?? 0) +
          Number(item.monday ?? 0) +
          Number(item.tuesday ?? 0) +
          Number(item.wednesday ?? 0) +
          Number(item.thursday ?? 0) +
          Number(item.friday ?? 0) +
          Number(item.saturday ?? 0) +
          Number(item.sunday ?? 0);

        return {
          total: {name: 'Task', value: total},
          sunday: {name: 'S', value: Number(totals.sunday?.value ?? 0) + Number(item.sunday ?? 0)},
          monday: {name: 'M', value: Number(totals.monday?.value ?? 0) + Number(item.monday ?? 0)},
          tuesday: {name: 'T', value: Number(totals.tuesday?.value ?? 0) + Number(item.tuesday ?? 0)},
          wednesday: {name: 'W', value: Number(totals.wednesday?.value ?? 0) + Number(item.wednesday ?? 0)},
          thursday: {name: 'T', value: Number(totals.thursday?.value ?? 0) + Number(item.thursday ?? 0)},
          friday: {name: 'F', value: Number(totals.friday?.value ?? 0) + Number(item.friday ?? 0)},
          saturday: {name: 'S', value: Number(totals.saturday?.value ?? 0) + Number(item.saturday ?? 0)},
        }
      }, {});
    }
  },

  data: () => {
    return {
      tasks,
      date,
      moment,
      loading: false,
      sheetCopy: {},
      sheetCopyTasks: {},
      searchTerm: ''
    };
  },
}
</script>

<style lang="scss" scoped>
  .red-border {
    border: solid 6px $red-2;
  }
</style>
