import { render, screen } from '@testing-library/react';
import { MissionRewardTiersCard } from '../MissionRewardTiersCard';

// Mock data structures for testing
const mockRewardTiers = [
  {
    _id: "tier-1",
    name: "Basic",
    drops: 100,
    iconUrl: "https://example.com/basic.png",
    description: "Basic reward tier for participants",
    order: 1
  },
  {
    _id: "tier-2", 
    name: "Premium",
    drops: 1000,
    iconUrl: "https://example.com/premium.png",
    description: "Premium reward tier for top performers",
    order: 2
  },
  {
    _id: "tier-3",
    name: "Quality",
    drops: 500,
    iconUrl: "https://example.com/quality.png", 
    description: "Quality reward tier for regular participants",
    order: 3
  }
];

describe('MissionRewardTiersCard', () => {
  test('sorts tiers by order field correctly', () => {
    render(<MissionRewardTiersCard rewardTiers={mockRewardTiers} />);
    
    // Get tier names specifically - look for exact matches (updated for new design)
    const basicTier = screen.getByText('Basic Analysis');
    const premiumTier = screen.getByText('Premium Analysis');  
    const qualityTier = screen.getByText('Quality Analysis');
    
    // Verify all tiers are present
    expect(basicTier).toBeInTheDocument();
    expect(premiumTier).toBeInTheDocument();
    expect(qualityTier).toBeInTheDocument();
    
    // Verify they appear in order by checking DOM order
    const allTierNames = screen.getAllByText(/Analysis$/);
    expect(allTierNames).toHaveLength(3);
    expect(allTierNames[0]).toHaveTextContent('Basic Analysis');
    expect(allTierNames[1]).toHaveTextContent('Premium Analysis');
    expect(allTierNames[2]).toHaveTextContent('Quality Analysis');
  });
  
  test('displays empty state when no tiers provided', () => {
    render(<MissionRewardTiersCard rewardTiers={[]} />);
    
    expect(screen.getByText('No reward tiers available')).toBeInTheDocument();
  });
  
  test('renders tier information correctly', () => {
    render(<MissionRewardTiersCard rewardTiers={mockRewardTiers} />);
    
    // Check header
    expect(screen.getByText('Reward Tiers')).toBeInTheDocument();
    
    // Check tier names (updated for new design - no descriptions shown)
    expect(screen.getByText('Basic Analysis')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    
    expect(screen.getByText('Premium Analysis')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument(); // Should be formatted with commas
  });
  
  test('handles missing tier data gracefully', () => {
    const tiersWithMissingData = [
      {
        _id: "tier-incomplete",
        name: "Incomplete",
        drops: 0,
        iconUrl: "",
        description: "Incomplete tier",
        order: 1
      }
    ];
    
    render(<MissionRewardTiersCard rewardTiers={tiersWithMissingData} />);
    
    expect(screen.getByText('Incomplete')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
  
  test('handles undefined rewardTiers prop', () => {
    render(<MissionRewardTiersCard />);
    
    expect(screen.getByText('No reward tiers available')).toBeInTheDocument();
  });
  
  test('applies correct styling classes', () => {
    const { container } = render(<MissionRewardTiersCard rewardTiers={mockRewardTiers} />);
    
    // Check if main container has correct classes (updated for new design)
    const mainDiv = container.querySelector('.backdrop-blur-\\[5px\\]');
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveClass('desktop:w-[320px]');
  });
});