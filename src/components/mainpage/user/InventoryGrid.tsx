import React, { useCallback } from 'react';
import styles from './rpg.module.css';

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  status: 'active' | 'coming-soon' | 'locked';
  color: string;
  countdown?: string;
  teaser?: string;
  unlockLevel?: number;
  power?: string;
}

interface InventoryGridProps {
  items: InventoryItem[];
  onItemClick?: (item: InventoryItem) => void;
}

const InventoryGrid: React.FC<InventoryGridProps> = React.memo(({ items, onItemClick }) => {
  const handleClick = useCallback((item: InventoryItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  }, [onItemClick]);

  return (
    <div className={`${styles.inventoryGrid} mt-5`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`${styles.inventorySlot} ${styles[item.id]} ${
            item.status === 'active' ? styles.equipped : ''
          } ${item.status === 'coming-soon' ? styles.comingSoon : ''} ${
            item.status === 'locked' ? styles.locked : ''
          }`}
          onClick={() => handleClick(item)}
          style={{
            '--item-color': item.color,
            '--animation-delay': `${index * 0.3}s`
          } as React.CSSProperties}
        >
          {item.status === 'coming-soon' && <div className={styles.loadingShimmer} />}

          {item.status !== 'locked' ? (
            <>
              <div className={item.status === 'coming-soon' ? styles.comingSoonIcon : styles.itemIcon}>
                {item.icon}
              </div>
              <div className={styles.itemName}>{item.name}</div>

              {item.status === 'active' && (
                <>
                  <div className={styles.itemPower}>{item.power}</div>
                  <div className={styles.notificationBadge}>5</div>
                </>
              )}

              {item.status === 'coming-soon' && (
                <>
                  <div className={styles.comingSoonLabel}>Unlocking</div>
                  <div className={styles.countdownTimer}>{item.countdown}</div>
                  <div className={styles.teaserText}>{item.teaser}</div>
                </>
              )}
            </>
          ) : (
            <>
              <div className={styles.lockIcon}>{item.icon}</div>
              <div className={styles.unlockLevel}>Unlock at LVL {item.unlockLevel}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
});

InventoryGrid.displayName = 'InventoryGrid';

export default InventoryGrid; 