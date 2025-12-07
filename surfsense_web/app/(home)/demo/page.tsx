"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BACKGROUND_OPTIONS } from "@/components/backgrounds";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadWithCrop } from "@/components/ui/image-upload-with-crop";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DemoPage() {
	const [selectedBackground, setSelectedBackground] = useState<number>(0);
	const [uploadedImages, setUploadedImages] = useState<File[]>([]);

	const handleBackgroundChange = (index: number) => {
		setSelectedBackground(index);
	};

	const handleImageReady = (file: File) => {
		setUploadedImages((prev) => [...prev, file]);
		toast.success("Image cropped successfully!", {
			description: `${file.name} is ready for upload`,
		});
	};

	return (
		<div className="relative min-h-screen">
			{/* Background Layer */}
			<div className="fixed inset-0 -z-10">{BACKGROUND_OPTIONS[selectedBackground].component}</div>

			{/* Content Layer */}
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8 text-center">
					<h1 className="text-4xl font-bold mb-2 text-foreground">
						Background Snippets & Image Cropping Demo
					</h1>
					<p className="text-muted-foreground">
						Explore modern background patterns and test image cropping functionality
					</p>
				</div>

				<Tabs defaultValue="backgrounds" className="w-full">
					<TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
						<TabsTrigger value="backgrounds">Background Snippets</TabsTrigger>
						<TabsTrigger value="cropping">Image Cropping</TabsTrigger>
					</TabsList>

					<TabsContent value="backgrounds" className="space-y-6">
						<Card className="bg-background/80 backdrop-blur-sm">
							<CardHeader>
								<CardTitle>Background Snippets Gallery</CardTitle>
								<CardDescription>
									Select a background pattern to preview it on this page
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
									{BACKGROUND_OPTIONS.map((bg, index) => (
										<button
											key={`demo-bg-${bg.name}-${index}`}
											type="button"
											onClick={() => handleBackgroundChange(index)}
											className={`relative h-24 w-full overflow-hidden rounded-lg border-2 transition-all ${
												selectedBackground === index
													? "border-primary ring-2 ring-primary ring-offset-2"
													: "border-border hover:border-primary/50"
											}`}
											title={bg.name}
										>
											<div className="h-full w-full scale-150">{bg.component}</div>
											<div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent p-2">
												<span className="text-xs text-white font-medium truncate w-full text-center">
													{bg.theme === "light" ? "☀️" : "🌙"}
												</span>
											</div>
										</button>
									))}
								</div>
								<div className="mt-4 p-4 rounded-lg bg-muted">
									<p className="text-sm text-muted-foreground">
										<strong>Current:</strong> {BACKGROUND_OPTIONS[selectedBackground].name}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Theme: {BACKGROUND_OPTIONS[selectedBackground].theme}
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-background/80 backdrop-blur-sm">
							<CardHeader>
								<CardTitle>About Background Snippets</CardTitle>
								<CardDescription>
									Modern, ready-to-use background patterns crafted with Tailwind CSS
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								<p className="text-sm">
									These background snippets are inspired by{" "}
									<a
										href="https://github.com/ibelick/background-snippets"
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline"
									>
										bg.ibelick
									</a>
									, featuring:
								</p>
								<ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
									<li>Gradient backgrounds (light & dark modes)</li>
									<li>Grid patterns with various styles</li>
									<li>Combined grid and gradient effects</li>
									<li>All created with Tailwind CSS utility classes</li>
								</ul>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="cropping" className="space-y-6">
						<Card className="bg-background/80 backdrop-blur-sm">
							<CardHeader>
								<CardTitle>Image Cropping</CardTitle>
								<CardDescription>
									Upload and crop images with an intuitive interface
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ImageUploadWithCrop onImageReady={handleImageReady} aspectRatio={16 / 9} />
							</CardContent>
						</Card>

						{uploadedImages.length > 0 && (
							<Card className="bg-background/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle>Cropped Images</CardTitle>
									<CardDescription>
										{uploadedImages.length} image(s) ready for upload
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2">
										{uploadedImages.map((file, index) => (
											<li
												key={`uploaded-${file.name}-${file.size}-${index}`}
												className="flex items-center justify-between p-3 rounded-lg bg-muted"
											>
												<span className="text-sm font-medium">{file.name}</span>
												<span className="text-xs text-muted-foreground">
													{(file.size / 1024).toFixed(2)} KB
												</span>
											</li>
										))}
									</ul>
									<Button
										className="w-full mt-4"
										onClick={() => {
											toast.info("Upload functionality", {
												description:
													"This is a demo. In production, images would be uploaded here.",
											});
										}}
									>
										Upload {uploadedImages.length} Image(s)
									</Button>
								</CardContent>
							</Card>
						)}

						<Card className="bg-background/80 backdrop-blur-sm">
							<CardHeader>
								<CardTitle>Features</CardTitle>
								<CardDescription>Powerful image cropping capabilities</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
									<li>Drag and drop or browse to upload images</li>
									<li>Interactive cropping with zoom controls</li>
									<li>Adjustable aspect ratios</li>
									<li>Real-time preview of cropped area</li>
									<li>Support for JPG, PNG, and WEBP formats</li>
									<li>File size validation</li>
								</ul>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
