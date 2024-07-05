<template>
  <q-layout
    view="lHh lpR lff"
    container
    class="full-width"
    style="height: calc(100vh - 50px)"
  >
    <q-drawer
      v-model="navOpen"
      :width="380"
      show-if-above
      bordered
      :breakpoint="690"
    >
      <q-scroll-area class="fit">
        <div class="row justify-between q-px-md q-pt-sm q-mb-sm">
          <span class="text-h5 text-weight-bold">Campaigns</span>
          <q-btn
            flat
            color="primary"
            icon="add"
            label="Create"
            @click="createCampaign()"
          />
        </div>
        <q-toolbar>
          <q-input
            dense
            filled
            v-model="searchTerm"
            placeholder="Search"
            debounce="400"
            class="full-width no-border no-outline rounded-borders"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-toolbar>

        <q-item dense v-ripple class="bg-grey-2">
          <q-item-section avatar>
            <q-icon color="secondary" name="archive" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Archived</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              color="secondary"
              @update:model-value="loadData()"
              v-model="showAllCampaigns"
            />
          </q-item-section>
        </q-item>
        <div v-for="(campaign, index) in availableCampaigns" :key="index">
          <q-item
            clickable
            v-ripple
            :active="campaign.id === selectedCampaign.id"
            active-class="bg-grey-3"
            @click="selectCampaign(campaign)"
          >
            <q-item-section avatar>
              <q-avatar
                icon="campaign"
                size="lg"
                class="q-mr-sm"
                color="grey-9"
                text-color="white"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label v-if="campaign.name">
                <span class="text-weight-bold">{{ campaign.name }}</span>
              </q-item-label>
              <q-item-label v-else>New Campaign</q-item-label>

              <q-item-label
                v-if="campaign.timeOfDay && !campaign.paused && !campaign.draft"
                caption
              >
                {{ scheduleDisplay(campaign) }}
              </q-item-label>
              <q-item-label v-if="campaign.lastRun" caption
                >Last run {{ campaign.lastRun }}
              </q-item-label>
              <q-item-label
                v-if="campaign.active && !campaign.paused && !campaign.draft"
                caption
                >{{ nextExecutionDisplay(campaign) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div v-if="!campaign.active">
                <q-badge color="orange">Archived</q-badge>
                <q-space />
              </div>
              <div v-if="campaign.active && campaign.draft">
                <q-badge color="blue-6">
                  Draft
                  <q-tooltip>
                    Campaigns will not run in draft mode. <br />
                    Edit and select Go-Live to exit draft mode.
                  </q-tooltip>
                </q-badge>
                <q-space />
              </div>
              <div v-if="campaign.active && campaign.paused">
                <q-badge color="orange">Paused</q-badge>
                <q-space />
              </div>
              <div v-if="campaign.lastRunStatus">
                <q-badge v-bind:color="lastRunStatusColor(campaign)">
                  {{campaign.lastRunStatus}}
                </q-badge>
                <q-space />
              </div>
              <div v-if="campaign.serviceSid">
                <q-badge color="blue">Dedicated</q-badge>
              </div>
            </q-item-section>
          </q-item>

          <q-separator />
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="fit">
      <q-page class="fit bg-white">
        <q-item>
          <q-item-section avatar>
            <q-avatar
              icon="campaign"
              size="lg"
              class="q-mr-sm"
              color="grey-9"
              text-color="white"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Campaign</q-item-label>
            <q-item-label class="text-weight-bold">{{
              selectedCampaign.name
            }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row q-gutter-sm">
              <q-btn-dropdown
                ref="exportRepliesDropdown"
                flat
                color="grey-3"
                text-color="black"
                label="Export Messages"
                size="small"
              >
                <q-list>
                  <q-item
                    clickable
                    v-close-popup
                    @click="exportCampaignReport(0)"
                  >
                    <q-item-section>
                      <q-item-label>Today</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="exportCampaignReport(1)"
                  >
                    <q-item-section>
                      <q-item-label>Last 7 Days</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="exportCampaignReport(2)"
                  >
                    <q-item-section>
                      <q-item-label>Last 30 Days</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="exportCampaignReport(3)"
                  >
                    <q-item-section>
                      <q-item-label>All Time</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable>
                    <q-item-section>
                      <q-item-label>
                        Select Date...
                        <q-icon
                          style="font-size: 1.5em; padding-left: 20px"
                          name="event"
                        />
                      </q-item-label>
                    </q-item-section>
                    <q-popup-proxy
                      @before-show="updateProxyDate"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="proxyDate"
                        mask="MM/DD/YY"
                        :options="(value) => value <= todayDate"
                        no-unset
                      >
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn
                            label="Cancel"
                            color="primary"
                            flat
                            v-close-popup
                          />
                          <q-btn
                            label="OK"
                            color="primary"
                            flat
                            @click="
                              () => {
                                $refs.exportRepliesDropdown.hide();
                                fetchMessageRecipientsByDate(proxyDate);
                              }
                            "
                            v-close-popup
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-badge
                color="blue-6"
                class="q-px-md q-py-sm"
                v-if="!editForm && selectedCampaign && selectedCampaign.draft"
              >
                <strong>Draft</strong>
                <q-tooltip>
                  Campaigns will not run in draft mode. <br />
                  Edit and select Go-Live to exit draft mode.
                </q-tooltip>
              </q-badge>
              <q-btn-dropdown
                v-if="!editForm"
                dense
                flat
                dropdown-icon="more_vert"
              >
                <q-list>
                  <q-item clickable v-ripple @click="editForm = true">
                    <q-item-section avatar top>
                      <q-avatar
                        icon="create"
                        color="secondary"
                        text-color="white"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Edit</q-item-label>
                      <q-item-label caption>Change this campaign</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    :disable="this.selectedCampaign.id == null"
                    @click="confirmRunNow = true"
                    v-if="!!selectedCampaign.active"
                  >
                    <q-item-section avatar top>
                      <q-avatar
                        icon="sync"
                        color="secondary"
                        text-color="white"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Run</q-item-label>
                      <q-item-label caption>Send messages now</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    :disable="selectedCampaign.id == null"
                    v-if="selectedCampaign.active && !selectedCampaign.draft"
                    @click="toggleCampaignPause"
                  >
                    <q-item-section avatar top>
                      <q-avatar
                        :icon="selectedCampaign.paused ? 'play_arrow' : 'pause'"
                        :color="selectedCampaign.paused ? 'green' : 'orange'"
                        text-color="white"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">{{
                        selectedCampaign.paused ? "Resume" : "Pause"
                      }}</q-item-label>
                      <q-item-label caption>{{
                        selectedCampaign.paused
                          ? "Resume scheduled campaign messages"
                          : "Pause scheduled campaign messages"
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    :disable="selectedCampaign.id == null"
                    v-if="selectedCampaign.active && selectedCampaign.draft"
                    @click="goLive"
                  >
                    <q-item-section avatar top>
                      <q-avatar
                        icon="public"
                        color="green"
                        text-color="white"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Go Live</q-item-label>
                      <q-item-label caption>
                        Start scheduled campaign messages
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    v-if="
                      this.selectedCampaign.id != null &&
                      !this.selectedCampaign.active
                    "
                    @click="restoreCampaign()"
                  >
                    <q-item-section avatar top>
                      <q-avatar
                        icon="archive"
                        color="orange"
                        text-color="white"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Restore</q-item-label>
                      <q-item-label caption>
                        Show and send future campaigns
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    v-if="
                      this.selectedCampaign.id != null &&
                      this.selectedCampaign.active
                    "
                    @click="confirmDelete = true"
                  >
                    <q-item-section avatar top>
                      <q-avatar
                        icon="archive"
                        color="orange"
                        text-color="white"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Archive</q-item-label>
                      <q-item-label caption>
                        Hide and stop future campaigns from sending
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    v-if="
                      this.selectedCampaign.id != null &&
                      this.selectedCampaign.active
                    "
                    @click="moveCampaignDialog.open = true"
                  >
                    <q-item-section avatar top>
                      <q-avatar
                        icon="trending_flat"
                        color="orange"
                        text-color="white"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Move Campaign</q-item-label>
                      <q-item-label caption>
                        Move campaign to a different account
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    v-if="
                      this.selectedCampaign.id != null &&
                      this.selectedCampaign.active
                    "
                    @click="copyMediaLink()"
                  >
                    <q-item-section avatar top>
                      <q-avatar
                        icon="content_copy"
                        color="blue-6"
                        text-color="white"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">Copy Document Link</q-item-label>
                      <q-item-label caption>
                        Copy share link to receive files
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn
                v-if="editForm"
                unelevated
                label="CANCEL"
                color="red"
                size="md"
                @click="editForm = false"
              ></q-btn>
              <q-btn
                v-if="editForm"
                unelevated
                label="SAVE"
                color="primary"
                size="md"
                @click="onSubmit"
              ></q-btn>
            </div>
          </q-item-section>
        </q-item>
        <div style="height: calc(100vh - 110px); overflow: scroll">
          <q-item class="q-pa-none">
            <q-item-section>
              <q-banner
                v-if="
                  selectedCampaign.lastRunStatus === 'Error' &&
                  selectedCampaign.lastRunStatusMessage
                "
                inline-actions
                class="text-white bg-red"
                >{{ selectedCampaign.lastRunStatusMessage }}</q-banner
              >

              <q-form @submit="onSubmit">
                <q-expansion-item
                  switch-toggle-side
                  expand-separator
                  default-opened
                  label="General"
                >
                  <q-form class="row q-col-gutter-sm q-pa-md">
                    <q-input
                      class="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                      :disable="!editForm"
                      filled
                      v-model="selectedCampaign.name"
                      label="Name *"
                      lazy-rules
                      required
                    />
                    <q-select
                      ref="emailResultsTo"
                      :disable="!editForm"
                      filled
                      class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
                      v-model="selectedCampaign.emailResultsTo"
                      use-input
                      use-chips
                      multiple
                      hide-dropdown-icon
                      input-debounce="0"
                      label="Email Results (Separate by comma)"
                      new-value-mode="add-unique"
                      @keydown.tab="onTabPress($event, false)"
                      @update:model-value.native="onInputEmail($event, false)"
                      @blur="createValue($event, false)"
                      :rules="[
                        (value) =>
                          validateEmail(value) || 'Please enter a valid email',
                      ]"
                      lazy-rules
                    >
                      <template v-slot:append>
                        <q-btn
                          flat
                          round
                          icon="content_copy"
                          @click="
                            copyToClipBoard(selectedCampaign.emailResultsTo)
                          "
                        ></q-btn>
                      </template>
                    </q-select>

                    <q-select
                      class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
                      ref="emailReplyTo"
                      :disable="!editForm"
                      filled
                      v-model="selectedCampaign.emailReplyTo"
                      use-input
                      use-chips
                      multiple
                      hide-dropdown-icon
                      input-debounce="0"
                      label="Email Replies (Separate by comma)"
                      new-value-mode="add-unique"
                      @keydown.tab="onTabPress($event, true)"
                      @update:model-value.native="onInputEmail($event, true)"
                      @blur="createValue($event, true)"
                      :rules="[
                        (value) =>
                          validateEmail(value) || 'Please enter a valid email',
                      ]"
                      lazy-rules
                    >
                      <template v-slot:append>
                        <q-btn
                          flat
                          round
                          icon="content_copy"
                          @click="
                            copyToClipBoard(selectedCampaign.emailReplyTo)
                          "
                        ></q-btn>
                      </template>
                    </q-select>
                  </q-form>
                </q-expansion-item>

                <q-expansion-item
                  switch-toggle-side
                  expand-separator
                  label="Schedule"
                >
                  <q-list class="row">
                    <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <q-item-section>
                        <div>
                          <q-radio
                            :disable="!editForm"
                            v-model="selectedCampaign.recurring"
                            @update:model-value="handleRecurringChange"
                            val="true"
                            label="Recurring"
                          ></q-radio>
                          <q-radio
                            :disable="!editForm"
                            v-model="selectedCampaign.recurring"
                            @update:model-value="handleRecurringChange"
                            val="false"
                            label="One-Time"
                          ></q-radio>
                        </div>
                      </q-item-section>
                    </q-item>
                    <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <q-item-section>
                        <q-option-group
                          :disable="!editForm"
                          label="Days *"
                          v-model="selectedCampaign.daysOfWeek"
                          :options="dayOfWeekOptions"
                          type="checkbox"
                          color="primary"
                          inline
                        ></q-option-group>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div class="row q-pa-md q-col-gutter-sm">
                    <q-input
                      class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
                      :disable="!editForm"
                      filled
                      readonly
                      v-model="selectedCampaign.timeOfDay"
                      label="Start Time"
                    >
                      <template v-slot:prepend>
                        <q-icon name="access_time" class="cursor-pointer">
                          <q-popup-proxy
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-time
                              now-btn
                              v-model="selectedCampaign.timeOfDay"
                              mask="hh:mm a"
                            ></q-time>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>

                    <q-input
                      class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
                      :disable="!editForm"
                      filled
                      v-model="selectedCampaign.startDate"
                      label="Start Date"
                    >
                      <template v-slot:prepend>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy
                            transition-show="scale"
                            transition-hide="scale"
                            ref="startDateProxyRef"
                          >
                            <q-date
                              today-btn
                              v-model="selectedCampaign.startDate"
                              mask="MM/DD/YY"
                              @update:model-value="$refs.startDateProxyRef.hide()"
                              no-unset
                            >
                              <div class="row justify-end">
                                <q-btn
                                  label="Close"
                                  color="primary"
                                  flat
                                  v-close-popup
                                />
                              </div>
                            </q-date>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>

                    <q-select
                      class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
                      v-if="selectedCampaign.recurring === 'true'"
                      filled
                      :disable="!editForm"
                      :rules="[null]"
                      v-model="selectedCampaign.occursEvery"
                      :options="[
                        '15 Minutes',
                        '30 Minutes',
                        '60 Minutes',
                        'Once per Day',
                        'Custom',
                      ]"
                      label="Occurs every"
                    />

                    <q-input
                      class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
                      v-if="selectedCampaign.recurring === 'true'"
                      :disable="
                        !editForm || selectedCampaign.occursEvery !== 'Custom'
                      "
                      filled
                      v-model="selectedCampaign.schedule"
                      label="Cron Expression"
                      hint="This overrides day of week, time and date if occurs every is custom."
                    />

                    <q-input
                      class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
                      v-if="
                        selectedCampaign.occursEvery == 'Once per Day' ||
                        selectedCampaign.occursEvery == 'Custom' ||
                        selectedCampaign.recurring === 'false'
                      "
                      :disable="!editForm"
                      filled
                      v-model="selectedCampaign.retryCount"
                      label="How many times should we re-try if no response?"
                    ></q-input>

                    <div
                      class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
                      v-bind:class="{
                        'q-pt-none': selectedCampaign.recurring === 'true',
                      }"
                      v-if="
                        selectedCampaign.occursEvery == 'Once per Day' ||
                        selectedCampaign.occursEvery == 'Custom' ||
                        selectedCampaign.recurring === 'false'
                      "
                    >
                      <q-select
                        filled
                        :disable="!editForm"
                        :rules="[null]"
                        v-model="selectedCampaign.retryEvery"
                        :options="
                          ['15 Minutes', 'Daily', 'Weekly'].filter(
                            (f) =>
                              selectedCampaign.recurring === 'false' ||
                              f === '15 Minutes' ||
                              f === 'Daily'
                          )
                        "
                        label="How often should we re-try if no response?"
                        hide-bottom-space
                        v-if="selectedCampaign.recurring"
                      >
                        <template
                          v-slot:hint
                          v-if="selectedCampaign.recurring === 'true'"
                        >
                          If you want weekly select One-Time above
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12">
                      <div
                        v-if="selectedCampaign.retryCount > 0"
                        class="q-my-xs bg-grey-2 rounded-borders q-pa-sm">
                        <div class="q-mb-sm text-bold">Only send reminders if NO:</div>
                        <q-option-group
                          inline
                          dense
                          :disable="!editForm"
                          v-model="selectedCampaign.retryType"
                          :options="retryTypeOptions"
                          color="primary" />
                      </div>
                    </div>
                  </div>
                </q-expansion-item>

                <q-expansion-item
                  switch-toggle-side
                  expand-separator
                  label="Recipients"
                >
                  <q-list class="row">
                    <q-item v-if="this.activeTenant" class="col-12 col-sm-4">
                      <q-item-section>
                        <q-select
                          filled
                          :disable="!editForm"
                          v-model="selectedCampaign.contactMethod"
                          :options="['Text', 'Email', 'Both']"
                          stack-label
                          label="Contact Method"
                        >
                        </q-select>
                      </q-item-section>
                    </q-item>

                    <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <q-item-section>
                        <div>
                          <q-select
                            filled
                            :disable="!editForm"
                            v-model="selectedCampaign.contactGroups"
                            multiple
                            :options="availableContactGroups"
                            use-chips
                            stack-label
                            label="Groups"
                          />
                        </div>
                      </q-item-section>
                    </q-item>

                    <q-item
                      v-if="
                        this.activeTenant && this.activeTenant.connectionString
                      "
                      class="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                    >
                      <q-item-section>
                        <q-select
                          filled
                          :disable="!editForm"
                          v-model="selectedCampaign.integrationId"
                          :options="availableIntegrations"
                          clearable
                          emit-value
                          map-options
                          stack-label
                          label="Integration"
                        >
                          <template v-slot:after>
                            <q-btn
                              size="lg"
                              color="green"
                              flat
                              icon="sync"
                              @click="testSqlConnection()"
                              :disable="!editForm"
                            />
                          </template>
                        </q-select>
                      </q-item-section>
                    </q-item>
                    <q-item
                      v-if="
                        sqlData.length > 0 &&
                        this.activeTenant.connectionString &&
                        this.editForm
                      "
                    >
                      <q-item-section>
                        <q-table
                          :rows-per-page-options="[]"
                          style="width: 850px"
                          dense
                          separator="cell"
                          :rows="sqlData"
                          :columns="sqlColumns"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>

                <q-expansion-item
                  switch-toggle-side
                  expand-separator
                  label="Message"
                >
                  <div class="row q-mx-sm q-pa-sm q-col-gutter-sm">
                    <q-input
                      class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
                      :disable="!editForm"
                      filled
                      v-model="selectedCampaign.messageSubject"
                      label="Email subject"
                    />
                    <q-select
                      class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
                      :disable="!editForm"
                      filled
                      v-model="selectedCampaign.priority"
                      label="Email priority"
                      :options="priorityOptions"
                    ></q-select>
                    <!-- <div class="col-12 row justify-end">
                      <q-input :disable="!editForm" filled readonly prefix="$" label="Price (Per Message)" v-model="messagePrice" input-class="text-right" />
                    </div> -->
                    <div class="q-gutter-xs">
                      <div class="row">
                        Attachments ({{ availableAttachments.length }})
                      </div>
                      <q-chip
                        v-for="(item, index) in availableAttachments"
                        :key="index"
                        removable
                        clickable
                        color="primary"
                        text-color="white"
                        icon="attach_file"
                        :disable="!editForm"
                        @remove="onRemoveFile(item)"
                        @click="onAttachmentClicked(item)"
                      >
                        {{ item }}
                      </q-chip>
                    </div>
                    <q-file
                      ref="attachmentFilePickerRef"
                      style="visibility: hidden; width: 0; height: 0"
                      v-model="fileToAttach"
                      label=""
                      @update:model-value="onAttachFile"
                    />
                    <q-file
                      ref="pdfToHtmlFilePicker"
                      style="visibility: hidden; width: 0; height: 0"
                      v-model="pdfToHtmlFile"
                      label=""
                      @update:model-value="onPdfToHtml"
                    />
                  </div>
                  <q-list class="row">
                    <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <q-item-section>
                        <form
                          autocorrect="off"
                          autocapitalize="off"
                          autocomplete="off"
                          spellcheck="false"
                        >
                          <q-editor
                            :disable="!editForm"
                            ref="editor_ref"
                            @paste.native="
                              (evt) => pasteCapture(evt, 'editor_ref')
                            "
                            v-model="selectedCampaign.messageTemplate"
                            :toolbar="
                              selectedCampaign.contactMethod === 'Email'
                                ? [
                                    [
                                      'showAttachmentFilePicker',
                                      'showPdfToHtmlFilePicker',
                                      'documentToken',
                                    ],
                                    [
                                      {
                                        label: $q.lang.editor.align,
                                        icon: $q.iconSet.editor.align,
                                        fixedLabel: true,
                                        list: 'only-icons',
                                        options: [
                                          'left',
                                          'center',
                                          'right',
                                          'justify',
                                        ],
                                      },
                                      'emojis',
                                    ],
                                    [
                                      'bold',
                                      'italic',
                                      'strike',
                                      'underline',
                                      'subscript',
                                      'superscript',
                                    ],
                                    ['token', 'hr', 'link', 'custom_btn'],
                                    ['print', 'fullscreen'],
                                    [
                                      {
                                        label: $q.lang.editor.formatting,
                                        icon: $q.iconSet.editor.formatting,
                                        list: 'no-icons',
                                        options: [
                                          'p',
                                          'h1',
                                          'h2',
                                          'h3',
                                          'h4',
                                          'h5',
                                          'h6',
                                          'code',
                                        ],
                                      },
                                      {
                                        label: $q.lang.editor.fontSize,
                                        icon: $q.iconSet.editor.fontSize,
                                        fixedLabel: true,
                                        fixedIcon: true,
                                        list: 'no-icons',
                                        options: [
                                          'size-1',
                                          'size-2',
                                          'size-3',
                                          'size-4',
                                          'size-5',
                                          'size-6',
                                          'size-7',
                                        ],
                                      },
                                      {
                                        label: $q.lang.editor.defaultFont,
                                        icon: $q.iconSet.editor.font,
                                        fixedIcon: true,
                                        list: 'no-icons',
                                        options: [
                                          'default_font',
                                          'arial',
                                          'arial_black',
                                          'comic_sans',
                                          'courier_new',
                                          'impact',
                                          'lucida_grande',
                                          'times_new_roman',
                                          'verdana',
                                        ],
                                      },
                                      'removeFormat',
                                    ],
                                    [
                                      'quote',
                                      'unordered',
                                      'ordered',
                                      'outdent',
                                      'indent',
                                    ],
                                    ['undo', 'redo'],
                                    ['viewsource'],
                                  ]
                                : [
                                    [
                                      'undo',
                                      'redo',
                                      'removeFormat',
                                      'emojis',
                                      'calculateCosts',
                                      'documentToken',
                                    ],
                                  ]
                            "
                            :fonts="{
                              arial: 'Arial',
                              arial_black: 'Arial Black',
                              comic_sans: 'Comic Sans MS',
                              courier_new: 'Courier New',
                              impact: 'Impact',
                              lucida_grande: 'Lucida Grande',
                              times_new_roman: 'Times New Roman',
                              verdana: 'Verdana',
                            }"
                            :definitions="{
                              calculateCosts: {
                                tip: 'Estimate price per message',
                                icon: 'calculate',
                                label: 'Estimate Cost',
                                handler: async () => {
                                  getSmsEstimate(
                                    selectedCampaign.messageTemplate
                                  ).then((cost) => {
                                    this.messagePrice = cost;
                                  });
                                },
                              },
                              removeFormat: {
                                label: 'Remove Formatting',
                              },
                              emojis: {
                                tip: 'Select Emoji',
                                icon: 'face',
                                label: 'Emoji',
                                handler: () => (showEmojiPicker = true),
                              },
                              showPdfToHtmlFilePicker: {
                                icon: 'picture_as_pdf',
                                label: 'Embed PDF',
                                handler: () => {
                                  this.$refs.pdfToHtmlFilePicker.pickFiles();
                                },
                              },
                              showAttachmentFilePicker: {
                                icon: 'attach_file',
                                label: 'Attach File',
                                handler: () => {
                                  this.$refs.attachmentFilePickerRef.pickFiles();
                                },
                              },
                            }"
                          >
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
                                label="Document Link"
                              >
                                <q-list dense>
                                  <q-item
                                    v-for="(item, index) in availableDocuments"
                                    :key="index"
                                    tag="label"
                                    clickable
                                    @click="
                                      (e) => {
                                        $refs.editor_ref.runCmd(
                                          'insertText',
                                          `{{document_${item.id}}}`
                                        );
                                      }
                                    "
                                  >
                                    <q-item-section>
                                      {{item.fileName}}
                                    </q-item-section>
                                  </q-item>
                                </q-list>
                              </q-btn-dropdown>
                            </template>
                          </q-editor>
                          <q-dialog v-model="showEmojiPicker">
                            <q-card no-border>
                              <q-card-section class="row items-center">
                                <div class="text-h6">Select Emoji</div>
                                <q-space />
                                <q-btn
                                  icon="close"
                                  flat
                                  round
                                  dense
                                  v-close-popup
                                />
                              </q-card-section>

                              <q-card-section class="q-pa-none">
                                <VEmojiPicker
                                  :showSearch="false"
                                  @select="
                                    (e) => {
                                      this.$refs.editor_ref.runCmd(
                                        'insertText',
                                        e.data
                                      );
                                    }
                                  "
                                />
                              </q-card-section>
                            </q-card>
                          </q-dialog>
                        </form>

                        <q-expansion-item
                          switch-toggle-side
                          expand-separator
                          label="Merge Fields"
                          class="q-ma-none q-pa-none"
                        >
                          <pre
                            style="
                              white-space: pre-line;
                              margin-bottom: 0;
                              margin-top: 0;
                            "
                          >
                            <code v-pre class="full-width"><strong>{{Employee}}</strong> Recipient name
                            <strong>{{client_visits}}</strong> If this is a list new lines will be created when a double space is found
                            <strong>{{message_list_link}}</strong> Include this tag when you specify a Message List (below)
                            <strong>{{message_form_link}}</strong> Include this tag when you specify a Message Survey (below)
                            <strong>{{expiring_service_requirements_link}}</strong> Include this tag when you are requesting compliance updates
                            <strong>{{form_link}}</strong> Include this tag when you are requesting forms to be filled out
                            <strong>{{message_send_media_link}}</strong> Include this tag when you are requesting an image, video or pdf
                            <strong>{{message_timekeeping_correction_link_v1}}</strong> <a style="text-decoration: none" target="_blank" href="https://tahelper.blob.core.windows.net/training-media/formV1.png">Preview</a>
                            <strong>{{message_timekeeping_correction_link_v2}}</strong> <a style="text-decoration: none" target="_blank" href="https://tahelper.blob.core.windows.net/training-media/formV2.png">Preview</a>
                            <strong>{{message_timekeeping_correction_link_v3}}</strong> <a style="text-decoration: none" target="_blank" href="https://tahelper.blob.core.windows.net/training-media/formV3.png">Preview</a>
                            <strong>{{message_timekeeping_correction_link_v4}}</strong> <a style="text-decoration: none" target="_blank" href="https://tahelper.blob.core.windows.net/training-media/formV4.png">Preview</a>
                            <strong>{{message_timekeeping_correction_link_v5}}</strong> <a style="text-decoration: none" target="_blank" href="https://tahelper.blob.core.windows.net/training-media/formV5.png">Preview</a>
                            <strong>{{message_tasksheet_link_v1}}</strong> <a style="text-decoration: none" target="_blank" href="https://tahelper.blob.core.windows.net/training-media/tasksheetV1.png">Preview</a>
                            <strong>{{message_timecard_link_v1}}</strong> <a style="text-decoration: none" target="_blank" href="https://tahelper.blob.core.windows.net/training-media/timecardV1.png">Preview</a>
                            <strong>{{message_activity_sheet_v1}}</strong> <a style="text-decoration: none" target="_blank" href="https://tahelper.blob.core.windows.net/training-media/activitySheetV1.png">Preview</a>
                            <strong>{{message_activity_sheet_v2}}</strong> <a style="text-decoration: none" target="_blank" href="https://tahelper.blob.core.windows.net/training-media/activitySheetV2.png">Preview</a>
                            <strong>{{message_activity_sheet_v3}}</strong> <a style="text-decoration: none" target="_blank" href="https://tahelper.blob.core.windows.net/training-media/activitySheetV3.png">Preview</a>
                            <strong>{{CurrentMonthDayYear}}</strong> Example: 12/1/2020
                            <strong>{{ }}</strong> Any database column wrapped with double bracket will be replaced before the message is sent (message and email subject)</code>
                          </pre>
                        </q-expansion-item>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>

                <q-expansion-item
                  switch-toggle-side
                  expand-separator
                  label="Message Response Keywords"
                >
                  <q-list class="row items-end">
                    <q-item class="col-12 col-sm-6 q-pb-none">
                      <q-item-section class="q-pb-none">
                        <label
                          >Leave this field blank to receive all replies</label
                        >
                      </q-item-section>
                    </q-item>
                    <q-item class="col-12 col-sm-6 justify-end">
                      <q-input
                        :disable="!editForm"
                        dense
                        readonly
                        prefix="$"
                        label="Price (Per Message)"
                        v-model="autoReplyMessagePrice"
                        input-class="text-right"
                      ></q-input>
                    </q-item>
                    <q-item class="col-12 q-pt-none">
                      <q-item-section class="q-pt-none">
                        <q-input
                          :disable="!editForm"
                          filled
                          v-model="
                            selectedCampaign.replyImmediateAttentionKeywords
                          "
                          label="Immediate attention reply keywords (separated by comma)"
                          :rules="[null]"
                          hide-bottom-space
                        >
                        </q-input>
                      </q-item-section>
                    </q-item>
                    <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <q-item-section>
                        <form
                          autocorrect="off"
                          autocapitalize="off"
                          autocomplete="off"
                          spellcheck="false"
                        >
                          <q-editor
                            :disable="!editForm"
                            ref="auto_response_editor"
                            @paste.native="
                              (evt) => pasteCapture(evt, 'auto_response_editor')
                            "
                            v-model="selectedCampaign.autoResponseMessage"
                            :toolbar="[
                              [
                                'undo',
                                'redo',
                                'removeFormat',
                                'emojis',
                                'calculateCosts',
                              ],
                            ]"
                            :definitions="{
                              calculateCosts: {
                                tip: 'Estimate price per message',
                                icon: 'calculate',
                                label: 'Estimate Cost',
                                handler: () => {
                                  getSmsEstimate(
                                    selectedCampaign.autoResponseMessage
                                  ).then((cost) => {
                                    this.autoReplyMessagePrice = cost;
                                  });
                                },
                              },
                              removeFormat: {
                                label: 'Remove Formatting',
                              },
                              emojis: {
                                tip: 'Select EMOJI',
                                icon: 'face',
                                label: 'EMOJI',
                                handler: () => (showEmojiPicker = true),
                              },
                            }"
                          ></q-editor>
                          <q-dialog v-model="showEmojiPicker">
                            <q-card no-border>
                              <q-card-section class="row items-center">
                                <div class="text-h6">Select Emoji</div>
                                <q-space />
                                <q-btn
                                  icon="close"
                                  flat
                                  round
                                  dense
                                  v-close-popup
                                />
                              </q-card-section>

                              <q-card-section class="q-pa-none">
                                <VEmojiPicker
                                  :showSearch="false"
                                  @select="
                                    (e) => {
                                      this.$refs.auto_response_editor.runCmd(
                                        'insertText',
                                        e.data
                                      );
                                    }
                                  "
                                />
                              </q-card-section>
                            </q-card>
                          </q-dialog>
                        </form>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>

                <q-expansion-item
                  switch-toggle-side
                  expand-separator
                  label="Message Survey / Form"
                >
                  <q-card>
                    <q-tabs
                      v-model="formTab"
                      dense
                      class="text-grey"
                      active-color="primary"
                      indicator-color="primary"
                      align="justify"
                      narrow-indicator
                    >
                      <q-tab name="formBuilder" label="Survey Builder" />
                      <q-tab name="customForm" label="Custom Form" />
                    </q-tabs>

                    <q-separator />

                    <q-tab-panels v-model="formTab" animated>
                      <q-tab-panel name="customForm">
                        <q-select
                          v-if="availableForms.length"
                          class="q-ma-md"
                          dense
                          filled
                          label="Form"
                          v-model="selectedCampaign.formName"
                          :options="availableForms"
                          emit-value
                          map-options
                        ></q-select>
                      </q-tab-panel>

                      <q-tab-panel
                        class="q-ma-none q-pa-none"
                        name="formBuilder"
                      >
                        <q-list class="row" v-if="!selectedCampaignForm">
                          <q-item
                            class="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                          >
                            <q-item-section>
                              <div class="row q-gutter-sm">
                                <q-btn
                                  label="Edit"
                                  outline
                                  @click="renderForm(true)"
                                />
                                <q-btn
                                  label="Preview"
                                  outline
                                  @click="renderForm(false)"
                                />
                              </div>
                            </q-item-section>
                            <q-item-section side>
                              <q-btn
                                label="SAVE"
                                unelevated
                                color="primary"
                                size="md"
                                @click="onSubmit"
                              />
                            </q-item-section>
                          </q-item>
                          <q-item
                            class="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                          >
                            <q-item-section>
                              <div id="form-builder"></div>
                              <q-card flat no-margin no-padding>
                                <pre style="white-space: pre-line">
                                <p style="line-height:27px; margin: 0px;"><strong>Start: </strong><br/><code v-pre>Drag & drop UI elements to build your form</code></p>
                                <p style="line-height:27px; margin: 0px;"><strong>Notify: </strong><br/><code v-pre>Add attribute Notification and value that matches your response to trigger an immediate email</code></p>
                              </pre>
                              </q-card>
                            </q-item-section>
                          </q-item>
                        </q-list>

                        <div v-else style="width: 100%; height: 800px">
                          <q-form-builder
                            :json="selectedCampaignForm.data || []"
                            :settings="selectedCampaignForm.pageSettings || {}"
                            @save="
                              (val) => {
                                selectedCampaignForm = val;
                                onSubmit();
                              }
                            "
                          ></q-form-builder>
                        </div>
                      </q-tab-panel>
                    </q-tab-panels>
                  </q-card>
                </q-expansion-item>

                <q-expansion-item
                  switch-toggle-side
                  expand-separator
                  label="Other"
                >
                  <q-list>
                    <q-item
                      v-if="
                        this.activeTenant && this.activeTenant.connectionString
                      "
                      class="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                    >
                      <q-item-section>
                        <q-select
                          :disable="!editForm"
                          v-model="selectedCampaign.integrationListId"
                          :options="availableIntegrations"
                          clearable
                          emit-value
                          map-options
                          stack-label
                          label="Message List Integration"
                        >
                          <template v-slot:after>
                            <q-btn
                              round
                              unelevated
                              color="green"
                              icon="sync"
                              @click="testSqlListConnection()"
                              :disable="!editForm"
                            />
                          </template>
                        </q-select>
                      </q-item-section>
                    </q-item>
                    <q-item
                      v-if="
                        sqlListData.length > 0 &&
                        this.activeTenant.connectionString &&
                        this.editForm
                      "
                    >
                      <q-item-section>
                        <q-table
                          :rows-per-page-options="[]"
                          style="width: 850px"
                          dense
                          separator="cell"
                          :rows="sqlListData"
                          :columns="sqlListColumns"
                        />
                      </q-item-section>
                    </q-item>
                    <q-item
                      class="col-lg-12 col-md-12 col-sm-12 col-xs-12 q-mb-md"
                    >
                      <q-item-section>
                        <q-card flat bordered class="q-px-md q-pt-md">
                          <q-checkbox
                            :model-value="!!selectedCampaign.editableSurvey"
                            dense
                            color="primary"
                            :disable="!editForm"
                            label="Editable survey"
                            @update:model-value="
                              (val) => (selectedCampaign.editableSurvey = val)
                            "
                          ></q-checkbox>

                          <br />

                          <q-checkbox
                            :model-value="
                              selectedCampaign.startStoreFilesDateTime
                                ? true
                                : false
                            "
                            @update:model-value="onManageFilesChange"
                            color="primary"
                            :disable="!editForm"
                            dense
                            label="Manage files in reachout hub"
                          ></q-checkbox>

                          <br />

                          <q-checkbox
                            v-model="selectedCampaign.expirePreviousLinks"
                            color="primary"
                            :disable="!editForm"
                            dense
                            label="Expire previous links"
                          >
                            <q-tooltip>
                              Previous links sent from this campaign will expire
                              when a new message is sent.
                            </q-tooltip>
                          </q-checkbox>

                          <br />

                          <q-checkbox
                            v-model="
                              selectedCampaign.dontSendFileReceivedNotification
                            "
                            color="primary"
                            :disable="!editForm"
                            dense
                            label="Don't send email notifications when a response is received"
                          ></q-checkbox>

                          <q-card flat no-margin no-padding>
                            <pre
                              style="white-space: pre-line; margin-bottom: 0"
                            >
                                <p style="line-height:27px; margin: 0px;"><strong>Note: </strong><br/><code v-pre>Please remember to include {{message_send_media_link}} in the campaign message to receive files</code></p>
                              </pre>
                          </q-card>
                        </q-card>
                      </q-item-section>
                    </q-item>

                    <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <q-item-section>
                        <q-card flat bordered class="q-pa-md q-gutter-y-md">
                          <label
                            >Link Expiration (Message links for this campaign
                            will not work after this date)</label
                          >
                          <div class="row">
                            <q-input
                              :disable="!editForm"
                              filled
                              :model-value="
                                selectedCampaign.mediaLinkExpirationDateTime
                              "
                              label="Media Link"
                              class="col-12 col-sm-4"
                            >
                              <template v-slot:prepend>
                                <q-icon name="event" class="cursor-pointer">
                                  <q-popup-proxy
                                    transition-show="scale"
                                    transition-hide="scale"
                                    ref="mediaLinkDatePicker"
                                  >
                                    <q-date
                                      today-btn
                                      v-model="
                                        selectedCampaign.mediaLinkExpirationDateTime
                                      "
                                      mask="MM/DD/YY"
                                      @update:model-value="$refs.mediaLinkDatePicker.hide()"
                                      no-unset
                                    >
                                      <div class="row justify-end">
                                        <q-btn
                                          label="Close"
                                          color="primary"
                                          flat
                                          v-close-popup
                                        />
                                      </div>
                                    </q-date>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>
                          </div>

                          <div class="row">
                            <q-input
                              :disable="!editForm"
                              filled
                              :model-value="
                                selectedCampaign.listLinkExpirationDateTime
                              "
                              label="List Link"
                              class="col-12 col-sm-4"
                            >
                              <template v-slot:prepend>
                                <q-icon name="event" class="cursor-pointer">
                                  <q-popup-proxy
                                    transition-show="scale"
                                    transition-hide="scale"
                                    ref="listLinkDatePicker"
                                  >
                                    <q-date
                                      today-btn
                                      v-model="
                                        selectedCampaign.listLinkExpirationDateTime
                                      "
                                      mask="MM/DD/YY"
                                      @update:model-value="$refs.listLinkDatePicker.hide()"
                                      no-unset
                                    >
                                      <div class="row justify-end">
                                        <q-btn
                                          label="Close"
                                          color="primary"
                                          flat
                                          v-close-popup
                                        />
                                      </div>
                                    </q-date>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>
                          </div>

                          <div class="row">
                            <q-input
                              :disable="!editForm"
                              filled
                              :model-value="
                                selectedCampaign.formLinkExpirationDateTime
                              "
                              label="Form Link"
                              class="col-12 col-sm-4"
                            >
                              <template v-slot:prepend>
                                <q-icon name="event" class="cursor-pointer">
                                  <q-popup-proxy
                                    transition-show="scale"
                                    transition-hide="scale"
                                    ref="formLinkDatePicker"
                                  >
                                    <q-date
                                      today-btn
                                      v-model="
                                        selectedCampaign.formLinkExpirationDateTime
                                      "
                                      mask="MM/DD/YY"
                                      @update:model-value="$refs.formLinkDatePicker.hide()"
                                      no-unset
                                    >
                                      <div class="row justify-end">
                                        <q-btn
                                          label="Close"
                                          color="primary"
                                          flat
                                          v-close-popup
                                        />
                                      </div>
                                    </q-date>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>
                          </div>
                        </q-card>
                      </q-item-section>
                    </q-item>

                    <q-item
                      v-if="selectedCampaign && selectedCampaign.serviceSid"
                      class="col-12"
                    >
                      <label style="color: #b8b8b8">{{
                        selectedCampaign.serviceSid
                      }}</label>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </q-form>
            </q-item-section>
          </q-item>
        </div>
      </q-page>
    </q-page-container>

    <q-btn
      v-if="$q.screen.lt.md"
      class="drawer-button z-top"
      :icon="navOpen ? 'chevron_left' : 'menu'"
      style="position: fixed; bottom: 40px; right: 20px"
      :color="navOpen ? 'white' : 'primary'"
      :text-color="navOpen ? 'black' : 'white'"
      round
      @click="navOpen = !navOpen"
    />

    <q-dialog v-model="confirmRunNow" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar
            icon="play_circle_outline"
            color="primary"
            text-color="white"
          />
          <span class="q-ml-sm">
            <br />Are you sure you want to run this campaign now? <br />This
            cannot be undone and will run for all time zones.
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="RUN NOW"
            color="primary"
            v-close-popup
            @click="
              runCampaignNow();
              editForm = false;
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmDelete" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="archive" color="orange" text-color="white" />
          <span class="q-ml-sm">
            Are you sure you want to archive this campaign?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Archive"
            color="primary"
            v-close-popup
            @click="
              deleteCampaign();
              editForm = false;
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="moveCampaignDialog.open" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center">
          <q-avatar
            round
            size="lg"
            color="grey-8"
            text-color="white"
            icon="business" />

          <div class="q-ml-md">
            <div class="full-width text-h6" style="line-height: 1em;">
              Move Campaign
            </div>
          </div>

          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-select
            filled
            class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
            v-model="moveCampaignDialog.tenantId"
            :options="user.tenants.filter(f => f.id !== activeTenant.id)"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Tenant"
            :rules="[(val) => !!val || 'Required field']"
            lazy-rules
          >
          </q-select>
        </q-card-section>

        <q-card-actions class="bg-grey-2 q-pa-md" align="between">
          <q-btn
            color="grey-8"
            text-color="white"
            no-caps
            label="Close"
            style="width: 90px"
            v-close-popup />

          <q-btn
            :disable="!moveCampaignDialog.tenantId"
            color="blue-8"
            text-color="white"
            no-caps
            label="Move"
            style="width: 90px"
            @click="moveToTenant"
            v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<style lang="scss">
