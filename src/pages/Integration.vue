<template>
  <q-layout view="lHh lpR lff" container class="full-width" style="height: calc(100vh - 50px)">
    <q-drawer v-model="navOpen" :width="380" show-if-above bordered :breakpoint="690">
      <q-scroll-area class="fit">
        <div class="row justify-between q-px-md q-pt-sm q-mb-sm">
          <span class="text-h5 text-weight-bold">Integrations</span>
          <q-btn flat color="primary" icon="add" label="Create" @click="createIntegration()" />
        </div>

        <q-toolbar>
          <q-input
            dense
            filled
            v-model="searchTerm"
            placeholder="Search"
            debounce="400"
            class="full-width no-border no-outline rounded-borders"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-toolbar>

        <div v-for="(integration, index) in availableIntegrations" :key="index">
          <q-item
            clickable
            v-ripple
            @click="
              () => {
                selectedIntegration = { ...integration };
                clearSelected();
                editForm = false;
              }
            "
            :active="integration.id === selectedIntegration.id"
            active-class="bg-grey-3"
          >
            <q-item-section>
              <q-item-label lines="3">{{ integration.name }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="fit">
      <q-page class="fit">
        <q-scroll-area
          class="q-pa-none bg-white"
          style="height: calc(100vh - 50px);"
          content-active-style="width: 100%;"
          content-style="width: 100%;"
        >
          <q-toolbar class="text-black">
            <q-item class="q-subtitle-1 q-pl-md">
              <q-item-section>
                <q-item-label lines="1">
                  {{ selectedIntegration.name }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-space />
            <q-item-section side>
              <div class="row">
                <q-btn
                  v-if="editForm"
                  label="CANCEL"
                  color="red"
                  unelevated
                  @click="editForm = false"
                  style="margin-right: 15px;"
                ></q-btn>
                <q-btn
                  v-if="editForm"
                  label="SAVE"
                  unelevated
                  color="primary"
                  @click="onSubmit()"
                ></q-btn>
              </div>
              <q-btn-dropdown
                v-if="!editForm"
                dense
                flat
                dropdown-icon="more_vert"
              >
                <q-list>
                  <q-item clickable v-ripple @click="editForm = true">
                    <q-item-section avatar>
                      <q-avatar
                        icon="create"
                        color="secondary"
                        text-color="white"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Edit</q-item-label>
                      <q-item-label caption
                        >Change this integration</q-item-label
                      >
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-ripple @click="confirmDelete = true">
                    <q-item-section avatar>
                      <q-avatar
                        icon="delete"
                        color="negative"
                        text-color="white"
                      />
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
          <q-item>
            <q-item-section>
              <q-input
                ref="name"
                :disable="!editForm"
                filled
                class="q-pb-sm"
                v-model="selectedIntegration.name"
                label="Name *"
                lazy-rules
                :rules="[
                  value => value !== '' || 'Name is a required field',
                  value =>
                    !integrations.some(
                      i =>
                        i.name.trim() === value.trim() &&
                        i.id !== selectedIntegration.id
                    ) || 'Name already exists'
                ]"
              >
              </q-input>
              <q-select
                :disable="!editForm"
                filled
                v-model="selectedIntegration.databaseType"
                :options="databaseTypeOptions"
                emit-value
                map-options
                lazy-rules
                class="q-pb-sm"
                label="Database Type"
              />
              <q-expansion-item
                default-closed
                dense
                class="bg-grey-3 text-black"
                icon="info"
                label="Fields"
              >
                <q-card>
                  <q-card-section class="q-py-sm">
                    <ul>
                      <li>
                        <strong>Employee</strong
                        ><span class="text-red"> (* required)</span>
                        <ul>
                          <li>This is the recipient name</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Phone</strong>
                        <ul>
                          <li>Required if contact method is text or both</li>
                        </ul>
                      </li>
                      <li>
                        <strong>EmailAddr</strong>
                        <ul>
                          <li>Required if contact method is email or both</li>
                        </ul>
                      </li>
                      <li>
                        <strong>ContactMethod</strong>
                        <ul>
                          <li>Options are Text, Email, Both, or None</li>
                        </ul>
                      </li>
                      <li>
                        <strong>ListFilter & ListFilter2</strong>
                        <ul>
                          <li>
                            These values will be forwarded to a list command
                            from a
                            <span class="text-red">sender integration</span>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <strong>ActionFilter & ActionFilter2</strong>
                        <ul>
                          <li>
                            These values will be forwarded to a sender action
                            command from a
                            <span class="text-red">list integration</span>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <strong>ConvertRtfToHtml</strong>
                        <ul>
                          <li>
                            'column_name' as ConvertRtfToHtml. column_name's
                            value will be converted to HTML
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <!-- <div class="row full-width">
                  <q-card flat no-margin no-padding>
                    <pre style="white-space: pre-line; margin-bottom: 0">
                      <q-banner class="bg-grey-3 text-black q-pa-none" dense>Required Fields (Only if using integration for recipients)</q-banner><code v-pre class="full-width"><strong>Employee</strong> (recipient name)
                      <strong>Phone</strong> (mobile number)
                      <strong>EmailAddr</strong> (email address)
                      <strong>ContactMethod</strong> (Text, Email, Both, or None)
                      </code>
                    </pre>
                  </q-card>
                </div> -->
              <div class="row justify-between">
                <div class="row">
                  <q-btn
                    color="green"
                    unelevated
                    icon="play_arrow"
                    label="Execute"
                    class="q-pr-sm q-my-sm"
                    dense
                    @click="testSqlConnection()"
                  />
                  <p
                    class="text-subtitle2 text-grey-6 q-ma-none q-ml-sm"
                    style="margin-top: 14px"
                  >
                    Query Command
                  </p>
                </div>

                <q-btn
                  color="primary"
                  icon="description"
                  label="Export"
                  class="q-pr-sm q-my-sm"
                  dense
                  unelevated
                  @click="exportSqlData()"
                />
              </div>
              <div :class="[editForm ? normalClass : readOnlyClass]">
                <codemirror
                  v-model:value="selectedIntegration.sqlCommand"
                  :options="codeMirrorOptions"
                  :border="false"
                  original-style
                />
              </div>
            </q-item-section>
          </q-item>
          <q-item v-if="this.sqlData.length > 0" class="text-grey">
            <q-banner
              dense
              inline-actions
              class="text-white bg-grey-8"
              style="width: 100%"
            >
              Showing first 5 of {{ totalRows }} rows
            </q-banner>
          </q-item>
          <q-item
            v-if="this.sqlData.length > 0 && this.activeTenant.connectionString"
          >
            <q-item-section>
              <q-table
                style="width:100%"
                :rows-per-page-options="[]"
                dense
                separator="cell"
                :rows="sqlData"
                :columns="sqlColumns"
              />
            </q-item-section>
          </q-item>
          <q-item v-if="this.sqlError" class="text-red">
            <q-banner
              dense
              inline-actions
              class="text-white bg-red"
              style="width: 100%"
            >
              {{ sqlError }}
            </q-banner>
          </q-item>
          <q-item>
            <q-item-section>
              <q-input
                ref="actionLabel"
                :disable="!editForm"
                filled
                v-model="selectedIntegration.actionLabel"
                label="Action Label"
                lazy-rules
                class="q-pb-sm"
                maxlength="25"
              />
              <div class="row justify-start">
                <q-btn
                  color="green"
                  unelevated
                  icon="play_arrow"
                  label="Execute"
                  class="q-pr-sm q-my-sm"
                  dense
                  @click="testActionCommand()"
                />
                <p
                  class="text-subtitle2 text-grey-6 q-ma-none q-ml-sm"
                  style="margin-top: 14px"
                >
                  Action Command
                </p>
              </div>
              <div :class="[editForm ? normalClass : readOnlyClass]">
                <codemirror
                  v-model:value="selectedIntegration.actionCommand"
                  :options="codeMirrorOptions"
                  :border="false"
                  original-style
                />
              </div>
            </q-item-section>
          </q-item>
          <q-item v-if="this.actionCommandError">
            <q-banner
              dense
              inline-actions
              class="text-white bg-red"
              style="width: 100%"
            >
              {{ actionCommandError }}
            </q-banner>
          </q-item>
          <q-item v-if="this.actionCommandSuccess">
            <q-banner
              dense
              inline-actions
              class="text-white bg-green"
              style="width: 100%"
            >
              {{ actionCommandSuccess }}
            </q-banner>
          </q-item>
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

    <q-dialog v-model="confirmDelete" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="red" text-color="white" />
          <span class="q-ml-sm">
            Are you sure you want to delete this integration?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Delete"
            color="red"
            v-close-popup
            @click="
              onDelete();
              editForm = false;
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import integrationApi from "../api/integration";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import { mainMixin } from "../mixins/index";
import { exportFile } from "quasar";

import codemirror from "codemirror-editor-vue3";
import "codemirror/addon/display/placeholder.js";
import "codemirror/mode/sql/sql.js";
import "codemirror/theme/mbo.css";

export default {
  name: "Integration",
  components: { codemirror },
  mixins: [mainMixin],
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"]),
    availableIntegrations() {
      return this.integrations.filter(
        integration => !this.searchTerm
                    || integration.name?.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);
    },
    editIcon: function() {
      return this.editForm ? "lock_open" : "lock";
    }
  },
  data() {
    return {
      navOpen: false,
      confirmDelete: false,
      editForm: false,
      searchTerm: null,
      normalClass: "code-editor",
      readOnlyClass: "code-editor-readonly",
      codeMirrorOptions: {
        tabSize: 2,
        mode: "text/x-mssql",
        theme: "mbo",
        lineNumbers: true,
        styleActiveLine: true,
        line: true,
        readOnly: true,
        cursorBlinkRate: -1
      },
      tab: "all",
      size: {},
      sqlData: [],
      sqlColumns: [],
      totalRows: 0,
      sqlError: null,
      actionCommandError: null,
      actionCommandSuccess: null,
      emptyIntegration: {
        id: null,
        name: "",
        sqlCommand: "",
        databaseType: 0,
        actionLabel: "Express Interest",
        actionCommand: ""
      },
      integrations: [],
      selectedIntegration: {},
      databaseTypeOptions: [
        {
          label: 'SQL',
          value: 0
        },
        {
          label: 'Snowflake',
          value: 1
        },
      ]
    };
  },
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        await this.loadIntegrations();
      },
      deep: true
    },
    editForm: {
      handler(val) {
        this.codeMirrorOptions = {
          ...this.codeMirrorOptions,
          readOnly: val ? null : true,
          cursorBlinkRate: val ? 530 : -1
        };
      }
    }
  },
  methods: {
    onResize(size) {
      this.size = size;
    },
    clearSelected() {
      this.sqlData = [];
      this.sqlColumns = [];
      this.totalRows = 0;
      this.sqlError = "";

      this.$refs.name.resetValidation();
      this.actionCommandSuccess = null;
    },
    createIntegration() {
      this.clearSelected();
      this.selectedIntegration = { ...this.emptyIntegration };
      this.editForm = true;
    },
    async onDelete() {
      const response = await integrationApi.deleteIntegration(
        this.selectedIntegration.id
      );
      this.integrations = response || [];

      if (this.integrations.length > 0) {
        this.selectedIntegration = { ...this.integrations[0] };
      } else {
        this.clearSelected();
        this.selectedIntegration = { ...this.emptyIntegration };
      }

      this.$q.notify({
        color: "green-4",
        textColor: "white",
        icon: "cloud_done",
        position: "top",
        message: "Integration Deleted"
      });
    },
    async loadIntegrations() {
      const response = await integrationApi.findIntegrations();
      this.integrations = response || [];

      if (this.integrations.length > 0) {
        this.selectedIntegration = { ...this.integrations[0] };
      } else {
        this.clearSelected();
      }
    },
    async onSubmit() {
      if (
        !this.selectedIntegration.name ||
        this.selectedIntegration.name.trim() === "" ||
        this.integrations.some(
          i =>
            i.name.trim() === this.selectedIntegration.name.trim() &&
            i.id !== this.selectedIntegration.id
        )
      ) {
        return;
      }

      const payload = this.selectedIntegration;
      const nameRef = this.$refs.name;

      nameRef.validate();

      if (!nameRef.hasError) {
        const response = await integrationApi.saveIntegration(payload);
        this.integrations = response;

        this.editForm = false;
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          position: "top",
          message: "Integration Saved"
        });

        if (this.selectedIntegration != null) {
          this.selectedIntegration = {
            ...response.find(f => f.name === this.selectedIntegration.name)
          };
        }
      }
    },
    async testSqlConnection() {
      const payload = this.selectedIntegration;

      if (!payload.sqlCommand) {
        return;
      }

      try {
        const response = await integrationApi.testSqlQuery(payload);
        this.sqlData = response.data || [];
        this.sqlColumns = response.columns || [];
        this.totalRows = response.total || 0;
        this.sqlError = response.errorMessage;
      } catch (error) {
        console.log(error);
        this.clearSelected();
        this.sqlError = error.response.data.errorMessage;
      }
    },
    async testActionCommand() {
      const payload = this.selectedIntegration;

      if (!payload.actionCommand) {
        return;
      }

      try {
        const response = await integrationApi.testSqlAction(payload);
        this.actionCommandSuccess =
          "Success " + response.affectedRows + " rows were affected";
        this.actionCommandError = response.errorMessage;
      } catch (error) {
        this.clearSelected();
        this.actionCommandError = error.response.data.errorMessage;
      }
    },
    async exportSqlData() {
      const payload = this.selectedIntegration;

      if (!payload.sqlCommand) {
        return;
      }

      try {
        const { fileName, file } = await integrationApi.exportSqlData(payload);
        exportFile(fileName, file);
        this.sqlError = null;
      } catch (error) {
        console.error(error);
        this.clearSelected();
        this.sqlError = await new Response(error.response.data).text();
      }
    }
  }
};
</script>

<style scoped>
.code-editor {
  border: 0.4em solid #4caf50 !important;
  max-width: 100%;
}

.code-editor-readonly {
  border: 0.4em solid grey;
  max-width: 100%;
}
</style>
