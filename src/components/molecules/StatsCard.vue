<template>
   <Card class="flex items-center h-full justify-between w-full">
    <CardHeader>
      <CardTitle>{{ total }}</CardTitle>
      <CardDescription>{{ title }}</CardDescription>
    </CardHeader>
    <CardContent class="p-6">
      <component :is="icon" class="w-10 h-10" />
    </CardContent>
  </Card>
</template>

<script setup>
    import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/atoms/card"
    defineProps(['total', 'title', 'icon'])
</script>