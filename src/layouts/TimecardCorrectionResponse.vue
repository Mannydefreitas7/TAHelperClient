<template>
  <q-layout view="lHh Lpr lFf" class="bg-indigo-1">
    <q-page-container id="wrapper">

      <div v-if="logoUrl && (expired || emptyForm)" class="row justify-center full-width">
        <q-img
          :src="logoUrl"
          basic
          style="max-width: 250px"
          spinner-color="white"
          class="rounded-borders"
        />
      </div>

      <div v-if="expired" class="center-page column justify-center items-center">
        <div class="column justify-center items-center">
          <q-icon size="130px" name="schedule" color="red-8"></q-icon>
          <h6 class="q-ma-none text-center"><strong>Link Expired</strong></h6>
          <p class="q-ma-none text-center" style="font-size: 17px;">Please contact your local office for more information</p>
        </div>
      </div>

      <div v-show="!expired">
        <div v-if="pinRequired" class="q-pa-md q-gutter-md fixed-top">
          <div class="row justify-center full-width">
            <q-img
              :src="logoUrl"
              style="max-width: 150px"
              basic
              spinner-color="white"
              class="rounded-borders vertical-top"
            />
          </div>
          <form @submit.prevent>
            <q-input
              rounded
              outlined
              v-model.trim="pinCode"
              type="text"
              pattern="[0-9]*"
              label="Please enter your PIN"
              required
            >
              <template v-slot:prepend>
                <q-icon name="dialpad" />
              </template>
              <template v-slot:append>
                <q-btn
                  rounded
                  color="indigo-5"
                  label="Submit"
                  type="submit"
                  @click="fetchData"
                />
              </template>
            </q-input>
            <div class="q-pt-md q-gutter-sm vertical-top">
              <q-banner rounded class="bg-purple-4 text-white">
                <template v-slot:avatar>
                  <q-icon name="policy" color="white" />
                </template>
                <div class="row justify-between">
                  <p class="text-subtitle1 q-mb-none q-mt-xs">
                    {{ this.getDisclaimer() }}
                  </p>
                </div>
              </q-banner>
            </div>
          </form>
        </div>
        <q-pull-to-refresh @refresh="refresh">
          <component
            :is="'Timecard' + version.toUpperCase()"
            :pin-required="pinRequired"
            :pin-code="pinCode"
            :name="name"
            :survey-id="surveyId"
            :sql-data="sqlData"
            :sql-columns="sqlColumns"
            :page-header="pageHeader"
            :empty-form="emptyForm"
            :employee-id="employeeId"
            @pin-required="pinRequired = true"
            @timecard-saved="onSaved"
            @new-timecard="generateBlankForm"
            @expired="expired = true"
            ref="timecardForm"></component>
        </q-pull-to-refresh>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import timecardCorrectionApi from "src/api/timecardCorrection";
import { date, uid } from "quasar";
import { mainMixin } from "src/mixins/index";

import TimecardV1 from "components/TimecardCorrections/TimecardV1.vue";
import TimecardV2 from "components/TimecardCorrections/TimecardV2.vue";
import TimecardV3 from "components/TimecardCorrections/TimecardV3.vue";
import TimecardV4 from "components/TimecardCorrections/TimecardV4.vue";
import TimecardV5 from "components/TimecardCorrections/TimecardV5.vue";

