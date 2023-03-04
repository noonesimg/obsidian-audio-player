<template>
  <div class="audio-player-ui" tabindex="0">
    <div class="horiz">
      <div v-show="!smallSize" class="vert">
        <div class="playpause" @click="togglePlay" ref="playpause">
        </div>
        <div class="playpause seconds" @click="setPlayheadSecs(currentTime+5)" ref="add5">
          +5s
        </div>
        <div class="playpause seconds" @click="setPlayheadSecs(currentTime-5)" ref="min5">
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
      <div v-show="!smallSize" class="vert">
        <div class="bookmarkButton" @click="onBookMarkClicked" ref="bookmarkButton">
        </div>
      </div>
    </div>
    <div v-show="smallSize" class="horiz" :style="{'margin': 'auto'}">
      <div class="playpause seconds" @click="setPlayheadSecs(currentTime-5)" ref="min5">
        -5s
      </div>
      <div class="playpause play-button" @click="togglePlay" ref="playPauseSmall">
      </div>
      <div class="playpause seconds" @click="setPlayheadSecs(currentTime+5)" ref="add5">
        +5s
      </div>
    </div>
    <div v-if="showInput" class="comment-input">
      <input v-model="newComment" 
        @keydown.escape="showInput = false; newComment = ''" type="text" ref="commentInput"
        @keydown.enter="addComment">
      <button @click="addComment">Add</button>
      <button @click="showInput = false; newComment = ''">Cancel</button>
    </div>
    <div class="comment-list">
      <AudioCommentVue v-for="cmt in commentsSorted" 
        @move-playhead="setPlayheadSecs" @remove="removeComment"
        :cmt="cmt" :key="cmt.timeString"></AudioCommentVue>
    </div>
  </div>
</template>

<script lang="ts">
import { TFile, setIcon, MarkdownPostProcessorContext } from 'obsidian'
import { defineComponent, PropType } from 'vue';
import { AudioComment } from '../types'
import { secondsToString, secondsToNumber } from '../utils'

import AudioCommentVue from './AudioComment.vue';

