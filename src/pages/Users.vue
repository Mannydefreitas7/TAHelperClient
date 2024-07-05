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
          v-model="userViewState.showArchived"
          color="yellow-8"
          label="Show archived"
          @update:model-value="loadUsers(true)"
        />
        <q-space />
        <q-btn
          dense
          round
          color="primary"
          icon="add"
          @click="addUserForm = true"
        ></q-btn>
      </q-toolbar>

      <!-- search -->
      <q-toolbar>
        <q-input
          dense
          rounded
          outlined
          v-model="userViewState.searchTerm"
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
        :items="users"
        @virtual-scroll="details => onVirtualScroll(details)"
        separator
      >
        <template v-slot="{ item: user, index }">
          <q-item
            clickable
            v-ripple
            :key="index"
            dense
            @click="selectUser(user)"
            :active="
              user.id === selectedUser.id &&
                user.userEmail === selectedUser.userEmail
            "
            active-class="bg-grey-3"
          >
            <q-item-section avatar>
              <q-icon size="lg" color="grey-8" name="account_circle"/>
            </q-item-section>

            <q-item-section>
              <q-item-label lines="1">{{ user.userName }}</q-item-label>
              <q-item-label caption>
                <span class="text-weight-bold">
                  {{ user.userEmail }}
                </span>
              </q-item-label>

              <q-item-label caption>
                <q-badge
                  v-if="user.isPending"
                  color="red"
                  class="q-mb-xs q-mr-xs q-py-xs text-white"
                >
                  <strong>Pending</strong>
                </q-badge>

                <q-badge
                  v-if="!user.active"
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
            <q-btn round flat class="q-pa-sm">
              <q-avatar size="60px">
                <q-icon size="lg" color="grey-8" name="account_circle"/>
              </q-avatar>
            </q-btn>

            <q-item class="q-subtitle-1 q-pl-md">
              <q-item-section>
                <q-item-label lines="1">
                  <span class="text-weight-bold">
                    <strong>{{ selectedUser.userName }}</strong>
                  </span>
                </q-item-label>

                <q-item-label caption>
                  <span class="text-weight-bold">
                    {{ selectedUser.userEmail }}
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-space />
            <q-item-section
              side
              v-if="selectedUser && selectedUser.id && selectedUser.active"
            >
              <div class="row q-gutter-x-sm" v-if="editUserForm">
                <q-btn
                  v-if="!selectedUser.isPending"
                  no-caps
                  color="red-5"
                  label="Cancel"
                  @click="editUserForm = false"
                />

                <q-btn
                  v-if="!selectedUser.isPending"
                  no-caps
                  color="primary"
                  label="Save"
                  @click="saveProfile()"
                />
              </div>

              <q-btn-dropdown v-else dense flat dropdown-icon="more_vert">
                <q-list>
                  <q-item
                    clickable
                    v-close-popup
                    v-ripple
                    @click="editUserForm = true"
                    v-if="!selectedUser.isPending"
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
                      <q-item-label caption>Change this user</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    v-ripple
                    @click="confirmDeleteUser = true"
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

          <q-item v-if="!selectedUser.isPending">
            <q-item-section avatar>
              <q-avatar icon="perm_identity" color="grey-2" text-color="blue" />
            </q-item-section>

            <q-item-section>
              <q-input
                ref="name"
                :disable="
                  (selectedUser && selectedUser.isPending) || !editUserForm
                "
                filled
                v-model="selectedUser.userName"
                label="Name"
                lazy-rules
                :rules="[value => value !== '' || 'Name is a required field']"
                class="q-pb-sm"
              ></q-input>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-avatar icon="mail" color="grey-2" text-color="grey-8" />
            </q-item-section>

            <q-item-section>
              <q-input
                ref="email"
                :disable="
                  (selectedUser && selectedUser.isPending) || !editUserForm
                "
                filled
                v-model="selectedUser.userEmail"
                label="Email"
                lazy-rules
                :rules="[
                  value =>
                    validateEmail(value) || 'Please enter a valid email address'
                ]"
                class="q-pb-sm"
              ></q-input>
            </q-item-section>
          </q-item>

          <q-item v-if="!selectedUser.isPending">
            <q-item-section avatar>
              <q-avatar icon="phone" color="grey-2" text-color="grey-8" />
            </q-item-section>

            <q-item-section>
              <q-input
                ref="mobile"
                :disable="
                  (selectedUser && selectedUser.isPending) || !editUserForm
                "
                filled
                v-model="selectedUser.userMobile"
                label="Mobile"
                lazy-rules
                mask="+1(###) ### - ####"
                unmasked-value
                :rules="[
                  value =>
                    validatePhone(value) || 'Please enter a valid phone number'
                ]"
                class="q-pb-sm"
              ></q-input>
            </q-item-section>
          </q-item>

          <q-item v-if="!selectedUser.isPending">
            <q-item-section avatar>
              <q-avatar
                icon="perm_contact_calendar"
                color="grey-2"
                text-color="grey-8"
              />
            </q-item-section>

            <q-item-section>
              <q-select
                filled
                v-model="selectedUser.userContactMethod"
                :disable="
                  (selectedUser && selectedUser.isPending) || !editUserForm
                "
                :options="contactOptions"
                label="Contact Method"
              ></q-select>
            </q-item-section>
          </q-item>

          <q-item v-if="!selectedUser.isPending">
            <q-item-section avatar>
              <q-avatar icon="schedule" color="grey-2" text-color="grey-8" />
            </q-item-section>

            <q-item-section>
              <q-select
                filled
                v-model="selectedUser.timeZone"
                :disable="
                  (selectedUser && selectedUser.isPending) || !editUserForm
                "
                :options="timeZones"
                label="Time Zone"
              ></q-select>
            </q-item-section>
          </q-item>

          <q-item v-if="!selectedUser.isPending">
            <q-item-section avatar>
              <q-avatar icon="lock" color="grey-2" text-color="grey-8" />
            </q-item-section>

            <q-item-section>
              <q-input
                ref="authProvider"
                disable
                filled
                v-model="selectedUser.userAuthProvider"
                label="Auth Provider"
                lazy-rules
                class="q-pb-sm"
              ></q-input>
            </q-item-section>
          </q-item>

          <div
            class="q-ml-lg q-mb-sm text-h6 row items-center justify-between"
            style="max-width: 500px"
          >
            Accounts
            <q-btn
              v-if="!selectedUser.isPending && selectedUser.active"
              round
              color="primary"
              size="sm"
              icon="add"
              :disable="!editUserForm"
              @click="addTenantDialog = true"
            ></q-btn>
          </div>
          <div class="row q-gutter-md q-mx-sm q-mr-md">
            <q-list
              class="col-12 column items-start"
              v-if="selectedUser.tenants && selectedUser.tenants.length > 0"
            >
              <q-item
                v-for="(tenant, index) in selectedUser.tenants"
                :key="index"
                class="tenant-item q-mb-xs full-width"
                style="max-width: 500px"
              >
                <q-item-section class="text-body1">
                  <div class="row justify-start items-center q-gutter-x-xs">
                    <label style="font-weight: 500">{{ tenant.name }}</label>
                    <label
                      v-if="selectedUser.isPending"
                      style="cursor: pointer;"
                      class="text-blue-7"
                      @click="resendInvite(tenant.id)"
                    >
                      <u>(re-send invitation)</u>
                    </label>
                  </div>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    color="red"
                    dense
                    flat
                    icon="delete"
                    :disable="!editUserForm && !selectedUser.isPending"
                    @click="
                      selectedTenantId = tenant.id;
                      confirmDeleteUserTenant = true;
                    "
                  >
                    <q-tooltip>
                      Delete user from account
                    </q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
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

    <q-dialog v-model="addUserForm" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Invite User</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-input v-model="newUserEmail" filled dense label="Email" />

            <q-select
              v-model="newUserTenants"
              filled
              dense
              label="Accounts"
              map-options
              emit-value
              multiple
              use-chips
              :options="tenantOptions"
            />
          </q-form>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right">
          <q-btn
            no-caps
            label="Cancel"
            color="grey-3"
            text-color="black"
            v-close-popup
          />
          <q-btn
            color="blue-6"
            no-caps
            label="Invite"
            v-close-popup
            @click="onInvite()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="addTenantDialog" v-if="addTenantDialog" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Add Accounts</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-select
              v-model="newUserTenants"
              filled
              dense
              label="Accounts"
              map-options
              emit-value
              multiple
              use-chips
              :options="getFilteredUserTenants()"
            />
          </q-form>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right">
          <q-btn
            no-caps
            label="Cancel"
            color="grey-3"
            text-color="black"
            v-close-popup
          />
          <q-btn
            color="blue-6"
            no-caps
            label="Add"
            v-close-popup
            @click="onInvite(true)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmDeleteUser" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Archive User?</div>
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <span>Are you sure you want to archive this user?</span>
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

    <q-dialog v-model="confirmDeleteUserTenant" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Remove User From Account?</div>
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <span>
            Are you sure you want to remove this user from the selectedaccount?
          </span>
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
            label="Delete"
            color="red"
            v-close-popup
            @click="onRemove()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import userApi from "../api/user";
