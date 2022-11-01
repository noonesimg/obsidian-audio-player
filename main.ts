import { getLinkpath, MarkdownPostProcessorContext, Plugin } from 'obsidian';

import { createApp } from 'vue';
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
			createApp(VueApp, { filepath: link.path }).mount(container);
		});
	}
}