export default defineComponent({
  name: 'App',
  components: {
    AudioCommentVue
  },
  props: {
    filepath: String,
    ctx: Object as PropType<MarkdownPostProcessorContext>,
    mdElement: Object as PropType<HTMLElement>,
    audio: Object as PropType<HTMLAudioElement>
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
      playing: false,
      button: undefined as HTMLSpanElement | undefined,
      buttonSmall: undefined as HTMLSpanElement | undefined,

      clickCount: 0,
      showInput: false,
      newComment: '',
      comments: [] as AudioComment[],

      ro: ResizeObserver,
      smallSize: false,
    }
  },
  computed: {
    displayedCurrentTime() { return secondsToString(this.currentTime); },
    displayedDuration() { return secondsToString(this.duration); },
    currentBar() { return Math.floor(this.currentTime / this.duration * this.nSamples); },
    commentsSorted() { return this.comments.sort((x: AudioComment, y:AudioComment) => x.timeNumber - y.timeNumber); }
  },
  methods: {
    getSectionInfo() { return this.ctx.getSectionInfo(this.mdElement); },
    getParentWidth() { return this.mdElement.clientWidth },
    onResize() { 
      this.smallSize = this.$el.clientWidth < 300;
    },
    async loadFile() {
      // read file from vault 
      const file = window.app.vault.getAbstractFileByPath(this.filepath) as TFile;

      // process audio file & set audio el source
      if (file && file instanceof TFile) {
        //check cached values
        if (!this.loadCache()) 
          this.processAudio(file.path);

        this.srcPath = window.app.vault.getResourcePath(file);
      }
    },
    saveCache() {
      localStorage[`${this.filepath}`] = JSON.stringify(this.filteredData);
      localStorage[`${this.filepath}_duration`] = this.duration;
    },
    loadCache(): boolean {
      let cachedData = localStorage[`${this.filepath}`];
      let cachedDuration = localStorage[`${this.filepath}_duration`];

      if (!cachedData) { return false; }
      
      this.filteredData = JSON.parse(cachedData);
      this.duration = Number.parseFloat(cachedDuration)
      return true;
    },  
    async processAudio(path: string) {
      const arrBuf = await window.app.vault.adapter.readBinary(path);
      const audioContext = new AudioContext();
      const tempArray = [] as number[];

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
        this.saveCache();
      })
    },
    barMouseDownHandler(i: number) {
      this.clickCount += 1;
      setTimeout(() => {
        this.clickCount = 0;
      }, 200);

      if (this.clickCount >= 2) {
        this.showBookMarkDialog();
        setTimeout(() => {
          const input = this.$refs.commentInput as HTMLInputElement;
          input.focus();
        })
      } else {
        let time = i / this.nSamples * this.duration;
        this.setPlayheadSecs(time);
      }
    },
    onBookMarkClicked() {
      this.pause();
      this.audio.currentTime = this.audio.currentTime - 0.5;
      this.showBookMarkDialog();
    },
    showBookMarkDialog() {
      this.showInput = true;
    },
    setPlayBackRate(multiplier : number){
      this.audio.playbackRate = multiplier;
    },
    setLoopValue(value : boolean){
      this.audio.loop = value;
    },
    setPlayheadSecs(time: any) {
      this.currentTime = time;
      if (this.audio.src === this.srcPath) {
        this.audio.currentTime = time;
      }
    },
    togglePlay() {
      if (!(this.audio.src === this.srcPath)) {
        this.audio.src = this.srcPath;
      }

      if (this.audio.paused) {
        this.globalPause();
        this.play();
      } else {
        this.pause();
      } 
    },
    play() {
      if (this.currentTime > 0) {
        this.audio.currentTime = this.currentTime;
      }
      this.setPlayBackRate(this.getPlaybackSpeedSetting());
      this.setLoopValue(this.getLoopSetting());
      this.audio.addEventListener('timeupdate', this.timeUpdateHandler);
      this.audio?.play();
      this.setBtnIcon('pause');      
    },
    pause() {
      this.audio?.pause();
      this.setBtnIcon('play');
    },
    globalPause() {
      const ev = new Event('allpause');
      document.dispatchEvent(ev);
    },
    timeUpdateHandler() {
      if (this.audio.src === this.srcPath)
        this.currentTime = this.audio?.currentTime;
    },
    setBtnIcon(icon: string) { 
      setIcon(this.button, icon);
      setIcon(this.buttonSmall, icon); 
    },
    getCodeBlockSettingsValues(expretion : RegExp) : Array<string>
    {
        const sectionInfo = this.getSectionInfo();
        const lines = sectionInfo.text.split('\n') as string[];

        return lines.filter(item => item.match(expretion));
    },
    getFirstOrDefaultSettingsValue(expretion : RegExp) : string | null 
    {
      const filteredLines = this.getCodeBlockSettingsValues(expretion)

      if(filteredLines.length == 0) return null;

      const settingValue = expretion.exec(filteredLines[0])?.at(1);

      if((settingValue === undefined)) return null;

      return settingValue;
    },
    addComment() {
      if (this.newComment.length == 0)
        return;
      const sectionInfo = this.getSectionInfo();
      const lines = sectionInfo.text.split('\n') as string[];
      const timeStamp = secondsToString(this.currentTime);
      lines.splice(sectionInfo.lineEnd, 0, `${timeStamp} --- ${this.newComment}`);

      window.app.vault.adapter.write(this.ctx.sourcePath, lines.join('\n'))
    },
    removeComment(i: number) {
      const sectionInfo = this.getSectionInfo();
      const lines = sectionInfo.text.split('\n') as string[];
      lines.splice(sectionInfo.lineStart + 2 + i, 1);
      window.app.vault.adapter.write(this.ctx.sourcePath, lines.join('\n'))
    },
    getLoopValue() : boolean {

      return false;
    },
    getPlaybackSpeedSetting() : number {
      const defaultSpeed = this.audio.defaultPlaybackRate;
      
      const regex = new RegExp('playback: *([0-9\.]*)', 'g');
      
      const playbackSpeed = this.getFirstOrDefaultSettingsValue(regex);
      
      if((playbackSpeed === null)) return defaultSpeed;

      var numericRepr = parseFloat(playbackSpeed);

      if(isNaN(numericRepr)) return defaultSpeed;

      return numericRepr;
    },
    getLoopSetting() : boolean {
      const defaultSpeed = this.audio.defaultPlaybackRate;
      
      const regex = new RegExp('loop: *((t|T)rue)', 'g');
      
      const loopSetting = this.getFirstOrDefaultSettingsValue(regex);
      
      return !(loopSetting === null);
    },
    getBookmarkValues() : Array<AudioComment> {
      const sectionInfo = this.getSectionInfo();
      const lines = sectionInfo.text.split('\n') as string[];

      const regex = new RegExp('[0-9]+:[0-9]+:[0-9]+ --- .*', 'g');
      const filteredLines = lines.filter(item => item.match(regex));

      const cmts = filteredLines.map((x, i) => {
        const split = x.split(' --- ');
        const timeStamp = secondsToNumber(split[0]);
        const cmt: AudioComment = {
          timeNumber: timeStamp,
          timeString: split[0],
          content: split[1],
          index: i
        }
        return cmt;
      });
      return cmts;
    },
  },
  created() { 
    this.loadFile();
  },
  mounted() {
    this.button = this.$refs.playpause as HTMLSpanElement;
    this.buttonSmall = this.$refs.playPauseSmall as HTMLSpanElement;
    this.setBtnIcon('play');

    this.bookmarkButton = this.$refs.bookmarkButton as HTMLSpanElement;
    setIcon(this.bookmarkButton, 'bookmark-plus');

    // add event listeners
    document.addEventListener('allpause', () => {  this.setBtnIcon('play'); });
    document.addEventListener('allresume', () => {
      if (this.audio.src === this.srcPath) {
        this.setBtnIcon('pause');
      }
    });
    document.addEventListener('togglePlayState', () => {
      if (this.audio.src === this.srcPath) {
        this.togglePlay()
        this.setBtnIcon(this.audio.paused ? 'play' : 'pause');
      }
    });
    this.audio.addEventListener('ended', () => {
      if (this.audio.src === this.srcPath)
        this.setBtnIcon('play');
    });

    this.$el.addEventListener('resize', () => {
      console.log(this.$el.clientWidth);
    })

    // get current time
    if (this.audio.src === this.srcPath) {
      this.currentTime = this.audio.currentTime
      this.audio.addEventListener('timeupdate', this.timeUpdateHandler);
      this.setBtnIcon(this.audio.paused ? 'play' : 'pause');
    }

    // load comments
    setTimeout(() => { this.comments = this.getBookmarkValues(); });


    this.ro = new ResizeObserver(this.onResize);
    this.ro.observe(this.$el);
  },
  beforeDestroy() {
    this.ro.unobserve(this.$el);
  }
})

</script>