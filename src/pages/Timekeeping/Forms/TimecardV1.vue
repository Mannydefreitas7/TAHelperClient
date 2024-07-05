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

    <div style="margin: 0 8px 0 12px">
      <q-banner class="bg-grey-4"><h6 class="q-ma-none">Signatures</h6></q-banner>
      <q-banner class="bg-grey-2">
        Client and Caregiver MUST sign below. Only full signatures with first and last name will be
        accepted. If client is physically unable to sign full name, witness must sign their full name after
        the client’s mark. Client's signature certifies that the services documented are accurate and true.
      </q-banner>
    </div>

    <div class="row q-gutter-xs q-ma-sm">
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

    <div class="row" style="margin: 0 8px 0 12px">
      <div :class="$q.screen.gt.xs ? 'col' : 'col-12'">
        <div class="column items-stretch q-my-sm">
          <label>Client Signature *</label>
          <q-img
            v-if="correction.clientSignature64 !== null"
            :src="correction.clientSignature64"
            style="border: 1px solid black"></q-img>
          <div v-else style="height: 100%; width: 100%; border: 1px solid black"></div>
        </div>
      </div>
      <div :class="$q.screen.gt.xs ? 'col q-ml-xs' : 'col-12'">
        <div class="column items-stretch q-my-sm">
          <label>Caregiver Signature *</label>
          <q-img :src="correction.caregiverSignature64" style="border: 1px solid black"></q-img>
        </div>
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
  }
};
</script>
