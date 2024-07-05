<template>
  <div>
    <div v-if="submitted">
      <q-badge color="blue">Submitted</q-badge>
    </div>
    <div v-else>
      <div><strong>Instructions</strong></div>
      <div v-if="serviceRequirement.Text_Status === 'Priority A'">
        Hi {{ serviceRequirement.ClientName }}, this is an urgent ping from
        Hmong Home Health Care that your authorization for
        {{ serviceRequirement.ServiceLine }} have ended as of
        {{ serviceRequirement.AuthorizationEnd }}. We have already submitted a
        request for your assessment. Please contact us if you have not heard
        from your care coordinator or the public health nurse for an annual
        reassessment. Please do not turn in anymore timecards until we receive a
        new authorization. Please call our office at 651-488-1680 for additional
        details. Thank you for choosing Hmong Home Health Care. We value your
        trust in us and remain committed to providing you with the best possible
        care.
      </div>
      <div v-if="serviceRequirement.Text_Status === 'Priority B'">
        Hello {{ serviceRequirement.ClientName }}, we hope this message finds
        you well. We urgently need your attention regarding your expiring
        authorization for {{ serviceRequirement.ServiceLine }} at Hmong Home
        Health Care. Your services are scheduled to end
        {{ serviceRequirement.AuthorizationEnd }} unless we receive your updated
        authorization. To avoid any disruptions, please ensure that our office
        receives the necessary documentation in a timely manner. Please refrain
        from submitting any timecards past the authorization end date, as we
        won't be able to process them until your authorization is updated. If
        you have any questions or need assistance, please don't hesitate to call
        our office at 651-488-1680. We're here to help and support you
        throughout this process. Thank you for your cooperation and
        understanding. Our dedication to providing quality care is at the
        forefront of our values.
      </div>
      <div v-if="serviceRequirement.Text_Status === 'Priority C'">
        Dear {{ serviceRequirement.ClientName }}, this is your final reminder to
        complete your reassessment within the next 30 days, prior to
        {{ serviceRequirement.AuthorizationEnd }}. It's crucial that you meet
        this deadline, as any delay may result in the termination of your
        services by your payor. Please be aware that we won't be able to process
        any timecards beyond the authorization's end. If you've already
        connected with a public health nurse/care coordinator and successfully
        completed your reassessment, rest assured that we'll promptly notify you
        upon receiving your authorization. To ensure a smooth process and stay
        connected, kindly keep your contact information up to date. If you have
        any questions or need further assistance, please don't hesitate to call
        our office at 651-488-1680. We are here to support you throughout this
        process. Thank you for choosing Hmong Home Health Care. We value your
        trust in us and remain committed to providing you with the best possible
        care.
      </div>
      <div v-if="serviceRequirement.Text_Status === 'Priority D'">
        Hello {{ serviceRequirement.ClientName }}, we at Hmong Home Health Care
        want to provide you with an important reminder regarding your
        reassessment. Please ensure that your reassessment is completed within
        the next 60 days, before {{ serviceRequirement.AuthorizationEnd }}.
        Failing to do so may result in the termination of your services by your
        payor. Please note that we won't be able to process any timecards beyond
        the end of your authorization. If you have already connected with a
        public health nurse/care coordinator and completed your reassessment, we
        will promptly notify you once we receive your authorization. To stay
        informed and ensure a smooth process, kindly keep your contact
        information updated. Should you have any questions or require further
        assistance, please don't hesitate to call our office at 651-488-1680.
        We're here to support you every step of the way. Your time and effort in
        this matter is appreciated.
      </div>
      <div v-if="serviceRequirement.Text_Status === 'Priority E'">
        Hello {{ serviceRequirement.ClientName }}, we wanted to remind you that
        your authorization for {{ serviceRequirement.ServiceLine }} will be
        expiring on {{ serviceRequirement.AuthorizationEnd }}. Our dedicated
        team will be submitting a reassessment request in the next 30 days to
        ensure your continued care. It's essential to complete the reassessment
        within the next 90 days to avoid any disruptions in your services from
        your payor. To facilitate this process, please make sure your contact
        information is up to date so we can reach you promptly. If you have any
        questions or need assistance, please don't hesitate to call our office
        at 651-488-1680. We are here to support you every step of the way. Thank
        you for choosing Hmong Home Health Care. We value your trust in us and
        remain committed to providing you with the best possible care.
      </div>
      <div class="q-mt-md">
        <q-form @submit.prevent>
          <div>
            <strong>Acknowledgement:</strong>
            <div>
              I have already connected with a public health nurse/care
              coordinator and completed my reassessment.
            </div>
            <div class="q-gutter-sm">
              <q-radio v-model="acknowledgement" val="yes" label="Yes" />
              <q-radio v-model="acknowledgement" val="no" label="No" />
            </div>
          </div>
          <q-btn
            :disabled="acknowledgement !== 'yes'"
            label="Complete"
            color="primary"
            class="q-mt-md"
            unelevated
            type="submit"
            @click="onSubmit"
          />
        </q-form>
      </div>
    </div>
  </div>
</template>
<script>
import { mainMixin } from "../../mixins/index";
import { addMessageQueueId } from "../../api/expiringServiceRequirements";
export default {
  name: "HHHCExpiringAuthorization",

  mixins: [mainMixin],

  props: {
    mediaId: String,
    acceptMediaType: String,
    acceptCapture: String,
    pinCode: String,
    serviceRequirement: Object,
  },

  async mounted() {},

  computed: {},

  methods: {
    async addMessageQueueIds(mediaId, id) {
      const group = this.priorityGroups.findIndex((p) => id.endsWith(`|${p}`));
      if (group < 0) {
        return Promise.reject();
      }

      const baseId = id.substr(
        0,
        id.length - `${this.priorityGroups[group]}`.length
      );
      for (let i = group; i < this.priorityGroups.length; i++) {
        const messageQueueId = `${baseId}${this.priorityGroups[i]}`;
        await addMessageQueueId(this.mediaId, messageQueueId);
      }

      return Promise.resolve();
    },
    onSubmit() {
      const id = this.serviceRequirement.UniqueKey;
      this.addMessageQueueIds(this.mediaId, id)
        .then(() => {
          this.submitted = true;
          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            position: "center",
            closeBtn: true,
            timeout: 5000,
            message: `Submitted successfully`,
          });
        })
        .catch((error) => {
          console.log(error);
          this.$q.notify({
            type: "negative",
            position: "center",
            message: `Encountered an error submitting. Please try again later or contact support.`,
          });
        });
    },
  },

  data: () => {
    return {
      acknowledgement: null,
      submitted: false,
      priorityGroups: [
        "Priority E",
        "Priority D",
        "Priority C",
        "Priority B",
        "Priority A",
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.red-border {
  border: solid 6px $red-2;
}
</style>