import tenantApi from "../api/tenant";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import { mainMixin } from "../mixins/index";
import { usStates, timeZones } from "src/lib/shared";

export default {
  name: "User",
  mixins: [mainMixin],
  computed: {
    ...mapState(useTenantStore, ["activeTenant"]),
    tenantOptions() {
      return this.tenants.map(t => ({ label: t.name, value: t.id }));
    }
  },
  data() {
    return {
      timeZones,
      navOpen: false,
      users: [],
      tenants: [],
      contactOptions: ["Email", "SMS", "All"],
      userViewState: {
        searchTerm: "",
        startIndex: 0,
        endIndex: 50,
        pageSize: 50,
        showArchived: false
      },
      newUserEmail: null,
      newUserTenants: null,
      selectedTenantId: null,
      selectedUser: {},
      totalUsers: 0,
      usStatesOptions: usStates,
      confirmDeleteUser: false,
      confirmDeleteUserTenant: false,
      addTenantDialog: false,
      addUserForm: false,
      editUserForm: false,
      currentTabIndex: 0,
      tab: "all",
      size: {}
    };
  },
  async mounted() {
    await this.loadUsers(true);
    this.tenants = await tenantApi.findAllActiveTenants();
  },
  methods: {
    validateEmail(email) {
      if (!email || email.trim() == "") {
        return true;
      }

      const reEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const emailRes = reEmail.test(String(email).toLowerCase());

      return emailRes;
    },
    validatePhone(phone) {
      if (!phone || phone.trim() == "") {
        return true;
      }

      const phoneNumber = parseInt(phone);
      const rePhone = /\d{10}/;
      const phoneRes = rePhone.test(Number(phoneNumber));

      return phoneRes;
    },
    getFilteredUserTenants() {
      const items = this.tenantOptions.filter(f => {
        return !this.selectedUser.tenants.some(s => s.id === f.value);
      });

      return items;
    },
    onResize(size) {
      this.size = size;
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
    formatUser(user) {
      return {
        ...user,
        userMobile: user.userMobile?.replace(/[+][1]/g, ""),
        isPending: Boolean(user.isPending),
      };
    },
    showSuccessMessage(message) {
      this.$q.notify({
        color: "green-4",
        textColor: "white",
        icon: "cloud_done",
        position: "top",
        message: message
      });
    },
    async selectUser(user) {
      try {
        if (!user) return;

        this.editUserForm = false;
        this.$q.loading.show();
        this.selectedUser = { ...user };
        this.currentTabIndex = 1;
        const tenants = await userApi.findUserTenants(
          user.userEmail,
          user.isPending
        );
        this.selectedUser.tenants = tenants;
        this.$forceUpdate();
      } catch (error) {
        console.error(error);
      } finally {
        this.$q.loading.hide();
      }
    },
    async loadUsers(resetUserList) {
      if (resetUserList) {
        this.users = [];
        this.totalUsers = 0;
      }

      try {
        this.$q.loading.show();
        const response = await userApi.findUsers(this.userViewState);
        const nextBatchUsers =
          response?.items?.map(user => this.formatUser(user)) || [];

        this.users = this.users.concat(nextBatchUsers) || [];
        this.totalUsers = response.itemCount || 0;

        if (this.users.length > 0 && !this.selectedUser?.id) {
          await this.selectUser(this.users[0]);
        } else {
          this.$nextTick(async () => {
            await this.selectUser(
              this.users.sort((a, b) => {
                if (
                  this.selectedUser.id === a.id &&
                  this.selectedUser.isPending === a.isPending
                )
                  return -1;
                if (a.active) return 0;
                if (!a.active) return 1;
              })[0]
            );
          });
        }

        this.$refs.virtualScroll.refresh(-1); // -1 keep scroll position
      } catch (error) {
        console.error(error);
        this.showErrorMessage(error);
      } finally {
        this.$q.loading.hide();
      }
    },
    async onDelete() {
      const payload = { ...this.selectedUser, active: false };
      await userApi.updateUser(payload);
      await this.loadUsers(true);

      this.showSuccessMessage("User Archived");
    },
    async onInvite(addTenant) {
      try {
        if (!this.newUserEmail && !addTenant) {
          return;
        }

        this.$q.loading.show();
        await userApi.inviteUser(
          this.newUserEmail ?? this.selectedUser.userEmail,
          this.newUserTenants
        );
        if (addTenant) {
          this.showSuccessMessage("User added to accounts");
        } else {
          this.showSuccessMessage("Invitation sent to team member");
        }

        this.newUserEmail = null;
        this.newUserTenants = null;
        await this.loadUsers(true);
      } catch (error) {
        console.error(error.response?.data || error);
      } finally {
        this.$q.loading.hide();
      }
    },
    async resendInvite(tenantId) {
      try {
        this.$q.loading.show();
        await userApi.resendUserInvite(this.selectedUser.userEmail, tenantId);
        this.showSuccessMessage("User re-invited");
      } catch (error) {
        console.error(error.response?.data || "An error happened");
      } finally {
        this.$q.loading.hide();
      }
    },
    async onRemove() {
      try {
        if (!this.selectedTenantId) {
          return;
        }

        this.$q.loading.show();
        if (this.selectedUser.isPending) {
          const response = await userApi.deletePendingUser(
            this.selectedUser.userEmail,
            this.selectedTenantId
          );
          this.showSuccessMessage(response);
        } else {
          await userApi.deleteUser(this.selectedUser.id, this.selectedTenantId);
          this.showSuccessMessage("User removed from account");
        }

        await this.loadUsers(true);
      } catch (error) {
        console.error(error);
      } finally {
        this.$q.loading.hide();
      }
    },
    async saveProfile() {
      try {
        const nameRef = this.$refs.name;
        const emailRef = this.$refs.email;
        const phoneRef = this.$refs.mobile;

        nameRef.validate();
        emailRef.validate();
        phoneRef.validate();

        if (!nameRef.hasError && !emailRef.hasError && !phoneRef.hasError) {
          this.$q.loading.show();
          const payload = {
            ...this.selectedUser,
            userMobile: `+1${this.selectedUser.userMobile}`
          };

          this.editUserForm = false;
          await userApi.updateUser(payload);
          await this.loadUsers(true);
          this.showSuccessMessage("User saved");
        }
      } catch (error) {
        console.error(error.response?.data || "An error happened");
      } finally {
        this.$q.loading.hide();
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
        ordinalIndex >= this.userViewState.endIndex
      ) {
        const currentPageIndex = Math.floor(
          (ordinalIndex + 1) / this.userViewState.pageSize
        );
        const startIndex = currentPageIndex * this.userViewState.pageSize;
        const endIndex = (currentPageIndex + 1) * this.userViewState.pageSize;

        this.userViewState.startIndex = startIndex;
        this.userViewState.endIndex = endIndex;
        await this.loadUsers();
      } else if (direction == "decrease") {
        // nothing to do, we have data in memory
      }
    },
    async onSearch(value) {
      if (value === null) {
        return;
      }

      this.userViewState.searchTerm = "";
      this.userViewState.startIndex = 0;
      this.userViewState.endIndex = this.userViewState.pageSize;

      if (!this.strIsEmptyOrSpaces(value) && value.length <= 2) {
        return;
      }

      this.userViewState.searchTerm = value;
      await this.loadUsers(true);
    },
    async onSearchClear(value) {
      this.userViewState.searchTerm = "";
      this.userViewState.startIndex = 0;
      this.userViewState.endIndex = this.userViewState.pageSize;

      await this.loadUsers(true);
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
