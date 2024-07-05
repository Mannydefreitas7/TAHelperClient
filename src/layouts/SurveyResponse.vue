<template>
  <q-layout
    view="lHh Lpr lFf"
    :style="`background: ${pageSettings.backgroundImage ? `url(\'${pageSettings.backgroundImage}\')` : '#e8eaf6'}; background-size: cover;`">
    <q-page-container id="wrapper">
      <div v-if="expired" class="column justify-center items-center" style="height: calc(100vh - 10px)">
        <div class="column justify-center items-center">
          <q-icon size="130px" name="schedule" color="red-8"></q-icon>
          <h6 class="q-ma-none text-center"><strong>Link Expired</strong></h6>
          <p class="q-ma-none text-center" style="font-size: 17px;">Please contact your local office for more information</p>
        </div>
      </div>

      <div class="row items-center justify-center" v-if="!expired">
        <div
          v-if="!!name"
          class="full-width row justify-center col-12 bg-grey-4 q-mt-sm q-py-xs"
          style="max-width: 500px; border-radius: 5px;">
          <span class="tet-center text-subtitle1">{{name}}</span>
        </div>
        <div class="col-12">
          <div v-if="sent" class="q-pa-md q-gutter-md">
            <q-banner rounded class="bg-teal-8 text-white">
              <div class="text-center" id="submit-message">
                Your response has been submitted
                <br />Thank you!
              </div>
            </q-banner>
          </div>
          <div v-else-if="exists" class="q-pa-md q-gutter-md">
            <q-banner rounded class="bg-yellow-5 text-black">
              <div class="text-center">
                Looks like you already submitted a response
                <br />Thank you!
              </div>
            </q-banner>
          </div>
          <div v-else>
            <div
              id="google_translate_element"
              class="q-pt-sm q-pb-sm row items-center justify-end"></div>

            <div v-if="!parsedFormData">
              <form id="form-render"></form>
              <div class="row" style="margin:5px">
                <q-btn
                  v-if="hasSteps && (selectedSteps > step || selectedSteps === 0)"
                  :disabled="selectedSteps === 0"
                  id="submit-button"
                  class="text-capitalize text-white"
                  color="primary"
                  @click="nextStep()"
                >Next</q-btn>
                <q-btn
                  v-else
                  id="submit-button"
                  class="text-capitalize text-white"
                  color="primary"
                  @click="save()"
                >Submit</q-btn>
              </div>
            </div>
            <q-form-renderer
              v-else
              :form-data="parsedFormData"
              :page-settings="pageSettings || {}"
              @submit="saveV2"
              @validation-error="showErrorMessage('Please complete all required fields')"></q-form-renderer>
          </div>
        </div>
      </div>
      <q-dialog v-model="signaturePadDialog.open" persistent>
        <q-card style="width: 500px; max-width: 80vw">
          <q-card-section class="row items-center">
            <div>
              <label style=""><strong>Sign Here</strong></label>
              <VueSignaturePad v-model="signatureValue" width="470px" height="100px" ref="signaturePad" style="background-color: white; border: 1px solid black"/>
            </div>
          </q-card-section>

        <q-card-actions class="bg-grey-2 q-pa-md" align="between">
          <q-btn @click="saveSignature" label="Save Signature" color="blue-8" text-color="white" v-close-popup/>
          <q-btn @click="clearSignature" label="Clear" color="grey-8" text-color="white"/>
          <q-btn label="Cancel" color="red" text-color="white" v-close-popup/>
        </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="extraSignaturePadDialog.open" persistent>
        <q-card style="width: 500px; max-width: 80vw">
          <q-card-section class="row items-center">
            <div>
              <label style=""><strong>Sign Here</strong></label>
              <VueSignaturePad
                v-model="extraSignatureValue"
                width="470px"
                height="100px"
                ref="extraSignaturePad"
                style="background-color: white; border: 1px solid black"/>
            </div>
          </q-card-section>

          <q-card-actions class="bg-grey-2 q-pa-md" align="between">
            <q-btn @click="saveExtraSignature" label="Save Signature" color="blue-8" text-color="white" v-close-popup/>
            <q-btn @click="clearExtraSignature" label="Clear" color="grey-8" text-color="white"/>
            <q-btn label="Cancel" color="red" text-color="white" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>
