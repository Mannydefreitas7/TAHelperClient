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
                {{ totalResponses }}
              </span>

              <q-space />

              <q-btn
                dense
                flat
                color="grey-9"
                icon="refresh"
                @click="loadResponses(true)"
              >
                <q-tooltip>Refresh</q-tooltip>
              </q-btn>
            </q-toolbar>
            <q-toolbar>
              <q-input
                dense
                filled
                v-model="responseViewState.searchTerm"
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
            <q-item-label>Completed</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              color="secondary"
              @update:model-value="loadResponses(true)"
              v-model="responseViewState.showArchived"
            />
          </q-item-section>
        </q-item>

        <!-- response list -->
        <q-virtual-scroll
          ref="virtualScroll"
          style="height: calc(100% - 150px)"
          :virtual-scroll-slice-size="responseViewState.pageSize"
          :items="responses"
          @virtual-scroll="details => onVirtualScroll(details)"
          separator
        >
          <template v-slot="{ item: response, index }">
            <q-item
              clickable
              v-ripple
              :key="index"
              dense
              @click="
                () => {
                  selectedResponse = { ...response };
                  loadSessions(response.messageSid, response.deliveryMethod);
                  detailTab = 'overview';
                  rejectedReasons = [];
                  markSeen(response);
                }
              "
              :active="selectedResponse && response.id === selectedResponse.id"
              active-class="bg-grey-3"
            >
              <q-item-section>
                <q-item-label lines="1">
                  <strong>{{ response.name }}</strong>
                </q-item-label>
                <q-item-label caption lines="1">
                  UID: {{ response.messageSid }}
                </q-item-label>
                <q-item-label caption lines="1">
                  Campaign: {{ response.subject }}
                </q-item-label>
                <q-item-label caption lines="1">
                  Received: {{ getDtFormatted(response.receivedDateTime)}}
                </q-item-label>
                <q-item-label caption lines="1">
                  Type: {{ getResponseTitle(response) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-badge
                  v-if="response.status === 'rejected'"
                  color="red"
                  class="q-mb-xs q-mr-xs q-py-xs text-white"
                >
                  <strong>Rejected</strong>
                </q-badge>

                <q-badge
                  v-else-if="response.status === 'accepted'"
                  color="green"
                  class="q-mb-xs q-mr-xs q-py-xs"
                >
                  <strong>Accepted</strong>
                </q-badge>

                <q-badge v-else color="blue-6" class="q-mb-xs q-mr-xs q-py-xs">
                  <strong>Pending</strong>
                </q-badge>

                <q-icon
                  name="circle"
                  size="xs"
                  color="green"
                  v-if="!response.seen"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>
      </q-drawer>

      <q-page-container class="fit">
        <q-page class="fit">
          <q-scroll-area
            class="q-pa-none bg-white"
            style="height: calc(100vh - 140px)"
          >
            <div class="row justify-between">
              <q-tabs
                v-model="detailTab"
                align="left"
                narrow-indicator
                inline-label
                active-bg-color="white"
                class="bg-grey-3 col"
                indicator-color="transparent"
                @update:model-value="onTabChange"
              >
                <q-tab name="overview" label="Overview" no-caps />
                <q-tab name="response" label="Response" no-caps />
                <q-tab
                  :disable="!selectedResponse"
                  name="accept"
                  label="Accept"
                  :class="detailTab === 'accept' ? 'bg-green-4' : 'bg-green-2'"
                  no-caps
                />
                <q-tab
                  :disable="!selectedResponse"
                  name="reject"
                  label="Reject"
                  :class="detailTab === 'reject' ? 'bg-red-4' : 'bg-red-2'"
                  no-caps
                />
              </q-tabs>
            </div>

            <q-tab-panels
              v-model="detailTab"
              animated
              swipeable
              vertical
              transition-next="jump-up"
              transition-before="jump-up"
            >
              <q-tab-panel name="overview" class="q-pa-none">
                <q-toolbar class="text-black q-px-none" v-if="selectedResponse">
                  <q-space />
                  <q-item-section side v-if="selectedResponse">
                    <div class="row items-center">
                      <q-badge
                        v-if="selectedResponse.status === 'rejected'"
                        color="red"
                        class="q-mb-xs q-mr-xs q-py-xs text-white"
                      >
                        <strong>Rejected</strong>
                      </q-badge>

                      <q-badge
                        v-if="selectedResponse.status === 'accepted'"
                        color="green"
                        class="q-mb-xs q-mr-xs q-py-xs"
                      >
                        <strong>Accepted</strong>
                      </q-badge>
                    </div>
                  </q-item-section>
                </q-toolbar>
                <q-separator></q-separator>

                <q-form class="q-pa-md" v-if="selectedResponse">
                  <div class="row q-gutter-sm q-mb-sm">
                    <div :class="$q.screen.gt.xs ? 'col-12 q-pr-sm' : 'col-11'">
                      <label>Name</label>
                      <q-field dense filled>
                        <template v-slot:control>
                          <div
                            class="self-center full-width no-outline"
                            tabindex="0"
                          >
                            {{ selectedResponse.name }}
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
                            {{ selectedResponse.email }}
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
                            {{ selectedResponse.number }}
                          </div>
                        </template>
                      </q-field>
                    </div>
                  </div>

                  <div
                    class="row q-gutter-sm q-mb-sm"
                    v-if="selectedResponse.body"
                  >
                    <div :class="$q.screen.gt.xs ? 'col-12 q-pr-sm' : 'col-11'">
                      <label class="q-mb-sm">Initial message</label>
                      <label>sent at {{ getDtFormatted(selectedResponse.sentDateTime)}}</label>
                      <div
                        class="bg-grey-2 q-pa-md q-mb-sm"
                        v-html="formatMessage(selectedResponse.body)"
                      ></div>
                    </div>
                  </div>

                  <div
                    class="row q-gutter-sm q-mb-sm"
                    v-if="selectedResponse.feedback"
                  >
                    <div :class="$q.screen.gt.xs ? 'col-12 q-pr-sm' : 'col-11'">
                      <label class="q-mb-sm">Rejected/Accepted message</label>
                      <label>sent at {{ getDtFormatted(selectedResponse.feedbackSentDateTime) }}</label>
                      <div
                        class="bg-grey-2 q-pa-md q-mb-sm"
                        v-html="formatMessage(selectedResponse.feedback)"
                      ></div>
                    </div>
                  </div>
                </q-form>
              </q-tab-panel>

              <q-tab-panel
                name="response"
                class="q-pa-none"
                v-if="selectedResponse"
              >
                <div class="text-h6 q-ma-lg">{{ selectedResponseTitle }}</div>
                <div
                  v-if="
                    selectedResponse.entries &&
                      selectedResponse.entries.length > 0
                  "
                  class="q-ma-lg"
                >
                  <div v-for="entry in selectedResponse.entries">
                    <div v-if="entry.Name === 'totalTasks'">
                      All <strong>{{ entry.Value }}</strong> tasks are marked
                      completed.
                    </div>
                  </div>
                  <div
                    v-if="selectedResponseSessions.length > 0"
                    class="q-mt-md"
                  >
                    <div>
                      <strong>
                        Training sessions
                      </strong>
                    </div>
                    <div v-for="session in selectedResponseSessions">
                      {{ getDtFormatted(session.start)}}
                      -
                      {{ getDtFormatted(session.end) }}
                    </div>
                    <div class="q-mt-sm">
                      <strong>Total Training Time:</strong>
                      {{ calculateTotal(selectedResponseSessions) }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="selectedResponse.employeeSignature64"
                  class="row justify-end q-mr-lg"
                >
                  <q-btn
                    v-if="
                      selectedResponse.deliveryMethod === 'ServiceRequirementHireComplianceSessionResponse' ||
                      selectedResponse.deliveryMethod === 'ServiceRequirementHireI9SessionResponse'
                    "
                    no-caps
                    label="Download Signed Forms"
                    color="blue-6"
                    icon="download"
                    @click="() => downloadForm(selectedResponse.id, 'orientation')"
                  />
                  <q-btn
                    v-if="selectedResponse.deliveryMethod === 'ServiceRequirementInServiceTrainingSession1Response'"
                    no-caps
                    label="Download Training Form"
                    color="blue-6"
                    icon="download"
                    @click="() => downloadForm(selectedResponse.id, 'training')"
                  />
                  <q-btn
                    no-caps
                    v-if="selectedResponse.deliveryMethod === 'ServiceRequirementInServiceTrainingSession1Response'"
                    class="q-ml-md"
                    label="Download Handbook Form"
                    color="blue-6"
                    icon="download"
                    @click="() => downloadForm(selectedResponse.id, 'handbook')"
                  />
                </div>
                <div
                  class="q-pa-lg"
                  v-if="selectedResponse.employeeSignature64"
                >
                  <div><strong>Signature</strong></div>
                  <q-img
                    class="q-my-sm"
                    :src="selectedResponse.employeeSignature64"
                    style="border: 1px solid black"
                  ></q-img>
                </div>
                <q-pdfviewer
                  v-if="isMediaResponse && pdfUrl"
                  content-style="height: 100vh"
                  :src="pdfUrl"
                />
              </q-tab-panel>

              <q-tab-panel name="accept" class="q-pa-none">
                <q-card
                  flat
                  style="width: 100%; height: calc(100vh - 251px)"
                  v-if="selectedResponse"
                >
                  <q-card-section class="row justify-between">
                    <div class="text-h6">Accept Submission</div>
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
                  style="width: 100%; height: calc(100vh - 251px)"
                  v-if="selectedResponse"
                >
                  <q-card-section class="row justify-between">
                    <div class="text-h6">Reject Submission</div>
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

      <q-btn
        v-if="$q.screen.lt.md"
        class="drawer-button z-top"
        :icon="navOpen ? 'chevron_left' : 'menu'"
        style="position: fixed; bottom: 40px; right: 20px"
        :color="navOpen ? 'white' : 'primary'"
        :text-color="navOpen ? 'black' : 'white'"
        round
        @click="navOpen = !navOpen"
      />

      <q-dialog v-model="showDeleteDialog" persistent>
        <q-card style="width: 500px; max-width: 80vw">
          <q-card-section class="q-mb-none q-pb-none">
            <div class="text-h6">Delete Task?</div>
          </q-card-section>

          <q-card-section>
            <div>Are you sure you want to delete this task?</div>
          </q-card-section>

          <q-card-section class="row justify-between q-pt-none">
            <q-btn
              no-caps
              label="Cancel"
              color="grey-3"
              class="text-black"
              v-close-popup
            />
            <q-btn
              no-caps
              label="Delete"
              color="red"
              @click="deleteTask(selectedResponse.id)"
              v-close-popup
            />
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-layout>
  </q-card>
</template>

<script>
import documentsApi from "../../api/documents";
import surveyApi from "../../api/survey";
import expiringServiceRequirementsApi from "../../api/expiringServiceRequirements";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import { mainMixin } from "../../mixins/index";
import { exportFile } from "quasar";

export default {
  name: "compliance",
  mixins: [mainMixin],
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        await this.loadResponses(true);
      },
      deep: true
    }
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"]),
    selectedResponseTitle() {
      return this.getResponseTitle(this.selectedResponse);
    },
    isMediaResponse() {
      const mediaResponses = [
        "ServiceRequirementCPRCardResponse",
        "ServiceRequirementDriversLicenseResponse"
      ];
      return mediaResponses.includes(this.selectedResponse.deliveryMethod);
    }
  },
  methods: {
    formatMessage(message) {
      return !!this.selectedResponse?.number ? message?.replace(/(?:\r\n|\r|\n)/g, '<br>') : message;
    },
    getResponseTitle(response) {
      if (!response || !response.deliveryMethod) {
        return "";
      }
      switch (response.deliveryMethod) {
        case "ServiceRequirementHireI9SessionResponse":
          return "I9 Eligibility Form";

        case "ServiceRequirementInServiceTrainingSession1Response":
          return "Inservice Training-First Session";

        case "ServiceRequirementHireComplianceSessionResponse":
          return "Hire Compliance Forms";

        case "ServiceRequirementDriversLicenseResponse":
          return "Driver's License";

        case "ServiceRequirementCPRCardResponse":
          return "CPR Card";

        default:
          return `Unknown: ${response.deliveryMethod}`;
      }
    },
    formatResponse(response) {
      let entries = [];
      try {
        entries = JSON.parse(response.response);
      } catch {}

      return {
        ...response,
        entries
      };
    },
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    },
    async onTabChange(val) {
      switch (val) {
        case "response":
          await this.getPDF();
          break;
        default:
          break;
      }

      this.$forceUpdate();
    },
    async getPDF() {
      this.pdfUrl = null;
      const response = await documentsApi.downloadMergedDocument(
        this.selectedResponse.id
      );
      const blob = new Blob([response.pdf]);
      const objectUrl = URL.createObjectURL(blob);
      this.pdfUrl = objectUrl;
    },
    async markSeen(response) {
      if (response.seen) {
        return;
      }

      await surveyApi.markSeen(response.id);

      const index = this.responses.findIndex(r => r.id === response.id);
      if (index > -1) {
        this.responses.splice(index, 1, { ...response, seen: true });
      }
    },
    async markFeedback(status) {
      try {
        await surveyApi.markFeedback(this.selectedResponse.id, status);
        if (status === 'accepted') {
          await expiringServiceRequirementsApi.setApprovedBy(this.selectedResponse.id);
        }

        const index = this.responses.findIndex(f => f.id === this.selectedResponse.id);
        if (index > -1) {
          this.detailTab = "overview";
          const updatedResponse = { ...this.selectedResponse, status: status };
          this.responses.splice(index, 1, updatedResponse);
          this.selectedResponse = updatedResponse;
          this.$forceUpdate();
        }

        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          position: "center",
          closeBtn: true,
          timeout: 5000,
          message: `Service Requirement marked as ${status}`
        });
      } catch (error) {
        console.error(error);
      }
    },
    async sendFeedback(accepted) {
      try {
        const payload = {
          mediaId: this.selectedResponse.id,
          comments: this.feedbackComments,
          accepted
        };
        await surveyApi.sendFeedback(payload);
        if (accepted) {
          await expiringServiceRequirementsApi.setApprovedBy(this.selectedResponse.id);
        }

        const index = this.responses.findIndex(
          f => f.id === this.selectedResponse.id
        );
        if (index > -1) {
          this.detailTab = "overview";
          const updatedResponse = {
            ...this.selectedResponse,
            status: accepted ? "accepted" : "rejected"
          };
          this.responses.splice(index, 1, updatedResponse);
          this.selectedResponse = updatedResponse;
          this.$forceUpdate();
        }

        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          position: "center",
          closeBtn: true,
          timeout: 5000,
          message: `Message Sent`
        });
      } catch (error) {
        console.error(error);
      }
    },
    async selectResponse(response) {
      this.selectedResponse = { ...response };

      this.$nextTick(() => {
        const scroller = this.$refs.virtualScroll;
        const responseIndex = this.responses.findIndex(
          c => c.name === response.name
        );
        scroller.scrollTo(responseIndex >= 0 ? responseIndex : 0);
      });

      await this.loadResponses(true);
    },
    async loadSessions(id, deliveryMethod) {
      const sessions = await expiringServiceRequirementsApi.fetchSessions({
        id,
        deliveryMethod
      });
      this.selectedResponseSessions = sessions.map(s => ({
        start: moment(s.start).toDate(),
        end: moment(s.end).toDate()
      }));
    },
    async loadResponses(resetResponseList) {
      if (resetResponseList) {
        this.responses = [];
        this.totalResponses = 0;
      }

      try {
        const response = await expiringServiceRequirementsApi.findResponses(
          this.responseViewState
        );
        const nextBatchResponses =
          response?.items?.map(response => this.formatResponse(response)) || [];

        this.responses = this.responses.concat(nextBatchResponses) || [];
        this.totalResponses = response.itemCount || 0;

        if (this.$refs.virtualScroll) {
          this.$refs.virtualScroll.refresh(-1); // -1 keep scroll position
        }

        if (this.responses.length) {
          if (this.selectedResponse?.id) {
            const foundIndex = this.responses.findIndex(
              f => f.id === this.selectedResponse.id
            );
            if (foundIndex > -1) {
              this.selectedResponse = this.responses[foundIndex];
              return null;
            }
          }

          this.selectedResponse = { ...this.responses[0] };
        } else {
          this.selectedResponse = null;
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
        ordinalIndex >= this.responseViewState.endIndex
      ) {
        const currentPageIndex = Math.floor(
          (ordinalIndex + 1) / this.responseViewState.pageSize
        );
        const startIndex = currentPageIndex * this.responseViewState.pageSize;
        const endIndex =
          (currentPageIndex + 1) * this.responseViewState.pageSize;

        this.responseViewState.startIndex = startIndex;
        this.responseViewState.endIndex = endIndex;
        await this.loadResponses();
      } else if (direction == "decrease") {
        // nothing to do, we have data in memory
      }
    },
    async onSearch(value) {
      if (value === null) {
        return;
      }

      this.responseViewState.searchTerm = "";
      this.responseViewState.startIndex = 0;
      this.responseViewState.endIndex = this.responseViewState.pageSize;

      if (!this.strIsEmptyOrSpaces(value) && value.length <= 2) {
        return;
      }

      this.responseViewState.searchTerm = value;
      await this.loadResponses(true);
    },
    async onSearchClear(value) {
      this.responseViewState.searchTerm = "";
      this.responseViewState.startIndex = 0;
      this.responseViewState.endIndex = this.responseViewState.pageSize;

      await this.loadResponses(true);
    },
    async downloadForm(id, type) {
      try {
        const {
          fileName,
          file
        } = await expiringServiceRequirementsApi.downloadForm(id, type);
        exportFile(fileName, file);
      } catch (e) {
        console.error(e);
      }
    },
    calculateTotal(sessions) {
      const totalSeconds = sessions.reduce(
        (sum, item) =>
          sum + (item.end.getTime() - item.start.getTime()) / 1000.0,
        0.0
      );
      return this.formatSeconds(Math.ceil(totalSeconds));
    }
  },
  data() {
    return {
      navOpen: false,
      detailTab: "overview",
      showDeleteDialog: false,
      rejectedReasons: [],
      feedbackComments: "",
      responses: [],
      responseViewState: {
        searchTerm: "",
        startIndex: 0,
        endIndex: 50,
        showArchived: false,
        pageSize: 50
      },
      selectedResponse: null,
      selectedResponseSessions: [],
      totalResponses: 0,
      proxyDate: null,
      pdfUrl: null
    };
  }
};
</script>
