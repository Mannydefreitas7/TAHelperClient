<template>
  <div class="q-pa-sm">
    <div class="column items-center">
      <q-card
        bordered
        flat
        style="border-top: 6px solid #7ac482; margin: 20px 0; width: 100%; height: 300px"
      >
        <q-card-section class="q-mx-md text-center">
          <h4 style="margin: 0; font-weight: bold;">Contact Us</h4>
          <p style="margin: 0; font-size: 18px; margin-bottom: 25px">
            We're here to help
          </p>
          <a
            href="mailto:support@viulogix.com"
            style="text-decoration: none; color: #6697c4; font-size: 15px"
          >
            <strong>support@viulogix.com</strong>
          </a>

          <div class="q-my-xs" style="font-size: 20px; color: #adadad">or</div>

          <div class="row justify-center">
            <button
              style="color: white; background: #7ac482; padding: 5px 40px; border: none; border-radius: 50px; cursor: pointer"
              @click="$drift.openChat()"
            >
              <strong>Chat With Us</strong>
            </button>
          </div>

          <div class="q-my-xs" style="font-size: 20px; color: #adadad">or</div>

          <p style="margin: 0; font-size: 18px; color: #404040">
            Watch some tutorials below
          </p>
        </q-card-section>
      </q-card>
    </div>

    <q-list>
      <q-expansion-item
        v-for="section in sections"
        :key="section.title"
        default-opened
        :icon="section.icon"
        :label="section.title"
        class="q-my-sm"
        header-class="text-h5 text-bold bg-white"
        style="border: 1px solid rgba(0, 0, 0, 0.1)"
      >
        <q-separator></q-separator>
        <div
          class="row justify-center q-gutter-sm q-py-md q-mt-none bg-grey-1 full-width"
        >
          <q-card class="card" v-for="video in section.videos" :key="video.title">
            <q-card-section class="q-pa-xs q-pl-sm">
              <p class="card-header">{{ video.title }}</p>
            </q-card-section>

            <q-media-player
              mobile-mode
              class="q-ma-sm"
              type="video"
              :autoplay="false"
              :show-big-play-button="false"
              :source="video.src"
            />
          </q-card>
        </div>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script>
import VideoHelp from "components/VideoHelp";

export default {
  name: "Help",
  components: {
    VideoHelp,
  },
  data() {
    return {
      sections: [
        {
          icon: 'dashboard',
          title: 'Dashboard',
          videos: [{
            title: 'Immediate responses',
            src: 'https://tahelper.blob.core.windows.net/training-media/high-priority-response.mp4'
          }]
        },
        {
          icon: 'contacts',
          title: 'Contacts',
          videos: [{
            title: 'Create a contact',
            src: 'https://tahelper.blob.core.windows.net/training-media/roh_create_contact.mp4'
          }]
        },
        {
          icon: 'chat',
          title: 'Chats',
          videos: [{
            title: 'Chat module overview',
            src: 'https://tahelper.blob.core.windows.net/training-media/wf-chat-module.mp4'
          }]
        },
        {
          icon: 'description',
          title: 'Documents',
          videos: [{
            title: 'Documents overview',
            src: 'https://tahelper.blob.core.windows.net/training-media/documents-overview.mp4'
          },
          {
            title: 'Document sharing',
            src: 'https://tahelper.blob.core.windows.net/training-media/file-sharing.mp4'
          }]
        },
        {
          icon: 'campaign',
          title: 'Campaigns',
          videos: [{
            title: 'Available shifts login',
            src: 'https://tahelper.blob.core.windows.net/training-media/wf-available-shifts-login.mp4'
          },
          {
            title: 'Available shifts portal',
            src: 'https://tahelper.blob.core.windows.net/training-media/wf-available-shifts-portal.mp4'
          }]
        }
      ]
    };
  }
};
</script>

<style lang="scss">
.card {
  width: 100%;
  max-width: 300px;
  padding: 0;
}
.card-header {
  font-size: 20px;
  font-weight: bold;
  line-height: 20px;
  margin: 5px 0;
  text-align: center;
}
</style>
