<template>
  <q-scroll-area class="q-pa-none bg-white" style="height: calc(100vh - 50px)">
    <q-card-section>
      <span class="text-h5 text-weight-bold">Reports</span>
    </q-card-section>

    <q-separator />

    <q-card-section class="row">
      <div class="col-xs-12 col-sm-4">
        <q-input
          dense
          filled
          label="Search"
          class="q-mr-lg"
          v-model="searchTerm"
        >
          <template v-slot:prepend>
            <q-icon name="search"></q-icon>
          </template>
        </q-input>
        <p class="q-mt-md text-grey-8">See all available reports to run.</p>
      </div>

      <div class="col-xs-12 col-sm-8">
        <q-card
          v-for="(group, idx) in filteredAvailableReports"
          :key="idx"
          class="q-mb-lg"
        >
          <q-card-section class="bg-grey-2">
            <p style="font-size: 17px" class="q-ma-none">{{ idx }}</p>
          </q-card-section>

          <q-separator />

          <q-list separator>
            <q-item v-for="(report, idx2) in group" :key="idx2">
              <q-item-section avatar>
                <q-icon class="text-blue-grey-9" name="post_add" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-grey-8">{{
                  addSpaceBetweenCapitals(report)
                }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  no-caps
                  color="primary"
                  unelevated
                  label="Go To Report"
                  @click="goToReport(report)"
                ></q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </q-card-section>
  </q-scroll-area>
</template>

<script>
import { availableReports } from "src/lib/shared.js";

export default {
  name: "ReportingScreen",
  computed: {
    filteredAvailableReports() {
      const results = {};
      Object.keys(availableReports).forEach(key => {
        const filteredReports = availableReports[key].filter(group => {
          if (group === "ExpiringServiceRequirementReport" && import.meta.env.COMPANY !== "AHC") {
            return false;
          }

          return this.searchFor(group);
        });
        if (filteredReports.length > 0) results[key] = filteredReports;
      });
      return results;
    }
  },
  methods: {
    addSpaceBetweenCapitals(s) {
      return s ? s.replace(/([A-Z][a-z])/g, " $1").trim() : s;
    },
    goToReport(report) {
      this.$router.replace(`/Report/${report.trim().toLowerCase()}`);
    },
    searchFor(name) {
      return (
        this.searchTerm == null ||
        this.addSpaceBetweenCapitals(name)
          .toLowerCase()
          .indexOf(this.searchTerm.toLowerCase()) >= 0
      );
    }
  },
  data: function() {
    return {
      loading: true,
      searchTerm: ""
    };
  }
};
</script>
