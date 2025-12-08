"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Dynamically import WebpageEditor to avoid SSR issues
const WebpageEditor = dynamic(() => import("@/components/webpage-editor"), {
	ssr: false,
	loading: () => <div className="flex items-center justify-center h-screen">Loading editor...</div>,
});

export default function WebpageEditorDemo() {
	const [htmlContent, setHtmlContent] = useState("");
	const [cssContent, setCssContent] = useState("");
	const [showCode, setShowCode] = useState(false);

	const handleEditorChange = (html: string, css: string) => {
		setHtmlContent(html);
		setCssContent(css);
	};

	const handleExport = () => {
		// Note: This export is intended for user-generated content from the editor.
		// In a production environment, consider:
		// 1. Sanitizing content with DOMPurify before export if content comes from untrusted sources
		// 2. Implementing server-side validation
		// 3. Adding CSP headers when serving exported HTML
		const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Webpage</title>
    <style>
${cssContent}
    </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

		const blob = new Blob([fullHtml], { type: "text/html" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "webpage.html";
		a.click();
		URL.revokeObjectURL(url);
		
		toast.success("Webpage exported successfully!");
	};

	return (
		<div className="h-screen flex flex-col">
			<div className="border-b p-4 bg-background">
				<div className="container mx-auto flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">GrapesJS Webpage Editor</h1>
						<p className="text-sm text-muted-foreground">
							Build beautiful webpages with drag-and-drop components
						</p>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setShowCode(!showCode)}>
							{showCode ? "Hide Code" : "Show Code"}
						</Button>
						<Button onClick={handleExport}>Export HTML</Button>
					</div>
				</div>
			</div>

			{showCode ? (
				<div className="flex-1 overflow-auto p-4 bg-muted/30">
					<div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
						<Card>
							<CardHeader>
								<CardTitle>HTML</CardTitle>
								<CardDescription>Generated HTML markup</CardDescription>
							</CardHeader>
							<CardContent>
								<pre className="text-xs overflow-auto max-h-[70vh] bg-background p-4 rounded-lg">
									{htmlContent || "No content yet. Start building!"}
								</pre>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>CSS</CardTitle>
								<CardDescription>Generated CSS styles</CardDescription>
							</CardHeader>
							<CardContent>
								<pre className="text-xs overflow-auto max-h-[70vh] bg-background p-4 rounded-lg">
									{cssContent || "No styles yet. Start building!"}
								</pre>
							</CardContent>
						</Card>
					</div>
				</div>
			) : (
				<div className="flex-1">
					<WebpageEditor
						initialHtml=""
						initialCss=""
						onChange={handleEditorChange}
						height="100%"
					/>
				</div>
			)}
		</div>
	);
}
