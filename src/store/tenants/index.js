import { axiosInstance } from "boot/axios";
import { date } from "quasar"

export default {
  namespaced: true,
  state: () => ({
    user: null,
    userEmail: null,
    users: [],
    tenants: [],
    activeTenant: null,
  }),
  getters: {
    user: state => {
      return state.user;
    },
    userEmail: state => {
      return state.userEmail;
    },
    users: state => {
      return state.users;
    },
    tenants: state => {
      return state.tenants;
    },
    activeTenant: state => {
      return state.activeTenant;
    }
  },
  actions: {
    loadTenants: async context => {
      return new Promise(resolve => {
        axiosInstance
          .get(`${process.env.root.BASE_URL}/user/tenants`)
          .then(response => {
            let tenants = [];
            const { data } = response;
            for (const tenant of data) {
              const twentyFourHourStart = date.extractDate(
                tenant.campaignPauseStart,
                "HH:mm"
              );
              const twentyFourHourStop = date.extractDate(
                tenant.campaignPauseEnd,
                "HH:mm"
              );
              tenant.campaignPauseStart = tenant.campaignPauseStart ? date.formatDate(twentyFourHourStart, "hh:mm a") : null;
              tenant.campaignPauseEnd = tenant.campaignPauseEnd ? date.formatDate(twentyFourHourStop, "hh:mm a") : null;
              tenants.push(tenant)
            }

            context.commit("SET_TENANTS", tenants);

            if (context.state.activeTenant == null) {
              const lastActiveTenantId = parseInt(localStorage.getItem("lastActiveTenantId"));
              let activeTenant = tenants.find(tenant => tenant.id === lastActiveTenantId);
              if (activeTenant === undefined) {
                activeTenant = tenants[0];
              }

              context.commit("SET_ACTIVE_TENANT", activeTenant);
            }
            
            context.dispatch("getUsers");
            resolve(tenants);
          });
      });
    },
    getUsers: async context => {
      axiosInstance
        .get(`${process.env.root.BASE_URL}/user/invited-users`)
        .then(response => {
          const { data } = response;
          context.commit("SET_USERS", data);
        });
    },
    setTeamMembers: async context => {
      return new Promise(resolve => {
        axiosInstance
          .get(`${process.env.root.BASE_URL}/user/invited-users`)
          .then(response => {
            const { data } = response;
            context.commit("SET_USERS", data);
            resolve({ data });
          });
      });
    },
    selectTenant: async (context, tenant) => {
      context.dispatch("loadTenants").then(response => {
        if (context.state.tenants.some(f => f.id === tenant.id)) {
          localStorage.removeItem("lastSelectedCampaign");

          context.commit("SET_ACTIVE_TENANT", tenant);
          context.dispatch("loadCurrentUser");
          context.dispatch("getUsers");
        }
      });
    },
    addUser: async (context, userEmail) => {
      return new Promise(resolve => {
        if (context.state.users.some(f => f.userEmail === userEmail)) {
          return;
        }

        axiosInstance
          .post(`${process.env.root.BASE_URL}/user/invite/${userEmail}`)
          .then(response => {
            const { data } = response;
            if (data) {
              context.commit("UPDATE_USER", data);
            }
            resolve(data);
          });
      });
    },
    deleteUser: async (context, userId) => {
      return new Promise(resolve => {
        if (!context.state.users.some(f => f.id === userId)) {
          return;
        }

        axiosInstance
          .post(`${process.env.root.BASE_URL}/user/remove/${userId}`)
          .then(response => {
            const { data } = response;
            context.commit("DELETE_USER", userId);
            resolve(data);
          });
      });
    },
    toggleOwnerUser: async (context, userId) => {
      return new Promise(resolve => {
        axiosInstance
          .put(`${process.env.root.BASE_URL}/user/toggle-owner/${userId}`)
          .then(() => {
            context.dispatch("getUsers");
            resolve();
          });
      });
    },
    saveTenantLogo: async (context, payload) => {
      return new Promise(resolve => {
        const endpoint = `${process.env.root.BASE_URL}/user/update-tenant-logo`;
        const options = { headers: {"Content-Type": "multipart/form-data"} };
        axiosInstance.post(endpoint, payload, options).then(response => {
          const { data } = response;
          resolve(data);
        });
      });
    },
    saveTenant: async (context, payload) => {
      return new Promise(resolve => {
        axiosInstance
          .put(`${process.env.root.BASE_URL}/user/update-tenant/`, payload)
          .then(response => {
            const { data } = response;
            context.commit("UPDATE_TENANT", data.tenant);
            context.dispatch("selectTenant", data.tenant);
            resolve(data);
          });
      });
    },
    loadCurrentUser: async (context) => {
      return new Promise(resolve => {
        axiosInstance
          .get(`${process.env.root.BASE_URL}/user/current-user`)
          .then(response => {
            const { data } = response;
            context.commit("SET_USER", data);
            context.commit("SET_USER_EMAIL", data.userEmail);
            resolve(data);
          });
      });
    },
  },
  mutations: {
    SET_USER: (state, value) => {
      state.user = {...value, tenantOwner: Boolean(value.tenantOwner)};
    },
    SET_USER_EMAIL: (state, value) => {
      state.userEmail = value;
    },
    SET_USERS: (state, value) => {
      state.users = value;
    },
    UPDATE_USER: (state, value) => {
      const userIdx = state.users.findIndex(f => f.id === value.id);
      if (userIdx < 0) {
        state.users.push(value);
      } else {
        state.users[userIdx] = value;
      }
    },
    DELETE_USER: (state, value) => {
      state.users.splice(
        state.users.findIndex(item => item.id == value),
        1
      );
    },
    SET_TENANTS: (state, value) => {
      state.tenants = value;
    },
    SET_ACTIVE_TENANT: (state, value) => {
      state.activeTenant = value;
      localStorage.setItem("lastActiveTenantId", value?.id);
    },
    UPDATE_TENANT: (state, value) => {
      const tenantIdx = state.tenants.findIndex(f => f.id === value.id);
      if (tenantIdx < 0) {
        state.tenants.push(value);
      } else {
        const twentyFourHourStart = date.extractDate(
          value.campaignPauseStart,
          "HH:mm"
        );
        const twentyFourHourStop = date.extractDate(
          value.campaignPauseEnd,
          "HH:mm"
        );
        value.campaignPauseStart = value.campaignPauseStart ? date.formatDate(twentyFourHourStart, "hh:mm a") : null;
        value.campaignPauseEnd = value.campaignPauseEnd ? date.formatDate(twentyFourHourStop, "hh:mm a") : null;

        state.tenants[tenantIdx] = value;
      }
    }
  }
};