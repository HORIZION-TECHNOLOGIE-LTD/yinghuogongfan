"use client";

import { useState } from "react";
import { BACKGROUND_OPTIONS } from "./background-snippets";

interface BackgroundSelectorProps {
	onBackgroundChange?: (background: (typeof BACKGROUND_OPTIONS)[number] | null) => void;
	className?: string;
}

export function BackgroundSelector({ onBackgroundChange, className }: BackgroundSelectorProps) {
	const [selectedBackground, setSelectedBackground] = useState<number | null>(null);

	const handleBackgroundSelect = (index: number) => {
		const newIndex = selectedBackground === index ? null : index;
		setSelectedBackground(newIndex);
		onBackgroundChange?.(newIndex !== null ? BACKGROUND_OPTIONS[newIndex] : null);
	};

	return (
		<div className={className}>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
				{BACKGROUND_OPTIONS.map((bg, index) => (
					<button
						key={index}
						type="button"
						onClick={() => handleBackgroundSelect(index)}
						className={`relative h-24 w-full overflow-hidden rounded-lg border-2 transition-all ${
							selectedBackground === index
								? "border-primary ring-2 ring-primary ring-offset-2"
								: "border-border hover:border-primary/50"
						}`}
						title={bg.name}
					>
						<div className="h-full w-full scale-150">{bg.component}</div>
					</button>
				))}
			</div>
		</div>
	);
}
