import { useAuth0 } from "@auth0/auth0-react";
import { useMemo } from "react";

const NAMESPACE = import.meta.env.VITE_AUTH0_NAMESPACE;

export default function getUserRoles() {
  const { user, isAuthenticated } = useAuth0();

  const roles = useMemo<string[]>(() => {
    if (!isAuthenticated || !user) {
      return [];
    }
    return user[`${NAMESPACE}roles`] || [];
  }, [user, isAuthenticated]);

  const permissions = useMemo<string[]>(() => {
    if (!isAuthenticated || !user) {
      return [];
    }
    return user[`${NAMESPACE}permissions`] || [];
  }, [user, isAuthenticated]);

  const isDoctor = useMemo<boolean>(() => roles.includes("doctor"), [roles]);
  const isPatient = useMemo<boolean>(() => roles.includes("patient"), [roles]);

  return { roles, permissions, isAuthenticated, isDoctor, isPatient };
}
