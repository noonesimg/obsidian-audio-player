<template>
  <div class="container" tabindex="0">
    <audio controls :src="srcPath" ref="audio" 
      @ended="setPlayIcon"
      @timeupdate="updatePos" class="my-audio"></audio>
    <div class="horiz">
      <div class="vert">
        <div class="playpause" @click="togglePlay" ref="playpause">
        </div>
        <div class="playpause seconds" @click="move(+5)" ref="add5">
          +5s
        </div>
        <div class="playpause seconds" @click="move(-5)" ref="min5">
          -5s
        </div>
      </div>
      <div class="vert wide">
        <div class="waveform">
          <div class="wv" v-for="(s, i) in filteredData" :key="srcPath+i"
            v-bind:class="{'played': i <= currentBar }"
            @mousedown="barMouseDownHandler(i)"
            :style="{
              height: s * 100 + 'px'
            }">
          </div>
        </div>
        <div class="timeline">
          <span class="current-time">
            {{ displayedCurrentTime }}
          </span>
          <span class="duration">
            {{ displayedDuration }}
          </span>
        </div>
      </div>
    </div>
    <div v-if="showInput" class="comment-input">
      <input v-model="newComment" type="text">
      <button @click="addComment">Add</button>
      <button @click="showInput = false; newComment = ''">Cancel</button>
    </div>
    <div class="comment-list">
      <AudioCommentVue @move-playhead="setPlayheadSecs" v-for="cmt in comments" :cmt="cmt" :key="cmt.timeString"></AudioCommentVue>
    </div>
  </div>
</template>

<script lang="ts">
import { TFile, setIcon, Notice, MarkdownPostProcessorContext, MarkdownSectionInformation } from 'obsidian'
import { defineComponent, PropType } from 'vue';
import { AudioComment } from 'types'

import AudioCommentVue from './AudioComment.vue';

export default defineComponent({
  name: 'App',
  components: {
    AudioCommentVue
  },
  props: {
    filepath: String,
    ctx: Object as PropType<MarkdownPostProcessorContext>,
    mdElement: Object as PropType<HTMLElement>
  },
  data() {
    return {
      toggle: false,
      items: [...Array(100).keys()],
      srcPath: '',
      filteredData: [] as number[],
      nSamples: 150,
      duration: 0,
      currentTime: 0,
      currentBar: 0,
      playing: false,
      audio: undefined as HTMLAudioElement | undefined,
      button: undefined as HTMLSpanElement | undefined,

      clickCount: 0,
      showInput: false,
      newComment: '',
      comments: [] as AudioComment[]
    }
  },
  computed: {
    displayedCurrentTime() {
      return this.convertSecs(this.currentTime);
    },
    displayedDuration() {
      return this.convertSecs(this.duration);
    }
  },
  methods: {
    async loadFile() {
      // read file from vault 
      const file = window.app.vault.getAbstractFileByPath(this.filepath) as TFile;

      // process audio file & set audio el source
      if (file && file instanceof TFile) {
        this.processAudio(file.path)
        this.srcPath = window.app.vault.getResourcePath(file);
      }
    },
    async processAudio(path: string) {
      var arrBuf = await window.app.vault.adapter.readBinary(path);
      const audioContext = new AudioContext();
      var tempArray = [] as number[];

      audioContext.decodeAudioData(arrBuf, (buf) => {
        let rawData = buf.getChannelData(0);
        this.duration = buf.duration;

        const blockSize = Math.floor(rawData.length / this.nSamples);
        for (let i = 0; i < this.nSamples; i++) {
          let blockStart = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j]);
          }
          tempArray.push(sum / blockSize);
        }
        
        let maxval = Math.max(...tempArray);
        this.filteredData = tempArray.map(x => x / maxval);
      })
    },
    scale(number: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
      return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },
    convertSecs(num: number) {
      num = Math.floor(num);
      var h = String(Math.floor(num / 3600)).padStart(2, '0');
      var m = String(Math.floor(num / 60)).padStart(2, '0');
      var s = String(Math.floor(num % 3600 % 60)).padStart(2, '0');

      return `${h}:${m}:${s}`
    },
    convertToSecs(stmp: string): number {
      var nums = stmp.split(':').map(x => Number.parseInt(x));
      return nums[2] + nums[1] * 60 + nums[0] * 3600;
    },
    barMouseDownHandler(i: number) {
      this.clickCount += 1;
      setTimeout(() => {
        this.clickCount = 0;
      }, 200);

      if (this.clickCount >= 2) {
        this.showInput = true;
      } else {
        this.setPlayhead(i);
      }
    },
    setPlayhead(i: number) {
      if (this.audio) {
        this.audio.currentTime = i / this.nSamples * this.duration;
        this.currentTime = this.audio.currentTime;
      }
      this.currentBar = i;
    },
    setPlayheadSecs(time: any) {
      if (this.audio)
        this.audio.currentTime = time;
        this.currentTime = this.audio.currentTime;
    },
    updatePos(v: Event) {
      if (this.audio)
        this.currentTime = this.audio.currentTime;
      this.currentBar = Math.floor(this.currentTime / this.duration * this.nSamples);
    },
    move(deltaSec: number) {
      if (this.audio) {
        this.audio.currentTime += deltaSec
        this.currentTime = this.audio.currentTime;
      }
    },
    togglePlay() {
      if (this.audio) {
        this.playing = this.audio.paused;
        if (this.audio?.paused) {
          this.audio?.play();
          setIcon(this.button, 'pause');
        } 
        else {
          this.audio?.pause();
          setIcon(this.button, 'play');
        } 
      }
    },
    setPlayIcon() {
      setIcon(this.button, 'play');
    },
    getSectionInfo(): MarkdownSectionInformation | null { 
      return this.ctx.getSectionInfo(this.mdElement)
    },
    addComment() {
      if (this.newComment.length == 0)
        return;

      var sectionInfo = this.getSectionInfo();

      var lines = sectionInfo.text.split('\n') as string[];
      var timeStamp = this.convertSecs(this.currentTime);
      lines.splice(sectionInfo.lineEnd, 0, `${timeStamp} --- ${this.newComment}`);

      window.app.vault.adapter.write(this.ctx.sourcePath, lines.join('\n'))
    },
    getComments() : Array<AudioComment> {
      var sectionInfo = this.getSectionInfo();
      var lines = sectionInfo.text.split('\n') as string[];
      var cmtLines = lines.slice(sectionInfo.lineStart + 2, sectionInfo.lineEnd);

      var cmts = cmtLines.map(x => {
        var split = x.split(' --- ');
        var timeStamp = this.convertToSecs(split[0]);
        var cmt: AudioComment = {
          timeNumber: timeStamp,
          timeString: split[0],
          content: split[1]
        }
        return cmt;
      });
      return cmts;
    }
  },
  mounted() {
    this.audio = this.$refs.audio as HTMLAudioElement;
    this.button = this.$refs.playpause as HTMLSpanElement;
    setIcon(this.button, 'play');
    this.loadFile();
    setTimeout(() => {
      this.comments = this.getComments();
    }, 1000);
  },
})

</script>