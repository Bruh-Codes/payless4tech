'use client'

import React, { createContext, useContext, useReducer } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface CartState {
  items: CartItem[];
  total: number;
  extendedWarranty: boolean;
}

interface CheckoutDetails {
  phoneNumber: string;
  alternativePhone?: string;
  deliveryAddress: string;
  gpsLocation?: string;
  email: string;
  extendedWarranty: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "TOGGLE_WARRANTY"; payload: boolean }
  | { type: "CLEAR_CART" };

const CartContext = createContext<{
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleWarranty: (value: boolean) => void;
  clearCart: () => void;
  checkout: (details: CheckoutDetails) => Promise<void>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          total: state.total + action.payload.price,
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + action.payload.price,
      };
    }
    case "REMOVE_ITEM": {
      const item = state.items.find(item => item.id === action.payload);
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (item ? item.price * item.quantity : 0),
      };
    }
    case "UPDATE_QUANTITY": {
      const item = state.items.find(item => item.id === action.payload.id);
      if (!item) return state;
      
      const quantityDiff = action.payload.quantity - item.quantity;
      if (action.payload.quantity === 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
          total: state.total - (item.price * item.quantity),
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.total + (item.price * quantityDiff),
      };
    }
    case "TOGGLE_WARRANTY":
      return {
        ...state,
        extendedWarranty: action.payload,
      };
    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        extendedWarranty: false,
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { 
    items: [], 
    total: 0, 
    extendedWarranty: false 
  });

  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    toast("Added to cart",{
      description: `${item.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const toggleWarranty = (value: boolean) => {
    dispatch({ type: "TOGGLE_WARRANTY", payload: value });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const checkout = async (details: CheckoutDetails) => {
    try {
      console.log('Starting checkout process with details:', details);
      
      // Calculate total with warranty if selected
      const warrantyAmount = details.extendedWarranty ? 500 : 0;
      const totalWithWarranty = state.total + warrantyAmount;

      console.log('Calculated total:', {
        baseTotal: state.total,
        warrantyAmount,
        totalWithWarranty
      });

      // Create a new sale record
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          total_amount: totalWithWarranty,
          status: "pending",
          phone_number: details.phoneNumber,
          alternative_phone: details.alternativePhone,
          delivery_address: details.deliveryAddress,
          gps_location: details.gpsLocation,
          email: details.email,
          extended_warranty: details.extendedWarranty,
        })
        .select()
        .single();

      if (saleError) {
        console.error('Error creating sale:', saleError);
        throw new Error(`Failed to create sale: ${saleError.message}`);
      }

      console.log('Sale created:', sale);

      const saleItems = state.items.map(item => ({
        sale_id: sale.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) {
        console.error('Error creating sale items:', itemsError);
        throw new Error(`Failed to create sale items: ${itemsError.message}`);
      }

      console.log('Sale items created:', saleItems);

      // Send order notification email
      try {
        const orderDetails = {
          saleId: sale.id,
          items: state.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: totalWithWarranty,
          customerDetails: {
            email: details.email,
            phoneNumber: details.phoneNumber,
            alternativePhone: details.alternativePhone,
            deliveryAddress: details.deliveryAddress,
            gpsLocation: details.gpsLocation,
          },
          extendedWarranty: details.extendedWarranty
        };

        const { error: emailError } = await supabase.functions.invoke(
          'send-order-email',
          {
            body: JSON.stringify({ orderDetails })
          }
        );

        if (emailError) {
          console.error('Error sending order notification:', emailError);
          // Don't throw here, continue with payment process even if email fails
        }
      } catch (emailError) {
        console.error('Error in email notification process:', emailError);
        // Don't throw here, continue with payment process even if email fails
      }

      // Initialize payment
      console.log('Initializing payment with Paystack...');
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment',
        {
          body: JSON.stringify({
            amount: totalWithWarranty,
            email: details.email,
            metadata: {
              sale_id: sale.id,
              custom_fields: [
                {
                  display_name: "Sale Reference",
                  variable_name: "sale_ref",
                  value: sale.id
                }
              ]
            }
          })
        }
      );

      if (paymentError) {
        console.error('Payment initialization error:', paymentError);
        throw new Error(`Payment initialization failed: ${paymentError.message}`);
      }

      console.log('Payment initialized:', paymentData);
      
      if (paymentData.url) {
        // Clear cart before redirecting
        clearCart();
        // Redirect to Paystack payment page
        window.location.href = paymentData.url;
      } else {
        throw new Error('Payment URL not received from Paystack');
      }

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed",{
        description: error.message || "An error occurred during checkout",
      });
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{ 
        state, 
        addItem, 
        removeItem, 
        updateQuantity, 
        toggleWarranty,
        clearCart,
        checkout 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
