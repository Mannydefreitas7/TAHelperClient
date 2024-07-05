<template>
  <q-page v-if="activeTenant && !activeTenant.serviceSid">
    <div class="row justify-center content-center items-center">
      <div class="text-center">
        <h5>Please contact your administrator to use the chat module</h5>

        <div
          style="position: absolute; left: 50%; transform: translate(-50%); top: 60px"
        >
          <h5 style="margin-bottom: 15px">Chat Overview</h5>
          <q-media-player
              mobile-mode
              type="video"
              :autoplay="false"
              :show-big-play-button="true"
              big-play-button-color="primary"
              source="https://tahelper.blob.core.windows.net/training-media/wf-chat-module.mp4"
            />
        </div>
      </div>
    </div>
  </q-page>
  <q-layout
    v-else
    view="lHh lpR lff"
    container
    class="full-width"
    style="height: calc(100vh - 50px)"
  >
    <q-drawer
      v-model="navOpen"
      :width="400"
      show-if-above
      bordered
      :breakpoint="690"
    >
    <div class="absolute-top" style="z-index: 50;">
      <div class="bg-white q-py-xs">
        <q-toolbar class="text-black row q-gutter-sm justify-end">
          <div>
            <q-avatar
              :icon="rtConnectionStatus == 'connected' ? 'o_cloud_done' : 'o_cloud_off'"
              size="md"
              :color="rtConnectionStatus == 'connected' ? 'green-7' : 'grey-7'"
              text-color="white"
            />
            <span class="q-ml-sm text-capitalize text-grey-7">{{ rtConnectionStatus }}</span>
          </div>


          <q-space />
          <q-btn
            dense
            flat
            title="Manage chat tags"
            color="grey-9"
            icon="o_label"
            @click="openChatTagEditor()"
          >
            <q-tooltip>Manage chat tags</q-tooltip>
          </q-btn>
          <q-btn
            dense
            flat
            color="grey-9"
            :disabled="rtConnectionStatus != 'connected'"
            icon="refresh"
            @click="loadChats(true)"
          >
          <q-tooltip>Refresh</q-tooltip>
          </q-btn>

          <q-btn
            dense
            flat
            title="Create chat"
            color="grey-9"
            icon="chat"
            @click="createChat()"
          >
          <q-tooltip>Create chat</q-tooltip>
          </q-btn>

        </q-toolbar>
        <q-toolbar>

          <q-input
            dense
            filled
            v-model="chatMessageViewState.searchTerm"
            placeholder="Search"
            debounce="400"
            class="full-width no-border no-outline rounded-borders"
            @update:model-value="value => onSearch(value)"
            @clear="value => onSearchClear(value)"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

        </q-toolbar>
      </div>
      <q-separator />
    </div>

      <q-item dense v-ripple style="margin-top: 105px;">
        <q-item-section avatar>
          <q-icon color="secondary" name="archive" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Archived</q-item-label>
        </q-item-section>
        <q-item-section side >
          <q-toggle color="secondary" @update:model-value="loadChats(true)" v-model="chatViewState.showArchived"  />
        </q-item-section>
      </q-item>

      <template v-if="chatMessageViewState.searchTerm && chatMessageViewState.searchTerm.length > 0 && chats.length === 0">
        <div class="row items-center justify-center" style="height: calc(100vh - 200px);">
          <div class="column justify-center items-center">
            <q-icon name="search" size="lg" class="q-mb-sm text-grey-6" />
            <div class="text-body1">Chat <strong>"{{ chatMessageViewState.searchTerm }}"</strong> not found.</div>
            <q-btn @click="createChat()" label="Create" icon="chat" color="primary" unelevated class="q-mt-sm" />
          </div>

        </div>
      </template>
      <template v-else>

        <q-virtual-scroll
        ref="chatVirtualScroll"
        style="height: calc(100% - 150px);"
        :virtual-scroll-slice-size="chatViewState.pageSize"
        :items="chats"
        separator
        @virtual-scroll="details => onChatsVirtualScroll(details)"
      >
        <template v-slot="{ item: chat, index }">

          <template v-if="chat.name == 'Chatter'">
            <q-card flat bordered class="q-ma-sm"  title="Incoming messages">
              <q-item
                  clickable
                  v-ripple
                  :key="index"
                  :active="chat.id === selectedChat.id"
                  active-class="bg-grey-3"
                  class="chat-item q-pa-md"
                  @click="selectChat(chat)"
              >

                <q-item-section avatar v-if="!chat.showTagsSelect">
                  <q-avatar
                    icon="update"
                    size="lg"
                    color="purple"
                    text-color="white"
                  />
                </q-item-section>

                <q-item-section v-if="!chat.showTagsSelect">
                  <q-item-label class="text-weight-bolder" lines="1">
                    Chatter!
                  </q-item-label>
                  <q-item-label caption >
                    <div
                      v-html="
                        (chat.lastMessageBody && chat.lastMessageBody.length) > 20
                          ? chat.lastMessageBody.substring(0, 20) + '...'
                          : chat.lastMessageBody
                      "
                      class="ellipsis q-my-none"
                    />
                  </q-item-label>
                </q-item-section>

                <q-item-section side top v-if="!chat.showTagsSelect">
                  <q-item-label caption>{{
                    getDtFormatted(chat.lastMessageDateTime)
                  }}</q-item-label>
                  <div class="q-pa-sm q-gutter-sm">
                    <q-icon
                      name="circle"
                      size="xs"
                      color="primary"
                      v-if="chat.lastMessageSeen == false"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-card>

          </template>

          <template v-else>
            <q-item
              clickable
              v-ripple
              :key="index"
              :active="chat.id === selectedChat.id"
              active-class="bg-grey-3"
              class="chat-item"
              style="min-height: 80px;"
              @click="selectChat(chat)"
            >

            <q-item-section avatar v-if="!chat.showTagsSelect">
              <avatar
                :name="getChatLabel(chat, 15)"
                :size="40"
                color="white"
                v-if="!isPhoneNumberChat(chat)"
              />
              <q-avatar
                icon="person"
                size="lg"
                color="primary"
                text-color="white"
                v-else
              />
            </q-item-section>

            <q-item-section v-if="!chat.showTagsSelect">
              <q-item-label :class="{ 'text-weight-bolder': !chat.lastMessageSeen }" lines="2">{{
                getChatLabel(chat, 40)
              }}</q-item-label>
              <q-item-label caption>
                <p
                  v-html="
                    (chat.lastMessageBody && chat.lastMessageBody.length) > 20
                      ? chat.lastMessageBody.substring(0, 20) + '...'
                      : chat.lastMessageBody
                  "
                  class="ellipsis q-mb-none"
                />
              </q-item-label>
              <q-item-label caption>
                <q-badge
                  v-if="!chat.active"
                  color="orange"
                  key="archived_tag"
                  class="q-mb-xs q-mr-xs q-py-xs"
                >
                  Archived</q-badge
                >
                <q-badge
                    v-for="tag in chat.tags"
                    :key="tag.value"
                    multi-line
                    color="grey-3"
                    class="q-mb-xs q-mr-xs q-py-xs text-grey-8"
                  >
                  <strong>{{ tag.label }}</strong>
                </q-badge>
                <!-- <q-btn
                  class="chat-create-icon"
                  label="add tag"
                  color="primary"
                  padding="xs"
                  size="sm"
                  dense
                  flat
                  @click.stop.prevent="
                    chat.showTagsSelect = true;
                    selectedChatTags = chat.tags;
                  "
                /> -->
              </q-item-label>
            </q-item-section>

            <q-item-section side top v-if="!chat.showTagsSelect">
              <q-item-label caption>
              {{
                getDtFormatted(chat.lastMessageDateTime)
              }}
              <q-icon
                  name="circle"
                  style="font-size: 1em;"
                  color="primary"
                  v-if="chat.lastMessageSeen == false"
                />
              </q-item-label>
              <div class="q-pa-sm q-gutter-sm">
                <q-btn
                  class="chat-create-icon"
                  icon="sell"
                  padding="xs"
                  size="md"
                  dense
                  color="grey"
                  flat
                  @click.stop.prevent="
                    chat.showTagsSelect = true;
                    selectedChatTags = chat.tags;
                  "
                />
                <q-btn
                  icon="push_pin"
                  size="md"
                  flat
                  padding="xs"
                  :class="[chat.flaggedDateTime ? 'rotate-45' : 'chat-create-icon']"
                  :color="chat.flaggedDateTime ? 'red' : 'grey'"
                  @click.stop.prevent="() => flagChat(chat)"
                />
              </div>
            </q-item-section>

            <q-item-section v-if="chat.showTagsSelect">
              <!-- @click.stop.prevent="() => {} prevents event from bubbling up and clicking the item -->
              <div class="row jusify-center" @click.stop.prevent="() => {}">
                <q-select
                  v-model="selectedChatTags"
                  :options="availableTags"
                  outlined
                  dense
                  multiple
                  map-options
                  use-input
                  class="col"
                  @filter="filterTagsFn"
                >
                  <template v-slot:selected-item="scope">
                    <q-chip
                      removable
                      size="sm"
                      color="primary"
                      text-color="white"
                      @remove="scope.removeAtIndex(scope.index)"
                    >
                      {{ scope.opt.label }}
                    </q-chip>
                  </template>
                </q-select>

                <div clas="row justify-center items-center content-center">
                  <q-btn
                    color="primary"
                    label="Save"
                    size="sm"
                    unelevated
                    class="q-ml-sm"
                    @click.stop.prevent="
                      updateChatTags(chat);
                      chat.showTagsSelect = false;
                    "
                  />
                  <q-btn
                    color="red"
                    label="Cancel"
                    size="sm"
                    unelevated
                    class="q-ml-sm"
                    @click.stop.prevent="
                      chat.showTagsSelect = false;
                      selectedChatTags = [];
                    "
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>

          </template>
        </template>
      </q-virtual-scroll>

      </template>

    </q-drawer>

    <q-page-container class="fit">
      <q-page class="fit">
        <div style="height: calc(100vh - 50px);">
          <div class="text-black bg-white row">
            <div class="row justify-center items-center content-center">
              <q-btn
                v-if="$q.screen.lt.md && !navOpen"
                class="drawer-button z-top"
                :icon="navOpen ? 'chevron_left' : 'menu'"
                round
                flat
                @click="navOpen = !navOpen"
              />
            </div>

            <q-toolbar-title
              v-if="selectedChat.id !== undefined"
              class="q-ma-md row items-center"
            >
              <q-avatar
                v-if="selectedChat.name == 'Chatter'"
                icon="update"
                size="lg"
                class="q-mr-sm"
                color="purple"
                text-color="white"
              />
              <q-avatar
                v-else-if="isPhoneNumberChat(this.selectedChat)"
                icon="person"
                size="lg"
                class="q-mr-sm"
                color="primary"
                text-color="white"
              />
              <avatar
                v-else
                :name="getChatLabel(this.selectedChat, 15)"
                :size="40"
                class="q-mr-sm"
                color="white"
              />
              <div class="text-subtitle1 text-weight-bold">
                {{ getChatLabel(this.selectedChat, 60) }}
              </div>
            </q-toolbar-title>
            <div
              v-if="
                selectedChat.id !== undefined && selectedChat.name == 'Chatter'
              "
              class="row justify-center items-center q-gutter-md q-mr-md"
            >
              <q-checkbox
                :model-value="hideAcknowledgedMessages"
                @update:model-value="toggleHideAcknowledge"
                label="Hide Acknowledged"
                color="teal"
              />
            </div>
            <div
              v-if="selectedChat.id !== undefined"
              class="row justify-center items-center q-gutter-md q-mr-md"
            >
              <q-btn
                icon="refresh"
                dense
                flat
                @click="selectChat(selectedChat)"
              />
              <q-btn
                v-if="selectedChat.name !== 'Chatter' && selectedChat.active"
                icon="archive"
                label="Archive"
                color="orange"
                dense
                flat
                @click="() => (confirmArchiveChat = true)"
              />
              <q-btn
                v-if="selectedChat.name !== 'Chatter' && !selectedChat.active"
                icon="restore"
                label="Restore"
                color="green"
                dense
                flat
                @click="() => (confirmRestoreChat = true)"
              />
            </div>
          </div>

          <q-separator></q-separator>

          <div
            ref="infScrollTargetRef"
            :style="selectedChat.name == 'Chatter' ? 'height: calc(100vh - 250px);' : 'height: calc(100vh - 200px);'"
            style="overflow: auto; padding-bottom: 200px;"
            class="inf-scroll"
          >
            <q-infinite-scroll
              ref="infScroll"
              @load="onLoadMessages"
              :scroll-target="$refs.infScrollTargetRef"
              :offset="250"
              reverse
              class="inf-scroll"
            >
              <template slot="loading">
                <div class="row justify-center q-my-lg">
                  <q-spinner-dots color="grey-7" name="dots" size="30px" />
                </div>
              </template>

              <template v-if="currentMessages && currentMessages.length === 0">
                <div class="row justify-center q-my-lg">
                  <div
                    style="width: 100%; max-width: 975px"
                    class="q-mx-auto text-center"
                  >
                    <span class="text-body1">No messages for this chat</span>
                  </div>
                </div>
              </template>

              <div v-for="(message, index) in currentMessages" :key="index">
                <div class="q-pa-none row justify-center">
                  <div style="width: 100%;">
                    <q-chat-message
                      class="q-mx-md"
                      v-if="message.direction === 'Outbound'"
                      bg-color="white"
                      :stamp="getDtFormatted(message.dateTime)"
                      :key="message.id"
                      sent
                    >
                      <template v-slot:avatar>
                        <avatar
                          :name="message.sentBy ? message.sentBy : ``"
                          :size="35"
                          color="white"
                          class="q-ml-xs q-pa-xs"
                        ></avatar>
                      </template>
                      <template #name>
                        <div class="text-caption text-grey-8 q-mb-xs q-mr-xs">{{ message.sentBy }}</div>
                      </template>
                      <template #stamp>
                        <q-item class="no-padding row justify-between">
                          <q-item-section avatar>
                            <span>{{ getDtFormatted(message.dateTime) }}</span>
                          </q-item-section>

                          <q-item-section class="row q-gutter-xs no-padding" side>
                            <q-btn
                              no-caps
                              flat
                              dense
                              icon="group"
                              color="grey-9"
                              size="md"
                              @click="getMessageDetails(message.chatMessageId)">
                              <q-tooltip>View Recipients</q-tooltip>
                            </q-btn>
                          </q-item-section>
                        </q-item>
                      </template>
                      <div style="max-width: 380px" class="q-pa-xs">
                        <span v-html="message.message"></span>
                        <div v-if="message.surveyId" class="q-mt-sm">
                          <q-btn target="_blank" :href="getVideoLink(message.surveyId)" icon="videocam" outline no-caps size="md" color="primary" label="Join Video" />
                        </div>
                      </div>
                    </q-chat-message>
                    <q-chat-message
                      class="q-mx-md"
                      v-else
                      :key="message.id"
                      :size="selectedChat.name == 'Chatter' ? '11' : '6'"
                      :name="
                        message.sentByNumber
                          ? `${message.sentBy} (${message.sentByNumber})`
                          : message.sentBy
                      "
                      :bg-color="message.ackBy ? 'green-5' : 'grey-4'"
                    >
                      <template #name>
                          <div class="text-caption text-grey-8 q-mb-xs q-ml-xs">{{
                            message.sentByNumber
                            ? `${message.sentBy} (${message.sentByNumber})`
                            : message.sentBy }}</div>
                      </template>
                      <template v-slot:avatar>
                        <q-avatar
                          v-if="isPhoneNumberChat(selectedChat)"
                          icon="person"
                          size="lg"
                          color="primary"
                          text-color="white"
                        />
                        <avatar
                          v-else
                          :name="message.sentBy ? message.sentBy : ''"
                          :size="35"
                          color="white"
                          class="q-mr-xs q-pa-xs"
                        ></avatar>
                      </template>

                      <div class="full-width">
                        <span v-html="message.message" ></span>
                        <q-img
                          v-if="message.mediaUrl0"
                          :src="message.mediaUrl0"
                          @click="
                            selectedImage = message.mediaUrl0;
                            selectedMessage = message;
                            showSelectedImage = true;
                          "
                          @contextmenu="$event.preventDefault()"
                          class="cursor-pointer q-my-sm"
                        >
                          <template v-slot:error>
                            <div></div>
                          </template>
                        </q-img>
                      </div>

                      <template
                        v-slot:stamp
                        v-if="selectedChat.name == 'Chatter'"
                      >
                        <q-item class="no-padding row justify-between">
                          <q-item-section avatar>
                            <span
                              >Received
                              {{ getDtFormatted(message.dateTime) }}</span
                            >
                            <span v-if="message.ackBy"
                              ><strong
                                >Acknowledged by {{ message.ackBy }}</strong
                              ></span
                            >
                          </q-item-section>

                          <q-item-section class="row q-gutter-xs no-padding" side>

                              <q-btn
                                icon="reply"
                                outline
                                dense
                                color="grey-9"
                                size="md"
                                @click="createChat(message)"
                              >
                                <q-tooltip>QUICK REPLY</q-tooltip>
                              </q-btn>

                              <q-btn
                                v-if="!message.ackBy"
                                icon="done_all"
                                outline
                                color="grey-9"
                                dense
                                size="md"
                                @click="() => ackMessage(message)"
                              >
                                <q-tooltip>ACKNOWLEDGE MESSAGE</q-tooltip>
                              </q-btn>

                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:stamp v-else>
                        <span>{{ getDtFormatted(message.dateTime) }}</span>
                      </template>
                    </q-chat-message>
                  </div>
                </div>
              </div>
            </q-infinite-scroll>
          </div>

          <div
            class="row justify-center"
            v-if="this.selectedChat && this.selectedChat.name != 'Chatter'"
          >
            <div class="full-width q-px-md absolute-bottom q-mb-md">
              <q-editor
                ref="editor_ref"
                class="col"
                placeholder="Type a new message"
                min-height="10px"
                :disable="editChat || !selectedChat.id"
                @paste.native="evt => pasteCapture(evt)"
                v-model="messageToSend"
                :toolbar="[
                  ['undo', 'redo', 'removeFormat'],
                  [
                    'emojis',
                    'languages',
                    'token',
                    'surveyOptions',
                    'documentToken',
                    'mediaLinkToken',
                    'timekeepingToken',
                    'activitySheetToken',
                    'messageTemplateToken',
                    'complianceToken',
                    'formToken'
                  ]
                ]"
                :definitions="{
                  emojis: {
                    tip: 'Select EMOJI',
                    icon: 'face',
                    label: 'EMOJI',
                    handler: () => (showEmojiPicker = true)
                  }
                }"
              >
                <template #languages v-if="showLanguages">
                  <q-btn
                    icon="language"
                    :label="activeLanguageLabel"
                    size="10px"
                    flat
                    dense
                  >
                    <q-popup-proxy :breakpoint="100000">
                      <q-card>
                        <q-select
                          autofocus
                          v-model="language"
                          :options="availableLanguages"
                          @update:model-value="updateTenantChatLanguage"
                          emit-value
                          map-options
                          use-input
                          clearable
                          filled
                          dense
                          @filter="
                            (val, done) => {
                              languageSearchTerm = val;
                              done();
                            }
                          "
                          @blur="languageSearchTerm = null"
                          label="Language"
                        />
                      </q-card>
                    </q-popup-proxy>
                  </q-btn>
                </template>

                <template #token>
                  <q-btn-dropdown
                    dense
                    ref="token"
                    no-wrap
                    icon="code"
                    size="sm"
                    unelevated
                    color="white"
                    text-color="black"
                    label="MERGE FIELDS"
                  >
                    <q-list dense>
                      <q-item
                        tag="label"
                        clickable
                        @click="addToken('{{Employee}}')"
                      >
                        <q-item-section>Recipient Name</q-item-section>
                      </q-item>
                      <q-item tag="label" clickable @click="addVideoToken()">
                        <q-item-section>1:1 Video Link</q-item-section>
                      </q-item>
                      <q-item disable tag="label">
                        <q-item-section>Group Video Link</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>

                <template #surveyOptions>
                  <q-btn-dropdown
                    dense
                    ref="surveyOptions"
                    no-wrap
                    size="sm"
                    unelevated
                    color="white"
                    icon="poll"
                    text-color="black"
                    label="Survey"
                  >
                    <q-list dense>
                      <q-item
                        v-for="(item, index) in availableSurveys"
                        :key="index"
                        tag="label"
                        clickable
                        @click="addToken(`{{message_form_link_${item.id}}}`)"
                      >
                        <q-item-section>{{ item.name }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>

                <template #documentToken>
                  <q-btn-dropdown
                    dense
                    icon="description"
                    size="sm"
                    ref="documentToken"
                    no-wrap
                    unelevated
                    color="white"
                    text-color="black"
                    label="Document"
                  >
                    <q-list dense>
                      <q-item
                        v-for="(item, index) in availableDocuments"
                        :key="index"
                        tag="label"
                        clickable
                        @click="addToken(`{{document_${item.id}}}`)"
                      >
                        <q-item-section>{{ item.fileName }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>

                <template #mediaLinkToken>
                  <q-btn-dropdown
                    dense
                    size="sm"
                    ref="mediaLinkToken"
                    no-wrap
                    unelevated
                    icon="insert_link"
                    color="white"
                    text-color="black"
                    label="Media Link"
                  >
                    <q-list dense>
                      <q-item
                        v-for="(item, index) in availableMediaLinks"
                        :key="index"
                        tag="label"
                        clickable
                        @click="
                          addToken(`{{message_send_media_link_${item.id}}}`)
                        "
                      >
                        <q-item-section>{{ item.name }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>

                <template #messageTemplateToken>
                  <q-btn-dropdown
                    dense
                    size="sm"
                    icon="web"
                    ref="messageTemplateToken"
                    no-wrap
                    unelevated
                    color="white"
                    text-color="black"
                    label="Templates"
                  >
                    <q-list dense>
                      <q-item
                        v-for="(item, index) in messageTemplates"
                        :key="index"
                        tag="label"
                      >
                        <q-item-section
                          v-html="item.name"
                          clickable
                          @click="addToken(item.body, true)"
                        />
                        <q-item-section side>
                          <q-btn
                            flat
                            size="sm"
                            icon="edit"
                            @click="() => openMessageTemplateEditor(item)"
                          />
                        </q-item-section>
                      </q-item>

                      <q-item
                        class="text-primary q-py-md"
                        tag="label"
                        clickable
                        @click="() => openMessageTemplateEditor()"
                      >
                        <q-item-section avatar>
                          <q-icon name="add" />
                        </q-item-section>
                        <q-item-section class="text-center text-bold text-primary"
                          >Create Template</q-item-section
                        >
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>

                <template
                  v-if="availableTimekeepingCampaigns.length"
                  #timekeepingToken
                >
                  <q-btn-dropdown
                    dense
                    size="sm"
                    icon="date_range"
                    no-caps
                    ref="timekeepingToken"
                    no-wrap
                    unelevated
                    color="white"
                    text-color="black"
                    label="Timekeeping"
                  >
                    <q-list dense>
                      <q-item
                        v-for="(item, index) in availableTimekeepingCampaigns"
                        :key="index"
                        tag="label"
                        clickable
                        @click="addToken(getTimekeepingToken(item))"
                      >
                        <q-item-section>
                          {{ item.name }}
                          {{ item.messageTemplate | formatTimekeepingType }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>

                <template
                  v-if="availableActivitySheetCampaigns.length"
                  #activitySheetToken
                >
                  <q-btn-dropdown
                    dense
                    size="sm"
                    icon="date_range"
                    no-caps
                    ref="activitySheetToken"
                    no-wrap
                    unelevated
                    color="white"
                    text-color="black"
                    label="Activity Sheets"
                    >
                    <q-list dense>
                      <q-item
                        v-for="(item, index) in availableActivitySheetCampaigns"
                        :key="index"
                        tag="label"
                        clickable
                        @click="addToken(getTimekeepingToken(item))"
                      >
                        <q-item-section>
                          {{ item.name }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>

                <template #formToken>
                  <q-btn-dropdown
                    dense
                    size="sm"
                    icon="o_date_range"
                    no-caps
                    no-wrap
                    unelevated
                    color="white"
                    text-color="black"
                    label="Form Link"
                  >
                    <q-list dense>
                      <q-item
                        v-for="(item, index) in availableFormLinks"
                        :key="index"
                        tag="label"
                        clickable
                        @click="
                          addToken(
                            `{{form_link_${item.id}}}`
                          )
                        "
                      >
                        <q-item-section>{{ item.name }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>

                <template #complianceToken>
                  <q-btn-dropdown
                    dense
                    size="sm"
                    icon="o_gpp_good"
                    no-caps
                    no-wrap
                    unelevated
                    color="white"
                    text-color="black"
                    label="Compliance Link"
                  >
                    <q-list dense>
                      <q-item
                        v-for="(item, index) in availableComplianceLinks"
                        :key="index"
                        tag="label"
                        clickable
                        @click="
                          addToken(
                            `{{expiring_service_requirements_link_${item.id}}}`
                          )
                        "
                      >
                        <q-item-section>{{ item.name }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>
              </q-editor>

              <div class="row">
                <q-space />
                <q-btn
                  unelevated
                  color="primary"
                  class="q-mt-sm"
                  label="Send"
                  :disable="editChat || !selectedChat.id"
                  @click="confirmSendMessage"
                />
              </div>
            </div>
          </div>
          <div v-else>
            <q-separator />
              <div class="column content-center items-center q-py-md full-width">
                <q-icon name="comments_disabled" size="lg" color="grey-7" />
                <div class="text-grey-7">READ ONLY</div>
              </div>
          </div>


          <q-dialog v-model="editTags" persistent>
            <q-card style="width: 100%; max-width: 550px;">
              <q-card-section>
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-h6">Chat Tags</div>
                  </div>

                  <div class="col-auto">
                    <q-btn
                      label="Add"
                      flat
                      color="primary"
                      icon="add"
                      @click="addChatTag()"
                    />
                  </div>
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pa-none">
                <q-scroll-area style="height: 400px">
                  <q-list>
                    <q-item v-for="(tag, index) in tagsToEdit" :key="index">
                      <q-item-section v-if="tag.active">
                        <q-input filled label="Name" v-model="tag.name" />
                      </q-item-section>

                      <div class="col-auto" v-if="tag.active">
                        <q-btn dense flat icon="more_vert">
                          <q-menu cover auto-close>
                            <q-list>
                              <q-item
                                v-close-popup
                                clickable
                                v-ripple
                                @click="onDeleteTag(index)"
                              >
                                <q-item-section avatar>
                                  <q-avatar
                                    icon="delete"
                                    color="negative"
                                    text-color="white"
                                  />
                                </q-item-section>

                                <q-item-section>
                                  <q-item-label lines="1">Delete</q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>
                        </q-btn>
                      </div>
                    </q-item>
                  </q-list>
                </q-scroll-area>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="flex justify-end q-gutter-sm">
                  <q-btn flat label="Cancel" @click="clearTags" />

                  <q-btn unelevated label="Save" color="primary" @click="onTagSubmit" />
                </div>
              </q-card-section>
            </q-card>
          </q-dialog>

          <q-dialog v-model="showEmojiPicker">
            <q-card no-border>
              <q-card-section class="row items-center">
                <div class="text-h6">Select Emoji</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>

              <q-card-section class="q-pa-none">
                <VEmojiPicker
                  :showSearch="false"
                  @select="e => addToken(e.data)"
                />
              </q-card-section>
            </q-card>
          </q-dialog>

          <q-dialog v-model="showRecipients" position="top">
            <q-card style="width: 600px; max-width: 80vw">
              <q-card-section>
                <div class="text-h6">
                  Search contacts, groups, and integrations.
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-select
                  v-if="typeof selectedChat.id === 'undefined' || editChat"
                  v-model="selectedChatContacts"
                  :disable="!editChat"
                  :options="options"
                  :label="chats.length > 0 ? 'Recipients' : 'Enter Name'"
                  ref="qselect"
                  option-label="label"
                  input-debounce="400"
                  class="col"
                  filled
                  multiple
                  clearable
                  use-chips
                  use-input
                  autofocus
                  @keydown.tab.prevent="$refs.qselect.updateInputValue($event.target.value + ',')"
                  @filter="searchFn"
                  @update:model-value="clearSearchFilter"
                  @clear="selectedChatContacts = []"
                >
                  <template
                    v-slot:option="{ itemProps, itemEvents, opt, selected }"
                  >
                    <q-item v-bind="itemProps" v-on="itemEvents">
                      <q-item-section class="col">
                        <q-item-label>
                          <span class="text-grey">
                            {{ opt.type }}
                          </span>
                          {{ opt.label }}
                          <span
                            v-if="
                              opt.type === 'Integration Contact' ||
                                opt.type === 'Contact'
                            "
                          >
                            {{ opt.dateOfBirth ? `${opt.dateOfBirth}` : "" }}
                            {{
                              opt.phone ? `(${opt.phone})` : "(number missing)"
                            }}
                          </span>
                        </q-item-label>
                      </q-item-section>
                      <q-icon
                        v-if="selected"
                        name="check_circle"
                        size="sm"
                        class="align-middle"
                      />
                    </q-item>
                  </template>
                </q-select>

                <q-select
                  v-if="typeof selectedChat.id === 'undefined' || editChat"
                  v-model="selectedChat.tags"
                  :options="availableTags"
                  :disable="!editChat"
                  filled
                  multiple
                  use-input
                  use-chips
                  label="Tags"
                  autofocus
                  class="q-mt-md"
                  @filter="filterTagsFn"
                />
              </q-card-section>

              <q-card-actions class="row justify-end q-pa-md q-gutter-sm">
                <q-btn
                  flat
                  label="Cancel"
                  @click="editChat = false"
                  v-close-popup
                />
                <q-btn
                  unelevated
                  color="primary"
                  label="Save"
                  @click="saveChat"
                  v-close-popup
                />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="showSendMessage">
            <q-card style="width: 600px; max-width: 80vw">
              <q-card-section class="row items-center">
                <q-avatar icon="warning" color="primary" text-color="white" />
                <span class="q-ml-sm text-body1 text-weight-bold"> Are you sure you want to send this message to
                {{ getChatLabel(this.selectedChat, 60) }}?</span>
              </q-card-section>
              <q-card-actions class="bg-white text-teal">
                <q-space />
                <q-btn flat color="red" label="Cancel" v-close-popup />
                <q-btn
                  flat
                  color="primary"
                  label="Yes, send"
                  @click="sendMessage"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="showSelectedImage">
            <q-card style="width: 600px; max-width: 80vw">
              <q-card-section>
                <div class="row justify-between q-mb-sm">
                  <q-btn
                    icon="file_download"
                    color="primary"
                    @click="
                      downloadFile(
                        selectedImage,
                        selectedMessage.sentBy,
                        selectedMessage.dateTime
                      )
                    "
                  ></q-btn>
                  <q-btn
                    icon="close"
                    flat
                    round
                    @click="showSelectedImage = false"
                  ></q-btn>
                </div>
                <q-img
                  @contextmenu="$event.preventDefault()"
                  :src="selectedImage"
                  class="q-mb-sm"
                  alt=""
                >
                  <template v-slot:error>
                    <div></div>
                  </template>
                </q-img>
              </q-card-section>
            </q-card>
          </q-dialog>

          <q-dialog v-model="confirmArchiveChat">
            <q-card style="width: 600px; max-width: 80vw">
              <q-card-section class="row items-center">
                <q-avatar icon="archive" color="secondary" text-color="white" />
                <span class="q-ml-sm text-h6"
                  >Are you sure you want to archive this chat?</span
                >
              </q-card-section>

              <q-card-actions align="right">
                <q-space />
                <q-btn flat color="red" label="No, Cancel" v-close-popup />
                <q-btn
                  flat
                  label="Yes, Archive"
                  color="primary"
                  v-close-popup
                  @click="archiveToggle(true)"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="confirmRestoreChat">
            <q-card style="width: 600px; max-width: 80vw">
              <q-card-section>
                <div class="text-h6">Confirm</div>
              </q-card-section>

              <q-card-section class="row q-pt-none items-center">
                <q-avatar icon="restore" color="green" text-color="white" />
                <span class="q-ml-sm text-h6"
                  >Are you sure you want to restore this chat?</span
                >
              </q-card-section>

              <q-card-actions align="right">
                <q-btn filled label="Cancel" v-close-popup />
                <q-space />
                <q-btn
                  filled
                  label="restore"
                  color="green"
                  v-close-popup
                  @click="archiveToggle()"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog
            v-model="showEditTemplateDialog"
            ref="edit_template_dialog_ref"
            @show="
              () => (this.activeEditorRef = this.$refs.editor_template_ref)
            "
            @hide="() => (this.activeEditorRef = null)"
            persistent
          >
            <q-card style="width: 900px; max-width: 80vw;">
              <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">Message Template</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>
              <q-card-section>
                <div class="row">
                  <q-input
                    class="col-4 q-pb-xs"
                    placeholder="Template Name"
                    v-model="selectedMessageTemplate.name"
                    outlined
                    dense
                  />
                </div>
                <div class="row justify-center">
                  <div style="width: 975px; max-width: 975px;">
                    <q-editor
                      ref="editor_template_ref"
                      class="col q-mx-x2"
                      min-height="100px"
                      v-model="selectedMessageTemplate.body"
                      @paste.native="evt => pasteCapture(evt, 'editor_template_ref')"
                      :toolbar="[
                        ['undo', 'redo', 'removeFormat'],
                        ['emojis',
                         'token',
                         'surveyOptions',
                         'documentToken',
                         'mediaLinkToken',
                         'timekeepingToken',
                         'activitySheetToken',
                         'complianceToken',
                         'formToken'
                        ]
                      ]"
                      :definitions="{
                        emojis: {
                          tip: 'Select EMOJI',
                          icon: 'face',
                          label: 'EMOJI',
                          handler: () => (this.showEmojiPicker = true)
                        }
                      }"
                    >
                      <template #token>
                        <q-btn-dropdown
                          dense
                          no-caps
                          ref="token"
                          no-wrap
                          unelevated
                          color="white"
                          text-color="black"
                          label="Merge Field"
                        >
                          <q-list dense>
                            <q-item
                              tag="label"
                              clickable
                              @click="addToken('{{Employee}}')"
                            >
                              <q-item-section>Recipient Name</q-item-section>
                            </q-item>
                            <q-item
                              tag="label"
                              clickable
                              @click="addVideoToken()"
                            >
                              <q-item-section>1:1 Video Link</q-item-section>
                            </q-item>
                            <q-item disable tag="label">
                              <q-item-section>Group Video Link</q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                      </template>

                      <template #surveyOptions>
                        <q-btn-dropdown
                          dense
                          no-caps
                          ref="surveyOptions"
                          no-wrap
                          unelevated
                          color="white"
                          text-color="black"
                          label="Survey"
                        >
                          <q-list dense>
                            <q-item
                              v-for="(item, index) in availableSurveys"
                              :key="index"
                              tag="label"
                              clickable
                              @click="
                                addToken(`{{message_form_link_${item.id}}}`)
                              "
                            >
                              <q-item-section>{{ item.name }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                      </template>

                      <template #documentToken>
                        <q-btn-dropdown
                          dense
                          no-caps
                          ref="documentToken"
                          no-wrap
                          unelevated
                          color="white"
                          text-color="black"
                          label="Document"
                        >
                          <q-list dense>
                            <q-item
                              v-for="(item, index) in availableDocuments"
                              :key="index"
                              tag="label"
                              clickable
                              @click="addToken(`{{document_${item.id}}}`)"
                            >
                              <q-item-section>{{
                                item.fileName
                              }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                      </template>

                      <template #mediaLinkToken>
                        <q-btn-dropdown
                          dense
                          no-caps
                          ref="mediaLinkToken"
                          no-wrap
                          unelevated
                          color="white"
                          text-color="black"
                          label="Media Link"
                        >
                          <q-list dense>
                            <q-item
                              v-for="(item, index) in availableMediaLinks"
                              :key="index"
                              tag="label"
                              clickable
                              @click="
                                addToken(
                                  `{{message_send_media_link_${item.id}}}`
                                )
                              "
                            >
                              <q-item-section>{{ item.name }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                      </template>

                      <template
                        v-if="availableTimekeepingCampaigns.length"
                        #timekeepingToken
                      >
                        <q-btn-dropdown
                          dense no-caps
                          ref="timekeepingToken"
                          no-wrap
                          unelevated
                          color="white"
                          text-color="black"
                          label="Timekeeping"
                        >
                          <q-list dense>
                            <q-item
                              v-for="(item, index) in availableTimekeepingCampaigns"
                              :key="index"
                              tag="label"
                              clickable
                              @click="addToken(getTimekeepingToken(item))"
                            >
                              <q-item-section>
                                {{ item.name }}
                                {{ item.messageTemplate | formatTimekeepingType }}
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                      </template>

                      <template
                        v-if="availableActivitySheetCampaigns.length"
                        #activitySheetToken
                      >
                        <q-btn-dropdown
                          dense
                          size="sm"
                          icon="date_range"
                          no-caps
                          ref="activitySheetToken"
                          no-wrap
                          unelevated
                          color="white"
                          text-color="black"
                          label="Activity Sheets"
                          >
                          <q-list dense>
                            <q-item
                              v-for="(item, index) in availableActivitySheetCampaigns"
                              :key="index"
                              tag="label"
                              clickable
                              @click="addToken(getTimekeepingToken(item))"
                            >
                              <q-item-section>
                                {{ item.name }}
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                      </template>

                      <template #complianceToken>
                        <q-btn-dropdown
                          dense
                          no-caps
                          no-wrap
                          unelevated
                          color="white"
                          text-color="black"
                          label="Compliance Link"
                        >
                          <q-list dense>
                            <q-item
                              v-for="(item, index) in availableComplianceLinks"
                              :key="index"
                              tag="label"
                              clickable
                              @click="
                                addToken(
                                  `{{expiring_service_requirements_link_${item.id}}}`
                                )
                              "
                            >
                              <q-item-section>{{ item.name }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                      </template>

                      <template #formToken>
                        <q-btn-dropdown
                          dense
                          no-caps
                          no-wrap
                          unelevated
                          color="white"
                          text-color="black"
                          label="Form Link"
                        >
                          <q-list dense>
                            <q-item
                              v-for="(item, index) in availableFormLinks"
                              :key="index"
                              tag="label"
                              clickable
                              @click="
                                addToken(
                                  `{{form_link_${item.id}}}`
                                )
                              "
                            >
                              <q-item-section>{{ item.name }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                      </template>
                    </q-editor>

                    <label v-if="selectedMessageTemplate.createdByLine">
                      <b> Created by: </b>
                      {{ selectedMessageTemplate.createdByLine }}
                    </label>
                    <label v-if="selectedMessageTemplate.updatedByLine">
                      <b> Updated by: </b>
                      {{ selectedMessageTemplate.updatedByLine }}
                    </label>
                  </div>
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  v-if="selectedMessageTemplate.id"
                  label="Delete"
                  color="red"
                  @click="() => (showDeleteTemplateDialog = true)"
                  v-close-popup
                  filled
                />
                <q-space v-if="selectedMessageTemplate.id" />

                <q-btn label="Cancel" color="primary" v-close-popup />
                <q-btn
                  label="Save"
                  color="green"
                  @click="saveMessageTemplate()"
                  filled
                />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="showDeleteTemplateDialog" persistent>
            <q-card>
              <q-card-section class="row items-center">
                <q-avatar icon="delete" color="red" text-color="white" />
                <span class="q-ml-sm">
                  Are you sure you want to delete this message template?
                </span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="Cancel" color="primary" v-close-popup />
                <q-btn
                  label="Delete"
                  color="red"
                  @click="deleteMessageTemplate()"
                  v-close-popup
                  flat
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </q-page>
    </q-page-container>

    <q-dialog v-model="messageDetailsDialog.open">
      <q-card style="max-width: 500px; width: 80vw">
        <q-table
          binary-state-sort
          row-key="id"
          no-data-label="No Recipients"
          :rows="messageDetailsDialog.recipients"
          :columns="messageDetailsDialog.columns"
          :filter="messageDetailsDialog.searchTerm"
          :pagination="messageDetailsDialog.pagination"
        >
          <template #top-left>
            <h6 class="q-ma-none">Message Recipients</h6>
          </template>
          <template #top-right>
            <q-btn flat round icon="close" v-close-popup></q-btn>
          </template>
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="props.value == 'failed' ? 'red' : 'green'">
                {{props.value}}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </q-dialog>

    <q-dialog :model-value="loadingChats || loadingAll" persistent>
      <q-card
        style="width: 200px; height: 200px"
        class="row items-center justify-center"
      >
        <q-spinner-ios color="blue-9" size="80" />
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { date } from "quasar";
import chatApi from "../api/chat";
import documentApi from "../api/documents";
import { scroll } from "quasar";
import { mainMixin } from "../mixins/index";
import { mapState } from "pinia";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import VEmojiPicker from "vue3-emoji-picker";
import { languages } from "src/lib/shared.js";
import { useTenantStore } from "src/stores/tenantStore";
import Avatar from "vue3-avatar";

import pingAudioFile from "../statics/audio/ping.wav";
const pingAudio = new Audio(pingAudioFile);
pingAudio.muted = false;

export default {
  name: "Chat",
  mixins: [mainMixin],
  components: {
    VEmojiPicker,
    Avatar,
  },
  beforeUnmount() {
    this.disconnectRtUpdates();
  },
  filters: {
    formatTimekeepingType(val) {
      if (!val) {
        return "";
      }

      if (val.includes("{{message_timekeeping_correction_link_")) {
        return "(Timecard Correction)";
      } else if (val.includes("{{message_tasksheet_link_")) {
        return "(Tasksheet)";
      } else if (val.includes("message_activity_sheet")) {
        return "(Activity Sheet)";
      }

      return "";
    }
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"]),
    activeLanguageLabel() {
      const foundLanguage = languages.find(l => l.value === this.language);
      return foundLanguage?.label ?? "LANGUAGE";
    },
    currentMessages: function() {
      return this.selectedChatMessages;
    },
    availableTags: function() {
      return this.tags
        .filter(
          f =>
            f.name
              .toLowerCase()
              .trim()
              .indexOf(this.tagsSearch.toLowerCase().trim()) > -1 ||
            !this.tagsSearch
        )
        .map(tag => ({
          label: tag.name,
          value: tag.id
        }));
    },
    availableLanguages() {
      return languages
        .filter(
          l => !this.languageSearchTerm ||
               (!!this.languageSearchTerm && l.label.toLowerCase().indexOf(this.languageSearchTerm.toLowerCase()) > -1)
        );
    }
  },
  data() {
    return {
      navOpen: false,
      loadingChats: false,
      loadingAll: false,
      chatMessageViewState: {
        id: null,
        searchTerm: "",
        startIndex: 0,
        endIndex: 50,
        pageSize: 50
      },
      chatViewState: {
        searchTerm: "",
        startIndex: 0,
        endIndex: 50,
        showArchived: false,
        pageSize: 50
      },
      messageDetailsDialog: {
        open: false,
        searchTerm: null,
        recipients: [],
        pagination: {
          sortBy: "name",
          descending: false,
          rowsPerPage: 100,
        },
        columns: [
          {
            name: "name",
            align: "left",
            required: true,
            label: "Name",
            field: "name",
            sortable: true
          },
          {
            name: "status",
            align: "left",
            required: true,
            label: "Status",
            field: "status",
            sortable: true
          },
        ],
      },
      activeEditorRef: null,
      availableSurveys: [],
      availableDocuments: [],
      availableMediaLinks: [],
      availableComplianceLinks: [],
      availableFormLinks: [],
      availableTimekeepingCampaigns: [],
      availableActivitySheetCampaigns: [],
      messageTemplates: [],
      showEditTemplateDialog: false,
      showDeleteTemplateDialog: false,
      confirmArchiveChat: false,
      confirmRestoreChat: false,
      lastLoadedMessageIndex: 1,
      totalChats: 0,
      rtConnection: "",
      rtConnectionStatus: "",
      tagsSearch: "",
      showLanguages: false,
      language: "",
      languageSearchTerm: "",
      showEmojiPicker: false,
      showSendMessage: false,
      showRecipients: false,
      showSelectedImage: false,
      hideAcknowledgedMessages: false,
      editTags: false,
      chats: [],
      tags: [],
      tagsToEdit: [],
      options: [],
      messageToSend: "",
      selectedImage: "",
      selectedMessage: null,
      selectedChatContacts: [],
      editChat: false,
      tab: "all",
      selectedChat: {},
      selectedChatMessages: [],
      selectedChatTags: [],
      selectedMessageTemplate: {
        id: 0,
        name: "",
        body: "",
        createdBy: null,
        createdDateTime: null,
        updatedBy: null,
        updatedDateTime: null
      },
      emptyChat: {
        name: "",
        chatContacts: []
      },
      emptyChatTag: {
        name: "",
        active: true
      }
    };
  },
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        if (!this.activeTenant.serviceSid) {
          return;
        }

        try {
          this.loadingAll = true;
          await this.loadChats(true);
          await this.loadTags();
          await this.loadSurveys();
          await this.loadDocuments();
          await this.loadMediaLinks();
          await this.loadTimekeepingCampaigns();
          await this.loadActivitySheetCampaigns();
          await this.loadComplianceLinks();
          await this.loadFormLinks();
          await this.loadMessageTemplates();
          await this.initRealtimeSync();
        } finally {
          this.loadingAll = false;
        }
      },
      deep: true
    }
  },
  async created() {
    this.rtConnection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.BASE_URL}/chat-hub`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Error)
      .build();

    this.rtConnection.onclose(e => {
      if (this && this.rtConnectionStatus) {
        this.rtConnectionStatus = e ? e : "disconnected";
      }
    });
    this.rtConnection.onreconnecting(() => {
      if (this && this.rtConnectionStatus) {
        this.rtConnectionStatus = "reconnecting";
      }
    });
    this.rtConnection.onreconnected(() => {
      if (this && this.rtConnectionStatus) {
        this.rtConnectionStatus = "reconnected";
      }
    });

    window.addEventListener("beforeunload", async event => {
      await this.disconnectRtUpdates();
    });

    const hideAcknowledgedMessages = localStorage.getItem(
      "hideAcknowledgedMessages"
    );
    this.hideAcknowledgedMessages =
      hideAcknowledgedMessages === "true" ? true : false;

    const chatOptions = await chatApi.getSettings();
    this.showLanguages = !!chatOptions.language;

    const stickyLanguage = localStorage.getItem(
      `${this.activeTenant.id}_language`
    );
    this.language = stickyLanguage ?? chatOptions.language;
  },
  methods: {
    async getMessageDetails(id) {
      try {
        const response = await chatApi.getMessageDetails(id);
        this.messageDetailsDialog.searchTerm = null;
        this.messageDetailsDialog.recipients = response;
        this.messageDetailsDialog.open = true;
      } catch (error) {
        console.error('Error: ', error);
      }
    },
    getVideoLink(id) {
      return `${window.location.origin}/vr/${id}`;
    },
    updateTenantChatLanguage(val) {
      if (!val) {
        localStorage.removeItem(`${this.activeTenant.id}_language`);
        return;
      }

      localStorage.setItem(`${this.activeTenant.id}_language`, val);
    },
    confirmSendMessage() {
      var valid = false;
      if (this.messageToSend) {
        valid = true;
      }

      this.showSendMessage = valid;
    },
    isPhoneNumberChat(chat) {
      return chat.name && chat.name.length > 1 && !chat.name.charAt(0).match(/[a-z]/i);
    },
    getChatLabel(chat, limit) {
      return this.getSubStrDots(chat.name, limit);
    },
    addVideoToken() {
      const videoTokenName = "{{VideoLink}}";
      this.addToken(videoTokenName);
    },
    getTimekeepingToken({ id, messageTemplate }) {
      const getToken = (message, tokenName) => {
        const linkIndex = message.indexOf(tokenName);
        if (linkIndex > -1) {
          const endOfTokenIndex = message.indexOf("}}", linkIndex);
          const token = message.substring(linkIndex, endOfTokenIndex + 2);
          return token.substring(0, token.length - 2) + `_${id}` + "}}";
        } else {
          return "";
        }
      };

      const timesheetLink = getToken(
        messageTemplate,
        "{{message_timekeeping_correction_link_"
      );
      const tasksheetLink = getToken(
        messageTemplate,
        "{{message_tasksheet_link_"
      );
      const activitySheetLink = getToken(
        messageTemplate,
        "{{message_activity_sheet"
      );

      return timesheetLink || tasksheetLink || activitySheetLink;
    },
    addToken(value, overwrite = false) {
      if (this.activeEditorRef == null) {
        this.activeEditorRef = this.$refs.editor_ref;
      }

      if (overwrite) {
        this.activeEditorRef.runCmd("selectAll");
        this.activeEditorRef.runCmd("delete");
      }

      this.activeEditorRef.caret.restore();
      this.activeEditorRef.runCmd("insertHTML", value);
      this.activeEditorRef.focus();
    },
    toggleHideAcknowledge() {
      this.hideAcknowledgedMessages = !this.hideAcknowledgedMessages;
      localStorage.setItem(
        "hideAcknowledgedMessages",
        this.hideAcknowledgedMessages
      );
      this.selectChat(this.selectedChat);
    },
    clearSelected() {
      this.selectedChat = { ...this.emptyChat };
      this.selectedChatContacts = [];
      this.selectedChatMessages = [];
      this.editChat = false;
      this.showRecipients = false;
    },
    clearSearchFilter() {
      if (this.$refs.qselect !== undefined) {
        this.$refs.qselect.updateInputValue("");
      }
    },
    scrollToBottom() {
      setTimeout(() => {
        const { setVerticalScrollPosition } = scroll;

        if (this.$refs.infScrollTargetRef) {
          setVerticalScrollPosition(this.$refs.infScrollTargetRef, 100000);
        }

        if (this.$refs.infScroll) {
          setVerticalScrollPosition(this.$refs.infScroll.$el, 100000);
        }
      }, 250);
    },
    sortChatsFn(a, b) {
      if (a.name === "Chatter") {
        return -1;
      }

      if (b.name === "Chatter") {
        return 1;
      }

      if (a.flaggedDateTime && !b.flaggedDateTime) {
        return -1;
      }

      if (!a.flaggedDateTime && b.flaggedDateTime) {
        return 1;
      }

      if (a.lastMessageSeen === 0 && b.lastMessageSeen !== 0) {
        return -1;
      }

      if (a.lastMessageSeen !== 0 && b.lastMessageSeen === 0) {
        return 1;
      }

      return new Date(a.updatedDateTime) > new Date(b.updatedDateTime) ? -1 : 1;
    },
    mapIncomingChatsFn(chats) {
      const mappedChats = chats.map(chat => ({
        ...chat,
        tags: chat.tags.map(tag => ({
          label: tag.name,
          value: tag.id
        }))
      }));

      return mappedChats;
    },
    filterTagsFn(value, update) {
      update(() => {
        this.tagsSearch = value;
      });
    },
    addChatTag() {
      this.tagsToEdit.unshift({ ...this.emptyChatTag });
    },
    openChatTagEditor() {
      this.tagsToEdit = [...this.tags];
      this.editTags = true;
    },
    clearTags() {
      this.tagsToEdit = [];
      this.editTags = false;
    },
    onDeleteTag(index) {
      if (this.tagsToEdit[index].id) {
        this.tagsToEdit[index].active = false;
      } else {
        this.tagsToEdit.splice(index, 1);
      }
    },
    openMessageTemplateEditor(item) {
      this.showEditTemplateDialog = true;
      this.$refs.messageTemplateToken.hide();

      if (item) {
        this.selectedMessageTemplate = {
          id: item.id,
          name: item.name,
          body: item.body,
          createdBy: item.createdBy,
          createdDateTime: item.createdDateTime,
          updatedBy: item.updatedBy,
          updatedDateTime: item.updatedDateTime,
          createdByLine: item.createdBy
            ? `${item.createdBy} ${date.formatDate(
                item.createdDateTime,
                "MM/DD/YYYY"
              )}`
            : null,
          updatedByLine: item.updatedBy
            ? `${item.updatedBy} ${date.formatDate(
                item.updatedDateTime,
                "MM/DD/YYYY"
              )}`
            : null
        };
      } else {
        this.selectedMessageTemplate = {
          id: 0,
          name: "",
          body: "",
          createdBy: null,
          createdDateTime: null,
          updatedBy: null,
          updatedDateTime: null
        };
      }
    },
    async saveMessageTemplate() {
      this.selectedMessageTemplate.body = this.selectedMessageTemplate.body.trim();
      this.selectedMessageTemplate.name = this.selectedMessageTemplate.name.trim();

      if (
        !this.selectedMessageTemplate.name ||
        !this.selectedMessageTemplate.body
      ) {
        this.showErrorMessage(
          "Template name & message are required field. Please fill them and try again."
        );
        return;
      }

      await chatApi.saveMessageTemplate(this.selectedMessageTemplate);
      await this.loadMessageTemplates();
      this.$refs.edit_template_dialog_ref.hide();
      this.showSuccessMessage("Message template saved successfully");
    },
    async deleteMessageTemplate() {
      await chatApi.deleteMessageTemplate(this.selectedMessageTemplate.id);
      await this.loadMessageTemplates();
      this.showSuccessMessage("Message template deleted successfully");
    },
    async onTagSubmit() {
      try {
        const validTags = [];

        this.tagsToEdit.forEach((item, index) => {
          if (item.name && item.name.trim()) {
            if (!validTags.some(vg => vg.name === item.name)) {
              validTags.push(item);
            }
          }
        });

        const response = await chatApi.saveTags(validTags);
        this.tags = response;

        this.showSuccessMessage("Chat tags updated");
        this.clearTags();
      } catch (error) {
        console.error(error);
      }
    },
    async loadTags() {
      const tags = await chatApi.getTags();
      this.tags = tags;
    },
    async loadSurveys() {
      const response = await chatApi.getSurveys();
      this.availableSurveys = response;
    },
    async loadDocuments() {
      const documents = await documentApi.getMedia(true);
      this.availableDocuments = documents;
    },
    async loadMediaLinks() {
      const links = await chatApi.getMediaLinks();
      this.availableMediaLinks = links;
    },
    async loadMessageTemplates() {
      const templates = await chatApi.getMessageTemplates();
      this.messageTemplates = templates;
    },
    async loadComplianceLinks() {
      const links = await chatApi.getComplianceLinks();
      this.availableComplianceLinks = links;
    },
    async loadFormLinks() {
      const links = await chatApi.getFormLinks();
      this.availableFormLinks = links;
    },
    async loadTimekeepingCampaigns() {
      const response = await chatApi.getTimekeepingCampaigns();
      this.availableTimekeepingCampaigns = response;
    },
    async loadActivitySheetCampaigns() {
      const response = await chatApi.getActivitySheetCampaigns();
      this.availableActivitySheetCampaigns = response;
    },
    async searchFn(searchTerm, doneFn, abortFn) {
      if (searchTerm.length <= 2) {
        abortFn();
        return;
      }

      try {
        const response = await chatApi.lookupRecipient(searchTerm);
        this.options = response;

        const findDuplicateNumber = (phone) => this.selectedChatContacts.some(scc => this.formatPhoneNumber(scc.value) === this.formatPhoneNumber(phone));
        const validateNumber = (phone) => !!phone && phone.length >= 12;

        const possiblePhoneNumbers = searchTerm.split(',');
        if (possiblePhoneNumbers.length > 1) {
          const failedPhoneNumbers = [];

          possiblePhoneNumbers.forEach(phoneNumber => {
            const formattedNumber = this.formatPhoneNumber(phoneNumber);
            if (!!formattedNumber && validateNumber(formattedNumber) && !findDuplicateNumber(formattedNumber)) {
              const phoneContact = {
                type: "Phone",
                label: formattedNumber,
                value: formattedNumber
              };

              this.selectedChatContacts.push(phoneContact);
            } else {
              failedPhoneNumbers.push(phoneNumber);
            }
          });

          const newSearchTerm = failedPhoneNumbers.join(',');

          if (searchTerm !== newSearchTerm) {
            this.$refs.qselect.updateInputValue(newSearchTerm);
          }
        } else {
          const formattedNumber = this.formatPhoneNumber(searchTerm);
          if (!!formattedNumber && validateNumber(formattedNumber) && !findDuplicateNumber(formattedNumber)) {
            const phoneContact = {
              type: "Phone",
              label: formattedNumber,
              value: formattedNumber
            };

            this.options.push(phoneContact);
          }
        }
      } finally {
        doneFn();
      }
    },
    async flagChat(chat) {
      const response = await chatApi.toggleChatFlagged(chat);
      const foundIndex = this.chats.findIndex(f => f.id === response.id);
      if (foundIndex > -1) {
        this.selectedChat.flaggedDateTime = response.flaggedDateTime;
        response.tags = chat.tags;
        this.chats.splice(foundIndex, 1, response);
        this.chats = this.chats.sort(this.sortChatsFn);
      }
    },
    async updateChatTags(chat) {
      const payload = {
        ...chat,
        tags: [
          ...this.selectedChatTags
            .filter(f => f)
            .map(f => {
              return {
                id: f.value,
                name: f.label
              };
            })
        ]
      };

      try {
        await chatApi.saveChatTags(payload);
        const chatIndex = this.chats.findIndex(f => f.id === chat.id);
        if (chatIndex > -1) {
          this.chats[chatIndex].tags = this.selectedChatTags;
        }

        this.showSuccessMessage("Tags updated successfully");
      } catch (error) {
        console.error(error);
      } finally {
        this.selectedChatTags = [];
      }
    },
    async saveChat() {
      if (this.selectedChatContacts.length <= 0) {
        this.showErrorMessage(
          "Please select a contact or integration and try again"
        );
        return;
      }

      let chatName = "";
      for (const [i, contact] of this.selectedChatContacts.entries()) {
        if (i === this.selectedChatContacts.length - 1) {
          let fullChatName = contact.label;
          if (contact.dateOfBirth) {
            fullChatName += ` ${contact.dateOfBirth}`;
          }

          chatName += fullChatName;
          break;
        }

        let fullChatName2 = contact.label;
        if (contact.dateOfBirth) {
          fullChatName2 += ` ${contact.dateOfBirth}`;
        }

        chatName += fullChatName2 + ", ";
      }

      const formattedTags = this.selectedChat.tags
        ? [
            ...this.selectedChat.tags
              .filter(f => f)
              .map(f => {
                return {
                  id: f.value,
                  name: f.label
                };
              })
          ]
        : [];

      const payload = {
        ...this.selectedChat,
        name: chatName,
        tags: formattedTags,
        chatContacts: [
          ...this.selectedChatContacts
            .filter(f => f)
            .map(f => {
              return {
                chatId: this.selectedChat.id,
                contactId: f.type === "Contact" ? f.value : null,
                integrationId: f.type === "Integration" ? f.value : null,
                groupId: f.type === "Group" ? f.value : null,
                name: f.type === "Integration Contact" || f.type === "Phone" ? f.label : null,
                number: f.type === "Integration Contact" || f.type === "Phone" ? f.value : null,
                listFilter:
                  f.type === "Integration Contact" ? f.listFilter : null,
                listFilter2:
                  f.type === "Integration Contact" ? f.listFilter2 : null,
                pinCode: f.type === "Integration Contact" ? f.pinCode : null
              };
            })
        ]
      };

      try {
        if (!!this.selectedChat.id) {
          this.showErrorMessage(
            "Unable to create chat. Please close this dialog and try again."
          );
          return;
        }

        const response = await chatApi.addChat(payload);
        const sortedChats = this.mapIncomingChatsFn(
          response.items.sort(this.sortChatsFn)
        );

        this.chats = sortedChats;

        if (this.chats && this.chats.length > 0) {
          const createdChat = this.chats.find(f => f.name === chatName);
          if (createdChat) {
            this.selectChat(createdChat);
          }

          this.editChat = false;
          this.showSuccessMessage("Chat Saved");
        }
      } catch (error) {
        console.error(error);
        this.showErrorMessage(error);
      }
    },
    async downloadFile(imageSrc, sentBy, dateTime) {
      const response = await chatApi.getImage({ imageSrc });
      const imageURL = URL.createObjectURL(response);
      const link = document.createElement("a");

      link.href = imageURL;
      link.download = `${sentBy}-${this.getDtFormatted(
        dateTime,
        "MM-DD-YYYY-HH:mm-A"
      )}.jpeg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(response.data);
    },
    async sendMessage() {
      this.showSendMessage = false;

      // if (this.messageToSend.length >= 1400) {
      //   this.showErrorMessage('Messages cannot be longer than 1400 characters');
      //   return;
      // }

      if (
        typeof this.selectedChat === "undefined" ||
        typeof this.selectedChat.id === "undefined" ||
        typeof this.messageToSend === "undefined" ||
        this.messageToSend.trim() === ""
      ) {
        return;
      }

      const payload = {
        messageTemplate: this.messageToSend,
        chatId: this.selectedChat.id,
        languageCode: this.language === "null" ? null : this.language
      };

      const response = await chatApi.addChatMessage(payload);
      this.showSuccessMessage("Message sent!");

      this.messageToSend = "";
      this.selectedChat.lastMessageDateTime = response?.sentDateTime;
      this.selectedChat.lastMessageBody = response?.messageTemplate;
      this.selectedChat.lastMessageSeen = true;

      const foundChatIndex = this.chats.findIndex(
        i => i.id === this.selectedChat.id
      );
      this.chats[foundChatIndex] = this.selectedChat;

      this.chats = this.chats.sort(this.sortChatsFn);

      const newMessage = {
        chatMessageId: response.id,
        direction: "Outbound",
        dateTime: this.selectedChat.lastMessageDateTime,
        message: this.selectedChat.lastMessageBody,
        surveyId: response?.surveyId,
        sentBy: response?.sentBy
      };

      this.selectedChatMessages = [...this.selectedChatMessages, newMessage];

      this.scrollToBottom();
    },
    async selectChat(chat) {
      this.selectedChat = { ...chat };
      this.editChat = false;

      if (this.selectedChat.lastMessageId) {
        await chatApi.markChatSeen({
          chatId: this.selectedChat.id,
          messageId: this.selectedChat.lastMessageId
        });
      }

      this.$nextTick(() => {
        const scroller = this.$refs.chatVirtualScroll;
        const chatIndex = this.chats.findIndex(c => c.name === chat.name);
        scroller.scrollTo(chatIndex >= 0 ? chatIndex : 0);
      });

      this.selectedChat.lastMessageSeen = true;
      const foundChatIndex = this.chats.findIndex(
        c => c.id == this.selectedChat.id
      );
      if (foundChatIndex > -1) {
        this.chats.splice(foundChatIndex, 1, this.selectedChat);
      }

      await this.loadSelectedChatMessages(true);
    },
    async onLoadMessages(index, done) {
      if (this.currentMessages.length === 0) {
        // nothing to do.
        done(true);
        return;
      }

      if (index == this.lastLoadedMessageIndex) {
        // While pushing up against the end of the scroll
        // this event keeps firing
        done();
        return;
      }

      const prevEndIndex =
        this.lastLoadedMessageIndex * this.chatMessageViewState.pageSize;
      const nextEndIndex = index * this.chatMessageViewState.pageSize;
      const nextStartIndex = nextEndIndex - this.chatMessageViewState.pageSize;

      // console.log('prev endindex ' + prevEndIndex);
      // console.log('load range: ' + nextStartIndex + '-' + nextEndIndex);

      if (nextEndIndex > prevEndIndex) {
        this.chatMessageViewState.startIndex = nextStartIndex;
        this.chatMessageViewState.endIndex = nextEndIndex;
        await this.loadSelectedChatMessages();
        this.lastLoadedMessageIndex = index;
      }

      done();
    },
    async loadSelectedChatMessages(resetList) {
      if (resetList) {
        this.lastLoadedMessageIndex = 1;
        this.chatMessageViewState.startIndex = 0;
        this.chatMessageViewState.endIndex = this.chatMessageViewState.pageSize;
        this.selectedChatMessages = [];

        if (this.$refs.infScroll) {
          this.$refs.infScroll.reset();
        }
      }

      try {
        const showAcknowledged =
          this.selectedChat?.name === "Chatter"
            ? this.hideAcknowledgedMessages
            : false;
        const payload = {
          ...this.chatMessageViewState,
          id: this.selectedChat.id,
          hideAcknowledged: showAcknowledged
        };

        const response = await chatApi.findChatMessages(payload);
        this.selectedChatMessages = response.items.concat(
          this.selectedChatMessages
        );
        if (response.items.length > 0) {
          // console.log('resume');
          this.$refs.infScroll?.resume();
        } else {
          // console.log('stop');
          this.$refs.infScroll?.stop();
        }
      } catch (error) {
        console.error(error);
        this.showErrorMessage(error);
      }
    },
    async createChat(message) {
      if (message) {
        const existingChat = this.chats.find(
          chat => chat.name == message.sentBy
        );
        if (existingChat) {
          this.selectChat(existingChat);
        } else {
          const payload = {
            name: message.sentBy,
            chatContacts: [
              {
                name: message.sentBy,
                number: message.sentByNumber
              }
            ]
          };

          try {
            const response = await chatApi.addChat(payload);
            const sortedChats = this.mapIncomingChatsFn(
              response.items.sort(this.sortChatsFn)
            );

            this.chats = sortedChats;
            if (this.chats && this.chats.length > 0) {
              const createdChat = this.chats.find(
                f => f.name === message.sentBy
              );
              if (createdChat) {
                this.selectChat(createdChat);
              }

              this.editChat = false;
              this.showSuccessMessage("Chat Saved");
            }
          } catch (error) {
            console.error(error);
            this.showErrorMessage(error);
          }
        }
      } else {
        this.clearSelected();
        this.editChat = true;
        this.showRecipients = true;
      }
    },
    async archiveToggle(archiving) {
      if (
        typeof this.selectedChat === "undefined" ||
        typeof this.selectedChat.id === "undefined"
      ) {
        return;
      }

      const response = chatApi.archiveToggle(this.selectedChat.id);
      if (archiving) {
        this.chats = this.chats.filter(f => f.id !== this.selectedChat.id);
        this.totalChats--;

        this.clearSelected();
        this.showSuccessMessage("Chat Archived");
      } else {
        const foundIndex = this.chats.findIndex(
          f => f.id === this.selectedChat.id
        );
        if (foundIndex > -1) {
          this.selectedChat.active = 1;
          this.chats.splice(foundIndex, 1, this.selectedChat);
        }

        this.showSuccessMessage("Chat Restored");
      }
    },
    async onChatsVirtualScroll(details) {
      const { from, to, index, direction } = details;

      if (from < 0 || to < 0) {
        return; // happens on init
      }

      const ordinalIndex = index + 1;
      if (
        direction == "increase" &&
        ordinalIndex >= this.chatViewState.endIndex
      ) {
        const currentPageIndex = Math.floor(
          (ordinalIndex + 1) / this.chatViewState.pageSize
        );
        const startIndex = currentPageIndex * this.chatViewState.pageSize;
        const endIndex = (currentPageIndex + 1) * this.chatViewState.pageSize;

        this.chatViewState.startIndex = startIndex;
        this.chatViewState.endIndex = endIndex;
        await this.loadChats();
      } else if (direction == "decrease") {
        // nothing to do, we have data in memory
      }
    },
    async loadChats(resetList) {
      this.loadingChats = true;

      if (resetList) {
        this.chatViewState.startIndex = 0;
        this.chatViewState.endIndex = this.chatViewState.pageSize;

        this.chats = [];
        this.selectedChatMessages = [];
      }

      try {
        const response = await chatApi.findChats(this.chatViewState);
        const sortedChats = this.chats
          .concat(this.mapIncomingChatsFn(response.items))
          .sort(this.sortChatsFn);

        if (sortedChats.length > 0) {
          this.selectedChat = { ...sortedChats[0] };
          this.chats = sortedChats;
          this.totalChats = response.itemCount || 0;
          if (this.$refs && this.$refs.chatVirtualScroll) {
            this.$refs.chatVirtualScroll.refresh(-1); // -1 keep scroll position
          }
          await this.loadSelectedChatMessages(true);
        } else {
          this.clearSelected();
        }
      } catch (error) {
        console.error(error);
        this.showErrorMessage(error);
      } finally {
        this.loadingChats = false;
      }
    },
    async onSearch(value) {
      if (value === null) {
        return;
      }

      this.chatViewState.searchTerm = "";
      this.chatViewState.startIndex = 0;
      this.chatViewState.endIndex = this.chatViewState.pageSize;

      if (!this.strIsEmptyOrSpaces(value) && value.length <= 2) {
        return;
      }

      this.chatViewState.searchTerm = value;
      await this.loadChats(true);
    },
    async onSearchClear(value) {
      console.log(value)
      this.chatViewState.searchTerm = "";
      this.chatViewState.startIndex = 0;
      this.chatViewState.endIndex = this.chatViewState.pageSize;

      await this.loadChats(true);
    },
    async ackMessage(message) {
      await chatApi.markChatMessageSeen(message.messageId);

      const index = this.selectedChatMessages.findIndex(
        m => m.messageId === message.messageId
      );
      if (index > -1) {
        const name = localStorage.getItem("user-info-name");
        message.ackBy = name || "You";
        this.selectedChatMessages.splice(index, 1, message);
      }
    },
    async disconnectRtUpdates() {
      this.rtConnection.off("NewMessage");
      await this.rtConnection.stop();
      if (this && this.rtConnectionStatus) {
        this.rtConnectionStatus = "";
      }
    },
    async initRealtimeSync() {
      if (this.rtConnectionStatus !== "disconnected") {
        await this.disconnectRtUpdates();
      }

      await this.rtConnection
        .start()
        .then(() => (this.rtConnectionStatus = "connected"))
        .catch(e => console.error(e));

      const tid = `t-${JSON.stringify(this.activeTenant.id)}`;
      await this.rtConnection.invoke("ConnectByTenant", tid);
      this.rtConnection.on("NewMessage", payload => {
        const { message } = payload;

        const foundChatIndex = this.chats.findIndex(f => f.id === payload.id);
        if (foundChatIndex > -1) {
          const chat = {
            ...this.chats[foundChatIndex],
            lastMessageBody: message.message,
            lastMessageDateTime: message.dateTime,
            lastMessageId: message.messageId,
            lastMessageSeen: this.selectedChat.id === payload.id
          };

          this.chats.splice(foundChatIndex, 1, chat);
          if (this.selectedChat.id === payload.id) {
            this.selectedChatMessages.push(message);

            this.scrollToBottom();
          }

          this.chats = this.chats.sort(this.sortChatsFn);
        } else {
          const chat = {
            ...payload,
            lastMessageBody: message.message,
            lastMessageDateTime: message.dateTime,
            lastMessageId: message.messageId,
            lastMessageSeen: false
          };

          this.chats = [chat].concat(this.chats).sort(this.sortChatsFn);
        }

        if (pingAudio) {
          pingAudio.play();
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@font-face {
  font-family: NotomojiColor;
  font-weight: 400;
  font-display: swap;
  src: url(https://cdn.glitch.com/61908de1-dd0a-4359-a54b-6cb6d41bb5fd%2FNotoColorEmoji.ttf?1513108808150)
    format("truetype");
}

.chat-sidebar {
  width: 100%;
}
.chat-messages-container {
  width: 100%;
}

.chat-create-icon {
  visibility: hidden;
}
.chat-item:hover .chat-create-icon {
  visibility: visible;
}

.inf-scroll {
  &::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
}

@media (min-width: 599px) {
  .chat-sidebar {
    width: 300px;
  }
  .chat-messages-container {
    width: calc(100% - 310px);
  }
}

@media (min-width: 1340px) {
  .chat-sidebar {
    width: 400px;
  }

  .chat-messages-container {
    width: calc(100% - 410px);
  }
}
</style>
