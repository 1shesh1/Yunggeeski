"use client";

import { Component, type ReactNode } from "react";
import { AddOnSelector } from "@/components/AddOnSelector";
import type { AddOnId, TierId } from "@/lib/pricing";

interface AddOnSelectorSectionProps {
  selected: AddOnId[];
  onChange: (ids: AddOnId[]) => void;
  tierId: TierId | null;
}

interface State {
  hasError: boolean;
}

export class AddOnSelectorSection extends Component<AddOnSelectorSectionProps, State> {
  constructor(props: AddOnSelectorSectionProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AddOnSelectorSection] caught error:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Add-ons could not be loaded. Refresh the page or try again.
          </p>
        </div>
      );
    }
    return (
      <div className="border-t pt-6">
        <AddOnSelector
          selected={this.props.selected}
          onChange={this.props.onChange}
          tierId={this.props.tierId}
        />
      </div>
    );
  }
}
