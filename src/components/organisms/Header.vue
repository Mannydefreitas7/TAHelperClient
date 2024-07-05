<template>
    <div class="h-16 z-20 bg-white justify-between flex px-4 items-center border-b-2 border-neutral-100 fixed top-0 left-0 w-full">
        <div class="flex items-center gap-2">
            <img :src="logo" class="w-8 h-8" /><span class="text-xl tracking-wide font-medium text-fuchsia-800">ALITA</span>
        </div>
        <div class="flex items-center gap-3">
            <Combobox :options="options" :icon="HomeModernIcon" title="Tenants" v-model="activeTenant" />
            <AccountDropdown :user="user" />
            <AppearanceDropdown />
        </div>
    </div>
</template>


<script setup>
    import { AccountDropdown } from "@/components";
    import { Combobox, AppearanceDropdown } from "@/components/molecules"
    import { HomeModernIcon } from "@heroicons/vue/24/solid"
    import logo from "@/assets/logo.png"
    import { computed, onMounted } from "vue"
    import { useTenantStore } from "@/stores";
    import { storeToRefs } from "pinia";
    const tenantStore = useTenantStore()

    const { tenants, activeTenant, user } = storeToRefs(tenantStore)

    const options = computed(() => {
        return tenants.value.map(tenant => {
            return {
                label: tenant.name,
                value: tenant.id
            }
        })
    })


</script>