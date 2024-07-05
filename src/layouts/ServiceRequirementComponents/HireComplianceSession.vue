<template>
  <div>
    <div v-if="submitted">
      <strong>Submitted:</strong>
      {{ submittedDateTime }}
      <br>
    </div>
    <div v-else>
      <div><strong>Instructions</strong></div>
      <div>
        Please download the employee handbook and then complete the following
        forms.
      </div>
      <div class="q-pt-md"><strong>Handbook</strong></div>
      <q-list>
        <q-expansion-item
          label="Download Handbook"
          v-model="handbookExpanded"
          :header-class="handbookDownloaded ? 'bg-green-6' : 'bg-grey-4'"
          ref="handbook"
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
      <div class="q-pt-md"><strong>Orientation</strong></div>
      <q-list>
        <q-expansion-item
          group="orientation"
          label="Hepatitis B Vaccine"
          :header-class="vaccinationForm.complete ? 'bg-green-6' : 'bg-grey-4'"
          ref="orientation"
        >
          <q-form
            @submit.prevent="() => {
              vaccinationForm.complete = true;
              $refs.orientation.hide();
              $refs.consentForPublication.show();
            }"
            class="q-pa-md"
          >
            <div>
              <p class="text-body2 q-mb-sm">
                I have received the Hepatitis B Vaccine
              </p>
              <q-option-group
                :disable="vaccinationForm.complete"
                v-model="vaccinationForm.hasReceivedHepatitisBVaccine"
                @update:model-value="() => {
                  vaccinationForm.requestVaccination = null;
                  vaccinationForm.requestVaccinationAcknowledgement = null;
                  vaccinationForm.hepatitisBVaccineDate = null;
                  vaccinationForm.hepatitisBVaccineDate = null;
                  vaccinationForm.hepatitisBVaccineLocation = null;
                }"
                inline
                :options="yesNoOptions"
                color="primary" />

              <div
                v-if="vaccinationForm.hasReceivedHepatitisBVaccine === 'yes'"
                class="q-py-lg row q-col-gutter-sm"
              >
                <div class="col-12 col-md-3">
                  <p class="text-body2 q-mb-sm">
                    I received the Hepatitis B Vaccine on:
                  </p>
                </div>
                <div class="col-6 col-md-3">
                  <q-input
                    dense
                    filled
                    readonly
                    v-model="vaccinationForm.hepatitisBVaccineDate"
                    mask="date"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy
                          ref="qDateProxy"
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-date
                            v-model="vaccinationForm.hepatitisBVaccineDate"
                          >
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col-6 col-md-3">
                  <q-input
                    :disable="vaccinationForm.complete"
                    :debounce="500"
                    hint="Ex: Hospital, Vaccination center,..."
                    label="Where"
                    dense
                    filled
                    v-model="vaccinationForm.hepatitisBVaccineLocation"
                  />
                </div>
              </div>

              <div v-if="vaccinationForm.hasReceivedHepatitisBVaccine === 'no'" class="col-12">
                <p class="text-body2 q-mb-sm">
                  I am requesting to receive the vaccine
                </p>

                <q-option-group
                  :disable="vaccinationForm.complete"
                  v-model="vaccinationForm.requestVaccination"
                  inline
                  :options="yesNoOptions"
                  color="primary"
                />
              </div>
            </div>

            <div v-if="vaccinationForm.requestVaccination === 'no'" class="col-12">
            <strong>Acknowledgement</strong> <br />
              <p class="text-body2 q-mb-sm">
                I understand that due to my occupational exposure to blood or
                other potentially infectious materials I may be at risk of
                acquiring Hepatitis B Virus (HBV) Infection. I have been given the
                opportunity to be vaccinated with Hepatitis B Vaccine (at no charge
                to myself). However, I decline Hepatitis B Vaccination at this time.
              </p>

              <p class="text-body2 q-mb-sm">
                I understand that by declining this vaccine I continue to be at
                risk of acquiring Hepatitis B, a serious disease. If in the future I
                continue to have occupational exposure to blood or other potentially
                infectious materials and I want to be vaccinated with Hepatitis B Vaccine,
                I can receive the vaccination series at no charge to me.
              </p>

              <q-option-group
                :disable="vaccinationForm.complete"
                v-model="vaccinationForm.requestVaccinationAcknowledgement"
                inline
                :options="yesNoOptions"
                color="primary"
              />
            </div>

            <q-btn
              :disabled="
                vaccinationForm.complete ||
                !vaccinationForm.hasReceivedHepatitisBVaccine ||
                (vaccinationForm.hasReceivedHepatitisBVaccine === 'no' && !vaccinationForm.requestVaccination) ||
                (vaccinationForm.requestVaccination === 'no' && !vaccinationForm.requestVaccinationAcknowledgement)"
              label="Complete"
              color="primary"
              class="q-mt-md"
              unelevated
              type="submit"
            />
          </q-form>
        </q-expansion-item>
        <q-expansion-item
          group="orientation"
          label="Consent for Publication"
          :header-class="consentForm.complete ? 'bg-green-6' : 'bg-grey-4'"
          ref="consentForPublication"
        >
          <q-form
            @submit.prevent="() => {
              consentForm.complete = true
              $refs.consentForPublication.hide();
              $refs.preferredShiftHours.show();
            }"
            class="q-pa-md"
          >
            <p>
              Take Care’s mission is to support our caregivers and staff with
              the tools, training, and support so they can in turn provide our
              clients with the best in care. Part of our success is perceived by
              the community as a whole, and when accomplishments such as being
              hired into Take Care’s team, receiving a promotion, or being
              presented with award recognition, Take Care publicizes the great
              news. Please consider signing the consent release so we may submit
              your name and picture to local media for recognition. Your
              addition to the Take Care team is a direct reflection of Take
              Care’s success.
            </p>
            <p>
              With my signature below, I have agreed to the following terms:
            </p>
            <ul>
              <li>
                I grant permission to Take Care Home Health Care, Inc. and Take
                Care Advisor, LLC, to publish my name and certain information
                about me that I provide to Take Care in any manner or media such
                as Take Care-sponsored websites, publications, promotions,
                broadcasts, advertisements, announcements and posters. Signing
                this document grants Take Care the right to post and publish
                without notifying you in advance. Some examples of the
                information, not all inclusive, that will be published are: new
                hire date (a welcome message and biographical information),
                Caregiver of the Month (congratulatory message), recognition or
                expression of gratitude message (including the date of hire).
              </li>
              <li>
                In addition, I grant Take Care the right to photograph and use
                visual images of me. Visual images include any type of
                recording, including photographs, digital images, drawings, or
                renderings. I release Take Care and its employees and agents,
                including any firm authorized to publish and/or distribute a
                finished product containing the text and images, from any
                claims, damages, or liability which you may incur in connection
                with the taking of and usage of the printed material and/or
                images.
              </li>
            </ul>
            <p>
              I understand and freely accept the terms listed above. I
              understand that this agreement stands for the duration of my
              employment with Take Care. At any time, I may revoke this
              agreement by submitting in writing to the Human Resources Manager
              my request. This agreement stands until the date that such written
              document is presented.
            </p>

            <p>
              <strong>Internal Communications</strong> – Unless HR is notified
              in writing, employee information (name, home office, title, and
              years of service, etc) will be used for internal communications
              without consent.
            </p>

            <strong>CONSENT TO PUBLISH</strong> <br />
            I consent to unlimited use of my work-related information and image
            to be used for media and Take Care materials.
            <q-option-group
              :disable="consentForm.complete"
              v-model="consentForm.acknowledgement"
              inline
              :options="[
                {
                  label: 'Yes, I consent',
                  value: 'yes'
                },
                {
                  label: 'No, I do not consent',
                  value: 'no'
                }
              ]"
              color="primary"
            />
            <q-btn
              :disabled="consentForm.complete || !consentForm.acknowledgement"
              label="Complete"
              color="primary"
              class="q-mt-md"
              unelevated
              type="submit"
            />
          </q-form>
        </q-expansion-item>

        <q-expansion-item
          group="orientation"
          label="Availability"
          :header-class="availabilityForm.complete ? 'bg-green-6' : 'bg-grey-4'"
          ref="preferredShiftHours"
        >
          <q-form @submit.prevent="completeAvailability">
            <div class="q-pl-md q-mt-md">
              <strong>Preferred Shift Hour(s)</strong> <br />

              <q-checkbox
                v-model="availabilityForm.shifts"
                :disable="availabilityForm.complete"
                val="7am - 3pm"
                label="1st Shift (7am-3pm)"
              />
              <q-checkbox
                v-model="availabilityForm.shifts"
                :disable="availabilityForm.complete"
                val="3pm - 11pm"
                label="2nd Shift (3pm-11pm)"
              />
              <q-checkbox
                v-model="availabilityForm.shifts"
                :disable="availabilityForm.complete"
                val="11pm - 7am"
                label="3rd Shift (11pm-7am)"
              />
            </div>
            <div class="q-pl-md q-mt-md">
              <strong>Preferred Location(s)</strong> <br />
              <div class="q-gutter-sm">
                <q-checkbox
                  v-model="availabilityForm.locations"
                  :disable="availabilityForm.complete"
                  val="Sarasota"
                  label="Sarasota"
                />
                <q-checkbox
                  v-model="availabilityForm.locations"
                  :disable="availabilityForm.complete"
                  val="Bradenton"
                  label="Bradenton"
                />
                <q-checkbox
                  v-model="availabilityForm.locations"
                  :disable="availabilityForm.complete"
                  val="Venice"
                  label="Venice"
                />
                <q-checkbox
                  v-model="availabilityForm.locations"
                  :disable="availabilityForm.complete"
                  val="Charlotte"
                  label="Charlotte"
                />
              </div>
            </div>
            <div class="q-pl-md q-mt-md">
              <strong>Is the below calendar your availability ongoing?</strong>
              <br />
              <q-option-group
                :disable="availabilityForm.complete"
                v-model="availabilityForm.isAvailabilityOngoing"
                inline
                :options="yesNoOptions"
                color="primary"
              />
            </div>
            <div
              class="q-pl-md q-mt-md"
              v-if="availabilityForm.isAvailabilityOngoing == 'no'"
            >
              <strong>Will your availability change frequently?</strong> <br />

              <q-option-group
                :disable="availabilityForm.complete"
                v-model="availabilityForm.changeFrequency"
                inline
                :options="[
                  {
                    label: 'Weekly, I will call Scheduling.',
                    value: 'weekly'
                  },
                  {
                    label: 'Monthly, I will call Scheduling.',
                    value: 'monthly'
                  }
                ]"
                color="primary"
              />
            </div>
            <AvailabilityCalendar
              ref="availabilityCalendar"
              :disable="availabilityForm.complete"
              :start-week-date="availabilityForm.startWeekDate"
              :days="availabilityForm.days"
              :shifts="availabilityForm.shifts"
              @set-week="value => availabilityForm.startWeekDate = value"
              @update="value => availabilityForm.days = value"
            />
            <q-btn
              :disabled="
                availabilityForm.complete ||
                !availabilityForm.locations.length ||
                !Object.values(availabilityForm.days).flat().length
              "
              label="Complete"
              color="primary"
              class="q-my-md"
              unelevated
              type="submit"
            />
          </q-form>
        </q-expansion-item>

        <q-expansion-item
          group="orientation"
          label="Acknowledgement of Receipt of Orientation of Safety Manual"
          :header-class="
            safetyManualReceiptForm.complete ? 'bg-green-6' : 'bg-grey-4'
          "
          ref="safetyManual"
        >
          <q-form
            @submit.prevent="() => {
              safetyManualReceiptForm.complete = true;
              $refs.safetyManual.hide();
              $refs.orientationAcknowledgement.show();
            }"
            class="q-pa-md"
          >
            <ol>
              <li>
                <p>
                  I have received a copy of the Take Care Safety Manual during
                  my Safety Orientation. The contents of the manual have been
                  explained to me. I have read and understand the policies and
                  procedures described in the Safety Manual, including the
                  language contained in the Conclusion section
                </p>
              </li>
              <li>
                <p>
                  I recognize that Take Care reserves the right, from time to
                  time, to interpret, change, modify or suspend any of the
                  rules, policies or procedures contained or described in this
                  safety manual. I understand that safety procedures and
                  instructions are put in place for my safety and for the safety
                  of all Take Care employees. I agree that I have had the
                  opportunity to ask questions and discuss the procedures I am
                  responsible for following
                </p>
              </li>
              <li>
                <p>
                  I will report any work-related accident or injury immediately
                  to my Supervisor or to the after-hours Supervisor at (941)
                  927-2292 in Sarasota, (941) 484-8844 in Venice, (941) 752-7500
                  in Manatee or (941) 625-0404 in Port Charlotte. I will also
                  advise my immediate Supervisor or the after-hours Supervisor
                  of any hazardous or unsafe conditions that I personally
                  observe
                </p>
              </li>
              <li>
                <p>
                  I have received a written copy of the Take Care Biomedical
                  Waste Plan and have read and understand its contents. I agree
                  to comply with all policies and procedures described in this
                  plan
                </p>
              </li>
              <li>
                <p>
                  I understand that Take Care is a Drug-Free Workplace and I
                  have received a written copy of the Take Care Drug Free
                  Workplace Program. I understand that consent to all applicable
                  tests at any time requested by Take Care is required and is a
                  condition of my employment
                </p>
              </li>
              <li>
                <p>
                  I have read and understand the Take Care Comprehensive
                  Emergency Management Plan and I understand that in the event
                  of an Emergency as described by the Plan, the Emergency
                  Coordinator or Safety Liaison or their Alternate will direct
                  all employee movement
                </p>
              </li>
              <li>
                <p>
                  I agree that I am responsible for the thorough knowledge of
                  blood borne pathogens, exposure to Tuberculosis and the
                  precautions I must take to prevent infection as well as the
                  process to report an exposure
                </p>
              </li>
              <li>
                <p>
                  I agree that if an injury is caused by my willful refusal to
                  use safety equipment or obey safety rules, training, and/or
                  instruction, my action will be considered misconduct and
                  subject to disciplinary action, up to and including
                  termination. In addition, my Workman’s Compensation benefits
                  may be reduced by 25 percent
                </p>
              </li>
            </ol>

            <div>
              <strong>Acknowledgement:</strong>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="safetyManualReceiptForm.acknowledgement"
                  val="yes"
                  label="Yes"
                />
                <q-radio
                  v-model="safetyManualReceiptForm.acknowledgement"
                  val="no"
                  label="No"
                />
              </div>
            </div>
            <q-btn
              :disabled="
                safetyManualReceiptForm.complete ||
                  safetyManualReceiptForm.acknowledgement !== 'yes'
              "
              label="Complete"
              color="primary"
              class="q-mt-md"
              unelevated
              type="submit"
            />
          </q-form>
        </q-expansion-item>

        <q-expansion-item
          group="orientation"
          label="EMPLOYEE’S ACKNOWLEDGEMENT OF ORIENTATION AND RECEIPT OF EMPLOYEE HANDBOOK"
          :header-class="
            employeeHandbookReceiptForm.complete ? 'bg-green-6' : 'bg-grey-4'
          "
          ref="orientationAcknowledgement"
        >
          <q-form
            @submit.prevent="() => {
              employeeHandbookReceiptForm.complete = true;
              $refs.orientationAcknowledgement.hide();
            }"
            class="q-pa-md"
          >
            <ol>
              <li>
                <p>
                  I understand that I have <strong>no</strong> expectation of
                  privacy while engaging in work for Take Care or while on the
                  premises of Take Care. I understand that the selection of
                  personnel to staff any individual case is at the discretion of
                  the President and/or CEO/Owner or her designee. I have
                  received, read, and understand Take Care’s Employee Handbook
                  and have had the opportunity to ask questions about and
                  discuss the policies and procedures with a representative of
                  Take Care during Orientation. I agree to abide by these
                  policies and procedures, as they are a condition of my
                  employment. I understand that this Employee Handbook is a
                  revised version and that it takes precedence over all previous
                  versions of policy and procedure previously distributed, and
                  that Take Care reserves the right to change or alter policies
                  at any time.
                </p>
              </li>
              <li>
                <p>
                  I understand that each employee of Take Care is an at-will
                  employee. This means that as an employee you may leave your
                  employment at any time, with or without cause, and with or
                  without prior notice, although we do request adequate advance
                  notice when possible. Likewise, Take Care may discharge you,
                  with or without cause, and with or without prior notice at any
                  time. Take Care is a temporary services business entity whose
                  clients require services on as needed basis. Thus, Take Care
                  cannot assure field staff of any employment beyond the
                  individual work situations offered by Take Care’s work
                  scheduler.
                </p>
              </li>
              <li>
                <p>
                  I understand that the Employee Handbook and any other material
                  dispensed to me for the duration of my employment is not
                  intended to be a contract of employment and does not
                  constitute one, nor does the material constitute or express an
                  implied contract. Further, no representative of Take Care,
                  other than the President and/or CEO/Owner or her designee, has
                  the authority to enter into an agreement of employment for any
                  specified period of time or to make any agreement contrary to
                  the foregoing.
                </p>
              </li>
              <li>
                <p>
                  I understand the method of being paid. I have been instructed
                  on the use of both Take Care’s telephony system (TruTrak) and
                  mobile application (CrescendoConnect) and understand how to
                  correctly report my time worked. I realize that my failure to
                  do it correctly may cause a delay in receiving my proper pay.
                </p>
              </li>
              <li>
                <p>
                  I understand that I will have access to and may learn certain
                  information of a proprietary or confidential nature and
                  failure to protect that information is a serious offense. I
                  understand that I am expected to adhere to the policies and
                  procedures found within Take Care’s Privacy Policy Protocol. I
                  have received and read this policy.
                </p>
              </li>
              <li>
                <p>
                  I understand that I have no expectation of privacy while
                  engaging in work for Take Care or while on the premises of
                  Take Care. I have read and consent to Take Care’s Non-Privacy
                  and Search Policy.
                </p>
              </li>
              <li>
                <p>
                  I understand that the selection of personnel to staff any
                  individual case is at the discretion of the Administrator or
                  Director of Nursing. Said selection is made with the
                  health/welfare of the client as the primary consideration.
                </p>
              </li>
              <li>
                <p>
                  I understand Take Care does not charge advance job placement
                  fees. In consideration, I agree that in the event that I
                  become employed by the client within one hundred and eighty
                  (180) days from the last date worked with that client, I agree
                  to pay Take Care the sum of eight thousand dollars
                  ($8,000.00).
                </p>
              </li>
            </ol>

            <p>
              <strong>By signing below</strong>, I acknowledge that I have been
              instructed in the Policies and Procedures of Take Care and had the
              instruction on my required job duties. I fully understand what is
              expected of me and that compliance with said policies and
              procedures is a condition of my employment. I further acknowledge
              receipt of the employee handbook and understand that I am
              responsible for reading and complying with its contents.
            </p>

            <div>
              <strong
                >I acknowledge I’ve received a copy of this acknowledgment
                form.</strong
              >
              <div class="q-gutter-sm">
                <q-radio
                  v-model="employeeHandbookReceiptForm.acknowledgement"
                  val="yes"
                  label="Yes"
                />
                <q-radio
                  v-model="employeeHandbookReceiptForm.acknowledgement"
                  val="no"
                  label="No"
                />
              </div>
            </div>
            <q-btn
              :disabled="
                employeeHandbookReceiptForm.complete ||
                  employeeHandbookReceiptForm.acknowledgement !== 'yes'
              "
              label="Complete"
              color="primary"
              class="q-mt-md"
              unelevated
              type="submit"
            />
          </q-form>
        </q-expansion-item>
      </q-list>

      <div class="q-my-md">
        <q-banner class="bg-grey-4">
          <h6 class="q-ma-none">Signature</h6>
        </q-banner>
        <q-banner class="bg-grey-2">
          <span style="text-align: center; color: red;">
            Employee MUST sign below.
          </span>
          <span style="text-align: left;">
            Only full signatures with first and last name will be accepted.
            <br />
            <br />
            <!-- I acknowledge that I have received a copy of Advantage In-Home
            Service’s Employee Handbook which includes a detailed description of
            agency’s policies, procedures and employee expectations. I
            understand that I am responsible for understanding the policies in
            this handbook and agree to adhere to all the policies and procedures
            during my employment with Advantage In-Home Services, LLC. I
            understand that Advantage In-Home Services, LLC reserves the right
            to modify this handbook, amend, or terminate any policies,
            procedures, or employee benefit programs at any time. -->
            <br />
            <br />
            <!-- I acknowledge that I have received training on the above-mentioned
            topics from Advantage In-Home Services. -->
          </span>
        </q-banner>
      </div>

      <div class="row items-center justify-between q-mb-sm">
        <label>
          <strong>
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
              }
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
import { date } from "quasar";
import { mainMixin } from "../../mixins/index";
import { axiosInstance } from "../../boot/axios";
import AvailabilityCalendar from "src/components/AvailabilityCalendar";
import hireData from "./HireComplianceSessionTasks";

