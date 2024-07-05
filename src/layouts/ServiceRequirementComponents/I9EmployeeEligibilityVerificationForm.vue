<template>
  <q-form ref="myForm">
    <q-card flat bordered class="q-my-md">
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <q-input
            :disable="isComplete"
            :rules="[
              val => (val && val.length > 0) || 'Please enter your first name'
            ]"
            hide-bottom-space
            outlined
            dense
            label="First Name *"
            v-model="data.about.firstName"
            class="col-12 col-sm-3"
            debounce="500"
            @update:model-value="$forceUpdate()"
          ></q-input>
          <q-input
            :disable="isComplete"
            outlined
            dense
            label="Middle Name"
            v-model="data.about.middleName"
            class="col-12 col-sm-3"
            debounce="500"
            @update:model-value="$forceUpdate()"
          ></q-input>
          <q-input
            :disable="isComplete"
            :rules="[
              val => (val && val.length > 0) || 'Please enter your last name'
            ]"
            hide-bottom-space
            outlined
            dense
            label="Last Name *"
            v-model="data.about.lastName"
            class="col-12 col-sm-3"
            debounce="500"
            @update:model-value="$forceUpdate()"
          ></q-input>
          <q-input
            mask="##/##/####"
            :rules="[val => (val && val.length > 0) || 'Please enter date']"
            outlined
            hide-bottom-space
            readonly
            dense
            v-model="data.about.birthDate"
            label="Birth Date *"
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
                  <q-date v-model="data.about.birthDate" mask="MM/DD/YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input
            hide-bottom-space
            :disable="isComplete"
            :rules="[
              val =>
                (val && val.length > 0) || 'Please enter social security number'
            ]"
            dense
            outlined
            v-model="data.about.ssn"
            label="Social Security Number *"
            mask="###-##-####"
            class="col-12 col-sm-3"
          ></q-input>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <q-input
            :disable="isComplete"
            :rules="[val => (val && val.length > 0) || 'Please enter address']"
            hide-bottom-space
            outlined
            dense
            v-model="data.physical.address"
            label="Home Address"
            class="col-12 col-sm-4"
          >
            <template v-slot:prepend>
              <q-icon name="map" />
            </template>
          </q-input>
          <q-input
            :disable="isComplete"
            :rules="[val => (val && val.length > 0) || 'Please enter city']"
            outlined
            dense
            hide-bottom-space
            v-model="data.physical.city"
            label="City"
            class="col-12 col-sm-3"
          />
          <q-select
            :disable="isComplete"
            :rules="[
              val => (val && val.length > 0) || 'Please enter first name'
            ]"
            dense
            outlined
            autocomplete
            hide-bottom-space
            v-model="data.physical.state"
            :options="usStates"
            label="State"
            class="col-12 col-sm-2"
            debounce="500"
          />
          <q-input
            outlined
            dense
            hide-bottom-space
            :disable="isComplete"
            :rules="[val => (val && val.length > 0) || 'Please enter ZIP']"
            v-model="data.physical.zip"
            mask="#####"
            type="number"
            label="ZIP"
            class="col-12 col-sm-3"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-banner
      :inline-actions="$q.screen.gt.xs"
      rounded
      class="bg-orange-3 text-black q-mb-md"
    >
      You are REQUIRED to SUBMIT AT LEAST ONE FORM of IDENTIFICATION DOCUMENTS
      to be in accordance with I-9 employment requirements.
      <template v-slot:action>
        <a
          href="https://www.uscis.gov/sites/default/files/document/forms/i-9.pdf"
          target="_blank"
          class="q-btn q-btn-item non-selectable no-outline q-btn--flat q-btn--rectangle q-btn--actionable q-focusable q-hoverable"
        >
          View Form
        </a>
      </template>
    </q-banner>

    <div class="row justify-end q-pa-md">
      <q-file
        ref="newFilePickerRef"
        style="visibility: hidden; height: 10px"
        accept="image/*"
        label=""
        @update:model-value="uploadPhoto"
      />
      <q-btn
        :disable="isComplete || photos.length >= 2"
        icon="camera_alt"
        color="primary"
        label="Take Photo"
        no-caps
        @click="$refs.newFilePickerRef.pickFiles()"
      />
    </div>

    <q-table
      flat
      bordered
      :rows="photos"
      :columns="columns"
      separator="none"
      row-key="name"
      :grid="$q.screen.lt.sm"
      :pagination="pagination"
      binary-state-sort
      no-data-label="No Photos"
    >
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
          :props="props"
          @click="downloadFile(props.row)"
        >
          <q-td key="fileName" :props="props">
            <span>{{ props.row.fileName }}</span>
          </q-td>
          <q-td key="createdDateTime" :props="props">
            <span>
              {{ getDtFormattedWithoutTime(props.row.createdDateTime) }}
            </span>
          </q-td>
          <q-td key="createdBy" :props="props">
            <span>{{ props.row.createdBy }}</span>
          </q-td>
          <q-td key="fileSize" :props="props">
            <span v-if="props.row.fileSize">{{
              format.humanStorageSize(props.row.fileSize)
            }}</span>
          </q-td>
          <q-td key="actions" :props="props">
            <div class="row justify-end">
              <q-btn
                :disable="isComplete"
                icon="delete"
                color="red"
                dense
                @click.stop="photoToDelete = props.row"
              ></q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <p class="text-body2 q-mb-sm text-red" v-if="data.photoValidationError">
      You are REQUIRED to SUBMIT AT LEAST ONE FORM of IDENTIFICATION DOCUMENTS
      to be in accordance with I-9 employment requirements.
    </p>

    <q-dialog :model-value="!!photoToDelete" @update:model-value="photoToDelete = null" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center">
          <q-avatar
            round
            size="lg"
            color="red-8"
            text-color="white"
            icon="delete"
          />

          <div class="q-ml-md">
            <div class="full-width text-h6" style="line-height: 1em">
              Delete
            </div>
          </div>

          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="text-subtitle1">
          Are you sure you want to delete this photo?
        </q-card-section>

        <q-card-actions class="bg-grey-2 q-pa-md" align="between">
          <q-btn
            color="grey-8"
            text-color="white"
            no-caps
            label="Cancel"
            style="width: 90px"
            v-close-popup
          />
          <q-btn
            color="red-8"
            text-color="white"
            no-caps
            label="Delete"
            style="width: 90px"
            @click="deletePhoto"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <p class="text-body2 q-mb-sm q-mt-lg">
      I am aware that federal law provides for imprisonment and/or fines for false statements,
      or the use of false documents, in connection with the completion of this form.
      I attest, under penalty of perjury, that this information, including my selection of
      the box attesting to my citizenship or immigration status, is true and correct.
    </p>

    <p class="text-body2 q-mb-sm">
      I attest, under penalty of perjury, that I am (check one of the following
      boxes):
    </p>

    <q-option-group
      :disable="isComplete"
      v-model="data.question1"
      :options="attestationOptions"
      color="primary"
    />

    <div class="row q-col-gutter-md q-my-sm">
      <q-input
        v-if="data.question1 === '4'"
        :disable="isComplete"
        outlined
        dense
        v-model="data.workExpiryDate"
        label="Expiry date, if any"
        class="col-12 col-sm-3"
      >
        <template #prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
              >
              <q-date v-model="data.workExpiryDate" mask="MM/DD/YYYY">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        v-if="data.question1 === '3' || data.question1 === '4'"
        :disable="isComplete"
        outlined
        dense
        v-model="data.aNumber"
        label="USCIS or A-Number"
        class="col-12 col-sm-3"
      />

      <q-input
        v-if="data.question1 === '4'"
        :disable="isComplete"
        outlined
        dense
        v-model="data.i94AdmissionNumber"
        label="Form I-94 Admission Number"
        class="col-12 col-sm-3"
      />

      <q-input
        v-if="data.question1 === '4'"
        :disable="isComplete"
        outlined
        dense
        v-model="data.foreignPassportNumber"
        label="Foreign Passport Number and Country of Issuance"
        class="col-12 col-sm-3"
      />
    </div>

    <!--
      Below is additional I-9 information needed for Alien residents.
      For now we hide it since it is not requested but we may add it later.
      If so, uncomment the condidition below.
     -->
    <div class="q-ml-lg" v-if="/*data.question1 == 'alien'*/ false">
      <p>
        Aliens authorized to work must provide only one of the following
        document numbers to complete Form I-9:
      </p>
      <div class="row">
        <q-list class="col-6">
          <q-item tag="label">
            <q-item-section avatar>
              <q-radio
                :disable="isComplete"
                v-model="data.alien.type"
                val="uscis"
                color="primary"
              />
            </q-item-section>
            <q-item-section>
              <q-input
                :disable="data.alien.type != 'uscis' || isComplete"
                outlined
                dense
                v-model="data.alien.number"
                label="1. Alien Registration Number/USCIS Number"
              />
            </q-item-section>
          </q-item>
          <q-item tag="label">
            <q-item-section avatar>
              <q-radio
                :disable="isComplete"
                v-model="data.alien.type"
                val="i-94"
                color="primary"
              />
            </q-item-section>
            <q-item-section>
              <q-input
                :disable="data.alien.type != 'i-94' || isComplete"
                outlined
                dense
                v-model="data.alien.number"
                label="2. Form I-94 Admission Number"
              />
            </q-item-section>
          </q-item>
          <q-item tag="label">
            <q-item-section avatar>
              <q-radio
                :disable="isComplete"
                v-model="data.alien.type"
                val="passport"
                color="primary"
              />
            </q-item-section>
            <q-item-section>
              <div class="row q-col-gutter-sm">
                <q-input
                  class="col-6"
                  :disable="data.alien.type != 'passport' || isComplete"
                  outlined
                  dense
                  v-model="data.alien.number"
                  label="3. Foreign Passport Number"
                />
                <q-input
                  class="col-6"
                  :disable="data.alien.type != 'passport' || isComplete"
                  outlined
                  dense
                  v-model="data.alien.issuance"
                  label="Country of Issuance"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <q-separator spaced="lg" />
    <p class="col-12 text-subtitle2 text-weight-medium q-mt-md">
      Did a preparer and/or translator assist you in completing this I-9
      Employment Eligibility Verification form?
    </p>
    <q-option-group
      :disable="isComplete"
      v-model="data.question2"
      inline
      :options="options"
      color="primary"
      class="q-mb-md col-12"
    />
    <div
      v-if="data.question2 === 'yes'"
      class="q-py-sm row col-12 q-col-gutter-sm"
    >
      <p class="col-12">
        The following must be completed by the preparer and/or translator.
      </p>
      <q-input
        :disable="isComplete"
        :rules="[val => (val && val.length > 0) || 'Please enter first name']"
        hide-bottom-space
        outlined
        dense
        v-model="data.preparer.firstName"
        label="Preparers First Name"
        class="col-12 col-sm-6"
      />
      <q-input
        :disable="isComplete"
        :rules="[val => (val && val.length > 0) || 'Please enter last name']"
        hide-bottom-space
        outlined
        dense
        v-model="data.preparer.lastName"
        label="Preparers Last Name"
        class="col-12 col-sm-6"
      />
      <q-input
        :disable="isComplete"
        :rules="[val => (val && val.length > 0) || 'Please enter address']"
        hide-bottom-space
        outlined
        dense
        v-model="data.preparer.address"
        label="Preparers Home Address"
        class="col-12 col-sm-4"
      >
        <template v-slot:prepend>
          <q-icon name="map" />
        </template>
      </q-input>
      <q-input
        :disable="isComplete"
        :rules="[val => (val && val.length > 0) || 'Please enter city']"
        outlined
        dense
        hide-bottom-space
        v-model="data.preparer.city"
        label="Preparers City"
        class="col-12 col-sm-3"
      />
      <q-select
        :disable="isComplete"
        :rules="[val => (val && val.length > 0) || 'Please enter first name']"
        dense
        outlined
        autocomplete
        hide-bottom-space
        v-model="data.preparer.state"
        :options="usStates"
        label="Preparers State"
        class="col-12 col-sm-2"
        debounce="500"
      />
      <q-input
        outlined
        dense
        hide-bottom-space
        :disable="isComplete"
        :rules="[val => (val && val.length > 0) || 'Please enter ZIP']"
        v-model="data.preparer.zip"
        mask="#####"
        type="number"
        label="Preparers ZIP"
        class="col-12 col-sm-3"
      />
      <q-input
        readonly
        :disable="isComplete"
        hide-bottom-space
        outlined
        dense
        v-model="data.preparer.signatureDate"
        label="Signature Date"
        class="col-12"
      >
        <template #prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="data.preparer.signatureDate" mask="MM/DD/YYYY">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <div class="col-12 col-sm-6">
        <div v-if="!isComplete" class="q-my-sm q-ml-none justify-between">
          <q-btn
            v-if="!isComplete"
            color="red"
            class="q-mt-sm"
            icon="edit"
            dense
            flat
            @click="() => clearSignature()"
          >
            Clear Signature
          </q-btn>
        </div>

        <q-img
          v-if="isComplete"
          :src="data.preparer.signature"
          class="overflow-hidden bg-grey-12 q-mb-sm"
          style="height: 150px"
        />

        <VueSignaturePad
          v-if="!isComplete"
          class="rounded-borders xoverflow-hidden q-py-sm"
          style="border: 1px solid #a0a0a0"
          ref="preparerSignature"
          :options="{
            penColor: 'rgb(0, 0, 0)',
            borderWidth: 1,
            borderStyle: 'solid',
            backgroundColor: 'rgb(255,255,255, 0)',
            onBegin: () => {
              $refs.preparerSignature.resizeCanvas();
            }
          }"
          width="100%"
          height="200px"
        />

        <q-btn
          :disable="isComplete"
          v-if="!isComplete"
          unelevated
          color="green"
          class="q-my-xs"
          label="Save Signature"
          @click="saveSignature"
        />
        <span
          v-if="!isComplete && signatureValidationError"
          class="q-ml-md text-negative text-weight-bold"
        >
          Signature is a required field
        </span>
      </div>
    </div>
    <q-separator />

    <q-btn
      v-if="!isComplete"
      :disable="!data.question1 || photos.length < 1"
      unelevated
      color="green"
      class="q-my-md"
      label="Save & Complete Section"
      @click="save"
    />
    <q-btn
      v-else
      unelevated
      color="orange"
      class="q-my-md"
      label="Edit"
      @click="edit"
    />
  </q-form>
