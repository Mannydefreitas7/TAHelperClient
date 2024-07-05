<template>
  <q-card>
    <q-form greedy @submit.prevent="(evt) => (evt.submitter.id == 'submit-btn' ? onSubmit(index) : onSave(index))">
      <!-- General -->
      <q-card-section class="row items-start q-col-gutter-md q-mt-none">
        <div class="col-12 col-sm-8">
          <q-input
            label="Patient Name *"
            v-model="sheetCopy.clientName"
            :rules="[(val) => !!val || 'Required Field']"
            readonly
            hide-bottom-space
            outlined></q-input>
        </div>

        <div class="col-12 col-sm-4">
          <q-input label="MR#" v-model="sheetCopy.mrNumber" readonly outlined></q-input>
        </div>

        <div class="col-12 col-sm-3">
          <q-input outlined label="Date *" :model-value="sheetCopy.date1" readonly> </q-input>
        </div>

        <div class="col-12 col-sm-3">
          <q-input label="Time In *" readonly v-model="sheetCopy.timeIn1" outlined> </q-input>
        </div>

        <div class="col-12 col-sm-3">
          <q-input label="Time Out *" readonly v-model="sheetCopy.timeOut1" outlined> </q-input>
        </div>
        <div class="col-12 col-sm-3">
          <q-input label="Mileage" v-model="sheetCopy.mileage" type="number" outlined readonly></q-input>
        </div>
      </q-card-section>

      <!-- Form Renderer -->
      <q-card-section class="row items-center q-col-gutter-md">
        <template v-for="(task, taskIndex) in tasks">
          <div v-if="isFieldVisible(task)" :key="taskIndex" :class="task.class ? task.class : 'col-12'">
            <h5 v-if="task.type === 'section'" class="q-my-sm">
              {{ task.name }}
            </h5>
            <div v-if="task.type === 'spacer'" class="q-my-md"></div>
            <label v-if="task.type === 'label'">{{ task.name }}</label>
            <q-input
              v-if="task.type === 'textarea'"
              v-model="sheetCopy.tasks[task.field || task.name]"
              :label="task.name"
              type="textarea"
              debounce="500"
              readonly
              :filled="!task.underlined && !task.outlined"
              :outlined="!task.underlined && !!task.outlined"></q-input>
            <q-input
              v-if="task.type === 'date'"
              v-model="sheetCopy.tasks[task.field || task.name]"
              :label="task.name"
              debounce="500"
              readonly
              :filled="!task.underlined && !task.conditions"
              :outlined="!task.underlined && !!task.conditions">
            </q-input>
            <q-input
              v-if="task.type === 'input'"
              v-model="sheetCopy.tasks[task.field || task.name]"
              :label="task.name"
              debounce="500"
              readonly
              :filled="!task.underlined && !task.conditions"
              :outlined="!task.underlined && !!task.conditions"></q-input>
            <q-select
              v-if="task.type === 'select'"
              :model-value="sheetCopy.tasks[task.field || task.name]"
              :label="task.name"
              :options="task.options"
              :multiple="task.multiple"
              :use-chips="task.multiple"
              readonly
              :filled="!task.underlined && !task.conditions"
              :outlined="!task.underlined && !!task.conditions"></q-select>
            <q-checkbox
              v-if="task.type === 'checkbox'"
              :model-value="!!sheetCopy.tasks[task.field || task.name]"
              disable
              :label="task.name"></q-checkbox>
            <div v-if="task.type === 'radio'">
              <label>
                <strong>{{ task.name }}</strong>
              </label>
              <div class="q-gutter-sm">
                <q-radio
                  v-for="(option, index) in task.options"
                  v-model="sheetCopy.tasks[task.name]"
                  :key="index"
                  :val="option.value"
                  :label="option.label"/>
              </div>
            </div>
          </div>
        </template>
      </q-card-section>

      <q-card-section>
        <div class="row items-center justify-between q-mb-sm">
          <label style="margin-left: 3px" class="text-bold text-body1">Notes</label>
        </div>
        <q-editor disable v-model="sheetCopy.notes" min-height="200px" :toolbar="[]"></q-editor>
      </q-card-section>

      <!-- Signatures -->
      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <div class="row items-center justify-between q-mb-sm">
            <label style="margin-left: 3px">Patient/Caregiver Signature</label>
          </div>
          <q-img
            :src="sheetCopy.clientSignature2_64"
            contain
            width="100%"
            height="100px"
            style="border: 1px solid black"></q-img>
        </div>
        <div class="col-12 col-sm-6">
          <div class="row items-center justify-between q-mb-sm">
            <label style="margin-left: 3px">Aide Signature</label>
          </div>
          <q-img
            :src="sheetCopy.employeeSignature_64"
            contain
            width="100%"
            height="100px"
            style="border: 1px solid black"></q-img>
        </div>
        <div class="col-12 col-sm-6">
          <div class="row items-center justify-between q-mb-sm">
            <label style="margin-left: 3px">LPN Signature</label>
          </div>
          <q-img
            :src="sheetCopy.clientSignature3_64"
            contain
            width="100%"
            height="100px"
            style="border: 1px solid black"></q-img>
        </div>
        <div class="col-12 col-sm-6">
          <div class="row items-center justify-between q-mb-sm">
            <label style="margin-left: 3px">RN Signature</label>
          </div>
          <q-img
            :src="sheetCopy.clientSignature4_64"
            contain
            width="100%"
            height="100px"
            style="border: 1px solid black"></q-img>
        </div>
      </q-card-section>
    </q-form>
  </q-card>
