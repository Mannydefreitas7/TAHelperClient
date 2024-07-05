<template>
  <q-layout view="lHh Lpr lFf" class="bg-indigo-1">
    <q-page-container id="wrapper">
      <div
        v-if="expired"
        class="center-page column justify-center items-center"
      >
        <div class="column justify-center items-center">
          <q-icon size="130px" name="schedule" color="red-8"></q-icon>
          <h6 class="q-ma-none text-center"><strong>Link Expired</strong></h6>
          <p class="q-ma-none text-center" style="font-size: 17px">
            Please contact your local office for more information
          </p>
        </div>
      </div>

      <div v-show="!expired">
        <div v-if="pinRequired" class="q-pa-md q-gutter-md fixed-top">
          <div class="row justify-center full-width">
            <q-img
              :src="logoUrl"
              style="max-width: 250px"
              basic
              spinner-color="white"
              class="rounded-borders vertical-top"
            />
          </div>
          <form @submit.prevent>
            <q-input
              rounded
              outlined
              v-model.trim="pinCode"
              type="text"
              pattern="[0-9]*"
              label="Please enter your PIN"
              required
            >
              <template v-slot:prepend>
                <q-icon name="dialpad" />
              </template>
              <template v-slot:append>
                <q-btn
                  rounded
                  color="indigo-5"
                  label="Submit"
                  type="submit"
                  @click="fetchData"
                />
              </template>
            </q-input>
            <div class="q-pt-md q-gutter-sm vertical-top">
              <q-banner rounded class="bg-purple-4 text-white">
                <template v-slot:avatar>
                  <q-icon name="policy" color="white" />
                </template>
                <div class="row justify-between">
                  <p class="text-subtitle1 q-mb-none q-mt-xs">
                    {{ this.getDisclaimer() }}
                  </p>
                </div>
              </q-banner>
            </div>
          </form>
        </div>
        <div v-else>
          <q-pull-to-refresh @refresh="refresh">
            <div class="text-h4">
              <strong>{{ name }}</strong>
            </div>
            <div v-if="getCompanyCode() === 'HHHC'" class="text-h5">
              Expiring Authorization
            </div>
            <div v-else-if="getCompanyCode() !== 'TCHH'" class="text-h5">
              Expiring Service Requirements
            </div>

            <div v-else class="text-h5">Orientation Training</div>
            <q-space class="q-pa-sm" />

            <template v-for="(serviceRequirement, index) in sqlRows">
              <q-card>
                <q-card-section
                  v-if="getCompanyCode() !== 'TCHH'"
                  class="q-pa-md"
                >
                  <div class="text-center text-h5 text-bold">
                    {{ serviceRequirement.ServiceRequirementDescription }}
                  </div>
                  <div
                    v-if="getCompanyCode() !== 'TCHH'"
                    class="text-center text-h6 text-bold text-grey"
                  >
                    {{ serviceRequirement.CompanyName }}
                  </div>
                </q-card-section>
                <q-card-section class="q-pa-md">
                  <div v-if="serviceRequirement.QualificationIssuedDate">
                    <strong>Issued:</strong>
                    {{ serviceRequirement.QualificationIssuedDate }}
                  </div>
                  <div>
                    <strong>Expiration:</strong>
                    {{ serviceRequirement.QualificationExpirationDate }}
                  </div>
                </q-card-section>
                <q-card-section
                  class="q-pa-md"
                  v-if="
                    serviceRequirement.ServiceRequirementDescription ==
                      'Inservice Training-First Session'
                  "
                >
                  <component
                    :is="'InserviceTrainingSession1'"
                    :mediaId="mediaId"
                    :acceptMediaType="acceptMediaType"
                    :acceptCapture="acceptCapture"
                    :pinCode="pinCode"
                    :serviceRequirement="serviceRequirement"
                    :employeeId="serviceRequirement.EmployeeID"
                    :firstName="serviceRequirement.FirstName"
                    :lastName="serviceRequirement.LastName"
                    :department="serviceRequirement.DepartmentName"
                  ></component>
                </q-card-section>
                <q-card-section
                  class="q-pa-md"
                  v-if="
                    serviceRequirement.ServiceRequirementDescription ==
                      'CPR Card'
                  "
                >
                  <component
                    :is="'CPRCard'"
                    :mediaId="mediaId"
                    :acceptMediaType="acceptMediaType"
                    :acceptCapture="acceptCapture"
                    :pinCode="pinCode"
                    :serviceRequirement="serviceRequirement"
                  >
                  </component>
                </q-card-section>
                <q-card-section
                  class="q-pa-md"
                  v-if="
                    serviceRequirement.ServiceRequirementDescription ==
                      'Driver\'s License/State Identification'
                  "
                >
                  <component
                    :is="'DriversLicense'"
                    :mediaId="mediaId"
                    :acceptMediaType="acceptMediaType"
                    :acceptCapture="acceptCapture"
                    :pinCode="pinCode"
                    :serviceRequirement="serviceRequirement"
                  >
                  </component>
                </q-card-section>

                <q-card-section
                  class="q-pa-md"
                  v-if="
                    serviceRequirement.ServiceRequirementDescription ==
                      'Hire Compliance Forms'
                  "
                >
                  <component
                    :is="'HireComplianceSession'"
                    :mediaId="mediaId"
                    :acceptMediaType="acceptMediaType"
                    :acceptCapture="acceptCapture"
                    :pinCode="pinCode"
                    :serviceRequirement="serviceRequirement"
                    :employeeId="serviceRequirement.EmployeeID"
                    :firstName="serviceRequirement.FirstName"
                    :lastName="serviceRequirement.LastName"
                    :department="serviceRequirement.DepartmentName"
                  ></component>
                </q-card-section>
                <q-card-section
                  class="q-pa-md"
                  v-if="
                    serviceRequirement.ServiceRequirementDescription ==
                      'Expiring Authorization'
                  "
                >
                  <component
                    :is="'HHHCExpiringAuthorization'"
                    :mediaId="mediaId"
                    :acceptMediaType="acceptMediaType"
                    :acceptCapture="acceptCapture"
                    :pinCode="pinCode"
                    :serviceRequirement="serviceRequirement"
                  >
                  </component>
                </q-card-section>
                <q-card-section
                  class="q-pa-md"
                  v-if="
                    serviceRequirement.ServiceRequirementDescription ==
                      'Hire I-9 Form'
                  "
                >
                  <HireI9Form :mediaId="mediaId" />
                </q-card-section>

                <q-card-section
                  class="q-pa-md"
                  v-if="
                    serviceRequirement.ServiceRequirementDescription ==
                      'Training'
                  "
                >
                  <Training
                    :mediaId="mediaId"
                    :employeeId="serviceRequirement.EmployeeID"
                    :form-data="serviceRequirement.TrainingData" />
                </q-card-section>
              </q-card>
              <q-space class="q-pa-sm" />
            </template>

            <q-card>
              <!-- FOR TESTING ONLY -->
              <!-- <q-card-section class="q-pa-md">
                <component :is="'HireComplianceSession'"
               ></component>
              </q-card-section> -->
            </q-card>
          </q-pull-to-refresh>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import expiringServiceRequirementsApi from "../api/expiringServiceRequirements";
