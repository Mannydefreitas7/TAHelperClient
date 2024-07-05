<template>
  <div v-if="step === 1">
    <div class="column justify-center items-center no-wrap q-pa-md" style="min-height: 100vh">
      <q-img
        :src="logo"
        basic
        style="width: 90%; max-width: 250px"
        spinner-color="white"
        class="rounded-borders bg-white"
      />
      <q-card flat bordered class="card q-ma-lg" style="width: 100%; max-width: 800px">
        <q-list separator>
          <q-card flat bordered group="forms" class="q-py-sm">
            <q-card-section>
              <div class="text-h6">New Application</div>
            </q-card-section>
            <q-form @submit.prevent="step = 2" greedy class="q-px-md">
              <div
                class="q-pt-sm row items-center justify-start q-col-gutter-md"
              >
                <q-input
                  :rules="[
                    val =>
                      (val && val.length > 0) ||
                      'Please enter your first name'
                  ]"
                  hide-bottom-space
                  outlined
                  dense
                  label="First Name *"
                  v-model="user.firstName"
                  class="col-12 col-sm-3"
                  :disable="isReadonly"
                  debounce="500"
                  @update:model-value="$forceUpdate()"
                ></q-input>
                <q-input
                  outlined
                  dense
                  label="Middle Name"
                  v-model="user.middleName"
                  :disable="isReadonly"
                  class="col-12 col-sm-3"
                  debounce="500"
                  @update:model-value="$forceUpdate()"
                ></q-input>
                <q-input
                  :rules="[
                    val =>
                      (val && val.length > 0) || 'Please enter your last name'
                  ]"
                  hide-bottom-space
                  outlined
                  dense
                  label="Last Name *"
                  :disable="isReadonly"
                  v-model="user.lastName"
                  class="col-12 col-sm-3"
                  debounce="500"
                  @update:model-value="$forceUpdate()"
                ></q-input>
                <q-select
                  outlined
                  dense
                  label="Suffix"
                  :disable="isReadonly"
                  v-model="user.suffix"
                  :options="['Sr.', 'Jr.']"
                  clearable
                  class="col-12 col-sm-3"
                  @update:model-value="$forceUpdate()"
                ></q-select>

                <q-input
                  :rules="[
                    val => (val && val.length > 0) || 'Please select a date'
                  ]"
                  outlined
                  hide-bottom-space
                  dense
                  lazy-rules
                  readonly
                  :model-value="
                    user.hireDate
                      ? getDtFormattedWithoutTime(user.hireDate)
                      : ''
                  "
                  label="Hire/Rehire Date *"
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
                        <q-date
                          v-model="user.hireDate"
                          mask="MM/DD/YYYY"
                          @update:model-value="$forceUpdate()"
                        >
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
                  label="Craft *"
                  :rules="[val => !!val || 'Please select a craft']"
                  hide-bottom-space
                  v-model="user.craftId"
                  :options="craftOptions"
                  :disable="isReadonly || !!$route.query.craft"
                  class="col-12 col-sm-3"
                  @update:model-value="$forceUpdate()"
                ></q-select>

                <q-input
                  outlined
                  dense
                  label="Email *"
                  v-model="user.email"
                  :disable="isReadonly"
                  class="col-12 col-sm-3"
                  debounce="500"
                  @update:model-value="$forceUpdate()"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>

                <q-input
                  outlined
                  dense
                  label="Mobile"
                  v-model="user.number"
                  type="tel"
                  mask="(###) ###-####"
                  :disable="isReadonly"
                  class="col-12 col-sm-3"
                  debounce="500"
                  @update:model-value="$forceUpdate()"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>

                <q-input
                  outlined
                  dense
                  readonly
                  type="number"
                  label="Pay Rate"
                  v-model="user.payRate"
                  class="col-12 col-sm-3"
                  debounce="500"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" />
                  </template>
                </q-input>
              </div>

              <div class="q-my-md row justify-between items-center">
                <q-space />
                <q-btn
                  color="secondary"
                  label="Start Application"
                  type="submit"
                  no-caps
                  unelevated
                ></q-btn>
              </div>
            </q-form>
          </q-card>
        </q-list>
      </q-card>
    </div>
  </div>
  <div v-if="step === 2">
    <q-toolbar class="q-pa-md bg-primary text-white">
      <q-btn
        v-if="isEmployee"
        color="white"
        text-color="black"
        @click="goToIndex"
      >
        <q-icon name="arrow_back" size="20px" class="q-pr-sm"></q-icon>
        Done
      </q-btn>
      <q-img
        v-else
        :src="logo"
        basic
        style="max-width: 250px"
        spinner-color="white"
        class="rounded-borders bg-white"
      />
      <q-space />

      <!--
    notice shrink property since we are placing it
    as child of QToolbar
  -->
      <q-tabs v-model="tab" shrink stretch class=" text-white">
        <q-tab name="general" icon="edit" label="General" />
        <q-tab name="photos" icon="photo" label="Photos" />
        <q-tab name="documents" icon="folder_open" label="Documents" />
      </q-tabs>
    </q-toolbar>

    <q-tab-panels
      v-model="tab"
      animated
      v-if="(!isReadonly && !isEmployee) || (isEmployee && user.id)"
    >
      <q-tab-panel name="general">
        <div class="q-pb-xs row items-center q-gutter-md">
          <q-btn
            v-if="!isReadonly"
            :disable="user.craftId == ''"
            color="secondary"
            label="Submit Application"
            no-caps
            unelevated
            @click="submitApplication"
          ></q-btn>
          <div v-else class="q-my-sm"></div>

          <q-chip
            v-if="isReadonly"
            outline
            square
            color="green"
            label="Application Completed"
          />
          <span v-else style="color: red; font-weight: bold;">
            *All sections must be completed before submitting the application
          </span>
        </div>

        <q-list v-if="allForms" separator>
          <q-card flat bordered group="forms" class="q-py-sm">
            <div class="q-px-md">
              <div
                class="q-pt-sm row items-center justify-start q-col-gutter-md"
              >
                <q-input
                  :rules="[
                    val =>
                      (val && val.length > 0) ||
                      'Please enter your first name'
                  ]"
                  outlined
                  dense
                  hide-bottom-space
                  label="First Name *"
                  v-model="user.firstName"
                  class="col-12 col-sm-3"
                  :disable="isReadonly"
                  debounce="500"
                ></q-input>
                <q-input
                  outlined
                  dense
                  label="Middle Name"
                  v-model="user.middleName"
                  :disable="isReadonly"
                  class="col-12 col-sm-3"
                  debounce="500"
                ></q-input>
                <q-input
                  :rules="[
                    val =>
                      (val && val.length > 0) || 'Please enter your last name'
                  ]"
                  outlined
                  dense
                  hide-bottom-space
                  label="Last Name *"
                  :disable="isReadonly"
                  v-model="user.lastName"
                  class="col-12 col-sm-3"
                  debounce="500"
                ></q-input>
                <q-select
                  outlined
                  dense
                  label="Suffix"
                  :disable="isReadonly"
                  v-model="user.suffix"
                  :options="['Sr.', 'Jr.']"
                  clearable
                  class="col-12 col-sm-3"
                ></q-select>

                <q-input
                  :rules="[
                    val => (val && val.length > 0) || 'Please select a date'
                  ]"
                  outlined
                  hide-bottom-space
                  dense
                  lazy-rules
                  readonly
                  :model-value="
                    user.hireDate
                      ? getDtFormattedWithoutTime(user.hireDate)
                      : ''
                  "
                  label="Hire/Rehire Date *"
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
                        <q-date v-model="user.hireDate" mask="MM/DD/YYYY">
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
                  label="Craft *"
                  hide-bottom-space
                  :rules="[val => !!val || 'Please select a craft']"
                  v-model="user.craftId"
                  :options="craftOptions"
                  :disable="isReadonly"
                  class="col-12 col-sm-3"
                ></q-select>

                <q-input
                  outlined
                  dense
                  label="Email *"
                  v-model="user.email"
                  :disable="isReadonly"
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
                  v-model="user.number"
                  type="tel"
                  mask="(###) ###-####"
                  :disable="isReadonly"
                  class="col-12 col-sm-3"
                  debounce="500"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>

              <div class="q-py-md row items-center q-gutter-md">
                <q-btn
                  v-if="isEmployee"
                  color="primary"
                  label="Export New Hire Package"
                  icon="description"
                  no-caps
                  unelevated
                  :disable="!isValidEmail(user.email)"
                  @click="generateReport"
                ></q-btn>
              </div>
            </div>
          </q-card>
          <q-expansion-item
            v-for="(form, index) in filteredForms"
            :key="form.id"
            switch-toggle-side
            group="forms"
            :ref="expansionItems"
          >
            <template v-slot:header>
              <q-item-section
                class="text-weight-medium text-uppercase non-selectable"
              >
                {{ form.title }}
              </q-item-section>

              <q-item-section side v-if="getFormStatus(form)">
                <q-chip
                  outline
                  square
                  :color="
                    getFormStatus(form) == 'completed' ? 'green' : 'orange'
                  "
                  :label="getFormStatus(form)"
                />
              </q-item-section>
            </template>
            <q-card>
              <q-card-section>
                <component
                  :is="form.component"
                  :user="user"
                  @onChange="onFormChange"
                  @onComplete="openFormByIndex(index + 1)"
                />
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>

        <div class="q-py-md row justify-between items-center q-gutter-md">
          <q-btn
            v-if="!isReadonly"
            :disable="user.craftId == ''"
            color="secondary"
            label="Submit Application"
            no-caps
            unelevated
            @click="submitApplication"
          ></q-btn>
          <q-btn
            v-if="isEmployee"
            color="red"
            :label="user.archived ? 'Archived' : 'Archive'"
            no-caps
            :disable="user.archived"
            unelevated
            @click="archiveApplication"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="photos">
        <hire-documents
          type="photo"
          :user="user"
          :is-employee="isEmployee"
          @onChange="onFormChange"
        ></hire-documents>
      </q-tab-panel>
      <q-tab-panel name="documents">
        <hire-documents
          type="document"
          :user="user"
          :is-employee="isEmployee"
        ></hire-documents>
      </q-tab-panel>
    </q-tab-panels>

    <div
      v-if="isReadonly"
      class="text-h6 text-center q-ma-xl"
      style="color: green"
    >
      {{ user.firstName }} {{ user.lastName }} - Application submitted
      successfully!
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import {
  getLogo,
  createHire,
  exportNewHirePackage,
  getHire,
  updateHire,
  getCrafts,
  getTenantIdByName,
} from "../../api/hire";
import { forms } from "../../components/Forms";
import { date, exportFile } from "quasar";
import { mainMixin } from "../../mixins/index";

