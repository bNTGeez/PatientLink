import { useAuth0 } from "@auth0/auth0-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { NavLink } from "react-router-dom";
import LoginButton from "./LoginButton";
import DashboardButton from "./DashboardButton";

export default function Navbar() {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="flex items-center p-4">
      <NavLink to="/" className="text-4xl font-bold text-blue-400 px-20 py-5">
        PatientLink
      </NavLink>
      <div className="flex justify-end w-full items-center gap-8 pr-20">
        <NavigationMenu viewport={false}>
          <NavigationMenuList className="gap-10">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-xl font-bold">
                About
              </NavigationMenuTrigger>
              <NavigationMenuContent className="!w-[300px] p-4">
                <NavigationMenuLink className="block">
                  About Me
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-xl font-bold">
                FAQ
              </NavigationMenuTrigger>
              <NavigationMenuContent className="!w-[300px] p-4">
                <NavigationMenuLink className="block">Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-xl font-bold">
                Services
              </NavigationMenuTrigger>
              <NavigationMenuContent className="!w-[300px] p-4">
                <NavigationMenuLink className="block">Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        {isAuthenticated ? <DashboardButton /> : <LoginButton />}
      </div>
    </div>
  );
}
