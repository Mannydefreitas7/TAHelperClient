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
                currentTabIndex = 1;
                detailTab = 'overview';
              }
            "
            :active="selectedResponse && response.id === selectedResponse.id"
            active-class="bg-grey-3"
          >
            <q-item-section>
              <q-item-label lines="1"
                ><strong>{{ response.title }}</strong></q-item-label
              >
              <q-item-label caption lines="1"
                >Created By: {{ response.createdBy }}</q-item-label
              >
            </q-item-section>
            <q-item-section side top>
              <q-badge
                v-if="!response.completed"
                color="blue-6"
                class="q-mb-xs q-mr-xs q-py-xs text-white"
              >
                <strong>Pending</strong>
              </q-badge>

              <q-badge v-else color="green" class="q-mb-xs q-mr-xs q-py-xs">
                <strong>Completed</strong>
              </q-badge>
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
                <q-item-section v-if="selectedResponse">
                  <p
                    style="font-size: 17px; margin-left: 16px; font-weight: bold;"
                    class="q-ma-none"
                  >
                    {{ selectedResponse.title }} ({{
                      selectedResponse.extDesignation
                    }})
                  </p>
                </q-item-section>
                <q-space />
                <q-item-section side v-if="selectedResponse">
                  <div class="row items-center">
                    <q-btn
                      v-if="!selectedResponse.completed"
                      no-caps
                      color="green"
                      label="Mark Completed"
                      class="q-px-sm q-mr-sm q-my-xs"
                      @click="completeTask(selectedResponse.id)"
                    ></q-btn>

                    <q-btn-dropdown
                      dense
                      flat
                      dropdown-icon="more_vert"
                      class="q-mr-sm"
                    >
                      <q-list>
                        <q-item
                          clickable
                          v-ripple
                          @click="showDeleteDialog = true"
                        >
                          <q-item-section avatar top>
                            <q-avatar
                              icon="delete"
                              color="red-6"
                              text-color="white"
                            />
                          </q-item-section>

                          <q-item-section>
                            <q-item-label lines="1">Delete</q-item-label>
                            <q-item-label caption
                              >Delete this task</q-item-label
                            >
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>
                </q-item-section>
              </q-toolbar>
              <q-separator></q-separator>

              <q-form class="q-pa-md" v-if="selectedResponse">
                <div class="row q-gutter-sm q-mb-sm"></div>
                <div
                  v-if="selectedResponse.completed"
                  class="row q-gutter-sm q-mb-sm"
                >
                  <div :class="$q.screen.gt.xs ? 'col' : 'col-11'">
                    <label>Completed by</label>
                    <q-field dense filled>
                      <template v-slot:control>
                        <div
                          class="self-center full-width no-outline"
                          tabindex="0"
                        >
                          {{ selectedResponse.completedBy }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div :class="$q.screen.gt.xs ? 'col' : 'col-11'">
                    <label>Completed at</label>
                    <q-field dense filled>
                      <template v-slot:control>
                        <div
                          class="self-center full-width no-outline"
                          tabindex="0"
                        >
                          {{
                            getDtFormatted(selectedResponse.completedDateTime)
                          }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                </div>
                <div class="row q-gutter-sm q-mb-sm">
                  <div :class="$q.screen.gt.xs ? 'col' : 'col-11'">
                    <label>Department</label>
                    <q-field dense filled>
                      <template v-slot:control>
                        <div
                          class="self-center full-width no-outline"
                          tabindex="0"
                        >
                          {{ selectedResponse.extDepartmentName }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                </div>
                <div class="row q-gutter-sm q-mb-sm">
                  <div :class="$q.screen.gt.xs ? 'col' : 'col-11'">
                    <label>Last Billable Visit Date</label>
                    <q-field dense filled>
                      <template v-slot:control>
                        <div
                          class="self-center full-width no-outline"
                          tabindex="0"
                        >
                          {{
                            new Date(
                              selectedResponse.extLastBillableVisitDate
                            ).toLocaleDateString()
                          }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div :class="$q.screen.gt.xs ? 'col' : 'col-11'">
                    <label>Request Date</label>
                    <q-field dense filled>
                      <template v-slot:control>
                        <div
                          class="self-center full-width no-outline"
                          tabindex="0"
                        >
                          {{
                            new Date(
                              selectedResponse.extRequestDate
                            ).toLocaleDateString()
                          }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div :class="$q.screen.gt.xs ? 'col' : 'col-11'">
                    <label>Status Date</label>
                    <q-field dense filled>
                      <template v-slot:control>
                        <div
                          class="self-center full-width no-outline"
                          tabindex="0"
                        >
                          {{
                            new Date(
                              selectedResponse.extStatusDate
                            ).toLocaleDateString()
                          }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                </div>
                <div class="row q-gutter-sm q-mb-sm">
                  <div :class="$q.screen.gt.xs ? 'col-12 q-pr-sm' : 'col-11'">
                    <label>Description</label>
                    <q-input
                      class="bg-grey-2 q-pa-md q-mb-sm"
                      v-html="selectedResponse.description"
                      autogrow
                      readonly
                    />
                  </div>
                </div>
              </q-form>
            </q-tab-panel>
            <q-tab-panel name="reject" class="q-pa-none">
              <q-card
                flat
                style="width: 100%; height: 100%;"
                v-if="selectedResponse"
              >
                <q-card-section class="row justify-between">
                  <div class="text-h6">Reject Task</div>
                  <div>
                    <q-btn
                      no-caps
                      color="blue-6"
                      label="Mark Rejected"
                      class="q-px-sm q-mr-sm q-my-xs"
                      @click="markRejected(selectedResponse.id)"
                    ></q-btn>
                    <q-btn
                      no-caps
                      color="blue-6"
                      label="Mark Rejected and Send Message"
                      icon="send"
                      class="q-px-sm q-mr-sm q-my-xs"
                      @click="sendRejectedFeedBack()"
                    ></q-btn>
                  </div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                  <label>Description</label>
                  <q-input
                    class="bg-grey-2 q-pa-md q-mb-sm"
                    v-html="selectedResponse.description"
                    autogrow
                    readonly
                  />
                  <label>Send to:</label>
                  <q-input
                    class="bg-grey-2 q-pa-md q-mb-sm"
                    v-html="selectedResponse.requestedBy"
                    autogrow
                    readonly
                  />
                  <q-editor
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
import taskApi from "../api/task";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import { mainMixin } from "../mixins/index";
import { date } from "quasar";
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
    formatResponse(response) {
      return {
        ...response
      };
    },
    updateProxyDate() {
      this.proxyDate = date.formatDate(new Date(), "MM-DD-YYYY");
    },
    renderForm() {
      this.$nextTick(() => {
        const renderer = new FormeoRenderer({
          renderContainer: "#form-builder"
        });

        renderer.render(JSON.parse(this.selectedResponse.survey));

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
              (f.dbField === value.attrs.DbField ||
                f.name?.trim() === value.config.label?.trim()) &&
              !!f.value
          ) ?? { value: "" };

          if (!foundResponse) {
            return;
          }

          const $elByDbField = $(
            `${value.tag}[db-field=${value.attrs.DbField}]`
          );
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
              $el.prop("checked", true);
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
    onTabChange(val) {
      switch (val) {
        case "response":
          this.renderForm();
          break;
        case "reject":
          this.updateComments();
        default:
          break;
      }

      this.$forceUpdate();
    },
    markCompletedFeedBack(message, user, dateTime) {
      const index = this.responses.findIndex(
        f => f.id === this.selectedResponse.id
      );
      if (index > -1) {
        this.detailTab = "overview";
        const updatedResponse = {
          ...this.selectedResponse,
          completed: true,
          completedBy: user,
          completedDateTime: dateTime
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
        message: message
      });
    },
    actionFeedback(message) {
      this.$q.notify({
        color: "green-4",
        textColor: "white",
        icon: "cloud_done",
        position: "center",
        closeBtn: true,
        timeout: 5000,
        message: message
      });
    },
    async getTasks() {
      try {
        await taskApi.getTasks();
      } catch (error) {
        console.log(error);
      }
    },
    async completeTask(id) {
      try {
        const response = await taskApi.markCompleted(id);
        this.markCompletedFeedBack(
          response.message,
          response.user,
          response.dateTime
        );
      } catch (error) {
        console.log(error);
      }
    },
    async deleteTask(id) {
      try {
        const response = await taskApi.deleteTask(id);
        this.actionFeedback(response.message);
        await this.loadResponses(true);
      } catch (error) {
        console.log(error);
      }
    },
    async markRejected(id) {
      try {
        const response = await taskApi.markRejected(id);
        this.detailTab = "overview";
        this.responseViewState.searchTerm = "";
        this.actionFeedback(response.message);
        await this.loadResponses(true);
      } catch (error) {
        console.error(error);
      }
    },
    async sendRejectedFeedBack() {
      try {
        const payload = {
          taskId: this.selectedResponse.id,
          comments: this.feedbackComments
        };
        const response = await taskApi.sendRejectedFeedBack(payload);
        this.detailTab = "overview";
        this.responseViewState.searchTerm = "";
        this.feedbackComments = "";
        this.actionFeedback(response.message);
        await this.loadResponses(true);
      } catch (error) {
        console.error(error);
      }
    },
    async updateComments() {
      this.feedbackComments = `The Task ${this.selectedResponse.title.bold()} created on ${new Date(
        this.selectedResponse.extRequestDate
      )
        .toLocaleDateString()
        .bold()} has been rejected. `;
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
        this.responseViewState.startIndex = 0;
        this.responseViewState.endIndex = 50;
      }

      try {
        const response = await taskApi.getTasks(this.responseViewState);
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
  data: () => {
    return {
      navOpen: false,
      detailTab: "overview",
      showDeleteDialog: false,
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
      totalResponses: 0,
      currentTabIndex: 0,
      size: {},
      proxyDate: null
    };
  }
};
</script>
