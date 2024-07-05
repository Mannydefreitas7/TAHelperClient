<template>
    <Card class="w-full">
        <CardHeader class="font-bold">Response Rate</CardHeader>
        <CardContent >
            <BarChart
                :data="data"
                index="date"
                type="grouped"
                :customTooltip="ResponseRateChartTooltip"
                :categories="categories"
                :rounded-corners="4"
                :colors="['cornflowerBlue', 'darkseagreen', 'indianred']"
            />
        </CardContent>
    </Card>
</template>

<script setup>
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/atoms/card'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/atoms/table'
import { BarChart } from '@/components/atoms/chart-bar'
import ResponseRateChartTooltip from './ResponseRateChartTooltip.vue';

const data = [
  { date: '05-25-2024', incoming: Math.floor(Math.random() * 2000) + 500, outgoing: Math.floor(Math.random() * 2000) + 500, immediate: Math.floor(Math.random() * 2000) + 500 },
  { date: '05-26-2024', incoming: Math.floor(Math.random() * 2000) + 500, outgoing: Math.floor(Math.random() * 2000) + 500, immediate: Math.floor(Math.random() * 2000) + 500 },
  { date: '05-27-2024', incoming: Math.floor(Math.random() * 2000) + 500, outgoing: Math.floor(Math.random() * 2000) + 500, immediate: Math.floor(Math.random() * 2000) + 500 },
  { date: '05-28-2024', incoming: Math.floor(Math.random() * 2000) + 500, outgoing: Math.floor(Math.random() * 2000) + 500, immediate: Math.floor(Math.random() * 2000) + 500 },
  { date: '05-29-2024', incoming: Math.floor(Math.random() * 2000) + 500, outgoing: Math.floor(Math.random() * 2000) + 500, immediate: Math.floor(Math.random() * 2000) + 500 },
  { date: '05-30-2024', incoming: Math.floor(Math.random() * 2000) + 500, outgoing: Math.floor(Math.random() * 2000) + 500, immediate: Math.floor(Math.random() * 2000) + 500 },
  { date: '05-31-2024', incoming: Math.floor(Math.random() * 2000) + 500, outgoing: Math.floor(Math.random() * 2000) + 500, immediate: Math.floor(Math.random() * 2000) + 500 },
]

const categories = [
    {
        label: "Incoming Messages (All replies)",
        name: "incoming"
    },
    {
        label: "Outgoing Messages",
        name: "outgoing"
    },
    {
        label: "Immediate Attention Required",
        name: "immediate"
    },

]

</script>
