// ================================================================
// MedicineListPage.jsx — Trang danh sách sản phẩm
// ================================================================
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMedicines, useCategories } from "@/hooks/useMedicines.js";
import MedicineCard from "@/components/medicine/MedicineCard.jsx";

export default function MedicineListPage() {
  // useSearchParams: đọc/ghi query string trên URL (?search=...&categoryId=...)
  // Giúp user có thể share link với filter đang chọn
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(1);

  // Lấy params từ URL
  const categoryId = searchParams.get("categoryId") || "";
  const sort = searchParams.get("sort") || "";

  const { data, isLoading } = useMedicines({
    page,
    limit: 20,
    search,
    categoryId,
    sort,
  });
  const { data: categoriesData } = useCategories();

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (search) prev.set("search", search);
      else prev.delete("search");
      return prev;
    });
    setPage(1); // reset về trang 1 khi search mới
  };

  const handleCategory = (id) => {
    setSearchParams((prev) => {
      if (id) prev.set("categoryId", id);
      else prev.delete("categoryId");
      return prev;
    });
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* ── Sidebar filter ────────────────────────────────── */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <SlidersHorizontal size={16} /> Danh mục
            </h3>
            <ul className="space-y-1">
              {/* Tất cả */}
              <li>
                <button
                  onClick={() => handleCategory("")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                    ${!categoryId ? "bg-primary-50 text-primary-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Tất cả sản phẩm
                </button>
              </li>
              {categoriesData?.items?.map((cat) => (
                <li key={cat.categoryId}>
                  <button
                    onClick={() => handleCategory(cat.categoryId)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                      ${
                        categoryId == cat.categoryId
                          ? "bg-primary-50 text-primary-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Search + sort bar */}
          <div className="flex gap-3 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm thuốc..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:border-primary-400"
                />
              </div>
              <button
                type="submit"
                className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600"
              >
                Tìm
              </button>
            </form>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) =>
                setSearchParams((prev) => {
                  prev.set("sort", e.target.value);
                  return prev;
                })
              }
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Mặc định</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>

          {/* Kết quả */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(12)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-xl h-64 animate-pulse"
                  />
                ))}
            </div>
          ) : data?.items?.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-4xl mb-4">🔍</p>
              <p>Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Tìm thấy{" "}
                <span className="font-semibold text-gray-700">
                  {data?.total}
                </span>{" "}
                sản phẩm
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data?.items?.map((medicine) => (
                  <MedicineCard key={medicine.medicineId} medicine={medicine} />
                ))}
              </div>

              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition
                        ${
                          p === page
                            ? "bg-primary-500 text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-primary-400"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
