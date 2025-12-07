"use client";

import { useEffect, useRef } from "react";
import grapesjs, { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import websitePreset from "grapesjs-preset-webpage";

interface WebpageEditorProps {
	/**
	 * Initial HTML content to load in the editor
	 */
	initialHtml?: string;
	/**
	 * Initial CSS content to load in the editor
	 */
	initialCss?: string;
	/**
	 * Callback when the editor content changes
	 */
	onChange?: (html: string, css: string) => void;
	/**
	 * Height of the editor container
	 */
	height?: string;
}

/**
 * GrapesJS Webpage Editor Component
 * 
 * A WYSIWYG webpage builder with the preset-webpage plugin that includes
 * common webpage components like navbar, forms, sliders, and more.
 */
export default function WebpageEditor({
	initialHtml = "",
	initialCss = "",
	onChange,
	height = "100vh",
}: WebpageEditorProps) {
	const editorRef = useRef<Editor | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		// Initialize GrapesJS editor with preset-webpage plugin
		const editor = grapesjs.init({
			container: containerRef.current,
			height,
			width: "100%",
			storageManager: false, // Disable default storage, handle externally
			plugins: [websitePreset],
			pluginsOpts: {
				[websitePreset]: {
					// Preset-webpage plugin options
					blocks: ["link-block", "quote", "text-basic"],
					modalImportTitle: "Import Template",
					modalImportLabel:
						'<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
					modalImportContent: (editor: Editor) => {
						return (
							editor.getHtml() +
							"<style>" +
							editor.getCss() +
							"</style>"
						);
					},
				},
			},
			canvas: {
				styles: [],
				scripts: [],
			},
		});

		// Load initial content if provided
		if (initialHtml || initialCss) {
			editor.setComponents(initialHtml);
			editor.setStyle(initialCss);
		}

		// Set up change listener
		if (onChange) {
			editor.on("update", () => {
				const html = editor.getHtml();
				const css = editor.getCss();
				onChange(html, css);
			});
		}

		editorRef.current = editor;

		// Cleanup
		return () => {
			if (editorRef.current) {
				editorRef.current.destroy();
			}
		};
	}, [initialHtml, initialCss, onChange, height]);

	return (
		<div
			ref={containerRef}
			className="gjs-editor-wrapper"
			style={{ height }}
		/>
	);
}
