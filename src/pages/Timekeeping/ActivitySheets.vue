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
                {{ totalSheets }}
              </span>

              <q-space />
              <q-btn
                dense
                flat
                color="grey-9"
                icon="refresh"
                @click="loadActivitySheets(true)"
              >
                <q-tooltip>Refresh</q-tooltip>
              </q-btn>
            </q-toolbar>
            <q-toolbar>
              <q-input
                dense
                filled
                v-model="searchViewState.searchTerm"
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
              @update:model-value="loadActivitySheets(true)"
              v-model="searchViewState.showArchived"
            />
          </q-item-section>
        </q-item>

        <q-virtual-scroll
          ref="virtualScroll"
          style="height: calc(100% - 150px)"
          :virtual-scroll-slice-size="searchViewState.pageSize"
          :items="sheets"
          @virtual-scroll="details => onVirtualScroll(details)"
          separator
        >
          <template v-slot="{ item: sheet, index }">
            <q-item
              clickable
              v-ripple
              :key="index"
              dense
              @click="
                () => {
                  selectItem(sheet);
                  markSeen(sheet);
                }
              "
              :active="selectedSheet && sheet.id === selectedSheet.id"
              active-class="bg-grey-3"
            >
              <q-item-section>
                <q-item-label lines="1">
                  <strong>{{ sheet.name }}</strong>
                </q-item-label>
                <q-item-label caption lines="1">
                  {{ sheet.messageSid }}
                </q-item-label>
                <q-item-label caption lines="1">
                  {{ sheet.subject }}
                </q-item-label>
                <q-item-label caption lines="1">
                  {{ getDtFormatted(sheet.receivedDateTime) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-badge
                  v-if="sheet.status === 'rejected'"
                  color="red"
                  class="q-mb-xs q-mr-xs q-py-xs text-white"
                >
                  <strong>Rejected</strong>
                </q-badge>

                <q-badge
                  v-else-if="sheet.status === 'accepted'"
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
                  v-if="!sheet.seen"
                />

                <q-badge
                  v-if="sheet.employeeOccupation === 'LPN'"
                  color="grey"
                  class="q-mb-xs q-mr-xs q-py-xs text-white"
                >
                  <strong>{{ sheet.employeeOccupation }}</strong>
                </q-badge>
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
              >
                <q-tab name="activity-sheet" label="Activity Sheet" no-caps />
                <q-tab
                  :disable="!selectedSheet || (
                      (selectedSheet.approverId !== currentEmployee.id && !user.tenantOwner && !user.orgAdmin) &&
                      selectedSheet.employeeOccupation === 'LPN'
                  )"
                  name="accept"
                  label="Accept"
                  :class="tab === 'accept' ? 'bg-green-4' : 'bg-green-2'"
                  no-caps
                />
                <q-tab
                  :disable="!selectedSheet || (
                      (selectedSheet.approverId !== currentEmployee.id && !user.tenantOwner && !user.orgAdmin) &&
                      selectedSheet.employeeOccupation === 'LPN'
                  )"
                  name="reject"
                  label="Reject"
                  :class="tab === 'reject' ? 'bg-red-4' : 'bg-red-2'"
                  no-caps
                />

                <div
                  class="row justify-end q-mr-sm"
                  color="white"
                  style="width: 100%"
                >
                  <q-btn
                    :disable="!selectedSheet"
                    no-caps
                    label="Download"
                    color="primary"
                    unelevated
                    icon="download"
                    @click="() => downloadSheet(selectedSheet)"
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
              <q-tab-panel name="activity-sheet" class="q-pa-none" style="height: calc(100vh - 190px)">
                <q-layout
                  view="lHh Lpr lFf"
                  container
                  class="shadow-2 rounded-borders"
                >
                  <q-header class="bg-white">
                    <q-toolbar
                      class="text-black q-px-none "
                      v-if="selectedSheet"
                    >
                      <h5 class="q-ma-none q-pl-md">
                        {{ `${selectedSheet.name}` }}
                      </h5>

                      <div class="q-pl-md">
                        <q-badge
                          v-if="selectedSheet.status === 'rejected'"
                          color="red"
                          class="q-mb-xs q-mr-xs q-py-xs text-white"
                        >
                          <strong>Rejected</strong>
                        </q-badge>

                        <q-badge
                          v-if="selectedSheet.status === 'accepted'"
                          color="green"
                          class="q-mb-xs q-mr-xs q-py-xs"
                        >
                          <strong>Accepted</strong>
                        </q-badge>
                      </div>
                    </q-toolbar>

                    <q-separator></q-separator>
                  </q-header>

                  <q-page-container>
                    <q-page>
                      <component
                        v-if="!!selectedSheet"
                        :is="'SheetV' + selectedSheet.version"
                        :sheet="selectedSheet"
                        ref="activitySheetForm"
                      ></component>
                    </q-page>
                  </q-page-container>
                </q-layout>
              </q-tab-panel>
              <q-tab-panel name="accept" class="q-pa-none" style="height: calc(100vh - 100px)">
                <q-layout
                  view="lHh Lpr lFf"
                  container
                  class="shadow-2 rounded-borders"
                >
                  <q-header class="bg-white">
                    <q-toolbar
                      class="text-black q-px-none "
                      v-if="selectedSheet"
                    >
                      <h5 class="q-ma-none q-pl-md">
                        Accept Sheet
                      </h5>

                      <q-space />

                      <q-btn
                        no-caps
                        color="blue"
                        text-color="white"
                        label="Mark Accepted"
                        icon="thumb_up"
                        class="q-mr-sm"
                        @click="onAccept(false)"
                      ></q-btn>

                      <q-btn
                        no-caps
                        color="blue"
                        text-color="white"
                        label="Mark Accepted and Send Feedback"
                        icon="send"
                        class="q-mr-sm"
                        @click="onAccept(true)"
                      ></q-btn>
                    </q-toolbar>

                    <q-separator></q-separator>
                  </q-header>

                  <q-page-container>
                    <q-page>
                      <q-input
                        filled
                        v-model="acceptComments"
                        type="textarea"
                        label="Comments"
                        rows="17"
                      />
                    </q-page>
                  </q-page-container>
                </q-layout>
              </q-tab-panel>
              <q-tab-panel name="reject" class="q-pa-none" style="height: calc(100vh - 100px)">
                <q-layout
                  view="lHh Lpr lFf"
                  container
                  class="shadow-2 rounded-borders"
                >
                  <q-header class="bg-white">
                    <q-toolbar
                      class="text-black q-px-none "
                      v-if="selectedSheet"
                    >
                      <h5 class="q-ma-none q-pl-md">
                        Reject Sheet
                      </h5>

                      <q-space />

                      <q-btn
                        no-caps
                        color="blue"
                        text-color="white"
                        label="Mark Rejected"
                        icon="thumb_up"
                        class="q-mr-sm"
                        @click="onReject(false)"
                      ></q-btn>

                      <q-btn
                        no-caps
                        color="blue"
                        text-color="white"
                        label="Mark Rejected and Send Feedback"
                        icon="send"
                        class="q-mr-sm"
                        @click="onReject(true)"
                      ></q-btn>
                    </q-toolbar>

                    <q-separator></q-separator>
                  </q-header>

                  <q-page-container>
                    <q-page>
                      <q-input
                        filled
                        v-model="rejectComments"
                        type="textarea"
                        label="Comments"
                        rows="17"
                      />
                    </q-page>
                  </q-page-container>
                </q-layout>
              </q-tab-panel>
            </q-tab-panels>
          </q-scroll-area>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-card>
