import { getLinkpath, MarkdownPostProcessorContext, Notice, Plugin, PluginManifest } from 'obsidian';

import { App, createApp, h } from 'vue';
import VueApp from './components/App.vue'

// Remember to rename these classes and interfaces!

interface AudioPlayerSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: AudioPlayerSettings = {
	mySetting: 'default'
}

export default class AudioPlayer extends Plugin {


	async onload() {
		const player = document.createElement('audio');
		player.volume = 0.5;
		const body = document.getElementsByTagName('body')[0]
		body.appendChild(player);

		this.addCommand({
      id: 'pause-audio',
      name: 'Pause Audio',
      callback: () => {
				new Notice('Audio paused');
				const ev = new Event('allpause');
      	document.dispatchEvent(ev);
        player.pause();
      },
    });

		this.registerMarkdownCodeBlockProcessor('audio-player', (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			// parse file name
			const re = /\[\[(.+)\]\]/g;
			const filename = re.exec(source)?.at(1);
			if (!filename) return;

			const allowedExtensions = [ 'mp3', 'wav', 'ogg','flac'];
			const link = this.app.metadataCache.getFirstLinkpathDest(getLinkpath(filename), filename);
			if (!link || !allowedExtensions.includes(link.extension)) return;

			// create root $el
			const container = el.createDiv();
			container.style.width = '100%';
			container.style.height = 'fit-content';
			container.style.display = 'flex';
			container.style.justifyContent = 'center';
			container.style.alignItems = 'center';
			
			//mount vue app
			createApp(VueApp, { filepath: link.path, ctx: ctx, mdElement: el, audio: player }).mount(el)
		});
	}
}