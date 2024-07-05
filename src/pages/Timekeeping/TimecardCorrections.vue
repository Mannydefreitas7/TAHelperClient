<template>
  <q-card>
    <q-layout
      view="lHh lpR lff"
      container
      class="full-width"
      style="height: calc(100vh - 140px)"
    >
      <q-drawer
        v-model="navOpen"
        :width="300"
        show-if-above
        bordered
        :breakpoint="690"
      >
        <div class="absolute-top" style="z-index: 50;">
          <div class="bg-white q-py-xs">
            <q-toolbar class="text-black row q-gutter-sm justify-end">
              <span class="q-ml-sm text-capitalize text-grey-7">
                Total:
                {{ totalTimecards }}
              </span>

              <q-space />
              <q-btn
                dense
                flat
                color="grey-9"
                icon="refresh"
                @click="loadTimecards(true)"
              >
                <q-tooltip>Refresh</q-tooltip>
              </q-btn>
            </q-toolbar>
            <q-toolbar>
              <q-input
                dense
                filled
                v-model="timecardViewState.searchTerm"
                placeholder="Search"
                debounce="400"
                class="full-width no-border no-outline rounded-borders"
                @update:model-value="value => onSearch(value)"
                @clear="value => onSearchClear(value)"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-toolbar>
          </div>
          <q-separator />
        </div>

        <q-item dense v-ripple style="margin-top: 105px;">
          <q-item-section avatar>
            <q-icon color="secondary" name="archive" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Accepted/Rejected</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              color="secondary"
              @update:model-value="loadTimecards(true)"
              v-model="timecardViewState.showArchived"
            />
          </q-item-section>
        </q-item>

        <q-virtual-scroll
          ref="virtualScroll"
          style="height: calc(100% - 150px)"
          :virtual-scroll-slice-size="timecardViewState.pageSize"
          :items="timecards"
          @virtual-scroll="details => onVirtualScroll(details)"
          separator
        >
          <template v-slot="{ item: timecard, index }">
            <q-item
              clickable
              v-ripple
              class="q-pa-sm"
              :key="index"
              dense
              @click="
                () => {
                  selectedTimecard = { ...timecard };
                  currentTabIndex = 1;
                  tab = 'overview';
                  rejectedReasons = [];
                  markSeen(timecard);
                }
              "
              :active="selectedTimecard && timecard.id === selectedTimecard.id"
              active-class="bg-grey-3"
            >
              <q-item-section>
                <q-item-label lines="1">
                  <strong>{{ timecard.name }}</strong>
                </q-item-label>
                <q-item-label caption lines="1">
                  {{ timecard.messageSid }}
                </q-item-label>
                <q-item-label caption lines="1">
                  {{ timecard.campaignName }}
                </q-item-label>
                <q-item-label caption lines="1">
                  {{ getDtFormatted(timecard.receivedDateTime) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-badge
                  v-if="timecard.status === 'rejected'"
                  color="red"
                  class="q-mb-xs q-mr-xs q-py-xs text-white"
                >
                  <strong>Rejected</strong>
                </q-badge>

                <q-badge
                  v-else-if="timecard.status === 'accepted'"
                  color="green"
                  class="q-mb-xs q-mr-xs q-py-xs"
                >
                  <strong>Accepted</strong>
                </q-badge>

                <q-badge v-else color="primary" class="q-mb-xs q-mr-xs q-py-xs">
                  <strong>Pending</strong>
                </q-badge>

                <q-icon
                  name="circle"
                  size="xs"
                  color="green"
                  v-if="!timecard.seen"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>
      </q-drawer>

      <q-page-container class="fit">
        <q-page class="fit">
          <q-scroll-area
            style="height: calc(100vh - 140px)"
            class="q-pa-none bg-white"
          >
            <div class="row justify-between">
              <q-tabs
                v-model="tab"
                align="left"
                narrow-indicator
                inline-label
                active-bg-color="white"
                class="bg-grey-3 col"
                indicator-color="transparent"
                @update:model-value="onTabChange"
              >
                <q-tab name="overview" label="Overview" no-caps/>
                <q-tab
                  :disable="!selectedTimecard"
                  name="correction"
                  label="Correction"
                  no-caps/>
                <q-tab
                  :disable="!selectedTimecard"
                  name="accept"
                  label="Accept"
                  :class="tab === 'accept' ? 'bg-green-4' : 'bg-green-2'"
                  no-caps/>
                <q-tab
                  :disable="!selectedTimecard"
                  name="reject"
                  label="Reject"
                  :class="tab === 'reject' ? 'bg-red-4' : 'bg-red-2'"
                  no-caps/>
                <div
                  class="row justify-end q-mr-sm"
                  color="white"
                  style="width: 100%"
                >
                  <q-btn
                    no-caps
                    label="Download"
                    color="primary"
                    unelevated
                    icon="download"
                    @click="downloadMergedDocument"
                  />
                </div>
              </q-tabs>
            </div>

            <q-tab-panels
              v-model="tab"
              animated
              swipeable
              vertical
              transition-next="jump-up"
              transition-before="jump-up"
            >
              <q-tab-panel name="overview" class="q-pa-none">
                <q-toolbar class="text-black q-px-none" v-if="selectedTimecard">
                  <q-space />
                  <q-item-section side v-if="selectedTimecard">
                    <div class="row items-center">
                      <q-badge
                        v-if="selectedTimecard.printedDateTime"
                        color="blue"
                        class="q-mb-xs q-mr-xs q-py-xs text-white cursor-pointer"
                      >
                        <strong>Printed</strong>
                        <q-tooltip>
                          Printed
                          {{ getDtFormatted(selectTimecard.printedDateTime) }}
                          by
                          {{ selectedTimecard.printedBy }}
                        </q-tooltip>
                      </q-badge>

                      <q-badge
                        v-if="selectedTimecard.status === 'rejected'"
                        color="red"
                        class="q-mb-xs q-mr-xs q-py-xs text-white"
                      >
                        <strong>Rejected</strong>
                      </q-badge>

                      <q-badge
                        v-if="selectedTimecard.status === 'accepted'"
                        color="green"
                        class="q-mb-xs q-mr-xs q-py-xs"
                      >
                        <strong>Accepted</strong>
                      </q-badge>
                    </div>
                  </q-item-section>
                </q-toolbar>
                <q-separator></q-separator>

                <q-form class="q-pa-md" v-if="selectedTimecard">
                  <div class="row q-gutter-sm q-mb-sm">
                    <div :class="$q.screen.gt.xs ? 'col-12 q-pr-sm' : 'col-11'">
                      <label>Name</label>
                      <q-field dense filled>
                        <template v-slot:control>
                          <div
                            class="self-center full-width no-outline"
                            tabindex="0"
                          >
                            {{ selectedTimecard.name }}
                          </div>
                        </template>
                      </q-field>
                    </div>
                  </div>

                  <div class="row q-gutter-sm q-mb-sm">
                    <div :class="$q.screen.gt.xs ? 'col' : 'col-11'">
                      <label>Email</label>
                      <q-field dense filled>
                        <template v-slot:control>
                          <div
                            class="self-center full-width no-outline"
                            tabindex="0"
                          >
                            {{ selectedTimecard.email }}
                          </div>
                        </template>
                      </q-field>
                    </div>

                    <div :class="$q.screen.gt.xs ? 'col' : 'col-11'">
                      <label>Number</label>
                      <q-field dense filled>
                        <template v-slot:control>
                          <div
                            class="self-center full-width no-outline"
                            tabindex="0"
                          >
                            {{ selectedTimecard.number }}
                          </div>
                        </template>
                      </q-field>
                    </div>
                  </div>

                  <div
                    class="row q-gutter-sm q-mb-sm"
                    v-if="selectedTimecard.body"
                  >
                    <div :class="$q.screen.gt.xs ? 'col-12 q-pr-sm' : 'col-11'">
                      <label class="q-mb-sm">Initial message</label>
                      <label> sent at {{ getDtFormatted(selectedTimecard.sentDateTime) }}</label>
                      <div
                        class="bg-grey-2 q-pa-md q-mb-sm"
                        v-html="formatMessage(selectedTimecard.body)"
                      ></div>
                    </div>
                  </div>

                  <div
                    class="row q-gutter-sm q-mb-sm"
                    v-if="selectedTimecard.feedback"
                  >
                    <div :class="$q.screen.gt.xs ? 'col-12 q-pr-sm' : 'col-11'">
                      <label class="q-mb-sm">Rejected/Accepted message</label>
                      <label>sent at {{ getDtFormatted(selectedTimecard.feedbackSentDateTime) }}</label>
                      <div class="bg-grey-2 q-pa-md q-mb-sm"
                        v-html="formatMessage(selectedTimecard.feedback)">
                      </div>
                    </div>
                  </div>
                </q-form>
              </q-tab-panel>

              <q-tab-panel
                name="correction"
                class="q-pa-none"
                v-if="selectedTimecard && selectedTimecard.correction"
              >
                <component
                  :is="
                    'Timecard' +
                      selectedTimecard.correction.formVersion.toUpperCase()
                  "
                  :correction="selectedTimecard.correction"
                  :correctionId="selectedTimecard.correction.id"
                  :tasks-left="selectedTimecard.taskColLeft"
                  :tasks-right="selectedTimecard.taskColRight"
                  :inputs="selectedTimecard.inputs"
                  :selects="selectedTimecard.selects"
                ></component>
              </q-tab-panel>

              <q-tab-panel name="accept" class="q-pa-none">
                <q-card
                  flat
                  style="width: 100%; height: 100%;"
                  v-if="selectedTimecard"
                >
                  <q-card-section class="row justify-between">
                    <div class="text-h6">Accept Files</div>
                    <div>
                      <q-btn
                        no-caps
                        color="blue-6"
                        label="Mark Accepted"
                        class="q-px-sm q-mr-sm q-my-xs"
                        @click="markFeedback('accepted')"
                      ></q-btn>
                      <q-btn
                        no-caps
                        color="blue-6"
                        label="Mark Accepted and Send Message"
                        icon="send"
                        class="q-px-sm q-mr-sm q-my-xs"
                        @click="sendFeedback(true)"
                      ></q-btn>
                    </div>
                  </q-card-section>

                  <q-card-section class="q-pt-none">
                    <q-input
                      v-model="feedbackComments"
                      filled
                      type="textarea"
                      label="Comments"
                      rows="17"
                    />
                  </q-card-section>
                </q-card>
              </q-tab-panel>

              <q-tab-panel name="reject" class="q-pa-none">
                <q-card
                  flat
                  style="width: 100%; height: 100%;"
                  v-if="selectedTimecard"
                >
                  <q-card-section class="row justify-between">
                    <div class="text-h6">Reject Files</div>
                    <div>
                      <q-btn
                        no-caps
                        color="blue-6"
                        label="Mark Rejected"
                        class="q-px-sm q-mr-sm q-my-xs"
                        @click="markFeedback('rejected')"
                      ></q-btn>
                      <q-btn
                        no-caps
                        color="blue-6"
                        label="Mark Rejected and Send Message"
                        icon="send"
                        class="q-px-sm q-mr-sm q-my-xs"
                        @click="sendFeedback(false)"
                      ></q-btn>
                    </div>
                  </q-card-section>

                  <q-card-section class="q-pt-none">
                    <q-select
                      filled
                      multiple
                      use-chips
                      label="Options"
                      class="q-mb-md"
                      :options="rejectedOptions"
                      v-model="rejectedReasons"
                      @update:model-value="updateComments"
                    ></q-select>

                    <q-input
                      v-model="feedbackComments"
                      filled
                      type="textarea"
                      label="Comments"
                      rows="17"
                    />
                  </q-card-section>
                </q-card>
              </q-tab-panel>
            </q-tab-panels>
          </q-scroll-area>
        </q-page>
      </q-page-container>
    </q-layout>

    <q-btn
      v-if="$q.screen.lt.md"
      class="drawer-button z-top"
      :icon="navOpen ? 'chevron_left' : 'menu'"
      style="position: fixed; bottom: 90px; right: 20px"
      :color="navOpen ? 'white' : 'primary'"
      :text-color="navOpen ? 'black' : 'white'"
      round
      @click="navOpen = !navOpen"
    />
  </q-card>
</template>

<script>
import timecardApi from "../../api/timecardCorrection";
import { date, exportFile } from "quasar";
import { mainMixin } from "../../mixins/index";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";

import TimecardV1 from "./Forms/TimecardV1.vue";
import TimecardV2 from "./Forms/TimecardV2.vue";
import TimecardV3 from "./Forms/TimecardV3.vue";
import TimecardV4 from "./Forms/TimecardV4.vue";
import TimecardV5 from "./Forms/TimecardV5.vue";

export default {
  name: "TimecardCorrections",
  mixins: [mainMixin],
  emits: ['count'],
  components: {
    TimecardV1,
    TimecardV2,
    TimecardV3,
    TimecardV4,
    TimecardV5,
  },
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        if (this.activeTenant.name === "EDWU") {
          this.rejectedOptions = [
            {
              label: "Not legible",
              comment: "Not legible",
              action: "Please take a new photo and re-submit"
            },
            {
              label: "Duplicate copy",
              comment: "Duplicate copy",
              action: "Please choose the correct task sheet and re-submit"
            },
            {
              label: "No client signature",
              comment: "No client signature",
              action:
                "Please have your client sign your task sheet and re-submit"
            },
            {
              label: "No employee signature",
              comment: "No employee signature",
              action: "Please sign your task sheet and re-submit"
            },
            {
              label: "Missing documentation for why care plan was not followed",
              comment:
                "Missing documentation for why care plan was not followed",
              action:
                "Please document all reasons why the care plan was not followed and re-submit"
            },
            {
              label: "Task sheet expired-contact the office",
              comment: "Task sheet expired-contact the office",
              action: "Contact the office for updated task sheets"
            },
            {
              label:
                "Services were provided / or were not provided according to care plan",
              comment:
                "Services were provided / or were not provided according to care plan",
              action: "Please fill out clock out time and submit"
            },
            {
              label: "Week ending date missing",
              comment: "Week ending date missing",
              action: "Enter week-ending date and re-submit"
            },
            {
              label: "Employee name not written at top of page",
              comment: "Employee name not written at top of page",
              action: "Write your name at top of page and re-submit"
            }
          ];
        }

        await this.loadTimecards(true);
      },
      deep: true
    }
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant"])
  },
  methods: {
    formatMessage(message) {
      return !!this.selectedTimecard?.number ? message?.replace(/(?:\r\n|\r|\n)/g, '<br>') : message;
    },
    formatTimecard(timecard) {
      const timeInSplit = timecard.correction.inTime.split(":");
      const timeInDate = new Date();
      timeInDate.setHours(timeInSplit[0]);
      timeInDate.setMinutes(timeInSplit[1]);

      const timeOutSplit = timecard.correction.outTime.split(":");
      const timeOutDate = new Date();
      timeOutDate.setHours(timeOutSplit[0]);
      timeOutDate.setMinutes(timeOutSplit[1]);

      const tasks =
        timecard.correction.tasks.length > 0
          ? JSON.parse(timecard.correction.tasks)
          : [];
      const checkboxes = tasks.filter(
        task => !task.type || task.type === "checkbox"
      );
      const inputs = tasks.filter(task => !task.type || task.type === "input");
      const selects = tasks.filter(
        task => !task.type || task.type === "select"
      );

      return {
        ...timecard,
        correction: {
          ...timecard.correction,
          inDate:  this.getDtFormattedWithoutTime(timecard.correction.inDate),
          outDate: this.getDtFormattedWithoutTime(timecard.correction.outDate),
          inTime: date.formatDate(timeInDate, "hh:mm a"),
          outTime: date.formatDate(timeOutDate, "hh:mm a")
        },
        taskColLeft: checkboxes.slice(0, checkboxes.length / 2),
        taskColRight: checkboxes.slice(
          checkboxes.length / 2,
          checkboxes.length
        ),
        inputs,
        selects
      };
    },
    updateComments() {
      this.$nextTick(() => {
        const formattedReasons = [];

        for (const reason of this.rejectedReasons) {
          formattedReasons.push(`\n\n - ${reason.comment}. ${reason.action}`);
        }

        this.feedbackComments =
          `Dear ${this.selectedTimecard.name},` +
          `\n\nThe correction form you submitted has been rejected & will not be processed. The reason for your rejection is listed below:` +
          `\n\n(Rejection Reason’s)` +
          (formattedReasons.length > 0
            ? formattedReasons.join("")
            : "\n\n(No reasons selected)") +
          `\n\nPlease correct the correction form and resubmit.`;

        this.$forceUpdate();
      });
    },
    async markSeen(timecard) {
      if (timecard.seen) {
        return;
      }

      await timecardApi.markSeen(timecard.id);

      const index = this.timecards.findIndex(r => r.id === timecard.id);
      if (index > -1) {
        this.timecards.splice(index, 1, { ...timecard, seen: true });
      }
    },
    async markFeedback(status) {
      try {
        await timecardApi.markFeedback(this.selectedTimecard.id, status);

        const index = this.timecards.findIndex(f => f.id === this.selectedTimecard.id);
        if (index > -1) {
          this.tab = "overview";
          const updatedResponse = {
            ...this.selectedTimecard,
            seen: true,
            status: status
          };
          this.timecards.splice(index, 1, updatedResponse);
          this.selectedTimecard = updatedResponse;
          this.$forceUpdate();
        }

        this.showSuccessMessage(`Correction marked as ${status}`);
      } catch (error) {
        console.error(error);
      }
    },
    async sendFeedback(accepted) {
      try {
        const payload = {
          mediaId: this.selectedTimecard.id,
          comments: this.feedbackComments,
          accepted
        };
        await timecardApi.sendFeedback(payload);
        const index = this.timecards.findIndex(f => f.id === this.selectedTimecard.id);
        if (index > -1) {
          this.tab = "overview";
          const updatedResponse = {
            ...this.selectedTimecard,
            seen: true,
            status: accepted ? "accepted" : "rejected"
          };
          this.timecards.splice(index, 1, updatedResponse);
          this.selectedTimecard = updatedResponse;
          this.$forceUpdate();
        }

        this.showSuccessMessage("Message Sent");
      } catch (error) {
        console.error(error);
      }
    },
    async onTabChange(val) {
      switch (val) {
        case "accept":
          if (import.meta.env.COMPANY === "AHC") {
            this.feedbackComments =
              `Dear ${this.selectedTimecard.name},` +
              `\n\nThe correction form you submitted has been accepted & has been forwarded on to payroll for processing. No other action is needed on your part unless there is a problem with the document you submitted. This is not a guarantee of payment because this information still needs to be checked & verified.`;
          } else {
            this.feedbackComments =
              `Dear ${this.selectedTimecard.name},` +
              `\n\nThe correction form you submitted has been accepted & has been forwarded on to payroll for processing. No other action is needed on your part.`;
          }
          break;
        case "reject":
          this.feedbackComments =
            `Dear ${this.selectedTimecard.name},` +
            `\n\nThe correction form you submitted has been rejected & will not be processed. The reason for your rejection is listed below:` +
            `\n\n(No Reasons selected)` +
            `\n\nPlease correct the correction form and resubmit.`;
          break;
      }

      this.$forceUpdate();
    },
    async downloadMergedDocument() {
      try {
        const response = await timecardApi.downloadMergedDocument(
          this.selectedTimecard.id
        );
        exportFile(response.fileName, response.pdf);
      } catch (error) {
        console.error(error.response?.data || "An error occurred");
      }
    },
    async selectTimecard(timecard) {
      this.selectedTimecard = { ...timecard };

      this.$nextTick(() => {
        const scroller = this.$refs.virtualScroll;
        const timecardIndex = this.timecards.findIndex(
          c => c.name === timecard.name
        );
        scroller.scrollTo(timecardIndex >= 0 ? timecardIndex : 0);
      });

      await this.loadTimecards(true);
    },
    async loadTimecards(resetResponseList) {
      if (resetResponseList) {
        this.timecards = [];
        this.totalTimecards = 0;
        this.$emit('count', 0);
      }

      try {
        const response = await timecardApi.findCorrectedTimecards(
          this.timecardViewState
        );
        const nextBatchTimecards =
          response?.items?.map(response => this.formatTimecard(response)) || [];

        this.timecards = this.timecards.concat(nextBatchTimecards) || [];
        this.totalTimecards = response.itemCount || 0;
        this.$emit('count', response.itemCount || 0);

        if (this.$refs.virtualScroll) {
          this.$refs.virtualScroll.refresh(-1); // -1 keep scroll position
        }

        if (this.timecards.length) {
          if (this.selectedTimecard?.id) {
            const foundIndex = this.timecards.findIndex(
              f => f.id === this.selectedTimecard.id
            );
            if (foundIndex > -1) {
              this.selectedTimecard = this.timecards[foundIndex];
              return null;
            }
          }

          this.selectedTimecard = { ...this.timecards[0] };
        } else {
          this.selectedTimecard = null;
        }
      } catch (error) {
        console.error(error);
        this.showErrorMessage(error);
      }
    },
    async onVirtualScroll(details) {
      const { from, to, index, direction } = details;

      if (from < 0 || to < 0) {
        return; // happens on init
      }

      const ordinalIndex = index + 1;
      if (
        direction == "increase" &&
        ordinalIndex >= this.timecardViewState.endIndex
      ) {
        const currentPageIndex = Math.floor(
          (ordinalIndex + 1) / this.timecardViewState.pageSize
        );
        const startIndex = currentPageIndex * this.timecardViewState.pageSize;
        const endIndex =
          (currentPageIndex + 1) * this.timecardViewState.pageSize;

        this.timecardViewState.startIndex = startIndex;
        this.timecardViewState.endIndex = endIndex;
        await this.loadTimecards();
      } else if (direction == "decrease") {
        // nothing to do, we have data in memory
      }
    },
    async onSearch(value) {
      if (value === null) {
        return;
      }

      this.timecardViewState.searchTerm = "";
      this.timecardViewState.startIndex = 0;
      this.timecardViewState.endIndex = this.timecardViewState.pageSize;

      if (!this.strIsEmptyOrSpaces(value) && value.length <= 2) {
        return;
      }

      this.timecardViewState.searchTerm = value;
      await this.loadTimecards(true);
    },
    async onSearchClear(value) {
      this.timecardViewState.searchTerm = "";
      this.timecardViewState.startIndex = 0;
      this.timecardViewState.endIndex = this.timecardViewState.pageSize;

      await this.loadTimecards(true);
    }
  },
  data: () => {
    return {
      date,
      navOpen: false,
      tab: "overview",
      pdfUrl: null,
      rejectedReasons: [],
      feedbackComments: "",
      timecards: [],
      timecardViewState: {
        searchTerm: "",
        startIndex: 0,
        endIndex: 50,
        showArchived: false,
        pageSize: 50
      },
      selectedTimecard: null,
      totalTimecards: 0,
      currentTabIndex: 0,
      rejectedOptions: [
        {
          label: "Problem with image",
          comment: "Problem With Image",
          action: "Please take a new photo and submit"
        },
        {
          label: "Multiple correction forms same image",
          comment: "Multiple Correction Forms Same Image",
          action: "Please submit one correction form per image"
        },
        {
          label: "No reason checked",
          comment: "No EVV reason checked",
          action: "Please select a reason and submit"
        },
        {
          label: "Not enough tasks",
          comment: "You have not selected enough tasks",
          action: "Please call the office with tasks you completed"
        },
        {
          label: "No date on timesheet",
          comment: "No date on timesheet",
          action: "Please fill in the date and submit"
        },
        {
          label: "No clock in time",
          comment: "No clock in time",
          action: "Please fill out clock in time and submit"
        },
        {
          label: "No clock out time",
          comment: "No clock out time",
          action: "Please fill out clock out time and submit"
        },
        {
          label: "No signature",
          comment: "Missing a signature",
          action: "Please sign and submit"
        },
        {
          label: "Caregiver name missing",
          comment: "Caregiver name missing",
          action: "Please write in the caregiver name and submit"
        },
        {
          label: "Weekly timesheets",
          comment: "EVV required - No longer accept weekly timesheets",
          action: "Please use a daily correction form and submit"
        },
        {
          label: "Illegible",
          comment: "Unable to read handwriting",
          action: "Please fill out another form and submit"
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped></style>
