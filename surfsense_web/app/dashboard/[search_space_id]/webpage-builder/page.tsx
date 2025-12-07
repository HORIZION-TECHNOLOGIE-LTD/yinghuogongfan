"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import "grapesjs/dist/css/grapes.min.css";

// Dynamically import GrapesJS to avoid SSR issues
const GrapesJSEditor = dynamic(() => import("./components/GrapesJSEditor"), { ssr: false });

export default function WebpageBuilderPage() {
	return (
		<div className="h-full w-full">
			<GrapesJSEditor />
		</div>
	);
}
