<template>
  <div>
    <q-layout v-if="!pdfUrl && !mp4" view="lHh Lpr lFf" class="bg-indigo-1">
      <q-page-container id="wrapper">
        <div v-if="loaded">
          <div v-if="fileNotFound" class="column justify-center items-center">
            <q-icon size="130px" name="search" color="red-8"></q-icon>
            <h6 class="q-ma-none text-center">Sorry Nothing Here...<strong>(404)</strong></h6>
            <p class="q-ma-none text-center" style="font-size: 17px;">Please contact your local office for more information</p>
          </div>

          <div v-if="pinRequired" class="q-pa-md q-gutter-md fixed-top">
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
                    @click="downloadMedia"
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
        </div>

        <q-dialog v-model="loading" persistent>
          <q-card style="width: 200px; height: 200px" class="row items-center justify-center">
            <q-spinner-ios
              color="blue-9"
              size="80"
              />
          </q-card>
        </q-dialog>
      </q-page-container>
    </q-layout>

    <vue-pdf-app
      v-if="!!pdfUrl"
      style="height: 100vh"
      :config="{
          toolbar: {
          toolbarViewerRight: false
        },
        secondaryToolbar: {
          secondaryPresentationMode: false,
          secondaryOpenFile: false,
          secondaryPrint: false,
          secondaryDownload: false,
          secondaryViewBookmark: false,
          firstPage: false,
          lastPage: false,
          pageRotateCw: true,
          pageRotateCcw: true,
          cursorSelectTool: false,
          cursorHandTool: false,
          scrollVertical: false,
          scrollHorizontal: false,
          scrollWrapped: false,
          spreadNone: false,
          spreadOdd: false,
          spreadEven: false,
          documentProperties: false
        },
        sidebar: false
      }"
      :pdf="pdfUrl"
    />

    <q-media-player v-if="mp4"
      style="width: 100vw; height: 100vh" :src="mp4"
      mobile-mode
      type="video"
      :autoplay="true"
      :source="mp4"
    />
  </div>
</template>

<script>
import documentApi from "../api/documents";
import { mainMixin } from "../mixins/index";
import { exportFile } from 'quasar'
import VuePdfApp from "vue-pdf-app";
import "vue-pdf-app/dist/icons/main.css";

export default {
  name: "DocDownload",
  mixins: [mainMixin],
  components: {
    VuePdfApp
  },
  async mounted() {
    try {
      this.mediaId = this.$route.params.id;
      this.surveyId = this.$route.params.surveyId || null;

      const response = await documentApi.getMediaDownloadPageData(this.mediaId, this.surveyId);
      this.pinRequired = response;

      if (!response) {
        await this.downloadMedia();
      }
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      this.loaded = true;
      this.loading = false;
    }
  },
  methods: {
    async downloadMedia() {
      try {
        const response = await documentApi.downloadMediaWithPin(this.mediaId, this.pinCode, this.surveyId);
        const mediaTypes = ['.jpg', '.jpeg', '.png', '.gif'];
        if (response.fileName.includes('.pdf') || mediaTypes.some(t => response.fileName.includes(t))) {
          const fileURL = window.URL.createObjectURL(response.file);
          if (this.$q.platform.is.android) {
            this.pdfUrl = fileURL;
          } else {
            window.open(fileURL, '_self');
          }
        } else if (response.fileName.includes('.mp4')) {
          this.playVideo(response.file);
        } else {
          exportFile(response.fileName, response.file, response.file.type);
        }
      } catch (error) {
        if (error.response?.status === 409) {
          this.showErrorMessage("File is not shared");
        }
        if (error.response?.status === 401) {
          if (this.pinRequired) {
            this.showErrorMessage("Invalid Pin");
          } else {
            this.fileNotFound = true;
          }
        }

        console.error(error);
      }
    },
    playVideo(videoFile) {
      if (!(videoFile instanceof Blob)) {
        this.showErrorMessage('Video cannot be played.');
      }

      const newObjectUrl = URL.createObjectURL(videoFile);

      if (!!this.mp4 && this.mp4.startsWith('blob:')) {
          this.mp4 = '';
          URL.revokeObjectURL(this.mp4);
      }

      this.mp4 = newObjectUrl;
    },
    getDisclaimer() {
      return import.meta.env.DISCLAIMER;
    },
  },
  data() {
    return {
      loading: true,
      loaded: false,
      mediaId: null,
      surveyId: null,
      pinRequired: true,
      pinCode: "",
      fileNotFound: false,
      mp4: null,
      pdfUrl: null,
    };
  },
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
