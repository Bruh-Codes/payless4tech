"use client";

import React, {
	createContext,
	useContext,
	useReducer,
	useCallback,
	useEffect,
	useState,
} from "react";
import { toast } from "sonner";
import { getCart, saveCart, clearCartStorage } from "@/lib/indexeddb";

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
	name: string;
	email: string;
	extendedWarranty?: boolean;
}

type CartAction =
	| { type: "ADD_ITEM"; payload: CartItem }
	| { type: "REMOVE_ITEM"; payload: string }
	| { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
	| { type: "TOGGLE_WARRANTY"; payload: boolean }
	| { type: "CLEAR_CART" }
	| { type: "SET_CART"; payload: CartState };

const initialState: CartState = {
	items: [],
	total: 0,
	extendedWarranty: false,
};

const CartContext = createContext<{
	state: CartState;
	addItem: (item: CartItem) => void;
	removeItem: (id: string) => void;
	updateQuantity: (id: string, quantity: number) => void;
	toggleWarranty: (value: boolean) => void;
	clearCart: () => void;
	checkout: (details: CheckoutDetails) => Promise<void>;
	isInitialized: boolean;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
	switch (action.type) {
		case "SET_CART":
			return action.payload;
		case "ADD_ITEM": {
			const existingItem = state.items.find(
				(item) => item.id === action.payload.id,
			);
			if (existingItem) {
				return {
					...state,
					items: state.items.map((item) =>
						item.id === action.payload.id
							? { ...item, quantity: item.quantity + 1 }
							: item,
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
			const item = state.items.find((item) => item.id === action.payload);
			return {
				...state,
				items: state.items.filter((item) => item.id !== action.payload),
				total: state.total - (item ? item.price * item.quantity : 0),
			};
		}
		case "UPDATE_QUANTITY": {
			const item = state.items.find((item) => item.id === action.payload.id);
			if (!item) return state;

			const quantityDiff = action.payload.quantity - item.quantity;
			if (action.payload.quantity === 0) {
				return {
					...state,
					items: state.items.filter((item) => item.id !== action.payload.id),
					total: state.total - item.price * item.quantity,
				};
			}

			return {
				...state,
				items: state.items.map((item) =>
					item.id === action.payload.id
						? { ...item, quantity: action.payload.quantity }
						: item,
				),
				total: state.total + item.price * quantityDiff,
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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(cartReducer, initialState);
	const [isInitialized, setIsInitialized] = useState(false);

	// Load cart on mount
	useEffect(() => {
		const loadInitialCart = async () => {
			const localCart = await getCart<CartState>();

			if (localCart) {
				dispatch({ type: "SET_CART", payload: localCart });
			}

			setIsInitialized(true);
		};

		loadInitialCart();
	}, []);

	// Sync state to localStorage when it changes
	useEffect(() => {
		if (!isInitialized) return;

		// Save to localStorage
		saveCart(state);
	}, [state, isInitialized]);

	const addItem = useCallback((item: CartItem) => {
		dispatch({ type: "ADD_ITEM", payload: item });
		toast("Added to cart", {
			description: `${item.name} has been added to your cart.`,
			duration: 2000,
		});
	}, []);

	const removeItem = useCallback((id: string) => {
		dispatch({ type: "REMOVE_ITEM", payload: id });
	}, []);

	const updateQuantity = useCallback((id: string, quantity: number) => {
		dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
	}, []);

	const toggleWarranty = useCallback((value: boolean) => {
		dispatch({ type: "TOGGLE_WARRANTY", payload: value });
	}, []);

	const clearCart = useCallback(async () => {
		dispatch({ type: "CLEAR_CART" });
		await clearCartStorage();
	}, []);

	const checkout = useCallback(
		async (details: CheckoutDetails) => {
			try {
				// Calculate total with warranty if selected
				const warrantyAmount = details.extendedWarranty ? 500 : 0;
				const totalWithWarranty = state.total + warrantyAmount;

				const totalAmount = totalWithWarranty * 100;

				await initiatePayment(
					details.email,
					totalAmount.toString(),
					state.items,
				);

				// 💡 define this outside or above for cleaner code
				async function initiatePayment(
					email: string,
					amount: string,
					items: CartItem[],
				) {
					const response = await fetch("/api/paystack/init", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							email,
							amount,
							orderDetails: details,
							items: items.map((item) => ({
								name: item.name,
								quantity: item.quantity,
								price: item.price,
								id: item.id,
								image_url: item.image_url,
							})),
						}),
					});

					const data = await response.json();

					if (response.ok && data?.url.access_code) {
						// Redirect to Paystack payment page
						window.location.href = data.url.authorization_url;
					} else {
						toast.error("Payment failed: " + (data?.error || "Unknown error"));
					}
				}
				return;
			} catch (error: any) {
				console.error("Checkout error:", error);
				toast.error("Checkout failed", {
					description: error.message || "An error occurred during checkout",
				});
				throw error;
			}
		},
		[state.total],
	);

	return (
		<CartContext.Provider
			value={{
				state,
				addItem,
				removeItem,
				updateQuantity,
				toggleWarranty,
				clearCart,
				checkout,
				isInitialized,
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
