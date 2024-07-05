<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script setup>
import axiosInstance from "axios";
import { msalInstance } from "@/boot/msal";
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { onMounted } from "vue";
import { useTenantStore } from "@/stores";

const tenantStore = useTenantStore()

const refreshAuthLogic = async failedRequest => {
      let response;
  try {
    response=await msalInstance
      .acquireTokenSilent({ scopes: import.meta.env.VITE_SCOPES.split(',') });
  } catch(error) {
    msalInstance.acquireTokenRedirect({ scopes: import.meta.env.VITE_SCOPE.split(',') });
    const response=undefined;
  }
  if(response&&response.idToken&&response.idToken.objectId) {
    localStorage.setItem("user-info", JSON.stringify(response.idToken));
    localStorage.setItem("user-info-name", response.idToken.claims.name);

    failedRequest.response.config.headers["Authorization"]=`Bearer ${response.idToken.rawIdToken}`;
    if(tenantStore.activeTenant) {
      failedRequest.response.config.headers["Tenant"]=tenantStore.activeTenant.id;
    }
  }
    }

// onMounted(() => {
//   axiosInstance.interceptors.request.use(
//       config => {
//         const account = msalInstance.getAccount();
//         const authNotSetByPinFacingPage = !config.headers["Authorization"];
//         if (account && authNotSetByPinFacingPage) {
//             const idToken = JSON.parse(localStorage.getItem("user-info"));
//             config.headers["Authorization"] = `Bearer ${idToken.rawIdToken}`;
//         }
//         config.headers["Company"] = import.meta.env.VITE_COMPANY;
//         if (tenantStore.activeTenant) {
//           config.headers["Tenant"] = tenantStore.activeTenant.id;
//         }
//         return config;
//       },
//       error => {
//           //this.$q.loading.hide();
//           return Promise.reject(error);
//         }
//     )

//       axiosInstance.interceptors.response.use(
//         response => {
//       //    this.$q.loading.hide();
//           return response;
//         },
//         error => {
//         //  this.$q.loading.hide();
//           return Promise.reject(error);
//         }
//     )

//     createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic);
// }) 

</script>
