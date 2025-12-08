"use client";

import type grapesjs from "grapesjs";
import grapesjsLib from "grapesjs";
import { useEffect, useRef } from "react";

export default function GrapesJSEditor() {
	const editorRef = useRef<HTMLDivElement>(null);
	const editorInstance = useRef<grapesjs.Editor | null>(null);

	useEffect(() => {
		if (!editorRef.current || editorInstance.current) return;

		// Initialize GrapesJS
		editorInstance.current = grapesjsLib.init({
			container: editorRef.current,
			height: "100vh",
			width: "auto",
			storageManager: {
				type: "local",
				autosave: true,
				autoload: true,
			},
			canvas: {
				styles: [],
				scripts: [],
			},
			panels: {
				defaults: [
					{
						id: "basic-actions",
						el: ".panel__basic-actions",
						buttons: [
							{
								id: "visibility",
								active: true,
								className: "btn-toggle-borders",
								label: "👁",
								command: "sw-visibility",
							},
						],
					},
					{
						id: "panel-devices",
						el: ".panel__devices",
						buttons: [
							{
								id: "device-desktop",
								label: "🖥️",
								command: "set-device-desktop",
								active: true,
								togglable: false,
							},
							{
								id: "device-tablet",
								label: "📱",
								command: "set-device-tablet",
								togglable: false,
							},
							{
								id: "device-mobile",
								label: "📱",
								command: "set-device-mobile",
								togglable: false,
							},
						],
					},
					{
						id: "panel-switcher",
						el: ".panel__switcher",
						buttons: [
							{
								id: "show-layers",
								active: true,
								label: "Layers",
								command: "show-layers",
								togglable: false,
							},
							{
								id: "show-style",
								active: true,
								label: "Styles",
								command: "show-styles",
								togglable: false,
							},
							{
								id: "show-traits",
								active: true,
								label: "Settings",
								command: "show-traits",
								togglable: false,
							},
							{
								id: "show-blocks",
								active: true,
								label: "Blocks",
								command: "show-blocks",
								togglable: false,
							},
						],
					},
				],
			},
			deviceManager: {
				devices: [
					{
						id: "desktop",
						name: "Desktop",
						width: "",
					},
					{
						id: "tablet",
						name: "Tablet",
						width: "768px",
						widthMedia: "992px",
					},
					{
						id: "mobile",
						name: "Mobile",
						width: "320px",
						widthMedia: "480px",
					},
				],
			},
			blockManager: {
				appendTo: "#blocks",
				blocks: [
					{
						id: "section",
						label: "<b>Section</b>",
						attributes: { class: "gjs-block-section" },
						content:
							'<section style="padding: 20px;"><h1>This is a simple title</h1><p>This is just a paragraph</p></section>',
					},
					{
						id: "text",
						label: "Text",
						content: '<div data-gjs-type="text">Insert your text here</div>',
					},
					{
						id: "image",
						label: "Image",
						select: true,
						content: { type: "image" },
						activate: true,
					},
					{
						id: "video",
						label: "Video",
						content: {
							type: "video",
							src: "",
						},
					},
					{
						id: "link",
						label: "Link",
						content: '<a href="#">Link</a>',
					},
					{
						id: "map",
						label: "Map",
						content: {
							type: "map",
							style: { height: "350px" },
						},
					},
				],
			},
		});

		// Define commands
		const commands = editorInstance.current.Commands;

		commands.add("set-device-desktop", {
			run: (editor: grapesjs.Editor) => editor.setDevice("Desktop"),
		});
		commands.add("set-device-tablet", {
			run: (editor: grapesjs.Editor) => editor.setDevice("Tablet"),
		});
		commands.add("set-device-mobile", {
			run: (editor: grapesjs.Editor) => editor.setDevice("Mobile"),
		});
		commands.add("show-layers", {
			run(editor: grapesjs.Editor) {
				editor.LayerManager.render();
			},
		});
		commands.add("show-styles", {
			run(editor: grapesjs.Editor) {
				editor.StyleManager.render();
			},
		});
		commands.add("show-traits", {
			run(editor: grapesjs.Editor) {
				editor.TraitManager.render();
			},
		});
		commands.add("show-blocks", {
			run(editor: grapesjs.Editor) {
				editor.BlockManager.render();
			},
		});

		return () => {
			if (editorInstance.current) {
				editorInstance.current.destroy();
				editorInstance.current = null;
			}
		};
	}, []);

	return (
		<div className="w-full h-full">
			<div className="flex h-full">
				<div className="flex flex-col bg-background border-r w-[250px]">
					<div className="p-2 border-b">
						<h3 className="font-semibold text-sm">Blocks</h3>
					</div>
					<div id="blocks" className="flex-1 overflow-auto p-2" />
				</div>
				<div className="flex-1 flex flex-col">
					<div className="flex items-center justify-between p-2 border-b bg-background">
						<div className="panel__basic-actions flex gap-2" />
						<div className="panel__devices flex gap-2" />
						<div className="panel__switcher flex gap-2" />
					</div>
					<div ref={editorRef} className="flex-1" />
				</div>
			</div>
		</div>
	);
}
