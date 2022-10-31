<template>
  <div @click="test" class="container" :style="{
    backgroundColor: toggle ? 'red' : 'gold'
  }">
  </div>
</template>

<script lang="ts">
import { Notice } from 'obsidian'
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  data() {
    return {
      toggle: false
    }
  },
  methods: {
    test() {
      this.toggle = !this.toggle;
      new Notice("test from vue");
    }
  }
})

</script>