<template>
  <q-layout
    view="lHh lpR lff"
    container
    class="full-width"
    style="height: calc(100vh - 100px)"
  >
    <q-drawer
      v-model="navOpen"
      :width="300"
      show-if-above
      bordered
      :breakpoint="690"
    >
      <q-toolbar class="text-black">
        <q-checkbox
          v-model="tenantViewState.showArchived"
          color="yellow-8"
          label="Show archived"
          @update:model-value="loadTenants(true)"
        />
        <q-space />
        <q-btn
          dense
          round
          color="primary"
          icon="add"
          @click="createTenant()"
        ></q-btn>
      </q-toolbar>

      <!-- search -->
      <q-toolbar>
        <q-input
          dense
          rounded
          outlined
          v-model="tenantViewState.searchTerm"
          debounce="250"
          placeholder="Search"
          class="full-width"
          @update:model-value="value => onSearch(value)"
          @clear="value => onSearchClear(value)"
          clearable
        />
      </q-toolbar>

      <q-virtual-scroll
        ref="virtualScroll"
        style="height: calc(100% - 100px)"
        virtual-scroll-slice-size="50"
        :items="tenants"
        @virtual-scroll="details => onVirtualScroll(details)"
        separator
      >
        <template v-slot="{ item: tenant, index }">
          <q-item
            clickable
            v-ripple
            :key="index"
            dense
            @click="
              () => {
                selectedTenant = { ...tenant };
                currentTabIndex = 1;
                editTenantForm = false;
              }
            "
            :active="tenant.id === selectedTenant.id"
            active-class="bg-grey-3"
          >
            <q-item-section>
              <q-item-label lines="1">{{ tenant.name }}</q-item-label>

              <q-item-label caption>
                <q-badge
                  v-if="!tenant.active"
                  color="yellow-8"
                  class="q-mb-xs q-mr-xs q-py-xs"
                >
                  <strong>Archived</strong>
                </q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
    </q-drawer>

    <q-page-container class="fit">
      <q-page class="fit">
        <q-scroll-area
          style="height: calc(100vh - 100px)"
          class="q-pa-none bg-white"
        >
          <q-toolbar class="text-black">
            <q-item class="q-subtitle-1 q-pl-md">
              <q-item-section>
                <q-item-label lines="1">
                  {{ selectedTenant.name }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-space />
            <q-item-section side v-if="selectedTenant && selectedTenant.active">
              <div class="row q-gutter-x-sm" v-if="editTenantForm">
                <q-btn
                  no-caps
                  color="red-5"
                  label="Cancel"
                  @click="editTenantForm = false"
                />

                <q-btn
                  no-caps
                  color="primary"
                  label="Save"
                  @click="
                    $refs.accountRef.saveAccount();
                    editTenantForm = false;
                  "
                />
              </div>

              <q-btn-dropdown v-else dense flat dropdown-icon="more_vert">
                <q-list>
                  <q-item
                    clickable
                    v-close-popup
                    v-ripple
                    @click="editTenantForm = true"
                  >
                    <q-item-section avatar>
                      <q-avatar
                        icon="create"
                        color="secondary"
                        text-color="white"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Edit</q-item-label>
                      <q-item-label caption>Change this account</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    v-ripple
                    @click="confirmDeleteTenant = true"
                  >
                    <q-item-section avatar>
                      <q-avatar
                        icon="archive"
                        color="orange"
                        text-color="white"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Archive</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </q-item-section>
          </q-toolbar>
          <q-separator></q-separator>
          <account
            ref="accountRef"
            v-if="selectedTenant"
            :active-tenant="selectedTenant"
            :editTenantForm="editTenantForm"
            @user-invited="loadTenants(true)"
            @saved="loadTenants(true)"
            @created="
              loadTenants(true);
            "
          />
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

    <q-dialog v-model="confirmDeleteTenant" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Archive Account?</div>
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <span>Are you sure you want to archive this account?</span>
        </q-card-section>

        <q-card-actions class="row justify-between">
          <q-btn
            no-caps
            label="Cancel"
            color="grey-3"
            text-color="black"
            v-close-popup
          />
          <q-btn
            no-caps
            label="Archive"
            color="red"
            v-close-popup
            @click="onDelete()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import tenantApi from "../api/tenant";
import { mainMixin } from "../mixins/index";
import { usStates } from "src/lib/shared";

import Account from "../components/TenantAccount.vue";

export default {
  name: "Tenant",
  mixins: [mainMixin],
  components: {
    Account
  },
  async mounted() {
    await this.loadTenants();
  },
  data() {
    return {
      navOpen: false,
      tenants: [],
      tenantViewState: {
        searchTerm: "",
        startIndex: 0,
        endIndex: 50,
        pageSize: 50,
        showArchived: false
      },
      selectedTenant: {},
      totalTenants: 0,
      usStatesOptions: usStates,
      confirmDeleteTenant: false,
      confirmDeleteTenantTenant: false,
      editTenantForm: false,
      currentTabIndex: 0,
      tab: "all",
      size: {},
      emptyTenant: { active: true }
    };
  },
  methods: {
    onResize(size) {
      this.size = size;
    },
    clearSelected() {
      this.selectedTenant = { ...this.emptyTenant };
    },
    filterUsStates(val, update) {
      if (val === "") {
        update(() => {
          this.usStatesOptions = usStates;
        });
        return;
      }

      update(() => {
        const lCaseVal = val.toLowerCase();
        this.usStatesOptions = usStates.filter(
          v => v.toLowerCase().indexOf(lCaseVal) > -1
        );
      });
    },
    createTenant() {
      this.clearSelected();
      this.editTenantForm = true;
    },
    formatTenant(tenant) {
      return {
        ...tenant,
        users: tenant.users.map(m => ({
          ...m,
          isPending: Boolean(m.isPending),
          tenantOwner: Boolean(m.tenantOwner)
        }))
      };
    },
    async loadTenants(resetTenantList) {
      if (resetTenantList) {
        this.tenants = [];
        this.totalTenants = 0;
      }

      try {
        const response = await tenantApi.findTenants(this.tenantViewState);
        const nextBatchTenants =
          response?.items?.map(tenant => this.formatTenant(tenant)) || [];

        this.tenants = this.tenants.concat(nextBatchTenants) || [];
        this.totalTenants = response.itemCount || 0;

        if (this.tenants.length > 0 && !this.selectedTenant?.id) {
          this.selectedTenant = { ...this.tenants.filter(f => f.active)[0] };
        } else if (!this.selectedTenant.id) {
          this.clearSelected();
        } else {
          this.$nextTick(() => {
            this.selectedTenant = this.tenants.sort((a, b) => {
              if (this.selectedTenant.id === a.id) return -1;
              if (a.active) return 0;
              if (!a.active) return 1;
            })[0];
          });
        }

        this.$refs.virtualScroll.refresh(-1); // -1 keep scroll position
      } catch (error) {
        console.error(error);
        this.showErrorMessage(error);
      }
    },
    async onDelete() {
      const { accountRef } = this.$refs;
      this.selectedTenant = { ...this.selectedTenant, active: false };
      this.$nextTick(async () => {
        await accountRef.saveAccount(true);
        this.showSuccessMessage("Account Archived");
      });
    },
    async onVirtualScroll(details) {
      const { from, to, index, direction } = details;

      if (from < 0 || to < 0) {
        return; // happens on init
      }

      const ordinalIndex = index + 1;
      if (
        direction == "increase" &&
        ordinalIndex >= this.tenantViewState.endIndex
      ) {
        const currentPageIndex = Math.floor(
          (ordinalIndex + 1) / this.tenantViewState.pageSize
        );
        const startIndex = currentPageIndex * this.tenantViewState.pageSize;
        const endIndex = (currentPageIndex + 1) * this.tenantViewState.pageSize;

        this.tenantViewState.startIndex = startIndex;
        this.tenantViewState.endIndex = endIndex;
        await this.loadTenants();
      } else if (direction == "decrease") {
        // nothing to do, we have data in memory
      }
    },
    async onSearch(value) {
      if (value === null) {
        return;
      }

      this.tenantViewState.searchTerm = "";
      this.tenantViewState.startIndex = 0;
      this.tenantViewState.endIndex = this.tenantViewState.pageSize;

      if (!this.strIsEmptyOrSpaces(value) && value.length <= 2) {
        return;
      }

      this.tenantViewState.searchTerm = value;
      await this.loadTenants(true);
    },
    async onSearchClear(value) {
      this.tenantViewState.searchTerm = "";
      this.tenantViewState.startIndex = 0;
      this.tenantViewState.endIndex = this.tenantViewState.pageSize;

      await this.loadTenants(true);
    }
  }
};
</script>

<style lang="scss" scoped>
.tenant-item {
  background: $grey-2;
  border-radius: 10px;
  border: solid $grey-4 1px;
}

.groupsDialog {
  max-height: 450px;
}

@media (min-width: 780px) {
  .groupsDialog {
    max-height: 550px;
  }
}
</style>
