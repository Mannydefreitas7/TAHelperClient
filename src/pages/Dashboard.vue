<template>
 <div class="flex flex-col gap-3">
    <div>
        <span class="text-xs text-neutral-400">{{ data.todayDateFormatted }}</span>
        <h1 class="text-3xl font-bold text-neutral-700">Dashboard</h1>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard :total="data.campaignLookup.length" title="Campaigns" :icon="MegaphoneIcon" />
        <StatsCard :total="data.contactCount" title="Contacts" :icon="IdentificationIcon" />
        <StatsCard :total="invitedUsers.length" title="Team Members" :icon="UserGroupIcon" />
        <StatsCard :total="data.hireCount" title="New Hires" :icon="UserPlusIcon" />
    </div>

    <div class="flex items-center justify-between">
      <CampaignSelector />
      <div class="flex items-center">
          <RefreshButton /> 
          <ExportMessagesDropdown />
          <DateViewDropdown />
      </div>
    </div>

    <div class="flex md:flex-col lg:flex-row w-full gap-4">
      <CMSRatingCard />
      <ResponseRateCard />
    </div>



 </div>
</template>

<script setup>
import { contactApi, campaignApi, lookupApi } from "@/api";
import VueApexCharts from "vue3-apexcharts";
import { useTenantStore } from "@/stores";
import { StatsCard, CampaignSelector, RefreshButton, ExportMessagesDropdown, DateViewDropdown, CMSRatingCard, ResponseRateCard } from "@/components"
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";
import { onUpdated, reactive, watch, ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useDateFormat, useNow } from "@vueuse/core";
import { MegaphoneIcon, IdentificationIcon, UserGroupIcon, UserPlusIcon } from "@heroicons/vue/24/outline"
const tenantStore = useTenantStore()
const { activeTenant, invitedUsers } = storeToRefs(tenantStore);


const data = reactive({
      teamMemberCount: 0,
      loadingResponseRate: false,
      rtConnection: "",
      campaignLookup: [],
      responseConnection: "",
      ackAlertNote: "",
      proxyDate: null,
      todayDate: useDateFormat(new Date(), "YYYY/MM/DD"),
      todayDateFormatted: useDateFormat(new Date(), "dddd Do, MMMM YYYY"),
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
          format: (val, row) => getDtFormatted(val),
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
})
 
