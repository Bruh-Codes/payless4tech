import { ReactNode } from "react";
import DashboardHeader from "./components/DashboardHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "./components/DashboardSidebar";

const layout = ({ children }: { children: ReactNode }) => {
	return (
		<SidebarProvider>
			<DashboardSidebar />
			<SidebarInset>
				<div className="flex flex-1 flex-col">
					<DashboardHeader />

					<main className=" flex flex-1 overflow-y-auto p-4 md:p-6">
						{children}
					</main>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default layout;
