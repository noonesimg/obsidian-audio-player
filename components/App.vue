<template>
  <div @click="test" class="container">
    <audio controls src="Music/04. Arabella.mp3"></audio>
    <div class="waveform">
      <div class="wv" v-for="i in items" :key="'item_'+i">
      </div>
    </div>
    
  </div>
</template>

<script lang="ts">
import { Notice, Vault } from 'obsidian'
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  data() {
    return {
      toggle: false,
      items: [...Array(100).keys()]
    }
  },
  methods: {
    test() {
      new Notice(String(window.app.vault.getAbstractFileByPath("Music/Files/test.mp3")?.path));
      this.toggle = !this.toggle;
    }
  }
})

</script>