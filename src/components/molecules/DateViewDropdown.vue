
<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'

import { ref } from "vue"

const value = ref("Last 7 days")

const options = [
  {
    name: "7 days",
    value: "Last 7 days"
  },
  {
    name: "30 days",
    value: "Last 30 days"
  }
]

</script>

<template>
  <Select v-model="value" class="focus:outline-none">
    <SelectTrigger class="bg-transparent border-none">
      <SelectValue class="text-neutral-700">
        {{ value }}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem v-for="(option, index) in options" :key="index" :value="option.value">
          {{ option.name }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>