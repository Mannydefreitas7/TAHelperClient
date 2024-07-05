<template>
  <q-layout view="lHh lpR lff" container class="full-width" style="height: calc(100vh - 50px)">
    <q-drawer v-model="navOpen" :width="380" show-if-above bordered :breakpoint="690">
      <div class="row q-px-md q-pt-sm q-mb-sm">
        <span class="text-h5 text-weight-bold">Contacts</span>
        <q-space />
        <q-btn flat dense color="primary" icon="add" label="Create" @click="addContact()" />
        <q-file
          ref="newFilePickerRef"
          style="visibility: hidden; width: 0; height: 0"
          accept=".xlsx,.xls,.csv"
          v-model="importFile"
          label=""
          @update:model-value="onImportContacts" />
        <q-btn-dropdown dense flat dropdown-icon="more_vert">
          <q-list>
            <q-item clickable v-close-popup @click="$refs.newFilePickerRef.pickFiles()">
              <q-item-section avatar>
                <q-avatar icon="import_contacts" color="grey-8" text-color="white" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Import Contacts</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onExportContacts()">
              <q-item-section avatar>
                <q-avatar icon="upgrade" color="grey-8" text-color="white" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Export Contacts</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="openGroupEditor()">
              <q-item-section avatar>
                <q-avatar icon="groups" color="grey-8" text-color="white" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Groups</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <!-- search -->
      <q-toolbar>
        <q-input dense filled v-model="contactViewState.searchTerm" debounce="250" placeholder="Search" class="full-width"
          @update:model-value="value => onSearch(value)" @clear="value => onSearchClear(value)" clearable />
      </q-toolbar>
      <q-separator />
      <!-- contact list -->
      <q-virtual-scroll ref="virtualScroll" style="height: calc(100% - 106px)"
        :virtual-scroll-slice-size="contactViewState.pageSize" :items="contacts"
        @virtual-scroll="details => onVirtualScroll(details)" separator>
        <template v-slot="{ item: contact, index }">
          <q-item style="min-height: 100px;" clickable v-ripple :key="index" dense @click="() => {
              selectedContact = { ...contact };
              editContactForm = false;
              currentTabIndex = 1;
            }
            " :active="contact.id === selectedContact.id" active-class="bg-grey-3">
            <q-item-section avatar>
              <q-icon size="lg" color="grey-8" name="account_circle"/>
            </q-item-section>

            <q-item-section>
              <q-item-label lines="1" class="text-weight-bold">{{ contact.name }}</q-item-label>
              <q-item-label caption>
                <span class="text-weight-bold">
                  {{ contact.number }}
                </span>
              </q-item-label>
              <q-item-label caption>
                <span class="text-weight-bold">
                  {{ contact.email }}
                </span>
              </q-item-label>
              <q-item-label caption>
                <q-badge v-for="group in contact.groups.slice(0, 2)" :key="group.value" color="grey-8"
                  class="q-mb-xs q-mr-xs q-py-xs">
                  <strong>{{ group.label }}</strong>
                </q-badge>
                <q-badge
                  v-if="contact.groups.slice(2, contact.groups.length).length > 0"
                  color="grey-8"
                  class="q-mb-xs q-mr-xs q-py-xs">
                  <strong>+{{ contact.groups.slice(2, contact.groups.length).length }}</strong>
                </q-badge>
              </q-item-label>
              <q-item-label caption>
                <q-badge v-if="!contact.isMobileNumber" color="red-6" class="q-mb-xs q-mr-xs q-py-xs">
                  <strong>Invalid Number</strong>
                </q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
    </q-drawer>

    <q-page-container class="fit">
      <q-page class="fit">
        <q-scroll-area style="height: calc(100vh - 50px)" class="q-pa-none bg-white">
          <q-toolbar class="text-black q-py-sm">
          <q-icon size="60px" color="grey-8" name="account_circle"/>
            <q-item class="q-subtitle-1 q-pl-md">
              <q-item-section>
                <q-item-label lines="1" class="text-h6">
                  {{ selectedContact.name }}
                </q-item-label>
                <q-item-label caption lines="2">
                  <span class="text-weight-bold">
                    {{ selectedContact.employeeId }}
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-space />
            <q-item-section side>
              <div class="row">
                <q-btn v-if="editContactForm" unelevated label="CANCEL" color="red" @click="editContactForm = false"
                  style="margin-right: 15px;"></q-btn>
                <q-btn v-if="editContactForm" unelevated label="SAVE" color="primary" @click="onSubmit()"></q-btn>
              </div>
              <q-btn-dropdown v-if="!editContactForm" dense flat dropdown-icon="more_vert">
                <q-list>
                  <q-item clickable v-close-popup v-ripple @click="editContactForm = true">
                    <q-item-section avatar>
                      <q-avatar icon="create" color="secondary" text-color="white" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Edit</q-item-label>
                      <q-item-label caption>Change this contact</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup v-ripple @click="confirmDeleteContact = true">
                    <q-item-section avatar>
                      <q-avatar icon="delete" color="negative" text-color="white" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Delete</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </q-item-section>
          </q-toolbar>
          <q-separator></q-separator>
          <div class="row q-pa-md q-col-gutter-sm">


            <q-input filled color="primary" ref="name" :disable="!editContactForm" v-model="selectedContact.name" label="Name *"
                  lazy-rules :rules="[value => value !== '' || 'Name is a required field']" class="col-8">
              <template v-slot:prepend>
                <q-icon name="perm_identity" />
              </template>
            </q-input>

            <q-input
            :disable="!editContactForm"
            filled v-model="selectedContact.employeeId"
            label="Employee ID"
            class="col-4"
            />

            <q-input ref="phone" :disable="!editContactForm" filled v-model="selectedContact.number"
            label="Mobile Number *" mask="+1(###) ### - ####" fill-mask unmasked-value lazy-rules :rules="[
            value => validatePhone(value) || 'Please enter a valid phone number']" class="col-12">
              <template v-slot:prepend>
                <q-icon name="phone_iphone" />
              </template>
            </q-input>

            <q-input ref="email" :disable="!editContactForm" filled v-model="selectedContact.email" label="Email"
            lazy-rules :rules="[value => validateEmail(value) || 'Please enter a valid email address']" class="col-12">
              <template v-slot:prepend>
                <q-icon name="mail" />
              </template>
            </q-input>

            <q-select filled ref="email" :disable="!editContactForm" v-model="selectedContact.contactMethod"
            :options="['Text', 'Email', 'Both', 'None']" label="Contact Method" lazy-rules
            class="col-12">
              <template v-slot:prepend>
                <q-icon name="perm_contact_calendar" />
              </template>
            </q-select>


            <q-select filled class="col-12" :disable="!editContactForm" v-model="selectedContact.state" :options="usStatesOptions" use-input
            label="State" @filter="filterUsStates">
              <template v-slot:prepend>
                <q-icon name="location_on" />
              </template>
            </q-select>

            <q-select filled :disable="!editContactForm" v-model="selectedContact.timeZone" :options="timeZones"
            label="Time Zone">
              <template v-slot:prepend>
                <q-icon name="access_time" />
              </template>
            </q-select>

            <q-select class="col-12" filled :disable="!editContactForm" v-model="selectedContact.groups" multiple
              :options="availableContactGroups" stack-label label="Groups">
              <template v-slot:prepend>
                <q-icon name="group" />
              </template>
              <template v-slot:selected-item="scope">
                <q-chip removable size="md" @remove="scope.removeAtIndex(scope.index)">
                  {{ scope.opt.label }}
                </q-chip>
              </template>
            </q-select>

          </div>
        </q-scroll-area>
      </q-page>
    </q-page-container>

    <q-dialog v-model="editGroups" persistent>
      <q-card style="width: 100%; max-width: 550px;">
        <q-card-section>
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-h6">Groups</div>
            </div>

            <div class="col-auto">
              <q-btn flat color="primary" label="Add" icon="add" @click="addGroup()" />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-none">
          <q-scroll-area style="height: 400px">
            <q-list>
              <q-item v-for="(group, index) in groupsToEdit" :key="index">
                <q-item-section v-if="group.active">
                  <q-input ref="groupEditName" filled label="Name" v-model="group.name">
                  </q-input>
                </q-item-section>

                <div class="col-auto" v-if="group.active">
                  <q-btn dense flat icon="more_vert">
                    <q-menu cover auto-close>
                      <q-list>
                        <q-item v-close-popup clickable v-ripple @click="onDeleteGroup(index)">
                          <q-item-section avatar>
                            <q-avatar icon="delete" color="negative" text-color="white" />
                          </q-item-section>

                          <q-item-section>
                            <q-item-label lines="1">Delete</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="flex justify-end q-gutter-sm">
            <q-btn flat label="Cancel" @click="() => {
                clearGroups();
              }
              ">
            </q-btn>

            <q-btn unelevated label="Save" color="primary" type="submit" @click="onGroupSubmit()">
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmDeleteContact" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="red" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this contact?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="red" v-close-popup @click="
            onDelete();
          editContactForm = false;
          " />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import contactApi from "../api/contact";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import { exportFile } from "quasar";
