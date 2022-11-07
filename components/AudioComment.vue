<template>
  <div class="comment" @click="emitMovePlayhead">
    {{ cmt?.timeString }} - {{ cmt?.content }}
  </div>
</template>

<script lang="ts">
import { AudioComment } from 'types';
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  name: 'AudioComment',
  props: {
    cmt: Object as PropType<AudioComment>
  },
  methods: {
    emitMovePlayhead() {
      this.$emit('move-playhead', this.cmt?.timeNumber);
    }
  },
})

</script>