const loadPageDataAndListeners = async () => {
      try {
        data.contactCount = await contactApi.findContactCount();

        const lookup = await lookupApi.campaignsLookup();
        data.campaignLookup = lookup;
        if (!this.selectedCampaignId && lookup.length > 0) {
          const savedSelectedCampaign = localStorage.getItem(
            "lastSelectedCampaign"
          );
          if (savedSelectedCampaign) {
            data.selectedCampaignId = Number(savedSelectedCampaign);
          } else {
            data.selectedCampaignId = lookup[0].value;
          }
        }

        if (!data.selectedCampaignId) {
          data.showRequests = false;
          data.tableListData = [];
          data.requestFilterOptions = [];

          return;
        }

        data.newRequests = 0;
        data.rtConnection.invoke(
          "ConnectByCampaign",
          JSON.stringify(data.selectedCampaignId)
        );
        data.rtConnection.on("NewRequest", () => {
          data.newRequests += 1;
        });

        data.rtConnection.on(
          "AcknowledgedRequest",
          (name, dateTime, ackBy, ackDateTime) => {
            const requestIndex = data.tableListData.findIndex(
              obj => obj.name === name && obj.visitTime === dateTime
            );
            const request = data.tableListData[requestIndex];
            if (request) {
              request.acknowledged = true;
              request.acknowledgedBy = ackBy;
              request.acknowledgedDateTime = ackDateTime;
            }
          }
        );

        data.responseConnection.invoke(
          "ConnectByCampaign",
          JSON.stringify(data.selectedCampaignId)
        );

        data.responseConnection.on(
          "AcknowledgedResponse",
          (messageReceivedId, ackBy, ackDateTime) => {
            const responseIndex = data.tableAlertsData.findIndex(
              obj => obj.messageReceivedId === messageReceivedId
            );
            const response = data.tableAlertsData[responseIndex];
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
    }

watch(() => activeTenant, async (newValue, oldValue) => {
    if (!newValue) return
    data.selectedCampaignId = null;
    data.tableAlertsData = [];
    data.responseRateData = [];
    data.tableListData = [];
    await loadPageDataAndListeners();
    await onTabSelected(data.selectedTab);
    await onRefreshAll();
    await loadTeamMembers();
}, {  immediate: true, deep: true })

watch(() => data.showAll, async (newValue, oldValue) => {
    await onTabSelected(data.selectedTab);
    await onRefreshAll();
})


const activeCampaign = computed(() => {
    return data.campaignLookup.find(f => f.value === data.selectedCampaignId);
})

const filteredRequests = computed(() => {
      if (!this.selectedRequestFilter) {
        return this.tableListData;
      }

      return this.tableListData.filter(
        r => r.dept === this.selectedRequestFilter
      );
    })

    const filteredAlerts = computed(() => {
      const attentionKeywordFilteredAlerts = data.tableAlertsData.filter(
        r =>
          !data.immediateAttentionKeyword ||
          (data.immediateAttentionKeyword &&
            r.replyMessage &&
            r.replyMessage
              .toLowerCase()
              .indexOf(data.immediateAttentionKeyword.toLowerCase().trim()) >=
              0)
      );
        return attentionKeywordFilteredAlerts.filter(
            r =>
            (data.selectedAlertsFilter && r.dept === data.selectedAlertsFilter) ||
            data.showAttentionAcknowledged ||
            !r.acknowledged
        );
    })


    const filteredResponseData = computed(() => {
      const today = new Date();

      const incomingMessages = [];
      const outgoingMessages = [];
      const attentionMessages = [];
      const categories = [];

      for (let i = -data.amountOfDays + 1; i <= 0; i++) {
        const currentDate = date.addToDate(today, { days: i });
        const formattedDate = date.formatDate(currentDate, "MM-DD-YYYY");

        const filterIncomingMessageDates = f =>
          f.direction === "Inbound" &&
          f.receivedDateTime &&
          date.formatDate(new Date(f.receivedDateTime), "MM-DD-YYYY") ===
            formattedDate;

        incomingMessages.push(
          data.responseRateData.filter(f => filterIncomingMessageDates(f))
            .length
        );
        outgoingMessages.push(
          data.responseRateData.filter(
            f =>
              f.direction === "Outbound" &&
              f.sentDateTime &&
              date.formatDate(new Date(f.sentDateTime), "MM-DD-YYYY") ===
                formattedDate
          ).length
        );
        attentionMessages.push(
          data.responseRateData.filter(
            f =>
              filterIncomingMessageDates(f) &&
              ((data.immediateAttentionKeyword &&
                f.replyMessage &&
                f.replyMessage
                  .toLowerCase()
                  .indexOf(
                    data.immediateAttentionKeyword.toLowerCase().trim()
                  ) >= 0) ||
                (!data.immediateAttentionKeyword &&
                  data.immediateAttentionKeywords.some(
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
        data.activeCampaign && data.activeCampaign.serviceSid
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
          ...data.chartOptions,
          xaxis: {
            categories
          }
        }
      };
    })

    const immediateAttentionKeywords = computed(() => {
      if (
        !data.activeCampaign ||
        !data.activeCampaign.replyImmediateAttentionKeywords
      ) {
        return [];
      } else {
        return data.activeCampaign.replyImmediateAttentionKeywords
          .split(",")
          .filter(f => f)
          .map(f => f.toLowerCase().trim());
      }
    })

    const loadTeamMembers = async () => {
      const { data } = await tenantStore.getInvitedUsers()
      data.teamMemberCount = data.length;
    }

    const setConfirmAck = (props) => {
      data.confirmAck = true;
      data.selectedRequestRow = props.row;
    }

    const setAlertConfirmAck = (props) => {
      data.confirmAlertAck = true;
      data.selectedAlertsRow = props.row;
    }

    const setAlertNoteConfirmAck = (props) => {
      data.confirmAlertNotesAck = true;
      data.selectedAlertsRow = props.row;
    }

    const ackRequest = async () => {
      const payload = {
        campaignId: data.selectedCampaignId,
        name: data.selectedRequestRow.name,
        visitTime: data.selectedRequestRow.visitTime
      };

      await campaignApi.acknowledgeCampaignMessage(payload);
      const requestsPayload = {
        campaignId: data.selectedCampaignId,
        amountOfDays: data.amountOfDays,
        showAll: data.showAll
      };

      const response = await campaignApi.loadCampaignRequests(requestsPayload);
      data.showRequests = response && response.length > 0;
      data.tableListData = response;
      data.requestFilterOptions = [...new Set(data.map(r => r.dept))];
    }

    const ackAlert = async () => {
      const payload = {
        campaignId: data.selectedCampaignId,
        messageReceivedId: data.selectedAlertsRow.messageReceivedId,
        note: getAckAlertNote()
      };

      await campaignApi.acknowledgeCampaignResponse(payload);
      await onTabSelected(data.selectedTab);
      await onRefreshAll();
      data.ackAlertNote = "";
    }

     const updateAckAlertNote = async () => {
      const payload = {
        campaignId: data.selectedCampaignId,
        messageReceivedId: data.selectedAlertsRow.messageReceivedId,
        note: getAckAlertNote()
      };

      await campaignApi.acknowledgeCampaignResponseNote(payload);
      await onTabSelected(data.selectedTab);
      await onRefreshAll();
      data.ackAlertNote = "";
    }


    const getAckAlertNote = () => {
      if (!data.ackAlertNote) {
        return data.selectedAlertsRow.ackNote;
      }

      const ackNote = data.selectedAlertsRow.ackNote;
      const note =
        `${user.userName} @ ${date.formatDate(
          new Date(),
          "hh:mm a MM-DD-YYYY"
        )} <br /> ${ackNote ? "Latest Note: " : "First Note: "}` +
        data.ackAlertNote.replaceAll("\n", "<br />") +
        "<br /> <br />" +
        (ackNote ? ackNote.replace("Latest Note", "Note") : "");

      return note;
    }


    const updateProxyDate = () => {
      data.proxyDate = useDateFormat(new Date(), "MM-DD-YYYY");
    }



    const onTabSelected = async (val) => {
      if (!data.selectedCampaignId) {
        return null;
      }

      switch (val) {
        case "Requests":
          await loadRequests();
          break;
        case "ResponseRate":
          await loadResponseRate();
          break;
        case "Alerts":
          await loadImmediateAttentionResponses();
          break;
        default:
          return null;
      }
    }

    const onRefreshAll = async () => {
      if (!data.selectedCampaignId) {
        return null;
      }
      await loadRequests();
      await loadResponseRate();
      await loadImmediateAttentionResponses();
    }

    const loadRequests = async () => {
      try {
        const payload = {
          campaignId: data.selectedCampaignId,
          amountOfDays: data.amountOfDays,
          showAll: data.showAll
        };

        if (this.activeTenant && !this.activeTenant.isHQ) {
          // HQ departments don't normally offer available shifts
          const response = await campaignApi.loadCampaignRequests(payload);
          data.showRequests = response && response.length > 0;
          data.tableListData = response;
          data.requestFilterOptions = [...new Set(response.map(r => r.dept))];
        }
      } catch (error) {
        console.error(error.response?.data ?? error);
      }
    }

    const loadResponseRate = async () => {
      try {
        data.loadingResponseRate = true;
        const repliesAndRequestsPayload = {
          campaignId: data.selectedCampaignId,
          amountOfDays: data.amountOfDays,
          showAll: data.showAll
        };

        const response = await campaignApi.loadCampaignResponseRate(
          repliesAndRequestsPayload
        );
        data.responseRateData = response;
      } catch (error) {
        console.error(error.response?.data ?? error);
      } finally {
        data.loadingResponseRate = false;
      }
    }

    const loadImmediateAttentionResponses = async () => {
      try {
        const repliesAndRequestsPayload = {
          campaignId: data.selectedCampaignId,
          amountOfDays: data.amountOfDays,
          showAll: data.showAll
        };

        const response = await campaignApi.loadCampaignImmediateAttentionResponses(
          repliesAndRequestsPayload
        );
        data.tableAlertsData = response;
      } catch (error) {
        console.error(error.response?.data ?? error);
      }
    }

    const selectCampaign = async (id) => {
      disconnectRtUpdates();
      data.selectedCampaignId = id;
      localStorage.setItem("lastSelectedCampaign", id);
      await onTabSelected(data.selectedTab);
      await onRefreshAll();
    }

   const disconnectRtUpdates = () => {
      data.rtConnection.invoke(
        "DisconnectByCampaign",
        JSON.stringify(this.selectedCampaignId)
      );
      data.rtConnection.off("NewRequest");
      data.rtConnection.off("AcknowledgedRequest");
    }

    const disconnectResponseUpdates = () => {
      data.responseConnection.invoke(
        "DisconnectByCampaign",
        JSON.stringify(data.selectedCampaignId)
      );
      data.responseConnection.off("AcknowledgedResponse");
    }

    const selectAmountOfDays = async (value) => {
      data.amountOfDays = value;
      await onTabSelected(data.selectedTab);
      await onRefreshAll();
    }

    const selectRequestFilter = async (value) => {
      if (!value) {
        data.selectedRequestFilter = null;
        await onTabSelected(data.selectedTab);
        await onRefreshAll();
      }
    }

    const selectAlertsFilter = async (value) => {
      if (!value) {
        data.selectedAlertsFilter = null;
        await onTabSelected(data.selectedTab);
        await onRefreshAll();
      }
    }

    const exportCampaignReport = async (option) => {
      switch (option) {
        case 1:
          await fetchMessageRecipientsByDate(
            useDateFormat(useNow() - 7, "MM/DD/YY")
          );
          break;
        case 2:
          await fetchMessageRecipientsByDate(
            useDateFormat(useNow() - 30, "MM/DD/YY")
          );
          break;
        case 3:
          await fetchMessageRecipientsByDate(
            useDateFormat(new Date(1970, 1, 1), "MM/DD/YY")
          );
          break;
        default:
          await fetchMessageRecipientsByDate(
            useDateFormat(useNow(), "MM/DD/YY")
          );
          break;
      }
    }

    const fetchMessageRecipientsByDate = async (startDate, endDate) => {
      if (!data.selectedCampaignId) {
        return;
      }

      const currentDate = useDateFormat(new Date(), "MM/DD/YY");
      axios
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
  


onUpdated(() => {

    data.rtConnection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.BASE_URL}/request-hub`)
      .configureLogging(LogLevel.Error)
      .build();

    data.rtConnection.start().catch(function(err) {
      return console.error(err.toString());
    });

    data.responseConnection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.BASE_URL}/response-hub`)
      .configureLogging(LogLevel.Error)
      .build();

    data.responseConnection.start().catch(function(err) {
      return console.error(err.toString());
    });

})


onMounted(async () => {
    await tenantStore.getInvitedUsers()
    await loadPageDataAndListeners()
})

</script>