import HireDocuments from "./HireDocuments.vue";
import SignaturesForm from "src/components/Forms/SignaturesForm.vue";

export default {
  name: "HireFormsPageA",
  mixins: [mainMixin],
  components: {
    HireDocuments,
    SignaturesForm
  },
  watch: {
    activeTenant: {
      immediate: true,
      async handler(newValue) {
        try {
          this.isEmployee = this.$route.path.indexOf("/NewHireForms") > -1;
          if (this.isEmployee && !newValue) {
            await this.loadCurrentUser();
          }

          let tenantId = this.$route.query.tid || newValue?.id;
          if (!tenantId) {
            tenantId = await getTenantIdByName(this.$route.query.tenant);
          }
          if (!tenantId) {
            return;
          }

          let openedInProgressForm = false;

          const employeeId = this.$route.params.id;
          if (this.isEmployee && employeeId) {
            const data = await getHire(employeeId);
            this.user = data;
          } else {
            this.step = 1;
          }

          this.crafts = await getCrafts(tenantId);
          const craftName = this.$route.query.craft || this.$route.params.craftName;
          if (craftName && !this.isEmployee) {
            const foundCraft = this.crafts.find(
              craft => craft.name.toLowerCase() === craftName.toLowerCase()
            );
            this.user.craftId = foundCraft?.id;
          }

          const keys = [
            "firstName",
            "middleName",
            "lastName",
            "suffix",
            "hireDate",
            "craftId",
            "email",
            "number",
            "payRate",
          ];
          for (const key of keys) {
            const value = this.$route.query[key];
            if (value) {
              this.user[key] = key === "craftId" ? parseInt(value) : value;
            }
          }

          const userData = JSON.parse(this.user.data);
          if (
            userData.findIndex(f => f.formName === SignaturesForm.name) === -1
          ) {
            userData.push({
              formName: SignaturesForm.name,
              status: "in-progress"
            });
            this.user.data = JSON.stringify(userData);
            await updateHire(this.user);
          }

          if (!this.isEmployee) {
            this.logo = (await getLogo(tenantId)).logo;
          }

          this.refreshForms();
          if (!openedInProgressForm && JSON.parse(this.user.data).length > 0) {
            this.openInProgressForm();
            openedInProgressForm = true;
          }
        } catch (error) {
          console.error("Unable to load data: ", error);
        }
      },
      deep: true
    },
    user: {
      deep: true,
      async handler(newValue, prevValue) {
        if (!newValue.id && !!prevValue.id) {
          return;
        }

        if (newValue.craftId) {
          const userData = JSON.parse(this.user.data);
          const craft = this.crafts.find(({ id }) => id === newValue.craftId);
          if (craft) {
            craft.forms.split(",").forEach(async formName => {
              if (userData.findIndex(f => f.formName === formName) === -1) {
                userData.push({
                  formName: formName,
                  status: "in-progress"
                });
              }
            });

            newValue.data = JSON.stringify(userData);
          }
        }

        if (!newValue.id) {
          this.refreshForms();
          return;
        }

        if (!newValue.status || newValue.status == "in-progress") {
          this.user.status = "in-progress";
          await updateHire(newValue);
        } else {
          await updateHire(newValue);
        }

        this.refreshForms();
      }
    }
  },
  computed: {
    ...mapState(useTenantStore, {
      activeTenant: "activeTenant",
      currentUser: "user",
    }),
    isReadonly() {
      return (
        ["completed", "hired", "not hired"].includes(this.user.status) &&
        !this.isEmployee
      );
    },
    filteredForms() {
      return this.allForms;
    },
    craftOptions() {
      return this.crafts.map(craft => ({
        label: craft.name,
        value: craft.id
      }));
    }
  },
  methods: {
    ...mapActions(useTenantStore, ["loadCurrentUser"]),
    refreshForms() {
      const { craftId } = this.user;
      const craft = this.crafts.find(craft => craft.id === craftId);
      if (!craft) {
        return;
      }


      const _forms = forms.filter(f => craft.forms.split(",").some(s => s === f.name));
      _forms.sort((a, b) => {
        return a.index - b.index;
      });
      this.allForms = _forms;
    },
    getFormStatus(form) {
      if (!this.user.data) {
        return null;
      }

      const currentForms = JSON.parse(this.user.data);
      if (currentForms.length > 0) {
        const _forms = currentForms.filter(f => f.formName == form.name);
        if (_forms.length > 0) {
          return _forms[0].status;
        }
      }
      return null;
    },
    openFormByIndex(index) {
      if (!!this.$refs.signatureForm && index >= this.expansionItems.length) {
        this.$refs.signatureForm.show();
        return;
      }

      var expansionItem = this.expansionItems[index];

      if (!!expansionItem) {
        expansionItem.show();
      }
    },
    isValidated() {
      if (!this.user.data) {
        return null;
      }

      const currentForms = JSON.parse(this.user.data);
      if (this.isValidEmail(this.user.email) && currentForms) {
        const filteredFormsWithStatus = this.filteredForms.map(f => {
          const payload = {
            ...f
          };
          currentForms.forEach(cf => {
            if (cf.formName == f.name) {
              payload.status = cf.status;
            }
          });

          return payload;
        });

        // check all visible forms are completed and manually check SignaturesForm
        return (
          filteredFormsWithStatus.filter(f => f.status != "completed") == 0 &&
          this.getFormStatus({ name: "SignaturesForm" }) == "completed"
        );
      }

      return false;
    },
    isValidEmail(value) {
      return /^[^@]+@\w+(\.\w+)+\w$/.test(value);
    },
    goToIndex() {
      this.$router.replace("/HR");
    },
    openInProgressForm() {
      let inProgressFormIdx = this.allForms.findIndex(
        f => this.getFormStatus(f) === "in-progress"
      );
      if (inProgressFormIdx < 0) {
        inProgressFormIdx = 0;
      }

      this.openFormByIndex(inProgressFormIdx);
    },
    async generateReport() {
      try {
        let id = this.user.id;

        const craft = this.crafts.find(craft => craft.id === this.user.craftId);
        const formattedHireDate = date.formatDate(
          this.user.hireDate,
          "MM-DD-YYYY"
        );
        const fileName = `${this.user.firstName}_${this.user.lastName}_${craft.name}_${formattedHireDate}.zip`;
        const response = await exportNewHirePackage(id);
        exportFile(fileName, response.file);
      } catch (error) {
        console.error(error);
      }
    },
    async onFormChange(value) {
      if (!this.isEmployee) {
        this.user = value;
        return;
      }

      const response = await updateHire(value);
      this.user = response;
    },
    async submitApplication() {
      if (!this.isValidated()) {
        this.$q.notify({
          position: "top",
          type: "negative",
          message: "Please complete all sections before submitting"
        });
        return;
      }

      this.user = {
        ...this.user,
        status: "completed",
        archived: false
      };

      if (!this.user.id) {
        this.user = await createHire({
          ...this.user,
          tenantId: this.$route.query.tid
        });
      }

      this.$q.notify({
        position: "top",
        type: "positive",
        message: "Application completed!"
      });
    },
    async archiveApplication() {
      this.user = {
        ...this.user,
        archived: true,
        status: "archived",
        updatedAt: new Date(),
        updatedBy: this.isEmployee ? this.currentUser.userName : "hire"
      };
      this.$router.back();
    }
  },
  data: () => ({
    date,
    step: 2,
    logo: "",
    allForms: [],
    companyOptions: [],
    user: { data: "[]" },
    isEmployee: true,
    tab: "general",
    crafts: [],
    employee: null,
    previousNewHire: {},
    showUseDriverSupplementalFormDialog: false,
    expansionItems: []
  })
};
</script>
