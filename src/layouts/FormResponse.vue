<template>
  <q-layout view="lHh Lpr lFf" class="bg-indigo-1">
    <q-page-container id="wrapper">
      <div v-if="pinRequired" class="q-pa-md q-gutter-md fixed-top">
        <div class="row justify-center full-width">
          <q-img
            :src="response.logoUrl"
            style="max-width: 150px"
            basic
            spinner-color="white"
            class="rounded-borders vertical-top"
          />
        </div>
        <form @submit.prevent>
          <q-input
            rounded
            outlined
            v-model.trim="pinCode"
            type="text"
            pattern="[0-9]*"
            label="Please enter your PIN"
            required
          >
            <template v-slot:prepend>
              <q-icon name="dialpad" />
            </template>
            <template v-slot:append>
              <q-btn
                rounded
                color="indigo-5"
                label="Submit"
                type="submit"
                @click="fetchData()"
              />
            </template>
          </q-input>
          <div class="q-pt-md q-gutter-sm vertical-top">
            <q-banner rounded class="bg-purple-4 text-white">
              <template v-slot:avatar>
                <q-icon name="policy" color="white" />
              </template>
              <div class="row justify-between">
                <p class="text-subtitle1 q-mb-none q-mt-xs">
                  {{ this.getDisclaimer() }}
                </p>
              </div>
            </q-banner>
          </div>
        </form>
      </div>
      <div v-else class="row items-center justify-center">
        <div class="col-lg-8 col-md-8 col-xs-12 col-sm-12">
          <div v-if="!response.isComplete" id="google_translate_element" class="q-pt-sm q-pb-none row items-center justify-end"></div>
          <component
            v-if="response.formName"
            :is="response.formName"
            :formJSON="'{}'"
            :surveyId="surveyId"
            :response="response"
          ></component>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import formApi from "../api/forms";
import { mainMixin } from "../mixins/index";
import $ from 'jquery';

import GrahamConsentV1 from "../components/CustomForms/GHG/GrahamConsentV1.vue";
import GrahamConsentV2 from "../components/CustomForms/GHG/GrahamConsentV2.vue";

export default {
  name: "FormResponse",
  mixins: [mainMixin],
  components: { GrahamConsentV1, GrahamConsentV2 },
  async created() {
    this.surveyId = this.$route.params.id;
    const data = await formApi.getPageData(this.surveyId);
    this.response = {
      formName: data.formName,
      logo: data.logo,
      subject: data.subject,
      name: data.name,
      isComplete: data.isComplete,
    };
    if (!data.pinRequired) {
      this.pinRequired = false;
      localStorage.setItem("form_jwt", data.jwt);
    } else {
      this.pinRequired = true;
      localStorage.removeItem("form_jwt");
    }

    const isOnIOS = navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
    const eventName = isOnIOS ? "pagehide" : "beforeunload";
    $(window).bind(eventName,function(event) {
      window.event.cancelBubble = true;
      return "are you sure you want to leave?";
    });
  },
  async mounted() {
    this.$nextTick(() => this.googleTranslateInit(""));
  },
  methods: {
    getCompanyCode() {
      return import.meta.env.COMPANY;
    },
    googleTranslateInit(lang) {
      let checkIfGoogleLoaded = setInterval(() => {
        if (google.translate.TranslateElement != null) {
          clearInterval(checkIfGoogleLoaded);
            this.googleTranslateElement('google_translate_element', lang);
          }
      }, 100);
    },
    googleTranslateElement(id, lang) {
      const setCookie = (key, value, expiry) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
        document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
      }

      if (!!lang) {
        setCookie('googtrans', '/en/' + lang, 1);
      }

      new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, id);
    },
    getDisclaimer() {
      return import.meta.env.DISCLAIMER;
    },
    async fetchData() {
      try {
        const data = await formApi.getForm({
          surveyId: this.surveyId,
          pinCode: this.pinCode
        });
        this.data = {
          rows: data.rows,
          columns: data.columns,
          subject: data.subject,
          name: data.name,
          officePhone: data.officePhone,
        };
        this.pinRequired = false;
        localStorage.setItem("form_jwt", data.jwt);
      } catch (err) {
        console.error("Error: ", err);
        if (error.response?.status === 401) {
          this.pinRequired = true;
        }
      }
    }
  },
  data() {
    return {
      surveyId: "",
      response: {},
      data: {},
      pinCode: null,
      pinRequired: true,
    };
  },
};
</script>

<style lang="scss">
#wrapper {
  margin: auto;
  width: 75%;
  padding: 5px;
}
@media only screen and (max-width: 600px) {
  #wrapper {
    margin: auto;
    width: 100%;
    padding: 5px;
  }
}
#submit-button {
  margin: auto;
  margin-bottom: 100px;
  width: 150px;
  font-size: 23px;
}
.hide-bg-border {
  background-color: transparent !important;
  border: none !important;
}
.goog-te-banner-frame.skiptranslates {
    display: none !important;
}
body > .skiptranslate > iframe.skiptranslate {
  display: none !important;
  visibility: hidden !important;
}
.google-translate {
  display: inline-block;
  vertical-align: top;
  padding-top: 15px;
}
.goog-logo-link {
  display: none !important;
}
.goog-te-gadget {
  color: transparent !important;
}
body {
  top: 0px !important;
}
.goog-te-combo{
  float: right;
  display:block;
  width:100%;
  padding:.75rem 1rem;
  font-size:1rem;
  line-height:1.25;
  color:#4E5154;
  background-color:#FFF;
  -webkit-background-clip:padding-box;
  background-clip:padding-box;
  border:1px solid #BABFC7;
  border-radius:.25rem;
  -webkit-transition:border-color .15s ease-in-out,
  -webkit-box-shadow .15s ease-in-out;
  -o-transition:border-color .15s ease-in-out,
  box-shadow .15s ease-in-out;
  -moz-transition:border-color .15s ease-in-out,
  box-shadow .15s ease-in-out;
  transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out,-webkit-box-shadow .15s ease-in-out;
  margin-right:1rem!important
}
.hide-element {
  display: none;
}
</style>

