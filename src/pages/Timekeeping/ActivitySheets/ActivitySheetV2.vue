<template>
  <q-card>
    <q-form greedy>
      <!-- General -->
      <q-card-section class="row flex-stretch items-start q-col-gutter-md">
        <div class="col-12 col-sm-8">
          <q-input
            label="Patient Name *"
            v-model="sheet.clientName"
            :rules="[val => !!val || 'Required Field']"
            readonly
            hide-bottom-space
            outlined
          ></q-input>
        </div>

        <div class="col-12 col-sm-4">
          <q-input
            label="DCN #"
            v-model="sheet.mrNumber"
            readonly
            outlined
          ></q-input>
        </div>

        <div class="col-12 col-sm-3">
          <q-input outlined label="Date *" :model-value="sheet.date1" readonly>
            <template #append>
              <q-icon name="event" class="cursor-pointer"> </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-3">
          <q-input label="Time In *" readonly v-model="sheet.timeIn1" outlined>
            <template #append>
              <q-icon name="schedule" class="cursor-pointer"> </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-3">
          <q-input
            label="Time Out *"
            readonly
            v-model="sheet.timeOut1"
            outlined
          >
            <template #append>
              <q-icon name="schedule" class="cursor-pointer"> </q-icon>
            </template>
          </q-input>
        </div>
        <!-- <div class="col-12 col-sm-3"> -->
        <!--   <q-input -->
        <!--     label="Mileage" -->
        <!--     v-model="sheet.mileage" -->
        <!--     type="number" -->
        <!--     outlined -->
        <!--     readonly -->
        <!--   ></q-input> -->
        <!-- </div> -->
      </q-card-section>

      <q-card-section>
        <q-markup-table v-if="$q.screen.gt.xs" flat bordered>
          <thead>
            <tr>
              <th class="text-center">Temp</th>
              <th class="text-center">Radial Pulse</th>
              <th class="text-center">Apical Pulse</th>
              <th class="text-center">BP Sitting</th>
              <th class="text-center">BP Standing</th>
              <th class="text-center">BP Lying</th>
              <th class="text-center">Resp</th>
              <th class="text-center">RBS</th>
              <th class="text-center">Weight</th>
              <th class="text-center">O2 Sat</th>
            </tr>
          </thead>
          <tbody>
            <q-tr>
              <q-td class="q-gutter-y-sm">
                <q-input
                  v-model="sheet.tasks.Temp"
                  debounce="500"
                  readonly
                  dense
                  outlined
                ></q-input>
                <q-select
                  v-model="sheet.tasks['Temp Type']"
                  :options="['AX', 'OR', 'R']"
                  readonly
                  dense
                  outlined
                ></q-select>
              </q-td>
              <q-td class="q-gutter-y-sm">
                <q-input
                  v-model="sheet.tasks['Radial Pulse']"
                  debounce="500"
                  readonly
                  dense
                  outlined
                ></q-input>
                <q-select
                  v-model="sheet.tasks['Radial Pulse Type']"
                  :options="['R', 'IR']"
                  readonly
                  dense
                  outlined
                ></q-select>
              </q-td>
              <q-td class="q-gutter-y-sm">
                <q-input
                  v-model="sheet.tasks['Apical Pulse']"
                  debounce="500"
                  readonly
                  dense
                  outlined
                ></q-input>
                <q-select
                  v-model="sheet.tasks['Apical Pulse Type']"
                  :options="['R', 'IR']"
                  readonly
                  dense
                  outlined
                ></q-select>
              </q-td>
              <q-td class="q-gutter-y-sm">
                <q-input
                  v-model="sheet.tasks['BP Sitting']"
                  debounce="500"
                  readonly
                  dense
                  outlined
                ></q-input>
                <q-select
                  v-model="sheet.tasks['BP Sitting Type']"
                  :options="['L', 'R']"
                  readonly
                  dense
                  outlined
                ></q-select>
              </q-td>
              <q-td class="q-gutter-y-sm">
                <q-input
                  v-model="sheet.tasks['BP Standing']"
                  debounce="500"
                  readonly
                  dense
                  outlined
                ></q-input>
                <q-select
                  v-model="sheet.tasks['BP Standing Type']"
                  :options="['L', 'R']"
                  readonly
                  dense
                  outlined
                ></q-select>
              </q-td>
              <q-td class="q-gutter-y-sm">
                <q-input
                  v-model="sheet.tasks['BP Lying']"
                  debounce="500"
                  readonly
                  dense
                  outlined
                ></q-input>
                <q-select
                  v-model="sheet.tasks['BP Lying Type']"
                  :options="['L', 'R']"
                  readonly
                  dense
                  outlined
                ></q-select>
              </q-td>
              <q-td>
                <q-input
                  v-model="sheet.tasks.Resp"
                  debounce="500"
                  readonly
                  dense
                  outlined
                ></q-input>
              </q-td>
              <q-td class="q-gutter-y-sm">
                <q-input
                  v-model="sheet.tasks.RBS"
                  debounce="500"
                  readonly
                  dense
                  outlined
                ></q-input>
                <q-select
                  v-model="sheet.tasks['RBS Type']"
                  :options="['F', 'NF']"
                  readonly
                  dense
                  outlined
                ></q-select>
              </q-td>
              <q-td class="q-gutter-y-sm">
                <q-input
                  v-model="sheet.tasks.Weight"
                  debounce="500"
                  readonly
                  dense
                  outlined
                ></q-input>
              </q-td>
              <q-td class="q-gutter-y-sm">
                <q-input
                  v-model="sheet.tasks['O2 Stat']"
                  debounce="500"
                  readonly
                  dense
                  outlined
                  suffix="%"
                ></q-input>
              </q-td>
            </q-tr>
          </tbody>
        </q-markup-table>

        <div v-else class="q-gutter-y-md">
          <q-card flat bordered>
            <q-card-section class="q-gutter-y-sm">
              <h5>Temp</h5>
              <q-input
                v-model="sheet.tasks.Temp"
                debounce="500"
                readonly
                dense
                outlined
              ></q-input>
              <q-select
                v-model="sheet.tasks['Temp Type']"
                :options="['AX', 'OR', 'R']"
                readonly
                dense
                outlined
              ></q-select>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section class="q-gutter-y-sm">
              <h5>Radial Pulse</h5>
              <q-input
                v-model="sheet.tasks['Radial Pulse']"
                debounce="500"
                readonly
                dense
                outlined
              ></q-input>
              <q-select
                v-model="sheet.tasks['Radial Pulse Type']"
                :options="['R', 'IR']"
                readonly
                dense
                outlined
              ></q-select>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section class="q-gutter-y-sm">
              <h5>Apical Pulse</h5>
              <q-input
                v-model="sheet.tasks['Apical Pulse']"
                debounce="500"
                readonly
                dense
                outlined
              ></q-input>
              <q-select
                v-model="sheet.tasks['Apical Pulse Type']"
                :options="['R', 'IR']"
                readonly
                dense
                outlined
              ></q-select>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section class="q-gutter-y-sm">
              <h5>BP Sitting</h5>
              <q-input
                v-model="sheet.tasks['BP Sitting']"
                debounce="500"
                readonly
                dense
                outlined
              ></q-input>
              <q-select
                v-model="sheet.tasks['BP Sitting Type']"
                :options="['L', 'R']"
                readonly
                dense
                outlined
              ></q-select>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section class="q-gutter-y-sm">
              <h5>BP Standing</h5>
              <q-input
                v-model="sheet.tasks['BP Standing']"
                debounce="500"
                readonly
                dense
                outlined
              ></q-input>
              <q-select
                v-model="sheet.tasks['BP Standing Type']"
                :options="['L', 'R']"
                readonly
                dense
                outlined
              ></q-select>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section class="q-gutter-y-sm">
              <h5>BP Lying</h5>
              <q-input
                v-model="sheet.tasks['BP Lying']"
                debounce="500"
                readonly
                dense
                outlined
              ></q-input>
              <q-select
                v-model="sheet.tasks['BP Lying Type']"
                :options="['L', 'R']"
                readonly
                dense
                outlined
              ></q-select>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section class="q-gutter-y-sm">
              <h5>Resp</h5>
              <q-input
                v-model="sheet.tasks.Resp"
                debounce="500"
                readonly
                dense
                outlined
              ></q-input>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section class="q-gutter-y-sm">
              <h5>RBS</h5>
              <q-input
                v-model="sheet.tasks.RBS"
                debounce="500"
                readonly
                dense
                outlined
              ></q-input>
              <q-select
                v-model="sheet.tasks['RBS Type']"
                :options="['F', 'NF']"
                readonly
                dense
                outlined
              ></q-select>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section class="q-gutter-y-sm">
              <h5>Weight</h5>
              <q-input
                v-model="sheet.tasks.Weight"
                debounce="500"
                readonly
                dense
                outlined
              ></q-input>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section class="q-gutter-y-sm">
              <h5>O2 Stat</h5>
              <q-input
                v-model="sheet.tasks['O2 Stat']"
                debounce="500"
                readonly
                dense
                outlined
                suffix="%"
              ></q-input>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <!-- Form Renderer -->
      <q-card-section class="row items-center q-col-gutter-md">
        <template v-for="(task, taskIndex) in tasks">
          <div
            v-if="isFieldVisible(task)"
            :key="taskIndex"
            :class="task.class ? task.class : 'col-12'"
          >
            <h5 v-if="task.type === 'section'" class="q-my-sm">
              {{ task.name }}
            </h5>
            <div v-if="task.type === 'spacer'" class="q-my-md"></div>
            <label v-if="task.type === 'label'">{{ task.name }}</label>
            <q-input
              v-if="task.type === 'textarea'"
              v-model="sheet.tasks[task.field || task.name]"
              :label="task.name"
              type="textarea"
              debounce="500"
              readonly
              :filled="!task.underlined && !task.outlined"
              :outlined="!task.underlined && !!task.outlined"
            ></q-input>
            <q-input
              v-if="task.type === 'input'"
              v-model="sheet.tasks[task.field || task.name]"
              :label="task.name"
              debounce="500"
              readonly
              :filled="!task.underlined && !task.conditions"
              :outlined="!task.underlined && !!task.conditions"
            ></q-input>
            <q-select
              v-if="task.type === 'select'"
              v-model="sheet.tasks[task.field || task.name]"
              :label="task.name"
              :options="task.options"
              :multiple="task.multiple"
              :use-chips="task.multiple"
              readonly
              :filled="!task.underlined && !task.conditions"
              :outlined="!task.underlined && !!task.conditions"
            ></q-select>
            <q-checkbox
              v-if="task.type === 'checkbox'"
              :model-value="!!sheet.tasks[task.field || task.name]"
              @update:model-value="
                val => {
                  $forceUpdate();
                  sheet.tasks = {
                    ...sheet.tasks,
                    [task.field || task.name]: val
                  };
                  sheets[index].tasks = {
                    ...sheet.tasks,
                    [task.field || task.name]: val
                  };
                }
              "
              disabled
              :label="task.name"
            ></q-checkbox>
            <div v-if="task.type === 'radio'">
              <label
                ><strong>{{ task.name }}</strong></label
              >
              <div class="q-gutter-sm">
                <q-radio
                  v-for="(option, index) in task.options"
                  v-model="sheet.tasks[task.name]"
                  :key="index"
                  :val="option.value"
                  :label="option.label"
                  @update:model-value="
                    $forceUpdate();
                    sheet.tasks = { ...sheet.tasks };
                    sheets[index].tasks = { ...sheet.tasks };
                  "
                />
              </div>
            </div>
          </div>
        </template>
      </q-card-section>

      <!-- Signatures -->
      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <div class="row items-center justify-between q-mb-sm">
            <label style="margin-left: 3px">Patient/Caregiver Signature</label>
          </div>
          <q-img
            :src="sheet.clientSignature2_64"
            contain
            width="100%"
            height="100px"
            style="border: 1px solid black"
          ></q-img>

          <q-input
            filled
            label="Date *"
            :model-value="sheet.date2"
            class="q-mt-md"
            readonly
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer"> </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6">
          <div class="row items-center justify-between q-mb-sm">
            <label style="margin-left: 3px">Nurse Signature</label>
          </div>
          <q-img
            :src="sheet.employeeSignature_64"
            contain
            width="100%"
            height="100px"
            style="border: 1px solid black"
          ></q-img>

          <q-input
            filled
            label="Date *"
            :model-value="sheet.employeeSignatureDate"
            class=" q-mt-md"
            readonly
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer"> </q-icon>
            </template>
          </q-input>
        </div>
      </q-card-section>
    </q-form>
  </q-card>
