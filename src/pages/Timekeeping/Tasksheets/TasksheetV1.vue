<template>
  <div class="full-height">
    <q-card flat>
      <q-card-section class="row items-center q-pb-xs">
        <q-btn
          round
          flat
          dense
          color="grey-3"
          text-color="black"
          icon="arrow_back"
          class="q-mr-sm"
          @click="goBack"></q-btn>

        <h5 class="q-ma-none">
          {{ `${currentEmployee.firstName} ${currentEmployee.lastName}` }} - {{ getDtFormattedWithoutTime(payPeriod) }}
        </h5>
      </q-card-section>

      <q-card-section v-for="timecard in timecards" :key="timecard.id">
        <q-card>
          <q-card-section class="q-pa-md row items-center justify-between" style="background: #f0f0f0">
            <div class="column">
              <h6 class="q-ma-none">{{ getJobLabel(timecard.jobId) }}</h6>
              <div class="text-subtitle2"><strong>{{ !!timecard.taskSummary ? 'Service Plan:' : '' }}</strong> {{ timecard.taskSummary }}</div>
            </div>

            <div class="row items-center justify-end q-gutter-x-md">
              <q-btn
                :disable="timecard.status === 6"
                no-caps
                color="blue"
                text-color="white"
                label="Approve"
                icon="thumb_up"
                @click="submitTimecard(timecard.id)"></q-btn>

              <q-btn
                :disable="timecard.status === 6"
                no-caps
                color="red"
                text-color="white"
                label="Reject"
                icon="thumb_down"
                @click="rejectForm = { open: true, note: null, timecard: {...timecard} }"></q-btn>

              <q-separator vertical></q-separator>

              <q-btn
                no-caps
                color="grey-3"
                text-color="black"
                label="Print"
                icon="print"
                @click="printTasksheet(timecard.jobId)"></q-btn>

              <q-separator vertical v-if="user.orgAdmin || user.tenantOwner"></q-separator>

              <q-btn
                v-if="user.orgAdmin || user.tenantOwner"
                dense
                color="grey-8"
                icon="more_vert">
                <q-menu>
                  <q-list dense style="width: 140px">
                    <q-item
                      clickable
                      v-close-popup
                      dense
                      @click="editingTable = timecard.id">
                      <q-item-section class="row">
                        <h6 style="margin: 0; font-size: 15px; font-weight: 400">
                          <q-icon
                            name="edit"
                            style="margin-top: -2px; margin-right: 10px"
                            size="xs"></q-icon>
                          Edit
                        </h6>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card-section>

          <div class="column items-end text-caption q-ma-lg">
            <span v-if="!!timecard.submittedOn">
              <strong>
                Employee Approved: {{ getDtFormatted(timecard.submittedOn + 'Z') }}
              </strong>
            </span>
            <span v-if="!!timecard.approvedOn">
              <strong>
                Onsite Manager Approved: <strong>{{ timecard.approvedBy }}</strong> - {{ getDtFormatted(timecard.approvedOn + 'Z') }}
              </strong>
            </span>
            <span v-if="!!timecard.finalApprovedOn">
              <strong>
                Area Manager Approved: <strong>{{ timecard.finalApprovedBy }}</strong> - {{ getDtFormatted(timecard.finalApprovedOn + 'Z') }}
              </strong>
            </span>
          </div>

          <q-table
            square
            class="q-ma-sm full-width"
            row-key="id"
            :grid="$q.screen.xs"
            :rows="getTimecardEntryLines(timecard.id)"
            :columns="getTimecardColumns()"
            :pagination="initialPagination"
            no-data-label="No Timecards Available"
            no-results-label="No Timecards Available"
            hide-pagination
            :selected-rows-label="() => `${selectedRows[timecard.id].length / 7} rows selected`"
            :selection="editingTable === timecard.id ? 'multiple' : 'none'"
            :selected="selectedRows[timecard.id]">
            <template v-slot:header-selection="scope">
              <q-btn
                :disable="!selectedRows[timecard.id].length"
                no-caps
                dense
                color="red"
                text-color="white"
                icon="delete"
                @click="deleteEntryLinesDialog = {open: true, timecardId: timecard.id}"></q-btn>
            </template>

            <template v-slot:body-selection="scope">
              <q-checkbox
                :model-value="selectedRows[timecard.id].some(id => id === scope.row.monday.id)"
                @update:model-value="val => onSelection({selected: val, timecardId: timecard.id, row: scope.row})" />
            </template>

            <template #body-cell-status="props">
              <q-td key="status" :props="props">
                <q-badge :class="{ 'bg-red-5': props.value === 5, 'bg-grey-4 text-black': props.value === 2, 'bg-green-5': props.value === 3, 'bg-blue-5': props.value === 4 || props.value === 6 }">
                  {{ statuses[props.value] ? statuses[props.value].label : '' }}
                </q-badge>
                <q-tooltip>{{ statuses[props.value] ? statuses[props.value].tooltip : "" }}</q-tooltip>
              </q-td>
            </template>

            <template #body-cell-taskId="props">
              <q-td :props="props">
                <span class="text-subtitle2"><strong>{{ getTaskLabel(props.value) }}</strong></span>
              </q-td>
            </template>

            <template #body-cell-monday="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-x-xs justify-center">
                  <q-checkbox
                    :disable="isReadonly(props.row)"
                    :true-value="1"
                    :false-value="0"
                    :model-value="props.row.monday.units"
                    @update:model-value="val => saveTimecardCheckbox(timecard.id, props.row.monday, 'units', val)"></q-checkbox>
                  <q-btn
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.monday.notes }"
                    no-caps
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.timecardId = timecard.id; entryForm.entry = {...props.row.monday}"></q-btn>
                  <q-btn
                    v-if="isVoucherNeeded(props.row.taskId)"
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.monday.clientSignatureDateTime }"
                    no-caps
                    icon="payments"
                    @click="voucherForm.open = true; voucherForm.timecardId = timecard.id; voucherForm.entry = {...props.row.monday}"></q-btn>
                  <div v-else style="width: 33px; height: 33px;"></div>
                </div>
              </q-td>
            </template>

            <template #body-cell-tuesday="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-x-xs justify-center">
                  <q-checkbox
                    :disable="isReadonly(props.row)"
                    :true-value="1"
                    :false-value="0"
                    :model-value="props.row.tuesday.units"
                    @update:model-value="val => saveTimecardCheckbox(timecard.id, props.row.tuesday, 'units', val)"></q-checkbox>
                  <q-btn
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.tuesday.notes }"
                    no-caps
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.timecardId = timecard.id; entryForm.entry = {...props.row.tuesday}"></q-btn>
                  <q-btn
                    v-if="isVoucherNeeded(props.row.taskId)"
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.tuesday.clientSignatureDateTime }"
                    no-caps
                    icon="payments"
                    @click="voucherForm.open = true; voucherForm.timecardId = timecard.id; voucherForm.entry = {...props.row.tuesday}"></q-btn>
                  <div v-else style="width: 33px; height: 33px;"></div>
                </div>
              </q-td>
            </template>

            <template #body-cell-wednesday="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-x-xs justify-center">
                  <q-checkbox
                    :disable="isReadonly(props.row)"
                    :true-value="1"
                    :false-value="0"
                    :model-value="props.row.wednesday.units"
                    @update:model-value="val => saveTimecardCheckbox(timecard.id, props.row.wednesday, 'units', val)"></q-checkbox>
                  <q-btn
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.wednesday.notes }"
                    no-caps
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.timecardId = timecard.id; entryForm.entry = {...props.row.wednesday}"></q-btn>
                  <q-btn
                    v-if="isVoucherNeeded(props.row.taskId)"
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.wednesday.clientSignatureDateTime }"
                    no-caps
                    icon="payments"
                    @click="voucherForm.open = true; voucherForm.timecardId = timecard.id; voucherForm.entry = {...props.row.wednesday}"></q-btn>
                  <div v-else style="width: 33px; height: 33px;"></div>
                </div>
              </q-td>
            </template>

            <template #body-cell-thursday="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-x-xs justify-center">
                  <q-checkbox
                    :disable="isReadonly(props.row)"
                    :true-value="1"
                    :false-value="0"
                    :model-value="props.row.thursday.units"
                    @update:model-value="val => saveTimecardCheckbox(timecard.id, props.row.thursday, 'units', val)"></q-checkbox>
                  <q-btn
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.thursday.notes }"
                    no-caps
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.timecardId = timecard.id; entryForm.entry = {...props.row.thursday}"></q-btn>
                  <q-btn
                    v-if="isVoucherNeeded(props.row.taskId)"
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.thursday.clientSignatureDateTime }"
                    no-caps
                    icon="payments"
                    @click="voucherForm.open = true; voucherForm.timecardId = timecard.id; voucherForm.entry = {...props.row.thursday}"></q-btn>
                  <div v-else style="width: 33px; height: 33px;"></div>
                </div>
              </q-td>
            </template>

            <template #body-cell-friday="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-x-xs justify-center">
                  <q-checkbox
                    :disable="isReadonly(props.row)"
                    :true-value="1"
                    :false-value="0"
                    :model-value="props.row.friday.units"
                    @update:model-value="val => saveTimecardCheckbox(timecard.id, props.row.friday, 'units', val)"></q-checkbox>
                  <q-btn
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.friday.notes }"
                    no-caps
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.timecardId = timecard.id; entryForm.entry = {...props.row.friday}"></q-btn>
                  <q-btn
                    v-if="isVoucherNeeded(props.row.taskId)"
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.friday.clientSignatureDateTime }"
                    no-caps
                    icon="payments"
                    @click="voucherForm.open = true; voucherForm.timecardId = timecard.id; voucherForm.entry = {...props.row.friday}"></q-btn>
                  <div v-else style="width: 33px; height: 33px;"></div>
                </div>
              </q-td>
            </template>

            <template #body-cell-saturday="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-x-xs justify-center">
                  <q-checkbox
                    :disable="isReadonly(props.row)"
                    :true-value="1"
                    :false-value="0"
                    :model-value="props.row.saturday.units"
                    @update:model-value="val => saveTimecardCheckbox(timecard.id, props.row.saturday, 'units', val)"></q-checkbox>
                  <q-btn
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.saturday.notes }"
                    no-caps
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.timecardId = timecard.id; entryForm.entry = {...props.row.saturday}"></q-btn>
                  <q-btn
                    v-if="isVoucherNeeded(props.row.taskId)"
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.saturday.clientSignatureDateTime }"
                    no-caps
                    icon="payments"
                    @click="voucherForm.open = true; voucherForm.timecardId = timecard.id; voucherForm.entry = {...props.row.saturday}"></q-btn>
                  <div v-else style="width: 33px; height: 33px;"></div>
                </div>
              </q-td>
            </template>

            <template #body-cell-sunday="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-x-xs justify-center">
                  <q-checkbox
                    :disable="isReadonly(props.row)"
                    :true-value="1"
                    :false-value="0"
                    :model-value="props.row.sunday.units"
                    @update:model-value="val => saveTimecardCheckbox(timecard.id, props.row.sunday, 'units', val)"></q-checkbox>
                  <q-btn
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.sunday.notes }"
                    no-caps
                    icon="edit_note"
                    @click="entryForm.open = true; entryForm.timecardId = timecard.id; entryForm.entry = {...props.row.sunday}"></q-btn>
                  <q-btn
                    v-if="isVoucherNeeded(props.row.taskId)"
                    flat
                    dense
                    class="q-mt-xs"
                    :class="{ 'bg-green-2': !!props.row.sunday.clientSignatureDateTime }"
                    no-caps
                    icon="payments"
                    @click="voucherForm.open = true; voucherForm.timecardId = timecard.id; voucherForm.entry = {...props.row.sunday}"></q-btn>
                  <div v-else style="width: 33px; height: 33px;"></div>
                </div>
              </q-td>
            </template>

            <template v-slot:item="props">
              <div class="row justify-center full-width">
                <q-card
                  style="width: 95%"
                  class="q-ma-sm q-mx-md">
                  <q-card-section>
                    <q-list dense>
                      <q-item v-for="col in props.cols.filter(col => col.name !== 'desc')" :key="col.name">
                        <q-item-section>
                          <div class="row items-center q-gutter-md">
                            <q-item-label>{{ col.label }}</q-item-label>
                            <div v-if="col.label === 'Stat'">
                              <q-badge :class="{ 'bg-red-5': col.value === 5, 'bg-grey-4 text-black': col.value === 2, 'bg-green-5': col.value === 3, 'bg-blue-5': col.value === 4 || col.value === 6 }">
                                {{ statuses[col.value] ? statuses[col.value].label : '' }}
                              </q-badge>
                              <q-tooltip>{{ statuses[col.value] ? statuses[col.value].tooltip : "" }}</q-tooltip>
                            </div>

                            <div v-if="col.label === 'Task'" class="text-black">
                              <strong>{{ getTaskLabel(col.value) }}</strong>
                            </div>
                          </div>
                        </q-item-section>
                        <q-item-section side v-if="col.label !== 'Stat' && col.label !== 'Task'">
                          <div class="row items-center q-gutter-x-md justify-center">
                            <q-checkbox
                              dense
                              class="q-pa-sm"
                              :disable="isReadonly(col.value)"
                              :true-value="1"
                              :false-value="0"
                              :model-value="col.value.units"
                              @update:model-value="val => saveTimecardCheckbox(timecard.id, col.value, 'units', val)"></q-checkbox>
                            <q-btn
                              flat
                              dense
                              :class="{ 'bg-green-2': !!col.value.notes }"
                              text-color="black"
                              no-caps
                              icon="edit_note"
                              @click="entryForm.open = true; entryForm.timecardId = timecard.id; entryForm.entry = {...col.value}"></q-btn>
                            <q-btn
                              v-if="isVoucherNeeded(col.value.taskId)"
                              flat
                              dense
                              :class="{ 'bg-green-2': !!col.value.clientSignatureDateTime }"
                              text-color="black"
                              no-caps
                              icon="payments"
                              @click="voucherForm.open = true; voucherForm.timecardId = timecard.id; voucherForm.entry = {...col.value}"></q-btn>
                          </div>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </template>

            <template #no-data>
              <div></div>
            </template>
          </q-table>

          <q-card-section>
            <h5 class="q-ma-none q-my-sm">
              <strong>Signatures</strong>
            </h5>
            <strong>You are required to document any reason for not following the client's care plan.</strong>
            If you do not perform the tasks or the client's schedule exactly as it is written above, you are required to document your reason why.
            (Example: I did not do laundry on Tuesday because client had none. I left early on Wednesday because client had a friend coming over).
          </q-card-section>

          <q-card-section>
            <div class="row">
              <div class="col-12 col-sm-5 column q-gutter-y-sm">
                <q-checkbox
                  :disable="isReadonly(timecard)"
                  :model-value="timecard.servicesProvided"
                  :true-value="true"
                  :false-value="false"
                  @update:model-value="saveTimecard(timecard, 'servicesProvided', true)"
                  label="Services were Provided According to the care plan (this includes shift times and tasks delivered) - No additional documentation is required"></q-checkbox>
                <q-checkbox
                  :disable="isReadonly(timecard)"
                  :model-value="timecard.servicesProvided"
                  :true-value="false"
                  :false-value="true"
                  @update:model-value="saveTimecard(timecard, 'servicesProvided', false)"
                  label="Services were not provided according to the care plan (documentation providing the reasons for the deviations is required)."></q-checkbox>
              </div>
              <div class="column q-gutter-y-md items-end col-12 col-sm-7">
                <div class="row q-gutter-sm">
                  <q-input
                    :readonly="isReadonly(timecard)"
                    style="min-width: 300px"
                    label="Client Name *"
                    dense
                    filled
                    :model-value="timecard.printedClientSignature"
                    @update:model-value="val => saveTimecard(timecard, 'printedClientSignature', val)"
                    debounce="500"></q-input>
                  <q-btn
                    color="blue-5"
                    no-caps
                    label="Open Signature"
                    @click="signatureForm = { open: true, type: 'Client', timecard, refName: 'clientSignature' }"></q-btn>
                </div>

                <q-img
                  v-if="!!timecard.clientSignature64"
                  :src="timecard.clientSignature64"
                  contain
                  style="border: 1px solid black; width: 100%; max-width: 440px; height: 100px"></q-img>

                <div class="row q-gutter-sm">
                  <q-input
                    :readonly="isReadonly(timecard)"
                    style="min-width: 300px"
                    label="Employee Name *"
                    dense
                    filled
                    @update:model-value="val => saveTimecard(timecard, 'printedEmployeeSignature', val)"
                    :model-value="timecard.printedEmployeeSignature"
                    debounce="500"></q-input>
                  <q-btn
                    color="blue-5"
                    no-caps
                    label="Open Signature"
                    @click="signatureForm = { open: true, type: 'Employee', timecard, refName: 'employeeSignature' }"></q-btn>
                </div>

                <q-img
                  v-if="!!timecard.employeeSignature64"
                  :src="timecard.employeeSignature64"
                  contain
                  style="border: 1px solid black; width: 100%; max-width: 440px; height: 100px"></q-img>

                <div class="row q-gutter-sm">
                  <q-input
                    style="min-width: 300px"
                    label="Supervisor Name *"
                    dense
                    filled
                    @update:model-value="val => saveTimecard(timecard, 'printedHomemakerSupervisorSignature', val)"
                    :model-value="timecard.printedHomemakerSupervisorSignature"
                    debounce="500"></q-input>
                  <q-btn
                    color="blue-5"
                    no-caps
                    label="Open Signature"
                    @click="signatureForm = { open: true, type: 'Homemaker', timecard, refName: 'homemakerSupervisorSignature' }"></q-btn>
                </div>

                <q-img
                  v-if="!!timecard.homemakerSupervisorSignature64"
                  :src="timecard.homemakerSupervisorSignature64"
                  contain
                  style="border: 1px solid black; width: 100%; max-width: 440px; height: 100px"></q-img>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-input
              filled
              label="Notes"
              type="textarea"
              class="full-width"
              :readonly="isReadonly(timecard)"
              @update:model-value="val => saveTimecard(timecard, 'employeeNotes', val)"
              :model-value="timecard.employeeNotes"
              debounce="500"></q-input>
          </q-card-section>

          <q-card-section v-if="timecard.status === 5">
            <div v-html="timecard.rejectionNotes" style="max-height: 250px; overflow: scroll; width: 100%; overflow-x: hidden" class="red-border q-pa-md"></div>
          </q-card-section>
        </q-card>
      </q-card-section>
    </q-card>

    <q-dialog v-model="signatureForm.open" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row justify-between q-pb-none">
          <div class="text-h6">{{signatureForm.type}} Signature</div>
          <q-btn dense round flat icon="close" v-close-popup></q-btn>
        </q-card-section>

        <q-card-section>
          <q-img
            v-if="signatureForm.timecard[signatureForm.refName + '64'] !== null || isReadonly(signatureForm.timecard) && signatureForm.type != 'Homemaker'"
            :src="signatureForm.timecard[signatureForm.refName + '64']"
            contain
            width="100%"
            height="100px"
            style="border: 1px solid black"></q-img>
          <VueSignaturePad
            v-else
            style="border: 1px solid black"
            ref="signatureRef"
            width="100%"
            height="100px"
            :options="{penColor: '#000', onBegin: () => {$refs.signatureRef.resizeCanvas()}}"/>
        </q-card-section>

        <q-card-actions class="row justify-between text-primary q-pt-none q-mx-sm">
          <q-btn
            no-caps
            :disable="isReadonly(signatureForm.timecard) && signatureForm.type != 'Homemaker'"
            v-if="signatureForm.timecard[signatureForm.refName + '64'] !== null"
            label="Clear Signature"
            color="blue-5"
            @click="saveSignature(signatureForm.refName, true)" />
          <q-btn
            no-caps
            :disable="isReadonly(signatureForm.timecard) && signatureForm.type != 'Homemaker'"
            v-if="signatureForm.timecard[signatureForm.refName + '64'] === null"
            label="Clear Signature"
            color="blue-5"
            @click="$refs.signatureRef.clearSignature()" />
          <q-btn
            no-caps
            :disable="
              signatureForm.timecard[signatureForm.refName + '64'] !== null
              || (isReadonly(signatureForm.timecard) && signatureForm.type != 'Homemaker')"
            label="Save"
            color="blue-5"
            @click="saveSignature(signatureForm.refName)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showVoucherDialog" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row justify-start items-center">
          <q-avatar icon="payments" color="green" text-color="white" />
          <span class="q-ml-sm col">Did you handle client's money today and need to record your transaction?</span>
        </q-card-section>

        <q-card-actions class="row justify-between text-primary q-pt-none q-mx-sm">
          <q-btn
            flat
            no-caps
            label="No"
            color="blue-5"
            v-close-popup />
          <q-btn
            flat
            no-caps
            label="Yes"
            color="blue-5"
            @click="voucherForm.open = true;"
            v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="voucherForm.open" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Shopping Voucher</div>
        </q-card-section>

        <q-card-section>
          <q-form ref="voucherForm" class="q-gutter-md" greedy>
            <q-input
              filled
              hide-bottom-space
              type="number"
              v-model="voucherForm.entry.amountReceivedFromClient"
              label="Amount Received From Client *"
              :readonly="isReadonly(voucherForm.entry)"
              :rules="[val => val != null && val.toString().trim() !== '' || 'Amount received is required']"></q-input>

            <q-input
              filled
              hide-bottom-space
              type="number"
              v-model="voucherForm.entry.amountSpent"
              label="Amount Spent *"
              :readonly="isReadonly(voucherForm.entry)"
              :rules="[val => val != null && val.toString().trim() !== '' || 'Amount spent is required']"></q-input>

            <q-input
              filled
              hide-bottom-space
              type="number"
              v-model="voucherForm.entry.amountReturnedToClient"
              label="Amount Returned to Client *"
              :readonly="isReadonly(voucherForm.entry)"
              :rules="[val => val != null && val.toString().trim() !== '' || 'Amount returned is required']"></q-input>

            <q-input
              filled
              hide-bottom-space
              v-model="voucherForm.entry.printedClientSignature"
              label="Client Name *"
              :readonly="isReadonly(voucherForm.entry)"
              :rules="[val => val && val.trim() !== '' || 'Client name is required']"></q-input>

            <div>
              <h6 class="q-ma-none">Client Signature *</h6>
              <q-img
                contain
                v-if="voucherForm.entry.clientSignature64 !== null || isReadonly(voucherForm.entry)"
                :src="voucherForm.entry.clientSignature64"
                width="100%"
                height="100px"
                style="border: 1px solid black"></q-img>
              <q-btn
                v-if="voucherForm.entry.clientSignature64 !== null && !isReadonly(voucherForm.entry)"
                dense
                no-caps
                flat
                label="Clear Signature"
                color="blue-6"
                @click="voucherForm.entry.clientSignature64 = null"></q-btn>
              <VueSignaturePad
                v-if="voucherForm.entry.clientSignature64 === null && !isReadonly(voucherForm.entry)"
                style="border: 1px solid black"
                ref="entryClientSignature"
                width="100%"
                height="100px"
                :options="{penColor: '#000', onBegin: () => {$refs.entryClientSignature.resizeCanvas()}}"/>
              <q-btn
                v-if="voucherForm.entry.clientSignature64 === null && !isReadonly(voucherForm.entry)"
                dense
                no-caps
                flat
                label="Clear Signature"
                color="blue-6"
                @click="$refs.entryClientSignature.clearSignature()"></q-btn>
              <span class="text-red q-ml-md" v-if="voucherForm.signatureError">Signature is required *</span>

            </div>
          </q-form>
        </q-card-section>

        <q-card-section class="row justify-between">
          <q-btn
            v-if="!isReadonly(voucherForm.entry)"
            color="red-6"
            text-color="white"
            no-caps
            label="Cancel"
            v-close-popup />
          <q-btn
            v-if="!isReadonly(voucherForm.entry)"
            color="blue-5"
            text-color="white"
            no-caps
            label="Save"
            @click="saveTimecardEntryVoucher()" />

          <div v-if="isReadonly(voucherForm.entry)"></div>

          <q-btn
            v-if="isReadonly(voucherForm.entry)"
            color="blue-5"
            text-color="white"
            no-caps
            label="Close"
            v-close-popup />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="entryForm.open" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Notes</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            :readonly="isReadonly(entryForm.entry)"
            filled
            type="textarea"
            v-model="entryForm.entry.notes"
            label="Add notes for this day"></q-input>
        </q-card-section>

        <q-card-section class="row justify-between">
          <q-btn
            v-if="!isReadonly(entryForm.entry)"
            color="red-6"
            text-color="white"
            no-caps
            label="Cancel"
            v-close-popup />
          <q-btn
            v-if="!isReadonly(entryForm.entry)"
            color="blue-5"
            text-color="white"
            no-caps
            label="Save"
            @click="saveTimecardEntryNotes()" />

          <div v-if="isReadonly(entryForm.entry)"></div>

          <q-btn
            v-if="isReadonly(entryForm.entry)"
            color="blue-5"
            text-color="white"
            no-caps
            label="Close"
            v-close-popup />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="rejectForm.open" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Notes</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            filled
            style="margin-bottom: 15px;"
            type="textarea"
            v-model="rejectForm.note"></q-input>

          <div v-html="rejectForm.timecard.rejectionNotes" style="max-height: 250px; overflow: scroll; width: 100%; overflow-x: hidden"></div>
        </q-card-section>

        <q-card-section class="row justify-between">
          <q-btn
            color="red-5"
            text-color="white"
            no-caps
            label="Cancel"
            v-close-popup />
          <q-btn
            color="blue-5"
            text-color="white"
            no-caps
            label="Send Feedback"
            @click="rejectTimecard()" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteEntryLinesDialog.open" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center">
          <div class="text-h6" style="line-height: 1em;">
            Delete Tasks
          </div>

          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="text-subtitle1">
          Are you sure you want to delete these tasks?
        </q-card-section>

        <q-card-actions class="bg-grey-2 q-pa-md" align="between">
          <q-btn
            color="grey-8"
            text-color="white"
            no-caps
            label="No"
            style="width: 90px"
            v-close-popup />
          <q-btn
            color="red-8"
            text-color="white"
            no-caps
            label="Delete"
            style="width: 90px"
            @click="deleteTimecardEntries(deleteEntryLinesDialog.timecardId)"
            v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
  import { date, exportFile, extend } from 'quasar';
  import { mapState } from "pinia";
  import { useTenantStore } from "src/stores/tenantStore";
  import moment from "moment";
  import tasksheetApi from "../../../api/tasksheet";
  import reportApi from "../../../api/report";
  import { mainMixin } from "../../../mixins/index";

  export default {
    name: "TasksheetV1",

    mixins: [mainMixin],
    emits: ['go-back', 'save-entry', 'save-timecard'],

    props: {
      name: String,
      payPeriod: String,
      timecards: Array,
      jobs: Array,
      tasks: Array,
      currentEmployee: Object,
    },

    async mounted() {
      await this.getTimecardStatuses();
    },

    watch: {
      timecards: {
        deep: true,
        immediate: true,
        handler(timecards) {
          if (!timecards || !timecards.length) { return; }

          timecards.forEach(timecard => this.selectedRows[timecard.id] = []);
        }
      }
    },

    computed: {
      ...mapState(useTenantStore, ["activeTenant", "user"]),
    },

    methods: {
      isReadonly(item) {
        return item.status === 3 || item.status === 6;
      },
      isVoucherNeeded(taskId) {
        const foundTask = this.tasks.find(task => task.id === taskId);
        return foundTask?.needsVoucher ?? false;
      },
      getJobLabel(jobId) {
        const foundJob = this.jobs.find(job => job.id === jobId);
        return foundJob?.name || "";
      },
      getTaskLabel(taskId) {
        const foundTask = this.tasks.find(task => task.id === taskId);
        return !!foundTask
          ? `${foundTask.name} | ${foundTask.frequency}`
          : "";
      },
      getTimecardColumns() {
        const timecardColumns = [
          {
            name: "status",
            align: "left",
            label: "Stat",
            field: "status",
            sortable: true,
          },
          {
            name: "taskId",
            align: "left",
            label: "Task",
            field: "taskId",
            sortable: true,
          },
        ];

        const dowColumns = [];

        let payPeriod = this.payPeriod;
        for (let i = 0; i <= 6; i++) {
          const momentDate = moment(payPeriod)
          const dow = momentDate.format("dddd");
          dowColumns.unshift({
            name: dow.toLowerCase(),
            align: "center",
            label: `${dow.substring(0, 3)}: ${momentDate.format("MM/DD")}`,
            field: dow.toLowerCase(),
            sortable: false
          });

          payPeriod = momentDate.subtract(1, "day").format("MM/DD/YYYY");
        }

        timecardColumns.push(...dowColumns);

        return timecardColumns;
      },
      getTimecardEntryLines(id) {
        const { entries: timecardEntries } = this.timecards.find(timecard => timecard.id === id);
        const entryLines = [];
        const lineNumbers = new Set(timecardEntries.map(entry => entry.lineNo));
        for (const lineNumber of Array.from(lineNumbers)) {
          const entries = timecardEntries.filter(entry => entry.lineNo === lineNumber);

          const payload = {
            lineNo: lineNumber,
            status: entries[0].status,
            jobId: entries[0].jobId,
            taskId: entries[0].taskId,
          };

          for (const entry of entries) {
            const dow = moment(entry.dateWorked).format("dddd").toLowerCase();
            payload[dow] = entry;
          }

          entryLines.push(payload);
        }

        return entryLines;
      },
      goBack() {
        this.$emit("go-back");
      },
      getRejectedNotes(timecardNotes, newNote) {
        const note = `<span style="margin: 0; font-size: 15px"><strong>${this.user.userName} @ ${date.formatDate(new Date(), "hh:mm a MM-DD-YYYY")} <br /> ${timecardNotes ? "Latest Note: " : "First Note: "}</strong></span>`
          + newNote.replaceAll("\n", "<br />")
          + "<br /> <br />"
          + (timecardNotes ? timecardNotes.replace("Latest Note", "Note") : "");

        return note;
      },
      onSelection({selected, timecardId, row}) {
        if (!this.selectedRows[timecardId]) { return; }

        const daysOfWeek = [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        ];

        const ids = daysOfWeek.map(key => row[key].id);
        if (selected) {
          this.selectedRows = {...this.selectedRows, [timecardId]: [...this.selectedRows[timecardId], ...ids]};
        } else {
          ids.forEach(entryId => {
            const index = this.selectedRows[timecardId].findIndex(id => id === entryId);
            if (index > -1) {
              this.selectedRows[timecardId].splice(index, 1)
            }
          });
        }
      },
      async getTimecardStatuses() {
        try {
          const response = await tasksheetApi.getTimecardStatuses();
          this.statuses = response;
        } catch (error) {
          console.error(error);
        }
      },
      async submitTimecard(timecardId) {
        const timecard = this.timecards.find(t => t.id === timecardId);
        const timecardPayload = {
          ...timecard,
          status: 6, /* Area Manager Approved */
          finalApprovedBy: `${this.currentEmployee.firstName} ${this.currentEmployee.lastName}`,
          finalApprovedOn: new Date().toUTCString(),
          entries: [],
        };

        if ((!timecardPayload.clientSignature && !timecardPayload.clientSignature64) ||
            !timecardPayload.printedClientSignature ||
            (!timecardPayload.employeeSignature && !timecardPayload.employeeSignature64) ||
            !timecardPayload.printedEmployeeSignature) {
              this.showErrorMessage("All signatures are required");
              return;
            }

        const promises = [];
        const lineNumbers = new Set(timecard.entries.map(e => e.lineNo));
        for (const lineNo of Array.from(lineNumbers)) {
          const entries = timecard.entries.filter(e => e.lineNo === lineNo);
          const entriesPayload = [...entries.map(e => ({...e, status: 6 /* Area Manager Approved */}))];

          timecardPayload.entries.push(...entriesPayload);

          promises.push(tasksheetApi.saveTimecardEntries(entriesPayload));
        }

        await tasksheetApi.saveTimecard(timecardPayload);
        await Promise.all(promises);

        await tasksheetApi.sendAcceptedFeedback(timecardPayload);

        this.$emit("save-timecard", timecardPayload);
      },
      async rejectTimecard() {
        try {
          const timecard = this.timecards.find(t => t.id === this.rejectForm.timecard.id);
          const timecardPayload = {
            ...timecard,
            status: 5, /* Rejected */
            rejectionNotes: this.getRejectedNotes(this.rejectForm.timecard.rejectionNotes, this.rejectForm.note),
            entries: [],
          };

          await tasksheetApi.saveTimecard(timecardPayload);

          const promises = [];
          const lineNumbers = new Set(timecard.entries.map(e => e.lineNo));
          for (const lineNo of Array.from(lineNumbers)) {
            const entries = timecard.entries.filter(e => e.lineNo === lineNo);
            const entriesPayload = [...entries.map(e => ({...e, status: 5 /* Rejected */}))];

            timecardPayload.entries.push(...entriesPayload);

            promises.push(tasksheetApi.saveTimecardEntries(entriesPayload));
          }

          await Promise.all(promises);

          await tasksheetApi.sendRejectFeedback({timecard: timecardPayload, message: this.rejectForm.note});

          this.$emit("save-timecard", timecardPayload);
          this.rejectForm.open = false;
        } catch (error) {
          console.error(error);
        }
      },
      async saveSignature(fieldName, reset = false) {
        try {
          const { timecard } = this.signatureForm;
          const payload = { ...timecard };

          if (!reset) {
            const signature = this.$refs.signatureRef.saveSignature();
            let signatureData = null;

            if (!signature.isEmpty) {
              signatureData = signature.data;
              payload[fieldName + "DateTime"] = new Date().toUTCString();
            } else if (this.signatureForm.timecard[fieldName + "64"] !== null) {
              signatureData = this.signatureForm.timecard[fieldName + "64"];
            }

            payload[fieldName + "64"] = signatureData;
          } else {
            payload[fieldName] = null;
            payload[fieldName + "64"] = null;
            payload[fieldName + "DateTime"] = null;
          }

          await tasksheetApi.saveTimecard(payload);

          this.$emit("save-timecard", payload);
          this.signatureForm.open = false;
        } catch (error) {
          console.error(error);
        }
      },
      async saveTimecard(timecard, fieldName, fieldValue) {
        try {
          const payload = { ...timecard, [fieldName]: fieldValue };
          await tasksheetApi.saveTimecard(payload);
          this.$emit("save-timecard", payload);
        } catch (error) {
          console.error(error);
        }
      },
      async saveTimecardCheckbox(timecardId, entry, fieldName, fieldValue) {
        try {
          await this.saveTimecardEntry(timecardId, entry, fieldName, fieldValue);
        } catch (error) {
          console.error(error);
        }
      },
      async saveTimecardEntry(timecardId, entry, fieldName, fieldValue) {
        try {
          const { entries } = this.timecards.find(t => t.id === timecardId);
          const foundEntry = entries.find(e => e.id === entry.id);

          const payload = {...foundEntry, [fieldName]: fieldValue};
          await tasksheetApi.saveTimecardEntries([payload]);

          this.$emit("save-entry", {entry: payload, timecardId});
        } catch (error) {
          console.error(error);
        }
      },
      async saveTimecardEntryNotes() {
        const { timecardId, entry } = this.entryForm;
        const payload = { ...entry, notes: this.entryForm.entry.notes };

        await tasksheetApi.saveTimecardEntries([payload]);

        this.$emit("save-entry", { entry: payload, timecardId });
        this.entryForm.open = false;
      },
      async saveTimecardEntryVoucher() {
        this.voucherForm.signatureError = false;
        await this.$refs.voucherForm.resetValidation();

        let valid = await this.$refs.voucherForm.validate();
        let signatureData = this.voucherForm.entry.clientSignature64;

        if (this.$refs.entryClientSignature) {
          const signature = this.$refs.entryClientSignature.saveSignature();

          if (!signature.isEmpty) {
            signatureData = signature.data;
            this.$refs.entryClientSignature.clearSignature();
          }
        }

        if (!signatureData) {
          this.voucherForm.signatureError = true;
          valid = false;
        }

        if (!valid) {
          return;
        }

        const { timecardId, entry } = this.voucherForm;
        const payload = {
          ...entry,
          amountReceivedFromClient: this.voucherForm.entry.amountReceivedFromClient,
          amountReturnedToClient: this.voucherForm.entry.amountReturnedToClient,
          amountSpent: this.voucherForm.entry.amountSpent,
          printedClientSignature: this.voucherForm.entry.printedClientSignature,
          clientSignature64: signatureData,
          clientSignatureDateTime: signatureData ? new Date().toUTCString() : null,
        };

        await tasksheetApi.saveTimecardEntries([payload]);

        this.$emit("save-entry", { entry: payload, timecardId });
        this.voucherForm.open = false;
      },
      async deleteTimecardEntries(timecardId) {
        try {
          const response = await tasksheetApi.deleteTasksheetEntries(this.selectedRows[timecardId]);
          const timecard = extend(true, {}, this.timecards.find(t => t.id === timecardId));

          this.$emit("save-timecard", {...timecard, entries: timecard.entries.filter(entry => !response.includes(entry.id))});
          this.editingTable = null;
        } catch (e) {
          console.error(e);
        }
      },
      async printTasksheet(jobId) {
        try {
          this.loading = true;

          const payload = {
            employeeIds: [this.currentEmployee.id],
            jobIds: [jobId],
            payPeriod: this.payPeriod,
          }

          const { fileName, file } = await reportApi.tasksheetReport(payload);
          exportFile(fileName, file);
        } catch (error) {
          console.error(error.response?.data ?? "Unable to generate report");
        } finally {
          this.loading = false;
        }
      },
    },

    data: () => {
      return {
        date,
        statuses: [],
        selectedRows: {},
        signatureRefName: null,
        showVoucherDialog: false,
        editingTable: null,
        voucherForm: {
          open: false,
          entry: {},
          timecardId: 0,
          signatureError: false,
        },
        signatureForm: {
          open: false,
          timecard: {},
          refName: null,
        },
        entryForm: {
          open: false,
          entry: {},
          error: false,
          timecardId: 0,
        },
        rejectForm: {
          open: false,
          timecard: {},
          note: null,
        },
        initialPagination: {
          sortBy: "firstName",
          descending: false,
          rowsPerPage: 25,
        },
        deleteEntryLinesDialog: {
          open: false,
          timecardId: null,
        }
      };
    },
  }
</script>

<style lang="scss" scoped>
  .red-border {
    border: solid 6px $red-2;
  }
</style>
