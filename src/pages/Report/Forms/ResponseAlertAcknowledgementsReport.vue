<template>
  <div class="row col-12 q-gutter-sm q-pt-sm q-pb-md">
    <div :class="$q.screen.gt.xs ? 'column col' : 'column col-12'">
      <label class="label">Tenants</label>
      <q-select
        dense
        filled
        clearable
        bottom-slots
        emit-value
        map-options
        use-input
        multiple
        use-chips
        :error="selectedTenantIdsError !== null"
        :error-message="selectedTenantIdsError"
        @filter="filterFn"
        :options="availableTenantOptions"
        v-model="selectedTenantIds"
        input-debounce="0"
        @blur="searchTerm = null">
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey text-center">No Data</q-item-section>
          </q-item>
        </template>
      </q-select>

      <label class="label">Phone Numbers (Separated by comma)</label>
      <q-input
        dense
        filled
        type="textarea"
        :error="phoneNumbersError !== null"
        :error-message="phoneNumbersError"
        v-model="phoneNumbers" />

      <label class="label">Names (Separated by comma)</label>
      <q-input
        dense
        filled
        type="textarea"
        :error="namesError !== null"
        :error-message="namesError"
        v-model="names" />

      <label class="label">Office</label>
      <q-input
        dense
        filled
        type="textarea"
        :error="officeError !== null"
        :error-message="officeError"
        v-model="office" />
    </div>

    <div div :class="$q.screen.gt.xs ? 'column col' : 'column col-12'">
      <label class="label">Start Date</label>
      <q-input
        dense
        filled
        :error="startDateError !== null"
        :error-message="startDateError"
        v-model="startDate">
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale" ref="qStartDateProxyRef">
              <q-date today-btn color="primary" v-model="startDate" mask="MM/DD/YY" no-unset
                @update:model-value="$refs.qStartDateProxyRef.hide()">
                <div class="row justify-end">
                  <q-btn
                    label="Close"
                    color="primary"
                    flat
                    v-close-popup />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <label class="label">End Date</label>
      <q-input
        dense
        filled
        :error="endDateError !== null"
        :error-message="endDateError"
        v-model="endDate">
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale" ref="qEndDateProxyRef">
              <q-date today-btn color="primary" v-model="endDate" mask="MM/DD/YY" no-unset
                @update:model-value="$refs.qEndDateProxyRef.hide()">
                <div class="row justify-end">
                  <q-btn
                    label="Close"
                    color="primary"
                    flat
                    v-close-popup />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script>
  import reportApi from "src/api/report";
  import { exportFile } from "quasar";
  import { mainMixin } from "src/mixins/index";

  export default {
    name: "ResponseAlertAcknowledgementsReport",
    mixins: [mainMixin],
    props: {
      reportType: {}
    },
    async mounted() {
      this.onProjectSelected();
      await this.loadTenants();
    },
    computed: {
      availableTenantOptions() {
        return this.tenants.filter(tenant => {
          if (!this.searchTerm || tenant.label.toLowerCase().indexOf(this.searchTerm?.toLowerCase()) > -1) {
            return true;
          }

          return false;
        })
      }
    },
    methods: {
      async loadTenants() {
        const { data } = await axiosInstance.get(`${import.meta.env.BASE_URL}/user/tenants`);
        this.tenants = data.map(tenant => ({
          label: tenant.name,
          value: tenant.id
        }));
      },
      onProjectSelected() {
        return null;
      },
      validateReportParameters() {
        let errors = false;

        this.startDateError = null;
        this.endDateError = null;
        this.selectedTenantIdsError = null;

        if (!this.startDate) {
          this.startDateError = "Start date is required";
          errors = true;
        }

        if (!this.endDate) {
          this.endDateError = "End date is required";
          errors = true;
        }

        if (!this.selectedTenantIds || !this.selectedTenantIds.length) {
          this.selectedTenantIdsError = "One or more tenants are required";
          errors = true;
        }

        return errors;
      },
      getParameters() {
        return {};
      },
      getReportDescription(parameters) {
        let description = "";

        return description;
      },
      filterFn(val, update) {
        update(() => this.searchTerm = val?.toLowerCase());
      },
      async onGenerate() {
        try {
          if (this.validateReportParameters()) {
            return;
          }

          this.loading = true;

          const payload = {
            selectedTenantIds: this.selectedTenantIds,
            startDate: this.startDate,
            endDate: this.endDate,
            phoneNumbers: this.phoneNumbers,
            names: this.names,
            office: this.office,
          }

          const { fileName, file } = await reportApi.responseAlertAcknowledgementsReport(payload);
          exportFile(fileName, file);
        } catch (error) {
          console.error(error.response.data ?? "Unable to generate report");
        } finally {
          this.loading = false;
        }
      },
      fillParameters(parameters) {
        return null;
      },
    },
    data() {
      return {
        loading: false,
        searchTerm: "",
        tenants: [],
        selectedTenantIds: null,
        selectedTenantIdsError: null,
        startDate: this.getDtFormattedWithoutTime(new Date()),
        startDateError: null,
        endDate: this.getDtFormattedWithoutTime(new Date()),
        endDateError: null,
        phoneNumbers: "",
        phoneNumbersError: null,
        names: "",
        namesError: null,
        office: "",
        officeError: null,
      };
    }
  };
</script>

<style lang="scss" scoped>
  .label {
    margin-bottom: 5px;
    color: rgb(116, 116, 116);
    font-weight: 400;
  }
</style>
