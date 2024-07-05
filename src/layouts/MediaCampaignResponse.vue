<template>
  <q-layout view="lHh Lpr lFf" class="bg-indigo-1">
    <q-page-container id="wrapper">
      <div v-if="logoUrl" class="row justify-center full-width">
        <q-img
          :src="logoUrl"
          basic
          style="max-width: 250px"
          spinner-color="white"
          class="rounded-borders"
        />
      </div>

      <div class="row justify-center q-mt-xl" v-if="currentStep === 1">
        <q-card class="full-width" style="max-width: 500px">
          <q-card-section>
            <span class="text-subtitle1">{{ subject }}</span>
          </q-card-section>

          <q-card-section>
            <q-form greedy ref="formRef" class="column q-gutter-md items-stretch">
              <q-input
                dense
                filled
                v-model="name"
                label="Name *"
                hide-bottom-space
                :rules="[val => val && val.trim() !== '' || 'Name is required']"
                lazy-rules></q-input>

              <div class="row items-center">
                <q-input
                  class="col"
                  dense
                  filled
                  v-model="email"
                  label="Email *"
                  hide-bottom-space
                  :rules="[validateThisEmail  || 'Please enter a valid email']"
                  lazy-rules></q-input>

                <span class="q-mx-sm">- OR -</span>

                <q-input
                  class="col"
                  dense
                  filled
                  v-model="number"
                  label="Phone *"
                  mask="+1(###) ### - ####"
                  fill-mask
                  unmasked-value
                  hide-bottom-space
                  :rules="[validateThisNumber  || 'Please enter a valid phone number']"
                  lazy-rules></q-input>
              </div>

              <q-input
                dense
                filled
                v-model="pinCode"
                label="Pin"
                hide-bottom-space
                hint="Options - unless required by your agency"></q-input>
            </q-form>
          </q-card-section>

          <q-separator></q-separator>

          <q-card-section>
            <div class="row justify-end">
              <q-btn
                no-caps
                color="blue-6"
                label="Next"
                @click="onValidate"></q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="subject && currentStep === 2" class="row justify-center full-width q-mt-xs">
        <q-banner dense class="bg-indigo-1">
          <div class="row justify-between">
            <p class="text-subtitle1 q-mb-none">
              {{ subject }} - {{ name }}
            </p>
          </div>
        </q-banner>
      </div>

      <div class="q-mx-md q-px-md q-mt-sm" v-if="currentStep === 2">
        <q-uploader
          multiple
          batch
          :factory="factoryFn"
          :accept="acceptMediaType"
          :capture="acceptCapture"
          @onFailed="onFailed"
          @uploaded="onUploaded"
          ref="uploader"
          color="indigo-8"
          class="full-height full-width"
          style="min-height: 655px">
          <template v-slot:header="scope">
            <div class="row no-wrap items-center q-pa-md q-gutter-xs">
              <div class="col">
                <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}</div>
              </div>
            </div>
          </template>

          <template v-slot:list="scope">
            <q-list separator>
              <q-item>
                <q-item-section class="row no-wrap items-center">
                  <q-item-label>
                    <q-btn v-if="!scope.canUpload && !scope.isUploading" type="a" icon="add_box" color="secondary" class="q-pr-lg">
                      <span v-if="$q.platform.is.mobile" class="q-mx-xs">
                        {{acceptCapture == 'environment' ? 'Take Picture' : 'Add file'}}
                      </span>
                      <span v-else class="q-mx-xs">
                        {{ 'Add file' }}
                      </span>
                      <q-uploader-add-trigger />
                    </q-btn>

                    <q-btn v-if="scope.canUpload || scope.isUploading" type="a" @click="scope.upload" :loading="scope.isUploading" icon="cloud_upload" color="secondary" class="q-pr-lg">
                      <span class="q-mx-xs">
                        Submit
                      </span>
                    </q-btn>
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-for="file in scope.files" :key="file.name">
                <q-item-section>
                  <q-item-label class="full-width ellipsis">
                    {{ file.name }}
                  </q-item-label>

                  <q-item-label caption>
                    Status: {{ file.__status }}
                  </q-item-label>

                  <q-item-label caption>
                    {{ file.__sizeLabel }} / {{ file.__progressLabel }}
                  </q-item-label>
                </q-item-section>

                <q-item-section
                  v-if="file.__img"
                  thumbnail
                  class="gt-xs"
                >
                  <img :src="file.__img.src">
                </q-item-section>

                <q-item-section top side>
                  <q-btn
                    size="12px"
                    flat
                    dense
                    round
                    icon="delete"
                    @click="scope.removeFile(file)"
                  />
                </q-item-section>
               </q-item>
               <q-item>
                 <q-item-section>
                   <q-btn v-if="scope.files.length > 0" type="a" color="primary" class="q-pr-lg q-mr-sm q-mb-sm">
                      <span v-if="$q.platform.is.mobile" class="q-mx-xs">
                        {{acceptCapture == 'environment' ? 'Take another picture' : 'Add another file'}}
                      </span>
                      <span v-else class="q-mx-xs">
                        {{ 'Add another file' }}
                      </span>
                      <q-uploader-add-trigger />
                    </q-btn>
                 </q-item-section>
               </q-item>

            </q-list>
          </template>
        </q-uploader>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { axiosInstance } from "src/boot/axios";
