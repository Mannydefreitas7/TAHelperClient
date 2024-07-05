<template>
  <div>
    <div v-if="submitted">
      <q-badge color="blue">Submitted</q-badge>
    </div>
    <div v-else>
      <div><strong>Instructions</strong></div>
      <div>
        Your qualification is about to expire. Please download the employee
        handbook and then watch the following training videos.
      </div>
      <div class="q-pt-md"><strong>Progress</strong></div>
      <div class="row">
        <q-linear-progress
          :stripe="!trainingTimeCompleted"
          :color="
            currentSessionStart === null && !trainingTimeCompleted
              ? 'grey-6'
              : 'green-6'
          "
          :model-value="progress"
          size="40px"
          ><div class="absolute-full flex flex-center">
            <q-badge
              color="white"
              :text-color="
                currentSessionStart === null && !trainingTimeCompleted
                  ? 'grey-6'
                  : 'green-6'
              "
              :label="progressLabel"
            />
          </div>
        </q-linear-progress>
      </div>
      <div class="q-pt-md"><strong>Handbook</strong></div>
      <q-list
        ><q-expansion-item
          label="Download Handbook"
          v-model="handbookExpanded"
          :header-class="handbookDownloaded ? 'bg-green-6' : 'bg-grey-4'"
        >
          <div style="q-pa-md">
            <q-btn
              no-caps
              class="q-ma-md"
              label="Download Handbook"
              :color="handbookDownloaded ? 'green-6' : 'blue-6'"
              :text-color="handbookDownloaded ? 'black' : 'white'"
              icon="download"
              :loading="downloading"
              @click="downloadHandbook"
            />
          </div>
        </q-expansion-item>
      </q-list>
      <div class="q-pt-md"><strong>Handbook Training Videos</strong></div>
      <q-list>
        <q-expansion-item
          v-for="(video, videoIndex) in sortedHandbookVideos"
          :key="`handbook${videoIndex}`"
          :label="video.label"
          :header-class="video.watched ? 'bg-green-6' : 'bg-grey-4'"
          @show="
            () => {
              video.load = true;
            }
          "
        >
          <q-media-player
            v-if="video.load"
            background-color="black"
            preload="none"
            radius="1rem"
            :autoplay="false"
            :show-big-play-button="true"
            hide-settings-btn
            :source="(!videoPlaying || videoPlaying === video) && video.src"
            :type="video.type"
            :disabled-seek="!video.watched"
            @ended="() => onEnded(video)"
            @playing="() => onPlaying(video)"
            @paused="() => onPaused(video)"
          >
          </q-media-player>
        </q-expansion-item>
      </q-list>
      <div class="q-pt-md"><strong>Training Videos</strong></div>
      <q-list>
        <q-expansion-item
          v-for="(video, videoIndex) in sortedTrainingVideos"
          :key="`training${videoIndex}`"
          :label="video.label"
          :header-class="video.watched ? 'bg-green-6' : 'bg-grey-4'"
          @show="
            () => {
              video.load = true;
            }
          "
        >
          <q-media-player
            v-if="video.load"
            background-color="black"
            preload="none"
            radius="1rem"
            :autoplay="false"
            :show-big-play-button="true"
            hide-settings-btn
            :source="(!videoPlaying || videoPlaying === video) && video.src"
            :type="video.type"
            :disabled-seek="!video.watched"
            @ended="() => onEnded(video)"
            @playing="() => onPlaying(video)"
            @paused="() => onPaused(video)"
          >
          </q-media-player>
        </q-expansion-item>
      </q-list>
      <div class="q-my-md">
        <q-banner class="bg-grey-4"
          ><h6 class="q-ma-none">Signature</h6></q-banner
        >
        <q-banner class="bg-grey-2">
          <span style="text-align: center; color: red;"
            >Employee MUST sign below.</span
          >
          <span style="text-align: left;">
            Only full signatures with first and last name will be accepted.
            <br />
            <br />
            I acknowledge that I have received a copy of Advantage In-Home
            Service’s Employee Handbook which includes a detailed description of
            agency’s policies, procedures and employee expectations. I
            understand that I am responsible for understanding the policies in
            this handbook and agree to adhere to all the policies and procedures
            during my employment with Advantage In-Home Services, LLC. I
            understand that Advantage In-Home Services, LLC reserves the right
            to modify this handbook, amend, or terminate any policies,
            procedures, or employee benefit programs at any time.
            <br />
            <br />
            I acknowledge that I have received training on the above-mentioned
            topics from Advantage In-Home Services.
          </span>
        </q-banner>
      </div>

      <div class="row items-center justify-between q-mb-sm">
        <label
          ><strong>
            Acknowledged and Agreed To:
          </strong>
        </label>
      </div>
      <div class="row">
        <q-radio label="Yes" v-model="acknowledged" val="Yes" />
        <q-radio label="No" v-model="acknowledged" val="No" />
      </div>

      <div class="row q-mt-md">
        <div :class="$q.screen.gt.xs ? 'col' : 'col-12'">
          <div class="row items-center justify-between q-mb-sm">
            <label>
              <strong>
                Signature
              </strong>
            </label>
          </div>
          <VueSignaturePad
            style="border: 1px solid black"
            ref="employeeSignature"
            width="100%"
            height="100px"
            :options="{
              penColor: '#000',
              onBegin: () => {
                $refs['employeeSignature'].resizeCanvas();
              },
            }"
          />
          <q-btn
            flat
            no-caps
            dense
            class="text-blue"
            @click="signatureRefName = 'employeeSignature'"
            >Clear</q-btn
          >
        </div>
      </div>
      <div
        class="row justify-center text-red-6 text-bold q-pb-md"
        v-if="submitError"
      >
        {{ submitError }}
      </div>
      <div class="row justify-center">
        <q-btn
          :color="completedTasks < totalTasks ? 'white' : 'blue-6'"
          :text-color="completedTasks < totalTasks ? 'black' : 'white'"
          :disable="
            acknowledged !== 'Yes' ||
              ($refs['employeeSignature'] &&
                $refs['employeeSignature'].isEmpty())
          "
          label="Submit"
          @click="onSubmit"
        />
      </div>
    </div>
    <q-dialog
      :model-value="signatureRefName !== null"
      @update:model-value="signatureRefName = null"
      persistent
    >
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Clear Signature</div>
        </q-card-section>

        <q-card-section>
          <div>Are you sure you want to clear this signature?</div>
        </q-card-section>

        <q-card-actions class="row justify-between text-primary q-pt-none">
          <q-btn
            no-caps
            label="Cancel"
            color="grey-3"
            class="text-black"
            v-close-popup
          />
          <q-btn
            no-caps
            label="Clear Signature"
            color="red"
            @click="clearSignature()"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { mainMixin } from "../../mixins/index";
