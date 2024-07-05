<script setup>
import { Check, ChevronsUpDown } from 'lucide-vue-next'

import { ref, defineModel, defineProps } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/button'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/atoms/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/atoms/popover'


defineProps(['options', 'search', 'icon', 'title'])
const open = ref(false)
const value = defineModel()
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="max-w-[220px] justify-between"
      >
        <component :is="icon" class="h-4 w-4 mr-2" />
        {{ value ? options.find((option) => option.value === value.value)?.label : 'Select Tenant...' }}
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[190px] p-0" align="end">
      <Command v-model="value">
        <CommandInput v-if="search" placeholder="Search..." />
        <CommandEmpty>No {{ title }} found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="option in options"
              :key="option.value"
              :value="option"
              @select="open = false"
              class="cursor-pointer"
            >
              <Check
                :class="cn(
                  'mr-2 h-4 w-4',
                  value && value.value === option.value ? 'opacity-100' : 'opacity-0',
                )"
              />
              {{ option.label }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>