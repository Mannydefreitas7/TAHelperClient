<template>
  <div>
    <div class="row q-gutter-xs q-ma-sm">
      <q-input
        class="col"
        readonly
        filled
        label="Caregiver Name"
        :model-value="correction.caregiverName"
      ></q-input>
      <q-input
        class="col"
        readonly
        label="Client Name"
        filled
        :model-value="correction.clientName.replace(/\(\d+.\d+\)/, '')"
      ></q-input>
    </div>

    <div class="row q-gutter-xs q-ma-sm">
      <q-input
        readonly
        class="col"
        label="MR#"
        filled
        v-model="correction.mrNumber"
      ></q-input>
      <q-input
        readonly
        class="col"
        label="Miles"
        type="number"
        filled
        v-model="correction.miles"
      ></q-input>
    </div>

    <div style="margin: 0 8px 0 12px">
      <q-banner class="bg-grey-4"
        ><h6 class="q-ma-none">Signatures</h6></q-banner
      >
      <q-banner class="bg-grey-2">
        Client and Caregiver MUST sign below. Only full signatures with first
        and last name will be accepted. If client is physically unable to sign
        full name, witness must sign their full name after the client’s mark.
        Client's signature certifies that the services documented are accurate
        and true.
      </q-banner>
    </div>

    <div class="row q-gutter-xs q-ma-sm">
      <q-input
        class="col"
        filled
        label="Date In *"
        :model-value="correction.inDate"
        readonly
      />
      <q-input
        class="col"
        label="Time In *"
        filled
        v-model="correction.inTime"
        readonly
      />
    </div>

    <div class="row q-gutter-xs q-ma-sm">
      <q-input
        class="col"
        filled
        label="Date Out *"
        v-model="correction.outDate"
        readonly
      />
      <q-input
        class="col"
        label="Time Out *"
        filled
        v-model="correction.outTime"
        readonly
      />
    </div>

    <div class="row" style="margin: 0 8px 0 12px">
      <div :class="$q.screen.gt.xs ? 'col' : 'col-12'">
        <div class="column items-stretch q-my-sm">
          <label>Client Signature *</label>
          <q-img
            v-if="correction.clientSignature64 !== null"
            :src="correction.clientSignature64"
            style="border: 1px solid black"
          ></q-img>
          <div
            v-else
            style="height: 100%; width: 100%; border: 1px solid black"
          ></div>
        </div>
      </div>
      <div :class="$q.screen.gt.xs ? 'col q-ml-xs' : 'col-12'">
        <div class="column items-stretch q-my-sm">
          <label>Caregiver Signature *</label>
          <q-img
            :src="correction.caregiverSignature64"
            style="border: 1px solid black"
          ></q-img>
        </div>
      </div>
    </div>

    <div style="margin: 0 8px 0 12px">
      <q-banner class="bg-grey-4"
        ><h6 class="q-ma-none">Plan of Care</h6></q-banner
      >
    </div>

    <div class="row bg-grey-2" style="margin: 0 8px 10px 12px">
      <div class="col-12 col-sm-6 column">
        <q-checkbox
          disable
          v-for="(item, index) in tasksLeft"
          :key="index"
          :model-value="item.value"
          :label="item.name"
        ></q-checkbox>
      </div>
      <div class="col-12 col-sm-6 column">
        <q-checkbox
          disable
          v-for="(item, index) in tasksRight"
          :key="index"
          :model-value="item.value"
          :label="item.name"
        ></q-checkbox>
      </div>
    </div>

    <div
      class="row bg-grey-2 q-col-gutter-xs q-pa-xs"
      style="margin: 0 8px 10px 12px"
    >
      <q-input
        v-for="(item, index) in [...inputs, ...selects]"
        :key="index"
        filled
        readonly
        class="col-6"
        :model-value="item.value"
        :label="item.name"
      />
    </div>

    <div style="margin: 0 8px 0 12px">
      <q-banner class="bg-grey-4">
        <h6 class="q-ma-none">
          Documentation should be hands-on patient care & at least every two
          hours
        </h6>
      </q-banner>
    </div>

    <div class="row bg-grey-2" style="margin: 0 8px 10px 12px">
      <div class="col-12 q-pa-md column">
        <q-editor
          disable
          v-model="correction.notes"
          min-height="200px"
          :toolbar="[]"
        ></q-editor>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TimecardV3",
  props: {
    correction: Object,
    tasksLeft: Array,
    tasksRight: Array,
    inputs: Array,
    selects: Array
  },
  methods: {
    getEvvLabel() {
      return import.meta.env.EVV_LABEL;
    }
  }
};
</script>
