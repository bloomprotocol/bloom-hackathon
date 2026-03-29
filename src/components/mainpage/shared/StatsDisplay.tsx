import React from 'react';
import styles from './StatsDisplay.module.css';
import mainStyles from '../mainpage.module.css';
import { COLORS } from './animations.config';
import { mainpageContent } from '../content.config';

interface StatsDisplayProps {
  variant: 'developer' | 'user';
  format: 'terminal' | 'character';
  stats: {
    users?: number;
    revenue?: number;
    user_feedback?: number;
    level?: number;
    points?: number;
    drops?: number;
  };
  className?: string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = React.memo(({ 
  variant, 
  format, 
  stats,
  className = ''
}) => {
  if (format === 'terminal') {
    return (
      <div className={`${mainStyles["terminal"]} ${className}`}>
        <div className={`${mainStyles["terminal-header"]} justify-between`}>
          <div className={mainStyles["terminal-dots"]}>
            <div className={mainStyles["terminal-dot-red"]}></div>
            <div className={mainStyles["terminal-dot-yellow"]}></div>
            <div className={mainStyles["terminal-dot-green"]}></div>
          </div>
          <div className="text-white text-bold font-mono">
            {mainpageContent.journeyTimeline.stats.title}
          </div>
        </div>
        <div className={mainStyles["terminal-content"]}>
          <div className={mainStyles["terminal-line"]}>
            <span className={mainStyles["prompt"]}>$</span> {mainpageContent.journeyTimeline.stats.command.substring(2)}
          </div>
          {stats.users !== undefined && (
            <div className={`${mainStyles["terminal-line"]} flex justify-between items-center`}>
              <span style={{ color: COLORS[variant].text }}>{mainpageContent.journeyTimeline.stats.labels.users}</span>
              <span className="text-[#6bcf7f] font-semibold">{stats.users.toLocaleString()}</span>
            </div>
          )}
          {stats.revenue !== undefined && (
            <div className={`${mainStyles["terminal-line"]} flex justify-between items-center`}>
              <span style={{ color: COLORS[variant].text }}>{mainpageContent.journeyTimeline.stats.labels.revenue}</span>
              <span className="text-[#6bcf7f] font-semibold">${stats.revenue.toLocaleString()}</span>
            </div>
          )}
          {stats.user_feedback !== undefined && (
            <div className={`${mainStyles["terminal-line"]} flex justify-between items-center`}>
              <span style={{ color: COLORS[variant].text }}>{mainpageContent.journeyTimeline.stats.labels.userFeedback}</span>
              <span className="text-[#6bcf7f] font-semibold">{stats.user_feedback.toLocaleString()}</span>
            </div>
          )}
          <div className={mainStyles["input-line"]}>
            <span className={mainStyles["input-prompt"]}>&gt;</span>
            <div className={mainStyles["cursor"]}></div>
          </div>
        </div>
      </div>
    );
  }

  // Character format (for RPG)
  return (
    <div className={`${styles.characterHeader} ${className}`}>
      <div className={styles.characterInfo}>
        <div className={styles.avatar}>{mainpageContent.rpg.character.avatar}</div>
        <div className={styles.characterDetails}>
          <div className={styles.characterName}>{mainpageContent.rpg.character.name}</div>
          <div className={styles.characterLevel}>
            <span>{mainpageContent.rpg.character.type}</span>
            <span className={styles.levelBadge}>{mainpageContent.rpg.character.levelPrefix} {stats.level || 5}</span>
          </div>
        </div>
      </div>

      <div className={styles.xpProgress}>
        {stats.points !== undefined && (
          <>
            <div className={styles.xpLabel}>
              <span>{mainpageContent.rpg.character.points.label}</span>
              <span>{stats.points}{mainpageContent.rpg.character.points.suffix}</span>
            </div>
            <div className={styles.xpBar}>
              <div 
                className={styles.xpPointsFill} 
                style={{ width: `${(stats.points / 1000) * 100}%` }}
              />
            </div>
          </>
        )}
        {stats.drops !== undefined && (
          <>
            <div className={`${styles.xpLabel} mt-[10px]`}>
              <span>{mainpageContent.rpg.character.drops.label}</span>
              <span className={`${styles.xpDropsText} font-bold`}>{stats.drops} {mainpageContent.rpg.character.drops.suffix}{(stats.level || 5) + 1}</span>
            </div>
            <div className={styles.xpBar}>
              <div 
                className={styles.xpDropsFill} 
                style={{ width: '97%' }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
});

StatsDisplay.displayName = 'StatsDisplay';

export default StatsDisplay; 