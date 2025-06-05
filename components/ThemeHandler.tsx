"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function ThemeHander() {
	const pathname = usePathname();
	const { setTheme } = useTheme();

	useLayoutEffect(() => {
		if (pathname.startsWith("/admin")) {
			setTheme("dark");
		} else {
			setTheme("light");
		}
	}, [pathname, setTheme]);

	return null;
}
