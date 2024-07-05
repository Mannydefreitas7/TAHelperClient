<template>
  <q-layout view="lHh Lpr lFf" class="bg-indigo-1">
    <q-page-container id="wrapper">
      <div v-if="step !== 3" class="center-page">
        <div v-if="logoUrl" class="row justify-center full-width">
          <q-img
            :src="logoUrl"
            style="max-width: 250px"
            basic
            spinner-color="white"
            class="rounded-borders vertical-top"
          />
        </div>
        <q-card class="q-mb-xl">
          <q-card-section class="q-mt-md">
            <div class="text-center">
              <h4 class="q-pa-none q-ma-none">
                {{ campaignName }}
              </h4>
            </div>

            <q-input
              v-if="step === 1"
              v-model="username"
              label="Email/Phone"
              class="q-my-lg"
              filled
            ></q-input>
            <q-input
              v-if="step === 2"
              v-model="pin"
              label="Pin *"
              class="q-my-lg"
              filled
            ></q-input>

            <span v-if="authType" class="text-caption text-red-8">
              ** Pin has been sent to your {{ authType }}
            </span>
          </q-card-section>
          <q-card-actions class="bg-grey-3 q-pa-md" align="right">
            <q-btn
              v-if="step === 1"
              no-caps
              label="Use Code"
              color="grey-8"
              style="width: 110px"
              @click="step = 2"
            ></q-btn>
            <q-btn
              v-if="step === 1"
              no-caps
              label="Send Code"
              color="primary"
              style="width: 110px"
              @click="sendAuthCode"
            ></q-btn>
            <q-btn
              v-if="step === 2"
              no-caps
              label="Start Over"
              color="grey-8"
              style="width: 90px"
              @click="
                step = 1;
                pin = '';
                authType = null;
              "
            ></q-btn>
            <q-btn
              v-if="step === 2"
              no-caps
              label="Sign In"
              color="primary"
              style="width: 90px"
              @click="signIn"
            ></q-btn>
          </q-card-actions>
        </q-card>
      </div>

      <div v-show="step === 3" class="full-height">
        <q-card class="q-mx-md">
          <q-card-section class="row items-center">
            <h5 class="q-ma-none">Events</h5>

            <q-space></q-space>

            <q-input
              :model-value="payPeriod"
              readonly
              dense
              filled
              class="q-mr-sm"
              label="Pay Period"
            >
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="payPeriodPicker"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      color="primary"
                      :model-value="payPeriod"
                      @update:model-value="
                        (val) => {
                          $refs.payPeriodPicker.hide();
                          payPeriod = '';
                          $nextTick(() => (payPeriod = val));
                        }
                      "
                      today-btn
                      mask="YYYY-MM-DD"
                      no-unset
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>
        </q-card>

        <q-list
          class="q-pa-md"
          v-if="events[payPeriod] && events[payPeriod].length"
        >
          <q-expansion-item
            v-for="(event, index) in events[payPeriod]"
            :key="index"
            :label="event.Title"
            header-class="bg-grey-4"
            default-opened
            class="q-mb-md"
          >
            <template #header>
              <q-item-section avatar>
                <q-avatar
                  icon="calendar_today"
                  :style="'background: ' + event.EventColor"
                  text-color="white"
                />
              </q-item-section>
              <q-item-section class="text-black">
                <div class="row">
                  <span class="text-h5 q-mr-md">{{ event.Title }}</span>
                  <q-badge
                    v-if="!!event.Submitted"
                    color="positive"
                    class="q-my-xs q-ml-xs q-py-xs text-white"
                  >
                    <strong>Submitted</strong>
                  </q-badge>

                  <q-badge
                    v-if="!!event.ReadOnly"
                    color="primary"
                    class="q-my-xs q-ml-xs q-py-xs text-white"
                  >
                    <strong>Approved</strong>
                  </q-badge>
                </div>
              </q-item-section>
            </template>
            <survey-event
              :username="username"
              :pin="pin"
              :event="event"
              @submit="event.Submitted = 1"
            ></survey-event>
          </q-expansion-item>
        </q-list>
        <div
          v-else
          class="center-page column items-center q-gutter-y-md text-center text-grey-8"
        >
          <q-icon name="event_busy" size="150px"></q-icon>
          <span class="text-h5">
            No events found for this pay period. Please try a different pay
            period.
          </span>
        </div>
      </div>
    </q-page-container>

    <q-dialog v-model="showInvalidCreds" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center">
          <q-avatar
            round
            size="lg"
            color="red-8"
            text-color="white"
            icon="warning" />

          <div class="q-ml-md">
            <div class="full-width text-h6" style="line-height: 1em;">
              Invalid Username or Password
            </div>
          </div>

          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <span>Would you like the password sent to your {{ username.indexOf("@") > -1 ? 'email' : 'phone' }}?</span>
        </q-card-section>

        <q-card-actions class="bg-grey-2 q-pa-md" align="between">
          <q-btn
            color="grey-8"
            text-color="white"
            no-caps
            label="No"
            style="width: 90px"
            v-close-popup />

          <q-btn
            color="blue-8"
            text-color="white"
            no-caps
            label="Yes"
            style="width: 90px"
            @click="sendAuthCode(); showInvalidCreds = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { axiosInstance } from "src/boot/axios";
