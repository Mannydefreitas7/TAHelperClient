<template>
    <Card class="w-full">
        <CardHeader class="font-bold">CMS Rating</CardHeader>
        <CardContent>
            <Table>
                <TableCaption>1-2 of 2</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead class="text-right">
                            Rating
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell class="font-medium">
                            PROVIDENCE HOME HEALTH ALASKA
                        </TableCell>
                        <TableCell class="text-right">
                            <StarRating :value="4" :show-label="false" />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell class="font-medium">
                            MED1CARE, LLC
                        </TableCell>
                        <TableCell class="text-right">
                            <StarRating :value="3" :show-label="false" />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
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
import StarRating from "./StarRating.vue"
</script>
