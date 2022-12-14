import { MarkdownPostProcessorContext } from "obsidian";

export type AudioComment = {
	content: string;
	timeNumber: number;
	timeString: string;
	index: number;
};

export type AudioPlayerRendererOptions = {
	ctx: MarkdownPostProcessorContext;
	player: HTMLAudioElement;
	filepath: string;
};