import { exportFile } from "quasar";
import { axiosInstance } from "../../boot/axios";
import trainingData from "./InserviceTrainingSession1Tasks";
import moment from "moment";

export default {
  name: "InserviceTrainingSession1",

  mixins: [mainMixin],

  props: {
    mediaId: String,
    acceptMediaType: String,
    acceptCapture: String,
    pinCode: String,
    serviceRequirement: Object,
    employeeId: String,
    firstName: String,
    lastName: String,
    department: String,
  },

  async mounted() {
    await this.loadSubmittedStatus();
    await this.loadSessions();
    await this.loadTaskStatus();

    setInterval(() => {
      this.onHeartbeat();
    }, 1000);

    // Stop the clock when closing the tab or navigating away.
    window.addEventListener("beforeunload", (event) => {
      this.onUserIdle();

      // Allowing time to post this session.
      // Beacon API won't permit an Authorization header.
      event.preventDefault();
      event.returnValue = "";
    });

    // Stop the clock when switching tabs.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        // They can continue listening while they quickly switch tabs, i.e., to check Facebook.
        //this.onUserIdle();
      } else if (document.visibilityState === "visible") {
        this.onInteraction();
      }
    });
  },

  computed: {
    taskCompletion() {
      return this.completedTasks / this.totalTasks;
    },
    totalTasks() {
      return Object.keys(this.videos).length + 1;
    },
    completedTasks() {
      return (
        Object.values(this.videos).filter((v) => !!v.watched).length +
        (this.handbookDownloaded ? 1 : 0)
      );
    },
    sortedHandbookVideos() {
      return Object.values(this.videos)
        .filter((v) => v.trainingType === "handbook")
        .sort((v1, v2) => v1.label.localeCompare(v2.label));
    },
    sortedTrainingVideos() {
      return Object.values(this.videos)
        .filter((v) => v.trainingType === "other")
        .sort((v1, v2) => v1.label.localeCompare(v2.label));
    },
  },

  methods: {
    getTotalSeconds() {
      const sessionSeconds = this.sessions.reduce(
        (sum, item) =>
          sum + (item.end.getTime() - item.start.getTime()) / 1000.0,
        0.0
      );
      const currentSeconds = this.getSecondsSinceCurrentSessionStart();
      return sessionSeconds + currentSeconds;
    },
    setProgress() {
      const totalSeconds = this.getTotalSeconds();
      const remainingSeconds = Math.max(
        this.config.maxSeconds - totalSeconds,
        0
      );

      if (remainingSeconds === 0) {
        this.progressLabel = "Training hours completed";
        this.onUserIdle();
        this.trainingTimeCompleted = true;
      } else {
        this.progressLabel = `${this.formatSeconds(
          Math.ceil(remainingSeconds)
        )} remaining`;
      }

      this.progress = totalSeconds / this.config.maxSeconds;
    },
    onHeartbeat() {
      if (
        this.getSecondsSinceLastInteraction() > this.config.maxIdleSeconds &&
        !this.videoPlaying
      ) {
        this.onUserIdle();
      }

      this.setProgress();
    },
    async onUserIdle() {
      if (this.currentSessionStart !== null) {
        this.sessions.push({
          start: this.currentSessionStart,
          end: new Date(),
        });
        this.currentSessionStart = null;
        await this.addSessions(this.sessions);
      }
    },
    getSecondsSinceLastInteraction() {
      return (new Date().getTime() - this.lastInteraction.getTime()) / 1000;
    },
    getSecondsSinceCurrentSessionStart() {
      return this.currentSessionStart === null
        ? 0.0
        : (new Date().getTime() - this.currentSessionStart.getTime()) / 1000;
    },
    onInteraction() {
      this.lastInteraction = new Date();
      this.currentSessionStart =
        this.currentSessionStart === null
          ? new Date()
          : this.currentSessionStart;
    },
    onEnded(video) {
      video.watched = true;
      this.markTaskCompletion(video.label);
      this.onInteraction();
      this.videoPlaying = null;
    },
    onPaused(video) {
      this.onInteraction();
      this.videoPlaying = null;
    },
    onPlaying(video) {
      this.onInteraction();
      this.videoPlaying = video;
    },
    async loadSubmittedStatus() {
      const payload = {};
      const { data } = axiosInstance
        .post(
          `${import.meta.env.BASE_URL}/expiring-service-requirements/fetch-submit-status/${this.mediaId}?deliveryMethod=ServiceRequirementInServiceTrainingSession1Response`,
          payload
        );

      this.submitted = !!data;
    },
    async loadSessions() {
      const payload = {};
      return axiosInstance
        .post(
          `${import.meta.env.BASE_URL}/expiring-service-requirements/fetch-sessions/${this.mediaId}?deliveryMethod=ServiceRequirementInServiceTrainingSession1Response`,
          payload
        )
        .then((response) => {
          response.data.forEach((session) => {
            this.sessions.push({
              start: moment(session.start).toDate(),
              end: moment(session.end).toDate()
            });
          });
        });
    },
    async loadTaskStatus() {
      const payload = {};
      return axiosInstance
        .post(
          `${import.meta.env.BASE_URL}/expiring-service-requirements/fetch-progress/${this.mediaId}?deliveryMethod=ServiceRequirementInServiceTrainingSession1Response`,
          payload
        )
        .then((response) => {
          response.data.forEach((task) => {
            if (task.taskName === "Download Handbook") {
              this.handbookDownloaded = task.taskComplete;
              this.handbookExpanded = !task.taskComplete;
            } else {
              const matchingVideo = Object.values(this.videos).find(
                (v) => v.label === task.taskName
              );
              if (matchingVideo) {
                matchingVideo.watched = task.taskComplete;
              }
            }
          });
        });
    },
    async onSubmit() {
      this.submitError = null;
      if (this.completedTasks < this.totalTasks) {
        this.$q.dialog({
          title: "Incomplete tasks",
          message: `${this.totalTasks -
            this
              .completedTasks} tasks have not yet been completed. Please complete all tasks before submitting.`,
          persistent: true,
        });
      } else if (this.getTotalSeconds() < this.config.maxSeconds) {
        this.$q.dialog({
          title: "Incomplete time",
          message: `You have not yet completed all ${this.formatSeconds(
            Math.ceil(this.config.maxSeconds)
          )} of training. Please review the handbook for the remaining ${this.formatSeconds(
            Math.ceil(this.config.maxSeconds - this.getTotalSeconds())
          )}.`,
          persistent: true,
        });
      } else {
        await this.onUserIdle();
        this.submit();
      }
    },
    async submit() {
      try {
        const surveyEntries = [
          {
            name: "completedTasks",
            value: this.completedTasks,
            required: true,
            notifyKeyword: null,
            dbField: null,
          },
          {
            name: "totalTasks",
            value: this.totalTasks,
            required: true,
            notifyKeyword: null,
            dbField: null,
          },
        ];
        const employeeSignature = this.$refs[
          "employeeSignature"
        ].saveSignature();
        const payload = {
          surveyEntries,
          employeeSignature64: employeeSignature.data,
          employeeId: this.employeeId,
          firstName: this.firstName,
          lastName: this.lastName,
          department: this.department,
          expiration: this.serviceRequirement.QualificationExpiration,
          sessions: this.sessions,
        };
        await axiosInstance
          .post(
            `${import.meta.env.BASE_URL}/expiring-service-requirements/save/${this.mediaId}?deliveryMethod=ServiceRequirementInServiceTrainingSession1Response`,
            payload
          )
          .then((response) => {
            this.submitted = true;
          });
      } catch {
        this.submitError = "An error occurred. Please try again.";
      }
    },
    async addSessions(sessions) {
      const payload = {
        sessions,
        employeeId: this.employeeId,
        firstName: this.firstName,
        lastName: this.lastName,
        department: this.department,
        expiration: this.serviceRequirement.QualificationExpiration,
      };
      return axiosInstance.post(
        `${import.meta.env.BASE_URL}/expiring-service-requirements/save-sessions/${this.mediaId}?deliveryMethod=ServiceRequirementInServiceTrainingSession1Response`,
        payload
      );
    },
    async markTaskCompletion(name) {
      const newStart = new Date();
      if (this.currentSessionStart !== null) {
        this.sessions.push({
          start: this.currentSessionStart,
          end: newStart,
        });
        this.currentSessionStart = newStart;
      } else {
        // Strange the timer wasn't running. Add session to mark this.
        this.sessions.push({
          start: moment(newStart).subtract(1, 'second').toDate(),
          end: newStart,
        });
        this.currentSessionStart = newStart;
      }

      this.tasks.push({
        name: name,
        complete: true,
      });
      const payload = {
        employeeId: this.employeeId,
        firstName: this.firstName,
        lastName: this.lastName,
        department: this.department,
        expiration: this.serviceRequirement.QualificationExpiration,
        sessions: this.sessions,
        tasks: this.tasks,
      };
      axiosInstance.post(
        `${import.meta.env.BASE_URL}/expiring-service-requirements/save-progress/${this.mediaId}?deliveryMethod=ServiceRequirementInServiceTrainingSession1Response`,
        payload
      );
    },
    async downloadHandbook() {
      this.downloading = true;
      this.onInteraction();

      try {
        const downloadLink = document.createElement("a");
        document.body.appendChild(downloadLink);
        downloadLink.href = this.handbookUrl;
        downloadLink.target = "_blank";
        downloadLink.download = "handbook.pdf";
        downloadLink.click();
        downloadLink.remove();

        this.handbookDownloaded = true;
        this.handbookExpanded = false;
        this.markTaskCompletion("Download Handbook");
      } finally {
        this.downloading = false;
      }
    },
    clearSignature() {
      const ref = this.$refs[this.signatureRefName];
      ref.clearSignature();
      this.signatureRefName = null;
      this.$forceUpdate();
    },
  },

  data: () => {
    const videos = trainingData.videos;
    Object.keys(videos).forEach((key) => {
      videos[key].watched = false;
      videos[key].load = false;
    });

    return {
      config: {
        maxIdleSeconds: 15 * 60,
        maxSeconds: 5 * 60 * 60, // This value also set on the server
      },
      progress: 0.0,
      progressLabel: "Loading",
      trainingTimeCompleted: false,
      videoPlaying: null,
      sessions: [],
      currentSessionStart: new Date(),
      lastInteraction: new Date(),
      acknowledged: "No",
      signatureRefName: null,
      handbookUrl:
        "https://tahelper.blob.core.windows.net/doc/AIH%20Handbook.pdf",
      handbookDownloaded: false,
      handbookExpanded: true,
      videos,
      submitted: false,
      downloading: false,
      submitError: null,
      tasks: [],
    };
  },
};
</script>

<style lang="scss" scoped>
.red-border {
  border: solid 6px $red-2;
}
</style>
