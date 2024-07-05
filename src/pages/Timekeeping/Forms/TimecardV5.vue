<template>
  <div v-if="!!correction">
    <q-banner
      :inline-actions="$q.screen.gt.xs"
      rounded
      style="margin: 12px 8px 0 12px"
      class="bg-primary text-white">
      <q-icon name="save" />
      <span> AutoSave</span>
      <q-toggle color="green" :model-value="true" label="on"></q-toggle>

      <template #action>
        <div v-if="saving || saved" class="row items-center">
          <span>
            {{ saving ? 'Saving....' : (saved ? 'Saved' : '') }}
          </span>
        </div>
      </template>
    </q-banner>

    <q-banner
      :inline-actions="$q.screen.gt.xs"
      rounded
      style="margin: 12px 8px 0 12px"
      class="bg-orange-3 text-black">
      Client unable to sign. Responsible Party on file with agency signing on client’s behalf.
    </q-banner>

    <div class="row q-gutter-xs q-ma-sm">
      <q-input
        class="col"
        readonly
        filled
        label="Caregiver Name"
        :model-value="correction.caregiverName"></q-input>
      <q-input
        class="col"
        readonly
        label="Client Name"
        filled
        :model-value="correction.clientName.replace(/\(\d+.\d+\)/, '')"></q-input>
    </div>

    <div class="row q-gutter-xs q-ma-sm">
      <div class="col"></div>
      <q-input
        class="col"
        readonly
        label="Responsible Party Name"
        filled
        :model-value="correction.responsiblePartyName.replace(/\(\d+.\d+\)/, '')"></q-input>
    </div>

    <div style="margin: 0 8px 0 12px">
      <q-banner class="bg-grey-4"><h6 class="q-ma-none">Clock In/Out</h6></q-banner>
    </div>

    <div style="margin-top: 0;" class="row q-gutter-xs q-ma-sm">
      <q-input
        class="col"
        filled
        label="Date In *"
        :model-value="correction.inDate"
        readonly />
      <q-input
        class="col"
        label="Time In *"
        filled
        v-model="correction.inTime"
        readonly />
    </div>

    <div class="row q-gutter-xs q-ma-sm">
     <q-input
        class="col"
        filled
        label="Date Out *"
        v-model="correction.outDate"
        readonly />
      <q-input
        class="col"
        label="Time Out *"
        filled
        v-model="correction.outTime"
        readonly />
    </div>

    <div style="margin: 0 8px 0 12px">
      <q-banner class="bg-grey-4"><h6 class="q-ma-none">Signatures</h6></q-banner>
      <q-banner class="bg-grey-2">
        Responsible Party and Caregiver MUST sign below. Only full signatures with first and last name will be
        accepted. If client is physically unable to sign full name, witness must sign their full name after
        the client’s mark. Client's signature certifies that the services documented are accurate and true.
      </q-banner>
    </div>

    <div class="row" style="margin: 0 8px 0 12px">
      <div :class="$q.screen.gt.xs ? 'col q-ml-xs' : 'col-12'">
        <div class="column items-stretch q-my-sm">
          <label>Caregiver Signature *</label>
          <q-img :src="correction.caregiverSignature64" style="border: 1px solid black"></q-img>
        </div>
      </div>
      <div :class="$q.screen.gt.xs ? 'col' : 'col-12'">
        <div class="column items-stretch q-my-sm">
          <label>Responsible Party Signature *</label>
          <q-img
            v-if="correction.clientSignature64 !== null"
            :src="correction.clientSignature64"
            style="border: 1px solid black"></q-img>
          <div v-else style="height: 100%; width: 100%; border: 1px solid black"></div>
        </div>
      </div>
    </div>

    <div class="row q-gutter-xs q-ma-sm">
      <q-input
        v-model="correction.last4SSN"
        @blur="save"
        class="col"
        filled
        label="Last 4 Digits of Caregiver's SS#"></q-input>
      <q-input
        v-model="correction.medicaidIdNumber"
        @blur="save"
        class="col"
        label="Client's Medicaid ID #"
        filled></q-input>
    </div>

    <div style="margin: 0 8px 0 12px">
      <q-banner class="bg-grey-4"><h6 class="q-ma-none">Location of Services</h6></q-banner>
    </div>
    <div class="row bg-grey-2" style="margin: 0 8px 10px 12px">
      <div class="col-12 col-sm-6 column">
        <q-radio disable v-model="correction.location" val="Client's Home" label="Client's Home" />
        <q-radio disable v-model="correction.location" val="Other Location" label="Other Location" />
      </div>
      <div v-if="correction.location == 'Other Location'" class="col-12 col-sm-6 column">
        <span class="text-subtitle1">Identify Location:</span>
        <q-editor
          disable
          v-model="correction.locationDescription"
          min-height="200px"
          :toolbar="[]"></q-editor>
      </div>
    </div>

    <div style="margin: 0 8px 0 12px">
      <q-banner class="bg-grey-4"><h6 class="q-ma-none">Plan of Care</h6></q-banner>
    </div>
    <div class="row bg-grey-2" style="margin: 0 8px 10px 12px">
      <div class="col-12 col-sm-6 column">
        <q-checkbox
          disable
          v-for="(item, index) in tasksLeft"
          :key="index"
          :model-value="item.value"
          :label="item.name"></q-checkbox>
      </div>
      <div class="col-12 col-sm-6 column">
        <q-checkbox
          disable
          v-for="(item, index) in tasksRight"
          :key="index"
          :model-value="item.value"
          :label="item.name"></q-checkbox>
      </div>
    </div>

    <div style="margin: 0 8px 0 12px">
      <q-banner class="bg-grey-4"><h6 class="q-ma-none">Reason for {{ getEvvLabel() }} Error (Select One & Add Notes)</h6></q-banner>
    </div>

    <div class="row bg-grey-2" style="margin: 0 8px 10px 12px">
      <div class="col-12 col-sm-6 column">
        <q-checkbox disable label="Forgot to use Evv" v-model="correction.forgotToUseEvv"></q-checkbox>
        <q-checkbox disable label="Phone/device not working" v-model="correction.deviceNotWorking"></q-checkbox>
        <q-checkbox disable label="Schedule change not reported to office" v-model="correction.scheduleChangeNotReported"></q-checkbox>
      </div>
      <div class="col-12 col-sm-6 column">
        <q-editor disable v-model="correction.notes" min-height="200px"></q-editor>
      </div>
    </div>

    <q-dialog :model-value="clients.length > 1" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center">
          <div class="text-h6" style="line-height: 1em;">
            Select Client
          </div>

          <q-space />

          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-table
            class="full-width no-shadow"
            row-key="id"
            :rows="clients"
            :columns="columns">
            <template #body-cell-dob="props">
              <q-td key="dob" :props="props">
                <span>{{getDtFormatted(props.value)}}</span>
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td key="actions" :props="props">
                <q-btn dense color="green-6" size="md" label="Select" @click="selectClient(props.row)"></q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog :model-value="!clients.length && loadedClients" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center">
          <div class="text-h6" style="line-height: 1em;">
            No Clients
          </div>

          <q-space />

          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          No clients were found for this timecard correction. Please input SSN and Medicaid Id Number manually.
        </q-card-section>

        <q-card-actions class="bg-grey-2 q-pa-md" align="right">
          <q-btn
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
  import { getMarkAcceptedData, getTimecardCorrection, updateTimecardCorrection } from "../../../api/timecardCorrection";
  import { mainMixin } from "../../../mixins/index";
  import { date } from 'quasar';
  import moment from 'moment';

  const columns = [
    {
      name: "clientName",
      align: "center",
      label: "Name",
      field: "ClientName",
      sortable: true,
    },
    {
      name: "dob",
      align: "center",
      label: "DOB",
      field: "DateOfBirth",
      sortable: true,
    },
    {
      name: "actions",
      align: "right",
      label: "",
      field: "",
      sortable: true,
    },
  ];

  export default {
    name: "TimecardV4",
    mixins: [mainMixin],
    props: {
      correctionId: Number,
      tasksLeft: Array,
      tasksRight: Array,
    },
    async mounted() {
      try {
        const data = await getTimecardCorrection(this.correctionId);

        const timeInSplit = data.inTime.split(":");
        const timeInDate = new Date();
        timeInDate.setHours(timeInSplit[0]);
        timeInDate.setMinutes(timeInSplit[1]);

        const timeOutSplit = data.outTime.split(":");
        const timeOutDate = new Date();
        timeOutDate.setHours(timeOutSplit[0]);
        timeOutDate.setMinutes(timeOutSplit[1]);

        data.inDate = this.getDtFormattedWithoutTime(data.inDate);
        data.outDate = this.getDtFormattedWithoutTime(data.outDate);
        data.inTime = date.formatDate(timeInDate, "hh:mm a");
        data.outTime = date.formatDate(timeOutDate, "hh:mm a");
        this.correction = data;

        if (this.correction.last4SSN || this.correction.medicaidIdNumber) {
          return;
        }

        this.clients = await getMarkAcceptedData(this.correctionId);
        if (this.clients.length === 1) {
          this.correction.last4SSN = this.clients[0].Last4SSN;
          this.correction.medicaidIdNumber = this.clients[0].MedicaidIdNumber;
          await this.save();
          return;
        }
        this.loadedClients = true;
      } catch (error) {
        console.error("Error: ", error);
      }
    },
    methods: {
      selectClient(client) {
        this.correction.last4SSN = client.Last4SSN;
        this.correction.medicaidIdNumber = client.MedicaidIdNumber;
        this.clients = [];
        this.loadedClients = false;

        this.save();
      },
      getEvvLabel() {
        return import.meta.env.EVV_Label;
      },
      async save() {
        try {
          this.saving = true;
          this.saved = false;

          this.correction.last4SSN = this.correction.last4SSN.substring(0, 4);
          const payload = {
            ...this.correction,
            inTime: moment(this.correction.inTime, "hh:mm a").format("HH:mm"),
            outTime: moment(this.correction.outTime, "hh:mm a").format("HH:mm"),
          }
          await updateTimecardCorrection(payload);
          this.showSuccessMessage("Updated Timecard Correction");

          this.saving = false;
          this.saved = true;
        } catch (error) {
          console.error("Error: ", error);
        }
      },
    },
    data() {
      return {
        columns,
        correction: null,
        loadedClients: false,
        clients: [],
        saving: false,
        saved: false,
      }
    }
  };
</script>
