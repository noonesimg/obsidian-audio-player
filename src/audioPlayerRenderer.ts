import { MarkdownRenderChild } from "obsidian";

import { App, createApp } from "vue";
import VueApp from "./components/App.vue";
import { AudioPlayerRendererOptions } from "./types";

export class AudioPlayerRenderer extends MarkdownRenderChild {
	options: AudioPlayerRendererOptions;
	vueApp: App<Element>;

	constructor(containerEl: HTMLElement, options: AudioPlayerRendererOptions) {
		super(containerEl);
		this.options = options;
		this.vueApp = createApp(VueApp, {
			filepath: this.options.filepath,
			ctx: this.options.ctx,
			mdElement: containerEl,
			audio: this.options.player,
		});
	}

	onload(): void {
		this.vueApp.mount(this.containerEl);
	}

	onunload(): void {
		this.vueApp.unmount();
	}
}
