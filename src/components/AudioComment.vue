<template>
  <div class="comment">
    <span class="timestamp" @click="emitMovePlayhead">{{ cmt?.timeString }}</span>
    <span class="content">{{ cmt?.content }}</span>
    <div @click="emitRemove" class="delete-comment" ref="remove"></div>
  </div>
  
</template>

<script lang="ts">
import { setIcon } from 'obsidian';
import { AudioComment } from '../types';
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