@import "../lib/chosen/chosen.min.css";
@import "formeo/dist/formeo.min.css";

@font-face {
  font-family: NotomojiColor;
  font-weight: 400;
  font-display: swap;
  src: url(https://cdn.glitch.com/61908de1-dd0a-4359-a54b-6cb6d41bb5fd%2FNotoColorEmoji.ttf?1513108808150)
    format("truetype");
}

code {
  display: inline-block;
  margin: 0;
  padding: 5px 7px;
  color: #2a5278;
  background-color: #f0f7fc;
  border: 1px solid #e4f0f8;
}
</style>

<script>
import integrationApi from "src/api/integration";
import contactApi from "src/api/contact";
import documentApi from "src/api/documents";
import campaignApi from "src/api/campaigns";
import { axiosInstance } from "boot/axios";
import { date, exportFile, copyToClipboard } from "quasar";
import { FormeoEditor, FormeoRenderer } from "formeo";
import VEmojiPicker from "vue3-emoji-picker";
import { mainMixin } from "src/mixins/index";
import $ from "jquery";
import * as chosen from "../boot/chosen/chosen.jquery.min.js";
import moment from "moment";

import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import { forms } from "src/lib/shared";
import { defineComponent } from "vue";

const emptyCampaign = {
  id: null,
  tenantId: null,
  name: "",
  active: true,
  priority: "Normal",
  integrationId: null,
  integrationListId: null,
  draft: true,
  daysOfWeek: [],
  startDate:  mainMixin.methods.getDtFormattedWithoutTime(new Date()),
  timeOfDay: mainMixin.methods.getDtFormatted(new Date(), "hh:mm a"),
  recurring: "true",
  retryCount: 0,
  retryEvery: "15 Minutes",
  occursEvery: "Once per Day",
  schedule: "",
  emailResultsTo: null,
  emailReplyTo: null,
  replyImmediateAttentionKeywords: "",
  autoResponseMessage: "",
  lastRun: "",
  lastRunStatus: "",
  lastRunStatusMessage: "",
  messageTemplate: "",
  messageSubject: "",
  contactGroups: [],
  integrations: [],
  formTemplate: '{ "sdk": 2, "data": [] }',
  contactMethod: "Both",
  listLinkExpirationDateTime: null,
  formLinkExpirationDateTime: null,
  mediaLinkExpirationDateTime: null,
  attachments: "",
  editableSurvey: false,
  startStoreFilesDateTime: null,
  dontSendFileReceivedNotification: false,
  expirePreviousLinks: false,
  formName: null,
  retryType: 'SMS',
}

export default defineComponent({
  name: "Campaign",
  mixins: [mainMixin],
  components: {
    VEmojiPicker,
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"]),
    availableCampaigns() {
      return this.campaigns.filter(
        campaign => !this.searchTerm
                    || campaign.name?.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);
    },
    availableForms: function () {
      return (
        forms[import.meta.env.COMPANY]?.map((form) => ({
          label: form.replace(/([A-Z])/g, " $1").trim(),
          value: form,
        })) || []
      );
    },
    availableContactGroups: function () {
      return this.contactGroups.map((c) => {
        return {
          label: c.name,
          value: c.id,
        };
      });
    },
    availableAttachments: function () {
      if (this.selectedCampaign.attachments) {
        return this.selectedCampaign.attachments.toString().split(";");
      }

      return [];
    },
    availableIntegrations: function () {
      return this.integrations.map((c) => {
        return {
          label: c.name,
          value: c.id,
        };
      });
    },
  },
  data() {
    return {
      navOpen: false,
      showAllCampaigns: false,
      formEditor: {},
      confirmRunNow: false,
      confirmDelete: false,
      showEmojiPicker: false,
      formTab: "formBuilder",
      availableDocuments: [],
      searchTerm: null,
      sqlData: [],
      sqlColumns: [],
      sqlListData: [],
      sqlListColumns: [],
      priorityOptions: ["High", "Normal", "Low"],
      retryTypeOptions: [
        {label: "SMS reply", value: "SMS"},
        {label: "Survey submission", value: "Survey"},
        {label: "Documents seen", value: "Media"},
      ],
      todayDate: this.getDtFormatted(new Date(), "YYYY/MM/DD"),
      proxyDate: null,
      moveCampaignDialog: {
        open: false,
        tenantId: null,
      },
      dataRetentionOptions: [
        {
          label: "Never delete",
          value: 0,
        },
        {
          label: "30 days",
          value: 30,
        },
        {
          label: "60 days",
          value: 60,
        },
      ],
      dayOfWeekOptions: [
        {
          label: "Monday",
          value: "Monday",
        },
        {
          label: "Tuesday",
          value: "Tuesday",
        },
        {
          label: "Wednesday",
          value: "Wednesday",
        },
        {
          label: "Thursday",
          value: "Thursday",
        },
        {
          label: "Friday",
          value: "Friday",
        },
        {
          label: "Saturday",
          value: "Saturday",
        },
        {
          label: "Sunday",
          value: "Sunday",
        },
      ],
      editForm: false,
      tab: "all",
      detailTabs: "campaign",
      campaignMessages: [],
      campaignMessageRecipients: [],
      messagePrice: 0.0,
      autoReplyMessagePrice: 0.0,
      selectedCampaign: {...emptyCampaign},
      selectedCampaignForm: null,
      campaigns: [],
      contactGroups: [],
      integrations: [],
      fileToAttach: null,
      pdfToHtmlFile: null,
    };
  },
  async mounted() {
    this.selectCampaign(emptyCampaign);
  },
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        await this.loadData();
      },
      deep: true,
    },
  },
  methods: {
    copyMediaLink() {
      const location = import.meta.env.VITE_AUTH_REPLY_URL + "/mrc/" + this.selectedCampaign.id;
      copyToClipboard(location);
      this.showSuccessMessage("Link Copied");
    },
    formatItem(item) {
      const twentyFourHourTime = date.extractDate(item.timeOfDay, "HH:mm");

      if (typeof item.daysOfWeek === "string") {
        item.daysOfWeek = item.daysOfWeek.split(",");
      }

      return {
        ...item,
        startDate: this.getDtFormattedWithoutTime(item.startDate, "MM/DD/YYYY"),
        timeOfDay: this.getDtFormatted(twentyFourHourTime, "hh:mm a"),
        recurring: item.recurring.toString(),
        emailResultsTo: item.emailResultsTo
          ? item.emailResultsTo.split(",")
          : null,
        emailReplyTo: item.emailReplyTo ? item.emailReplyTo.split(",") : null,
        autoResponseMessage: item.autoResponseMessage || "",
        dontSendFileReceivedNotification:
          item.dontSendFileReceivedNotification || false,
        expirePreviousLinks: item.expirePreviousLinks || false,
        listLinkExpirationDateTime: item.listLinkExpirationDateTime
          ? this.getDtFormattedWithoutTime(item.listLinkExpirationDateTime)
          : null,
        formLinkExpirationDateTime: item.formLinkExpirationDateTime
          ? this.getDtFormattedWithoutTime(item.formLinkExpirationDateTime)
          : null,
        mediaLinkExpirationDateTime: item.mediaLinkExpirationDateTime
          ? this.getDtFormattedWithoutTime(item.mediaLinkExpirationDateTime)
          : null,
        contactGroups: item.campaignContacts
          .filter(
            (cc) =>
              cc.contactGroupId &&
              this.contactGroups.some((ac) => ac.id == cc.contactGroupId)
          )
          .map((cc) => ({
            value: cc.contactGroupId,
            label: this.contactGroups.find((ac) => ac.id == cc.contactGroupId)
              .name,
          })),
      };
    },
    async loadDocuments() {
      const documents = await documentApi.getMedia(true);
      this.availableDocuments = documents;
    },
    onManageFilesChange(checked) {
      if (checked) {
        this.selectedCampaign.startStoreFilesDateTime = new Date();
        return null;
      }

      this.selectedCampaign.startStoreFilesDateTime = null;
    },
    copyToClipBoard(prop) {
      let value;
      if (Array.isArray(prop)) value = prop.join(", ");
      else if (typeof prop == "string") value = prop;

      copyToClipboard(prop)
        .then(() => {
          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "content_copy",
            position: "top",
            message: "Copied to clipboard",
          });
        })
        .catch(() => {
          this.$q.notify({
            type: "negative",
            position: "top",
            message: "Could not copy to clipboard",
          });
        });
    },
    onTabPress($event, applyToEmailReplies = false) {
      $event.preventDefault();
      const value = $event.target.value;
      if (applyToEmailReplies) {
        !this.selectedCampaign.emailReplyTo &&
          (this.selectedCampaign.emailReplyTo = []);

        const valid = this.validateEmail([value]);
        if (valid) {
          this.selectedCampaign.emailReplyTo.push(value.toLowerCase());
        }

        this.$refs.emailReplyTo.updateInputValue("");
      } else {
        !this.selectedCampaign.emailResultsTo &&
          (this.selectedCampaign.emailResultsTo = []);

        const valid = this.validateEmail([value]);
        if (valid) {
          this.selectedCampaign.emailResultsTo.push(value.toLowerCase());
        }

        this.$refs.emailResultsTo.updateInputValue("");
      }
    },
    async onPdfToHtml(file) {
      if (!file) {
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const result = await campaignApi.pdfToHtml(formData);
        this.selectedCampaign.messageTemplate = result;
      } catch (error) {
        console.error(error);
      } finally {
        this.pdfToHtmlFile = null;
      }
    },
    async onRemoveFile(item) {
      try {
        const response = await campaignApi.removeFile({
          campaignId: this.selectedCampaign.id,
          fileName: item,
        });

        this.selectedCampaign.attachments = this.availableAttachments
          .filter((f) => f !== item)
          .join(";");
      } catch (error) {
        console.error(error);
      }
    },
    async onAttachmentClicked(item) {
      try {
        const response = await campaignApi.downloadFile({
          campaignId: this.selectedCampaign.id,
          fileName: item,
        });

        exportFile(response.fileName, response.file);
      } catch (error) {
        console.error(error);
      }
    },
    async onAttachFile(file) {
      if (!file) {
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        await campaignApi.attachFile({
          campaignId: this.selectedCampaign.id,
          data: formData,
        });

        if (!this.selectedCampaign.attachments) {
          this.selectedCampaign.attachments = file.name;
        } else {
          this.selectedCampaign.attachments = `${this.selectedCampaign.attachments};${file.name}`;
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.fileToAttach = null;
      }
    },
    onInputEmail($event, applyToEmailReplies = false) {
      const value = $event.target.value;

      if (value.includes(",")) {
        const array = value
          .replace(/\s/g, "")
          .split(",")
          .filter((f) => f.trim() !== "");

        if (applyToEmailReplies) {
          !this.selectedCampaign.emailReplyTo &&
            (this.selectedCampaign.emailReplyTo = []);

          for (const email of array) {
            const valid = this.validateEmail([email]);
            if (valid) {
              this.selectedCampaign.emailReplyTo.push(email.toLowerCase());
            }

            this.$refs.emailReplyTo.updateInputValue("");
          }
        } else {
          !this.selectedCampaign.emailResultsTo &&
            (this.selectedCampaign.emailResultsTo = []);

          for (const email of array) {
            const valid = this.validateEmail([email]);
            if (valid) {
              this.selectedCampaign.emailResultsTo.push(email.toLowerCase());
            }

            this.$refs.emailResultsTo.updateInputValue("");
          }
        }
      }
    },
    createValue($event, applyToEmailReplies = false) {
      const value = $event.target.value;
      const valid = this.validateEmail([value]);
      if (!valid) return;
      if (applyToEmailReplies) {
        this.selectedCampaign.emailReplyTo.push(value);
      } else {
        this.selectedCampaign.emailResultsTo.push(value);
      }
    },
    handleRecurringChange() {
      const invalidRecurringValue =
        this.selectedCampaign.recurring === "true" &&
        this.selectedCampaign.retryEvery === "Weekly";

      if (invalidRecurringValue) {
        this.selectedCampaign.retryEvery = "15 Minutes";
      }
    },
    updateProxyDate() {
      this.proxyDate = date.formatDate(new Date(), "MM/DD/YY");
    },
    async loadData() {
      this.sqlData = [];
      this.sqlListData = [];

      var showAll = null;
      if (this.showAllCampaigns) {
        showAll = true;
      }

      this.contactGroups = (await contactApi.findGroups()) || [];
      await this.loadDocuments();
      await this.loadCampaigns(showAll);

      const responseIntegrations =
        await integrationApi.findCampaignIntegrations();
      this.integrations = responseIntegrations || [];

      if (this.campaigns.length > 0) {
        this.selectCampaign(this.campaigns[0]);
      } else {
        this.selectCampaign(emptyCampaign);
      }
    },
    async getSmsEstimate(message) {
      try {
        const payload = JSON.stringify(message);
        const response = await axiosInstance.post(
          `${import.meta.env.BASE_URL}/campaign/cost-estimate`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async loadCampaigns(showAll = null) {
      try {
        if (!this.activeTenant) {
          return;
        }

        const campaigns = await campaignApi.getCampaigns(showAll);
        if (campaigns && campaigns.length > 0) {
          this.campaigns = campaigns.map(this.formatItem);
        }
      } catch (error) {
        console.error("Unable to load campaigns: ", error);
      }
    },
    restoreCampaign() {
      axiosInstance
        .post(
          `${import.meta.env.BASE_URL}/campaign/restore-campaign/${this.selectedCampaign.id}`
        )
        .then(async (response) => {
          await this.loadData();

          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            position: "top",
            message: "Campaign Restored",
          });
        })
        .catch((error) => console.error(error));
    },
    deleteCampaign() {
      axiosInstance
        .post(
          `${import.meta.env.BASE_URL}/campaign/remove-campaign/${this.selectedCampaign.id}`
        )
        .then(async (response) => {
          await this.loadData();

          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            position: "top",
            message: "Campaign Archived",
          });
        })
        .catch((error) => console.error(error));
    },
    toggleCampaignPause() {
      axiosInstance
        .put(
          `${import.meta.env.BASE_URL}/campaign/toggle-pause/${this.selectedCampaign.id}`
        )
        .then(async (response) => {
          await this.loadData();

          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            position: "top",
            message:
              "Campaign " + this.selectedCampaign.paused ? "Resumed" : "Paused",
          });
        })
        .catch((error) => console.error(error));
    },
    goLive() {
      axiosInstance
        .put(
          `${import.meta.env.BASE_URL}/campaign/go-live/${this.selectedCampaign.id}`
        )
        .then(async (response) => {
          await this.loadData();

          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            position: "top",
            message: "Campaign Started",
          });
        })
        .catch((error) => console.error(error));
    },
    runCampaignNow() {
      const payload = this.getSelectedCampaign();
      axiosInstance
        .post(`${import.meta.env.BASE_URL}/campaign/run-now`, payload)
        .then((response) => {
          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            position: "top",
            message: "Campaign Started",
          });
        })
        .catch((error) => console.error(error));
    },
    async testSqlConnection() {
      const payload = this.integrations.find(
        (f) => f.id === this.selectedCampaign.integrationId
      );

      if (payload == null) {
        return;
      }

      const response = await integrationApi.testSqlQuery(payload);
      this.sqlData = response.data;
      this.sqlColumns = response.columns;
    },
    async testSqlListConnection() {
      const payload = this.integrations.find(
        (f) => f.id === this.selectedCampaign.integrationListId
      );

      if (payload == null) {
        return;
      }

      const response = await integrationApi.testSqlQuery(payload);
      this.sqlListData = response.data || [];
      this.sqlListColumns = response.columns || [];
    },
    validateEmail(emails) {
      if (!emails || emails.length === 0) return false;

      let noError = true;
      const regex =
        /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/;
      for (const e of emails) {
        const testedValue = regex.test(String(e).toLowerCase());
        if (!testedValue) {
          noError = false;
          break;
        }
      }

      return noError;
    },
    async onSubmit() {
      // if (this.selectedCampaign.messageTemplate.length >= 1400) {
      //   this.showErrorMessage('Messages cannot be longer than 1400 characters');
      //   return;
      // }

      if (this.selectedCampaign.daysOfWeek.length <= 0) {
        return this.$q.notify({
          type: "negative",
          position: "top",
          message: "Please select a day of the week",
        });
      }

      this.$refs.emailResultsTo.validate();
      this.$refs.emailReplyTo.validate();

      if (
        this.$refs.emailResultsTo.hasError ||
        this.$refs.emailReplyTo.hasError
      ) {
        return;
      }

      const payload = this.getSelectedCampaign();
      const response = await campaignApi.updateCampaign(payload);
      const formattedResponse = this.formatItem(response);
      const campaignIdx = this.campaigns.findIndex((f) => f.id === response.id);
      this.selectedCampaign.id = response.id;
      if (campaignIdx < 0) {
        this.campaigns.unshift(formattedResponse);
      } else {
        this.campaigns[campaignIdx] = formattedResponse;
      }

      this.editForm = false;
      this.$forceUpdate();
      this.$q.notify({
        color: "green-4",
        textColor: "white",
        icon: "cloud_done",
        position: "top",
        message: "Campaign Saved",
      });
    },
    pasteCapture(evt, ref) {
      let text, onPasteStripFormattingIEPaste;
      evt.preventDefault();
      if (evt.originalEvent && evt.originalEvent.clipboardData.getData) {
        text = evt.originalEvent.clipboardData.getData("text/plain");
        this.$refs[ref].runCmd("insertText", text);
      } else if (evt.clipboardData && evt.clipboardData.getData) {
        text = evt.clipboardData.getData("text/plain");
        this.$refs[ref].runCmd("insertText", text);
      } else if (window.clipboardData && window.clipboardData.getData) {
        if (!onPasteStripFormattingIEPaste) {
          onPasteStripFormattingIEPaste = true;
          this.$refs[ref].runCmd("ms-pasteTextOnly", text);
        }
        onPasteStripFormattingIEPaste = false;
      }
    },
    getSelectedCampaign() {
      const twelveHourTime = date.extractDate(
        this.selectedCampaign.timeOfDay,
        "hh:mm a"
      );

      const formTemplatePayload = {
        sdk: this.selectedCampaignForm ? 2 : 1,
        data: this.selectedCampaignForm
          ? this.selectedCampaignForm.data
          : this.formEditor.formData,
        pageSettings: this.selectedCampaignForm
          ? this.selectedCampaignForm.pageSettings
          : this.formEditor.formData,
      };

      const payload = {
        id: this.selectedCampaign.id,
        tenantId: this.activeTenant.id,
        name: this.selectedCampaign.name,
        active: this.selectedCampaign.active,
        draft: this.selectedCampaign.draft,
        paused: this.selectedCampaign.paused,
        priority: this.selectedCampaign.priority,
        integrationId: this.selectedCampaign.integrationId,
        integrationListId: this.selectedCampaign.integrationListId,
        daysOfWeek: this.selectedCampaign.daysOfWeek.join(","),
        startDate: this.selectedCampaign.startDate,
        retryCount: this.selectedCampaign.retryCount || 0,
        retryEvery: this.selectedCampaign.retryEvery,
        occursEvery: this.selectedCampaign.occursEvery,
        schedule: this.selectedCampaign.schedule,
        timeOfDay: date.formatDate(twelveHourTime, "HH:mm"),
        recurring: this.selectedCampaign.recurring,
        messageTemplate: this.selectedCampaign.messageTemplate,
        formTemplate: JSON.stringify(formTemplatePayload),
        messageSubject: this.selectedCampaign.messageSubject,
        emailResultsTo: this.selectedCampaign.emailResultsTo
          ? this.selectedCampaign.emailResultsTo.join(",")
          : null,
        emailReplyTo: this.selectedCampaign.emailReplyTo
          ? this.selectedCampaign.emailReplyTo.join(",")
          : null,
        replyImmediateAttentionKeywords:
          this.selectedCampaign.replyImmediateAttentionKeywords,
        autoResponseMessage: this.selectedCampaign.autoResponseMessage,
        lastRunStatus: this.selectedCampaign.lastRunStatus,
        lastRunStatusMessage: this.selectedCampaign.lastRunStatusMessage,
        serviceSid: this.selectedCampaign.serviceSid,
        listLinkExpirationDateTime:
          this.selectedCampaign.listLinkExpirationDateTime,
        formLinkExpirationDateTime:
          this.selectedCampaign.formLinkExpirationDateTime,
        mediaLinkExpirationDateTime:
          this.selectedCampaign.mediaLinkExpirationDateTime,
        editableSurvey: this.selectedCampaign.editableSurvey,
        startStoreFilesDateTime: this.selectedCampaign.startStoreFilesDateTime,
        expirePreviousLinks: this.selectedCampaign.expirePreviousLinks,
        dontSendFileReceivedNotification:
          this.selectedCampaign.dontSendFileReceivedNotification,
        lastRunNowBy: this.selectedCampaign.lastRunNowBy,
        lastRunDateTime: this.selectedCampaign.lastRunDateTime,
        contactMethod: this.selectedCampaign.contactMethod,
        attachments: this.selectedCampaign.attachments,
        formName: this.selectedCampaign.formName,
        retryType: this.selectedCampaign.retryType,
        campaignContacts: [
          ...this.selectedCampaign.contactGroups.map((c) => {
            return {
              contactGroupId: c.value,
              campaignId: this.selectedCampaign.id,
            };
          }),
        ],
      };

      return payload;
    },
    selectCampaign(campaign) {
      this.selectedCampaignForm = null;
      this.selectedCampaign = { ...campaign };

      this.detailTabs = "campaign";
      this.editForm = false;
      this.sqlData = [];
      this.sqlColumns = [];

      const formTemplate = campaign.formTemplate || '{"sdk": 2, "pageSettings": {}, "data": []}';
      const parsedFormTemplate = JSON.parse(formTemplate);
      if (parsedFormTemplate.sdk == 2) {
        this.selectedCampaignForm = parsedFormTemplate;
      } else if (parsedFormTemplate.sdk == 1) {
        const formeoOptions = {
          editorContainer: "#form-builder",
          dataType: "json",
          controls: {
            disable: {
              elements: ["hidden", "upload"],
              formActions: true,
            },
          },
        };
        this.formEditor = new FormeoEditor(
          formeoOptions,
          parsedFormTemplate.data
        );

        setTimeout(() => {
          $("select[multiple]").each(function () {
            $(this).removeAttr("multiple");
          });
        }, 1000);
      } else {
        const formeoOptions = {
          editorContainer: "#form-builder",
          dataType: "json",
          controls: {
            disable: {
              elements: ["hidden", "upload"],
              formActions: true,
            },
          },
        };
        this.formEditor = new FormeoEditor(formeoOptions, parsedFormTemplate);

        setTimeout(() => {
          $("select[multiple]").each(function () {
            $(this).removeAttr("multiple");
          });
        }, 1000);
      }

      this.$forceUpdate();
    },
    renderForm(showEditor) {
      if (showEditor) {
        const formeoOptions = {
          editorContainer: "#form-builder",
          dataType: "json",
          controls: {
            disable: {
              elements: ["hidden", "upload"],
              formActions: true,
            },
          },
        };

        this.formEditor = new FormeoEditor(
          formeoOptions,
          this.formEditor.formData
        );

        setTimeout(() => {
          $("select[multiple]").each(function () {
            $(this).removeAttr("multiple");
          });
        }, 1000);
      } else {
        const renderer = new FormeoRenderer({
          renderContainer: "#form-builder",
        });

        renderer.render(this.formEditor.formData);

        $("select[multiple]").each(function () {
          $(this).chosen();
        });
      }
    },
    createCampaign() {
      this.selectCampaign(emptyCampaign);
      this.editForm = true;
    },
    priorityColor: function (campaign) {
      if (!campaign) {
        return "black";
      }

      if (campaign.priority === "High") {
        return "red";
      } else if (campaign.priority === "Normal") {
        return "blue";
      }
      if (campaign.priority === "Low") {
        return "black";
      }
    },
    lastRunStatusColor: function (campaign) {
      if (!campaign) {
        return "red";
      }

      if (campaign.lastRunStatus === "Error") {
        return "red";
      } else if (campaign.lastRunStatus === "Good") {
        return "green";
      }
    },
    scheduleDisplay: function (campaign) {
      if (campaign.occursEvery === "Custom") {
        return "Custom schedule";
      }

      const recurring = campaign.recurring === "true" ? "Every" : "Once";
      const timeOfDay = campaign.timeOfDay;

      let daysOfWeek = campaign.daysOfWeek;
      if (daysOfWeek && daysOfWeek.length === 7) {
        daysOfWeek = "day";
      } else if (
        daysOfWeek &&
        daysOfWeek.length === 5 &&
        !daysOfWeek.some((d) => d === "Saturday" && d === "Sunday")
      ) {
        daysOfWeek = "Weekday";
      }

      const result = `${recurring} ${daysOfWeek} @ ${timeOfDay}`;
      const resultWithSpaceWordBreaks = result.replace(",", ", ");
      return resultWithSpaceWordBreaks;
    },
    nextExecutionDisplay: function (campaign) {
      if (!campaign.nextExecution) {
        return "Next execution: none";
      }

      const nextExecutionDt = moment(campaign.nextExecution);
      const dateDiff = date.getDateDiff(nextExecutionDt, new Date());
      const result = `Next execution: ${date.formatDate(
        nextExecutionDt,
        "ddd, MMM Do YYYY hh:mm a"
      )} (${dateDiff === -1 ? `today` : `${dateDiff} days`})`;

      return result;
    },
    exportCampaignReport: function (option) {
      switch (option) {
        default:
          this.fetchMessageRecipientsByDate(
            date.formatDate(new Date(), "MM/DD/YY")
          );
          break;
        case 1:
          this.fetchMessageRecipientsByDate(
            date.formatDate(
              date.subtractFromDate(new Date(), { days: 7 }),
              "MM/DD/YY"
            )
          );
          break;
        case 2:
          this.fetchMessageRecipientsByDate(
            date.formatDate(
              date.subtractFromDate(new Date(), { days: 30 }),
              "MM/DD/YY"
            )
          );
          break;
        case 3:
          this.fetchMessageRecipientsByDate(
            date.formatDate(new Date(1970, 1, 1), "MM/DD/YY")
          );
          break;
      }
    },
    fetchMessageRecipientsByDate: function (startDate, endDate) {
      if (this.selectedCampaign == null || this.selectedCampaign.id == null) {
        return;
      }

      const currentDate = date.formatDate(new Date(), "MM-DD-YYYY");
      axiosInstance
        .post(
          `${import.meta.env.BASE_URL}/campaign/message-log`,
          {
            startDate: startDate,
            endDate: endDate || currentDate,
            campaignId: this.selectedCampaign.id
          },
          {
            responseType: "blob",
            headers: { Accept: "application/vnd.ms-excel" },
          }
        )
        .then((response) => {
          if (response.data) {
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
              "download",
              `${this.selectedCampaign.name} ${currentDate} Report.xlsx`
            );
            document.body.appendChild(link);
            link.click();
          }
        });
    },
    async moveToTenant() {
      try {
        await campaignApi.moveToTenant({
          campaignId: this.selectedCampaign.id,
          tenantId: this.moveCampaignDialog.tenantId,
        });
        this.moveCampaignDialog = {
          open: false,
          tenantId: null,
        };
        const index = this.campaigns.findIndex(campaign => campaign.id === this.selectedCampaign.id);
        if (index > -1) {
          this.campaigns.splice(index, 1);
        }
        this.campaigns.length
          ? this.selectCampaign(this.campaigns[0])
          : this.selectCampaign(emptyCampaign);
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  },
});
</script>