export default {
  name: "TimecardCorrectionResponse",
  mixins: [mainMixin],
  components: {
    TimecardV1,
    TimecardV2,
    TimecardV3,
    TimecardV4,
    TimecardV5,
  },
  async created() {
    this.surveyId = this.$route.params.id;
    this.version = this.$route.params.version;

    const response = await timecardCorrectionApi.getPageData(this.surveyId);
    this.logoUrl = response.logo;
    this.name = response.name;
    this.subject = response.name;
    this.pinRequired = response.requiresPin;
    this.emptyForm = response.isBlankForm;
    this.employeeId = response.employeeId;

    if (response.isBlankForm) {
      this.generateBlankForm();
    }
  },
  methods: {
    getDisclaimer() {
      return import.meta.env.DISCLAIMER;
    },
    onSaved(timecard) {
      const index = this.sqlData.findIndex(d => d.VisitId == timecard.VisitId);
      this.sqlData.splice(index, 1);
      this.$forceUpdate();
    },
    formatSqlData(data) {
      return data.map(d => {
        let inTime = '';
        let outTime = '';
        if (d.IsClinicalNote) {
          inTime = date.formatDate(d.ScheduleStartTime, 'hh:mm:ss a');
          outTime = date.formatDate(d.ScheduleEndTime, 'hh:mm:ss a');
        }

        const formattedData = {
          ...d,
          InDate: date.formatDate(d.ScheduleStartTime, "MM/DD/YYYY"),
          OutDate: date.formatDate(d.ScheduleEndTime, "MM/DD/YYYY"),
          InTime: inTime,
          OutTime: outTime,
          CaregiverSignature: null,
          ClientSignature: null,
          MRNumber: d.MedicalRecordNumber,
          ClientId: d.ClientId,
          Notes: "",
          ForgotToUseEvv: false,
          DeviceNotWorking: false,
          ScheduleChangeNotReported: false,
          EvvOther: false,
          ResponsiblePartyName: d.ResponsiblePartyName || '',
        }

        this.$refs.timecardForm.tasks.forEach(taskName => formattedData[taskName] = false);

        return formattedData;
      });
    },
    generateBlankForm() {
      const data = {
        VisitId: uid(),
        VisitDate: new Date(),
        PatientName: '',
        ResponsiblePartyName: '',
        InDate: '',
        OutDate: '',
        InTime: '',
        OutTime: '',
        MRNumber: '',
        ClientId: null,
        CaregiverSignature: null,
        ClientSignature: null,
        Notes: '',
        ForgotToUseEvv: false,
        DeviceNotWorking: false,
        ScheduleChangeNotReported: false,
        EvvOther: false,
        ClientHome: false,
        OtherLocation: false,
        LocationDescription: '',
        isNew: true,
        actionFilter: '',
        actionFilter2: '',
      };

      this.$refs.timecardForm.tasks
        .filter(task => typeof task === 'string')
        .forEach(taskName => data[taskName] = false);

      this.sqlData = [data];

      this.sqlColumns = [
        {label: 'VisitId', name: 'VisitId', field: 'VisitId'},
        {label: 'VisitDate', name: 'VisitDate', field: 'VisitDate'},
        {label: 'PatientName', name: 'PatientName', field: 'PatientName'},
        {label: 'MRNumber', name: 'MRNumber', field: 'MRNumber'},
        {label: 'ClientId', name: 'ClientId', field: 'ClientId'},
        {label: 'InDate', name: 'InDate', field: 'InDate'},
        {label: 'OutDate', name: 'OutDate', field: 'OutDate'},
        {label: 'InTime', name: 'InTime', field: 'InTime'},
        {label: 'OutTime', name: 'OutTime', field: 'OutTime'},
        {label: 'CaregiverSignature', name: 'CaregiverSignature', field: 'CaregiverSignature'},
        {label: 'ClientSignature', name: 'ClientSignature', field: 'ClientSignature'},
        {label: 'Notes', name: 'Notes', field: 'Notes'},
        {label: 'ForgotToUseEvv', name: 'ForgotToUseEvv', field: 'ForgotToUseEvv'},
        {label: 'DeviceNotWorking', name: 'DeviceNotWorking', field: 'DeviceNotWorking'},
        {label: 'ScheduleChangeNotReported', name: 'ScheduleChangeNotReported', field: 'ScheduleChangeNotReported'},
        {label: 'EvvOther', name: 'EvvOther', field: 'EvvOther'},
      ];
    },
    async refresh(done) {
      if (this.emptyForm) {
        done();
        return;
      }

      await this.fetchData();
      done();
    },
    async fetchData() {
      try {
        const payload = {
          surveyId: this.surveyId,
          pinCode: this.pinCode,
        };

        const response = await timecardCorrectionApi.getUncorrectedTimecards(payload);

        this.sqlData = this.formatSqlData(response.rows);
        this.sqlColumns = response.columns || [];
        this.pageHeader = `${response.subject} - ${response.name}`;
        this.subject = response.subject;
        this.officePhone = response.officePhone;
        this.pinRequired = false;
      } catch (error) {
        if (error.response?.status === 401) {
          console.error("Invalid Pin");
          this.pinRequired = true;
          this.showErrorMessage(error.response?.message || "Invalid pin. Please try again");
        }

        console.error(error.response?.message || error);
      }
    },
  },
  data() {
    return {
      expired: false,
      pinRequired: true,
      emptyForm: false,
      version: "",
      pinCode: "",
      surveyId: "",
      logoUrl: "",
      subject: "",
      name: "",
      employeeId: "",
      sqlData: [],
      sqlColumns: [],
      pageHeader: "",
      officePhone: "",
    };
  },
};
</script>

<style>
#wrapper {
  margin: auto;
  padding: 5px;
}
#submit-button {
  margin-left: 10px;
}
.center-page {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 800px;
  width: 100vw;
}
canvas {
  z-index: 5000000000;
}
</style>
