// ================================================================
// NotFoundPage.jsx — Convert từ bigspring 404.js
// ================================================================
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4">404</h1>
            <p className="text-text mb-6">
              Trang bạn tìm kiếm không tồn tại hoặc đã bị xoá.
            </p>
            <Link to="/" className="btn btn-primary inline-block">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