<style lang="scss">
  @import "../lib/chosen/chosen.min.css";
  @import "~formeo/dist/formeo.min.css";
  H1,
  H2,
  H3,
  H4,
  H5 {
    text-align: center;
  }
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
  .formeo-row-wrap:first-child {
    border-top: 15px solid blueviolet;
  }
  .formeo-row-wrap {
    margin-left: 10px;
    margin-right: 10px;
    border-radius: 5px;
    border: 1px solid gray;
    padding: 5px;
    background-color: white;
    margin-bottom: 10px !important;
  }
  .f-field-group label {
    font-size: 16px;
    font-weight: normal;
  }
  .f-radio {
    font-size: 18px;
  }
  #submit-button {
    margin: auto;
    margin-bottom: 100px;
    width: 150px;
    font-size: 23px;
  }
  .center-img img {
    width: 50%;
    margin-left: 25%;
  }
  .hide-bg-border {
    background-color: transparent !important;
    border: none !important;
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

  .goog-te-banner-frame, .skiptranslates, #goog-gt-tt {
    display: none !important;
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

<script>
import { axiosInstance } from "src/boot/axios";
import { FormeoRenderer } from "formeo";
import { mainMixin } from "../mixins/index";
import $ from 'jquery';
import chosen from '../boot/chosen/chosen.jquery.min.js';
import { Platform } from 'quasar';

export default {
  name: "SurveyResponse",
  mixins: [mainMixin],
  created() {
    const isOnIOS = navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
    const eventName = isOnIOS ? "pagehide" : "beforeunload";
    $(window).bind(eventName,function(event) {
      window.event.cancelBubble = true;
      return "are you sure you want to leave?";
    });
  },
  async mounted() {
    this.surveyId = this.$route.params.id;

    const response = await axiosInstance.get(`${import.meta.env.BASE_URL}/survey/${this.surveyId}`);
    this.name = response.data.name;
    this.clientId = response.data.clientId;
    this.$nextTick(() => this.googleTranslateInit(response.data.language));
    if (response.data.expired) {
      this.expired = true;
      return;
    }

    const parsedFormTemplate = JSON.parse(response.data.form);
    if (parsedFormTemplate.sdk == 2) {
      for (const key in response.data.defaultData) {
        const index = parsedFormTemplate.data.findIndex(f => f.columnName === key);
        if (index > -1) {
          const field = parsedFormTemplate.data[index];
          field.value = response.data.defaultData[key];
          parsedFormTemplate.data.splice(index, 1, field);
        }
      }
      if (parsedFormTemplate.pageSettings) {
        this.pageSettings = parsedFormTemplate.pageSettings;
      }
      if (response.data.data) {
        response.data.data.forEach(response => {
          const index = parsedFormTemplate.data.findIndex(f => f.id === response.fieldId);
          if (index > -1) {
            const field = parsedFormTemplate.data[index];
            if (field.type === 'list') {
              field.value = JSON.parse(response.value);
            } else {
              field.value = response.value;
            }
            parsedFormTemplate.data.splice(index, 1, field);
          }
        });
      }
      this.parsedFormData = parsedFormTemplate.data;
    } else if (parsedFormTemplate.sdk == 1) {
      this.renderForm(parsedFormTemplate.data);
    } else {
      this.renderForm(parsedFormTemplate);
    }
  },
  methods: {
    googleTranslateInit(lang) {
      // let checkIfGoogleLoaded = setInterval(() => {
      //   if (google.translate.TranslateElement != null) {
      //     clearInterval(checkIfGoogleLoaded);
      //       this.googleTranslateElement('google_translate_element', lang);
      //     }
      // }, 100);
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
    toggleStepElement(disabled) {
      const stepElement = Object.values(this.formRenderer.form.fields).find(el => el.attrs && el.attrs.stepElement);
      if (!!stepElement) {
        stepElement.options.forEach(o => {
          const el = $(`input[value="${o.value}"]`);
          el.prop('disabled', disabled);
        });
      }
    },
    nextStep() {
      this.step++;
      this.toggleElements();

      this.toggleStepElement(true);
    },
    toggleElements() {
      this.$nextTick(() => {
        for (let i = 1; i <= this.selectedSteps; i++) {
          const $steps = $(`.step-${i}`);
          if (i === this.step) {
            const $formeoRows = $('.formeo-row-wrap');
            $formeoRows.each((index, { id }) => {
              const $formeoRow = $(`#${id}`);
              $steps.each((index, { id }) => {
                const isEl = $formeoRow.find(`#${id}`).parent().not('[hidden]');
                if (!!isEl.length) {
                  $formeoRow.removeClass('hide-element');
                }
              });
            });
          } else {
            const $formeoRows = $('.formeo-row-wrap');
            $formeoRows.each((index, { id }) => {
              const $formeoRow = $(`#${id}`);
              $steps.each((index, { id }) => {
                const isEl = $formeoRow.find(`#${id}`);
                if (!!isEl.length) {
                  $formeoRow.addClass('hide-element');
                }
              });
            });
          }
        }
      })
    },
    saveSignature(){
      const signatureResult = this.$refs.signaturePad.saveSignature();
      this.signatureValue = signatureResult.data;
      const sigValue = document.getElementsByClassName('sigValue')
      const signaturePadInput = document.getElementsByClassName('signaturePadInput')
      if (!! sigValue.length){
        sigValue[0].src = `${this.signatureValue}`
      }
      if (!! signaturePadInput.length)
      {
        signaturePadInput[0].value = this.signatureValue
      }
    },
    saveExtraSignature(){
      const extraSignatureResult = this.$refs.extraSignaturePad.saveSignature();
      this.extraSignatureValue = extraSignatureResult.data;
      const extraSigValue = document.getElementsByClassName('extraSigValue')
      const extraSignaturePadInput = document.getElementsByClassName('extraSignaturePadInput')
      if (!! extraSigValue.length){
        extraSigValue[0].src = `${this.extraSignatureValue}`
      }
      if (!! extraSignaturePadInput){
        extraSignaturePadInput[0].value = this.extraSignatureValue;
      }
    },
    clearSignature() {
      this.$refs.signaturePad.clearSignature();
      this.signatureValue = null;
    },
    clearExtraSignature() {
      this.$refs.extraSignaturePad.clearSignature();
      this.extraSignatureValue = null;
    },
    buildFormData() {
      const data = $("#form-render").serializeArray();

      if (!!this.hasSignaturePad) {
        const signatureField = data.filter(d => d.name === this.hasSignaturePad);
        data.map(d => {if(signatureField.some(df => df.name === d.name)){d.value = this.signatureValue}});
        if (!! this.hasExtraSignaturePad) {
          const extraSignatureField = data.filter(d => d.name === this.hasExtraSignaturePad);
          data.map(d => {if(extraSignatureField.some(edf => edf.name === d.name)){d.value = this.extraSignatureValue}});
        }
      }

      return data;
    },
    openSignaturePad(){
      this.signaturePadDialog.open = true;
    },
    openExtraSignaturePad(){
      this.extraSignaturePadDialog.open = true;
    },
    renderForm(data) {
      this.formRenderer = new FormeoRenderer({
        renderContainer: "#form-render",
      });

      this.formRenderer.render(data);

      // populate step counts
      this.hasSteps = !!$('input[value="has-steps"]').length;
      if (this.hasSteps) {
        const values = Object.values(this.formRenderer.form.fields);
        const field = values.find(el => el.attrs && el.attrs.value === 'has-steps');
        const splitSteps = field.attrs['stepsToParse'].split(',');
        splitSteps.forEach(val => {
          const nameAndValue = val.split('=');
          this.allSteps[nameAndValue[0]] = Number(nameAndValue[1])
        });

        const stepElement = values.find(el => el.attrs && el.attrs.stepElement);
        stepElement.options.forEach(o => {
          const el = $(`input[value="${o.value}"]`);
          el.on('input', evt => this.selectedSteps = this.allSteps[evt.target.value]);
        });

        let index = 0;
        $.each(this.formRenderer.form.fields, (key, field) => {
          index++;
          if (field.attrs.class && !field.attrs.class.includes('step-1') && field.attrs.class.includes('step-')) {
            $(`.step-${index}`).closest('.formeo-row-wrap').addClass('hide-element');
          }
        });
      }

      // Check for row backgrounds
      const $formeoRows = $('.formeo-row-wrap');
      $formeoRows.each((index, { id }) => {
        const $formeoRow = $(`#${id}`);

        const $hasRemoveBg = $formeoRow.find('.remove-bg');
        if (!!$hasRemoveBg.length) {
          $formeoRow.addClass('hide-bg-border');
        }

        const $hasSubmitMessage = $formeoRow.find('.post-submit-message');
        if (!!$hasSubmitMessage.length) {
          $formeoRow.addClass('hide-element');
        }

        const $hideParent = $formeoRow.find('.hide-parent');
        if (!!$hideParent.length) {
          $formeoRow.addClass('hide-element');
        }
        const $signaturePad = $formeoRow.find('.signaturePad');
        if (!! $signaturePad.length) {
          const signaturePadField = $signaturePad.serializeArray();
          this.hasSignaturePad = signaturePadField[0].name
          $signaturePad.replaceWith('<div> <input style="display:none;" class="signaturePadInput"/> <img class="sigValue"/></div> <div><button type="button" class="sigButton">Signature</button></div>')
        }
        const $extraSignaturePad = $formeoRow.find('.extraSignaturePad');
        if (!! $extraSignaturePad.length){
          const extraSignaturePadField = $extraSignaturePad.serializeArray();
          this.hasExtraSignaturePad = extraSignaturePadField[0].name
          $extraSignaturePad.replaceWith('<div> <input style="display:none;" class="extraSignaturePadInput"/> <img class="extraSigValue"/></div> <div><button type="button" class="extraSigButton">Signature</button></div>')
        }

        const $hasHorizontalOptions = $formeoRow.find('.horizontal-options');
        if (!!$hasHorizontalOptions.length) {
          $hasHorizontalOptions.each(function(index) {
            $(this).removeClass('horizontal-options');

            if (index % 2 !== 0) {
              $(this).addClass('row justify-center q-gutter-x-sm')
              $(this).children().each(function() {
                $(this).addClass('column q-mt-sm');
              });
            }
          });
        }
      });

      $('option').removeAttr('label');

      $('select[multiple]').each(function() {
        $(this).find(':first-child').remove();
        $(this).prepend('<option value></option>');
        const max_selected_options = $(this).attr('max-select');
        const options = {};

        if (max_selected_options) {
          options.max_selected_options = max_selected_options;
        }

        $(this).chosen(options).change(() => {
          $(document).click();
        })
      });
      const sigButton = document.getElementsByClassName('sigButton')
      if (!! sigButton.length){
        sigButton[0].addEventListener("click", this.openSignaturePad);
      }
      const extraSigButton = document.getElementsByClassName('extraSigButton')
      if (!! extraSigButton.length){
        extraSigButton[0].addEventListener("click", this.openExtraSignaturePad)
      }
      const signaturePadInput = document.getElementsByClassName('signaturePadInput')
      if (!! signaturePadInput.length){
        signaturePadInput[0].name = this.hasSignaturePad;
      }
      const extraSignaturePadInput = document.getElementsByClassName('extraSignaturePadInput')
      if (!! extraSignaturePadInput.length){
        extraSignaturePadInput[0].name = this.hasExtraSignaturePad;
      }
    },
    formatSaveData(field) {
      const entry = {
        fieldType: field.type,
        fieldId: field.id,
        dbField: field.columnName,
        name: field.label,
        value: field.value,
        required: !!field.required,
        notifyKeyword: field.notifyKeyword,
      };
      if (field.columnName === 'ClientId') {
        entry.value = this.clientId;
      }
      return entry;
    },
    saveV2(value) {
      const payload = Object.values(value).map(data => {
        const entry = this.formatSaveData(data);
        if (entry.fieldType === 'list') {
          entry.value = JSON.stringify(entry.value.map(d => Object.values(d).map(this.formatSaveData)));
        } else if (data.multiSelect) {
          entry.value = JSON.stringify(entry.value);
        }
        return entry;
      });

      axiosInstance
        .post(
          `${import.meta.env.BASE_URL}/survey/save/${this.surveyId}`,
          payload
        )
        .then((response) => {
          if (response.data === "exists") {
            this.exists = true;
          }
        })
        .catch((error) => console.log(error));
    },
    save() {
      // element must be enabled to show up in serializeArray()
      this.toggleStepElement(false);
      const data = this.buildFormData();

      const processedData = [];
      let allowSubmit = true;
      $.each(this.formRenderer.form.fields, (key, value) => {
        const type = value.meta.id;
        if (
          type == "paragraph" ||
          type === "divider" ||
          type === "html.header"
        ) {
          return;
        }

        const dbField = value.attrs.DbField || null;
        const required = value.attrs.required || value.attrs.Required;
        const notification = value.attrs.notification || value.attrs.Notification;
        const label = value.config.label;
        const formeoKey = `f-${key}`;

        let nameValue = {value: null};
        if (dbField === 'ClientId') {
          nameValue = { value: this.clientId };
        }
        else {
          const nameValues = data.filter(d => d.name === formeoKey);
          if (nameValues.length > 1) {
            nameValue = {
              value: nameValues.map(n => n.value).join('; ')
            }
          } else if (nameValues.length === 1) {
            nameValue = nameValues[0];
          }
        }

        if (required && (!nameValue || !nameValue.value)) {
          // disable step element if form is invalid
          this.toggleStepElement(true);

          allowSubmit = false;
          this.$q.notify({
            color: "red-5",
            textColor: "white",
            icon: "error",
            position: "top",
            message: `${label.replace( /(<([^>]+)>)/ig, '')} is a required field`,
          });

          return;
        }

        const nameValueValue = nameValue ? nameValue.value : '';
        processedData.push({
          dbField,
          name: label,
          value: nameValueValue,
          required: required,
          notifyKeyword: notification || "",
        });
      });

      if (allowSubmit && processedData.length > 0) {
        const $submitMessage = $('.post-submit-message').parent().not('[hidden]');
        axiosInstance
          .post(
            `${import.meta.env.BASE_URL}/survey/save/${this.surveyId}`,
            processedData
          )
          .then((response) => {
            if (response.data === "exists") {
              this.exists = true;
            } else {
              this.sent = true;
              this.$nextTick(() => {
                if (!!$submitMessage.length) {
                  $('#submit-message').text($submitMessage.text())
                }
              })
            }
          })
          .catch((error) => console.log(error));
      }
    },
  },
  data() {
    return {
      expired: false,
      exists: false,
      sent: false,
      name: null,
      surveyId: null,
      clientId: null,
      formRenderer: {},
      hasSteps: false,
      step: 1,
      selectedSteps: 0,
      allSteps: {},
      signatureValue: null,
      extraSignatureValue: null,
      hasSignaturePad: false,
      hasExtraSignaturePad: false,
      signaturePadDialog: {open: false},
      extraSignaturePadDialog: {open: false},
      signaturePadFields: [],
      parsedFormData: null,
      pageSettings: {},
    };
  },
};
</script>
