"use client";

import React, {
	createContext,
	useContext,
	useReducer,
	useCallback,
	useEffect,
	useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
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
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();
	const [isInitialized, setIsInitialized] = useState(false);

	// Load cart on mount or authentication change
	useEffect(() => {
		const loadInitialCart = async () => {
			if (isSessionPending) return;

			let loadedCart: CartState | null = null;
			let localCart = await getCart<CartState>();

			if (session?.user?.id) {
				// Fetch from Supabase
				const { data: dbCart, error } = await supabase
					.from("carts")
					.select("items")
					.eq("user_id", session.user.id)
					.single();

				if (!error && dbCart && Array.isArray(dbCart.items)) {
					// We only sync items from DB for now, re-calc total
					const items = dbCart.items as CartItem[];
					const total = items.reduce(
						(sum, item) => sum + item.price * item.quantity,
						0,
					);
					loadedCart = { items, total, extendedWarranty: false };

					// Merge local cart if exists and DB was empty
					if (items.length === 0 && localCart && localCart.items.length > 0) {
						loadedCart = localCart;
					}
				} else if (localCart && localCart.items.length > 0) {
					// Fallback to local if no DB record exists
					loadedCart = localCart;
				}
			} else {
				// Load exclusively from IndexedDB for guests
				if (localCart) {
					loadedCart = localCart;
				}
			}

			if (loadedCart) {
				dispatch({ type: "SET_CART", payload: loadedCart });
			}

			setIsInitialized(true);
		};

		loadInitialCart();
	}, [session?.user?.id, isSessionPending]);

	// Sync state to IndexedDB and Supabase when it changes
	useEffect(() => {
		if (!isInitialized) return;

		// Always keep local updated
		saveCart(state);

		// If user is logged in, sync to Supabase
		if (session?.user?.id) {
			const syncToDb = async () => {
				const { error } = await supabase.from("carts").upsert(
					{
						id: session.user.id, // Assuming cart ID can just mirror User ID or similar. Let's let Postgres handle id generation, or upsert by user_id
						user_id: session.user.id,
						items: state.items as any,
						updated_at: new Date().toISOString(),
					},
					{ onConflict: "user_id" },
				);
				if (error) {
					console.error("Failed to sync cart to database:", error);
				}
			};

			// Simple debouncing using a timeout
			const timerId = setTimeout(() => {
				syncToDb();
			}, 1000);

			return () => clearTimeout(timerId);
		}

		return undefined;
	}, [state, isInitialized, session?.user?.id]);

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
		if (session?.user?.id) {
			await supabase
				.from("carts")
				.update({ items: [] })
				.eq("user_id", session.user.id);
		}
	}, [session?.user?.id]);

	const checkout = useCallback(
		async (details: CheckoutDetails) => {
			try {
				// Calculate total with warranty if selected
				const warrantyAmount = details.extendedWarranty ? 500 : 0;
				const totalWithWarranty = state.total + warrantyAmount;

				// Create a new sale record
				const { data: sale, error: saleError } = await supabase
					.from("sales")
					.insert({
						user_id: session?.user?.id,
						name: details.name,
						total_amount: totalWithWarranty,
						status: "pending",
						phone_number: details.phoneNumber,
						delivery_address: details.deliveryAddress,
						email: details.email,
						extended_warranty: details.extendedWarranty,
						alternative_phone: details?.alternativePhone,
						fulfillment_status: "pending",
						product: state.items.map((item) => {
							return {
								name: item.name,
								quantity: item.quantity,
								price: item.price,
								id: item.id,
							};
						}),
					})
					.select()
					.single();

				if (saleError) {
					console.error("Error creating sale:", saleError);
					throw new Error(`Failed to create sale: ${saleError.message}`);
				}

				const saleItems = state.items.map((item) => ({
					sale_id: sale.id,
					product_id: item.id,
					quantity: item.quantity,
					price_at_time: item.price,
				}));

				const { error: itemsError } = await supabase
					.from("sale_items")
					.insert(saleItems);

				if (itemsError) {
					console.error("Error creating sale items:", itemsError);
					throw new Error(`Failed to create sale items: ${itemsError.message}`);
				}

				const totalAmount = totalWithWarranty * 100;

				await initiatePayment(details.email, totalAmount.toString(), saleItems);

				// 💡 define this outside or above for cleaner code
				async function initiatePayment(
					email: string,
					amount: string,
					items: {
						sale_id: string;
						product_id: string;
						quantity: number;
						price_at_time: number;
					}[],
				) {
					const response = await fetch("/api/paystack/init", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email, amount, items }),
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
		[state.total, session],
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
