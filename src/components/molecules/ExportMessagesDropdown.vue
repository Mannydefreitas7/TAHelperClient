<script setup>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'
import {
    Button
} from "@/components/atoms/button"

import { ref, watch } from 'vue'
import {
  DateFormatter,
  getLocalTimeZone
} from '@internationalized/date'

import { onClickOutside } from '@vueuse/core'

import { Calendar } from '@/components/atoms/calendar'
import { CalendarIcon } from "@heroicons/vue/24/solid"
import { ChevronDownIcon } from "@heroicons/vue/16/solid"

const today = Date.now()
const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

const showCalendar = ref(false)
const value = ref()
const open = ref(false)
const target = ref(null)

// Listens to see if dropdown was closed
watch(open.value, (newValue) => {
  if (newValue === false) {
    setTimeout(() => showCalendar.value = false, 500)
  }
})

// Listens to see if date was changed and clicked
watch(value, () => showCalendar.value = false)

onClickOutside(target, event => {
  open.value = false
})

</script>

<template>
  <DropdownMenu :open="open || showCalendar">
    <DropdownMenuTrigger as-child>
        <Button @click="open = true" variant="ghost" class="pr-2 gap-1">Export Messages <ChevronDownIcon class="h-4" /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent ref="target" align="end" class="min-w-[200px]">
      <template v-if="showCalendar">
          <Calendar v-model="value" :weekday-format="'short'" />
      </template>
      <template v-else>
        <DropdownMenuItem class="cursor-pointer">
            Today
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer">
            Last 7 days
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer">
            Last 30 days
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer">
            All Time
      </DropdownMenuItem>
     <DropdownMenuSeparator />
      <DropdownMenuItem @click="showCalendar = true" class="flex items-center justify-between gap-2 cursor-pointer">
        Select Date...
        <CalendarIcon class="h-4"  />
      </DropdownMenuItem >
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>