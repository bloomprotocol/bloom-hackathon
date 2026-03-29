"use client";
import SupporterMission from "./supporter-mission";
import { RoleContentContext } from "../contexts/role-content-context";

export default function RoleContent() {
  return (
    <div className="w-full">
      <RoleContentContext.Provider value={{ isMobile: false, onCloseMobile: null }}>
        <SupporterMission />
      </RoleContentContext.Provider>
    </div>
  );
}
