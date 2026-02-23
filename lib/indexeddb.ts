export const initDB = (): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("payless4tech-store", 1);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (e) => {
			const db = (e.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains("cart")) {
				db.createObjectStore("cart");
			}
		};
	});
};

export const getCart = async <T>(): Promise<T | null> => {
	try {
		const db = await initDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction("cart", "readonly");
			const store = transaction.objectStore("cart");
			const request = store.get("current_cart");

			request.onsuccess = () => resolve((request.result as T) || null);
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.warn("IndexedDB not available, falling back to empty cart");
		return null;
	}
};

export const saveCart = async <T>(cart: T): Promise<void> => {
	try {
		const db = await initDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction("cart", "readwrite");
			const store = transaction.objectStore("cart");
			const request = store.put(cart, "current_cart");

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.warn("IndexedDB not available, unable to save cart details");
	}
};

export const clearCartStorage = async (): Promise<void> => {
	try {
		const db = await initDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction("cart", "readwrite");
			const store = transaction.objectStore("cart");
			const request = store.delete("current_cart");

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.warn("IndexedDB not available");
	}
};