import { mainMixin } from "../mixins/index";

export default {
  name: "MediaCampaignResponse",
  mixins: [mainMixin],
  async created() {
    this.campaignId = this.$route.params.id;

    const response = await axiosInstance.get(`${import.meta.env.BASE_URL}/media/page-data-campaign/${this.campaignId}`);

    this.logoUrl = response.data.logo;
    this.subject =  `${response.data.subject}`;
  },
  methods: {
    validateThisEmail(val) {
      return (val && val.trim() !== '') || !!this.number;
    },
    validateThisNumber(val) {
      return ((val && val.trim() !== '') || !!this.email) && this.validatePhone(val);
    },
    async onValidate() {
      try {
        await this.$refs.formRef.reset();

        const formSuccess = await this.$refs.formRef.validate();
        const pinAccepted = await axiosInstance.post(
          `${import.meta.env.BASE_URL}/media/validation-check`,
          {
            campaignId: this.campaignId,
            name: this.name,
            email: this.email,
            number: this.number,
            pinCode: this.pinCode,
          });

        if (!pinAccepted.data) {
          this.currentStep = 1;
          this.showErrorMessage("Invalid pin");
          return false;
        }

        if (!formSuccess) {
          this.currentStep = 1;
          return false;
        }

        this.currentStep = 2;
        return true;
      } catch (error) {
        console.error(error.response?.data);
        this.showErrorMessage(error.response?.data || "Unable to validate form");
      }
    },
    factoryFn (file) {
      return new Promise(async (resolve, reject) => {
        const url = new URL(`${import.meta.env.BASE_URL}/media/send-campaign-media`);

        url.searchParams.append("campaignId", this.campaignId);
        url.searchParams.append("name", this.name);
        url.searchParams.append("email", this.email);
        url.searchParams.append("number", this.number);
        url.searchParams.append("pinCode", this.pinCode);

        resolve({
          url: url.toString(),
          method: 'POST',
        });
      })
    },
    onFailed(info) {
      const filesLabel = info.files.length > 1 ? 'files' : 'file';
      this.$refs.uploader.reset();
      this.$q.notify({
        type: "negative",
        position: "center",
        message: `${info.files.length} ${filesLabel} encountered an error uploading. Please contact support.`,
      });
    },
    onUploaded (info) {
      const filesLabel = info.files.length > 1 ? 'files' : 'file';
      this.$refs.uploader.reset();
      this.$q.notify({
        color: "green-4",
        textColor: "white",
        icon: "cloud_done",
        position: "center",
        closeBtn: true,
        timeout: 5000,
        message: `${info.files.length} ${filesLabel} uploaded successfully`,
      });
    }
  },
  data() {
    return {
      logoUrl: "",
      subject: "",
      currentStep: 1,
      campaignId: "",
      acceptMediaType: "application/pdf,image/*",
      acceptCapture: "environment",
      name: "",
      email: "",
      number: "",
      pinCode: "",
    };
  },
};
</script>

<style scoped>
#wrapper {
  margin: auto;
  padding: 5px;
}
</style>
