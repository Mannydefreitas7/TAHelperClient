<template>
  <q-item default-opened>
    <div v-if="isComplete" class="q-mx-auto">
      <q-banner rounded class="bg-teal-8 text-white">
        <div class="text-center" id="submit-message">
          Your response has been submitted. You scored 10% on this test.
          <br />Thank you!
        </div>
      </q-banner>
    </div>

    <q-form
      v-else
      greedy
      class="full-width"
      @submit.prevent="save"
      @validation-error="
        () => {
          showErrorMessage('Please complete all required fields');
        }
      "
    >
      <q-stepper
        v-model="step"
        color="ghg-residential-primary-darkblue"
        class="full-width"
        :contracted="$q.screen.lt.sm"
        animated
        @transition="() => goToTop()"
      >
        <q-step v-for="(group, index) in groups" :key="index" :name="index" :title="group[0].title || 'Questions'" icon="list" :done="step > index">
          <div v-for="(field, index2) in group" :key="index2">
            <q-stepper-navigation
              v-if="field.type === 'video'"
              class="row justify-center q-ma-none q-pa-none"
            >
              <q-item side>
                <q-item-label>
                  Please watch this video then click next.
                </q-item-label>
              </q-item>
              <q-btn
                @click="$refs.qmediaplayer.play()"
                color="ghg-residential-primary-green"
                class="q-mb-lg q-mr-md"
                label="Play"
              ></q-btn>
            </q-stepper-navigation>
            <q-media-player
              v-if="field.type === 'video'"
              ref="qmediaplayer"
              style="max-height: 400px"
              background-color="black"
              preload="none"
              radius="1rem"
              :autoplay="false"
              :show-big-play-button="true"
              source="https://rohghg.blob.core.windows.net/consent-videos/Health Care Coming Home-720p.mp4"
              type="video"
            ></q-media-player>

            <p v-else class="text-body2 q-mb-sm">
              <span class="text-weight-bold">{{ field.text }}</span>
              <q-option-group
                v-model="data[field.id]"
                :options="Object.keys(field.options).map(key => ({
                  label: field.options[key],
                  value: key,
                }))"
                type="radio" />
            </p>
          </div>
          <q-stepper-navigation class="row justify-between q-ma-none q-pa-none">
            <q-btn
              v-if="index !== 0"
              @click="step--"
              color="ghg-residential-primary-darkblue"
              class="q-mt-lg"
              label="Prev"
            ></q-btn>
            <div v-else></div>
            <q-btn
              v-if="index !== groups.length - 1"
              @click="step++"
              color="ghg-residential-primary-darkblue"
              class="q-mt-lg"
              label="Next"
            ></q-btn>
            <q-btn
              v-else
              @click="save"
              color="green"
              class="q-mt-lg"
              label="Submit"
            ></q-btn>
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
    </q-form>
  </q-item>
</template>

<script>
import { mainMixin } from "../../mixins/index";
import { colors } from "quasar";
import { axiosInstance } from "src/boot/axios";

const requiredFields = {};
const formName = "Training";
const { getPaletteColor } = colors;

export default {
  requiredFields,
  name: formName,
  mixins: [mainMixin],
  props: ["mediaId", "formData", "employeeId"],
  mounted() {
    const data = JSON.parse(JSON.parse(this.formData));
    for (let i = 0; i < data.length; i++) {
      const field = data[i];
      if (field.type === 'video') {
        this.groups.push([field]);
        if (i !== data.length - 1) {
          this.groups.push([]);
        }
        continue;
      }

      if (!this.groups.length) {
        this.groups.push([field]);
        continue;
      }

      this.groups.at(-1).push(field);
    }
  },
  methods: {
    async goToTop() {
      window.scrollTo(0, 0);
    },
    async save() {
      const payload = {
        employeeId: this.employeeId,
        tasks: [
          {
            name: "Training",
            complete: true,
            data: JSON.stringify({...this.data})
          }
        ]
      };
      await axiosInstance.post(
        `${import.meta.env.BASE_URL}/expiring-service-requirements/save-progress/${this.mediaId}?deliveryMethod=ServiceRequirementTrainingSessionResponse`,
        payload
      );

      const surveyEntries = [
        {
          name: "completedTasks",
          value: 1,
          required: true,
          notifyKeyword: null,
          dbField: null
        },
        {
          name: "totalTasks",
          value: 1,
          required: true,
          notifyKeyword: null,
          dbField: null
        }
      ];
      await axiosInstance.post(
        `${import.meta.env.BASE_URL}/expiring-service-requirements/save/${this.mediaId}?deliveryMethod=ServiceRequirementTrainingSessionResponse`,
        {
          surveyEntries,
          employeeSignature64: null,
        }
      );
      this.isComplete = true;
    },
  },
  data: () => ({
    isComplete: false,
    step: 0,
    groups: [],
    data: {},
    getPaletteColor,
  }),
};
</script>
