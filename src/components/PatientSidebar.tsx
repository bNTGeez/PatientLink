import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, User } from "lucide-react";
import LogoutButton from "./LogoutButton";

interface PatientSidebarProps {
  onNavigate: (view: string) => void;
}

const items = [
  {
    title: "Overview",
    icon: Home,
    view: "overview",
  },
  {
    title: "Profile",
    icon: User,
    view: "profile",
  },
];

export default function PatientSidebar({ onNavigate }: PatientSidebarProps) {
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
