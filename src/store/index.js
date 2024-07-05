import tenants from "./tenants"
import shared from "./shared"

export default new Vuex.Store({
  // enable strict mode (adds overhead!)
  // for dev mode only
  modules: {
    tenants,
    shared
  },
  strict: process.env.DEV
});
