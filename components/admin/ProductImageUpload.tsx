"use client";

import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { UploadCloud } from "lucide-react";
import { useRef } from "react";

interface ProductImageUploadProps {
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	multiple?: boolean;
	isEditing?: boolean;
	field: any;
}

export const ProductImageUpload = ({
	onChange,
	multiple = false,
	isEditing = false,
	field,
}: ProductImageUploadProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="flex flex-col items-start gap-2">
			<Input
				type="file"
				accept="image/*"
				onChange={onChange}
				required={!multiple && !isEditing}
				multiple={multiple}
				ref={fileInputRef}
				className="hidden"
				{...field}
			/>
			<Button
				variant="outline"
				type="button"
				onClick={handleClick}
				className="flex items-center gap-2 cursor-pointer hover:bg-green-300 bg-green-200 text-green-900"
			>
				<UploadCloud className="w-4 h-4" />
				Upload Product Image
			</Button>
		</div>
	);
};
