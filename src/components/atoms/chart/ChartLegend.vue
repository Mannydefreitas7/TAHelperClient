<script setup>
import { VisBulletLegend } from "@unovis/vue";
import { BulletLegend } from "@unovis/ts";
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { buttonVariants } from "@/components/atoms/button";

const props = defineProps({
  items: { type: Array, required: true, default: () => [] },
});

const emits = defineEmits(["legendItemClick", "update:items"]);

const elRef = ref();

const _items = computed(() => {
  return props.items.map(item => { 
      return {
        ...item,
        name: item.value
      }
   })
})
onMounted(() => {
  const selector = `.${BulletLegend.selectors.item}`;
  nextTick(() => {
    const elements = elRef.value?.querySelectorAll(selector);
    const classes = buttonVariants({ variant: "ghost", size: "xs" }).split(" ");
    elements?.forEach((el) =>
      el.classList.add(...classes, "!inline-flex", "!mr-2"),
    );
  });
});

function onLegendItemClick(d, i) {
  emits("legendItemClick", d, i);
  const isBulletActive = !props.items[i].inactive;
  const isFilterApplied = props.items.some((i) => i.inactive);
  if (isFilterApplied && isBulletActive) {
    // reset filter
    emits(
      "update:items",
      props.items.map((item) => ({ ...item, inactive: false })),
    );
  } else {
    // apply selection, set other item as inactive
    emits(
      "update:items",
      props.items.map((item) =>
        item.value === d.value
          ? { ...d, inactive: false }
          : { ...item, inactive: true },
      ),
    );
  }
}
</script>

<template>
  <div ref="elRef" class="w-max">
    <VisBulletLegend :items="_items" :on-legend-item-click="onLegendItemClick" />
  </div>
</template>
