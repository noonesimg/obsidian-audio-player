<template>
  <div class="horiz comment" @click.self="emitMovePlayhead">
    <div class="horiz">
      <span class="timeline" :style="{ 'marginRight': '10px', 'alignItems': 'flex-end'}">{{ cmt?.timeString }}</span>
      <span>{{ cmt?.content }}</span>
    </div>
    <div @click="emitRemove" class="delete-comment" ref="remove"></div>
  </div>
  
</template>

<script lang="ts">
import { setIcon } from 'obsidian';
import { AudioComment } from './types';
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  name: 'AudioComment',
  props: {
    cmt: Object as PropType<AudioComment>
  },
  methods: {
    emitMovePlayhead() {
      this.$emit('move-playhead', this.cmt?.timeNumber);
    },
    emitRemove() {
      this.$emit('remove', this.cmt.index);
    }
  },
  mounted() {
    this.button = this.$refs.remove as HTMLSpanElement;
    setIcon(this.button, 'cross');
  }
})

</script>