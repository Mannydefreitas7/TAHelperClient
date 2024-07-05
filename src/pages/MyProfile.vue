<template>
  <q-page class="q-pa-sm bg-white">
    <div class="row q-gutter-md q-col-gutter-sm">
      <div class="col-lg-6 col-md-6 col-xs-12 col-sm-12">
        <q-card flat bordered>
          <q-card-section class="text-h6">
            <div class="text-h6">My Profile</div>
          </q-card-section>
          <q-card-section class="q-pa-sm">
            <q-list class="row">
              <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input
                    ref="name"
                    dense
                    filled
                    v-model="user.userName"
                    label="Name"
                    :rules="[value => value !== '' || 'Name is a required field']"
                    lazy-rules
                  />
                </q-item-section>
              </q-item>
              <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input
                    ref="email"
                    dense
                    filled
                    v-model="user.userEmail"
                    label="Email Address"
                    :rules="[value => validateEmail(value) || 'Please enter a valid email address']"
                    lazy-rules
                  />
                </q-item-section>
              </q-item>
              <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input
                    ref="phone"
                    dense
                    filled
                    v-model="user.userMobile"
                    label="Mobile #"
                    mask="+1(###) ### - ####"
                    fill-mask
                    unmasked-value
                    :rules="[value => validatePhone(value) || 'Please enter a valid phone number']"
                    lazy-rules
                  />
                </q-item-section>
              </q-item>
              <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-select
                    filled
                    v-model="user.userContactMethod"
                    :options="contactOptions"
                    label="Contact Method"
                  ></q-select>
                </q-item-section>
              </q-item>
              <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-select
                  filled
                    v-model="user.timeZone"
                    :options="timeZones"
                    label="Time Zone"
                  ></q-select>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>


          <q-card-section class="text-h6">
            <div class="text-h6">Signature</div>
          </q-card-section>
          <q-card-section class="q-px-lg">
            <q-img
              v-show="user.signature"
              :src="user.signature"
              contain
              width="100%"
              height="100px"
              style="border: 1px solid black"
            ></q-img>
            <VueSignaturePad
              v-show="!user.signature"
              style="border: 1px solid black"
              ref="signatureRef"
              width="100%"
              height="100px"
              :options="{
                penColor: '#000',
                onBegin: () => {
                  $refs.signatureRef.resizeCanvas();
                }
              }"
            />

            <div class="q-mt-sm row justify-end">
              <q-btn
                v-if="user.signature"
                no-caps
                label="Clear Signature"
                color="grey-8"
                @click="$refs.signatureRef.clearSignature(); user.signature = null"
              />
            </div>
          </q-card-section>


          <q-card-actions class="bg-grey-2 q-pa-md" align="right">
            <q-btn
              unelevated
              class="text-capitalize text-white"
              color="primary"
              @click="saveProfile()"
            >
              Save Profile
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { axiosInstance } from "src/boot/axios";
import { timeZones } from "src/lib/shared";

export default {
  name: "MyProfile",
  async mounted() {
    await axiosInstance
      .get(`${import.meta.env.BASE_URL}/user/user`)
      .then(response => {
        this.user = response.data;
      })
      .catch(error => console.log(error));
  },
  methods: {
    validateEmail(email) {
      if (!email || email.trim() == '') {
        return true;
      }

      const reEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const emailRes = reEmail.test(String(email).toLowerCase());

      return emailRes;
    },
    validatePhone(phone) {
      if (!phone || phone.trim() == '') {
        return true;
      }

      const phoneNumber = parseInt(phone);
      const rePhone = /\d{10}/;
      const phoneRes = rePhone.test(Number(phoneNumber));

      return phoneRes;
    },
    saveProfile() {
      const nameRef = this.$refs.name;
      const emailRef = this.$refs.email;
      const phoneRef = this.$refs.phone;

      nameRef.validate();
      emailRef.validate();
      phoneRef.validate();

      const ref = this.$refs.signatureRef;
      const signature = ref.saveSignature();

      if (!signature.isEmpty) {
        this.user.signature = signature.data;
      }

      if (
        !nameRef.hasError &&
        !emailRef.hasError &&
        !phoneRef.hasError
      ) {
        const payload = {
          ...this.user,
          userMobile: `+1${this.user.userMobile}`,
        };

        axiosInstance
          .put(`${import.meta.env.BASE_URL}/user/update-user/`, payload)
          .then(response => {
            this.$q.notify({
              color: "green-4",
              textColor: "white",
              icon: "cloud_done",
              position: "top",
              message: "Profile Saved"
            });
          })
          .catch(error => console.log(error));
      }
    },
  },
  data() {
    return {
      timeZones,
      contactOptions: ["Email", "SMS", "All"],
      user: {},
    };
  }
};
</script>

<style scoped>
.fade-enter-active {
  transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.card-bg {
  background-color: #162b4d;
}
</style>