import { mainMixin } from "../mixins";
import moment from "moment";

import SurveyEvent from "../components/SurveyEvent";

const authurl = `${import.meta.env.BASE_URL}/auth`;
const eventurl = `${import.meta.env.BASE_URL}/event`;

export default {
  name: "SurveyEvents",
  mixins: [mainMixin],
  components: {
    SurveyEvent,
  },
  async mounted() {
    const { data } = await axiosInstance.get(
      `${eventurl}/page-data`,
      this.config
    );
    this.logoUrl = data.logo;
    this.campaignName = data.name;
  },
  computed: {
    config() {
      return {
        headers: {
          u: this.username,
          p: this.pin,
        },
      };
    },
  },
  methods: {
    async sendAuthCode() {
      try {
        if (!this.username) {
          return this.showErrorMessage("Email or phone is required");
        }

        const { data } = await axiosInstance.get(
          `${authurl}/sendAuthCode/${encodeURIComponent(this.username)}`
        );

        localStorage.setItem("se_username", this.username);
        this.step = 2;
        this.authType = data.authType;
      } catch (err) {
        this.showErrorMessage("User not found");
        console.error(err);
      }
    },
    async signIn() {
      try {
        if (!this.username || !this.pin) {
          return this.showErrorMessage("Email or Phone and pin are required");
        }

        const { data } = await axiosInstance.get(
          `${authurl}/authenticate`,
          this.config
        );
        this.user = data;
        this.step = 3;
        await this.getEvents();
      } catch (err) {
        if (err.response?.status === 401) {
          this.showInvalidCreds = true;
        }
        console.error(err);
      }
    },
    async getEvents() {
      try {
        const { data } = await axiosInstance.get(
          `${eventurl}/events`,
          this.config
        );

        const eventsFromStoreWithDate = data.map((efs) => {
          const startObj = new moment(
            efs.EventStartDateTime,
            "YYYY-MM-DD HH:mm"
          );
          const endObj = new moment(efs.EventEndDateTime, "YYYY-MM-DD HH:mm");

          return {
            ...efs,
            EventDate: startObj.format("YYYY-MM-DD"),
            EventStartTime: startObj.format("hh:mm a"),
            EventEndTime: endObj.format("hh:mm a"),
            EventStartsIn: startObj.fromNow(),
            // EventDuration: endObj.diff(startObj, 'minutes')
          };
        });

        let eventsObj = eventsFromStoreWithDate.reduce((r, a) => {
          const arr = r[a.EventDate] || [];
          r[a.EventDate] = [
            ...arr.sort((a, b) => (a.EventStartTime > b.EventEndTime ? 1 : -1)),
            a,
          ];
          return r;
        }, {});

        const todayString = moment(new Date()).format("YYYY-MM-DD");
        if (!(todayString in eventsObj)) {
          eventsObj[todayString] = [];
        }

        this.events = eventsObj;
      } catch (err) {
        this.showErrorMessage("Invalid user or pin");
        console.error(err);
      }
    },
    async submitForm(form) {
      try {
        await axiosInstance.post(`${eventurl}/save`, form, this.config);
        this.showSuccessMessage("Submitted successfully");
      } catch (err) {
        this.showErrorMessage("Unable to submit form");
        console.error("Error: ", err);
      }
    },
    updateValue(field, index, value) {},
  },
  data: () => ({
    logoUrl: "",
    campaignName: "",
    username: localStorage.getItem("se_username") || "",
    showInvalidCreds: false,
    pin: "",
    step: 1,
    authType: null,
    user: {},
    events: {},
    payPeriod: moment(new Date()).format("YYYY-MM-DD"),
  }),
};
</script>

<style lang="scss">
.center-page {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 500px;
  width: 100vw;
}
</style>
