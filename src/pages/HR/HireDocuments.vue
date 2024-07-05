<template>
  <div>
    <div class="row justify-end q-pa-md">
      <q-file
        ref="newFilePickerRef"
        style="visibility: hidden; height: 10px"
        :accept="type === 'photo' ? 'image/*' : '*'"
        label=""
        @update:model-value="uploadFile"
      />
      <q-btn
        icon="cloud_upload"
        color="primary"
        label="Upload"
        no-caps
        :disabled="!isEmployee && files.length >= 5"
        @click="$refs.newFilePickerRef.pickFiles()"
      />
    </div>

    <q-table
      flat
      bordered
      :rows="files"
      :columns="columns"
      separator="none"
      row-key="name"
      :grid="$q.screen.lt.sm"
      :pagination="pagination"
      binary-state-sort
      no-data-label="No Files"
    >
      <template #header="props">
        <q-tr :props="props" class="bg-grey-1">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            style="border-bottom-width: 1px !important"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template #body="props">
        <q-tr
          class="cursor-pointer"
          :props="props"
          @click="downloadFile(props.row)"
        >
          <q-td key="fileName" :props="props">
            <span>{{ props.row.fileName }}</span>
          </q-td>
          <q-td key="createdDateTime" :props="props">
            <span>
              {{ getDtFormattedWithoutTime(props.row.createdDateTime) }}
            </span>
          </q-td>
          <q-td key="createdBy" :props="props">
            <span>{{ props.row.createdBy }}</span>
          </q-td>
          <q-td key="fileSize" :props="props">
            <span v-if="props.row.fileSize">{{ format.humanStorageSize(props.row.fileSize) }}</span>
          </q-td>
          <q-td key="actions" :props="props">
            <div class="row justify-end">
              <q-btn
                icon="delete"
                color="red"
                dense
                @click.stop="fileToDelete = props.row"
              ></q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog :model-value="!!fileToDelete" @update:model-value="fileToDelete = null" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center">
          <q-avatar
            round
            size="lg"
            color="red-8"
            text-color="white"
            icon="delete"
          />

          <div class="q-ml-md">
            <div class="full-width text-h6" style="line-height: 1em">
              Delete
            </div>
          </div>

          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="text-subtitle1">
          Are you sure you want to delete this file?
        </q-card-section>

        <q-card-actions class="bg-grey-2 q-pa-md" align="between">
          <q-btn
            color="grey-8"
            text-color="white"
            no-caps
            label="Cancel"
            style="width: 90px"
            v-close-popup
          />
          <q-btn
            color="red-8"
            text-color="white"
            no-caps
            label="Delete"
            style="width: 90px"
            @click="deleteFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { date, exportFile, format } from "quasar";
import {
  getDocumentDownloadUrl,
  getDocuments,
  deleteDocument,
  uploadDocument,
  createHire
} from "src/api/hire";
import { mainMixin } from "../../mixins/index";

const columns = [
  {
    name: "fileName",
    align: "left",
    label: "File Name",
    field: "fileName",
    sortable: true
  },
  {
    name: "createdDateTime",
    align: "left",
    label: "Uploaded Date",
    field: "createdDateTime",
    sortable: true
  },
  {
    name: "createdBy",
    align: "left",
    label: "Uploaded By",
    field: "createdBy",
    sortable: true
  },
  {
    name: "fileSize",
    align: "left",
    label: "Size",
    field: "fileSize",
    sortable: true
  },
  {
    name: "actions",
    align: "left",
    label: "",
    field: "actions"
  }
];

export default {
  name: "HireDocuments",
  props: ["type", "user", "isEmployee"],
  emits: ['onChange'],
  mixins: [mainMixin],
  emits: ['onChange'],
  async mounted() {
    try {
      if (this.user.id) {
        const response = await getDocuments(this.user.id);
        this.files = response.filter(file => this.type === file.type);
      }
    } catch (error) {
      console.error("Unable to load data: ", error);
    }
  },
  methods: {
    async uploadFile(file) {
      if (!this.user.id) {
        const hireResponse = await createHire({
          ...this.user,
          tenantId: this.$route.query.tid
        });
        this.$emit("onChange", hireResponse);
      }

      this.$nextTick(async () => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("hireId", this.user.id);
        formData.append("fileName", file.name);
        formData.append("type", this.type);
        formData.append("size", file.size);
        formData.append("createdBy", "hire");
        const response = await uploadDocument(formData);
        this.files.push(response);
      });
    },
    async deleteFile() {
      try {
        await deleteDocument(this.fileToDelete.id);
        const index = this.files.findIndex(
          file => file.id === this.fileToDelete.id
        );
        if (index > -1) {
          this.files.splice(index, 1);
        }

        this.fileToDelete = null;
      } catch (error) {
        console.error("Unable to delete file: ", error);
      }
    },
    async downloadFile(file) {
      try {
        const fileUrl = await getDocumentDownloadUrl(file.id);
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        exportFile(file.fileName, blob);
      } catch (error) {
        console.error("Unable to download file: ", error);
      }
    }
  },
  data: () => ({
    format,
    date,
    columns,
    files: [],
    fileToDelete: null,
    pagination: {
      sortBy: "fileName",
      descending: false,
      page: 1,
      rowsPerPage: 10
    }
  })
};
</script>
