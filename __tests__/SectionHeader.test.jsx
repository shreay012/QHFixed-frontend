import { render, screen } from '@testing-library/react';
import SectionHeader from '@/components/common/SectionHeader';

describe('SectionHeader', () => {
  it('renders title correctly', () => {
    render(<SectionHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<SectionHeader title="Test Title" subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('applies centered class by default', () => {
    render(<SectionHeader title="Test Title" />);
    const container = screen.getByText('Test Title').parentElement;
    expect(container).toHaveClass('text-center');
  });

  it('applies left alignment when centered is false', () => {
    render(<SectionHeader title="Test Title" centered={false} />);
    const container = screen.getByText('Test Title').parentElement;
    expect(container).toHaveClass('text-left');
  });
});