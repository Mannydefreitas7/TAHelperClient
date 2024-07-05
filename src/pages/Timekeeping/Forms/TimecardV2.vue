<template>
  <div>
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

    <div v-if="correction.isClinicalNote">
      <div style="margin: 0 8px 0 12px">
        <q-banner class="bg-grey-4"><h6 class="q-ma-none">Clinical Notes</h6></q-banner>
      </div>

      <div class="row bg-grey-2" style="margin: 0 8px 10px 12px">
        <div class="col-12">
          <q-editor
            v-model="correction.notes"
            min-height="200px"
            :toolbar="[]"></q-editor>
        </div>
      </div>
    </div>

    <div style="margin: 0 8px 0 12px">
      <q-banner v-if="!correction.isClinicalNote" class="bg-grey-4"><h6 class="q-ma-none">Signatures</h6></q-banner>
      <q-banner v-else class="bg-grey-4"><h6 class="q-ma-none">Acknowledgement</h6></q-banner>
      <q-banner v-if="!correction.isClinicalNote" class="bg-grey-2">
        Document actual time worked. Time slips and documentation due to take care by Monday at 10:00 AM.
        I certify that I did not receive any injuries during this assignment, nor have witnessed an accident resulting in injury to someone else.
        I have documented actual time worked. Leave client signature blank if unavailable to sign.
      </q-banner>
      <q-banner v-else class="bg-grey-2">
        I acknowledge that the information I have entered on this clinical note is a true and accurate account of the care I provided during the above shift/visit.
        I certify that I did not receive any injuries during this assignment, nor have witnessed an accident resulting in injury to someone else.
        I have documented actual time worked.
      </q-banner>
    </div>

    <div v-if="!correction.isClinicalNote" class="row q-gutter-xs q-ma-sm">
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

    <div v-if="!correction.isClinicalNote" class="row q-gutter-xs q-ma-sm">
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

    <div class="row" style="margin: 0 8px 0 12px">
      <div v-if="!correction.isClinicalNote" :class="$q.screen.gt.xs ? 'col' : 'col-12'">
        <div class="column items-stretch q-my-sm full-height">
          <label>Client Signature *</label>
          <q-img
            v-if="correction.clientSignature64 !== null"
            :src="correction.clientSignature64"
            style="border: 1px solid black"></q-img>
          <div v-else style="width: 100%; border: 1px solid black" class="row justify-center items-center no-image">
            <span class="text-h6"><strong>Unavailable to sign</strong></span>
          </div>
        </div>
      </div>
      <div v-else :class="$q.screen.gt.xs ? 'col' : 'col-12'"></div>
      <div :class="$q.screen.gt.xs ? 'col q-ml-xs' : 'col-12'">
        <div class="column items-stretch q-my-sm">
          <label v-if="!correction.isClinicalNote">Caregiver Signature *</label>
          <label v-else>Nurse Signature *</label>
          <q-img :src="correction.caregiverSignature64" style="border: 1px solid black"></q-img>
        </div>
      </div>
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

    <div v-if="!correction.isClinicalNote">
      <div style="margin: 0 8px 0 12px">
        <q-banner class="bg-grey-4"><h6 class="q-ma-none">Reason for {{ getEvvLabel() }} Error (Select One & Add Notes)</h6></q-banner>
      </div>

      <div class="row bg-grey-2" style="margin: 0 8px 10px 12px">
        <div class="col-12 col-sm-6 column">
          <q-checkbox disable :label="`Forgot to use ${getEvvLabel()}`" v-model="correction.forgotToUseEvv"></q-checkbox>
          <q-checkbox disable :label="getDeviceCheckboxLabel()" v-model="correction.deviceNotWorking"></q-checkbox>
          <q-checkbox disable label="Schedule change not reported to office" v-model="correction.scheduleChangeNotReported"></q-checkbox>
          <q-checkbox disable label="Other" v-model="correction.evvOther"></q-checkbox>
        </div>
        <div class="col-12 col-sm-6 column">
          <q-editor disable v-model="correction.notes" min-height="200px"></q-editor>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "TimecardV2",
  props: {
    correction: Object,
    tasksLeft: Array,
    tasksRight: Array,
  },
  methods: {
    getEvvLabel() {
      return import.meta.env.EVV_LABEL;
    },
    getDeviceCheckboxLabel() {
      const label = this.getEvvLabel();
      if (label.toLowerCase().includes("truetrak")) {
        return `Unable to use ${label} due to technical issues`;
      } else {
        return "Phone/device not working";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.no-image {
  height: 70px;

  @media (min-width: 600px) {
    height: calc(100% - 37px);
  }
}
</style>
