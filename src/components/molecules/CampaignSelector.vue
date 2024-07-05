<script lang="ts" setup>
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'

import MegaphoneIcon from "@heroicons/vue/24/outline/MegaphoneIcon"
</script>

<template>
  <Select>
    <SelectTrigger class="w-[280px] !h-14">
      <div class="flex items-center gap-2">
        <MegaphoneIcon class="h-6" />
        <div class="flex flex-col justify-start items-start"> 
          <span class="text-xs text-neutral-400">Campaign</span>
          <SelectValue placeholder="Select a campaign" />
        </div>
      </div>
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem text-value="est" value="est" class="cursor-pointer">
          (0) Bosen Survey
        </SelectItem>
        <SelectItem value="est1" class="cursor-pointer">
          (1) test Survey
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>