</template>

<script>
import {
  findActivitySheets,
  markSeen,
  accept,
  reject,
  downloadSheet
} from "../../api/activitySheet";
import { exportFile, extend } from "quasar";
import { mainMixin } from "src/mixins/index";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import timekeepingApi from "src/api/timekeeping";

import SheetV1 from "./ActivitySheets/ActivitySheetV1.vue";
import SheetV2 from "./ActivitySheets/ActivitySheetV2.vue";
import SheetV3 from "./ActivitySheets/ActivitySheetV3.vue";

export default {
  name: "ActivitySheets",
  mixins: [mainMixin],
  components: {
    SheetV1,
    SheetV2,
    SheetV3,
  },
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        await this.loadActivitySheets(true);
        await this.getCurrentEmployee();
      },
      deep: true
    }
  },

  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"])
  },

  methods: {
    formatData(data) {
      return data;
    },
    selectItem(item) {
      this.acceptComments = "";
      this.rejectComments = "";
      this.selectedSheet = extend(true, {}, item);
      this.currentTabIndex = 1;
    },
    async getCurrentEmployee() {
      try {
        const response = await timekeepingApi.getCurrentEmployee();
        this.currentEmployee = response;
      } catch (error) {
        console.error(error);
      }
    },
    async downloadSheet(item) {
      try {
        const { fileName, file } = await downloadSheet(item.id);
        exportFile(fileName, file);
      } catch (e) {
        console.error(e);
      }
    },
    async markSeen(item) {
      try {
        if (item.seen) {
          return;
        }

        await markSeen(item.id);
        const index = this.sheets.findIndex(sheet => sheet.id === item.id);
        this.sheets.splice(index, 1, { ...item, seen: true });
      } catch (e) {
        console.error(e);
      }
    },
    async onAccept(sendFeedback = false) {
      try {
        const payload = {
          sheetId: this.selectedSheet.id,
          sendMessage: sendFeedback,
          message: this.acceptComments
        };
        const response = await accept(payload);

        const formattedSheet = { ...this.selectedSheet, ...response.sheet };

        const index = this.sheets.findIndex(
          sheet => sheet.id === response.sheet.id
        );
        this.sheets.splice(index, 1, formattedSheet);
        this.selectItem(formattedSheet);
      } catch (error) {
        console.error(error.response?.message || error);
      }
    },
    async onReject(sendFeedback = false) {
      try {
        const payload = {
          sheetId: this.selectedSheet.id,
          sendMessage: sendFeedback,
          message: this.rejectComments
        };
        const response = await reject(payload);

        const formattedSheet = { ...this.selectedSheet, ...response.sheet };

        const index = this.sheets.findIndex(
          sheet => sheet.id === response.sheet.id
        );
        this.sheets.splice(index, 1, formattedSheet);
        this.selectItem(formattedSheet);
      } catch (error) {
        console.error(error.response?.message || error);
      }
    },
    async loadActivitySheets(resetResponseList) {
      if (resetResponseList) {
        this.sheets = [];
        this.totalSheets = 0;
      }

      try {
        const response = await findActivitySheets(this.searchViewState);
        const nextBatch =
          response?.items?.map(response => this.formatData(response)) || [];

        this.sheets = this.sheets.concat(nextBatch) || [];
        this.totalSheets = response.itemCount || 0;

        if (this.$refs.virtualScroll) {
          this.$refs.virtualScroll.refresh(-1); // -1 keep scroll position
        }

        if (this.sheets.length) {
          if (this.selectedSheet?.id) {
            const foundIndex = this.sheets.findIndex(
              f => f.id === this.selectedSheet.id
            );
            if (foundIndex > -1) {
              this.selectedSheet = this.sheets[foundIndex];
              await this.markSeen(this.selectedSheet);
              return null;
            }
          }

          this.selectedSheet = { ...this.sheets[0] };
          await this.markSeen(this.selectedSheet);
        } else {
          this.selectedSheet = null;
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
        ordinalIndex >= this.searchViewState.endIndex
      ) {
        const currentPageIndex = Math.floor(
          (ordinalIndex + 1) / this.searchViewState.pageSize
        );
        const startIndex = currentPageIndex * this.searchViewState.pageSize;
        const endIndex = (currentPageIndex + 1) * this.searchViewState.pageSize;

        this.searchViewState.startIndex = startIndex;
        this.searchViewState.endIndex = endIndex;
        await this.loadActivitySheets();
      } else if (direction == "decrease") {
        // nothing to do, we have data in memory
      }
    },
    async onSearch(value) {
      if (value === null) {
        return;
      }

      this.searchViewState.searchTerm = "";
      this.searchViewState.startIndex = 0;
      this.searchViewState.endIndex = this.searchViewState.pageSize;

      if (!this.strIsEmptyOrSpaces(value) && value.length <= 2) {
        return;
      }

      this.searchViewState.searchTerm = value;
      await this.loadActivitySheets(true);
    },
    async onSearchClear(value) {
      this.searchViewState.searchTerm = "";
      this.searchViewState.startIndex = 0;
      this.searchViewState.endIndex = this.searchViewState.pageSize;

      await this.loadActivitySheets(true);
    }
  },
  data: () => {
    return {
      navOpen: false,
      tab: "activity-sheet",
      sheets: [],
      acceptComments: "",
      rejectComments: "",
      currentEmployee: {},
      searchViewState: {
        searchTerm: "",
        startIndex: 0,
        endIndex: 50,
        showArchived: false,
        pageSize: 50
      },
      selectedSheet: null,
      totalSheets: 0,
      currentTabIndex: 0
    };
  }
};
</script>

<style lang="scss" scoped></style>
