"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormDescription } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export type ProductSpec = {
	key: string;
	value: string;
};

interface ProductSpecsEditorProps {
	specs: ProductSpec[];
	setSpecs: Dispatch<SetStateAction<ProductSpec[]>>;
}

const EMPTY_SPEC: ProductSpec = { key: "", value: "" };

function parseSpecLine(line: string): ProductSpec | null {
	const cleanedLine = line
		.trim()
		.replace(/^[\u2022*-]\s*/, "")
		.replace(/^\d+[.)]\s*/, "");

	if (!cleanedLine) {
		return null;
	}

	const patterns = [
		/^(.*?)\t+(.+)$/,
		/^(.*?):\s*(.+)$/,
		/^(.*?)\s+\|\s+(.+)$/,
		/^(.*?)\s*=\s*(.+)$/,
		/^(.*?)\s[-–]\s(.+)$/,
		/^(.*?)\s{2,}(.+)$/,
	];

	for (const pattern of patterns) {
		const match = cleanedLine.match(pattern);
		const key = match?.[1]?.trim();
		const value = match?.[2]?.trim();

		if (key && value) {
			return { key, value };
		}
	}

	return { key: "Details", value: cleanedLine };
}

function parseSpecsFromText(input: string): ProductSpec[] {
	return input
		.split(/\r?\n/)
		.map(parseSpecLine)
		.filter((spec): spec is ProductSpec => Boolean(spec));
}

export function ProductSpecsEditor({
	specs,
	setSpecs,
}: ProductSpecsEditorProps) {
	const [bulkSpecs, setBulkSpecs] = useState("");
	const [isPasteOpen, setIsPasteOpen] = useState(false);

	const addSpec = () => setSpecs((current) => [...current, { ...EMPTY_SPEC }]);

	const removeSpec = (index: number) => {
		setSpecs((current) => {
			const next = current.filter((_, currentIndex) => currentIndex !== index);
			return next.length ? next : [{ ...EMPTY_SPEC }];
		});
	};

	const updateSpec = (
		index: number,
		field: keyof ProductSpec,
		value: string,
	) => {
		setSpecs((current) =>
			current.map((spec, currentIndex) =>
				currentIndex === index ? { ...spec, [field]: value } : spec,
			),
		);
	};

	const importSpecs = () => {
		const parsedSpecs = parseSpecsFromText(bulkSpecs).filter(
			(spec) => spec.key.trim() && spec.value.trim(),
		);

		if (!parsedSpecs.length) {
			toast.error("No valid specs found in the pasted text.");
			return;
		}

		setSpecs(parsedSpecs);

		setBulkSpecs("");
		toast.success(
			`${parsedSpecs.length} specification${parsedSpecs.length === 1 ? "" : "s"} imported.`,
		);
	};

	return (
		<div className="space-y-3">
			<Collapsible open={isPasteOpen} onOpenChange={setIsPasteOpen}>
				<CollapsibleTrigger asChild>
					<Button
						type="button"
						variant="outline"
						className="w-full justify-between"
					>
						<span>
							{isPasteOpen
								? "Hide pasted specs box"
								: "I want to paste specs"}
						</span>
						<div className="flex items-center gap-2 text-muted-foreground">
							<span className="text-xs">
								{isPasteOpen ? "Opened" : "Closed"}
							</span>
							<ChevronDown
								className={cn(
									"h-4 w-4 transition-transform",
									isPasteOpen && "rotate-180",
								)}
							/>
						</div>
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="pt-3">
					<div className="rounded-lg border bg-muted/30 p-3 space-y-3">
						<Textarea
							rows={5}
							value={bulkSpecs}
							onChange={(event) => setBulkSpecs(event.target.value)}
							placeholder={
								"Brand: Apple\nModel: iPhone 15 Pro\nStorage: 256GB\nColor: Black"
							}
						/>
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={importSpecs}
							>
								Add Pasted Specs
							</Button>
						</div>
						<FormDescription>
							Paste one spec per line, like `Brand: Apple` or
							`Storage: 256GB`, then click `Add Pasted Specs`.
						</FormDescription>
					</div>
				</CollapsibleContent>
			</Collapsible>

			<div className="space-y-2">
				{specs.map((spec, index) => (
					<div key={index} className="flex items-center gap-2">
						<Input
							placeholder="Key (e.g. Brand)"
							value={spec.key}
							onChange={(event) => updateSpec(index, "key", event.target.value)}
							className="flex-1"
						/>
						<Input
							placeholder="Value (e.g. Apple)"
							value={spec.value}
							onChange={(event) =>
								updateSpec(index, "value", event.target.value)
							}
							className="flex-1"
						/>
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="shrink-0"
							onClick={() => removeSpec(index)}
						>
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					</div>
				))}
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addSpec}
					className="mt-2 h-8 text-xs"
				>
					<IconPlus className="mr-1 h-3 w-3" /> Add Spec
				</Button>
			</div>
		</div>
	);
}
