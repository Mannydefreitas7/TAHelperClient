<script setup>
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";

const { data } = defineProps({
  title: { type: String, required: false },
  data: { type: Array, required: true },
});

</script>

<template>
  <Card class="text-sm overflow-hidden">
    <CardHeader v-if="title" class="p-2 border-b bg-neutral-100">
      <CardTitle class="text-xs">
        {{ title }}
      </CardTitle>
    </CardHeader>
    <CardContent class="p-3 min-w-[180px] flex flex-col gap-1">
      <div v-for="(item, key) in data" :key="key" class="flex justify-between">
        <div class="flex items-center">
          <span class="w-2.5 h-2.5 mr-2">
            <svg width="100%" height="100%" viewBox="0 0 30 30">
              <path
                d=" M 15 15 m -14, 0 a 14,14 0 1,1 28,0 a 14,14 0 1,1 -28,0"
                :stroke="item.color"
                :fill="item.color"
                stroke-width="1"
              />
            </svg>
          </span>
          <span class="text-xs">{{ item.name }}</span>
        </div>
        <span class="font-semibold ml-4 text-xs">{{ item.value }}</span>
      </div>
    </CardContent>
  </Card>
</template>