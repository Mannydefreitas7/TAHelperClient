<template>
  <q-layout view="lHh Lpr lFf" class="bg-indigo-1">
    <q-page-container id="wrapper">
      <q-form
        greedy
        class="center-page"
        style="max-width: 500px"
        @submit.prevent="
          (evt) =>
            evt.submitter.id == 'subscribe-btn' ? subscribe() : unsubscribe()
        "
      >
        <q-card class="q-mb-xl">
          <q-card-section class="q-mt-md">
            <div class="text-center">
              <h5 class="q-pa-none q-ma-none text-bold">
                Manage Email Subscription
              </h5>
            </div>

            <q-input
              v-model="email"
              label="Email"
              type="email"
              class="q-my-lg"
              filled
              required
            />
          </q-card-section>
          <q-card-actions class="bg-grey-3 q-pa-md justify-between">
            <q-btn
              id="unsubscrive-btn"
              no-caps
              label="Unsubscribe"
              color="red-8"
              style="width: 110px"
              type="submit"
            ></q-btn>
            <q-btn
              id="subscribe-btn"
              no-caps
              label="Subscribe"
              color="primary"
              style="width: 110px"
              type="submit"
            ></q-btn>
          </q-card-actions>
        </q-card>
      </q-form>
    </q-page-container>
  </q-layout>
</template>

<script>
import { axiosInstance } from "../boot/axios";
import { mainMixin } from "../mixins/index";

const baseurl = `${import.meta.env.BASE_URL}/subscriptions/email`;

export default {
  name: "EmailSubscription",
  mixins: [mainMixin],
  async mounted() {
    this.email = this.$route.query.email || "";
  },
  methods: {
    async unsubscribe() {
      try {
        await axiosInstance.put(
          `${baseurl}/unsubscribe?email=${encodeURIComponent(this.email)}`
        );
        this.showSuccessMessage("Successfully unsubscribed email.", "top", [
          {
            label: "Subscribe",
            color: "white",
            handler: () => {
              this.subscribe();
            },
          },
        ]);
      } catch (err) {
        console.error("Error: ", err);
        this.showErrorMessage("Unable to unsubscribe");
      }
    },
    async subscribe() {
      try {
        await axiosInstance.put(
          `${baseurl}/subscribe?email=${encodeURIComponent(this.email)}`
        );
        this.showSuccessMessage("Successfully subscribed email.");
      } catch (err) {
        console.error("Error: ", err);
        this.showErrorMessage("Unable to subscribe");
      }
    },
  },
  data: () => ({
    email: "",
  }),
};
</script>
