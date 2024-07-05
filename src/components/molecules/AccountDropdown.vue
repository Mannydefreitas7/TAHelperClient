<script setup>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'

import { UserCircleIcon } from "@heroicons/vue/24/solid"
import { BuildingOffice2Icon, UsersIcon, ArrowLeftEndOnRectangleIcon, BuildingOfficeIcon, UserIcon } from "@heroicons/vue/24/outline"

defineProps(['user'])
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
        <div class="flex items-center min-w-10 gap-2 border pl-3 pr-2 py-1.5 rounded-md">
            <span v-if="user" class="text-sm">{{ user.userName }}</span>
            <UserCircleIcon class="h6 w-6" />
        </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="min-w-[200px]">
      <DropdownMenuLabel class="text-sm font-normal text-neutral-400">Settings</DropdownMenuLabel>
      <DropdownMenuItem class="flex items-center gap-2 cursor-pointer">
        <div class="bg-fuchsia-900 h-8 w-8 p-1.5 rounded-full">
            <BuildingOfficeIcon class="text-white" />
        </div>
        <div class="flex flex-col">
            <span>Account</span>
            <span class="text-xs text-neutral-400">Edit your account</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem class="flex items-center gap-2 cursor-pointer">
        <div class="bg-fuchsia-900 h-8 w-8 p-1.5 rounded-full">
            <UserIcon class="text-white" />
        </div>
        <div class="flex flex-col">
            <span>My Profile</span>
            <span class="text-xs text-neutral-400">Edit your profile</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuLabel v-if="user && user.orgAdmin" class="text-sm font-normal text-neutral-400">Admin</DropdownMenuLabel>
      <DropdownMenuItem  v-if="user && user.orgAdmin" class="flex items-center gap-2 cursor-pointer">
        <div class="bg-fuchsia-900 h-8 w-8 p-1.5 rounded-full">
            <BuildingOffice2Icon class="text-white" />
        </div>
        <div class="flex flex-col">
            <span>Accounts</span>
            <span class="text-xs text-neutral-400">Edit accounts</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem  v-if="user && user.orgAdmin" class="flex items-center gap-2 cursor-pointer">
        <div class="bg-fuchsia-900 h-8 w-8 p-1.5 rounded-full">
            <UsersIcon class="text-white" />
        </div>
        <div class="flex flex-col">
            <span>Users</span>
            <span class="text-xs text-neutral-400">Edit users</span>
        </div>
      </DropdownMenuItem >
      <DropdownMenuLabel class="text-sm font-normal text-neutral-400">Session</DropdownMenuLabel>
      <DropdownMenuItem class="flex items-center gap-2 cursor-pointer">
        <div class="bg-fuchsia-900 h-8 w-8 p-1.5 rounded-full">
            <ArrowLeftEndOnRectangleIcon class="text-white" />
        </div>
        <div class="flex flex-col">
            <span>Logout</span>
            <span class="text-xs text-neutral-400">Securely end your session</span>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>