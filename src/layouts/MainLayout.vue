<template>
  <div>
    <!-- Header -->
    <Header />
    <!-- Sidebar -->
    <Sidebar />
    <!-- Body -->
    <div class="pt-16 transition-all ease-in-out" :class="sidebarMinized ? 'ml-16' : 'ml-72'">
      <div class="p-6">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { msalInstance } from "@/boot/msal";
import axios from "axios";
import { useTenantStore, useLayoutStore } from "@/stores";
import { version as clientVersion } from "../../package.json";
import moment from "moment";
import { Header, Sidebar } from "@/components";

import { computed, onMounted, onActivated, ref, reactive } from "vue";
import { storeToRefs } from "pinia";


const tenantStore = useTenantStore()
const { user, activeTenant } = storeToRefs(tenantStore)
const { loadCurrentUser, loadTenants, selectTenant } = tenantStore

const layoutStore = useLayoutStore()
const { sidebarMinized } = storeToRefs(layoutStore) 

const leftDrawerOpen = ref(false)

const thisYear = moment().format("YYYY")
const searchTerm = ref(null)
const serverVersion = ref(null)


const menuItems = reactive([
  {
    name: "Dashboard",
    icon: "o_dashboard",
    route: "/",
    clickable: true,
  },
  {
    name: "Outgoing",
    clickable: false,
  },
  {
    name: "Campaign",
    icon: "o_campaign",
    route: "/Campaign",
    size: "29px",
    clickable: true
  },
  {
    name: "Chat",
    icon: "o_forum",
    route: "/Chat",
    clickable: true
  },
  {
    name: "Contact",
    icon: "o_contacts",
    route: "/Contact",
    clickable: true
  },
  {
    name: "Incoming",
    clickable: false,
  },
  {
    name: "Compliance",
    icon: "o_gpp_good",
    route: "/Compliance",
    clickable: true
  },
  {
    name: "Document",
    icon: "o_description",
    route: "/Document",
    clickable: true
  },
  {
    name: "Forms",
    icon: "o_edit_note",
    route: "/Forms",
    clickable: true
  },
  {
    name: "Hires",
    icon: "o_person_add",
    route: "/HR",
    clickable: true
  },
  {
    name: "Survey",
    icon: "o_fact_check",
    route: "/Surveys",
    clickable: true
  },
  {
    name: "Task",
    icon: "o_task",
    route: "/tasks",
    clickable: true
  },
  {
    name: "Timekeeping",
    icon: "o_date_range",
    route: "/Timekeeping",
    clickable: true
  },
  {
    name: "Report",
    icon: "o_poll",
    route: "/Report",
    clickable: true
  },
  {
    name: "Automation",
    icon: "o_precision_manufacturing",
    route: "/Automation",
    clickable: true,
    orgAdmin: true,
    hidden: import.meta.env.AUTOMATION_ENABLED != 'true',
  },
  {
    name: "Integration",
    icon: "o_handyman",
    route: "/Integration",
    clickable: true
  }
])

const availableTenants = computed(() => {
  return user.tenants.filter(
    tenant => !searchTerm.value
      || tenant.name?.toLowerCase().indexOf(searchTerm.value.toLowerCase()) > -1);
})

const availableLinks = computed(() => {
  return menuItems.filter(f => {
    if (f.orgAdmin && !user?.orgAdmin) {
      return false;
    }
    if (f.hidden) {
      return false;
    }
    return true;
  });
})

const routeRecords = computed(() => {
  const foundRoutes = $route.matched.filter(
    route => route.name || route.meta.label
  );

  return foundRoutes || [];
})

const toggleDrift = (name) => {
  if (!import.meta.env.DEV) {
    if (name === "Help") {
      $drift.show();
      return;
    }
    $drift.hide();
  }
}

const getServerVersion = async () => {
  const { data } = await axios.get(`${import.meta.env.BASE_URL}/user/version`);
  serverVersion.value = data;
}

const goTo = (route) => {
  $router.push(route);
}

const logout = () => {
  msalInstance.logout();
}

const getName = (item) => {
  let label = null;
  if (item && item.meta && item.meta.label) {
    label = item.meta.label;
  } else if (item) {
    label = item.name || null;
    if (item.path === "/:id") {
      label = $route.params.id;
    }
  } else if ($route.params.id) {
    label = $route.params.id;
  }

  return label;
}

onActivated(() => {
  toggleDrift($route.fullPath.substring(1));
})

onMounted(async () => {
 await loadTenants();
 //  await getServerVersion();
 await loadCurrentUser();
})

</script>
