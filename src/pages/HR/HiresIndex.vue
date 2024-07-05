<template>
  <div class="q-pa-xs">
    <q-table
      binary-state-sort
      ref="table"
      separator="none"
      row-key="id"
      no-data-label="No Hires"
      :rows="hires"
      :columns="columns"
      :visible-columns="visibleColumns"
      :loading="loading"
      :grid="$q.screen.lt.sm"
      :pagination.sync="pagination"
      :filter="searchTerm"
      @request="loadData"
    >
      <template #top-left>
        <q-btn
          label="New Hire"
          color="primary"
          unelevated
          class="q-my-xs q-mr-sm"
          @click="createNewHire"
        />
        <q-btn
          outline
          label="Copy Link"
          icon="link"
          @click="copyUrlDialog.open = true"
        />
      </template>

      <template #top-right>
        <q-checkbox
          v-model="showArchived"
          label="Show Archived"
          class="q-mr-md"
          @update:model-value="
            loadData({
              pagination,
              filter: searchTerm
            })
          "
        />
        <q-input
          outlined
          dense
          v-model="searchTerm"
          debounce="300"
          placeholder="Search..."
          class="q-mr-xs q-my-xs"
          clearable
          style="width: 213px"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          outlined
          dense
          :options="craftOptions"
          v-model="filterTerm"
          debounce="300"
          clearable
          class="q-my-xs"
          style="width: 213px"
          @update:model-value="
            loadData({
              pagination,
              filter: searchTerm
            })
          "
        >
          <template v-if="!filterTerm" #selected> Craft </template>
        </q-select>
      </template>

      <template #header="props">
        <q-tr :props="props" class="bg-grey-1">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            style="border-bottom-width: 1px !important"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template #body="props">
        <q-tr
          class="cursor-pointer"
          @click="$router.push(`NewHireForms/a/${props.row.id}`)"
          :props="props"
        >
          <q-td key="firstName" :props="props">
            <span>{{ props.row.firstName }}</span>
          </q-td>
          <q-td key="lastName" :props="props">
            <span>{{ props.row.lastName }}</span>
          </q-td>
          <q-td key="craftId" :props="props">
            <span>
              {{
                props.row.craftId
                  ? crafts.find(c => c.id === props.row.craftId).name
                  : "No Craft"
              }}
            </span>
          </q-td>
          <q-td key="status" :props="props">
            <q-chip
              v-if="props.row.status"
              outline
              square
              :color="
                props.row.status == 'completed' ||
                props.row.status == 'onboarding email sent' ||
                props.row.status == 'hired'
                  ? 'green'
                  : props.row.status == 'in-progress'
                  ? 'orange'
                  : props.row.status == 'archived' ||
                    props.row.status == 'not hired'
                  ? 'red'
                  : 'grey'
              "
              dark
              :label="props.row.status"
            />
          </q-td>
          <q-td key="archived" :props="props">
            <span v-if="props.row.archived">
              {{ getDtFormatted(props.row.updatedDateTime, "MMM, Do, YYYY") }}
              / {{ props.row.updatedBy }}
            </span>
          </q-td>
          <q-td key="actions" :props="props">
            <div
              class="row justify-end q-gutter-x-sm"
              v-if="
                !['hired', 'not hired', 'archived'].includes(props.row.status)
              "
            >
              <q-btn
                no-caps
                color="green-5"
                label="Accept"
                unelevated
                @click.stop.prevent="updateHireStatus(props.row, 'hired')"
              ></q-btn>
              <q-btn
                no-caps
                unelevated
                color="red-5"
                label="Reject"
                @click.stop.prevent="updateHireStatus(props.row, 'not hired')"
              ></q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="copyUrlDialog.open" persistent>
      <q-card style="width: 800px; max-width: 80vw">
        <q-card-section class="row items-center">
          <div class="q-pt-sm row items-center justify-start q-col-gutter-md">
            <q-input
              hide-bottom-space
              outlined
              dense
              label="First Name"
              v-model="copyUrlDialog.firstName"
              class="col-12 col-sm-3"
              debounce="500"
            ></q-input>
            <q-input
              outlined
              dense
              label="Middle Name"
              v-model="copyUrlDialog.middleName"
              class="col-12 col-sm-3"
              debounce="500"
            ></q-input>
            <q-input
              hide-bottom-space
              outlined
              dense
              label="Last Name"
              v-model="copyUrlDialog.lastName"
              class="col-12 col-sm-3"
              debounce="500"
            ></q-input>
            <q-select
              outlined
              dense
              label="Suffix"
              v-model="copyUrlDialog.suffix"
              :options="['Sr.', 'Jr.']"
              clearable
              class="col-12 col-sm-3"
            ></q-select>

            <q-input
              outlined
              hide-bottom-space
              dense
              lazy-rules
              readonly
              :model-value="
                copyUrlDialog.hireDate
                  ? getDtFormattedWithoutTime(copyUrlDialog.hireDate)
                  : ''
              "
              label="Hire/Rehire Date"
              class="col-12 col-sm-3"
              debounce="500"
            >
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="copyUrlDialog.hireDate" mask="MM/DD/YYYY">
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

            <q-select
              outlined
              dense
              map-options
              emit-value
              label="Craft"
              hide-bottom-space
              v-model="copyUrlDialog.craft"
              :options="craftOptions"
              class="col-12 col-sm-3"
            ></q-select>

            <q-input
              outlined
              dense
              label="Email"
              v-model="copyUrlDialog.email"
              class="col-12 col-sm-3"
              debounce="500"
              ><template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              outlined
              dense
              label="Mobile"
              v-model="copyUrlDialog.number"
              type="tel"
              mask="(###) ###-####"
              class="col-12 col-sm-3"
              debounce="500"
            >
              <template v-slot:prepend>
                <q-icon name="phone" />
              </template>
            </q-input>

            <q-input
              outlined
              dense
              type="number"
              label="Pay Rate"
              v-model="copyUrlDialog.payRate"
              class="col-12 col-sm-3"
              debounce="500"
            >
              <template v-slot:prepend>
                <q-icon name="attach_money" />
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions class="bg-grey-2 q-pa-md" align="between">
          <q-btn
            label="Close"
            color="grey-8"
            text-color="white"
            class="q-px-md"
            v-close-popup
          />
          <q-btn
            label="Copy Link"
            color="primary"
            text-color="white"
            class="q-px-md"
            @click="copyUrl"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { copyToClipboard, date } from "quasar";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import { getHires, getCrafts, createHire, updateHire } from "../../api/hire.js";
