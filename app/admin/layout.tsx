import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import AdminAuth from "./AdminAuth";
import { ThemeProvider } from "@/components/theme-provider";
const layout = ({ children }: { children: ReactNode }) => {
	return (
		<AdminAuth>
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				enableSystem={true}
				storageKey="theme"
			>
				<SidebarProvider>
					<AppSidebar variant="inset" />
					<SidebarInset>
						<div className="flex flex-1 flex-col">
							<div className="@container/main flex flex-1 flex-col p-5">
								{children}
							</div>
						</div>
					</SidebarInset>
				</SidebarProvider>
			</ThemeProvider>
		</AdminAuth>
	);
};
export default layout;
