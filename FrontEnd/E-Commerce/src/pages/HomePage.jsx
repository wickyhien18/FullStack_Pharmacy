// ================================================================
// HomePage.jsx — Trang chủ
// ================================================================
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useCategories, useMedicines } from "@/hooks/useMedicines.js";
import MedicineCard from "@/components/medicine/MedicineCard.jsx";

export default function HomePage() {
  // Lấy categories để render danh mục nhanh
  const { data: categories } = useCategories();

  // Lấy sản phẩm nổi bật — limit 8 sản phẩm đầu
  const { data: medicinesData, isLoading } = useMedicines({
    limit: 8,
    page: 1,
  });

  return (
    <div>
      {/* ── Hero Banner ───────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Nhà thuốc online uy tín
          </h1>
          <p className="text-primary-100 mb-8 text-lg">
            Hơn 10,000 sản phẩm thuốc và thực phẩm chức năng chính hãng
          </p>
          <Link
            to="/medicines"
            className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold
                       hover:bg-primary-50 transition inline-block"
          >
            Mua ngay
          </Link>
        </div>
      </section>

      {/* ── Danh mục nhanh ────────────────────────────────────── */}
      {categories?.items?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-xl font-bold text-gray-800 mb-5">
            Danh mục sản phẩm
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categories.items.map((cat) => (
              <Link
                key={cat.categoryId}
                to={`/medicines?categoryId=${cat.categoryId}`}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl
                           border border-gray-100 hover:border-primary-300 hover:shadow-sm
                           transition text-center group"
              >
                <span className="text-2xl">💊</span>
                <span className="text-xs text-gray-600 group-hover:text-primary-600 font-medium line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Sản phẩm nổi bật ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800">Sản phẩm nổi bật</h2>
          <Link
            to="/medicines"
            className="text-sm text-primary-600 hover:underline flex items-center gap-1"
          >
            Xem tất cả <ChevronRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          // Skeleton loading — giữ layout không bị giật
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-xl h-64 animate-pulse"
                />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {medicinesData?.items?.map((medicine) => (
              <MedicineCard key={medicine.medicineId} medicine={medicine} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