import { mainMixin } from "../../mixins/index";

const columns = [
  {
    name: "firstName",
    align: "left",
    required: true,
    label: "First Name",
    field: "firstName",
    sortable: true
  },
  {
    name: "lastName",
    align: "left",
    required: true,
    label: "Last Name",
    field: "lastName",
    sortable: true
  },
  {
    name: "craftId",
    align: "left",
    label: "Craft",
    field: "craftId",
    required: true,
    sortable: true
  },
  {
    name: "status",
    align: "left",
    label: "Status",
    field: "status",
    required: true,
    sortable: true
  },
  {
    name: "archived",
    align: "left",
    label: "Archived (Date / By)",
    field: "archived",
    sortable: true
  },
  {
    name: "actions",
    align: "left",
    label: "",
    field: "actions",
    sortable: false
  }
];

export default {
  name: "HireIndex",
  mixins: [mainMixin],
  computed: {
    ...mapState(useTenantStore, ["activeTenant"]),
    craftOptions() {
      return this.crafts.map(craft => craft.name);
    },
    visibleColumns() {
      const visible = ["firstName", "lastName", "craftId", "status", "actions"];
      if (this.showArchived) {
        visible.push("archived");
      }
      return visible;
    }
  },
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        this.crafts = await getCrafts(this.activeTenant.id);
        await this.loadData({
          pagination: this.pagination,
          filter: null
        });
      },
      deep: true
    }
  },
  methods: {
    async copyUrl() {
      try {
        let applicationLink = `${import.meta.env.VITE_AUTH_REPLY_URL}/hire?tid=${this.activeTenant.id}`;
        for (const key in this.copyUrlDialog) {
          if (key === "open") { continue; }
          const value = this.copyUrlDialog[key];
          if (value) {
            applicationLink += `&${key}=${encodeURI(value)}`;
          }
        }

        await copyToClipboard(applicationLink);
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "content_copy",
          position: "top",
          message: "Copied to clipboard"
        });
      } catch (error) {
        console.error("Error: ", error);
        this.$q.notify({
          type: "negative",
          position: "top",
          message: "Could not copy to clipboard"
        });
      }
    },

    async loadData(props) {
      try {
        const { page, rowsPerPage, sortBy, descending } = props.pagination;
        const filter = props.filter;

        this.loading = true;

        const payload = {
          startIndex: (page - 1) * rowsPerPage,
          pageSize:
            rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage,
          searchTerm: filter,
          filterTerm: this.filterTerm,
          showArchived: this.showArchived
        };
        const response = await getHires(payload);
        this.hires = response.items;
        this.pagination.rowsNumber = response.itemCount;
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async updateHireStatus(hire, status) {
      const payload = {
        ...hire,
        status
      };
      updateHire(payload);
      const index = this.hires.findIndex(h => h.id === payload.id);
      if (index > -1) {
        this.hires.splice(index, 1, payload);
      }
    },
    async createNewHire() {
      try {
        const hire = await createHire({ tenantId: this.activeTenant.id });
        this.$router.push(`NewHireForms/a/${hire.id}`);
      } catch (error) {
        console.error(error);
      }
    }
  },
  data: () => ({
    date,
    columns,
    showArchived: false,
    loading: false,
    pagination: {
      sortBy: "lastName",
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 0
    },
    copyUrlDialog: {
      open: false,
      firstName: null,
      middleName: null,
      lastName: null,
      suffix: null,
      hireDate: null,
      craft: null,
      email: null,
      number: null
    },
    hires: [],
    crafts: [],
    searchTerm: null,
    filterTerm: null
  })
};
</script>
