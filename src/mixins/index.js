import moment from "moment";

export var mainMixin = {
  methods: {
    showSuccessMessage(message, position, actions = []) {
      this.$q.notify({
        color: "green-4",
        textColor: "white",
        icon: "cloud_done",
        position: position || "top",
        message: message,
        actions: actions,
      });
    },
    showErrorMessage(message, actions = []) {
      this.$q.notify({
        color: "red-5",
        textColor: "white",
        icon: "error",
        position: "top",
        message: message,
        actions: actions,
      });
    },
    validateEmail(email) {
      if (!email || email.trim() == '') {
        return true;
      }

      email = String(email).toLowerCase().replace(/\s/, '');
      const reEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const response = reEmail.test(email);

      return response;
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
    strIsEmptyOrSpaces(str){
        return str === null || str.match(/^ *$/) !== null;
    },
    pasteCapture(evt, refName = "editor_ref") {
      let text, onPasteStripFormattingIEPaste;
      evt.preventDefault();
      if (evt.originalEvent && evt.originalEvent.clipboardData.getData) {
        text = evt.originalEvent.clipboardData.getData("text/plain");
        this.$refs[refName].runCmd("insertText", text);
      } else if (evt.clipboardData && evt.clipboardData.getData) {
        text = evt.clipboardData.getData("text/plain");
        this.$refs[refName].runCmd("insertText", text);
      } else if (window.clipboardData && window.clipboardData.getData) {
        if (!onPasteStripFormattingIEPaste) {
          onPasteStripFormattingIEPaste = true;
          this.$refs[refName].runCmd("ms-pasteTextOnly", text);
        }
        onPasteStripFormattingIEPaste = false;
      }
    },
    getSubStrDots(input, limit) {
      if (input !== null && input !== undefined) {
        return input.length > limit
          ? input.substring(0, limit) + "..."
          : input;
      } else {
        return "Loading...";
      }
    },
    getDtFromNow(dt) {
      if (!dt) {
        return dt;
      }

      return moment(dt).fromNow();
    },
    getDtFormattedWithoutTime(dt) {
      if (!dt) {
        return dt;
      }

      return this.getDtFormatted(dt, "MM/DD/YY", true);
    },
    getDtFormattedFromUnixSeconds(seconds, format) {
      if (!seconds) {
        return seconds;
      }

      if (!format) {
        format = "MM/DD/YY hh:mm a";
      }

      return moment.unix(seconds).format(format);
    },
    getDtFormatted(dt, format, ignoreTimeZone = false) {
      if (!dt) {
        return dt;
      }

      if (!format) {
        format = "MM/DD/YY hh:mm a";
      }

      if (ignoreTimeZone) {
        return moment.utc(dt).format(format);
      }

      return moment(dt).format(format);
    },
    formatSeconds(seconds) {
      const formatUnit = (val, unit) =>
        val === 1 ? `${val} ${unit}` : `${val} ${unit}s`;
      const secondsInMinute = 60;
      const secondsInHour = secondsInMinute * 60;
      if (seconds < secondsInMinute) {
        return formatUnit(Math.round(seconds), "second");
      } else if (seconds < secondsInHour) {
        const remainingSeconds = Math.round(seconds % secondsInMinute);
        return remainingSeconds > 0
          ? `${formatUnit(
              Math.floor(seconds / secondsInMinute),
              "minute"
            )} ${formatUnit(remainingSeconds, "second")}`
          : formatUnit(Math.floor(seconds / secondsInMinute), "minute");
      } else {
        const minutes = Math.round((seconds % secondsInHour) / secondsInMinute);
        return minutes > 0
          ? `${formatUnit(
              Math.floor(seconds / secondsInHour),
              "hour"
            )} ${formatUnit(minutes, "minute")}`
          : formatUnit(Math.round(seconds / secondsInHour), "hour");
      }
    },
    formatPhoneNumber(str) {
      if (!str || typeof str !== 'string' || !str.replace(/\s/, '')) {
        return null;
      }

      let numbers = str.replace(/\D/g, '');
      if (numbers.length > 10 && numbers[0] === '1') {
        // skip country code added without +
        // example: someone is importing 1-512-987-8124
        numbers = numbers.substring(1);
      }

      return `+1${numbers}`;
    }
  },
};
