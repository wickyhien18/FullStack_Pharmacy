import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-bold text-primary-500 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">
        Trang không tồn tại
      </h1>
      <p className="text-gray-500 mb-6">
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị xoá.
      </p>
      <Link
        to="/"
        className="bg-primary-500 text-white px-6 py-2.5 rounded-full
                               hover:bg-primary-600 transition text-sm font-medium"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
