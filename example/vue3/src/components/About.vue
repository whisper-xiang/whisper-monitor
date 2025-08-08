<template>
  <div class="container">
    <button @click="handleClick">自定义上报</button>
  </div>
</template>
<script setup lang="ts">
import { getCurrentInstance } from "vue";
const instance = getCurrentInstance();
const handleClick = () => {
  instance.proxy.$tracker.report({
    type: 0,
    data: {
      target: "button",
      action: "click",
    },
  });
  console.log(instance, "fuck");
};
</script>
<style lang="scss" scoped></style>
