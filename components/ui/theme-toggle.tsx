"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = ({ children }: { children?: React.ReactNode }) => {
	const { setTheme, theme, systemTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const currentTheme = theme === "system" ? systemTheme : theme;

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => {
				const newTheme = currentTheme === "dark" ? "light" : "dark";
				setTheme(newTheme);
			}}
			className="text-foreground hover:bg-gray-100 dark:hover:bg-accent"
			aria-label="Toggle theme"
		>
			{currentTheme === "dark" ? (
				<Sun className="h-5 w-5" />
			) : (
				<Moon className="h-5 w-5" />
			)}
			{children}
		</Button>
	);
};

export default ThemeToggle;
