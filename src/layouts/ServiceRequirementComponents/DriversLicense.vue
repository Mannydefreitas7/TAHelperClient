<template>
  <div>
    <div v-if="submitted">
      <q-badge color="blue">Submitted</q-badge>
    </div>
    <div v-else>
      <div><strong>Instructions</strong></div>
      <div>
        Your driver's license has expired. Please use the upload buttons below
        to upload images of the front and back of your updated driver's license.
      </div>
      <div>
        <q-uploader
          v-for="row in missingMedia"
          :key="row.id"
          :factory="factoryFn"
          :accept="acceptMediaType"
          :capture="acceptCapture"
          @onFailed="onFailed"
          @uploaded="(info) => onUploaded(info, row.type, row.id)"
          :ref="'uploader' + row.id"
          color="indigo-8"
          class="full-height full-width"
          style="min-height: 355px"
          multiple
          batch
        >
          <template v-slot:header="scope">
            <div class="row no-wrap items-center q-pa-md q-gutter-xs">
              <div class="col">
                <div class="q-uploader__subtitle">
                  {{ scope.uploadSizeLabel }} /
                  {{ scope.uploadProgressLabel }}
                </div>
              </div>
            </div>
          </template>

          <template v-slot:list="scope">
            <q-list separator>
              <q-item>
                <q-item-section class="row no-wrap items-center">
                  <q-item-label class="text-h6 q-ma-md"
                    ><strong>{{ row.name }}</strong>
                  </q-item-label>
                  <q-item-label>
                    <q-btn
                      v-if="
                        scope.files.length !== requiredFileCount &&
                        !scope.isUploading
                      "
                      type="a"
                      icon="add_box"
                      color="secondary"
                      class="q-pr-lg"
                    >
                      <span v-if="$q.platform.is.mobile" class="q-mx-xs">
                        {{
                          acceptCapture == "environment"
                            ? "Take Picture"
                            : "Add file"
                        }}
                      </span>
                      <span v-else class="q-mx-xs">
                        {{ "Add file" }}
                      </span>
                      <q-uploader-add-trigger />
                    </q-btn>

                    <q-btn
                      v-if="
                        (scope.canUpload || scope.isUploading) &&
                        scope.files.length === requiredFileCount
                      "
                      type="a"
                      @click="scope.upload"
                      :loading="scope.isUploading"
                      icon="cloud_upload"
                      color="secondary"
                      class="q-pr-lg"
                    >
                      <span class="q-mx-xs"> Submit </span>
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
                    {{ file.__sizeLabel }} /
                    {{ file.__progressLabel }}
                  </q-item-label>
                </q-item-section>

                <q-item-section v-if="file.__img" thumbnail class="gt-xs">
                  <img :src="file.__img.src" />
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
    </div>
  </div>
</template>
<script>
import { mainMixin } from "../../mixins/index";
export default {
  name: "DriversLicense",

  mixins: [mainMixin],

  props: {
    mediaId: String,
    acceptMediaType: String,
    acceptCapture: String,
    pinCode: String,
    serviceRequirement: Object,
  },

  async mounted() {},

  computed: {
    missingMedia() {
      return this.requiredMediaTypes.filter(
        (mediaType) =>
          true || !this.uploadedFileIds.some((f) => mediaType.type === f.type)
      );
    },
  },

  methods: {
    factoryFn(file) {
      return new Promise((resolve, reject) => {
        const url = new URL(`${import.meta.env.BASE_URL}/media/send-media`);

        url.searchParams.append("mediaId", this.mediaId);
        url.searchParams.append("pinCode", this.pinCode);
        url.searchParams.append("separateMessages", false);
        url.searchParams.append("deliveryMethod", "ServiceRequirementDriversLicenseResponse");

        resolve({
          url,
          method: "POST",
        });
      });
    },
    onFailed(info) {
      const filesLabel = info.files.length > 1 ? "files" : "file";
      this.$refs.uploader.reset();
      this.$q.notify({
        type: "negative",
        position: "center",
        message: `${info.files.length} ${filesLabel} encountered an error uploading. Please contact support.`,
      });
    },
    onUploaded(info, type, id) {
      const filesLabel = info.files.length > 1 ? "files" : "file";

      if (id) {
        this.uploadedFileIds.push({ type, id });
      } else {
        this.$refs.uploader.reset();
      }

      this.submitted = true;
      this.$q.notify({
        color: "green-4",
        textColor: "white",
        icon: "cloud_done",
        position: "center",
        closeBtn: true,
        timeout: 5000,
        message: `${info.files.length} ${filesLabel} uploaded successfully`,
      });
    },
  },

  data: () => {
    return {
      uploadedFileIds: [],
      requiredMediaTypes: [
        {
          id: 1,
          type: "DriversLicenseFrontAndBack",
          name: "Driver's License - Front and Back",
        },
      ],
      submitted: false,
      requiredFileCount: 2,
    };
  },
};
</script>

<style lang="scss" scoped>
.red-border {
  border: solid 6px $red-2;
}
</style>
