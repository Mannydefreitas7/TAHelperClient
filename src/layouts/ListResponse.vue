<template>
  <q-layout view="lHh Lpr lFf" class="bg-indigo-1">
    <q-page-container id="wrapper">
      <div v-if="logoUrl && expired" class="row justify-center full-width">
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

      <div class="row" v-if="!expired">
        <div v-if="sent" class="q-pa-md q-gutter-md fixed-top">
          <div class="row justify-center full-width">
            <q-img
              :src="logoUrl"
              style="max-width: 150px"
              basic
              spinner-color="white"
              class="rounded-borders vertical-top"
            />
          </div>
          <q-banner rounded class="bg-grey-5">
            <div class="text-center text-body1">
              Your request has been submitted to the Scheduling Department.
              Please check your available shifts portal throughout the day for new offers.
              <div v-if="officePhone">
                If you are not contacted soon please call
                <a :href="'tel:' + officePhone">{{ officePhone }}</a>
              </div>
            </div>
          </q-banner>
        </div>
        <div v-else-if="pinRequired" class="q-pa-md q-gutter-md fixed-top">
          <div class="row justify-center full-width">
            <q-img
              :src="logoUrl"
              style="max-width: 150px"
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
                  @click="fetchData()"
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
                  <div v-if="actionLabel" class="row">
                    <HelpButton class="q-mr-sm">
                      <template v-slot:header> Login Help </template>
                      <ul class="q-pl-lg">
                        <li class="q-pb-sm">
                          If you do not have a PIN please contact your office
                          scheduler.
                        </li>
                        <li class="q-pb-sm">
                          Select <strong>ALLOW</strong> when prompted to share
                          your location and sort visits by nearest to you. If
                          you select <strong>Don't ALLOW</strong> they will be
                          sorted alphabetically.
                        </li>
                      </ul>
                    </HelpButton>
                    <VideoHelp
                      label="00:37"
                      srcUrl="https://tahelper.blob.core.windows.net/training-media/wf-available-shifts-login.mp4?sp=r&st=2020-10-26T01:48:08Z&se=2030-10-26T09:48:08Z&spr=https&sv=2019-12-12&sr=b&sig=qZeQRcJr3%2FfaDwUE%2FHBNjBByLkjy5caCr6NaDdGSS98%3D"
                    />
                  </div>
                </div>
              </q-banner>
            </div>
          </form>
        </div>
        <div v-else class="q-pa-md row justify-center full-width">
          <div style="max-width: 600px; width: 100%;">
            <q-pull-to-refresh @refresh="refresh">
              <q-table
                grid
                row-key="VISIT_ID"
                :visible-columns="sqlVisibleColumns"
                :title="pageHeader"
                :rows="sqlData"
                :columns="sqlColumns"
                :selected-rows-label="getSelectedString"
                :selected.sync="selected"
                :pagination="initialPagination"
                :filter="filter"
                :no-data-label="noDataLabel"
                :no-results-label="noDataLabel"
                selection="multiple"
                hide-pagination
                dense
              >
                <template v-slot:top-right>
                  <q-input
                    outlined
                    dense
                    debounce="300"
                    v-model="filter"
                    placeholder="Search"
                  >
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                  <VideoHelp
                    v-if="actionLabel"
                    class="q-ml-xs"
                    label="01:35"
                    srcUrl="https://tahelper.blob.core.windows.net/training-media/wf-available-shifts-portal.mp4?sp=r&st=2020-10-26T17:47:02Z&se=2030-10-27T01:47:02Z&spr=https&sv=2019-12-12&sr=b&sig=kykbc9qVERMt5XI5zlL5bg2Tt1X6RBNprKTRTNcAIuE%3D"
                  />
                </template>

                <template v-slot:item="props">
                  <div
                    class="q-pa-xs col-xs-12 grid-style-transition"
                    :style="props.selected ? 'transform: scale(0.95);' : ''"
                  >
                    <div class="row justify-center">
                      <q-expansion-item class="bg-white" style="max-width: 600px; width: 100%;">
                        <q-separator />
                        <template v-slot:header>
                          <q-item-section v-if="actionLabel" avatar>
                            <q-checkbox v-model="props.selected" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ props.row.Client }}</q-item-label>
                            <q-item-label caption>{{
                                props.row["Visit Time"]
                              }}</q-item-label>
                            <q-item-label caption
                            >{{ props.row["Distance"] }}
                              {{ props.row["Direction"] }}</q-item-label
                            >
                          </q-item-section>
                          <q-item-section v-if="props.row['Address']" side>
                            <q-btn
                              round
                              size="sm"
                              color="secondary"
                              icon="navigation"
                              @click.native.stop="openMap(props.row['Address'])"
                            />
                          </q-item-section>
                        </template>

                        <q-card>
                          <q-card-section class="q-pa-none">
                            <q-item
                              v-for="col in props.cols.filter(
                                (col) => col.Client !== 'desc'
                              )"
                              :key="col.Client"
                            >
                              <q-item-section>
                                <q-item-label>{{ col.label }}</q-item-label>
                                <q-item-label v-if="!col.label.toLowerCase().includes('phone')" class="text-grey-7" v-html="col.value"></q-item-label>
                                <a :href="`tel:${col.value}`" style="text-decoration: none;" v-else>{{col.value}}</a>
                              </q-item-section>
                            </q-item>
                          </q-card-section>
                        </q-card>
                      </q-expansion-item>
                    </div>
                  </div>
                </template>
              </q-table>
            </q-pull-to-refresh>
            <q-btn
              v-if="actionLabel && this.sqlColumns.length > 0"
              id="submit-button"
              class="text-capitalize text-white q-my-sm"
              style="margin-left: 3px;"
              color="secondary"
              @click="save()"
            >
              {{ actionLabel }}
            </q-btn>

            <div v-if="acceptMediaType" class="q-mt-sm">
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
                style="min-height: 655px"
              >
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
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>
<script>
import { axiosInstance } from "src/boot/axios";
import HelpButton from "components/HelpButton";
import VideoHelp from "components/VideoHelp";

