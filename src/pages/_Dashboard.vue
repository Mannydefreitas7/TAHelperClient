<template>
  <div class="q-pa-md">
    <div class="col q-mb-sm">
      <span class="text-caption">{{ todayDateFormatted }}</span>
      <h2 class="q-my-none text-h4 text-weight-bold">Dashboard</h2>
    </div>

    <div class="row justify-center" v-if="!user.tenants.length">
      <h5 class="q-mq-none">
        You have not been assigned to any Accounts. Please contact your
        administration.
      </h5>
    </div>
    <div v-else>
      <!-- SECTION: 3 COLUMNS CARDS -->
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-md-4">
          <q-card  flat bordered rounded>
            <q-item class="q-pa-none" clickable to="/Campaign">
              <q-item-section class="q-pa-md q-ml-none ">
                <q-item-label class="text-h6 text-weight-bolder">
                  {{ campaignLookup.length }}
                </q-item-label>
                <q-item-label>Campaigns</q-item-label>
              </q-item-section>
              <q-item-section side class="q-mr-md">
                <q-icon name="o_campaign" color="blue-10" size="44px"></q-icon>
              </q-item-section>
            </q-item>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-item class="q-pa-none" clickable to="/Contact">
                <q-item-section class="q-pa-md q-ml-none ">
                  <q-item-label class="text-h6 text-weight-bolder">
                    {{ contactCount }}
                  </q-item-label>
                  <q-item-label>Contacts</q-item-label>
                </q-item-section>
                <q-item-section side class="q-mr-md">
                  <q-icon name="o_person" color="blue-10" size="44px"></q-icon>
                </q-item-section>
            </q-item>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-item class="q-pa-none" clickable to="/Account">
                <q-item-section class="q-pa-md q-ml-none ">
                  <q-item-label class="text-h6 text-weight-bolder">
                    {{ teamMemberCount }}
                  </q-item-label>
                  <q-item-label>Team Members</q-item-label>
                </q-item-section>
                <q-item-section side class="q-mr-md">
                  <q-icon name="o_people" color="blue-10" size="44px"></q-icon>
                </q-item-section>
            </q-item>
          </q-card>
        </div>
      </div>
       <!-- END SECTION: 3 COLUMNS CARDS -->

       <!-- SECTION: CAMPAIGN SELECTION ROW -->
        <div class="row q-mt-md justify-between">
          <!-- SELECT: CAMPAIGN -->
          <q-select
              style="min-width: 130px; max-width: 300px"
              dense
              borderless
              option-label="label"
              :options="campaignLookup"
              @update:model-value="item => selectCampaign(item.value)"
              :model-value="activeCampaign"
              label="Campaign"
            >
              <template v-slot:prepend>
                <q-icon name="campaign" />
              </template>
              <template v-slot:option="item">
                <q-item
                  v-bind="item.itemProps"
                  v-on="item.itemEvents"
                >
                <q-item-section avatar top>
                      <q-avatar
                        v-if="item.opt.value === selectedCampaignId"
                        icon="check"
                        color="green"
                        text-color="white"
                      />
                      <q-avatar v-else color="grey-9" icon="campaign" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ item.opt.label }}</q-item-label>
                      <q-item-label
                        v-if="item.opt.value === selectedCampaignId"
                        caption
                      >
                        Active campaign
                      </q-item-label>
                      <q-item-label v-if="item.opt.serviceSid" caption>
                        Dedicated
                      </q-item-label>
                    </q-item-section>
                </q-item>
              </template>
          </q-select>
          <!-- END SELECT: CAMPAIGN -->
          <div class="row q-gutter-sm">
            <!-- BUTTON: REFRESH -->
            <q-btn
              label="Refresh"
              icon="refresh"
              flat
              dense
              color="grey-8"
              no-caps
              @click="onRefreshAll"
            />
            <!-- END BUTTON: REFRESH -->
            <!-- DROPDOWN: EXPORT MESSAGES -->
            <q-btn-dropdown
                ref="exportRepliesDropdown"
                color="grey-8"
                flat
                dense
                no-caps
                label="Export Messages"
              >
                <q-list>
                  <q-item
                    clickable
                    v-close-popup
                    @click="exportCampaignReport(0)"
                  >
                    <q-item-section>
                      <q-item-label>Today</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="exportCampaignReport(1)"
                  >
                    <q-item-section>
                      <q-item-label>Last 7 Days</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="exportCampaignReport(2)"
                  >
                    <q-item-section>
                      <q-item-label>Last 30 Days</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="exportCampaignReport(3)"
                  >
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
                        :options="value => value <= todayDate"
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
                              () => {
                                $refs.exportRepliesDropdown.hide();
                                fetchMessageRecipientsByDate(
                                  proxyDate
                                );
                              }
                            "
                            v-close-popup
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-item>
                </q-list>
            </q-btn-dropdown>
            <!-- END DROPDOWN EXPORT MESSAGES -->
            <!-- SELECT: # OF DAYS -->
              <q-select
                v-model="amountOfDays"
                dense
                borderless
                options-dense
                @update:model-value="value => selectAmountOfDays(value)"
                :display-value="`Last ${amountOfDays} Days`"
                :options="[7, 30]"
                style="max-width: 150px"
              />
            <!-- END SELECT: # OF DAYS -->
            <!-- SELECT: IMMEDIATE KEYWORDS -->
            <q-select
              id="ElementImmediateAttentionKeyword"
              v-if="activeCampaign && immediateAttentionKeywords.length > 0"
              v-model="immediateAttentionKeyword"
              clearable
              dense
              borderless
              options-dense
              :options="immediateAttentionKeywords"
              style="min-width: 150px"
            >
              <template v-if="!immediateAttentionKeyword" v-slot:selected>
                <div>All Attention Keywords</div>
              </template>
            </q-select>
            <!-- END SELECT: IMMEDIATE KEYWORDS -->
          </div>

        </div>
        <q-separator class="q-my-sm"/>
        <!-- END SECTION: CAMPAIGN SELECTION ROW -->
        <!-- SECTION: CARDS -->
        <div class="row q-col-gutter-sm">
          <!-- CARD: REQUESTS -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="full-height">
              <q-card-section class="q-py-sm">
                <div class="row justify-between items-center">
                  <h6 class="text-subtitle1 text-weight-bold q-my-none text-uppercase">Requests</h6>
                  <q-checkbox
                    size="sm"
                    label="Show All"
                    v-model="showAll"
                  />
                </div>
                <q-select
                  id="ElementRequestFilter"
                  v-model="selectedRequestFilter"
                  :display-value="`${selectedRequestFilter}`"
                  clearable
                  dense
                  options-dense
                  filled
                  @update:model-value="value => selectRequestFilter(value)"
                  :options="requestFilterOptions"
                  class="q-mt-sm"
                >
                  <template v-if="!selectedRequestFilter" v-slot:selected>
                    <div class="text-grey-6">Filter</div>
                  </template>
                </q-select>
              </q-card-section>
              <q-card-section class="q-py-sm">
                <q-table
                flat
                no-data-label="You're all caught up. No pending Requests."
                :rows="filteredRequests"
                :columns="tableListColumns"
                :pagination="{
                  rowsPerPage: 25
                }"
                :rows-per-page-options="[25]"
                hide-header
                row-key="name"
              >
                <template v-slot:header="props">
                  <q-tr :props="props">
                    <q-th
                      v-for="col in props.cols"
                      :key="col.name"
                      :props="props"
                    >
                      {{ col.label }}
                    </q-th>
                  </q-tr>
                </template>

                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td auto-width>
                      <q-btn
                        size="sm"
                        color="accent"
                        round
                        dense
                        @click="props.expand = !props.expand"
                        :icon="props.expand ? 'remove' : 'add'"
                      />
                    </q-td>
                    <q-td
                      v-for="col in props.cols"
                      :key="col.name"
                      :props="props"
                    >
                      {{ col.value }}
                    </q-td>
                    <q-td>
                      <q-item-label v-if="props.row.acknowledged">
                        Acknowledged
                      </q-item-label>
                      <q-item-label v-if="props.row.acknowledged" caption>
                        {{ props.row.acknowledgedBy }} <br />
                        {{ getDtFormatted(props.row.acknowledgedDateTime) }}
                      </q-item-label>
                      <q-btn
                        v-else
                        color="secondary"
                        size="md"
                        icon-right="check"
                        @click="setConfirmAck(props)"
                        label="Acknowledge"
                      />
                    </q-td>
                  </q-tr>
                  <q-tr v-show="props.expand" :props="props">
                    <q-td colspan="100%">
                      <q-list separator style="max-width: 300px">
                        <q-item
                          v-for="caregiver in props.row.caregivers"
                          :key="caregiver.name"
                        >
                          <q-item-section avatar style="min-width: 125px">
                            <q-item-label>{{ caregiver.name }}</q-item-label>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label caption>
                              {{ caregiver.number }}
                            </q-item-label>
                            <q-item-label caption>
                              <a
                                :href="
                                  'mailto:' +
                                    caregiver.email +
                                    '?subject=' +
                                    props.row.name +
                                    ' ' +
                                    props.row.visitTime
                                "
                                >{{ caregiver.email }}</a
                              >
                            </q-item-label>
                            <q-item-label caption>
                              {{ props.row.dept }}
                            </q-item-label>
                            <q-item-label caption>
                              Request Received:
                              {{ getDtFormatted(caregiver.receivedDateTime) }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
              </q-card-section>
            </q-card>
          </div>
          <!-- END CARD: REQUESTS -->
          <!-- CARD: RESPONSE RATE -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="full-height">
              <q-card-section class="q-py-sm">
                <div class="row justify-between items-center">
                  <h6 class="text-subtitle1 text-weight-bold q-my-none text-uppercase">Response Rate</h6>
                </div>
                </q-card-section>
             <q-card-section class="q-pa-sm">
                <apexchart
                  v-if="!loadingResponseRate"
                  ref="realtimeChart"
                  type="line"
                  height="350"
                  :options="filteredResponseData.options"
                  :series="filteredResponseData.series"
                ></apexchart>
             </q-card-section>
            </q-card>
          </div>
          <!-- END CARD: RESPONSE RATE -->
          <!-- CARD: RESPONSE ALERTS -->
          <div class="col-12 col-md-12">
            <q-card flat bordered>
              <q-card-section class="q-py-sm">
                <div class="row justify-between items-center">
                  <h6 class="text-subtitle1 text-weight-bold q-my-none text-uppercase">Response Alerts</h6>
                  <q-checkbox
                    size="xs"
                    label="Show All"
                    v-model="showAttentionAcknowledged"
                  ></q-checkbox>
                </div>
                <q-select
                  id="ElementRequestFilter"
                  v-model="selectedAlertsFilter"
                  :display-value="`${selectedAlertsFilter}`"
                  clearable
                  dense
                  filled
                  options-dense
                  @update:model-value="value => selectAlertsFilter(value)"
                  :options="requestFilterOptions"
                  class="q-mt-sm"
                >
                  <template v-if="!selectedAlertsFilter" v-slot:selected>
                    <div class="text-grey-6">Filter Alerts</div>
                  </template>
                </q-select>
              </q-card-section>
              <q-card-section class="q-py-sm">
                <q-table
                flat
                no-data-label="You're all caught up. No pending response alerts."
                :rows="filteredAlerts"
                :columns="tableAlertsColumns"
                :pagination="{
                  rowsPerPage: 25,
                  sortBy: 'receivedDateTime',
                  descending: true
                }"
                :rows-per-page-options="[25]"
                row-key="name"
              >
                <template v-slot:header="props">
                  <q-tr :props="props">
                    <q-th
                      v-for="col in props.cols"
                      :key="col.name"
                      :props="props"
                    >
                      {{ col.label }}
                    </q-th>
                    <q-th>
                      Acknowledgements
                    </q-th>
                  </q-tr>
                </template>

                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td
                      v-for="col in props.cols"
                      :key="col.name"
                      :props="props"
                    >
                      <div style="max-width: 300px;">
                        <div v-if="col.name === 'name'">
                          <strong>{{ col.value }}</strong>
                          <q-btn
                            v-if="props.row.acknowledged"
                            color="secondary"
                            @click="setAlertNoteConfirmAck(props)"
                            label="Note"
                            style="position: absolute; right: 0; top: 50%; transform: translateY(-50%)"
                          />
                          <br />
                          {{ props.row.listFilter2 }}
                        </div>
                        <div v-else>
                          {{ col.value }}
                        </div>
                      </div>
                    </q-td>
                    <q-td align="right">
                      <q-item-label v-if="props.row.acknowledged">
                        Acknowledged
                      </q-item-label>
                      <q-item-label v-if="props.row.acknowledged" caption>
                        {{ props.row.ackBy }} <br />
                        {{ getDtFormatted(props.row.ackDateTime) }}
                      </q-item-label>
                      <q-btn
                        v-else
                        color="secondary"
                        size="md"
                        icon-right="check"
                        @click="setAlertConfirmAck(props)"
                        label="Acknowledge"
                      />
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
              </q-card-section>
            </q-card>
          </div>
          <!-- END CARD: RESPONSE ALERTS -->
        </div>

        <!-- END SECTION: CARDS -->
    </div>



    <q-dialog v-model="confirmAck" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="check" color="secondary" text-color="white" />
          <span class="q-ml-sm">
            <br />Are you sure you want to acknowledge this visit?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Acknowledge"
            color="primary"
            v-close-popup
            @click="
              ackRequest();
              editForm = false;
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmAlertAck" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="check" color="secondary" text-color="white" />
          <span class="q-ml-sm q-mb-md">
            <br />Are you sure you want to acknowledge this response alert?
          </span>

          <q-input
            filled
            style="width: 100%; margin-top: 15px;"
            type="textarea"
            label="Notes"
            v-model="ackAlertNote"
          ></q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Acknowledge"
            color="primary"
            v-close-popup
            @click="
              ackAlert();
              editForm = false;
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmAlertNotesAck" persistent>
      <q-card style="max-width: 500px; width: 80vw">
        <q-card-section class="row items-center">
          <q-input
            filled
            style="width: 100%; margin-bottom: 15px;"
            type="textarea"
            label="Notes"
            v-model="ackAlertNote"
          ></q-input>

          <div
            v-html="selectedAlertsRow.ackNote"
            style="max-height: 250px; overflow: scroll; width: 100%; overflow-x: hidden"
          ></div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Add Note"
            color="primary"
            v-close-popup
            @click="
              updateAckAlertNote();
              editForm = false;
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import contactApi from "../api/contact";
import lookupApi from "../api/lookup";
import campaignApi from "../api/campaigns";
import VueApexCharts from "vue3-apexcharts";
import { mapState } from "pinia";
import { useTenantStore } from "@/stores/tenantStore";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axiosInstance from "axios";


