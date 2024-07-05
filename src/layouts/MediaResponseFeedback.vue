<template>
  <q-layout view="lHh Lpr lFf" class="bg-indigo-1">
    <q-page-container id="wrapper">

      <div v-if="logoUrl" class="row justify-center full-width">
        <q-img
          :src="logoUrl"
          basic
          style="max-width: 250px"
          spinner-color="white"
          class="rounded-borders"
        />
      </div>

      <div v-if="pageHeader" class="row justify-center full-width q-mt-xs">
        <q-banner dense class="bg-indigo-1">
          <div class="row justify-between">
            <p class="text-subtitle1 q-mb-none">
              {{ pageHeader }}
            </p>
          </div>
        </q-banner>
      </div>

      <div class="q-mx-md q-px-md q-mt-sm row justify-center">
        <q-card style="max-width: 800px; width: 100%;">
          <q-card-section>
            <div class="text-h6">{{!accepted ? "File Rejected" : "File Accepted"}}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-select
              v-if="!accepted"
              filled
              multiple
              use-chips
              label="Options"
              class="q-mb-md"
              :options="rejectedOptions"
              v-model="reasons"
              @update:model-value="updateComments"></q-select>

            <q-input
              v-model="comments"
              filled
              type="textarea"
              label="Comments"
              rows="17"
            />
          </q-card-section>

          <q-separator></q-separator>

          <q-card-actions class="row items-center justify-between">
            <q-btn
              no-caps
              color="purple-6"
              :label="'Chat With ' + userName"
              icon="chat_bubble_outline"
              class="q-px-sm q-ml-sm q-my-xs"
              @click="openNewTab"></q-btn>

            <q-btn
              no-caps
              color="blue-6"
              label="Send Message"
              icon="send"
              class="q-px-sm q-mr-sm q-my-xs"
              @click="sendMessage()"></q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </q-page-container>
  </q-layout>
</template>
<script>
import { axiosInstance } from "src/boot/axios";
import documentsApi from "../api/documents";

export default {
  name: "MediaResponseFeedback",
  async created() {
    this.mediaId = this.$route.params.id;
    this.accepted = this.$route.params.status === "accepted";

    await axiosInstance
      .get(`${import.meta.env.BASE_URL}/media/page-data-feedback/${this.mediaId}`)
      .then((response) => {
        this.logoUrl = response.data.logo;
        this.pageHeader =  `${response.data.subject} - ${response.data.name}`;
        this.userName = response.data.name;

        if (response.data.tenantName === "EDWU") {
          this.rejectedOptions = [
            {label: "Not legible", comment: "Not legible", action: "Please take a new photo and re-submit"},
            {label: "Duplicate copy", comment: "Duplicate copy", action: "Please choose the correct task sheet and re-submit"},
            {label: "No client signature", comment: "No client signature", action: "Please have your client sign your task sheet and re-submit"},
            {label: "No employee signature", comment: "No employee signature", action: "Please sign your task sheet and re-submit"},
            {label: "Missing documentation for why care plan was not followed", comment: "Missing documentation for why care plan was not followed", action: "Please document all reasons why the care plan was not followed and re-submit"},
            {label: "Task sheet expired-contact the office", comment: "Task sheet expired-contact the office", action: "Contact the office for updated task sheets"},
            {label: "Services were provided / or were not provided according to care plan", comment: "Services were provided / or were not provided according to care plan", action: "Please fill out clock out time and submit"},
            {label: "Week ending date missing", comment: "Week ending date missing", action: "Enter week-ending date and re-submit"},
            {label: "Employee name not written at top of page", comment: "Employee name not written at top of page", action: "Write your name at top of page and re-submit"},
          ]
        }

        if (this.$route.params.status === "accepted") {
          this.comments = `Dear ${response.data.name},` +
          `\n\nThe correction form you submitted has been accepted & has been forwarded on to payroll for processing. No other action is needed on your part unless there is a problem with the document you submitted. This is not a guarantee of payment because this information still needs to be checked & verified.`;
        } else {
          this.comments = `Dear ${response.data.name},` +
            `\n\nThe correction form you submitted has been rejected & will not be processed. The reason for your rejection is listed below:` +
            `\n\n(No Reasons selected)` +
            `\n\nPlease correct the correction form and resubmit.`;
        }
      });
  },
  methods: {
    updateComments() {
      this.$nextTick(() => {
        const formattedReasons = [];

        for (const reason of this.reasons) {
          formattedReasons.push(`\n\n - ${reason.comment}. ${reason.action}`)
        }

        this.comments = `Dear ${this.userName},` +
          `\n\nThe correction form you submitted has been rejected & will not be processed. The reason for your rejection is listed below:` +
          `\n\n(Rejection Reason’s)` +
          (formattedReasons.length > 0 ? formattedReasons.join("") : "\n\n(No reasons selected)") +
          `\n\nPlease correct the correction form and resubmit.`;

        this.$forceUpdate();
      });
    },
    openNewTab() {
      const link = this.$router.resolve({ path: '/Chat' });
      window.open(link.href, '_blank');
    },
    async sendMessage() {
      try {
        this.$q.loading.show();

        const payload = {mediaId: this.mediaId, comments: this.comments, accepted: this.accepted};
        await documentsApi.sendFeedback(payload);

        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          position: "center",
          closeBtn: true,
          timeout: 5000,
          message: `Message Sent`,
        });
      } catch (error) {
        console.error(error);
      } finally {
        this.$q.loading.hide();
      }
    }
  },
  data() {
    return {
      accepted: true,
      userName: "",
      mediaId: "",
      pageHeader: "",
      logoUrl: "",
      comments: "",
      reasons: null,
      rejectedOptions: [
        {label: "Problem with image", comment: "Problem With Image", action: "Please take a new photo and submit"},
        {label: "Multiple correction forms same image", comment: "Multiple Correction Forms Same Image", action: "Please submit one correction form per image"},
        {label: "No reason checked", comment: "No EVV reason checked", action: "Please select a reason and submit"},
        {label: "Not enough tasks", comment: "You have not selected enough tasks", action: "Please call the office with tasks you completed"},
        {label: "No date on timesheet", comment: "No date on timesheet", action: "Please fill in the date and submit"},
        {label: "No clock in time", comment: "No clock in time", action: "Please fill out clock in time and submit"},
        {label: "No clock out time", comment: "No clock out time", action: "Please fill out clock out time and submit"},
        {label: "No signature", comment: "Missing a signature", action: "Please sign and submit"},
        {label: "Caregiver name missing", comment: "Caregiver name missing", action: "Please write in the caregiver name and submit"},
        {label: "Weekly timesheets", comment: "EVV required - No longer accept weekly timesheets", action: "Please use a daily correction form and submit"},
        {label: "Illegible", comment: "Unable to read handwriting", action: "Please fill out another form and submit"},
      ]
    };
  },
};
</script>

<style scoped>
#wrapper {
  margin: auto;
  padding: 5px;
}
.fade-enter-active {
  transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
