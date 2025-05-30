"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function ThemeHander() {
	const pathname = usePathname();
	const { setTheme } = useTheme();

	useEffect(() => {
		if (pathname.startsWith("/admin")) {
			setTheme("dark");
		} else {
			setTheme("light");
		}
	}, [pathname, setTheme]);

	return null;
}