</template>

<script>
import { date, exportFile, format } from "quasar";
import { usStates } from "src/lib/shared";
import { axiosInstance } from "../../boot/axios";
import { mainMixin } from "../../mixins/index";

const columns = [
  {
    name: "fileName",
    align: "left",
    label: "File Name",
    field: "fileName",
    sortable: true
  },
  {
    name: "createdDateTime",
    align: "left",
    label: "Uploaded Date",
    field: "createdDateTime",
    sortable: true
  },
  {
    name: "createdBy",
    align: "left",
    label: "Uploaded By",
    field: "createdBy",
    sortable: true
  },
  {
    name: "fileSize",
    align: "left",
    label: "Size",
    field: "fileSize",
    sortable: true
  },
  {
    name: "actions",
    align: "left",
    label: "",
    field: "actions"
  }
];

const options = [
  {
    label: "Yes",
    value: "yes"
  },
  {
    label: "No",
    value: "no"
  }
];

const attestationOptions = [
  {
    label: "1. A citizen of the United States",
    value: "1"
  },
  {
    label: "2. A noncitizen national of the United States (See Instructions.)",
    value: "2"
  },
  {
    label: "3. A lawful permanent resident (Enter USCIS or A-Number.)",
    value: "3"
  },
  {
    label: "4. An noncitizen (other than Item Numbers 2. and 3. above) authorized to work until (exp. date, if any)",
    value: "4"
  }
];

