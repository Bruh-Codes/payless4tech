import { Input } from "@/components/ui/input";

interface ProductImageUploadProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
  isEditing?: boolean;
}

export const ProductImageUpload = ({ onChange, multiple = false, isEditing = false }: ProductImageUploadProps) => {
  return (
    <Input
      type="file"
      accept="image/*"
      onChange={onChange}
      required={!multiple && !isEditing}
      multiple={multiple}
    />
  );
};