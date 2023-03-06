<template>
  <div class="comment" @click="emitMovePlayhead">
    <span class="timestamp">{{ cmt?.timeString }}</span>
    <span class="content">{{ cmt?.content }}</span>
  </div>
  
</template>

<script lang="ts">
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
})

</script>