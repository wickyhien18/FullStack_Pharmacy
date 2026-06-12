import { Link } from "react-router";
function NotFoundPage() {
  return <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-7xl mb-5">😔</div>
      <h1 className="font-bold text-gray-800 mb-3" style={{ fontSize: "2rem" }}>404</h1>
      <h2 className="font-semibold text-gray-700 mb-3" style={{ fontSize: "1.1rem" }}>Trang không tồn tại</h2>
      <p className="text-gray-500 text-sm mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Hãy quay lại trang chủ để tiếp tục mua sắm.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/" className="px-6 py-3 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: "#1250dc" }}>
          Về trang chủ
        </Link>
        <Link to="/products" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50">
          Xem sản phẩm
        </Link>
      </div>
    </div>;
}
export {
  NotFoundPage as default
};
