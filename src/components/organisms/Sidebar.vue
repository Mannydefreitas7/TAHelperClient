<template>
    <div class="top-16 border-r-2 bg-white border-neutral-100 overflow-scroll fixed transition-all ease-in-out" style="height: calc(100% - 128px)" :class="sidebarMinized ? 'w-16' : 'w-72'">
        <div class="p-2">
            <template v-for="(category, index) in Object.keys(navigationsLinks)" :key="index">
                <div>
                    <div class="flex items-center p-3" v-show="category !== 'general' && !sidebarMinized">
                        <span class="text-sm text-neutral-400 capitalize">{{ category }}</span>
                    </div>
                    
                    <div v-for="(link, index) in navigationsLinks[category]" :key="index" class="flex items-center p-3 gap-2 cursor-pointer rounded hover:bg-fuchsia-50">
                        <component :is="link.icon" class="w-6 h-6" />
                        <span v-if="!sidebarMinized" class="text-sm">{{ link.name }}</span>
                    </div>
                </div>
            </template>
        </div>
        <div class="fixed border-r-2 border-t-2 border-neutral-100 bottom-0 flex items-center justify-between left-0 backdrop-blur-md bg-white/40 p-3" :class="sidebarMinized ? 'w-16' : 'w-72'">
            <p v-show="!sidebarMinized" class="text-sm text-neutral-500 delay-150">&copy; Alita Systems {{ thisYear }}</p>
            <SidebarToggle @toggle="toggleSidebar" :minimized="sidebarMinized" />
        </div>
    </div>
</template>

<script setup>
    import { groupBy } from "lodash";
    import { reactive, computed } from "vue"
    import moment from "moment";
    import { SidebarToggle } from "@/components"
    import { ClockIcon, DocumentCheckIcon, ClipboardDocumentListIcon, UserGroupIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, ShieldCheckIcon, IdentificationIcon, MegaphoneIcon, WrenchScrewdriverIcon, Squares2X2Icon, SparklesIcon, ChartBarIcon, VideoCameraIcon } from "@heroicons/vue/24/outline";
    import { useLayoutStore } from "@/stores"
    import { storeToRefs } from 'pinia'
    const layoutStore = useLayoutStore()
    const { sidebarMinized } = storeToRefs(layoutStore)
    const { toggleSidebar } = layoutStore
    const thisYear = moment().format("YYYY")
    const links = reactive([
        {
            icon: Squares2X2Icon,
            name: "Dashboard",
            group: "general"
        },
        {
            icon: SparklesIcon,
            name: "Automation",
            group: "general"
        },
        {
            icon: VideoCameraIcon,
            name: "Virtual Visit",
            group: "general"
        },
        {
            icon: ChartBarIcon,
            name: "Report",
            group: "general"
        },
        {
            icon: WrenchScrewdriverIcon,
            name: "Integration",
            group: "general"
        },
        {
            icon: MegaphoneIcon,
            name: "Campaign",
            group: "outgoing"
        },
        {
            icon: ChatBubbleLeftRightIcon,
            name: "Chat",
            group: "outgoing"
        },
        {
            icon: IdentificationIcon,
            name: "Contact",
            group: "outgoing"
        },
        {
            icon: ShieldCheckIcon,
            name: "Compliance",
            group: "incoming"
        },
        {
            icon: DocumentTextIcon,
            name: "Document",
            group: "incoming"
        },
        {
            icon: ClipboardDocumentListIcon,
            name: "Form",
            group: "incoming"
        },
        {
            icon: UserGroupIcon,
            name: "Human Resources",
            group: "incoming"
        },
        {
            icon: DocumentCheckIcon,
            name: "Survey",
            group: "incoming"
        },
        {
            icon: ClockIcon,
            name: "Timekeeping",
            group: "incoming"
        }
    ])

    const navigationsLinks = computed(() => {
        const groupedByGroup = groupBy(links, (link) => link.group)
        return groupedByGroup
    })

</script>