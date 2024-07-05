<script setup>
import { cn } from "@/lib/utils";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    :class="
      cn(
        'rounded-lg border bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 shadow-sm',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
