<template>
  <q-card flat class="q-pt-md" style="height: calc(100vh - 50px)">
    <q-tabs
      v-model="tab"
      align="left"
      narrow-indicator
      inline-label
      active-bg-color="grey-4"
      class="bg-grey-3 q-mx-sm"
      indicator-color="transparent"
      @update:model-value="onTabSelect"
    >
      <q-tab
        name="documents"
        icon="description"
        label="Files Received"
        no-caps
      />
      <q-tab name="files" icon="upload_file" label="Files" no-caps />
    </q-tabs>
    <q-tab-panels
      v-model="tab"
      animated
      swipeable
      vertical
      transition-next="jump-up"
      transition-before="jump-up"
    >
      <q-tab-panel name="documents" class="q-pa-sm">
        <q-card>
          <q-layout
            view="lHh lpR lff"
            container
            class="full-width"
            style="height: calc(100vh - 140px)"
          >
            <q-drawer
              v-model="navOpen"
              :width="300"
              show-if-above
              bordered
              :breakpoint="690"
            >
              <div class="absolute-top" style="z-index: 50;">
                <div class="bg-white q-py-xs">
                  <q-toolbar class="text-black row q-gutter-sm justify-end">
                    <span class="q-ml-sm text-capitalize text-grey-7">
                      Total:
                      {{ totalResponses }}
                    </span>

                    <q-space />
                    <q-btn
                      dense
                      flat
                      color="grey-9"
                      icon="refresh"
                      @click="loadResponses(true)"
                    >
                      <q-tooltip>Refresh</q-tooltip>
                    </q-btn>
                    <q-btn
                      dense
                      flat
                      color="grey-9"
                      icon="o_print"
                      @click="printAllDialog.open = true"
                    >
                      <q-tooltip>Print accepted documents</q-tooltip>
                    </q-btn>
                  </q-toolbar>
                  <q-toolbar>
                    <q-input
                      dense
                      filled
                      v-model="responseViewState.searchTerm"
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
                  <q-item-label>Accepted/Rejected</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    color="secondary"
                    @update:model-value="loadResponses(true)"
                    v-model="responseViewState.showArchived"
                  />
                </q-item-section>
              </q-item>

              <!-- response list -->
              <q-virtual-scroll
                ref="virtualScroll"
                style="height: calc(100% - 150px)"
                :virtual-scroll-slice-size="responseViewState.pageSize"
                :items="responses"
                @virtual-scroll="details => onVirtualScroll(details)"
                separator
              >
                <template v-slot="{ item: response, index }">
                  <q-item clickable v-ripple :key="index" dense @click="selectResponse(response.id)" :active="selectedResponse && response.id === selectedResponse.id" active-class="bg-grey-3">
                    <q-item-section>
                      <q-item-label lines="1">
                        <strong>{{ response.name }}</strong>
                      </q-item-label>
                      <q-item-label caption lines="1">
                        {{ response.messageSid }}
                      </q-item-label>
                      <q-item-label caption lines="1">
                        {{ response.subject }}
                      </q-item-label>
                      <q-item-label caption lines="1">
                        {{ getDtFormatted(response.receivedDateTime) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                      <q-badge
                        v-if="response.status === 'rejected'"
                        color="red"
                        class="q-mb-xs q-mr-xs q-py-xs text-white"
                      >
                        <strong>Rejected</strong>
                      </q-badge>

                      <q-badge
                        v-else-if="response.status === 'accepted'"
                        color="green"
                        class="q-mb-xs q-mr-xs q-py-xs"
                      >
                        <strong>Accepted</strong>
                      </q-badge>

                      <q-badge
                        v-else
                        color="blue-6"
                        class="q-mb-xs q-mr-xs q-py-xs"
                      >
                        <strong>Pending</strong>
                      </q-badge>

                      <q-icon
                        name="circle"
                        size="xs"
                        color="green"
                        v-if="!response.seen"
                      />
                    </q-item-section>
                  </q-item>
                </template>
              </q-virtual-scroll>
            </q-drawer>

            <q-page-container class="fit">
              <q-page class="fit">
                <q-scroll-area
                  style="height: calc(100vh - 140px)"
                  class="q-pa-none bg-white"
                >
                  <div class="row justify-between">
                    <q-tabs
                      v-model="detailTab"
                      align="left"
                      narrow-indicator
                      inline-label
                      active-bg-color="white"
                      class="bg-grey-3 col"
                      indicator-color="transparent"
                      @update:model-value="onTabChange"
                    >
                      <q-tab name="overview" label="Overview" no-caps />
                      <q-tab
                        :disable="
                          !selectedResponse ||
                            (selectedResponse && !selectedResponse.hasFiles)
                        "
                        name="document"
                        label="Document"
                        no-caps
                      />
                      <q-tab
                        :disable="!selectedResponse"
                        name="accept"
                        label="Accept"
                        :class="
                          detailTab === 'accept' ? 'bg-green-4' : 'bg-green-2'
                        "
                        no-caps
                      />
                      <q-tab
                        :disable="!selectedResponse"
                        name="reject"
                        label="Reject"
                        :class="
                          detailTab === 'reject' ? 'bg-red-4' : 'bg-red-2'
                        "
                        no-caps
                      />
                      <div
                        class="row justify-end q-mr-sm"
                        color="white"
                        style="width: 100%"
                      >
                        <q-btn
                          :disable="
                            !selectedResponse ||
                              (selectedResponse && !selectedResponse.hasFiles)
                          "
                          no-caps
                          flat
                          label="Print"
                          icon="print"
                          @click="printDoc"
                        ></q-btn>
                      </div>
                    </q-tabs>
                  </div>

                  <q-tab-panels
                    v-model="detailTab"
                    animated
                    swipeable
                    vertical
                    transition-next="jump-up"
                    transition-before="jump-up"
                  >
                    <q-tab-panel name="overview" class="q-pa-none">
                      <q-toolbar
                        class="text-black q-px-none"
                        v-if="selectedResponse"
                      >
                        <q-item class="q-subtitle-1 row items-center">
                          <q-btn
                            :disable="!selectedResponse.hasFiles"
                            no-caps
                            label="Download"
                            color="blue-6"
                            icon="download"
                            @click="downloadMergedDocument"
                          />

                          <span
                            v-if="!selectedResponse.hasFiles"
                            class="text-red q-ml-sm">
                            No document found
                          </span>
                        </q-item>
                        <q-space />
                        <q-item-section side v-if="selectedResponse">
                          <div class="row items-center">
                            <q-badge
                              v-if="selectedResponse.printedDateTime"
                              color="blue"
                              class="q-mb-xs q-mr-xs q-py-xs text-white cursor-pointer"
                            >
                              <strong>Printed</strong>
                              <q-tooltip>
                                Printed {{ getDtFormatted(selectedResponse.printedDateTime) }}
                                by {{ selectedResponse.printedBy }}
                              </q-tooltip>
                            </q-badge>

                            <q-badge
                              v-if="selectedResponse.status === 'rejected'"
                              color="red"
                              class="q-mb-xs q-mr-xs q-py-xs text-white"
                            >
                              <strong>Rejected</strong>
                            </q-badge>

                            <q-badge
                              v-if="selectedResponse.status === 'accepted'"
                              color="green"
                              class="q-mb-xs q-mr-xs q-py-xs"
                            >
                              <strong>Accepted</strong>
                            </q-badge>
                          </div>
                        </q-item-section>
                        <q-btn-dropdown
                          v-if="user.tenantOwner || user.orgAdmin"
                          dense
                          flat
                          dropdown-icon="more_vert"
                          class="q-mr-sm"
                        >
                          <q-list>
                            <q-item
                              clickable
                              v-ripple
                              @click="showDeleteDialog = true"
                            >
                              <q-item-section avatar top>
                                <q-avatar
                                  icon="delete"
                                  color="red-6"
                                  text-color="white"
                                />
                              </q-item-section>

                              <q-item-section>
                                <q-item-label lines="1">Delete</q-item-label>
                                <q-item-label caption>
                                  Delete this document
                                </q-item-label>
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                      </q-toolbar>
                      <q-separator></q-separator>

                      <q-form class="q-pa-md" v-if="selectedResponse">
                        <div class="row q-gutter-sm q-mb-sm">
                          <div
                            :class="
                              $q.screen.gt.xs ? 'col-12 q-pr-sm' : 'col-11'
                            "
                          >
                            <label>Name</label>
                            <q-field dense filled>
                              <template v-slot:control>
                                <div
                                  class="self-center full-width no-outline"
                                  tabindex="0"
                                >
                                  {{ selectedResponse.name }}
                                </div>
                              </template>
                            </q-field>
                          </div>
                        </div>

                        <div class="row q-gutter-sm q-mb-sm">
                          <div :class="$q.screen.gt.xs ? 'col' : 'col-11'">
                            <label>Email</label>
                            <q-field dense filled>
                              <template v-slot:control>
                                <div
                                  class="self-center full-width no-outline"
                                  tabindex="0"
                                >
                                  {{ selectedResponse.email }}
                                </div>
                              </template>
                            </q-field>
                          </div>

                          <div :class="$q.screen.gt.xs ? 'col' : 'col-11'">
                            <label>Number</label>
                            <q-field dense filled>
                              <template v-slot:control>
                                <div
                                  class="self-center full-width no-outline"
                                  tabindex="0"
                                >
                                  {{ selectedResponse.number }}
                                </div>
                              </template>
                            </q-field>
                          </div>
                        </div>

                        <div
                          class="row q-gutter-sm q-mb-sm"
                          v-if="selectedResponse.body"
                        >
                          <div
                            :class="
                              $q.screen.gt.xs ? 'col-12 q-pr-sm' : 'col-11'
                            "
                          >
                            <label class="q-mb-sm">Initial message</label>
                            <label> sent at {{ getDtFormatted(selectedResponse.sentDateTime) }}</label>
                            <div
                              class="bg-grey-2 q-pa-md q-mb-sm"
                              v-html="formatMessage(selectedResponse.body)"
                            ></div>
                          </div>
                        </div>

                        <div
                          class="row q-gutter-sm q-mb-sm"
                          v-if="selectedResponse.feedback"
                        >
                          <div
                            :class="
                              $q.screen.gt.xs ? 'col-12 q-pr-sm' : 'col-11'
                            "
                          >
                            <label class="q-mb-sm">Rejected/Accepted message</label>
                            <label>sent at {{ getDtFormatted(selectedResponse.feedbackSentDateTime) }}</label>
                            <div
                              class="bg-grey-2 q-pa-md q-mb-sm"
                              v-html="formatMessage(selectedResponse.feedback)"
                            ></div>
                          </div>
                        </div>
                      </q-form>
                    </q-tab-panel>

                    <q-tab-panel
                      name="document"
                      class="q-pa-none"
                      style="height: calc(100vh - 187px)"
                    >
                      <q-pdfviewer
                        v-if="pdfUrl"
                        content-class="full-height"
                        type="pdfjs"
                        :src="pdfUrl"
                      />
                    </q-tab-panel>

                    <q-tab-panel name="accept" class="q-pa-none">
                      <q-card
                        flat
                        style="width: 100%; height: 100%;"
                        v-if="selectedResponse"
                      >
                        <q-card-section class="row justify-between">
                          <div class="text-h6">Accept Files</div>
                          <div>
                            <q-btn
                              no-caps
                              color="blue-6"
                              label="Mark Accepted"
                              class="q-px-sm q-mr-sm q-my-xs"
                              @click="markFeedback('accepted')"
                            ></q-btn>
                            <q-btn
                              no-caps
                              color="blue-6"
                              label="Mark Accepted and Send Message"
                              icon="send"
                              class="q-px-sm q-mr-sm q-my-xs"
                              @click="sendFeedback(true)"
                            ></q-btn>
                          </div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          <q-input
                            v-model="feedbackComments"
                            filled
                            type="textarea"
                            label="Comments"
                            rows="17"
                          />
                        </q-card-section>
                      </q-card>
                    </q-tab-panel>

                    <q-tab-panel name="reject" class="q-pa-none">
                      <q-card
                        flat
                        style="width: 100%; height: 100%;"
                        v-if="selectedResponse"
                      >
                        <q-card-section class="row justify-between">
                          <div class="text-h6">Reject Files</div>
                          <div>
                            <q-btn
                              no-caps
                              color="blue-6"
                              label="Mark Rejected"
                              class="q-px-sm q-mr-sm q-my-xs"
                              @click="markFeedback('rejected')"
                            ></q-btn>
                            <q-btn
                              no-caps
                              color="blue-6"
                              label="Mark Rejected and Send Message"
                              icon="send"
                              class="q-px-sm q-mr-sm q-my-xs"
                              @click="sendFeedback(false)"
                            ></q-btn>
                          </div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          <q-select
                            filled
                            multiple
                            use-chips
                            label="Options"
                            class="q-mb-md"
                            :options="rejectedOptions"
                            v-model="rejectedReasons"
                            @update:model-value="updateComments"
                          ></q-select>

                          <q-input
                            v-model="feedbackComments"
                            filled
                            type="textarea"
                            label="Comments"
                            rows="17"
                          />
                        </q-card-section>
                      </q-card>
                    </q-tab-panel>
                  </q-tab-panels>
                </q-scroll-area>
              </q-page>
            </q-page-container>
          </q-layout>
        </q-card>
      </q-tab-panel>
      <q-tab-panel name="files" class="q-pa-sm">
        <div class="full-height">
          <q-card>
            <q-card-section>
              <div class="row justify-end q-mb-sm">
                <q-file
                  style="display: none"
                  ref="newFilePickerRef"
                  dense
                  outlined
                  v-model="fileToUpload"
                  label="Upload"
                  @update:model-value="uploadFile"
                >
                  <template v-slot:append>
                    <q-icon name="attachment" />
                  </template>
                </q-file>

                <q-input
                  style="width: 250px; padding-right: 5px"
                  outlined
                  dense
                  debounce="300"
                  v-model="tableSearchTerm"
                  placeholder="Search"
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <q-btn
                  icon="file_upload"
                  color="primary"
                  label="Upload"
                  no-caps
                  unelevated
                  @click="$refs.newFilePickerRef.pickFiles()"
                />
              </div>

              <q-table
                ref="docTable"
                no-data-label="No Files uploaded"
                :rows="fileTableData"
                :columns="fileTableColumns"
                :filter="tableSearchTerm"
                :pagination="{ rowsPerPage: 50 }"
                :rows-per-page-options="[25]"
                binary-state-sort
                dense
                flat
                square
                bordered
                separator="cell"
                row-key="name"
              >
                <template #header="props">
                  <q-tr :props="props">
                    <q-th
                      v-for="col in props.cols"
                      :key="col.name"
                      :props="props"
                      style="font-size: 15px; font-weight: 700"
                    >
                      {{ col.label }}
                    </q-th>
                  </q-tr>
                </template>
                <template #body="props">
                  <q-tr :props="props">
                    <q-td key="fileName" :props="props">
                      <div class="row items-center justify-between">
                        <div class="row justify-start items-center">
                          <q-icon
                            size="sm"
                            :name="'far ' + getClassIcon(props.row.fileName)"
                          />
                          <div class="q-px-xs">{{ props.row.fileName }}</div>
                          <q-badge
                            v-if="props.row.pinCode"
                            color="blue-6"
                            class="q-mr-xs"
                          >
                            <strong>Pin Protected</strong>
                          </q-badge>
                          <q-badge v-if="props.row.sharing" color="green">
                            <strong>Shared</strong>
                          </q-badge>
                        </div>

                        <div class="row justify-end q-gutter-x-sm">
                          <q-btn
                            no-caps
                            flat
                            icon="link"
                            @click="copyDownloadLink(props.row.id)"
                            v-if="props.row.sharing"
                          >
                            Copy Link
                          </q-btn>
                          <q-btn
                            flat
                            no-caps
                            icon="download"
                            @click="downloadMediaFile(props.row.id)"
                          >
                            Download
                          </q-btn>
                        </div>
                      </div>
                    </q-td>
                    <q-td key="fileSize" :props="props">
                      <div class="row items-center justify-between">
                        {{ formatBytes(props.row.fileSize) }}
                        <q-btn
                          dense
                          flat
                          color="black"
                          size="md"
                          icon="more_horiz"
                          class="doc-more-button"
                        >
                          <q-menu>
                            <q-list style="min-width: 160px">
                              <q-item
                                clickable
                                v-close-popup
                                dense
                                @click="copyDownloadLink(props.row.id)"
                              >
                                <q-item-section class="row">
                                  <h6
                                    class="row items-center"
                                    style="margin: 0; font-size: 15px; font-weight: 400"
                                  >
                                    <q-icon
                                      name="content_copy"
                                      style="margin-top: -2px"
                                      size="xs"
                                    ></q-icon>
                                    <div class="q-pl-sm">Copy Link</div>
                                  </h6>
                                </q-item-section>
                              </q-item>

                              <q-item
                                clickable
                                v-close-popup
                                dense
                                @click="downloadMediaFile(props.row.id)"
                              >
                                <q-item-section class="row">
                                  <h6
                                    class="row items-center"
                                    style="margin: 0; font-size: 15px; font-weight: 400"
                                  >
                                    <q-icon
                                      name="download"
                                      style="margin-top: -2px"
                                      size="xs"
                                    ></q-icon>
                                    <div class="q-pl-sm">Download</div>
                                  </h6>
                                </q-item-section>
                              </q-item>

                              <q-item
                                clickable
                                v-close-popup
                                dense
                                @click="
                                  () => {
                                    if (props.row.pinCode) {
                                      selectedMedia = {
                                        ...props.row,
                                        pinCode: ''
                                      };
                                      updateMedia();
                                    } else {
                                      selectedMedia = { ...props.row };
                                      showMediaPinDialog = true;
                                    }
                                  }
                                "
                              >
                                <q-item-section class="row">
                                  <h6
                                    class="row items-center"
                                    style="margin: 0; font-size: 15px; font-weight: 400"
                                  >
                                    <q-icon
                                      name="password"
                                      style="margin-top: -2px"
                                      size="xs"
                                    ></q-icon>
                                    <div class="q-pl-sm">
                                      {{
                                        props.row.pinCode
                                          ? "Remove Pin"
                                          : "Add Pin"
                                      }}
                                    </div>
                                  </h6>
                                </q-item-section>
                              </q-item>

                              <q-item
                                clickable
                                v-close-popup
                                dense
                                @click="
                                  selectedMedia = {
                                    ...props.row,
                                    sharing: !props.row.sharing
                                  };
                                  updateMedia();
                                "
                              >
                                <q-item-section class="row">
                                  <h6
                                    class="row items-center"
                                    style="margin: 0; font-size: 15px; font-weight: 400"
                                  >
                                    <q-icon
                                      :name="
                                        props.row.sharing ? 'lock' : 'public'
                                      "
                                      style="margin-top: -2px"
                                      size="xs"
                                    ></q-icon>
                                    <div class="q-pl-sm">
                                      {{
                                        props.row.sharing
                                          ? "Stop Sharing"
                                          : "Start Sharing"
                                      }}
                                    </div>
                                  </h6>
                                </q-item-section>
                              </q-item>

                              <q-item
                                clickable
                                v-close-popup
                                dense
                                @click="
                                  showDeleteMediaDialog = true;
                                  selectedMedia = { ...props.row };
                                "
                              >
                                <q-item-section class="row">
                                  <h6
                                    class="row items-center"
                                    style="margin: 0; font-size: 15px; font-weight: 400"
                                  >
                                    <q-icon
                                      name="delete"
                                      style="margin-top: -2px"
                                      size="xs"
                                    ></q-icon>
                                    <div class="q-pl-sm">Delete</div>
                                  </h6>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>
                        </q-btn>
                      </div>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <q-dialog v-model="showMediaPinDialog" persistent v-if="selectedMedia">
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="q-mb-none q-pb-none">
          <div class="text-h6">Update Pin</div>
        </q-card-section>

        <q-card-section>
          <q-input
            label="Pin"
            v-model="selectedMedia.pinCode"
            filled
            dense
          ></q-input>
        </q-card-section>

        <q-card-section class="row justify-between q-pt-none">
          <q-btn
            no-caps
            label="Cancel"
            color="grey-3"
            class="text-black"
            v-close-popup
          />
          <q-btn
            no-caps
            label="Save"
            color="green"
            @click="updateMedia()"
            v-close-popup
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteMediaDialog" persistent v-if="selectedMedia">
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="q-mb-none q-pb-none">
          <div class="text-h6">Delete File</div>
        </q-card-section>

        <q-card-section>
          <div>Are you sure you want to delete this this file?</div>
        </q-card-section>

        <q-card-section class="row justify-between q-pt-none">
          <q-btn
            no-caps
            label="Cancel"
            color="grey-3"
            class="text-black"
            v-close-popup
          />
          <q-btn
            no-caps
            label="Delete"
            color="red"
            @click="deleteMedia"
            v-close-popup
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="q-mb-none q-pb-none">
          <div class="text-h6">Delete Document?</div>
        </q-card-section>

        <q-card-section>
          <div>Are you sure you want to delete this this document?</div>
        </q-card-section>

        <q-card-section class="row justify-between q-pt-none">
          <q-btn
            no-caps
            label="Cancel"
            color="grey-3"
            class="text-black"
            v-close-popup
          />
          <q-btn
            no-caps
            label="Delete"
            color="red"
            @click="deleteDocument"
            v-close-popup
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="printAllDialog.open" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center">
          <q-avatar
            round
            size="lg"
            color="grey-8"
            text-color="white"
            icon="o_print"
          />

          <div class="q-ml-md">
            <div class="full-width text-h6" style="line-height: 1em;">
              Print Accepted
            </div>
          </div>

          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="downloadAllMergedDocuments">
          <q-card-section class="q-gutter-y-md">
            <q-input
              label="Start Date"
              readonly
              dense
              filled
              required
              v-model="printAllDialog.startDate"
            >
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="startDateRef"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      today-btn
                      color="primary"
                      v-model="printAllDialog.startDate"
                      @update:model-value="$refs.startDateRef.hide()"
                      mask="MM/DD/YY"
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
            <q-input
              label="End Date"
              required
              readonly
              dense
              filled
              v-model="printAllDialog.endDate"
            >
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="endDateRef"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      today-btn
                      color="primary"
                      v-model="printAllDialog.endDate"
                      @update:model-value="$refs.endDateRef.hide()"
                      mask="MM/DD/YY"
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
            <q-checkbox
              v-model="printAllDialog.showPrinted"
              label="Show Previously Printed"
              dense
            />
          </q-card-section>

          <q-card-actions class="bg-grey-2 q-pa-md" align="between">
            <q-btn
              color="grey-8"
              text-color="white"
              no-caps
              label="Close"
              style="width: 90px"
              v-close-popup
            />

            <q-btn
              color="blue-8"
              text-color="white"
              no-caps
              label="Print"
              style="width: 90px"
              type="submit"
              v-close-popup
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import documentsApi from "../api/documents";
import { mapState } from "pinia";
import { useTenantStore } from "src/stores/tenantStore";
import { mainMixin } from "../mixins/index";
import { date, exportFile, copyToClipboard } from "quasar";
import printJS from "print-js";
import getClassNameForExtension from "font-awesome-filetypes";

export default {
  name: "Documents",
  mixins: [mainMixin],
  watch: {
    activeTenant: {
      immediate: true,
      async handler() {
        if (!this.activeTenant) {
          return;
        }

        if (this.activeTenant.name === "EDWU") {
          this.rejectedOptions = [
            {
              label: "Not legible",
              comment: "Not legible",
              action: "Please take a new photo and re-submit"
            },
            {
              label: "Duplicate copy",
              comment: "Duplicate copy",
              action: "Please choose the correct task sheet and re-submit"
            },
            {
              label: "No client signature",
              comment: "No client signature",
              action:
                "Please have your client sign your task sheet and re-submit"
            },
            {
              label: "No employee signature",
              comment: "No employee signature",
              action: "Please sign your task sheet and re-submit"
            },
            {
              label: "Missing documentation for why care plan was not followed",
              comment:
                "Missing documentation for why care plan was not followed",
              action:
                "Please document all reasons why the care plan was not followed and re-submit"
            },
            {
              label: "Task sheet expired-contact the office",
              comment: "Task sheet expired-contact the office",
              action: "Contact the office for updated task sheets"
            },
            {
              label:
                "Services were provided / or were not provided according to care plan",
              comment:
                "Services were provided / or were not provided according to care plan",
              action: "Please fill out clock out time and submit"
            },
            {
              label: "Week ending date missing",
              comment: "Week ending date missing",
              action: "Enter week-ending date and re-submit"
            },
            {
              label: "Employee name not written at top of page",
              comment: "Employee name not written at top of page",
              action: "Write your name at top of page and re-submit"
            }
          ];
        }

        await this.loadResponses(true);
        await this.onTabSelect(this.tab);
      },
      deep: true
    }
  },
  computed: {
    ...mapState(useTenantStore, ["activeTenant", "user"])
  },
  methods: {
    formatMessage(message) {
      return !!this.selectedResponse?.number ? message?.replace(/(?:\r\n|\r|\n)/g, '<br>') : message;
    },
    formatResponse(response) {
      return {
        ...response
      };
    },
    openNewTab() {
      const link = this.$router.resolve({ path: "/Chat" });
      window.open(link.href, "_blank");
    },
    formatFullName(fullName) {
      let updatedName = fullName;

      if (fullName.indexOf(",") > -1) {
        updatedName = fullName.split(",")[1];
      }

      return updatedName.trim();
    },
    updateComments() {
      this.$nextTick(() => {
        const formattedReasons = [];

        for (const reason of this.rejectedReasons) {
          formattedReasons.push(`\n\n - ${reason.comment}. ${reason.action}`);
        }

        const typeName =
          this.activeTenant && this.activeTenant.name === "EDWU"
            ? "task sheets"
            : "correction form";
        const recipientName =
          this.activeTenant && this.activeTenant.name === "EDWU"
            ? this.formatFullName(this.selectedResponse.name)
            : this.selectedResponse.name;

        this.feedbackComments =
          `Dear ${recipientName},` +
          `\n\nThe ${typeName} you submitted has been rejected & will not be processed. The reason for your rejection is listed below:` +
          `\n\n(Rejection Reason’s)` +
          (formattedReasons.length > 0
            ? formattedReasons.join("")
            : "\n\n(No reasons selected)") +
          `\n\nPlease correct the ${typeName} and resubmit.`;

        this.$forceUpdate();
      });
    },
    async printDoc() {
      try {
        await this.getPDF();

        const printedResponse = await documentsApi.markAsPrinted(this.selectedResponse.id);
        const index = this.responses.findIndex(r => r.id === this.selectedResponse.id);
        if (index > -1) {
          const updatedResponse = {
            ...this.selectedResponse,
            printedBy: printedResponse.printedBy,
            printedDateTime: printedResponse.printedDateTime,
          }
          this.responses.splice(index, 1, updatedResponse);
          this.selectedResponse = updatedResponse;
          this.setHasFiles(updatedResponse.id);
          this.$forceUpdate();
        }

        printJS(this.pdfUrl);
      } catch (err) {
        console.error(err);
      }
    },
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    },
    async onTabSelect(value) {
      switch (value) {
        case "files":
          const files = await documentsApi.getMedia();
          this.fileTableData = files;
          this.$refs.docTable.sort("fileName");
          break;
        default:
          break;
      }
    },
    async markSeen(response) {
      if (response.seen) {
        return;
      }

      await documentsApi.markSeen(response.id);

      const index = this.responses.findIndex(r => r.id === response.id);
      if (index > -1) {
        this.responses.splice(index, 1, { ...response, seen: true });
      }
    },
    async markFeedback(status) {
      try {
        await documentsApi.markFeedback(this.selectedResponse.id, status);

        const index = this.responses.findIndex(
          f => f.id === this.selectedResponse.id
        );
        if (index > -1) {
          this.detailTab = "overview";
          const updatedResponse = { ...this.selectedResponse, status: status };
          this.responses.splice(index, 1, updatedResponse);
          this.selectedResponse = updatedResponse;
          this.setHasFiles(updatedResponse.id);
          this.$forceUpdate();
        }

        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          position: "center",
          closeBtn: true,
          timeout: 5000,
          message: `Document marked as ${status}`
        });
      } catch (error) {
        console.error(error);
      }
    },
    async sendFeedback(accepted) {
      try {
        const payload = {
          mediaId: this.selectedResponse.id,
          comments: this.feedbackComments,
          accepted
        };
        await documentsApi.sendFeedback(payload);

        const index = this.responses.findIndex(
          f => f.id === this.selectedResponse.id
        );
        if (index > -1) {
          this.detailTab = "overview";
          const updatedResponse = {
            ...this.selectedResponse,
            status: accepted ? "accepted" : "rejected"
          };
          this.responses.splice(index, 1, updatedResponse);
          this.selectedResponse = updatedResponse;
          this.setHasFiles(updatedResponse.id);
          this.$forceUpdate();
        }

        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          position: "center",
          closeBtn: true,
          timeout: 5000,
          message: `Message Sent`
        });
      } catch (error) {
        console.error(error);
      }
    },
    async onTabChange(val) {
      const typeName =
        this.activeTenant && this.activeTenant.name === "EDWU"
          ? "task sheets"
          : "correction form";
      const recipientName =
        this.activeTenant && this.activeTenant.name === "DEMO"
          ? this.formatFullName(this.selectedResponse.name)
          : this.selectedResponse.name;

      switch (val) {
        case "document":
          await this.getPDF();
          break;
        case "accept":
          this.feedbackComments =
            `Dear ${recipientName},` +
            `\n\nThe ${typeName} you submitted has been accepted & has been forwarded on to payroll for processing. No other action is needed on your part unless there is a problem with the document you submitted. This is not a guarantee of payment because this information still needs to be checked & verified.`;
          break;
        case "reject":
          this.feedbackComments =
            `Dear ${recipientName},` +
            `\n\nThe ${typeName} you submitted has been rejected & will not be processed. The reason for your rejection is listed below:` +
            `\n\n(No Reasons selected)` +
            `\n\nPlease correct the ${typeName} and resubmit.`;
          break;
      }

      this.$forceUpdate();
    },
    async getPDF() {
      if (!this.pdfUrl) {
        const response = await documentsApi.downloadMergedDocument(
          this.selectedResponse.id
        );
        const blob = new Blob([response.file]);
        const objectUrl = URL.createObjectURL(blob);
        this.pdfUrl = objectUrl;
      }
    },
    async downloadMergedDocument() {
      try {
        const response = await documentsApi.downloadMergedDocument(this.selectedResponse.id);
        exportFile(response.fileName, response.file);

        const printedResponse = await documentsApi.markAsPrinted(this.selectedResponse.id);
        const updatedResponse = {
          ...this.selectedResponse,
          printedBy: printedResponse.printedBy,
          printedDateTime: printedResponse.printedDateTime,
        }
        this.selectedResponse = updatedResponse;
      } catch (error) {
        console.error(error.response?.data || "An error occurred");
      }
    },
    async downloadAllMergedDocuments() {
      try {
        const response = await documentsApi.downloadAllMergedDocuments(
          this.printAllDialog
        );
        exportFile(response.fileName, response.file);
        await this.selectResponse(this.selectedResponse.id);
      } catch (error) {
        console.error(error.response?.data || "An error occurred");
      }
    },
    async setHasFiles(messageId) {
      if (this.selectedResponse) {
        try {
          const { hasFiles } = await documentsApi.hasFiles(messageId);
          this.selectedResponse = { ...this.selectedResponse, hasFiles };
        } catch (error) {
          console.error(error);
          this.selectedResponse = { ...this.selectedResponse, hasFiles: false };
        }
      }
    },
    async selectResponse(id) {
      try {
        const response = await documentsApi.getDocument(id);
        this.selectedResponse = this.formatResponse(response);
        this.pdfUrl = null;
        await this.setHasFiles(response.id);
        await this.markSeen(response);
        this.detailTab = 'overview';
        this.rejectedReasons = [];
        this.currentTabIndex = 1;
      } catch (err) {
        console.error('Unable to load document: ', err);
        this.showErrorMessage('Unable to load document');
      }
    },
    async loadResponses(resetResponseList) {
      if (resetResponseList) {
        this.responses = [];
        this.totalResponses = 0;
      }

      try {
        const response = await documentsApi.findMediaResponses(
          this.responseViewState
        );
        const nextBatchResponses =
          response?.items?.map(response => this.formatResponse(response)) || [];

        this.responses = this.responses.concat(nextBatchResponses) || [];
        this.totalResponses = response.itemCount || 0;

        if (this.$refs.virtualScroll) {
          this.$refs.virtualScroll.refresh(-1); // -1 keep scroll position
        }

        if (this.responses.length) {
          if (this.selectedResponse?.id) {
            const foundIndex = this.responses.findIndex(
              f => f.id === this.selectedResponse.id
            );
            if (foundIndex > -1) {
              this.selectedResponse = this.responses[foundIndex];
              this.setHasFiles(this.responses[foundIndex].id);
              return null;
            }
          }

          await this.selectResponse(this.responses[0].id);
        } else {
          this.selectedResponse = null;
        }
      } catch (error) {
        console.error(error);
        this.showErrorMessage(error);
      }
    },
    async onVirtualScroll(details) {
      const { from, to, index, direction } = details;

      if (from < 0 || to < 0) {
        return; // happens on init
      }

      const ordinalIndex = index + 1;
      if (
        direction == "increase" &&
        ordinalIndex >= this.responseViewState.endIndex
      ) {
        const currentPageIndex = Math.floor(
          (ordinalIndex + 1) / this.responseViewState.pageSize
        );
        const startIndex = currentPageIndex * this.responseViewState.pageSize;
        const endIndex =
          (currentPageIndex + 1) * this.responseViewState.pageSize;

        this.responseViewState.startIndex = startIndex;
        this.responseViewState.endIndex = endIndex;
        await this.loadResponses();
      } else if (direction == "decrease") {
        // nothing to do, we have data in memory
      }
    },
    async onSearch(value) {
      if (value === null) {
        return;
      }

      this.responseViewState.searchTerm = "";
      this.responseViewState.startIndex = 0;
      this.responseViewState.endIndex = this.responseViewState.pageSize;

      if (!this.strIsEmptyOrSpaces(value) && value.length <= 2) {
        return;
      }

      this.responseViewState.searchTerm = value;
      await this.loadResponses(true);
    },
    async onSearchClear(value) {
      this.responseViewState.searchTerm = "";
      this.responseViewState.startIndex = 0;
      this.responseViewState.endIndex = this.responseViewState.pageSize;

      await this.loadResponses(true);
    },
    async uploadFile(file) {
      try {
        const form = new FormData();
        form.append("file", file);

        const media = await documentsApi.uploadMedia(form);

        this.showSuccessMessage("File uploaded");
        this.fileTableData.push(media);
        this.fileToUpload = null;
      } catch (error) {
        console.error(error);
      }
    },
    async downloadMediaFile(id) {
      try {
        const response = await documentsApi.downloadMedia(id);
        exportFile(response.fileName, response.file);
      } catch (error) {
        console.error(error);
      }
    },
    async updateMedia() {
      try {
        await documentsApi.updateMedia(this.selectedMedia);

        const index = this.fileTableData.findIndex(
          file => file.id === this.selectedMedia.id
        );
        if (index > -1) {
          this.fileTableData.splice(index, 1, this.selectedMedia);
        }

        this.selectedMedia = null;
      } catch (error) {
        console.error(error);
      }
    },
    async deleteMedia() {
      try {
        await documentsApi.deleteMedia(this.selectedMedia.id);

        const index = this.fileTableData.findIndex(
          file => file.id === this.selectedMedia.id
        );
        if (index > -1) {
          this.fileTableData.splice(index, 1);
        }

        this.selectedMedia = null;
      } catch (error) {
        console.error(error);
      }
    },
    async deleteDocument() {
      try {
        await documentsApi.deleteDocument(this.selectedResponse.id);
        this.showSuccessMessage("Document deleted");

        await this.loadResponses(true);
      } catch (error) {
        console.error(error);
      }
    },
    copyDownloadLink(id) {
      const location = import.meta.env.VITE_AUTH_REPLY_URL + "/dl/" + id;
      copyToClipboard(location);
      this.showSuccessMessage("Link Copied");
    },
    getClassIcon(name) {
      const extension = name.split(".").pop();
      return getClassNameForExtension(extension);
    }
  },
  data() {
    return {
      date,
      navOpen: false,
      tab: "documents",
      detailTab: "overview",
      pdfUrl: null,
      showMediaPinDialog: false,
      showDeleteMediaDialog: false,
      showDeleteDialog: false,
      printAllDialog: {
        open: false,
        showPrinted: false,
        startDate: this.getDtFormattedWithoutTime(new Date()),
        endDate: this.getDtFormattedWithoutTime(new Date())
      },
      rejectedReasons: [],
      feedbackComments: "",
      responses: [],
      responseViewState: {
        searchTerm: "",
        startIndex: 0,
        endIndex: 50,
        showArchived: false,
        pageSize: 50
      },
      selectedMedia: null,
      fileToUpload: null,
      tableSearchTerm: "",
      fileTableData: [],
      fileTableColumns: [
        {
          name: "fileName",
          align: "left",
          label: "File Name",
          field: "fileName",
          sortable: true
        },
        {
          name: "fileSize",
          align: "left",
          label: "File Size",
          field: "fileSize",
          sortable: true
        }
      ],
      selectedResponse: null,
      totalResponses: 0,
      currentTabIndex: 0,
      rejectedOptions: [
        {
          label: "Problem with image",
          comment: "Problem With Image",
          action: "Please take a new photo and submit"
        },
        {
          label: "Multiple correction forms same image",
          comment: "Multiple Correction Forms Same Image",
          action: "Please submit one correction form per image"
        },
        {
          label: "No reason checked",
          comment: "No EVV reason checked",
          action: "Please select a reason and submit"
        },
        {
          label: "Not enough tasks",
          comment: "You have not selected enough tasks",
          action: "Please call the office with tasks you completed"
        },
        {
          label: "No date on timesheet",
          comment: "No date on timesheet",
          action: "Please fill in the date and submit"
        },
        {
          label: "No clock in time",
          comment: "No clock in time",
          action: "Please fill out clock in time and submit"
        },
        {
          label: "No clock out time",
          comment: "No clock out time",
          action: "Please fill out clock out time and submit"
        },
        {
          label: "No signature",
          comment: "Missing a signature",
          action: "Please sign and submit"
        },
        {
          label: "Caregiver name missing",
          comment: "Caregiver name missing",
          action: "Please write in the caregiver name and submit"
        },
        {
          label: "Weekly timesheets",
          comment: "EVV required - No longer accept weekly timesheets",
          action: "Please use a daily correction form and submit"
        },
        {
          label: "Illegible",
          comment: "Unable to read handwriting",
          action: "Please fill out another form and submit"
        }
      ]
    };
  }
};
</script>