import { date } from "quasar";
import { mainMixin } from "../mixins/index";

import CPRCard from "./ServiceRequirementComponents/CPRCard";
import DriversLicense from "./ServiceRequirementComponents/DriversLicense";
import InserviceTrainingSession1 from "./ServiceRequirementComponents/InserviceTrainingSession1";
import HireComplianceSession from "./ServiceRequirementComponents/HireComplianceSession";
import HHHCExpiringAuthorization from "./ServiceRequirementComponents/HHHCExpiringAuthorization";
import HireI9Form from "./ServiceRequirementComponents/HireI9Form";
import Training from "./ServiceRequirementComponents/Training";

export default {
  name: "ExpiringServiceRequirements",
  mixins: [mainMixin],
  components: {
    CPRCard,
    DriversLicense,
    InserviceTrainingSession1,
    HireComplianceSession,
    HHHCExpiringAuthorization,
    HireI9Form,
    Training,
  },
  async created() {
    this.surveyId = this.$route.params.id;
    this.mediaId = this.$route.params.id;

    const response = await expiringServiceRequirementsApi.getPageData(
      this.surveyId
    );
    this.logoUrl = response.logo;
    this.name = response.name;
    this.subject = response.name;
    this.pinRequired = response.requiresPin;
    this.acceptMediaType = response.data?.acceptMediaType;
    this.acceptCapture = this.acceptMediaType?.startsWith("image")
      ? "environment"
      : null;
  },
  methods: {
    getCompanyCode() {
      return import.meta.env.COMPANY;
    },
    getDisclaimer() {
      return import.meta.env.DISCLAIMER;
    },
    formatSqlData(data) {
      return {
        ...data,
        QualificationIssuedDate: date.formatDate(
          data.QualificationIssued,
          "YYYY-MM-DD"
        ),
        QualificationExpirationDate: date.formatDate(
          data.QualificationExpiration,
          "YYYY-MM-DD"
        )
      };
    },
    async refresh(done) {
      await this.fetchData();
      done();
    },
    async fetchData() {
      try {
        const payload = {
          surveyId: this.surveyId,
          pinCode: this.pinCode
        };

        const response = await expiringServiceRequirementsApi.getExpiringServiceRequirements(
          payload
        );
        this.sqlRows = response.rows.map(this.formatSqlData);
        this.name = response.name;
        this.pageHeader = `${response.subject} - ${response.name}`;
        this.subject = response.subject;
        this.officePhone = response.officePhone;
        this.pinRequired = false;
      } catch (error) {
        if (error.response?.status === 401) {
          console.error("Invalid Pin");
          this.pinRequired = true;
          this.showErrorMessage(
            error.response?.message || "Invalid pin. Please try again"
          );
        }

        console.error(error.response?.message || error);
      }
    }
  },
  data() {
    return {
      expired: false,
      pinRequired: true,
      pinCode: "",
      surveyId: "",
      logoUrl: "",
      subject: "",
      name: "",
      pageHeader: "",
      officePhone: "",
      mediaId: "",
      acceptMediaType: "",
      acceptCapture: "",
      sqlRows: []
    };
  }
};
</script>

<style>
#wrapper {
  margin: auto;
  padding: 5px;
}

#submit-button {
  margin-left: 10px;
}

.center-page {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 800px;
  width: 100vw;
}

canvas {
  z-index: 5000000000;
}
</style>