export default {
  name: "HireComplianceSession1",

  mixins: [mainMixin],
  components: { AvailabilityCalendar },
  props: {
    mediaId: String,
    acceptMediaType: String,
    acceptCapture: String,
    pinCode: String,
    serviceRequirement: Object,
    employeeId: String,
    firstName: String,
    lastName: String,
    department: String
  },

  async mounted() {
    switch (this.getCompanyCode()) {
      case "TCHH":
        this.handbookUrl = "https://wftchh.blob.core.windows.net/doc/Take%20Care%20Employee%20Handbook%202018.pdf";
        break;
      case "AHC":
        this.handbookUrl = "https://tahelper.blob.core.windows.net/doc/AIH%20Handbook.pdf";
        break;
      default:
        break;
    }

    await this.loadSubmittedStatus();
    await this.loadSessions();
    await this.loadTaskStatus();

    setInterval(() => {
      this.onHeartbeat();
    }, 1000);

    // Stop the clock when closing the tab or navigating away.
    window.addEventListener("beforeunload", event => {
      this.onUserIdle();

      // Allowing time to post this session.
      // Beacon API won't permit an Authorization header.
      if (!this.submitted) {
        event.preventDefault();
        event.returnValue = "";
      }
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
      return this.entries.length + 1;
    },
    completedTasks() {
      return (
        this.entries.filter(v => !!v.complete).length +
        (this.handbookDownloaded ? 1 : 0)
      );
    }
  },
  watch: {
    vaccinationForm: {
      deep: true,
      async handler(newForm, old) {
        await this.saveProgress(newForm);
      }
    },
    consentForm: {
      deep: true,
      async handler(newForm, old) {
        await this.saveProgress(newForm);
      }
    },
    availabilityForm: {
      deep: true,
      async handler(newForm, old) {
        await this.saveProgress(newForm);
      }
    },
    safetyManualReceiptForm: {
      deep: true,
      async handler(newForm, old) {
        await this.saveProgress(newForm);
      }
    },
    employeeHandbookReceiptForm: {
      deep: true,
      async handler(newForm, old) {
        await this.saveProgress(newForm);
      }
    }
  },
  methods: {
    getCompanyCode() {
      return import.meta.env.COMPANY;
    },
    async completeAvailability() {
      if (await this.$refs.availabilityCalendar.validateForm()) {
        this.availabilityForm.complete = true;
        this.$refs.preferredShiftHours.hide();
        this.$refs.safetyManual.show();
      }
    },
    async saveProgress(newForm) {
      const payload = {
        employeeId: this.employeeId,
        tasks: [
          {
            name: newForm.name,
            complete: newForm.complete,
            data: JSON.stringify(newForm)
          }
        ]
      };

      await axiosInstance.post(
        `${import.meta.env.BASE_URL}/expiring-service-requirements/save-progress/${this.mediaId}?deliveryMethod=ServiceRequirementHireComplianceSessionResponse`,
        payload
      );
    },
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
        this.progressLabel = "Forms are all complete";
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
      if (this.getSecondsSinceLastInteraction() > this.config.maxIdleSeconds) {
        this.onUserIdle();
      }

      this.setProgress();
    },
    async onUserIdle() {
      if (this.currentSessionStart !== null) {
        this.sessions.push({
          start: this.currentSessionStart,
          end: new Date()
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
    async loadSubmittedStatus() {
      const payload = {};
      const { data } = await axiosInstance
        .post(
          `${import.meta.env.BASE_URL}/expiring-service-requirements/fetch-submit-status/${this.mediaId}?deliveryMethod=ServiceRequirementHireComplianceSessionResponse`,
          payload
        );

      this.submitted = !!data;
      this.submittedDateTime = data?.submittedDateTime ? date.formatDate(data?.submittedDateTime, "MM-DD-YYYY hh:mm a") : null;
    },
    async loadSessions() {
      const payload = {};
      return axiosInstance
        .post(
          `${import.meta.env.BASE_URL}/expiring-service-requirements/fetch-sessions/${this.mediaId}?deliveryMethod=ServiceRequirementHireComplianceSessionResponse`,
          payload
        )
        .then(response => {
          response.data.forEach(session => {
            this.sessions.push({
              start: moment(session.start).toDate(),
              end: moment(session.end).toDate()
            });
          });
        });
    },
    async loadTaskStatus() {
      const payload = {};
      const response = await axiosInstance.post(
        `${import.meta.env.BASE_URL}/expiring-service-requirements/fetch-progress/${this.mediaId}?deliveryMethod=ServiceRequirementHireComplianceSessionResponse`,
        payload
      );

      response.data.forEach(task => {
        if (task.taskName === "Download Handbook") {
          this.handbookDownloaded = task.taskComplete;
          this.handbookExpanded = !task.taskComplete;
        } else {
          const matchingForm = this.entries.find(v => v.name === task.taskName);
          if (matchingForm) {
            const data = JSON.parse(task.data);
            for (const key in data) {
              matchingForm[key] = data[key];
            }
          }
        }
      });
    },
    async onSubmit() {
      this.submitError = null;
      if (this.completedTasks < this.totalTasks) {
        this.$q.dialog({
          title: "Incomplete tasks",
          message: `${this.totalTasks -
            this
              .completedTasks} tasks have not yet been complete. Please complete all tasks before submitting.`,
          persistent: true
        });
      } else {
        await this.onUserIdle();
        this.submit();
      }
    },
    async submit() {
      try {
        // Ensure all sessions have been sent before submitting
        await this.addSessions(this.sessions);

        const surveyEntries = [
          {
            name: "completedTasks",
            value: this.completedTasks,
            required: true,
            notifyKeyword: null,
            dbField: null
          },
          {
            name: "totalTasks",
            value: this.totalTasks,
            required: true,
            notifyKeyword: null,
            dbField: null
          }
        ];
        const employeeSignature = this.$refs[
          "employeeSignature"
        ].saveSignature();
        const payload = {
          surveyEntries,
          employeeSignature64: employeeSignature.data
        };
        const { data } = await axiosInstance
          .post(
            `${import.meta.env.BASE_URL}/expiring-service-requirements/save/${this.mediaId}?deliveryMethod=ServiceRequirementHireComplianceSessionResponse`,
            payload
          );

        this.submitted = true;
        this.submittedDateTime = data.submittedDateTime;
      } catch (error) {
        console.log('Unable to submit: ', err);
        this.submitError = "An error occurred. Please try again.";
      }
    },
    async addSessions(sessions) {},
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

        // Mark complete
        const payload = {
          employeeId: this.employeeId,
          tasks: [
            {
              name: "Download Handbook",
              complete: true
            }
          ]
        };
        axiosInstance.post(
          `${import.meta.env.BASE_URL}/expiring-service-requirements/save-progress/${this.mediaId}?deliveryMethod=ServiceRequirementHireComplianceSessionResponse`,
          payload
        );

        this.$refs.handbook.hide();
        this.$refs.orientation.show();
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
    const forms = hireData.forms;
    const entries = hireData.entries;
    const vaccinationForm = hireData.entries.filter(
      e => e.name == "Hepatitis B Vaccine"
    )[0];
    const consentForm = hireData.entries.filter(
      e => e.name == "Consent for Publication"
    )[0];
    const availabilityForm = hireData.entries.filter(
      e => e.name == "Availability"
    )[0];
    const safetyManualReceiptForm = hireData.entries.filter(
      e =>
        e.name == "Acknowledgement of Receipt of Orientation of Safety Manual"
    )[0];
    const employeeHandbookReceiptForm = hireData.entries.filter(
      e =>
        e.name ==
        "EMPLOYEE’S ACKNOWLEDGEMENT OF ORIENTATION AND RECEIPT OF EMPLOYEE HANDBOOK"
    )[0];

    return {
      config: {
        maxIdleSeconds: 15 * 60,
        maxSeconds: 5 * 60 * 60 // This value also set on the server
      },
      yesNoOptions: [
        {
          label: "Yes",
          value: "yes"
        },
        {
          label: "No",
          value: "no"
        }
      ],
      progress: 0.0,
      progressLabel: "Loading",
      trainingTimeCompleted: false,
      videoPlaying: false,
      sessions: [],
      entries,
      hireData,
      forms,
      consentForm,
      vaccinationForm,
      availabilityForm,
      safetyManualReceiptForm,
      employeeHandbookReceiptForm,
      currentSessionStart: new Date(),
      lastInteraction: new Date(),
      acknowledged: "No",
      signatureRefName: null,
      handbookUrl: "",
      handbookDownloaded: false,
      handbookExpanded: true,
      submitted: false,
      submittedDateTime: null,
      downloading: false,
      submitError: null
    };
  }
};
</script>

<style lang="scss" scoped>
.red-border {
  border: solid 6px $red-2;
}
</style>
