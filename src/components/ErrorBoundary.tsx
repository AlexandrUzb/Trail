import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In development, log the error and component stack
    if ((import.meta as any)?.env?.DEV) {
      console.error('[ErrorBoundary caught error]:', error, errorInfo);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-white border border-gray-200/80 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-teal-600">
              <i className="ri-shield-cross-line text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {this.props.fallbackTitle || "Kutilmagan xatolik yuz berdi"}
            </h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {this.props.fallbackMessage || 
                "Tizimda vaqtinchalik texnik nosozlik yuzaga keldi. Iltimos, sahifani yangilang yoki bosh sahifaga qayting."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <i className="ri-refresh-line text-base"></i>
                <span>Sahifani yangilash</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:border-teal-500 hover:text-teal-600 text-gray-700 text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition-colors cursor-pointer"
              >
                <i className="ri-home-line text-base"></i>
                <span>Bosh sahifa</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
