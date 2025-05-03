import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductImageUpload } from "./ProductImageUpload";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  condition: string;
  originalPrice: string;
  category: string;
  image: File | null;
  additionalImages: File[];
  detailedSpecs: string;
}

interface ProductFormFieldsProps {
  product: ProductFormData;
  onChange: (field: keyof ProductFormData, value: string | File | null | File[]) => void;
  existingImageUrl?: string | null;
  existingAdditionalImages?: { id: string; image_url: string }[];
  isEditing?: boolean;
  onDeleteMainImage?: () => void;
  onDeleteAdditionalImage?: (imageId: string) => void;
}

export const ProductFormFields = ({ 
  product, 
  onChange,
  existingImageUrl,
  existingAdditionalImages = [],
  isEditing = false,
  onDeleteMainImage,
  onDeleteAdditionalImage
}: ProductFormFieldsProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange('image', e.target.files[0]);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = existingAdditionalImages.length + newFiles.length;
      
      if (totalImages > 4) {
        alert('Maximum 4 additional images allowed');
        return;
      }
      
      onChange('additionalImages', [...(product.additionalImages || []), ...newFiles]);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Product Name"
        value={product.name}
        onChange={(e) => onChange('name', e.target.value)}
        required
      />
      <Textarea
        placeholder="Product Description"
        value={product.description}
        onChange={(e) => onChange('description', e.target.value)}
        required
      />
      <Textarea
        placeholder="Detailed Specifications"
        value={product.detailedSpecs}
        onChange={(e) => onChange('detailedSpecs', e.target.value)}
      />
      <Input
        type="number"
        step="0.01"
        placeholder="Price"
        value={product.price}
        onChange={(e) => onChange('price', e.target.value)}
        required
      />
      <Input
        type="number"
        step="0.01"
        placeholder="Original Price (optional)"
        value={product.originalPrice}
        onChange={(e) => onChange('originalPrice', e.target.value)}
      />
      <Select
        value={product.condition}
        onValueChange={(value) => onChange('condition', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select condition" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="New">New</SelectItem>
          <SelectItem value="Open Box">Open Box</SelectItem>
          <SelectItem value="Renewed">Renewed</SelectItem>
          <SelectItem value="Used">Used</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={product.category}
        onValueChange={(value) => onChange('category', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="laptops">Laptops</SelectItem>
          <SelectItem value="consumer-electronics">Consumer Electronics</SelectItem>
          <SelectItem value="phones">Phones</SelectItem>
        </SelectContent>
      </Select>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium mb-1">Main Product Image</label>
          {existingImageUrl && (
            <div className="mb-2 relative group">
              <img 
                src={existingImageUrl} 
                alt="Current main image" 
                className="w-32 h-32 object-contain border rounded"
              />
              {onDeleteMainImage && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={onDeleteMainImage}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <ProductImageUpload onChange={handleImageChange} isEditing={isEditing} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Additional Images (Max 4)</label>
          {existingAdditionalImages && existingAdditionalImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              {existingAdditionalImages.map((img) => (
                <div key={img.id} className="relative group">
                  <img 
                    src={img.image_url} 
                    alt="Additional product image" 
                    className="w-24 h-24 object-contain border rounded"
                  />
                  {onDeleteAdditionalImage && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteAdditionalImage(img.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          <ProductImageUpload onChange={handleAdditionalImagesChange} multiple isEditing={isEditing} />
          {product.additionalImages && product.additionalImages.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Selected new additional images: {product.additionalImages.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};