</template>

<script>
import { date, extend } from "quasar";
import moment from "moment";

const tasks = [
  {
    name: "Neuro",
    type: "select",
    multiple: true,
    options: [
      "Alert",
      "Oriented",
      "Disoriented",
      "Confused",
      "Forgetful",
      "PERLA",
      "Other"
    ]
  },
  {
    name: "Neuro Other",
    conditions: { Neuro: "Other" },
    type: "input"
  },
  {
    name: "Muscular",
    type: "select",
    multiple: true,
    options: [
      "WNL",
      "Seizures",
      "Dizziness",
      "Syncope",
      "Tremors",
      "Paralysis",
      "Gait Steady",
      "Gait Unsteady",
      "Other"
    ]
  },
  {
    name: "Muscular Other",
    conditions: { Muscular: "Other" },
    type: "input"
  },
  {
    name: "Genitourinary",
    type: "select",
    multiple: true,
    options: [
      "Clear",
      "Yellow",
      "No Odor",
      "Frequency",
      "Hematuria",
      "Burning",
      "Pain",
      "Incontinent",
      "Other"
    ]
  },
  {
    name: "Genitourinary Other",
    conditions: { Genitourinary: "Other" },
    type: "input"
  },
  {
    name: "Foley Cath",
    type: "select",
    multiple: true,
    options: ["Patent", "Changed", "Irrigated"]
  },
  {
    name: "Foley Cath Changed",
    conditions: { "Foley Cath": "Changed" },
    type: "input"
  },
  {
    name: "Foley Cath Irrigated Width",
    conditions: { "Foley Cath": "Irrigated" },
    type: "input"
  },
  {
    name: "Cardiovascular",
    type: "select",
    multiple: true,
    options: [
      "WNL",
      "Chest Pain",
      "Pacemaker",
      "Arrhythmia",
      "Weakness",
      "Syncope",
      "Other"
    ]
  },
  {
    name: "Cardiovascular Other",
    conditions: { Cardiovascular: "Other" },
    type: "input"
  },
  {
    name: "Respiratory",
    type: "select",
    multiple: true,
    options: [
      "WNL",
      "Shallow",
      "Labored",
      "Productive Cough",
      "Dry Cough",
      "Sputum",
      "Other"
    ]
  },
  {
    name: "Respiratory Other",
    conditions: { Respiratory: "Other" },
    type: "input"
  },
  {
    name: "Respiratory Spatum",
    conditions: { Respiratory: "Sputum" },
    type: "input"
  },
  {
    name: "Lung/Breath Sounds",
    type: "select",
    multiple: true,
    options: [
      "Clear",
      "Rubs",
      "Rales",
      "Wheezes",
      "Diminished",
      "Trach",
      "Changed/Size",
      "O2"
    ]
  },
  {
    name: "Lung/Breath Size",
    conditions: { "Lung/Breath Sounds": "Changed/Size" },
    type: "input"
  },
  {
    name: "O2 @",
    conditions: { "Lung/Breath Sounds": "O2" },
    type: "label",
    class: "col-shrink"
  },
  {
    field: "Lung/Breath O2",
    conditions: { "Lung/Breath Sounds": "O2" },
    type: "input",
    class: "col",
    underlined: true
  },
  {
    name: "L/min via",
    conditions: { "Lung/Breath Sounds": "O2" },
    type: "label",
    class: "col-shrink"
  },
  {
    field: "Lung/Breath Via",
    conditions: { "Lung/Breath Sounds": "O2" },
    type: "input",
    class: "col",
    underlined: true
  },
  {
    name: "Respiratory Spatum",
    conditions: { Respiratory: "Sputum" },
    type: "input"
  },
  {
    name: "Gastrointestinal",
    type: "select",
    multiple: true,
    options: [
      "Date last BM: ",
      "No Problem",
      "Abd pain/tenderness",
      "Nausea",
      "Vomiting",
      "Constipation",
      "Diarrhea"
    ]
  },
  {
    name: "Bowel Sounds Present",
    type: "checkbox"
  },
  {
    name: "Bowel Sounds",
    type: "select",
    conditions: {
      "Bowel Sounds Present": true
    },
    multiple: true,
    options: [
      "Disimpaction",
      "Incontinence",
      "Ostomy",
      "NG Tube",
      "PEF",
      "Etnteral feeding"
    ]
  },
  {
    name: "Pain",
    type: "select",
    multiple: true,
    options: ["Denies", "Location", "Controlled By Meds", "Pain", "Severity"]
  },
  {
    name: "Pain Location",
    conditions: { Pain: "Location" },
    type: "input"
  },
  {
    name: "Pain Severity",
    conditions: { Pain: "Severity" },
    type: "select",
    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    name: "Pain Severity Documentation",
    conditions: { Pain: "Severity" },
    type: "textarea",
    outlined: true
  },
  {
    name: "Does pain interfere with activity/movement",
    type: "select",
    multiple: true,
    options: ["No", "Some of the time", "Most of the time", "All of the time"]
  },
  {
    name: "Skin Color",
    type: "select",
    multiple: true,
    options: [
      "WNL",
      "Pale",
      "Cyanotic",
      "Ashen",
      "Flushed",
      "Jaundiced",
      "Turgor > 3s",
      "Turgor < 3s",
      "Other"
    ]
  },
  {
    name: "Skin Color Other",
    conditions: { "Skin Color": "Other" },
    type: "input"
  },
  {
    name: "Meds Given",
    type: "select",
    multiple: true,
    options: ["PO", "G-Tube", "IM", "SQ", "IV", "Other"]
  },
  {
    name: "Meds Given Other",
    conditions: { "Meds Given": "Other" },
    type: "input"
  },
  {
    name: "Injection",
    type: "section"
  },
  {
    name: "Injection Medication",
    type: "input",
    class: "col-12 col-sm-3"
  },
  {
    name: "Injection Dosage",
    type: "input",
    class: "col-12 col-sm-3"
  },
  {
    name: "Injection Route",
    type: "input",
    class: "col-12 col-sm-3"
  },
  {
    name: "Injection Site",
    type: "input",
    class: "col-12 col-sm-3"
  },
  {
    name: "Infusion",
    type: "section"
  },
  {
    name: "IV started @ site",
    type: "label",
    class: "col-shrink"
  },
  {
    field: "Infusion Site",
    underlined: true,
    type: "input",
    class: "col-12 col-sm-2"
  },
  {
    name: "w/ (size/type of needle)",
    type: "label",
    class: "col-shrink"
  },
  {
    field: "Infusion Size/Type of Needle",
    type: "input",
    underlined: true,
    class: "col-12 col-sm-3"
  },
  {
    name: "w/o event",
    field: "Infusion W/O Event",
    type: "checkbox",
    class: "col-shrink"
  },
  {
    name: "after (#)",
    type: "label",
    class: "col-shrink"
  },
  {
    field: "Infusion # of Attempts",
    type: "input",
    underlined: true,
    class: "col-12 col-sm-2"
  },
  {
    name: "attempts",
    type: "label",
    class: "col-shrink"
  },
  {
    type: "spacer"
  },
  {
    name: "Infused (med)",
    type: "label",
    class: "col-shrink"
  },
  {
    field: "Infused Med",
    type: "input",
    underlined: true,
    class: "col-12 col-sm-3"
  },
  {
    name: "via",
    type: "label",
    class: "col-shrink"
  },
  {
    field: "Infusion Via",
    type: "select",
    multiple: true,
    underlined: true,
    options: ["pump", "gravity"],
    class: "col-12 col-sm-3"
  },
  {
    name: "@",
    type: "label",
    class: "col-shrink"
  },
  {
    field: "Infusion gtts/min",
    type: "input",
    underlined: true,
    class: "col-12 col-sm-3"
  },
  {
    name: "gtts/min",
    type: "label",
    class: "col-shrink"
  },
  {
    type: "spacer"
  },
  {
    name: "Prior to infusion, line flushed with",
    type: "label",
    class: "col-shrink"
  },
  {
    field: "Prior to infusion, line flushed with cc of Saline",
    type: "input",
    underlined: true,
    class: "col-12 col-sm-1"
  },
  {
    name: "cc of Saline",
    type: "label",
    class: "col-shrink"
  },
  {
    name: "Following infusion, line flushed with",
    type: "label",
    class: "col-shrink"
  },
  {
    field: "Following infusion, line flushed with cc of Saline",
    type: "input",
    underlined: true,
    class: "col-12 col-sm-1"
  },
  {
    name: "cc of Saline",
    type: "label",
    class: "col-shrink"
  },
  {
    field: "Following infusion, line flushed with cc of Heparin",
    type: "input",
    underlined: true,
    class: "col-12 col-sm-2 col-md-1"
  },
  {
    name: "cc of Heparin",
    type: "label",
    class: "col-shrink"
  },
  {
    name: "DRSG",
    type: "section"
  },
  {
    name: "Drsg Changed",
    type: "select",
    multiple: true,
    options: ["Peripheral Site", "Central Line"]
  },
  {
    name: "Desg Item Changed",
    type: "select",
    multiple: true,
    options: ["Tubing", "Cap", "Site", "IV dc'd"]
  },
  {
    name: "Desg Item Accessed",
    type: "select",
    multiple: true,
    options: ["Port", "Line", "Sterile Technique"]
  },
  {
    name: "Wound Data",
    type: "section"
  },
  {
    name: "Wound Care Using",
    type: "select",
    multiple: true,
    options: ["Sterile Technique", "Clean Technique"]
  },
  {
    name: "Wound Data/Assessment",
    type: "textarea"
  },
  {
    name: "Wound Size",
    type: "input"
  },
  {
    name: "Wound Drainage",
    type: "input"
  },
  {
    name: "Wound Amount",
    type: "input"
  },
  {
    name: "Wound Odor",
    type: "input"
  },
  {
    name: "Wound Bed Color",
    type: "input"
  },
  {
    name: "Wound Stage",
    type: "input"
  },
  {
    name: "Wound Care N/A",
    type: "checkbox"
  },
  {
    name: "Wound Care",
    conditions: { "Wound Care N/A": false },
    type: "textarea"
  },
  {
    type: "spacer"
  },
  {
    name: "Universal Precautions",
    type: "select",
    multiple: true,
    options: ["Hand Washing", "Sharps Disposal", "Double Bag"]
  },
  {
    name: "Medications",
    type: "select",
    multiple: true,
    options: ["Reviewed", "New", "Changed"]
  },
  {
    name: "Medications Reviewed",
    conditions: { Medications: "Reviewed" },
    type: "input"
  },
  {
    name: "Medications Changed",
    conditions: { Medications: "Changed" },
    type: "input"
  },
  {
    name: "Teaching Performed",
    type: "textarea"
  },
  {
    name: "Instructions Provided to",
    type: "select",
    multiple: true,
    options: ["Patient", "Caregiver"]
  },
  {
    name: "Instructions Provided Method",
    type: "select",
    multiple: true,
    options: ["Verbally", "Written"]
  },
  {
    name: "Response to Teaching",
    type: "select",
    multiple: true,
    options: [
      "Repeats completely and accurately",
      "Verbalizes understanding of instructions",
      "Verbalizes limited understanding of instructions",
      "No comprehension of instruction",
      "Demonstrates comprehension of prior teaching",
      "Needs further instruction",
      "Performs procedure without coaching",
      "Performs procedure with coaching",
      "Unable to perform procedure with coaching"
    ]
  },
  {
    name: "Communication with",
    type: "select",
    multiple: true,
    options: [
      "MD",
      "PT",
      "ST",
      "AIDE",
      "MSS",
      "NURSE",
      "PHARMACIST",
      "PATIENT/CG",
      "Other"
    ]
  },
  {
    name: "Communication with Other",
    conditions: { "Communication with": "Other" },
    type: "input"
  },
  {
    name: "Communication resulted in",
    type: "select",
    multiple: true,
    options: [
      "Patient status update",
      "Patient/CG participation in the revision to POC",
      "New Order"
    ]
  },
  {
    name: "Notes",
    type: "section"
  },
  {
    name: "Narrative",
    type: "textarea"
  },
  {
    name: "Continuation",
    type: "radio",
    options: [
      {
        label: "Yes",
        value: true
      },
      {
        label: "No",
        value: false
      }
    ]
  },
  {
    name: "Progress Note",
    type: "textarea"
  },
  {
    name: "Supplies Taken",
    type: "radio",
    options: [
      {
        label: "Yes",
        value: true
      },
      {
        label: "No",
        value: false
      }
    ]
  },
  {
    type: "spacer"
  }
];

