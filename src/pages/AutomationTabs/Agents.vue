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
                {{ totalAgents }}
              </span>

              <q-space />

              <q-btn
                flat
                color="primary"
                icon="add"
                label="Create"
                @click="showAddDialog = true"
              />
            </q-toolbar>
            <q-toolbar>
              <q-input
                dense
                filled
                v-model="agentViewState.searchTerm"
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
                @click="loadAgents(true)"
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
              @input="loadAgents(true)"
              v-model="agentViewState.showArchived"
            />
          </q-item-section>
        </q-item>

        <q-virtual-scroll
          ref="virtualScroll"
          style="height: calc(100% - 150px)"
          :virtual-scroll-slice-size="agentViewState.pageSize"
          :items="agents"
          @virtual-scroll="(details) => onVirtualScroll(details)"
          separator
        >
          <template v-slot="{ item: agent, index }">
            <q-item
              clickable
              v-ripple
              :key="index"
              dense
              @click="
                () => {
                  selectedAgent = { ...agent };
                }
              "
              :active="selectedAgent && agent.id === selectedAgent.id"
              active-class="bg-grey-3"
            >
              <q-item-section>
                <q-item-label lines="1">
                  <strong>{{ agent.agentName }}</strong>
                </q-item-label>
                <q-item-label caption lines="1">
                  Id: {{ agent.agentGuid }}
                </q-item-label>
                <q-item-label caption lines="1">
                  Host: {{ agent.hostName }}
                </q-item-label>
                <q-item-label caption lines="1">
                  Platform: {{ agent.hostPlatform }}
                </q-item-label>
                <q-item-label caption lines="1">
                  Registered: {{ getDtFormatted(agent.registrationDateTime) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-badge
                  v-if="agent.status === 'disconnected'"
                  color="red"
                  class="q-mb-xs q-mr-xs q-py-xs text-white"
                >
                  <strong>Disconnected</strong>
                </q-badge>

                <q-badge
                  v-else-if="agent.status === 'connected'"
                  color="green"
                  class="q-mb-xs q-mr-xs q-py-xs"
                >
                  <strong>Connected</strong>
                </q-badge>

                <q-icon
                  name="circle"
                  size="xs"
                  color="green"
                  v-if="agent.status === 'connected'"
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
                <q-tab name="bots" label="Bots" no-caps />
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
              <q-tab-panel name="bots" class="q-pa-none">
                <div class="q-pa-md row items-start q-gutter-md">
                  <q-card
                    v-for="(bot, botIndex) in selectedAgent.bots"
                    :key="botIndex"
                    style="width: 300px; height: 300px"
                  >
                    <q-card-section
                      class="column justify-between"
                      style="height: 300px"
                    >
                      <div>
                        <div class="text-h6">{{ bot.botName }}</div>
                        <div class="text-subtitle2">
                          {{ cronDescription(bot?.scheduleCronExpression) }}
                        </div>
                        <q-separator class="q-my-md" />
                        <div
                          class="bg-grey-3 text-bold q-pa-xs"
                          style="width: 100%"
                        >
                          Last run
                        </div>
                        <div style="width: 100%">
                          {{ getDtFormatted(bot.lastRunDateTime) }}
                        </div>
                        <div style="width: 100%">
                          <q-badge
                            v-if="bot.lastRunStatus == 'success'"
                            color="green"
                            class="q-ma-xs q-py-xs"
                          >
                            <strong>Successful</strong>
                          </q-badge>
                          <q-badge
                            v-else-if="bot.lastRunStatus == 'failure'"
                            color="red"
                            class="q-ma-xs q-py-xs"
                          >
                            <strong>Failed</strong>
                          </q-badge>
                          <q-badge
                            v-else
                            color="orange"
                            class="q-ma-xs q-py-xs"
                          >
                            <strong>Unknown</strong>
                          </q-badge>
                        </div>
                      </div>
                      <div>
                        <div class="float-right">
                          <q-btn
                            class="q-mx-md"
                            color="red"
                            @click="confirmDelete(bot)"
                            >Delete</q-btn
                          >
                          <q-btn color="primary" @click="configureBot(bot)"
                            >Configure</q-btn
                          >
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                  <q-card>
                    <q-btn
                      flat
                      color="primary"
                      icon="add"
                      label="Add Bot"
                      @click="loadAddBotDialog()"
                    />
                  </q-card>
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

      <q-dialog v-model="showDeleteBotDialog" persistent>
        <q-card style="width: 500px; max-width: 80vw">
          <q-card-section class="q-mb-none q-pb-none">
            <div class="text-h6">Delete Bot?</div>
          </q-card-section>

          <q-card-section>
            <div>
              Are you sure you want to remove the
              <strong>{{ selectedAgentBot?.friendlyName }}</strong> Bot from
              <strong>{{ selectedAgent.agentName }}</strong
              >?
            </div>
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
              @click="deleteBot(selectedAgentBot)"
              v-close-popup
            />
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showAddDialog" persistent>
        <q-card style="width: 500px; max-width: 80vw">
          <q-card-section class="q-mb-none q-pb-none">
            <div class="text-h6">Add Agent</div>
          </q-card-section>

          <q-card-section>
            <div>
              Register your agent with this address:
              {{ getAgentRegistrationUrl }}
            </div>
          </q-card-section>

          <q-card-section class="row justify-between q-pt-none">
            <q-btn
              no-caps
              label="Close"
              color="grey-3"
              class="text-black"
              v-close-popup
            />
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showConfigureBotDialog" persistent>
        <q-card style="width: 500px; max-width: 80vw">
          <q-card-section class="q-mb-none q-pb-none">
            <div class="text-h6">
              Configure {{ selectedAgentBot?.friendlyName }} Bot
            </div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-if="selectedAgentBot"
              label="Schedule (Cron)"
              dense
              clearable
              :rules="[(val) => !!val || 'Required']"
              hint="Required"
              v-model.trim="selectedAgentBot.scheduleCronExpression"
            />
            <div
              v-for="(
                parameter, parameterIndex
              ) in selectedAgentBot?.configuration"
              :key="parameterIndex"
            >
              <q-input
                v-if="parameter.isRequired"
                :label="parameter.parameterName"
                dense
                clearable
                :rules="[(val) => !!val || 'Required']"
                hint="Required"
                v-model.trim="parameter.parameterValue"
              />
              <q-input
                v-else
                :label="parameter.parameterName"
                dense
                clearable
                v-model.trim="parameter.parameterValue"
              />
            </div>
          </q-card-section>

          <q-card-section class="row justify-between q-pt-none">
            <q-btn
              no-caps
              label="Close"
              color="grey-3"
              class="text-black"
              v-close-popup
            />
            <q-btn
              no-caps
              label="Save"
              color="primary"
              @click="saveConfiguration(selectedAgentBot)"
            />
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showAddBotDialog" persistent>
        <q-card style="width: 500px; max-width: 80vw">
          <q-card-section class="q-mb-none q-pb-none">
            <div class="text-h6">Add Bot</div>
          </q-card-section>

          <q-card-section>
            <q-select
              label="Bot Type"
              v-model="newBotType"
              :options="availableBots"
              option-value="id"
              option-label="botName"
              :rules="[(val) => !!val || 'Required']"
              hint="Required"
            />
          </q-card-section>

          <q-card-section class="row justify-between q-pt-none">
            <q-btn
              no-caps
              label="Close"
              color="grey-3"
              class="text-black"
              v-close-popup
            />
            <q-btn
              no-caps
              label="Save"
              color="primary"
              @click="addBot(newBotType)"
            />
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-layout>
  </q-card>
</template>

<script>
import automationApi from "../../api/automation";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import { mainMixin } from "../../mixins/index";
import cronstrue from "cronstrue";

export default {
  name: "agents",
  mixins: [mainMixin],
  components: {},
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        await this.loadAgents(true);
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"]),
    getAgentRegistrationUrl() {
      return automationApi.getAgentRegistrationUrl(this.activeTenant.id);
    },
  },
  methods: {
    cronDescription(cronExpression) {
      return cronExpression !== "" ? cronstrue.toString(cronExpression) : "";
    },
    async selectAgent(agent) {
      this.selectedAgent = { ...agent };

      this.$nextTick(() => {
        const scroller = this.$refs.virtualScroll;
        const agentIndex = this.agents.findIndex((c) => c.name === agent.name);
        scroller.scrollTo(agentIndex >= 0 ? agentIndex : 0);
      });

      await this.loadAgents(true);
    },
    async loadAgents(resetAgentList) {
      if (resetAgentList) {
        this.agents = [];
        this.totalAgents = 0;
      }

      try {
        const agent = await automationApi.findAgents(this.agentViewState);
        const nextBatch = agent?.items || [];

        this.agents = this.agents.concat(nextBatch) || [];
        this.totalAgents = agent.itemCount || 0;

        if (this.$refs.virtualScroll) {
          this.$refs.virtualScroll.refresh(-1); // -1 keep scroll position
        }

        if (this.agents.length) {
          if (this.selectedAgent?.id) {
            const foundIndex = this.agents.findIndex(
              (f) => f.id === this.selectedAgent.id
            );
            if (foundIndex > -1) {
              this.selectedAgent = this.agents[foundIndex];
              return null;
            }
          }

          this.selectedAgent = { ...this.agents[0] };
        } else {
          this.selectedAgent = null;
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
        ordinalIndex >= this.agentViewState.endIndex
      ) {
        const currentPageIndex = Math.floor(
          (ordinalIndex + 1) / this.agentViewState.pageSize
        );
        const startIndex = currentPageIndex * this.agentViewState.pageSize;
        const endIndex = (currentPageIndex + 1) * this.agentViewState.pageSize;

        this.agentViewState.startIndex = startIndex;
        this.agentViewState.endIndex = endIndex;
        await this.loadAgents();
      } else if (direction == "decrease") {
        // nothing to do, we have data in memory
      }
    },
    async onSearch(value) {
      if (value === null) {
        return;
      }

      this.agentViewState.searchTerm = "";
      this.agentViewState.startIndex = 0;
      this.agentViewState.endIndex = this.agentViewState.pageSize;

      if (!this.strIsEmptyOrSpaces(value) && value.length <= 2) {
        return;
      }

      this.agentViewState.searchTerm = value;
      await this.loadAgents(true);
    },
    async onSearchClear(value) {
      this.agentViewState.searchTerm = "";
      this.agentViewState.startIndex = 0;
      this.agentViewState.endIndex = this.agentViewState.pageSize;

      await this.loadAgents(true);
    },
    confirmDelete(bot) {
      this.selectedAgentBot = bot;
      this.showDeleteBotDialog = true;
    },
    configureBot(bot) {
      this.selectedAgentBot = bot;
      this.addingBot = false;
      this.showConfigureBotDialog = true;
    },
    async deleteBot(bot) {
      await automationApi.deleteAgentBot(bot.automationAgentBotId);
      await this.loadAgents(true);
    },
    async saveConfiguration(bot) {
      if (
        bot.configuration.filter(
          (p) =>
            p.isRequired &&
            (!p.parameterValue || p.parameterValue.trim() === "")
        ).length > 0
      ) {
        return;
      }

      if (this.addingBot) {
        const payload = {
          automationAgentId: this.selectedAgent.id,
          automationBotId: this.newBotType.id,
          configuration: bot.configuration.map((p) => ({
            ...p,
            automationBotParameterId: p.id,
          })),
          scheduleCronExpression: bot.scheduleCronExpression,
        };
        await automationApi.addAgentBot(payload);
      } else {
        const payload = {
          automationAgentBotId: bot.automationAgentBotId,
          configuration: bot.configuration,
          scheduleCronExpression: bot.scheduleCronExpression,
        };
        await automationApi.saveAgentBotConfiguration(payload);
      }

      this.showConfigureBotDialog = false;
      this.showAddBotDialog = false;

      await this.loadAgents(true);
    },
    async getAvailableBots() {
      const allBots = await automationApi.fetchBots(this.activeTenant.id);
      const existingBots = this.selectedAgent.bots.map((b) => b.botGuid);
      return allBots.filter((b) => !existingBots.includes(b.botGuid));
    },
    async loadAddBotDialog() {
      this.availableBots = await this.getAvailableBots();
      this.showAddBotDialog = true;
    },
    addBot(newBot) {
      this.addingBot = true;
      this.selectedAgentBot = { configuration: newBot.parameters };
      this.showConfigureBotDialog = true;
    },
  },
  data() {
    return {
      addingBot: false,
      availableBots: [],
      newBotType: null,
      navOpen: false,
      showAddDialog: false,
      showDeleteBotDialog: false,
      showConfigureBotDialog: false,
      showAddBotDialog: false,
      agents: [],
      agentViewState: {
        searchTerm: "",
        startIndex: 0,
        endIndex: 50,
        showArchived: false,
        pageSize: 50,
      },
      selectedAgent: null,
      selectedAgentBot: null,
      totalAgents: 0,
      detailTab: "bots",
    };
  },
};
</script>