import { date } from "quasar";
import { mainMixin } from "../mixins/index";
import { usStates, timeZones } from "src/lib/shared.js";

export default {
  name: "Contact",
  mixins: [mainMixin],
  computed: {
    ...mapState(useTenantStore, ["activeTenant"]),
    editIcon() {
      return this.editContactForm ? "lock_open" : "lock";
    },
    availableContactGroups() {
      return this.contactGroups.map(c => {
        return {
          label: c.name,
          value: c.id
        };
      });
    }
  },
  data() {
    return {
      timeZones,
      navOpen: false,
      contacts: [],
      contactViewState: {
        searchTerm: "",
        startIndex: 0,
        endIndex: 50,
        pageSize: 50
      },
      contactGroups: [],
      selectedContact: {},
      totalContacts: 0,
      importFile: null,
      usStatesOptions: usStates,
      confirmDeleteContact: false,
      editContactForm: false,
      editGroups: false,
      groupsToEdit: [],
      createGroup: false,
      currentTabIndex: 0,
      tab: "all",
      size: {},
      emptyContact: {
        id: "",
        name: "",
        employeeId: "",
        number: "",
        email: "",
        state: "",
        groups: [],
        timeZone: "America/Chicago",
        contactMethod: "Both"
      },
      emptyGroup: {
        name: "",
        active: true
      }
    };
  },
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        await this.loadContacts(true);
        await this.loadGroups();
      },
      deep: true
    }
  },
  methods: {
    onResize(size) {
      this.size = size;
    },
    clearGroups() {
      this.groupsToEdit = [];
      this.createGroup = false;
      this.editGroups = false;
    },
    clearSelected() {
      this.selectedContact = { ...this.emptyContact };
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
    openGroupEditor() {
      this.groupsToEdit = this.deepClone(this.contactGroups);
      this.editGroups = true;
    },
    addGroup() {
      this.groupsToEdit.unshift({ ...this.emptyGroup });
      this.createGroup = true;
    },
    onDeleteGroup(index) {
      if (this.groupsToEdit[index].id) {
        this.groupsToEdit[index].active = false;
      } else {
        this.groupsToEdit.splice(index, 1);
      }
    },
    addContact() {
      this.clearSelected();
      this.editContactForm = true;
    },
    formatContact(contact) {
      return {
        id: contact.id,
        name: contact.name,
        employeeId: contact.employeeId,
        number: contact.number,
        email: contact.email,
        state: contact.state,
        contactMethod: contact.contactMethod,
        isMobileNumber: Boolean(contact.isMobileNumber),
        groups: contact.groups.map(g => {
          return { label: g.name, value: g.id };
        }),
        timeZone: contact.timeZone
      };
    },
    async loadGroups() {
      const response = await contactApi.findGroups();
      this.contactGroups = response;
    },
    async loadContacts(resetContactList) {
      if (resetContactList) {
        this.contacts = [];
        this.totalContacts = 0;
      }

      try {
        const response = await contactApi.findContacts(this.contactViewState);
        const nextBatchContacts =
          response?.items?.map(contact => this.formatContact(contact)) || [];

        this.contacts = this.contacts.concat(nextBatchContacts) || [];
        this.totalContacts = response.itemCount || 0;

        if (this.contacts.length > 0) {
          this.selectedContact = { ...this.contacts[0] };
        } else {
          this.clearSelected();
        }

        this.$refs.virtualScroll.refresh(-1); // -1 keep scroll position
      } catch (error) {
        console.error(error);
        this.showErrorMessage(error);
      }
    },
    async onGroupSubmit() {
      const validGroups = [];

      this.groupsToEdit.forEach((item, index) => {
        if (item.name && item.name.trim()) {
          if (!validGroups.some(vg => vg.name === item.name)) {
            validGroups.push(item);
          }
        }
      });

      const response = await contactApi.saveGroups(validGroups);
      this.contactGroups = response;

      this.showSuccessMessage("Groups Updated");
      this.clearGroups();
    },
    async onDelete() {
      const contactId = this.selectedContact.id;
      await contactApi.deleteContact(contactId);
      await this.loadContacts(true);

      this.showSuccessMessage("Contact Deleted");
    },
    async onSubmit() {
      var validNumber =
        this.selectedContact.number != "" &&
        this.validatePhone(this.selectedContact.number);
      const payload = {
        ...this.selectedContact,
        number: validNumber ? `+1${this.selectedContact.number}` : "",
        groups: this.selectedContact.groups.map(g => {
          return {
            id: g.value,
            name: g.label
          };
        })
      };

      const nameRef = this.$refs.name;
      const emailRef = this.$refs.email;
      const phoneRef = this.$refs.phone;

      emailRef.validate();
      nameRef.validate();
      phoneRef.validate();

      if (nameRef.hasError || emailRef.hasError || phoneRef.hasError) {
        return;
      }

      await contactApi.saveContact(payload);
      const index = this.contacts.findIndex(
        c => c.number === payload.number || c.name === payload.name
      );

      if (index >= 0) {
        this.contacts.splice(index, 1, {
          ...this.selectedContact,
          number: payload.number
        });
      } else {
        console.log("load contacts");
        await this.loadContacts(true);
      }

      this.editContactForm = false;
      this.showSuccessMessage("Contact Saved");
    },
    async onExportContacts() {
      const response = await contactApi.exportContacts();
      const currentDate = date.formatDate(new Date(), "MM-DD-YYYY");

      exportFile(`contacts-${currentDate}.xlsx`, response);
    },
    async onImportContacts(file) {
      if (!file) {
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        await contactApi.importContacts(formData);
        await this.loadContacts(true);

        this.showSuccessMessage("Contacts Imported");
      } catch (error) {
        console.error(error);
      } finally {
        this.importFile = null;
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
        ordinalIndex >= this.contactViewState.endIndex
      ) {
        const currentPageIndex = Math.floor(
          (ordinalIndex + 1) / this.contactViewState.pageSize
        );
        const startIndex = currentPageIndex * this.contactViewState.pageSize;
        const endIndex =
          (currentPageIndex + 1) * this.contactViewState.pageSize;

        this.contactViewState.startIndex = startIndex;
        this.contactViewState.endIndex = endIndex;
        await this.loadContacts();
      } else if (direction == "decrease") {
        // nothing to do, we have data in memory
      }
    },
    async onSearch(value) {
      if (value === null) {
        return;
      }

      this.contactViewState.searchTerm = "";
      this.contactViewState.startIndex = 0;
      this.contactViewState.endIndex = this.contactViewState.pageSize;

      if (!this.strIsEmptyOrSpaces(value) && value.length <= 2) {
        return;
      }

      this.contactViewState.searchTerm = value;
      await this.loadContacts(true);
    },
    async onSearchClear(value) {
      this.contactViewState.searchTerm = "";
      this.contactViewState.startIndex = 0;
      this.contactViewState.endIndex = this.contactViewState.pageSize;

      await this.loadContacts(true);
    }
  }
};
</script>

<style scoped>
.groupsDialog {
  max-height: 450px;
}

@media (min-width: 780px) {
  .groupsDialog {
    max-height: 550px;
  }
}
</style>
