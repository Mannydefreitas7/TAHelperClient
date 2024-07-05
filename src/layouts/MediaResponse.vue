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

      <div v-if="expired" class="center-page column justify-center items-center">
        <div class="column justify-center items-center">
          <q-icon size="130px" name="schedule" color="red-8"></q-icon>
          <h6 class="q-ma-none text-center"><strong>Link Expired</strong></h6>
          <p class="q-ma-none text-center" style="font-size: 17px;">Please contact your local office for more information</p>
        </div>
      </div>

      <div v-if="pinRequired" class="q-pa-md q-gutter-md">
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
                @click="fetchRows"
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

      <div v-if="pageHeader && !expired && !pinRequired" class="row justify-center full-width q-mt-xs">
        <q-banner dense class="bg-indigo-1">
          <div class="row justify-between">
            <p class="text-subtitle1 q-mb-none">
              {{ pageHeader }}
            </p>
          </div>
        </q-banner>
      </div>

      <div class="q-mx-md q-px-md q-mt-sm q-gutter-y-md" v-if="!expired && !pinRequired">
        <q-uploader
          v-if="!sqlRows.length"
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

        <q-uploader
          v-else
          v-for="row in availableSqlData"
          :key="row.id"
          :factory="factoryFn"
          :accept="acceptMediaType"
          :capture="acceptCapture"
          @onFailed="onFailed"
          @uploaded="info => onUploaded(info, row.id)"
          :ref="'uploader' + row.id"
          color="indigo-8"
          class="full-height full-width"
          style="min-height: 355px">
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
                  <q-item-label class="text-h6 q-ma-md"><strong>{{ row.name }}</strong> - {{ row.date }}</q-item-label>
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
  name: "MediaResponse",
  mixins: [mainMixin],
  async created() {
    this.mediaId = this.$route.params.id;

    await axiosInstance
      .get(`${import.meta.env.BASE_URL}/media/page-data/${this.mediaId}`)
      .then((response) => {
        if (response.data.expired) {
          this.logoUrl = response.data.logo;
          this.expired = true;
          return;
        }

        this.logoUrl = response.data.logo;
        this.pinRequired = response.data.pinRequired;
        this.pageHeader =  `${response.data.subject} - ${response.data.name}`;
        this.acceptMediaType = response.data.acceptMediaType;
        this.acceptCapture = this.acceptMediaType.startsWith('image') ? "environment" : null;
        this.sqlRows = !response.data.pinRequired ? response.data.rows.map(this.formatSqlData) : [];
      });
  },
  computed: {
    availableSqlData() {
      return this.sqlRows.filter(row => !this.uploadedFileIds.some(id => row.id === id));
    }
  },
  methods: {
    getDisclaimer() {
      return import.meta.env.DISCLAIMER;
    },
    fetchRows() {
      axiosInstance
        .post(`${import.meta.env.BASE_URL}/media`, {pin: this.pinCode, mediaId: this.mediaId})
        .then((response) => {
          this.pinRequired = false;
          this.sqlRows = response.data.rows.map(this.formatSqlData);
        })
        .catch((error) => {
          this.pinRequired = true;
          this.showErrorMessage("Invalid Pin");
          console.error(error)
        });
    },
    formatSqlData(data) {
      return {
        id: data.VISIT_ID || data.Id,
        date: data.VisitDate || data.Date,
        name: data.PatientName || data.Name,
      }
    },
    factoryFn (file) {
      return new Promise((resolve, reject) => {
        const url = new URL(`${import.meta.env.BASE_URL}/media/send-media`);

        url.searchParams.append("mediaId", this.mediaId);
        url.searchParams.append("pinCode", this.pinCode);

        resolve({
          url,
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
    onUploaded (info, id) {
      const filesLabel = info.files.length > 1 ? 'files' : 'file';

      if (id) {
        this.uploadedFileIds.push(id);
      } else {
        this.$refs.uploader.reset();
      }

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
      uploadedFileIds: [],
      pinRequired: false,
      pinCode: "",
      expired: false,
      mediaId: "",
      pageHeader: "",
      logoUrl: "",
      acceptMediaType: "",
      acceptCapture: "",
      sqlRows: [],
    };
  },
};
</script>

<style scoped>
#wrapper {
  margin: auto;
  padding: 5px;
}
.center-page {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 500px;
  width: 100vw;
}
.fade-enter-active {
  transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
