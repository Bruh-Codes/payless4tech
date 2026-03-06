"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

export function ThemeProvider({
	children,
	storageKey = "theme",
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	const pathname = usePathname();
	const isAdmin = pathname?.startsWith("/admin");

	React.useEffect(() => {
		if (isAdmin) return; // Let admins toggle themes freely

		const lockLightTheme = () => {
			document.documentElement.classList.remove("dark");
			document.documentElement.style.colorScheme = "light";
			window.localStorage.setItem(storageKey, "light");
		};

		lockLightTheme();

		const handleStorage = (event: StorageEvent) => {
			if (!event.key || event.key === storageKey) {
				lockLightTheme();
			}
		};

		const observer = new MutationObserver(() => {
			if (document.documentElement.classList.contains("dark")) {
				lockLightTheme();
			}
		});

		window.addEventListener("storage", handleStorage);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class", "style"],
		});

		return () => {
			window.removeEventListener("storage", handleStorage);
			observer.disconnect();
		};
	}, [storageKey, isAdmin]);

	return (
		<NextThemesProvider
			{...props}
			storageKey={storageKey}
			defaultTheme="light"
			enableSystem={false}
			forcedTheme={isAdmin ? undefined : "light"}
		>
			{children}
		</NextThemesProvider>
	);
}
