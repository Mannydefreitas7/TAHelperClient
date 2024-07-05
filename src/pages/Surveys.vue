<template>
  <q-layout
    view="lHh lpR lff"
    container
    class="full-width"
    style="height: calc(100vh - 50px)"
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
            <q-btn dense flat color="grey-9" icon="download">
              <q-menu>
                <q-list>
                  <q-item clickable v-close-popup @click="exportSurveys(0)">
                    <q-item-section>
                      <q-item-label>Today</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="exportSurveys(1)">
                    <q-item-section>
                      <q-item-label>Last 7 Days</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="exportSurveys(2)">
                    <q-item-section>
                      <q-item-label>Last 30 Days</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="exportSurveys(3)">
                    <q-item-section>
                      <q-item-label>All Time</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable>
                    <q-item-section>
                      <q-item-label
                        >Select Date...
                        <q-icon
                          style="font-size: 1.5em; padding-left: 20px"
                          name="event"
                      /></q-item-label>
                    </q-item-section>
                    <q-popup-proxy
                      @before-show="updateProxyDate"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="proxyDate"
                        mask="MM/DD/YY"
                        :options="value => value <= this.todayDate"
                        no-unset
                      >
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn
                            label="Cancel"
                            color="primary"
                            flat
                            v-close-popup
                          />
                          <q-btn
                            label="OK"
                            color="primary"
                            flat
                            @click="
                              exportRecipientsByDate(proxyDate, proxyDate)
                            "
                            v-close-popup
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-item>
                </q-list>
              </q-menu>
              <q-tooltip>Export</q-tooltip>
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
          <q-item-label>Accepted/Rejected</q-item-label>
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
            class="q-pa-sm"
            dense
            @click="
              () => {
                selectedResponse = { ...response };
                currentTabIndex = 1;
                detailTab = 'overview';
                rejectedReasons = [];
                markSeen(response);
              }
            "
            :active="selectedResponse && response.id === selectedResponse.id"
            active-class="bg-grey-3"
          >
            <q-item-section>
              <q-item-label lines="1"
                ><strong>{{ response.name }}</strong></q-item-label
              >
              <q-item-label caption lines="1">
                {{ response.messageSid }}
              </q-item-label>
              <q-item-label caption lines="1">
                {{ response.subject }}
              </q-item-label>
              <q-item-label caption lines="1">
                {{ getDtFormatted(response.receivedDateTime) }}
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

              <q-badge v-else color="secondary" class="q-mb-xs q-mr-xs q-py-xs">
                <strong>Pending</strong>
              </q-badge>

              <q-icon
                name="circle"
                size="10px"
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
          style="height: calc(100vh - 50px)"
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
                    <label>sent at {{ getDtFormatted(selectedResponse.sentDateTime) }}</label>
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

            <q-tab-panel name="response" class="q-pa-none">
              <q-card
                flat
                style="width: 100%; height: 100%;"
                v-if="selectedResponse"
              >
                <div v-if="!parsedFormData" class="q-pa-md">
                  <div id="form-builder"></div>
                </div>
                <q-form-renderer v-else :form-data="parsedFormData" disabled></q-form-renderer>
              </q-card>
            </q-tab-panel>

            <q-tab-panel name="accept" class="q-pa-none">
              <q-card
                flat
                style="width: 100%; height: 100%;"
                v-if="selectedResponse"
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
                v-if="selectedResponse"
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
  </q-layout>
</template>

<style>
@import "../lib/chosen/chosen.min.css";

.formeo-row-wrap:first-child {
  border-top: 15px solid blueviolet;
}
.formeo-row-wrap {
  margin-left: 10px;
  margin-right: 10px;
  border-radius: 5px;
  border: 1px solid gray;
  padding: 5px;
  background-color: white;
  margin-bottom: 10px !important;
}
.f-field-group label {
  font-size: 16px;
  font-weight: normal;
}
.f-radio {
  font-size: 18px;
}
.center-img img {
  width: 50%;
  margin-left: 25%;
}
:disabled {
  color: black !important;
  opacity: 1 !important;
}
</style>

<script>
import surveyApi from "../api/survey";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import { mainMixin } from "../mixins/index";
import { date, exportFile } from "quasar";
import { FormeoRenderer } from "formeo";
import $ from "jquery";
import * as chosen from "../boot/chosen/chosen.jquery.min.js";

