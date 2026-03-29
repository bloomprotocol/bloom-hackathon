import { render, screen } from '@testing-library/react';
import { MissionSelectionCriteriaCard } from '../MissionSelectionCriteriaCard';

const mockCriteria = [
  "Complete daily check-in",
  "Join Telegram group and stay active",
  "Follow Twitter account and engage with posts",
  "Have a verified wallet address"
];

describe('MissionSelectionCriteriaCard', () => {
  test('renders all criteria items in order', () => {
    render(<MissionSelectionCriteriaCard criteria={mockCriteria} />);
    
    // Check header
    expect(screen.getByText('Selection Criteria')).toBeInTheDocument();
    
    // Check all criteria are displayed
    mockCriteria.forEach(criterion => {
      expect(screen.getByText(criterion)).toBeInTheDocument();
    });
  });
  
  test('shows empty state when no criteria provided', () => {
    render(<MissionSelectionCriteriaCard criteria={[]} />);
    
    expect(screen.getByText('No specific criteria required')).toBeInTheDocument();
  });
  
  test('renders header correctly', () => {
    render(<MissionSelectionCriteriaCard criteria={mockCriteria} />);
    
    expect(screen.getByText('Selection Criteria')).toBeInTheDocument();
    // Description has been removed in new design
  });
  
  test('handles undefined criteria prop', () => {
    render(<MissionSelectionCriteriaCard />);
    
    expect(screen.getByText('No specific criteria required')).toBeInTheDocument();
  });
  
  test('handles single criterion', () => {
    const singleCriterion = ["Must be an active community member"];
    
    render(<MissionSelectionCriteriaCard criteria={singleCriterion} />);
    
    expect(screen.getByText('Must be an active community member')).toBeInTheDocument();
    expect(screen.queryByText('No specific criteria required')).not.toBeInTheDocument();
  });
  
  test('applies correct styling classes', () => {
    const { container } = render(<MissionSelectionCriteriaCard criteria={mockCriteria} />);
    
    // Check if main container has correct classes (updated for new design)
    const mainDiv = container.querySelector('.backdrop-blur-\\[5px\\]');
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveClass('desktop:w-[320px]');
  });
  
  test('renders bullet points for each criterion', () => {
    const { container } = render(<MissionSelectionCriteriaCard criteria={mockCriteria} />);
    
    // Count list items (using native HTML list in new design)
    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(mockCriteria.length);
  });
  
  test('handles long text criteria', () => {
    const longCriteria = [
      "This is a very long criterion that should wrap to multiple lines and still maintain proper spacing with the bullet point alignment and readability for users."
    ];
    
    render(<MissionSelectionCriteriaCard criteria={longCriteria} />);
    
    expect(screen.getByText(longCriteria[0])).toBeInTheDocument();
  });
});