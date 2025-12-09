"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface ImageCropperProps {
	image: string;
	onCropComplete: (croppedImage: Blob) => void;
	onCancel: () => void;
	aspectRatio?: number;
	cropShape?: "rect" | "round";
}

export function ImageCropper({
	image,
	onCropComplete,
	onCancel,
	aspectRatio = 1,
	cropShape = "rect",
}: ImageCropperProps) {
	const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const onCropAreaChange = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);

	const createImage = (url: string): Promise<HTMLImageElement> =>
		new Promise((resolve, reject) => {
			const image = new Image();
			image.addEventListener("load", () => resolve(image));
			image.addEventListener("error", (error) => reject(error));
			image.src = url;
		});

	const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
		const image = await createImage(imageSrc);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("No 2d context");
		}

		canvas.width = pixelCrop.width;
		canvas.height = pixelCrop.height;

		ctx.drawImage(
			image,
			pixelCrop.x,
			pixelCrop.y,
			pixelCrop.width,
			pixelCrop.height,
			0,
			0,
			pixelCrop.width,
			pixelCrop.height
		);

		return new Promise((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error("Canvas is empty"));
				}
			}, "image/jpeg");
		});
	};

	const handleCropComplete = async () => {
		if (!croppedAreaPixels) return;

		setIsProcessing(true);
		try {
			const croppedImage = await getCroppedImg(image, croppedAreaPixels);
			onCropComplete(croppedImage);
		} catch (error) {
			// Error handling - consider integrating with application's error reporting
			const errorMessage = error instanceof Error ? error.message : "Failed to crop image";
			console.error("Error cropping image:", errorMessage);
			// You could add toast notification here if available in parent component
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<Dialog open onOpenChange={onCancel}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Crop Image</DialogTitle>
				</DialogHeader>
				<div className="relative h-[400px] w-full">
					<Cropper
						image={image}
						crop={crop}
						zoom={zoom}
						aspect={aspectRatio}
						onCropChange={setCrop}
						onCropComplete={onCropAreaChange}
						onZoomChange={setZoom}
						cropShape={cropShape}
					/>
				</div>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<div className="text-sm font-medium">Zoom</div>
						<Slider
							min={1}
							max={3}
							step={0.1}
							value={[zoom]}
							onValueChange={(value) => setZoom(value[0])}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onCancel} disabled={isProcessing}>
						Cancel
					</Button>
					<Button onClick={handleCropComplete} disabled={isProcessing}>
						{isProcessing ? "Processing..." : "Apply"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