export default {
  name: "documents",
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
    ...mapState(useTenantStore, ["activeTenant", "user"])
  },
  methods: {
    formatMessage(message) {
      return !!this.selectedResponse?.number ? message?.replace(/(?:\r\n|\r|\n)/g, '<br>') : message;
    },
    formatResponse(response) {
      return {
        ...response
      };
    },
    updateProxyDate() {
      this.proxyDate = date.formatDate(new Date(), "MM/DD/YY");
    },
    renderForm(data) {
      this.$nextTick(() => {
        const renderer = new FormeoRenderer({
          renderContainer: "#form-builder"
        });

        renderer.render(data);

        $("#form-builder")
          .find("*")
          .prop("disabled", true);

        $('[hidden="true"] > :not(.no-admin-preview)')
          .parent()
          .prop("hidden", false);
        $(".no-admin-preview")
          .parent()
          .prop("hidden", true);

        $.each(renderer.form.fields, (key, value) => {
          const foundResponse = this.selectedResponse.response.find(
            f =>
              (f.dbField === "attrs" in value
                ? value.attrs.DbField
                : null || f.name?.trim() === value.config.label?.trim()) &&
              !!f.value
          ) ?? { value: "" };

          if (!foundResponse) {
            return;
          }
          const $elByDbField =
            "attrs" in value
              ? $(`${value.tag}[db-field=${value.attrs.DbField}]`)
              : null;
          const $elByLabel = $(
            `label:contains(${value.config.label?.replace("&amp;", "&")})`
          );
          if (!!$elByDbField && $elByDbField.length) {
            $elByDbField.val(foundResponse.value);
          } else if (
            !!$elByLabel &&
            $elByLabel.length &&
            !!value.config.label
          ) {
            if (
              value.attrs.type === "radio" ||
              value.attrs.type === "checkbox"
            ) {
              const $el = $(
                `input[type=${value.attrs.type}][value="${foundResponse.value}"]`
              );
            }
            if (
              value.attrs.class === "signaturePad" ||
              value.attrs.className === "signaturePad"
            ) {
              const $el = $elByLabel.next(".signaturePad");
              $el.replaceWith(`<br /><img src="${foundResponse.value}"/>`);
            }
            if (
              value.attrs.class === "extraSignaturePad" ||
              value.attrs.className === "extraSignaturePad"
            ) {
              const $el = $elByLabel.next(".extraSignaturePad");
              $el.replaceWith(`<br /><img src="${foundResponse.value}"/>`);
            } else {
              const $el = $elByLabel.next();
              if (!!$el.attr("multiple")) {
                $el.replaceWith(
                  `<br /><span class="text-body1"><strong>${foundResponse.value}</strong></span>`
                );
              } else {
                $el.val(foundResponse.value);
              }
            }
          }
        });

        this.$forceUpdate();
      });
    },
    renderFormV2() {
      const data = JSON.parse(this.selectedResponse.survey).data;
      this.selectedResponse.response.forEach(response => {
        const index = data.findIndex(f => f.id === response.fieldId);
        const field = data[index];
        if (field.type === 'list') {
          field.value = JSON.parse(response.value);
        } else {
          field.value = response.value;
        }
        data.splice(index, 1, field);
      });
      this.parsedFormData = data;
    },
    onTabChange(val) {
      switch (val) {
        case "response":
          const parsedFormTemplate = JSON.parse(this.selectedResponse.survey);
          if (parsedFormTemplate.sdk == 2) {
            this.renderFormV2();
          } else if (parsedFormTemplate.sdk == 1) {
            this.renderForm(parsedFormTemplate.data);
          } else {
            this.renderForm(parsedFormTemplate);
          }
          break;
        default:
          break;
      }

      this.$forceUpdate();
    },
    async exportSurveys(option) {
      switch (option) {
        default:
          await this.exportRecipientsByDate(
            date.formatDate(new Date(), "MM/DD/YY")
          );
          break;
        case 1:
          await this.exportRecipientsByDate(
            date.formatDate(
              date.subtractFromDate(new Date(), { days: 7 }),
              "MM/DD/YY"
            )
          );
          break;
        case 2:
          await this.exportRecipientsByDate(
            date.formatDate(
              date.subtractFromDate(new Date(), { days: 30 }),
              "MM/DD/YY"
            )
          );
          break;
        case 3:
          await this.exportRecipientsByDate(
            date.formatDate(new Date(1970, 1, 1), "MM/DD/YY")
          );
          break;
      }
    },
    async exportRecipientsByDate(startDate, endDate) {
      try {
        const currentDate = date.formatDate(new Date(), "MM/DD/YY");
        const { fileName, file } = await surveyApi.downloadSurveys(
          startDate,
          endDate || currentDate
        );
        exportFile(fileName, file);
      } catch (error) {
        console.error(error);
      }
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

        const index = this.responses.findIndex(
          f => f.id === this.selectedResponse.id
        );
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
          message: `Document marked as ${status}`
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
    async loadResponses(resetResponseList) {
      if (resetResponseList) {
        this.responses = [];
        this.totalResponses = 0;
      }

      try {
        const response = await surveyApi.findResponses(this.responseViewState);
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
      parsedFormData: null,
      selectedResponse: null,
      totalResponses: 0,
      proxyDate: null,
      todayDate: this.getDtFormatted(new Date(), "YYYY/MM/DD")
    };
  }
};
</script>
