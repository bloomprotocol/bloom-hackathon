import { metadata } from './page.meta'
export { metadata } 
import styles from "./page.module.css";
import CampaignOne from "@/components/campaign/CampaignOne";

export default function Activity() {
  
  return (
    <>
      <div className={styles["flashing-bg-absolute"]} />
      <div className="relative z-[1]">
        <CampaignOne />
      </div>
    </>
  );
}