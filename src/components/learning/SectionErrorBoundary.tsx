import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  /** Translated error message — pass from parent's useTranslations("common") */
  fallbackMessage: string;
  /** Translated retry label */
  retryLabel: string;
}

interface State {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-gray-200 p-6 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-gray-500">{this.props.fallbackMessage}</p>
          <Button variant="secondary" size="sm" onClick={this.handleRetry}>
            {this.props.retryLabel}
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
