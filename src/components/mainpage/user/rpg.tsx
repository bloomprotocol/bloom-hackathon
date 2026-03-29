'use client'

import React, { useCallback, useMemo } from 'react'
import styles from './rpg.module.css'
import AnimatedHeader from '../shared/AnimatedHeader'
import StatsDisplay from '../shared/StatsDisplay'
import EmailSignupForm from '../shared/EmailSignupForm'
import BackToTerminalButton from '../shared/BackToTerminalButton'
import MagicParticles from './MagicParticles'
import InventoryGrid, { InventoryItem } from './InventoryGrid'
import { mainpageContent } from '../content.config'

interface RPGProps {
    selectedOption: number;
    selectedOptionText: string;
    onBackToTerminal?: () => void;
}

// 將 inventory items 移到組件外部，避免每次渲染重新創建
const INVENTORY_ITEMS: InventoryItem[] = [
    {
        id: 'spark',
        name: mainpageContent.rpg.inventory.items.spark.name,
        icon: mainpageContent.rpg.inventory.items.spark.icon,
        status: 'coming-soon',
        color: '#ff1493',
        countdown: mainpageContent.rpg.inventory.items.spark.countdown,
        teaser: mainpageContent.rpg.inventory.items.spark.teaser
    },
    {
        id: 'fund',
        name: mainpageContent.rpg.inventory.items.fund.name,
        icon: mainpageContent.rpg.inventory.items.fund.icon,
        status: 'coming-soon',
        color: '#00ff88',
        countdown: mainpageContent.rpg.inventory.items.fund.countdown,
        teaser: mainpageContent.rpg.inventory.items.fund.teaser
    },
    {
        id: 'boost',
        name: mainpageContent.rpg.inventory.items.boost.name,
        icon: mainpageContent.rpg.inventory.items.boost.icon,
        status: 'active',
        color: '#ba55d3',
        power: mainpageContent.rpg.inventory.items.boost.power
    },
    {
        id: 'locked1',
        name: '',
        icon: mainpageContent.rpg.inventory.items.locked.icon,
        status: 'locked',
        color: '#444',
        unlockLevel: 10
    },
    {
        id: 'locked2',
        name: '',
        icon: mainpageContent.rpg.inventory.items.locked.icon,
        status: 'locked',
        color: '#444',
        unlockLevel: 15
    },
    {
        id: 'locked3',
        name: '',
        icon: mainpageContent.rpg.inventory.items.locked.icon,
        status: 'locked',
        color: '#444',
        unlockLevel: 20
    }
];

const RPG: React.FC<RPGProps> = ({ selectedOption, selectedOptionText, onBackToTerminal }) => {

    const handleItemClick = useCallback((item: InventoryItem) => {
        if (item.status === 'active') {
            // alert(mainpageContent.rpg.inventory.alerts.active)
        } else if (item.status === 'coming-soon') {
            // alert(mainpageContent.rpg.inventory.alerts.comingSoon.replace('{name}', item.name).replace('{countdown}', item.countdown || ''))
        }
    }, []);

    // Memoize stats object
    const stats = useMemo(() => ({
        level: 5,
        points: 950,
        drops: 30
    }), []);

    return (
        <div className={styles.container}>
            {/* Magic particles - 使用獨立組件 */}
            <MagicParticles />

            {/* Header - 使用共用組件 */}
            <AnimatedHeader
                title={mainpageContent.rpg.header.title}
                subtitle={mainpageContent.rpg.header.subtitle}
                variant="user"
            />

            {/* Character Header / Stats - 使用共用組件 */}
            <StatsDisplay
                variant="user"
                format="character"
                stats={stats}
            />

            {/* Inventory Grid - 使用獨立組件 */}
            <InventoryGrid 
                items={INVENTORY_ITEMS}
                onItemClick={handleItemClick}
            />

            {/* Email Signup - 使用共用組件 */}
            <EmailSignupForm
                variant="user"
                title={mainpageContent.rpg.emailSignup.title}
                buttonText={mainpageContent.rpg.emailSignup.buttonTexts}
                successButtonText={mainpageContent.rpg.emailSignup.successButtonText}
                placeholderText={mainpageContent.rpg.emailSignup.placeholderText}
                successPlaceholderText={mainpageContent.rpg.emailSignup.successPlaceholderText}
                show={true}
                className="mt-5"
                referralCode=""
                selectedOption={selectedOption}
                selectedOptionText={selectedOptionText}
            />

            {/* Back button - 使用共用組件 */}
            <BackToTerminalButton onBack={onBackToTerminal!} />
        </div>
    )
}

export default RPG