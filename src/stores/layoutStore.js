import { defineStore } from "pinia";
import { ref } from "vue";


export const useLayoutStore = defineStore("layout", () => {
    const sidebarMinized = ref(false);
    const toggleSidebar = () => {
       
        sidebarMinized.value = !sidebarMinized.value;

        console.log('layout store', sidebarMinized.value)
    }
    return {
        sidebarMinized,
        toggleSidebar
    }
})