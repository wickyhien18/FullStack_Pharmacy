import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-md">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Server đang gặp sự cố. Vui lòng thử lại sau ít phút.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ backgroundColor: "#1250dc" }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