const requiredFields = {
  question1: true
};
const formName = "I9EmployeeEligibilityVerificationForm";

export default {
  requiredFields,
  name: formName,
  props: ["task"],
  emits: ["onChange", "onComplete"],
  mixins: [mainMixin],
  async mounted() {
    try {
      if (this.task.id) {
        const { data } = await axiosInstance.get(
          `${import.meta.env.BASE_URL}/expiring-service-requirements/documents/${this.task.id}`
        );
        this.photos = data;
      }

      let formData = JSON.parse(this.task.data) || {
        formName: formName,
        status: "in-progress"
      };
      for (const key in formData) {
        this.data[key] = formData[key];
      }
    } catch (error) {
      console.error("Unable to load data: ", error);
    }
  },
  watch: {
    task: {
      immediate: true,
      deep: true,
      async handler(value) {
        if (!value) {
          return;
        }

        let formData = JSON.parse(value.data) || {
          formName: formName,
          status: "in-progress"
        };
        const status = formData.status || "in-progress";
        this.isComplete = status == "completed";
        this.isStaff = false;
      }
    },
    data: {
      deep: true,
      async handler(newValue) {
        const data = JSON.parse(this.task.data) || {
          formName: formName,
          status: "in-progress"
        };

        if (!newValue.status || newValue.status === "in-progress") {
          const payload = JSON.stringify({
            ...data,
            ...newValue,
            status: "in-progress"
          });

          this.$emit("onChange", payload);
        }
      }
    }
  },
  methods: {
    edit() {
      this.isComplete = false;
    },
    clearSignature() {
      this.$refs.preparerSignature?.clearSignature();
      this.data.preparerSignature = null;
      this.isComplete = false;
    },
    async saveSignature() {
      this.data.preparer.signature = this.$refs.preparerSignature.saveSignature(
        "image/svg+xml"
      ).data;
    },
    async save() {
      const isValid = await this.$refs.myForm.validate();

      this.photoValidationError = this.photos.length < 1;
      this.signatureValidationError =
        this.data.question2 == "yes" ? !this.data.preparer.signature : false;

      if (
        isValid &&
        this.data.question1 &&
        !this.photoValidationError &&
        !this.signatureValidationError
      ) {
        const payload = JSON.stringify({
          ...JSON.parse(this.task.data),
          ...this.data,
          status: "completed"
        });

        this.isComplete = true;
        this.$emit("onChange", payload);
        this.$emit("onComplete");
      }
    },
    async deletePhoto() {
      try {
        await axiosInstance.delete(
          `${import.meta.env.BASE_URL}/expiring-service-requirements/documents/${this.photoToDelete.id}`
        );
        const index = this.photos.findIndex(
          file => file.id === this.photoToDelete.id
        );
        if (index > -1) {
          this.photos.splice(index, 1);
        }

        this.photoToDelete = null;
      } catch (error) {
        console.error("Unable to delete file: ", error);
      }
    },
    async uploadPhoto(file) {
      this.$nextTick(async () => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("taskId", this.task.id);
        formData.append("formName", formName);
        formData.append("fileName", file.name);
        formData.append("type", "photo");
        formData.append("size", file.size);
        formData.append("createdBy", "user");

        const { data: response } = await axiosInstance({
          method: "post",
          url: `${import.meta.env.BASE_URL}/expiring-service-requirements/documents/upload`,
          data: formData,
          headers: { "Content-Type": "multipart/form-data" }
        });
        this.photos.push(response);
      });
    },
    async downloadFile(file) {
      try {
        const { data: fileUrl } = await axiosInstance.get(
          `${import.meta.env.BASE_URL}/expiring-service-requirements/documents/downloadUrl/${file.id}`
        );
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        exportFile(file.fileName, blob);
      } catch (error) {
        console.error("Unable to download file: ", error);
      }
    }
  },
  data: () => ({
    format,
    date,
    options,
    attestationOptions,
    columns,
    photos: [],
    isComplete: false,
    photoValidationError: false,
    signatureValidationError: false,
    photoToDelete: null,
    data: {
      question1: null,
      question2: "no",
      aNumber: null,
      workExpiryDate: null,
      i94AdmissionNumber: null,
      foreignPassportNumber: null,
      physical: {
        address: null,
        city: null,
        state: null,
        zip: null
      },
      about: {
        firstName: null,
        lastName: null,
        middleName: null,
        birthDate: null,
        ssn: null,
        email: null,
        cellPhone: null
      },
      alien: {
        type: null,
        number: null,
        issuance: null
      },
      preparer: {
        firstName: null,
        lastName: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        signatureDate: null,
        signature: null
      }
    },
    pagination: {
      sortBy: "fileName",
      descending: false,
      page: 1,
      rowsPerPage: 10
    }
  })
};
</script>
