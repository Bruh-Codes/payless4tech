import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import AdminAuth from "./AdminAuth";
import QueryProvider from "@/components/admin/QueryProvider";

const layout = ({ children }: { children: ReactNode }) => {
	return (
		<AdminAuth>
			<QueryProvider>
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
			</QueryProvider>
		</AdminAuth>
	);
};
export default layout;
