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
  name: "ExpiringServiceRequirementsResponseFeedback",
  async created() {
    this.mediaId = this.$route.params.id;
    this.accepted = this.$route.params.status === "accepted";

    await axiosInstance
      .get(`${import.meta.env.BASE_URL}/media/page-data-feedback/${this.mediaId}`)
      .then((response) => {
        this.logoUrl = response.data.logo;
        this.pageHeader =  `${response.data.subject} - ${response.data.name}`;
        this.userName = response.data.name;

        if (this.$route.params.status === "accepted") {
          this.comments = `Dear ${response.data.name},` +
          `\n\nThe documentation you submitted for an expiring service requirements has been accepted. No other action is needed on your part.`;
        } else {
          this.comments = `Dear ${response.data.name},` +
            `\n\nThe documentation you submitted for an expiring service requirements has been rejected and will not be processed. The reason for your rejection is listed below:` +
            `\n\n(No Reasons selected)` +
            `\n\nPlease correct the issue and resubmit.`;
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
          `\n\nThe documentation you submitted for an expiring service requirements has been rejected and will not be processed. The reason for your rejection is listed below:` +
          `\n\n(Rejection Reasons)` +
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
        {label: "Inadmissible documentation", comment: "Inadmissible documentation. This document does not adequately address the expiring service requirement", action: "Please upload supporting documentation"},
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

