"use client";
import { createContext, useContext } from "react";

export interface RoleContentContextType {
  isMobile: boolean;
  onCloseMobile: (() => void) | null;
}

export const RoleContentContext = createContext<RoleContentContextType | null>(null);

export const useRoleContentContext = () => {
  const context = useContext(RoleContentContext);
  if (!context) {
    throw new Error("useRoleContentContext must be used within a RoleContentProvider");
  }
  return context;
};
