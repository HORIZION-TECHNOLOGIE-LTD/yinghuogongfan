"use client";

import { Crop, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageCropper } from "@/components/ui/image-cropper";

interface ImageUploadWithCropProps {
	onImageReady: (file: File) => void;
	aspectRatio?: number;
	maxSizeMB?: number;
}

export function ImageUploadWithCrop({
	onImageReady,
	aspectRatio = 1,
	maxSizeMB = 10,
}: ImageUploadWithCropProps) {
	const [originalImage, setOriginalImage] = useState<string | null>(null);
	const [showCropper, setShowCropper] = useState(false);
	const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string>("");

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles.length > 0) {
				const file = acceptedFiles[0];
				const maxSize = maxSizeMB * 1024 * 1024;

				if (file.size > maxSize) {
					toast.error("File too large", {
						description: `File size exceeds ${maxSizeMB}MB limit`,
					});
					return;
				}

				setFileName(file.name);
				const reader = new FileReader();
				reader.onload = () => {
					setOriginalImage(reader.result as string);
					setShowCropper(true);
				};
				reader.readAsDataURL(file);
			}
		},
		[maxSizeMB]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/jpeg": [".jpg", ".jpeg"],
			"image/png": [".png"],
			"image/webp": [".webp"],
		},
		maxFiles: 1,
	});

	const handleCropComplete = (croppedBlob: Blob) => {
		const url = URL.createObjectURL(croppedBlob);
		setCroppedImageUrl(url);
		setShowCropper(false);

		const croppedFile = new File([croppedBlob], fileName, {
			type: "image/jpeg",
		});
		onImageReady(croppedFile);
	};

	const handleReset = () => {
		setOriginalImage(null);
		setCroppedImageUrl(null);
		setShowCropper(false);
		setFileName("");
	};

	const handleRecrop = () => {
		if (originalImage) {
			setShowCropper(true);
		}
	};

	return (
		<div className="space-y-4">
			{!croppedImageUrl ? (
				<Card>
					<CardContent className="p-6">
						<div
							{...getRootProps()}
							className={`flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
								isDragActive
									? "border-primary bg-primary/5"
									: "border-muted-foreground/25 hover:border-primary/50"
							}`}
						>
							<input {...getInputProps()} />
							<Upload className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-lg font-medium mb-1">
								{isDragActive ? "Drop image here" : "Drag & drop an image"}
							</p>
							<p className="text-sm text-muted-foreground">or click to browse</p>
							<p className="text-xs text-muted-foreground mt-2">
								Supported: JPG, PNG, WEBP (max {maxSizeMB}MB)
							</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="relative aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden border">
								<Image src={croppedImageUrl} alt="Cropped image" fill className="object-cover" />
							</div>
							<div className="flex gap-2 justify-center">
								<Button variant="outline" size="sm" onClick={handleRecrop}>
									<Crop className="h-4 w-4 mr-2" />
									Recrop
								</Button>
								<Button variant="outline" size="sm" onClick={handleReset}>
									<X className="h-4 w-4 mr-2" />
									Remove
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{showCropper && originalImage && (
				<ImageCropper
					image={originalImage}
					onCropComplete={handleCropComplete}
					onCancel={() => setShowCropper(false)}
					aspectRatio={aspectRatio}
				/>
			)}
		</div>
	);
}
