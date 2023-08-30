import {
	getLinkpath,
	MarkdownPostProcessorContext,
	Notice,
	Plugin,
} from "obsidian";

import { AudioPlayerRenderer } from "./audioPlayerRenderer";

export default class AudioPlayer extends Plugin {
	async onload() {
		const player = document.createElement("audio");
		player.volume = 0.5;
		const body = document.getElementsByTagName("body")[0];
		body.appendChild(player);

		this.addCommand({
			id: "pause-audio",
			name: "Pause Audio",
			callback: () => {
				new Notice("Audio paused");
				const ev = new Event("allpause");
				document.dispatchEvent(ev);
				player.pause();
			},
		});

		this.addCommand({
			id: "resume-audio",
			name: "Resume Audio",
			callback: () => {
				new Notice("Audio resumed");
				const ev = new Event("allresume");
				document.dispatchEvent(ev);
				if (player.src) player.play();
			},
		});

		this.addCommand({
			id: "add-audio-comment",
			name: "Add bookmark",
			callback: () => {
				const ev = new Event("addcomment");
				document.dispatchEvent(ev);
			}
		});

		this.addCommand({
			id: "audio-forward-5s",
			name: "+5 sec",
			callback: () => {
				if (player.src) player.currentTime += 5;
			}
		});

		this.addCommand({
			id: "audio-back-5s",
			name: "-5 sec",
			callback: () => {
				if (player.src) player.currentTime -= 5;
			}
		});

		this.registerMarkdownCodeBlockProcessor(
			"audio-player",
			(
				source: string,
				el: HTMLElement,
				ctx: MarkdownPostProcessorContext
			) => {
				// parse file name
				const re = /\[\[(.+)\]\]/g;
				const filename = re.exec(source)?.at(1);
				if (!filename) return;

				const allowedExtensions = [
					"mp3",
					"wav",
					"ogg",
					"flac",
					"mp4",
					"m4a",
					"webm"
				];
				const link = this.app.metadataCache.getFirstLinkpathDest(
					getLinkpath(filename),
					filename
				);
				if (!link || !allowedExtensions.includes(link.extension))
					return;

				// create root $el
				const container = el.createDiv();
				container.classList.add("base-container");

				//create vue app
				ctx.addChild(
					new AudioPlayerRenderer(el, {
						filepath: link.path,
						ctx,
						player,
					})
				);
			}
		);
	}
}