export default defineComponent({
  name: "Dashboard",
  components: {
    apexchart: VueApexCharts
  },
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        this.selectedCampaignId = null;
        this.tableAlertsData = [];
        this.responseRateData = [];
        this.tableListData = [];
        await this.loadPageDataAndListeners();
        await this.onTabSelected(this.selectedTab);
        await this.onRefreshAll();
        await this.loadTeamMembers();
      },
      deep: true
    },
    showAll: {
      async handler() {
        await this.onTabSelected(this.selectedTab);
        await this.onRefreshAll();
      }
    }
  },
  created() {
    this.rtConnection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.BASE_URL}/request-hub`)
      .configureLogging(LogLevel.Error)
      .build();

    this.rtConnection.start().catch(function(err) {
      return console.error(err.toString());
    });

    this.responseConnection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.BASE_URL}/response-hub`)
      .configureLogging(LogLevel.Error)
      .build();

    this.responseConnection.start().catch(function(err) {
      return console.error(err.toString());
    });
  },
  mounted() {
    window.onbeforeunload = () => {
      this.disconnectRtUpdates();
    };
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"]),
    activeCampaign() {
      return this.campaignLookup.find(f => f.value === this.selectedCampaignId);
    },
    filteredRequests() {
      if (!this.selectedRequestFilter) {
        return this.tableListData;
      }

      return this.tableListData.filter(
        r => r.dept === this.selectedRequestFilter
      );
    },
    filteredAlerts() {
      const attentionKeywordFilteredAlerts = this.tableAlertsData.filter(
        r =>
          !this.immediateAttentionKeyword ||
          (this.immediateAttentionKeyword &&
            r.replyMessage &&
            r.replyMessage
              .toLowerCase()
              .indexOf(this.immediateAttentionKeyword.toLowerCase().trim()) >=
              0)
      );

      return attentionKeywordFilteredAlerts.filter(
        r =>
          (this.selectedAlertsFilter && r.dept === this.selectedAlertsFilter) ||
          this.showAttentionAcknowledged ||
          !r.acknowledged
      );
    },
    filteredResponseData() {
      const today = new Date();

      const incomingMessages = [];
      const outgoingMessages = [];
      const attentionMessages = [];
      const categories = [];

      for (let i = -this.amountOfDays + 1; i <= 0; i++) {
        const currentDate = date.addToDate(today, { days: i });
        const formattedDate = date.formatDate(currentDate, "MM-DD-YYYY");

        const filterIncomingMessageDates = f =>
          f.direction === "Inbound" &&
          f.receivedDateTime &&
          date.formatDate(new Date(f.receivedDateTime), "MM-DD-YYYY") ===
            formattedDate;

        incomingMessages.push(
          this.responseRateData.filter(f => filterIncomingMessageDates(f))
            .length
        );
        outgoingMessages.push(
          this.responseRateData.filter(
            f =>
              f.direction === "Outbound" &&
              f.sentDateTime &&
              date.formatDate(new Date(f.sentDateTime), "MM-DD-YYYY") ===
                formattedDate
          ).length
        );
        attentionMessages.push(
          this.responseRateData.filter(
            f =>
              filterIncomingMessageDates(f) &&
              ((this.immediateAttentionKeyword &&
                f.replyMessage &&
                f.replyMessage
                  .toLowerCase()
                  .indexOf(
                    this.immediateAttentionKeyword.toLowerCase().trim()
                  ) >= 0) ||
                (!this.immediateAttentionKeyword &&
                  this.immediateAttentionKeywords.some(
                    v =>
                      f.replyMessage &&
                      f.replyMessage
                        .toLowerCase()
                        .indexOf(v.toLowerCase().trim()) >= 0
                  )))
          ).length
        );

        categories.push(formattedDate);
      }

      const incomingHintText =
        this.activeCampaign && this.activeCampaign.serviceSid
          ? "Dedicated"
          : "All replies";

      return {
        series: [
          {
            name: `Incoming Messages (${incomingHintText})`,
            data: incomingMessages
          },
          {
            name: "Outgoing Messages",
            data: outgoingMessages
          },
          {
            name: "Immediate Attention Required",
            data: attentionMessages
          }
        ],
        options: {
          ...this.chartOptions,
          xaxis: {
            categories
          }
        }
      };
    },
    immediateAttentionKeywords() {
      if (
        !this.activeCampaign ||
        !this.activeCampaign.replyImmediateAttentionKeywords
      ) {
        return [];
      } else {
        return this.activeCampaign.replyImmediateAttentionKeywords
          .split(",")
          .filter(f => f)
          .map(f => f.toLowerCase().trim());
      }
    }
  },
  data() {
    return {
      teamMemberCount: 0,
      loadingResponseRate: false,
      rtConnection: "",
      campaignLookup: [],
      responseConnection: "",
      ackAlertNote: "",
      proxyDate: null,
      todayDate: this.getDtFormatted(new Date(), "YYYY/MM/DD"),
      todayDateFormatted: this.getDtFormatted(new Date(), "dddd Do, MMMM YYYY"),
      newRequests: 0,
      newAlerts: 0,
      showAll: false,
      showAttentionAcknowledged: false,
      requestFilterOptions: [],
      selectedRequestFilter: "",
      selectedAlertsFilter: "",
      confirmAck: false,
      confirmAlertAck: false,
      confirmAlertNotesAck: false,
      selectedTab: "Requests",
      selectedRequestRow: {},
      selectedAlertsRow: {},
      showRequests: false,
      showAlerts: false,
      selectedCampaignId: null,
      amountOfDays: 7,
      immediateAttentionKeyword: null,
      tableListData: [],
      tableAlertsData: [],
      contactCount: 0,
      responseRateData: [],
      tableListColumns: [
        {
          name: "name",
          align: "left",
          label: "name",
          field: "name",
          sortable: true
        },
        {
          name: "visitTime",
          align: "left",
          label: "visitTime",
          field: "visitTime",
          sortable: true
        }
      ],
      tableAlertsColumns: [
        {
          name: "name",
          align: "left",
          label: "Name",
          field: "name",
          sortable: true
        },
        {
          name: "replyMessage",
          align: "left",
          label: "Reply Message",
          field: "replyMessage",
          sortable: true
        },
        {
          name: "receivedDateTime",
          align: "left",
          label: "Reply Received",
          field: "receivedDateTime",
          format: (val, row) => this.getDtFormatted(val),
          sortable: true
        },
        {
          name: "number",
          align: "left",
          label: "Phone #",
          field: "number",
          sortable: true
        }
      ],
      chartOptions: {
        chart: {
          height: 350,
          type: "line",
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        colors: ["#2E93fA", "#66DA26", "#ff0000"],
        stroke: {
          width: [5, 5, 7],
          curve: "straight",
          dashArray: [0, 0, 8]
        },
        legend: {
          tooltipHoverFormatter: function(val, opts) {
            return (
              val +
              " - " +
              opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
              ""
            );
          }
        },
        markers: {
          size: 0,
          hover: {
            sizeOffset: 6
          }
        },
        xaxis: {
          categories: []
        },
        grid: {
          borderColor: "#f1f1f1"
        }
      }
    };
  },
  methods: {
    async loadTeamMembers() {
      const { data } = await axiosInstance.get(`${import.meta.env.BASE_URL}/user/invited-users`);
      this.teamMemberCount = data.length;
    },
    setConfirmAck(props) {
      this.confirmAck = true;
      this.selectedRequestRow = props.row;
    },
    setAlertConfirmAck(props) {
      this.confirmAlertAck = true;
      this.selectedAlertsRow = props.row;
    },
    setAlertNoteConfirmAck(props) {
      this.confirmAlertNotesAck = true;
      this.selectedAlertsRow = props.row;
    },
    async ackRequest() {
      const payload = {
        campaignId: this.selectedCampaignId,
        name: this.selectedRequestRow.name,
        visitTime: this.selectedRequestRow.visitTime
      };

      await campaignApi.acknowledgeCampaignMessage(payload);
      const requestsPayload = {
        campaignId: this.selectedCampaignId,
        amountOfDays: this.amountOfDays,
        showAll: this.showAll
      };

      const response = await campaignApi.loadCampaignRequests(requestsPayload);
      this.showRequests = response && response.length > 0;
      this.tableListData = response;
      this.requestFilterOptions = [...new Set(data.map(r => r.dept))];
    },
    async ackAlert() {
      const payload = {
        campaignId: this.selectedCampaignId,
        messageReceivedId: this.selectedAlertsRow.messageReceivedId,
        note: this.getAckAlertNote()
      };

      await campaignApi.acknowledgeCampaignResponse(payload);
      await this.onTabSelected(this.selectedTab);
      await this.onRefreshAll();
      this.ackAlertNote = "";
    },
    async updateAckAlertNote() {
      const payload = {
        campaignId: this.selectedCampaignId,
        messageReceivedId: this.selectedAlertsRow.messageReceivedId,
        note: this.getAckAlertNote()
      };

      await campaignApi.acknowledgeCampaignResponseNote(payload);
      await this.onTabSelected(this.selectedTab);
      await this.onRefreshAll();
      this.ackAlertNote = "";
    },
    getAckAlertNote() {
      if (!this.ackAlertNote) {
        return this.selectedAlertsRow.ackNote;
      }

      const ackNote = this.selectedAlertsRow.ackNote;
      const note =
        `${this.user.userName} @ ${date.formatDate(
          new Date(),
          "hh:mm a MM-DD-YYYY"
        )} <br /> ${ackNote ? "Latest Note: " : "First Note: "}` +
        this.ackAlertNote.replaceAll("\n", "<br />") +
        "<br /> <br />" +
        (ackNote ? ackNote.replace("Latest Note", "Note") : "");

      return note;
    },
    updateProxyDate() {
      this.proxyDate = date.formatDate(new Date(), "MM-DD-YYYY");
    },
    async loadPageDataAndListeners() {
      try {
        this.contactCount = await contactApi.findContactCount();

        const lookup = await lookupApi.campaignsLookup();
        this.campaignLookup = lookup;
        if (!this.selectedCampaignId && lookup.length > 0) {
          const savedSelectedCampaign = localStorage.getItem(
            "lastSelectedCampaign"
          );
          if (savedSelectedCampaign) {
            this.selectedCampaignId = Number(savedSelectedCampaign);
          } else {
            this.selectedCampaignId = lookup[0].value;
          }
        }

        if (!this.selectedCampaignId) {
          this.showRequests = false;
          this.tableListData = [];
          this.requestFilterOptions = [];

          return;
        }

        this.newRequests = 0;
        this.rtConnection.invoke(
          "ConnectByCampaign",
          JSON.stringify(this.selectedCampaignId)
        );
        this.rtConnection.on("NewRequest", () => {
          this.newRequests += 1;
        });

        this.rtConnection.on(
          "AcknowledgedRequest",
          (name, dateTime, ackBy, ackDateTime) => {
            const requestIndex = this.tableListData.findIndex(
              obj => obj.name === name && obj.visitTime === dateTime
            );
            const request = this.tableListData[requestIndex];
            if (request) {
              request.acknowledged = true;
              request.acknowledgedBy = ackBy;
              request.acknowledgedDateTime = ackDateTime;
            }
          }
        );

        this.responseConnection.invoke(
          "ConnectByCampaign",
          JSON.stringify(this.selectedCampaignId)
        );

        this.responseConnection.on(
          "AcknowledgedResponse",
          (messageReceivedId, ackBy, ackDateTime) => {
            const responseIndex = this.tableAlertsData.findIndex(
              obj => obj.messageReceivedId === messageReceivedId
            );
            const response = this.tableAlertsData[responseIndex];
            if (response) {
              response.acknowledged = 1;
              response.ackBy = ackBy;
              response.ackDateTime = ackDateTime;
            }
          }
        );
      } catch (error) {
        console.error(error.response?.data ?? error);
      }
    },
    async onTabSelected(val) {
      if (!this.selectedCampaignId) {
        return null;
      }

      switch (val) {
        case "Requests":
          await this.loadRequests();
          break;
        case "ResponseRate":
          await this.loadResponseRate();
          break;
        case "Alerts":
          await this.loadImmediateAttentionResponses();
          break;
        default:
          return null;
      }
    },
    async onRefreshAll() {
      if (!this.selectedCampaignId) {
        return null;
      }
      await this.loadRequests();
      await this.loadResponseRate();
      await this.loadImmediateAttentionResponses();
    },
    async loadRequests() {
      try {
        const payload = {
          campaignId: this.selectedCampaignId,
          amountOfDays: this.amountOfDays,
          showAll: this.showAll
        };

        if (this.activeTenant && !this.activeTenant.isHQ) {
          // HQ departments don't normally offer available shifts
          const response = await campaignApi.loadCampaignRequests(payload);
          this.showRequests = response && response.length > 0;
          this.tableListData = response;
          this.requestFilterOptions = [...new Set(response.map(r => r.dept))];
        }
      } catch (error) {
        console.error(error.response?.data ?? error);
      }
    },
    async loadResponseRate() {
      try {
        this.loadingResponseRate = true;
        const repliesAndRequestsPayload = {
          campaignId: this.selectedCampaignId,
          amountOfDays: this.amountOfDays,
          showAll: this.showAll
        };

        const response = await campaignApi.loadCampaignResponseRate(
          repliesAndRequestsPayload
        );
        this.responseRateData = response;
      } catch (error) {
        console.error(error.response?.data ?? error);
      } finally {
        this.loadingResponseRate = false;
      }
    },
    async loadImmediateAttentionResponses() {
      try {
        const repliesAndRequestsPayload = {
          campaignId: this.selectedCampaignId,
          amountOfDays: this.amountOfDays,
          showAll: this.showAll
        };

        const response = await campaignApi.loadCampaignImmediateAttentionResponses(
          repliesAndRequestsPayload
        );
        this.tableAlertsData = response;
      } catch (error) {
        console.error(error.response?.data ?? error);
      }
    },
    async selectCampaign(id) {
      this.disconnectRtUpdates();
      this.selectedCampaignId = id;
      localStorage.setItem("lastSelectedCampaign", id);
      await this.onTabSelected(this.selectedTab);
      await this.onRefreshAll();
    },
    disconnectRtUpdates() {
      this.rtConnection.invoke(
        "DisconnectByCampaign",
        JSON.stringify(this.selectedCampaignId)
      );
      this.rtConnection.off("NewRequest");
      this.rtConnection.off("AcknowledgedRequest");
    },
    disconnectResponseUpdates() {
      this.responseConnection.invoke(
        "DisconnectByCampaign",
        JSON.stringify(this.selectedCampaignId)
      );
      this.responseConnection.off("AcknowledgedResponse");
    },
    async selectAmountOfDays(value) {
      this.amountOfDays = value;
      await this.onTabSelected(this.selectedTab);
      await this.onRefreshAll();
    },
    async selectRequestFilter(value) {
      if (!value) {
        this.selectedRequestFilter = null;
        await this.onTabSelected(this.selectedTab);
        await this.onRefreshAll();
      }
    },
    async selectAlertsFilter(value) {
      if (!value) {
        this.selectedAlertsFilter = null;
        await this.onTabSelected(this.selectedTab);
        await this.onRefreshAll();
      }
    },
    async exportCampaignReport(option) {
      switch (option) {
        case 1:
          await this.fetchMessageRecipientsByDate(
            date.formatDate(
              date.subtractFromDate(new Date(), { days: 7 }),
              "MM/DD/YY"
            )
          );
          break;
        case 2:
          await this.fetchMessageRecipientsByDate(
            date.formatDate(
              date.subtractFromDate(new Date(), { days: 30 }),
              "MM/DD/YY"
            )
          );
          break;
        case 3:
          await this.fetchMessageRecipientsByDate(
            date.formatDate(new Date(1970, 1, 1), "MM/DD/YY")
          );
          break;
        default:
          await this.fetchMessageRecipientsByDate(
            date.formatDate(new Date(), "MM/DD/YY")
          );
          break;
      }
    },
    async fetchMessageRecipientsByDate(startDate, endDate) {
      if (!this.selectedCampaignId) {
        return;
      }

      const currentDate = date.formatDate(new Date(), "MM/DD/YY");
      axiosInstance
        .post(
          `${import.meta.env.BASE_URL}/campaign/message-log`,
          {
            startDate: startDate,
            endDate: endDate || currentDate,
            campaignId: this.selectedCampaignId
          },
          {
            responseType: "blob",
            headers: { Accept: "application/vnd.ms-excel" }
          }
        )
        .then(response => {
          if (response.data) {
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
              "download",
              `${this.activeCampaign.label} ${currentDate} Report.xlsx`
            );
            document.body.appendChild(link);
            link.click();
          }
        });
    }
  }
});
</script>

