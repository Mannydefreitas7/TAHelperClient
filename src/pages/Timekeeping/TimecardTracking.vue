<template>
  <div class="full-height">
    <q-table
      v-if="!selectedTimecard"
      class="full-width"
      row-key="id"
      :rows="availableTimecards"
      :columns="timecardIndexColumns"
      :pagination="initialPagination"
      no-data-label="No Timecards Available"
      no-results-label="No Timecards Available">
      <template #top-left>
        <div class="text-h6 row items-center q-gutter-x-sm">
          <q-icon name="calendar_today" size="25px"></q-icon>
          <span>Weekly Timecards ({{ availableTimecards.length }})</span>
        </div>
      </template>

      <template #top-right>
        <q-input
          class="q-mr-sm"
          filled
          dense
          debounce="300"
          style="min-width: 200px"
          v-model="timecardSearchTerm"
          placeholder="Search"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          class="q-mr-sm"
          outlined
          dense
          use-chips
          emit-value
          map-options
          label="Status"
          multiple
          style="min-width: 200px; max-width: 300px"
          :options="statusOptions"
          v-model="timecardStatusFilter"
        >
          <template v-slot:append>
            <q-icon name="filter_alt" />
          </template>
        </q-select>

        <q-input readonly dense filled :model-value="selectedPayPeriod" label="Pay Period">
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy ref="payPeriodProxyRef" transition-show="scale" transition-hide="scale">
                <q-date
                  color="primary"
                  :first-day-of-week="endOfPayPeriod"
                  :options="isValidPickerDate"
                  v-model="selectedPayPeriod"
                  @update:model-value="(val) => {
                    getTimecards(val);
                    $refs.payPeriodProxyRef.hide();
                  }"
                  mask="MM/DD/YYYY" no-unset>
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
          :class="{ 'bg-red-2': !props.row.status || props.row.status === 5, 'bg-green-2': props.row.status === 3, 'bg-blue-2': props.row.status === 4 || props.row.status === 6 }"
          :props="props"
          @click="selectTimecard(props.row)">
          <q-td key="firstName" :props="props">
            {{ props.row.firstName }}
          </q-td>
          <q-td key="lastName" :props="props">
            {{ props.row.lastName }}
          </q-td>
          <q-td key="occupation" :props="props">
            {{ props.row.occupation }}
          </q-td>
          <q-td key="labor" :props="props">
            <q-btn v-if="true" dense flat class="bg-grey-2">
              <q-icon color="green" size="20px" name="check"></q-icon>
            </q-btn>
            <strong v-if="props.row.labor > 40" class="q-ml-xs">
              {{ props.row.labor }}
            </strong>
            <span v-else class="q-ml-xs">
              {{ props.row.labor }}
            </span>
          </q-td>
          <q-td key="status" :props="props">
            <div class="row justify-between items-center">
              <span>
                {{ getStatus(props.row.status).tooltip }}
              </span>
              <q-btn
                flat
                icon="edit"
                size="13px"
                dense
                @click.stop.prevent="selectTimecard(props.row)"></q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-card v-if="selectedTimecard">
      <q-card-section class="q-pa-md row items-center justify-between" style="background: #f0f0f0">
        <div class="row items-center">
          <q-btn
            round
            flat
            dense
            color="grey-3"
            text-color="black"
            icon="arrow_back"
            class="q-mr-sm"
            @click="selectedTimecard = null"></q-btn>
          <h6 class="q-ma-none">{{ `${selectedTimecard.firstName} ${selectedTimecard.lastName}` }} - {{ selectedPayPeriod }}</h6>
        </div>

        <div class="row items-center justify-end q-gutter-x-md">
          <q-btn
            v-if="!isManager() && !isApprover()"
            :disable="!isTimecardOwner() ||
                      !selectedTimecardEntryLines.length ||
                      selectedTimecardEntryLines.every(entryLine => entryLine.status === 3) ||
                      selectedTimecardEntryLines.every(entryLine => entryLine.status === 4) ||
                      selectedTimecardEntryLines.every(entryLine => entryLine.status === 6)"
            no-caps
            color="green"
            text-color="white"
            label="Submit For Approval"
            icon="thumb_up"
            @click="changeTimecardStatus(3)"></q-btn>

          <q-btn
            v-else-if="isManager() && !isApprover()"
            :disable="!isManager() ||
                      !selectedTimecardEntryLines.length ||
                      selectedTimecardEntryLines.every(entryLine => entryLine.status === 4) ||
                      selectedTimecardEntryLines.every(entryLine => entryLine.status === 6)"
            no-caps
            color="blue"
            text-color="white"
            label="Onsite Manager Approve"
            icon="thumb_up"
            @click="changeTimecardStatus(4)"></q-btn>

          <q-btn
            v-else-if="isApprover() && !selectedTimecardEntryLines.every(entryLine => entryLine.status === 6)"
            :disable="!isApprover() ||
                      !selectedTimecardEntryLines.length ||
                      selectedTimecardEntryLines.every(entryLine => entryLine.status === 6)"
            no-caps
            color="blue"
            text-color="white"
            label="Area Manager Approve"
            icon="thumb_up"
            @click="changeTimecardStatus(6)"></q-btn>

          <q-btn
            no-caps
            color="red"
            text-color="white"
            label="Reject"
            icon="thumb_down"
            @click="changeTimecardStatus(5)"></q-btn>

          <q-separator vertical></q-separator>

          <q-btn
            no-caps
            color="grey-3"
            text-color="black"
            label="Print"
            icon="print"
            :disable="!selectedTimecard.finalApprovedBy"
            @click="printTimecard"></q-btn>
        </div>
      </q-card-section>

      <q-card-section class="row justify-between">
        <div>
          <q-btn
            :disabled="isSubmitted"
            no-caps
            label="Add Line"
            icon="add"
            @click="addEntryLine"></q-btn>

          <q-checkbox
            v-if="(isApprover() || isManager()) && getTimecardTotals().at(-1) > 40"
            v-model="selectedTimecard.overtimeApproved"
            class="q-ml-sm"
            no-caps
            @update:model-value="saveTimecard(selectedTimecard)">
            <span
              class="q-pa-sm"
              :class="selectedTimecard.overtimeApproved ? 'bg-green-2' : 'bg-red-2'"
              style="border-radius: 5px">
              Prior Approval of Overtime Obtained
            </span>
          </q-checkbox>
        </div>

        <div class="column items-end text-caption">
          <span v-if="!!selectedTimecard.submittedOn">
            Employee Approved: {{ getDtFormattedWithoutTime(selectedTimecard.submittedOn) }}
          </span>
          <span v-if="!!selectedTimecard.approvedOn">
            Onsite Manager Approved: <strong>{{ selectedTimecard.approvedBy }}</strong> - {{ getDtFormattedWithoutTime(selectedTimecard.approvedOn) }}
          </span>
          <span v-if="!!selectedTimecard.finalApprovedOn">
            Area Manager Approved: <strong>{{ selectedTimecard.finalApprovedBy }}</strong> - {{ getDtFormattedWithoutTime(selectedTimecard.finalApprovedOn) }}
          </span>
        </div>
      </q-card-section>

      <q-table
        square
        class="q-ma-sm full-width"
        row-key="id"
        :rows="selectedTimecardEntryLines"
        :columns="getTimecardColumns()"
        :pagination="initialPagination"
        no-data-label="No Timecards Available"
        no-results-label="No Timecards Available">
        <template #body-cell-status="props">
          <q-td key="status" :props="props">
            <q-badge :class="{ 'bg-red-5': props.value === 5, 'bg-grey-4 text-black': props.value === 2, 'bg-green-5': props.value === 3, 'bg-blue-5': props.value === 4 || props.value === 6 }">
              {{ statuses[props.value].label }}
            </q-badge>
            <q-tooltip>{{ statuses[props.value].tooltip }}</q-tooltip>
          </q-td>
        </template>

        <template #body-cell-payType="props">
          <q-td :props="props">
            <div :class="{ 'red-border': !props.value }">
              <q-select
                square
                :readonly="isReadonly(props.row)"
                style="min-width: 200px"
                dense
                filled
                emit-value
                map-options
                :options="availablePayTypes"
                :model-value="props.value"
                @update:model-value="val => saveTimecardEntryLine(props.row.lineNo, 'payType', val)"></q-select>
            </div>
          </q-td>
        </template>

        <template #body-cell-monday="props">
          <q-td :props="props">
            <div :class="{ 'red-border': !props.row.monday.notes && props.value.units }">
              <q-input
                square
                :readonly="isReadonly(props.row)"
                dense
                outlined
                style="min-width: 85px"
                :model-value="props.value.units"
                @update:model-value="val => saveTimecardEntry(props.value, 'units', val === '' ? null : val)"
                @dblclick="entryForm.open = true; entryForm.entry = {...props.value}">
                <template #append>
                  <q-btn
                    flat
                    dense
                    text-color="black"
                    :class="{ 'bg-green-2': !!props.value.notes }"
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.entry = {...props.value}"></q-btn>
                </template>
              </q-input>
            </div>
          </q-td>
        </template>

        <template #body-cell-tuesday="props">
          <q-td :props="props">
            <div :class="{ 'red-border': !props.row.tuesday.notes && props.value.units }">
              <q-input
                square
                :readonly="isReadonly(props.row)"
                dense
                outlined
                style="min-width: 85px"
                :model-value="props.value.units"
                @update:model-value="val => saveTimecardEntry(props.value, 'units', val === '' ? null : val)"
                @dblclick="entryForm.open = true; entryForm.entry = {...props.value}">
                <template #append>
                  <q-btn
                    flat
                    dense
                    text-color="black"
                    :class="{ 'bg-green-2': !!props.value.notes }"
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.entry = {...props.value}"></q-btn>
                </template>
              </q-input>
            </div>
          </q-td>
        </template>

        <template #body-cell-wednesday="props">
          <q-td :props="props">
            <div :class="{ 'red-border': !props.row.wednesday.notes && props.value.units }">
              <q-input
                square
                :readonly="isReadonly(props.row)"
                dense
                outlined
                style="min-width: 85px"
                :model-value="props.value.units"
                @update:model-value="val => saveTimecardEntry(props.value, 'units', val === '' ? null : val)"
                @dblclick="entryForm.open = true; entryForm.entry = {...props.value}">
                <template #append>
                  <q-btn
                    flat
                    dense
                    text-color="black"
                    :class="{ 'bg-green-2': !!props.value.notes }"
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.entry = {...props.value}"></q-btn>
                </template>
              </q-input>
            </div>
          </q-td>
        </template>

        <template #body-cell-thursday="props">
          <q-td :props="props">
            <div :class="{ 'red-border': !props.row.thursday.notes && props.value.units }">
              <q-input
                square
                :readonly="isReadonly(props.row)"
                dense
                outlined
                style="min-width: 85px"
                :model-value="props.value.units"
                @update:model-value="val => saveTimecardEntry(props.value, 'units', val === '' ? null : val)"
                @dblclick="entryForm.open = true; entryForm.entry = {...props.value}">
                <template #append>
                  <q-btn
                    flat
                    dense
                    text-color="black"
                    :class="{ 'bg-green-2': !!props.value.notes }"
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.entry = {...props.value}"></q-btn>
                </template>
              </q-input>
            </div>
          </q-td>
        </template>

        <template #body-cell-friday="props">
          <q-td :props="props">
            <div :class="{ 'red-border': !props.row.friday.notes && props.value.units }">
              <q-input
                square
                :readonly="isReadonly(props.row)"
                dense
                outlined
                style="min-width: 85px"
                :model-value="props.value.units"
                @update:model-value="val => saveTimecardEntry(props.value, 'units', val === '' ? null : val)"
                @dblclick="entryForm.open = true; entryForm.entry = {...props.value}">
                <template #append>
                  <q-btn
                    flat
                    dense
                    text-color="black"
                    :class="{ 'bg-green-2': !!props.value.notes }"
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.entry = {...props.value}"></q-btn>
                </template>
              </q-input>
            </div>
          </q-td>
        </template>

        <template #body-cell-saturday="props">
          <q-td :props="props">
            <div :class="{ 'red-border': !props.row.saturday.notes && props.value.units }">
              <q-input
                square
                :readonly="isReadonly(props.row)"
                dense
                outlined
                style="min-width: 85px"
                :model-value="props.value.units"
                @update:model-value="val => saveTimecardEntry(props.value, 'units', val === '' ? null : val)"
                @dblclick="entryForm.open = true; entryForm.entry = {...props.value}">
                <template #append>
                  <q-btn
                    flat
                    dense
                    text-color="black"
                    :class="{ 'bg-green-2': !!props.value.notes }"
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.entry = {...props.value}"></q-btn>
                </template>
              </q-input>
            </div>
          </q-td>
        </template>

        <template #body-cell-sunday="props">
          <q-td :props="props">
            <div :class="{ 'red-border': !props.row.sunday.notes && props.value.units }">
              <q-input
                square
                :readonly="isReadonly(props.row)"
                dense
                outlined
                style="min-width: 85px"
                :model-value="props.value.units"
                @update:model-value="val => saveTimecardEntry(props.value, 'units', val === '' ? null : val)"
                @dblclick="entryForm.open = true; entryForm.entry = {...props.value}">
                <template #append>
                  <q-btn
                    flat
                    dense
                    text-color="black"
                    :class="{ 'bg-green-2': !!props.value.notes }"
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.entry = {...props.value}"></q-btn>
                </template>
              </q-input>
            </div>
          </q-td>
        </template>

        <template #body-cell-total="props">
          <q-td :props="props">
            <q-input
              square
              dense
              filled
              readonly
              type="number"
              style="min-width: 70px"
              :model-value="props.value"></q-input>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              v-if="props.row.status === 2"
              :disable="isReadonly(props.row)"
              icon="delete"
              text-color="white"
              color="red-6"
              dense
              @click="deleteEntryLine(props.row.lineNo)"></q-btn>
          </q-td>
        </template>

        <template #bottom-row>
          <q-tr>
            <q-td>
            </q-td>

            <q-td class="text-center text-bold">
              Timecard Total - LABOR ONLY
            </q-td>

            <q-td
              v-for="(total, index) in getTimecardTotals()"
              :key="index"
              class="text-center text-bold">
              {{ total }}
            </q-td>

            <q-td class="text-center text-bold">
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div></div>
        </template>
      </q-table>

      <q-card-section v-if="selectedTimecard.status === 5">
        <q-input
          square
          class="red-border"
          type="textarea"
          outlined
          v-model="selectedTimecard.rejectionNotes"
          label="Rejected Notes"
          :debounce="200"
          @update:model-value="saveTimecard"></q-input>
      </q-card-section>
    </q-card>

    <q-dialog v-model="entryForm.open" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center">
          <q-avatar
            round
            size="lg"
            color="grey-8"
            text-color="white"
            icon="text_snippet" />

          <div class="q-ml-md">
            <div class="full-width text-h6" style="line-height: 1em;">
              Notes
            </div>
          </div>

          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            :readonly="isReadonly(entryForm.entry)"
            filled
            type="textarea"
            v-model="entryForm.entry.notes"
            label="Add notes for this day"></q-input>
        </q-card-section>

        <q-card-actions class="bg-grey-2 q-pa-md" align="right">
          <q-btn
            v-if="!isReadonly(entryForm.entry)"
            color="grey-8"
            text-color="white"
            no-caps
            label="Cancel"
            style="width: 90px"
            v-close-popup />
          <q-btn
            v-if="!isReadonly(entryForm.entry)"
            color="blue-8"
            text-color="white"
            no-caps
            label="Save"
            style="width: 90px"
            @click="saveTimecardEntry(entryForm.entry, 'notes', entryForm.entry.notes)"
            v-close-popup />


          <q-btn
            v-if="isReadonly(entryForm.entry)"
            color="grey-8"
            text-color="white"
            no-caps
            label="Close"
            style="width: 90px"
            v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
  import { mainMixin } from "../../mixins/index";
  import { mapState } from "pinia";
  import { useTenantStore } from "src/stores/tenantStore";
  import { date, exportFile } from 'quasar';
  import timekeepingApi from "../../api/timekeeping";
  import moment from "moment";

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
      name: "labor",
      align: "left",
      label: "Labor",
      field: "labor",
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
    name: "TimecardTracking",

    mixins: [mainMixin],

    props: {
      size: Object,
    },

    watch: {
      activeTenant: {
        immediate: true,
        async handler() {
          if (!this.activeTenant) {
            return;
          }

          await this.getPayTypes();
          await this.getTimecardStatuses();
          await this.getTimekeepingSettings();
          await this.getCurrentEmployee();
          this.setDefaultPayPeriod();
        },
        deep: true,
      },
    },

    computed: {
      ...mapState(useTenantStore, ["activeTenant", "user"]),
      isSubmitted() {
        return this.selectedTimecard.status !== 1 && this.selectedTimecard.status !== 2 && this.selectedTimecard.status !== 5;
      },
      availableTimecards() {
        const timecardPropertyContainsString = (timecard, propertyName) => {
          const value = timecard[propertyName];
          if (!value) {
            return false;
          }

          return value.toString().toLowerCase().trim().indexOf(this.timecardSearchTerm.toLowerCase().trim()) > -1;
        }
        const hasSearchTerm = timecard => {
          if (!this.timecardSearchTerm) {
            return true;
          } else {
            return timecardPropertyContainsString(timecard, 'firstName')
                || timecardPropertyContainsString(timecard, 'lastName')
                || timecardPropertyContainsString(timecard, 'occupation')
                || timecardPropertyContainsString(timecard, 'labor');
          }
        };
        const hasStatusFilter = timecard => {
          if (!this.timecardStatusFilter.length) {
            return true;
          } else {
            return this.timecardStatusFilter.some(status => timecard.status == status);
          }
        };

        return this.timecards
          .filter(timecard => hasSearchTerm(timecard) && hasStatusFilter(timecard));
      },
      statusOptions() {
        return Object
          .keys(this.statuses)
          .map(key => ({label: this.statuses[key].tooltip, value: key}));
      },
      availablePayTypes() {
        return this.payTypes.map(payType => ({
          label: payType.name,
          value: payType.id
        }));
      }
    },

    methods: {
      isTimecardOwner() {
        if (!this.currentEmployee || !this.selectedTimecard) {
          return false;
        }

        return this.currentEmployee.id === this.selectedTimecard.employeeId;
      },
      isManager() {
        if (!this.selectedTimecard) {
          return false;
        }

        return this.user.tenantOwner
          || this.user.orgAdmin
          || this.selectedTimecard.managerId === this.currentEmployee.id;
      },
      isApprover() {
        if (!this.selectedTimecard) {
          return false;
        }

        return this.user.tenantOwner
          || this.user.orgAdmin
          || this.selectedTimecard.approverId === this.currentEmployee.id;
      },
      isReadonly(entry) {
        if (!this.selectedTimecard) {
          return true;
        }

        return (entry.status && entry.status !== 2 && entry.status !== 5);
      },
      isValidPickerDate(date) {
        const dateDow = moment(date).format("dddd");
        const payPeriodDow = moment().weekday(this.endOfPayPeriod).format("dddd");
        return dateDow === payPeriodDow;
      },
      getStatus(statusKey) {
        const status = this.statuses[statusKey];
        if (status) {
          return status;
        } else {
          return { label: "MIA", tooltip: "Missing" };
        }
      },
      setTimecardEntryLines(timecardEntries) {
        const entryLines = [];
        const lineNumbers = new Set(timecardEntries.map(entry => entry.lineNo));
        for (const lineNumber of Array.from(lineNumbers)) {
          const entries = timecardEntries.filter(entry => entry.lineNo === lineNumber);

          const payload = {
            lineNo: lineNumber,
            status: entries[0].status,
            jobId: entries[0].jobId,
            jobCode: entries[0].jobCode,
            payType: entries[0].payType === 0 ? null : entries[0].payType,
            get total() {
              return Number(this.monday?.units) +
                Number(this.tuesday?.units) +
                Number(this.wednesday?.units) +
                Number(this.thursday?.units) +
                Number(this.friday?.units) +
                Number(this.saturday?.units) +
                Number(this.sunday?.units);
            }
          };

          for (const entry of entries) {
            const dow = moment(entry.dateWorked).format("dddd").toLowerCase();
            payload[dow] = entry;
          }

          entryLines.push(payload);
        }

        this.selectedTimecardEntryLines = entryLines;
      },
      getTimecardColumns() {
        const timecardColumns = [
          {
            name: "status",
            align: "left",
            label: "Stat",
            field: "status",
            sortable: true,
          },
          {
            name: "payType",
            align: "left",
            label: "Pay Type",
            field: "payType",
            sortable: true,
          },
        ];

        const dowColumns = [];

        let payPeriod = this.selectedPayPeriod;
        for (let i = 0; i <= 6; i++) {
          const momentDate = moment(payPeriod)
          const dow = momentDate.format("dddd");
          dowColumns.unshift({
            name: dow.toLowerCase(),
            align: "left",
            label: `${dow.substring(0, 3)}: ${momentDate.format("MM/DD")}`,
            field: dow.toLowerCase(),
            sortable: false
          });

          payPeriod = momentDate.subtract(1, "day").format("MM/DD/YYYY");
        }

        timecardColumns.push(...dowColumns);

        timecardColumns.push({
          name: "total",
          align: "left",
          label: "Total",
          field: "total",
          sortable: false
        });

        timecardColumns.push({
          name: "actions",
          align: "left",
          label: "",
          field: "actions",
          sortable: false
        });

        return timecardColumns;
      },
      getTimecardTotals() {
        const totals = [];
        for (let i = this.endOfPayPeriod + 1; i <= (this.endOfPayPeriod + 7); i++) {
          const dow = moment().isoWeekday(i).format('dddd').toLowerCase();
          const entries = this.selectedTimecard.entries
            .filter(({ dateWorked, units }) => moment(dateWorked).format("dddd").toLowerCase() === dow && units !== null)
            .map(({ units }) => units);

          if (entries.length) {
            totals.push(entries.reduce((prev, curr) => Number(prev) + Number(curr)));
          } else {
            totals.push(0);
          }
        }

        const mappedTotals = this.selectedTimecardEntryLines.map(({ total }) => total);
        if (mappedTotals.length) {
          totals.push(mappedTotals.reduce((prev, curr) => Number(prev) + Number(curr)));
        } else {
          totals.push(0);
        }

        return totals;
      },
      async addEntryLine() {
        const lineNumbers = this.selectedTimecard.entries.map(m => m.lineNo).sort();
        const lineNumber = (lineNumbers.at(-1) ?? 0) + 1;

        const payload = [];

        let payPeriod = this.selectedPayPeriod;
        for (let i = 0; i <= 6; i++) {
          const workDate = moment(payPeriod).format("MM/DD/YYYY");

          payload.push({
            payType: null,
            dateWorked: workDate,
            timecardId: this.selectedTimecard.id,
            employeeId: this.currentEmployee.id,
            lineNo: lineNumber
          });

          payPeriod = moment(payPeriod).subtract(1, "day").format("MM/DD/YYYY");
        }

        const response = await timekeepingApi.addEntryLine(payload);

        this.selectedTimecard.entries = [...this.selectedTimecard.entries, ...response];

        const timecardIndex = this.timecards.findIndex(timecard => timecard.id === this.selectedTimecard.id);
        if (timecardIndex > -1) {
          this.timecards.splice(timecardIndex, 1, this.selectedTimecard);
        }

        this.setTimecardEntryLines(this.selectedTimecard.entries);
      },
      async getPayTypes() {
        try {
          const response = await timekeepingApi.getTimecardPayTypes();
          this.payTypes = response;
        } catch (error) {
          console.error(error);
        }
      },
      async getTimecardStatuses() {
        try {
          const response = await timekeepingApi.getTimecardStatuses();
          this.statuses = response;
        } catch (error) {
          console.error(error);
        }
      },
      async setDefaultPayPeriod() {
        const today = moment().isoWeekday();
        let endOfWorkWeek = null;

        if (today <= this.endOfPayPeriod) {
          let day = moment().isoWeekday(this.endOfPayPeriod);
          if (this.previousWeekPayPeriod) {
            day = day.subtract(1, 'week');
          }

          endOfWorkWeek = day.format("MM/DD/YYYY");
        } else {
          let day = moment().add(1, 'weeks').isoWeekday(this.endOfPayPeriod);
          if (this.previousWeekPayPeriod) {
            day = day.subtract(1, 'week');
          }

          endOfWorkWeek = day.format("MM/DD/YYYY");
        }

        this.selectedPayPeriod = endOfWorkWeek;
        await this.getTimecards(endOfWorkWeek);
      },
      async getCurrentEmployee() {
        try {
          const response = await timekeepingApi.getCurrentEmployee();
          this.currentEmployee = response;
        } catch (error) {
          console.error(error);
        }
      },
      async getTimecards(date) {
        try {
          let response = {};

          const timecardIdParam = this.$route.query.timecardId;
          if (!!timecardIdParam) {
            const { timecards, payPeriod } = await timekeepingApi.getTimecardsById(timecardIdParam);
            response = timecards;
            this.selectedPayPeriod = moment(payPeriod).format('MM/DD/YYYY');
          } else {
            response = await timekeepingApi.getTimecards(date);
          }

          this.timecards = response;

          if (!!timecardIdParam) {
            const foundTimecard = this.timecards.find(timecard => timecard.id == timecardIdParam);
            await this.selectTimecard(foundTimecard);
          }
        } catch (error) {
          console.error(error);
        }
      },
      async getTimekeepingSettings() {
        try {
          const response = await timekeepingApi.getSettings();
          this.endOfPayPeriod = response.endOfPayPeriod || 0;
          this.previousWeekPayPeriod = response.previousWeekPayPeriod;
        } catch (error) {
          console.error(error);
          this.showErrorMessage("Unable to load timekeeping options");
        }
      },
      async changeTimecardStatus(status) {
        const changeStat = async (overtimeApproved) => {
          try {
            const promises = [];
            const lineNumbers = new Set(this.selectedTimecard.entries.map(entry => entry.lineNo));
            for (const lineNumber of Array.from(lineNumbers)) {
              promises.push(this.saveTimecardEntryLine(lineNumber, "status", status));
            }

            await Promise.all(promises);

            const timecardResponse = await timekeepingApi.saveTimecard({...this.selectedTimecard, overtimeApproved, status});
            const index = this.timecards.findIndex(timecard => timecard.id === this.selectedTimecard.id);
            if (index > -1) {
              this.timecards.splice(index, 1, {...this.selectedTimecard, ...timecardResponse});
              await this.selectTimecard(this.timecards[index]);
            }

            if (status === 5) {
              await timekeepingApi.sendRejectedNotification(this.selectedTimecard);
            }
          } catch (error) {
            console.error(error);
          }
        }

        if (
            (status === 4 || status === 6) &&
            (!this.selectedTimecard.overtimeApproved && this.getTimecardTotals().at(-1) > 40)
        ) {
          this.$q.dialog({
            title: 'Approve',
            message: 'Is the overtime for this employee pre-approved?',
            ok: {
              noCaps: true,
              label: "Yes",
              color: "blue-8"
            },
            cancel: {
              noCaps: true,
              label: "No",
              color: "blue-8"
            },
            persistent: true
          }).onOk(() => changeStat(true))
            .onCancel(() => changeStat(false));
        } else {
          changeStat(this.selectedTimecard.overtimeApproved);
        }
      },
      async selectTimecard(row) {
        try {
          if (row.id) {
            const timecard = await timekeepingApi.getTimecard(row.id);
            this.selectedTimecard = {...row, ...timecard};
            this.setTimecardEntryLines(this.selectedTimecard.entries);
          } else {
            const payload = {
              employeeId: row.employeeId,
              timecardDate: this.selectedPayPeriod,
              timecardType: 1
            };

            const response = await timekeepingApi.addTimecard(payload);
            const index = this.timecards.findIndex(t => !t.id && t.employeeId === row.employeeId);
            if (index > -1) {
              this.timecards.splice(index, 1, {...row, ...response});
            }

            this.selectedTimecard = {...row, ...response};
            this.setTimecardEntryLines(response.entries);
          }
        } catch (error) {
          console.error(error);
        }
      },
      async printTimecard() {
        try {
          const { fileName, file } = await timekeepingApi.printTimecard(this.selectedTimecard.id);
          exportFile(fileName, file);
        } catch (error) {
          console.error(error);
        }
      },
      async deleteEntryLine(lineNumber) {
        try {
          const ids = this.selectedTimecard.entries.filter(entry => entry.lineNo === lineNumber).map(entry => entry.id);
          await timekeepingApi.deleteTimecardEntries(ids);

          const validEntries = this.selectedTimecard.entries.filter(entry => entry.lineNo !== lineNumber);
          this.selectedTimecard.entries = validEntries;
          this.setTimecardEntryLines(validEntries);
        } catch (error) {
          console.error(error);
        }
      },
      async saveTimecard() {
        try {
          const timecardResponse = await timekeepingApi.saveTimecard(this.selectedTimecard);
          const index = this.timecards.findIndex(timecard => timecard.id === this.selectedTimecard.id);
          if (index > -1) {
            this.timecards.splice(index, 1, {...this.selectedTimecard, ...timecardResponse});
          }
        } catch (error) {
          console.error(error);
        }
      },
      async saveTimecardEntry(entry, fieldName, fieldValue) {
        try {
          const index = this.selectedTimecard.entries.findIndex(e => e.id === entry.id);
          if (index > -1) {
            this.selectedTimecard.entries.splice(index, 1, {...entry, [fieldName]: fieldValue});
          }

          await timekeepingApi.saveTimecardEntries(this.selectedTimecard.entries);

          this.setTimecardEntryLines(this.selectedTimecard.entries);
        } catch (error) {
          console.error(error);
        }
      },
      async saveTimecardEntryLine(entryLineNumber, fieldName, fieldValue) {
        try {
          const entries = this.selectedTimecard.entries.filter(entry => entry.lineNo === entryLineNumber);
          for (const entry of entries) {
            entry[fieldName] = fieldValue;

            const index = this.selectedTimecard.entries.findIndex(e => e.id === entry.id);
            if (index > -1) {
              this.selectedTimecard.entries.splice(index, 1, {...entry, [fieldName]: fieldValue});
            }
          }

          await timekeepingApi.saveTimecardEntries(entries);

          this.setTimecardEntryLines(this.selectedTimecard.entries);
        } catch (error) {
          console.error(error);
        }
      },
    },

    data: () => {
      return {
        date,
        timecardIndexColumns,
        endOfPayPeriod: 0,
        previousWeekPayPeriod: false,
        payTypes: [],
        timecards: [],
        statuses: {},
        currentEmployee: {},
        selectedPayPeriod: null,
        selectedTimecard: null,
        selectedTimecardEntryLines: [],
        timecardSearchTerm: '',
        timecardStatusFilter: [],
        entryForm: {
          open: false,
          entry: {},
          error: false,
        },
        initialPagination: {
          sortBy: "lastName",
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