export default {
  name: "ListResponse",
  components: {
    HelpButton,
    VideoHelp,
  },
  computed: {
    sqlVisibleColumns: function () {
      const visCols = this.sqlColumns
        .map((c) => c.field)
        .filter((f) => {
          const field = f.toLowerCase();
          return (
            field !== "visit_id" &&
            field !== "office phone" &&
            field !== "distance" &&
            field !== "direction" &&
            field !== "address" &&
            field !== "lat" &&
            field !== "long" &&
            field !== "actionfilter" &&
            field !== "actionfilter2" &&
            field !== "convertrtftohtml"
          );
        });

      return visCols;
    },
    noDataLabel: function () {
      return `No ${this.subject} found`;
    },
  },
  async created() {
    this.listId = this.$route.params.id;

    await axiosInstance
      .get(`${import.meta.env.BASE_URL}/list/listData/${this.listId}`)
      .then((response) => {
        if (response.data.expired) {
          this.logoUrl = response.data.logo;
          this.expired = true;
          return;
        }

        this.logoUrl = response.data.logo;
        this.acceptMediaType = response.data.acceptMediaType;
        this.acceptCapture = this.acceptMediaType.startsWith('image') ? "environment" : null;
        if (response.data.actionLabel === null) {
          this.actionLabel = "Express Interest";
        } else {
          this.actionLabel = response.data.actionLabel;
        }
      });
  },
  methods: {
    getDisclaimer() {
      return import.meta.env.DISCLAIMER;
    },
    getSelectedString() {
      if (this.selected.length === 0) {
        return "";
      }

      return `${this.selected.length} record${
        this.selected.length > 1 ? "s" : ""
      } selected of ${this.sqlData.length}`;
    },
    async refresh(done) {
      await this.fetchData();
      done();
    },
    async fetchData() {
      let coords = {};
      if (this.actionLabel) {
        coords = await this.$getLocation({
          enableHighAccuracy: false,
          timeout: 2000,
          maximumAge: 900000,
        }).catch((error) => error);
      }

      const payload = {
        ListId: this.listId,
        PinCode: this.pinCode,
        Longitude: coords.lng,
        Latitude: coords.lat,
      };

      const response = await axiosInstance.post(`${import.meta.env.BASE_URL}/list`, payload);
      if (response.data == "Invalid Pin") {
        this.$q.notify({
          type: "negative",
          position: "top",
          timeout: 1000,
          message: "Invalid pin, please try again",
          multiLine: true,
        });
      } else {
        this.sqlData = response.data.rows;
        this.sqlColumns = response.data.columns || [];
        this.pageHeader = `${response.data.subject} - ${response.data.name}`;
        this.subject = response.data.subject;
        this.officePhone = response.data.officePhone;
        this.pinRequired = false;
      }
    },
    async save() {
      if (this.selected && this.selected.length > 0) {
        axiosInstance
          .post(
            `${import.meta.env.BASE_URL}/list/save/${this.listId}`,
            this.selected
          )
          .then((response) => {
            this.sent = true;
          })
          .catch((error) => console.log(error));
      }
    },
    async openMap(address) {
      window.open(
        "https://www.google.com/maps/search/?api=1&query=" + address,
        "_blank"
      );
    },
    factoryFn (file) {
      return new Promise((resolve, reject) => {
        resolve({
          url:`${import.meta.env.BASE_URL}/media/send-media/${this.listId}`,
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
      expired: false,
      sent: false,
      pinRequired: true,
      pinCode: "",
      listId: "",
      officePhone: "",
      sqlData: [],
      sqlColumns: [],
      pageHeader: "",
      subject: "",
      selected: [],
      filter: "",
      logoUrl: "",
      actionLabel: "",
      acceptMediaType: "",
      acceptCapture: "",
      initialPagination: {
        sortBy: "Distance",
        descending: false,
        rowsPerPage: 10000,
      },
    };
  },
};
</script>

<style scoped>
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
