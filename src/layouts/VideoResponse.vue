<template>
  <q-layout view="lHh Lpr lFf" class="bg-indigo-1">
    <q-page-container>
      <q-page class="column justify-between">
        <q-toolbar class="row justify-center q-mt-md">
          <q-img
            :src="logoUrl"
            style="max-width: 250px"
            basic
            spinner-color="white"
            class="rounded-borders vertical-top"
          />
        </q-toolbar>
        <div class="row justify-center full-width" style="margin-bottom: 100px">
          <Video v-if="this.jwtToken" :jwtToken="this.jwtToken" :voice="this.voice" :video="this.video" :connected="this.connected" />
          <span v-if="!this.connected" class="text-h2 row justify-center full-width">
            <div class="col-12 row justify-center q-mb-xl">
              <span>Join Meeting</span>
            </div>
            <q-btn icon="call" round size="lg" color="green" @click="toggleConnect()" class="button-hover"></q-btn>
          </span>
        </div>

        <div></div>

        <q-toolbar v-if="this.connected" class="row justify-center bg-white q-py-md footer">
          <q-btn :icon="voice ? 'mic' : 'mic_off'" flat round size="lg" color="grey" @click="toggleMute()" class="button-hover"></q-btn>
          <q-btn :icon="video ? 'videocam' : 'videocam_off'" flat round size="lg" color="grey" @click="toggleVideo()" class="button-hover"></q-btn>
          <q-btn icon="call_end" round size="lg" color="red" @click="toggleConnect()" class="button-hover"></q-btn>
        </q-toolbar>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { axiosInstance } from "src/boot/axios";
import Video from "../components/Video";

export default {
  name: "VideoResponse",
  components: {
    Video
  },
  async created() {
    const id = this.$route.params.id;

    await axiosInstance
      .get(`${import.meta.env.BASE_URL}/video/videoData/${id}`)
      .then((response) => {
        this.logoUrl = response.data.logo;
        this.jwtToken = response.data.jwt;
      });
  },
  methods: {
    toggleMute() {
      this.voice = !this.voice;
    },
    toggleVideo() {
      this.video = !this.video;
    },
    toggleConnect() {
      this.video = true;
      this.voice = true;
      this.connected = !this.connected;
    }
  },
  data() {
    return {
      logoUrl: '',
      jwtToken: '',
      connected: false,
      voice: true,
      video: true
    };
  },
};
</script>

<style lang="scss" scoped>
.button-hover {
  border: 1px rgb(218, 218, 218) solid;
  transition: .2s ease-in-out;
  margin: 0 5px;

  &:hover {
    -webkit-box-shadow: 5px 9px 39px -15px #000000;
    box-shadow: 5px 9px 39px -15px #000000;
  }
}

.footer {
  position: fixed;
  bottom: 0;
}
</style>