</template>

<script>
  import { date, extend } from 'quasar';
  import moment from 'moment';

  const lungSoundOptions = ['RUL', 'RML', 'RLL', 'LUL', 'LLL'];
  const tasks = [
    {
      name: 'Type of Visit',
      type: 'select',
      multiple: true,
      options: [
        'Initial',
        'Authorized RN',
        'Unannounced',
        '30-day Performance',
        'Supervisory',
        'Nurse 10%',
        'APC monthly',
        'APC 6 month',
        'GHE',
        'Annual',
      ],
    },
    {
      name: 'Temperature',
      type: 'input',
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Temperature Type',
      type: 'select',
      multiple: true,
      options: ['Axillary', 'Oral', 'Temporal', 'Tympanic', 'Unable to obtain'],
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Pulse',
      type: 'input',
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Pulse Type',
      type: 'select',
      multiple: true,
      options: ['Regular', 'Irregular', 'Radial', 'Apical', 'Brachial', 'Unable to obtain'],
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Respirations',
      type: 'input',
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Respirations Type',
      type: 'select',
      multiple: true,
      options: ['Regular', 'Irregular', 'Unable to obtain'],
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Blood Pressure',
      type: 'input',
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Blood Pressure Type',
      type: 'select',
      multiple: true,
      options: ['Sitting', 'Lying', 'Standing', 'Unable to obtain'],
      class: 'col-12 col-sm-6',
    },
    {
      name: 'SpO2 %',
      type: 'input',
      class: 'col-12 col-sm-6',
    },
    {
      name: 'SpO2 % Type',
      type: 'select',
      multiple: true,
      options: ['Room air', 'O2 in place', 'Unable to obtain'],
      class: 'col-12 col-sm-6',
    },
    {
      name: 'SpO2 % LPM',
      conditions: { 'SpO2 Type': 'O2 in place' },
      type: 'input',
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Blood Sugar (mg/dl)',
      type: 'input',
    },
    {
      name: 'Unable to Obtain',
      field: 'Blood Sugar Unable to Obtain',
      type: 'checkbox',
      class: 'col-shrink',
    },
    {
      name: 'N/A',
      field: 'Blood Sugar N/A',
      type: 'checkbox',
      class: 'col-shrink',
    },
    {
      name: 'Weight (lbs)',
      type: 'input',
    },
    {
      name: 'N/A',
      field: 'Weight N/A',
      type: 'checkbox',
    },
    {
      name: 'Pain',
      type: 'select',
      multiple: true,
      options: ['Denies', 'Rating', 'Location', 'Unable to Access'],
    },
    {
      name: 'Pain Location',
      conditions: { Pain: 'Location' },
      type: 'input',
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Pain Rating',
      conditions: { Pain: 'Rating' },
      type: 'select',
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Orientation',
      type: 'select',
      multiple: true,
      options: ['Alert', 'Forgetful', 'Agitated', 'Lethargic', 'Anxious'],
    },
    {
      name: 'Chest Pains',
      type: 'checkbox',
    },
    {
      name: 'Chest Pains Description',
      conditions: { 'Chest Pains': true },
      type: 'textarea',
    },
    {
      name: 'Lung Sounds',
      type: 'select',
      multiple: true,
      options: ['Clear', 'Rales', 'Rhonchi', 'Wheezes', 'Stridor', 'Diminished', 'Absent'],
    },
    {
      name: 'Lung Sounds Rales',
      conditions: { 'Lung Sounds': 'Rales' },
      type: 'select',
      options: lungSoundOptions,
      multiple: true,
      class: 'col-12 col-sm-4',
    },
    {
      name: 'Lung Sounds Rhonchi',
      conditions: { 'Lung Sounds': 'Rhonchi' },
      type: 'select',
      options: lungSoundOptions,
      multiple: true,
      class: 'col-12 col-sm-4',
    },
    {
      name: 'Lung Sounds Wheezes',
      conditions: { 'Lung Sounds': 'Wheezes' },
      type: 'select',
      options: lungSoundOptions,
      multiple: true,
      class: 'col-12 col-sm-4',
    },
    {
      name: 'Lung Sounds Stridor',
      conditions: { 'Lung Sounds': 'Stridor' },
      type: 'select',
      options: lungSoundOptions,
      multiple: true,
      class: 'col-12 col-sm-4',
    },
    {
      name: 'Lung Sounds Diminished',
      conditions: { 'Lung Sounds': 'Diminished' },
      type: 'select',
      options: lungSoundOptions,
      multiple: true,
      class: 'col-12 col-sm-4',
    },
    {
      name: 'Lung Sounds Absent',
      conditions: { 'Lung Sounds': 'Absent' },
      type: 'select',
      options: lungSoundOptions,
      class: 'col-12 col-sm-4',
    },
    {
      name: 'Skin',
      type: 'select',
      multiple: true,
      options: ['Intact', 'Open Area', 'Swelling', 'Redness', 'Rash', 'Bruising'],
    },
    {
      name: 'Skin Open Area Location',
      conditions: { Skin: 'Open Area' },
      type: 'input',
      class: 'col-12 col-sm-4',
    },
    {
      name: 'Skin Swelling Location',
      conditions: { Skin: 'Swelling' },
      type: 'input',
      class: 'col-12 col-sm-4',
    },
    {
      name: 'Skin Redness Location',
      conditions: { Skin: 'Redness' },
      type: 'input',
      class: 'col-12 col-sm-4',
    },
    {
      name: 'Skin Rash Location',
      conditions: { Skin: 'Rash' },
      type: 'input',
      class: 'col-12 col-sm-4',
    },
    {
      name: 'Skin Bruising Location',
      conditions: { Skin: 'Bruising' },
      type: 'input',
      class: 'col-12 col-sm-4',
    },
    {
      name: 'Vision',
      type: 'select',
      multiple: true,
      options: ['Normal', 'With Glasses', 'Blind'],
    },
    {
      name: 'Blind in Left Eye',
      conditions: { Vision: 'Blind' },
      type: 'Checkbox',
      class: 'col-shrink',
    },
    {
      name: 'Blind in Right Eye',
      conditions: { Vision: 'Blind' },
      type: 'checkbox',
      class: 'col-shrink',
    },
    {
      name: 'Hearing',
      type: 'select',
      multiple: true,
      options: ['Normal', 'HOH', 'Hearing Aid'],
    },
    {
      name: 'HOH In Left Ear',
      conditions: { Hearing: 'HOH' },
      type: 'checkbox',
      class: 'col-shrink',
    },
    {
      name: 'HOH In Right Ear',
      conditions: { Hearing: 'HOH' },
      type: 'checkbox',
      class: 'col-shrink',
    },
    {
      name: 'Toileting',
      type: 'select',
      multiple: true,
      options: ['Self', 'W/Assist', 'Bedside', 'Urinary Incontinent', 'Catheter', 'Ostomy'],
    },
    {
      name: 'Last Bowel Movement',
      type: 'date',
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Last Bowel Movement Type',
      type: 'select',
      multiple: true,
      options: ['Normal', 'Constipated', 'Diarrhea', 'Incontinence'],
      class: 'col-12 col-sm-6',
    },
    {
      name: 'Mobility',
      type: 'select',
      multiple: true,
      options: ['Self', 'W/Assist', 'Cane', 'Walker', 'Wheelchair', 'Lift'],
    },
    {
      name: 'Clean Hygiene',
      type: 'checkbox',
      class: 'col-12',
    },
    {
      name: 'Clean Nails',
      type: 'checkbox',
      class: 'col-shrink',
    },
    {
      name: 'Dirty Nails',
      type: 'checkbox',
      class: 'col-shrink',
    },
    {
      name: 'Nails Need Trimming',
      type: 'checkbox',
      class: 'col-shrink',
    },
    {
      name: 'Environment',
      type: 'select',
      multiple: true,
      options: ['Clean', 'Unclean', 'Cluttered', 'Bad Odor', 'Stale Air'],
    },
    {
      name: 'Nursing Services Delivered',
      type: 'select',
      multiple: true,
      options: [
        'Oral Meds Set-up',
        'Nail care',
        'Monitor Skin Conditions',
        'Evaluate APC Plan',
        'Train APC Aide',
        'Train HC/PC Aide',
        'Fill Insulin Syringes',
        'Other',
      ],
    },
    {
      name: 'Nursing Services Delivered Other',
      conditions: { 'Nursing Services Delivered': 'Other' },
      type: 'input',
    },
    {
      name: 'Services adequately meet the needs of the client?',
      type: 'checkbox',
    },
    {
      name: 'Explanation',
      field: 'ServicesMeetClientNeedsExplenation',
      conditions: { 'Services adequately meet the needs of the client?': false },
      type: 'input',
    },
    {
      name: 'The aide has the abilty to perform the tasks as assigned?',
      type: 'checkbox',
    },
    {
      name: 'Explanation',
      field: 'AideAbilityToPerformTasksExplanation',
      conditions: { 'The aide has the abilty to perform the tasks as assigned?': false },
      type: 'input',
    },
    {
      name: 'Was the Plan of Care discussed with the client?',
      type: 'checkbox',
    },
    {
      name: 'Was the six-month report sent to DHSS?',
      type: 'checkbox',
    },
  ];

  export default {
    name: 'ActivitySheetV3',

    props: ['sheet'],

    watch: {
      sheet: {
        deep: true,
        immediate: true,
        handler(sheet) {
          this.sheetCopy = {};
          const payload = extend(true, this.sheetCopy, sheet);

          for (let i = 1; i <= 7; i++) {
            const date = payload['date' + i];
            if (!!date) {
              payload['date' + i] = moment.utc(date).format('MM/DD/YYYY');
            }
          }

          if (!!payload.dateReported) {
            payload.dateReported = moment(payload.dateReported).format('MM/DD/YYYY');
          }

          if (!!payload.employeeSignatureDate) {
            payload.employeeSignatureDate = moment(payload.employeeSignatureDate).format('MM/DD/YYYY');
          }

          if (typeof payload?.tasks === 'string') {
            payload.tasks = JSON.parse(payload.tasks);
          }

          if (!payload.tasks) {
            payload.tasks = {};
            tasks
              .filter((f) => f.type !== 'section' && f.type !== 'spacer' && f.type !== 'label')
              .forEach((task) => {
                if (task.type === 'checkbox') {
                  payload.tasks[task.name] = false;
                  return;
                }
                payload.tasks[task.name] = task.multiple ? [] : '';
              });
          }

          this.sheetCopy = payload;
        },
      },
    },
    methods: {
      isFieldVisible(task) {
        if (task.conditions) {
          for (const key in task.conditions) {
            const value = this.sheetCopy.tasks[key];
            const conditionValue = task.conditions[key];
            if (Array.isArray(value) && value?.some((v) => v === conditionValue)) {
              return true;
            } else if (value === conditionValue) {
              return true;
            }
          }
        }

        return !task.conditions;
      },
    },

    data() {
      return {
        tasks,
        date,
        moment,
        sheetCopy: {},
      };
    },
  };
</script>
