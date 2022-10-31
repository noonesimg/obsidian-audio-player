<template>
  <h2 @click="test">Hello,Developer!</h2>
</template>

<script lang="ts">
import { Notice } from 'obsidian'
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  methods: {
    test() {
      new Notice("test from vue");
    }
  }
})

</script>