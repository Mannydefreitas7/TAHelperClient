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
        <div class="absolute-top" style="z-index: 50">
          <div class="bg-white q-py-xs">
            <q-toolbar class="text-black row q-gutter-sm justify-end">
              <span class="q-ml-sm text-capitalize text-grey-7">
                Total:
                {{ totalEvents }}
              </span>

              <q-space />
            </q-toolbar>
            <q-toolbar>
              <q-input
                dense
                filled
                v-model="eventViewState.searchTerm"
                placeholder="Search"
                debounce="400"
                class="full-width no-border no-outline rounded-borders"
                @input="(value) => onSearch(value)"
                @clear="(value) => onSearchClear(value)"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-btn
                dense
                flat
                color="grey-9"
                icon="refresh"
                @click="loadEvents(true)"
              >
                <q-tooltip>Refresh</q-tooltip>
              </q-btn>
            </q-toolbar>
          </div>
          <q-separator />
        </div>

        <q-item dense v-ripple style="margin-top: 105px">
          <q-item-section avatar>
            <q-icon color="secondary" name="archive" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Disabled</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              color="secondary"
              @input="loadEvents(true)"
              v-model="eventViewState.showArchived"
            />
          </q-item-section>
        </q-item>

        <q-virtual-scroll
          ref="virtualScroll"
          style="height: calc(100% - 150px)"
          :virtual-scroll-slice-size="eventViewState.pageSize"
          :items="events"
          @virtual-scroll="(details) => onVirtualScroll(details)"
          separator
        >
          <template v-slot="{ item: event, index }">
            <q-item
              clickable
              v-ripple
              :key="index"
              dense
              @click="
                () => {
                  selectedEvent = { ...event };
                }
              "
              :active="selectedEvent && event.id === selectedEvent.id"
              active-class="bg-grey-3"
            >
              <q-item-section>
                <q-item-label lines="1">
                  <strong>{{ event.sourceName }}</strong>
                </q-item-label>
                <q-item-label caption lines="1" v-if="event.botEvent">
                  Agent: {{ event.agentName }}
                </q-item-label>
                <q-item-label caption lines="1">
                  Level: {{ event.logLevel }}
                </q-item-label>
                <q-item-label caption lines="1">
                  Type: {{ event.eventType }}
                </q-item-label>
                <q-item-label caption lines="1">
                  Date: {{ getDtFormatted(event.eventDateTime) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-badge
                  v-if="event.logLevel === 3"
                  color="red"
                  class="q-mb-xs q-mr-xs q-py-xs text-white"
                >
                  <strong>Error</strong>
                </q-badge>

                <q-badge
                  v-else-if="event.logLevel === 2"
                  color="orange"
                  class="q-mb-xs q-mr-xs q-py-xs"
                >
                  <strong>Warning</strong>
                </q-badge>

                <q-badge
                  v-else-if="event.logLevel === 1"
                  color="blue"
                  class="q-mb-xs q-mr-xs q-py-xs"
                >
                  <strong>Information</strong>
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
            style="height: calc(100vh - 200px)"
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
              >
                <q-tab name="events" label="Events" no-caps />
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
              <q-tab-panel name="events" class="q-pa-none">
                <div class="q-pa-md items-start q-gutter-md">
                  <div class="text-h6" v-if="selectedEvent.botEvent">
                    Bot Event: {{ selectedEvent.sourceName }}
                  </div>
                  <div class="text-h6" v-else>
                    Agent Event: {{ selectedEvent.sourceName }}
                  </div>
                  <div
                    class="bg-grey-3 text-bold q-pa-xs q-mr-md"
                    style="width: 100%"
                  >
                    Details
                  </div>
                  <ul>
                    <li v-if="selectedEvent.botEvent">
                      Agent: {{ selectedEvent.agentName }}
                    </li>
                    <li>Level: {{ selectedEvent.logLevel }}</li>
                    <li>Type: {{ selectedEvent.eventType }}</li>
                    <li>
                      Date: {{ getDtFormatted(selectedEvent.eventDateTime) }}
                    </li>
                  </ul>
                  <div
                    class="bg-grey-3 text-bold q-pa-xs q-mr-md"
                    style="width: 100%"
                  >
                    Message
                  </div>
                  <div>
                    {{ selectedEvent.eventMessage }}
                  </div>
                </div>
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
  </q-card>
</template>

<script>
import automationApi from "src/api/automation";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import { mainMixin } from "src/mixins/index";

export default {
  name: "monitor",
  mixins: [mainMixin],
  components: {},
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        await this.loadEvents(true);
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"]),
  },
  methods: {
    async selectEvent(event) {
      this.selectedEvent = { ...event };

      this.$nextTick(() => {
        const scroller = this.$refs.virtualScroll;
        const eventIndex = this.events.findIndex((c) => c.name === event.name);
        scroller.scrollTo(eventIndex >= 0 ? eventIndex : 0);
      });

      await this.loadEvents(true);
    },
    async loadEvents(resetEventList) {
      if (resetEventList) {
        this.events = [];
        this.totalEvents = 0;
      }

      try {
        const event = await automationApi.findEvents(this.eventViewState);
        const nextBatch = event?.items || [];

        this.events = this.events.concat(nextBatch) || [];
        this.totalEvents = event.itemCount || 0;

        if (this.$refs.virtualScroll) {
          this.$refs.virtualScroll.refresh(-1); // -1 keep scroll position
        }

        if (this.events.length) {
          if (this.selectedEvent?.id) {
            const foundIndex = this.events.findIndex(
              (f) => f.id === this.selectedEvent.id
            );
            if (foundIndex > -1) {
              this.selectedEvent = this.events[foundIndex];
              return null;
            }
          }

          this.selectedEvent = { ...this.events[0] };
        } else {
          this.selectedEvent = null;
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
        ordinalIndex >= this.eventViewState.endIndex
      ) {
        const currentPageIndex = Math.floor(
          (ordinalIndex + 1) / this.eventViewState.pageSize
        );
        const startIndex = currentPageIndex * this.eventViewState.pageSize;
        const endIndex = (currentPageIndex + 1) * this.eventViewState.pageSize;

        this.eventViewState.startIndex = startIndex;
        this.eventViewState.endIndex = endIndex;
        await this.loadEvents();
      } else if (direction == "decrease") {
        // nothing to do, we have data in memory
      }
    },
    async onSearch(value) {
      if (value === null) {
        return;
      }

      this.eventViewState.searchTerm = "";
      this.eventViewState.startIndex = 0;
      this.eventViewState.endIndex = this.eventViewState.pageSize;

      if (!this.strIsEmptyOrSpaces(value) && value.length <= 2) {
        return;
      }

      this.eventViewState.searchTerm = value;
      await this.loadEvents(true);
    },
    async onSearchClear(value) {
      this.eventViewState.searchTerm = "";
      this.eventViewState.startIndex = 0;
      this.eventViewState.endIndex = this.eventViewState.pageSize;

      await this.loadEvents(true);
    },
  },
  data() {
    return {
      navOpen: false,
      events: [],
      eventViewState: {
        searchTerm: "",
        startIndex: 0,
        endIndex: 50,
        showArchived: false,
        pageSize: 50,
      },
      selectedEvent: null,
      totalEvents: 0,
      detailTab: "events",
    };
  },
};
</script>