export default {
  name: "ActivitySheetV2",

  props: ["sheet"],

  watch: {
    sheet: {
      deep: true,
      immediate: true,
      handler(sheet) {
        this.sheetCopy = {};
        const payload = extend(true, this.sheetCopy, sheet);

        for (let i = 1; i <= 7; i++) {
          const date = payload["date" + i];
          if (!!date) {
            payload["date" + i] = moment(date).format("MM-DD-YYYY");
          }
        }

        if (!!payload.dateReported) {
          payload.dateReported = moment(payload.dateReported).format(
            "MM-DD-YYYY"
          );
        }

        if (!!payload.employeeSignatureDate) {
          payload.employeeSignatureDate = moment(
            payload.employeeSignatureDate
          ).format("MM-DD-YYYY");
        }

        if (typeof payload?.tasks === "string") {
          payload.tasks = JSON.parse(payload.tasks);
        }

        if (!payload.tasks) {
          payload.tasks = {};
          tasks
            .filter(
              f =>
                f.type !== "section" &&
                f.type !== "spacer" &&
                f.type !== "label"
            )
            .forEach(task => {
              if (task.type === "checkbox") {
                payload.tasks[task.name] = false;
                return;
              }
              payload.tasks[task.name] = task.multiple ? [] : "";
            });
        }

        this.sheetCopy = payload;
      }
    }
  },
  methods: {
    isFieldVisible(task) {
      if (task.conditions) {
        for (const key in task.conditions) {
          const value = this.sheetCopy.tasks[key];
          const conditionValue = task.conditions[key];
          if (Array.isArray(value) && value?.some(v => v === conditionValue)) {
            return true;
          } else if (value === conditionValue) {
            return true;
          }
        }
      }

      return !task.conditions;
    }
  },

  data() {
    return {
      tasks,
      date,
      moment,
      sheetCopy: {}
    };
  }
};
</script>
