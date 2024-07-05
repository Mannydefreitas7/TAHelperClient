<template>
    <Button class="select-none" variant="ghost" @click="handleOnClick">
        <Loader2 class="h-4 w-4 mr-2 animate-spin" v-if="isRefreshing" />
        <ArrowPathIcon class="h-4 w-4 mr-2" v-else />
        Refresh
    </Button>
</template>

<script setup>
import { ArrowPathIcon } from "@heroicons/vue/20/solid" 
import { Loader2 } from 'lucide-vue-next'
import Button from "../atoms/button/Button.vue";
import { ref, defineEmits } from "vue"

const emit = defineEmits(['refresh']);
const isRefreshing = ref(false)
const handleOnClick = () => {
    isRefreshing.value = !isRefreshing.value;
    emit('refresh', isRefreshing)
}
</script>