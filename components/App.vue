<template>
  <div class="container" @keydown.space="togglePlay" tabindex="0">
    <audio controls :src="srcPath" ref="audio" 
      @ended="setPlayIcon"
      @timeupdate="updatePos" class="my-audio"></audio>
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
          @mousedown="setPlayhead($event, i)"
          :style="{
            height: s + 'px'
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
</template>

<script lang="ts">
import { TFile, setIcon } from 'obsidian'
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  props: {
    filepath: String
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
      button: undefined as HTMLSpanElement | undefined
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
          sum = this.scale(sum, 0, .5, 0, 200);
          this.filteredData.push(sum / blockSize);
        }
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
    setPlayhead(ev: MouseEvent, i: number) {
      if (this.audio) {
        this.audio.currentTime = i / this.nSamples * this.duration;
        this.currentTime = this.audio.currentTime;
      }
      console.log(this.currentBar);
      this.currentBar = i;
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
    }
  },
  mounted() {
    this.audio = this.$refs.audio as HTMLAudioElement;
    this.button = this.$refs.playpause as HTMLSpanElement;
    setIcon(this.button, 'play');
    this.loadFile();
  }
})

</script>