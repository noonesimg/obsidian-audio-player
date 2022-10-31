<template>
  <div @click="test" class="container" :style="{
    backgroundColor: toggle ? 'red' : 'gold'
  }">
    <div class="items" v-for="i in items" :key="'item_'+i">
    </div>
  </div>
</template>

<script lang="ts">
import { Notice } from 'obsidian'
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  data() {
    return {
      toggle: false,
      items: [1,2,3,4,5,6,7,8,9,10]
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