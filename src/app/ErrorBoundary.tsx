import { Component, type ReactNode } from 'react';
import { Button, EmptyState } from '@/components/ui';

interface State { error: Error | null }

/** Catches render errors so one broken feature never blanks the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <EmptyState
        title="Something went wrong"
        text={this.state.error.message || 'An unexpected error occurred.'}
        action={<Button onClick={() => { this.setState({ error: null }); location.hash = '#/'; }}>Back to Ask</Button>}
      />
    );
  }
}
