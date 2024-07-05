<template>
  <div>
    <div v-if="submitted">
      <strong>Submitted:</strong>
      {{ submittedDateTime }}
      <br />
    </div>
    <div v-else-if="loaded">
      <I9EmployeeEligibilityVerificationForm
        ref="form"
        :task="task"
        @onChange="onFormChange"
      />
      <div class="row q-my-md">
        <q-btn
          color="red"
          class="q-mt-sm"
          icon="edit"
          dense
          flat
          @click="signatureRefName = 'employeeSignature'"
        >
          Clear Signature
        </q-btn>
        <VueSignaturePad
          ref="employeeSignature"
          class="rounded-borders xoverflow-hidden q-py-sm"
          style="border: 1px solid #a0a0a0"
          :options="{
            penColor: 'rgb(0, 0, 0)',
            borderWidth: 1,
            borderStyle: 'solid',
            backgroundColor: 'rgb(255,255,255, 0)',
            onBegin: () => {
              $refs.employeeSignature.resizeCanvas();
            }
          }"
        />
      </div>
      <div
        class="row justify-center text-red-6 text-bold q-pb-md"
        v-if="submitError"
      >
        {{ submitError }}
      </div>
      <div class="row justify-center">
        <q-btn
          color="blue-6"
          text-color="white"
          :disable="
            $refs['employeeSignature'] && $refs['employeeSignature'].isEmpty()
          "
          label="Submit"
          @click="submit"
        />
      </div>
    </div>

    <q-dialog
      :model-value="signatureRefName !== null"
      @update:model-value="signatureRefName = null"
      persistent
    >
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Clear Signature</div>
        </q-card-section>

        <q-card-section>
          <div>Are you sure you want to clear this signature?</div>
        </q-card-section>

        <q-card-actions class="row justify-between text-primary q-pt-none">
          <q-btn
            no-caps
            label="Cancel"
            color="grey-3"
            class="text-black"
            v-close-popup
          />
          <q-btn
            no-caps
            label="Clear Signature"
            color="red"
            @click="clearSignature()"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { mainMixin } from "../../mixins/index";
import { axiosInstance } from "../../boot/axios";
import I9EmployeeEligibilityVerificationForm from "./I9EmployeeEligibilityVerificationForm";

export default {
  name: "HireI9Form",

  mixins: [mainMixin],
  components: { I9EmployeeEligibilityVerificationForm },
  props: {
    mediaId: String,
    employeeId: String
  },
  async mounted() {
    this.user = {
      data: JSON.stringify([
        // {
        //   formName: I9EmployeeEligibilityVerificationForm.name,
        //   status: "in-progress"
        // }
      ])
    };
    await this.loadTaskStatus();
    this.loaded = true;
  },
  methods: {
    validate() {
      let valid = true;
      if (this.$refs["employeeSignature"].isEmpty()) {
        valid = false;
        this.submitError = "Signature cannot be null";
      }
      if (!this.$refs["form"].isComplete) {
        valid = false;
        this.submitError = "You must complete the I9 form";
      }

      return valid;
    },
    async submit() {
      try {
        if (!this.validate()) {
          return;
        }

        this.submitError = null;

        const surveyEntries = [
          {
            name: "completedTasks",
            value: this.completedTasks,
            required: true,
            notifyKeyword: null,
            dbField: null
          },
          {
            name: "totalTasks",
            value: this.totalTasks,
            required: true,
            notifyKeyword: null,
            dbField: null
          }
        ];
        const employeeSignature = this.$refs[
          "employeeSignature"
        ].saveSignature();
        const payload = {
          surveyEntries,
          employeeSignature64: employeeSignature.data
        };
        const { data } = await axiosInstance.post(
          `${import.meta.env.BASE_URL}/expiring-service-requirements/save/${this.mediaId}?deliveryMethod=ServiceRequirementHireI9SessionResponse`,
          payload
        );

        this.submitted = true;
        this.submittedDateTime = data.submittedDateTime;
      } catch (error) {
        console.error("Unable to submit: ", err);
        this.submitError = "An error occurred. Please try again.";
      }
    },
    async onFormChange(value) {
      this.task.data = value;
      const parsedData = JSON.parse(value);
      const complete = parsedData.status === "completed";
      const payload = {
        employeeId: this.employeeId,
        tasks: [
          {
            name: I9EmployeeEligibilityVerificationForm.name,
            complete: complete,
            data: value
          }
        ]
      };

      const { data } = await axiosInstance.post(
        `${import.meta.env.BASE_URL}/expiring-service-requirements/save-progress/${this.mediaId}?deliveryMethod=ServiceRequirementHireI9SessionResponse`,
        payload
      );
      if (!data.length) {
        return;
      }
      this.task = data.length ? data[0] : {};
    },
    async loadTaskStatus() {
      const payload = {};
      const response = await axiosInstance.post(
        `${import.meta.env.BASE_URL}/expiring-service-requirements/fetch-progress/${this.mediaId}?deliveryMethod=ServiceRequirementHireI9SessionResponse`,
        payload
      );

      if (!response.data.length) {
        await this.onFormChange('{"status": "in-progress", "formName": "I9EmployeeEligibilityVerificationForm"}');
        await this.loadTaskStatus();
        return;
      }
      this.task = response.data[0];
    },
    clearSignature() {
      const ref = this.$refs[this.signatureRefName];
      ref.clearSignature();
      this.signatureRefName = null;
      this.$forceUpdate();
    }
  },
  data: () => {
    return {
      task: { data: "{}" },
      submitted: false,
      submittedDateTime: null,
      signatureRefName: null,
      loaded: false,
      submitError: null
    };
  }
};
</script>

<style lang="scss" scoped>
.red-border {
  border: solid 6px $red-2;
}
</style>
