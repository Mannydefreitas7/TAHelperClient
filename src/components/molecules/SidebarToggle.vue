<template>
    <Button variant="outline" size="icon" @click="handleOnToggle">
        <ArrowLeftIcon class="w-4 h-4 stroke-[2px] transition-transform" :class="minimized ? 'rotate-180' : 'rotate-0'"  />
    </Button>
</template>


<script setup>
    import { defineEmits } from "vue";
    import { Button } from "@/components/atoms/button";
    import { ChevronLeftIcon, ArrowLeftIcon, ArrowRightIcon } from "@heroicons/vue/24/outline";

    const emit = defineEmits(['toggle'])
    defineProps(['minimized'])
    const handleOnToggle = () => emit('toggle')
    
</script>

