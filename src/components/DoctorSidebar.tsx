import { HomeIcon, UsersIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "./ui/sidebar";
import LogoutButton from "./LogoutButton";

interface DoctorSidebarProps {
  onNavigate: (view: string) => void;
}

export default function AppSidebar({ onNavigate }: DoctorSidebarProps) {
  const items = [
    {
      title: "Overview",
      icon: HomeIcon,
      view: "overview",
    },
    {
      title: "Patients",
      icon: UsersIcon,
      view: "patients",
    },
  ];
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-10 p-10">
            <h1 className="text-2xl font-bold text-gray-900">Patient Link</h1>
          </div>
          <div className="flex items-center gap-10">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-4 p-10">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title} className="text-lg py-4">
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      onClick={() => onNavigate(item.view)}
                    >
                      <button className="text-lg w-full flex items-center gap-3">
                        <item.icon className="w-8 h-8" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-5">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
