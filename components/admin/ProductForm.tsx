import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductFormFields } from "./ProductFormFields";
import { useProductForm } from "@/hooks/useProductForm";

interface ProductFormProps {
  onProductAdded?: () => void;
  productId?: string;
  isEditing?: boolean;
}

export const ProductForm = ({ onProductAdded, productId, isEditing = false }: ProductFormProps) => {
  const {
    newProduct,
    isLoading,
    session,
    existingImageUrl,
    existingAdditionalImages,
    handleFormChange,
    handleSubmit,
    handleDeleteMainImage,
    handleDeleteAdditionalImage
  } = useProductForm({ productId, isEditing, onProductAdded });

  if (!session) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Product" : "Add New Product"}</CardTitle>
        <CardDescription>
          {isEditing 
            ? "Update the details below to modify this product."
            : "Fill in the details below to add a new product to the store."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProductFormFields 
            product={newProduct}
            onChange={handleFormChange}
            existingImageUrl={existingImageUrl}
            existingAdditionalImages={existingAdditionalImages}
            isEditing={isEditing}
            onDeleteMainImage={isEditing ? handleDeleteMainImage : undefined}
            onDeleteAdditionalImage={isEditing ? handleDeleteAdditionalImage : undefined}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Product" : "Add Product")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};