import { ref, computed } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { useDateFormat } from "@vueuse/core";
import { tenantService } from "@/services";


function formatTenant(tenant) {
  const twentyFourHourStart = useDateFormat(
    tenant.campaignPauseStart,
    "HH:mm",
  );
  const twentyFourHourStop = useDateFormat(
    tenant.campaignPauseEnd,
    "HH:mm",
  );
  tenant.campaignPauseStart = tenant.campaignPauseStart
    ? useDateFormat(twentyFourHourStart, "hh:mm a")
    : null;
  tenant.campaignPauseEnd = tenant.campaignPauseEnd
    ? useDateFormat(twentyFourHourStop, "hh:mm a")
    : null;
  return tenant;
}

export const useTenantStore = defineStore("tenant", () => {
  const user = ref({ tenants: [] });
  const invitedUsers = ref([]);
  const activeTenant = ref(user.value.tenants.find((tenant) => !!tenant.active))
  const tenants = ref([])
  async function loadCurrentUser() {
    const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/current-user`);
    data.tenants = data.tenants.map(formatTenant);
    user.value = data;
    if (!!user.value.tenants.length && !activeTenant.value) {
      const foundTenant = localStorage.getItem("lastActiveTenantId") || user.value.tenants[0];
      selectTenant(foundTenant);
    }
  }

  async function selectTenant(payload) {
    if (!user.value.tenants) {
      await loadCurrentUser();
    }

    localStorage.removeItem("lastSelectedCampaign");
    localStorage.setItem("lastActiveTenantId", payload?.id);

    user.value.tenants.forEach((tenant) => {
      if (tenant.id === payload.id) {
        tenant.active = true;
      } else {
        tenant.active = false;
      }
    });
  }

  async function loadTenants() {

    const data  = await tenantService.fetch()

    tenants.value = data.map(tenant => {

        const twentyFourHourStart = useDateFormat(
          tenant.campaignPauseStart,
          "HH:mm"
        );
        const twentyFourHourStop = useDateFormat(
          tenant.campaignPauseEnd,
          "HH:mm"
        );

        tenant.campaignPauseStart = tenant.campaignPauseStart ? useDateFormat(twentyFourHourStart, "hh:mm a") : null;
        tenant.campaignPauseEnd = tenant.campaignPauseEnd ? useDateFormat(twentyFourHourStop, "hh:mm a") : null;

        if (activeTenant.value == null) {
            const lastActiveTenantId = parseInt(localStorage.getItem("lastActiveTenantId"));
            let _activeTenant = data.find(tenant => tenant.id === lastActiveTenantId);
            if (_activeTenant === undefined) {
              _activeTenant = tenants[0];
              activeTenant.value = _activeTenant;
            }
        }
        return tenant
    })
  }


  async function getInvitedUsers() {
    try {
      const response = await tenantService.getInvitedUsers()
      invitedUsers.value = response;
    } catch (error) {
      console.log(error)
    }
  }

  async function toggleOwnerUser(userId) {
    await axios.put(`${import.meta.env.BASE_URL}/user/toggle-owner/${userId}`);
    await loadCurrentUser();
  }

  async function saveTenantLogo(payload) {
    const endpoint = `${import.meta.env.BASE_URL}/user/update-tenant-logo`;
    const options = { headers: {"Content-Type": "multipart/form-data"} };
    const { data } = await axios.post(endpoint, payload, options);
    return data;
  }

  async function saveTenant(payload) {
    const { data } = await axios.put(`${import.meta.env.BASE_URL}/user/update-tenant/`, payload);
    const index = user.value.tenants.findIndex(tenant => tenant.id === data.tenant.id);
    if (index > -1) {
      user.value.tenants.splice(index, 1, formatTenant(data.tenant));
    }
    await selectTenant(data.tenant);
    return data;
  }

  return {
    user,
    activeTenant,
    selectTenant,
    getInvitedUsers,
    loadTenants,
    tenants,
    invitedUsers,
    loadCurrentUser,
    toggleOwnerUser,
    saveTenantLogo,
    saveTenant
  };
});
