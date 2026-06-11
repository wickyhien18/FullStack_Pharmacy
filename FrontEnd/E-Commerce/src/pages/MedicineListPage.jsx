
// ================================================================
// MedicineListPage.jsx — Style theo Bigspring
// ================================================================
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMedicines, useCategories } from "@/hooks/useMedicines.js";
import MedicineCard from "@/components/medicine/MedicineCard.jsx";
import Pagination from "@/components/common/Pagination.jsx";

export default function MedicineListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch]   = useState(searchParams.get("search") || "");
  const [page, setPage]       = useState(1);
  const categoryId            = searchParams.get("categoryId") || "";
  const sort                  = searchParams.get("sort") || "";

  const { data, isLoading }          = useMedicines({ page, limit: 20, search, categoryId, sort });
  const { data: categoriesData }     = useCategories();

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      search ? prev.set("search", search) : prev.delete("search");
      return prev;
    });
    setPage(1);
  };

  const handleCategory = (id) => {
    setSearchParams((prev) => {
      id ? prev.set("categoryId", id) : prev.delete("categoryId");
      return prev;
    });
    setPage(1);
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="text-center font-normal mb-8">Danh sách sản phẩm</h1>

        <div className="row">
          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside className="hidden md:block w-full md:w-1/4 px-4">
            <div className="shadow rounded-xl p-5">
              <h4 className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={16} /> Danh mục
              </h4>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleCategory("")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                      ${!categoryId ? "bg-primary text-white" : "text-text hover:bg-theme-light"}`}
                  >
                    Tất cả sản phẩm
                  </button>
                </li>
                {categoriesData?.items?.map((cat) => (
                  <li key={cat.categoryId}>
                    <button
                      onClick={() => handleCategory(cat.categoryId)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                        ${categoryId == cat.categoryId
                          ? "bg-primary text-white"
                          : "text-text hover:bg-theme-light"}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ── Main ────────────────────────────────────────── */}
          <div className="w-full md:w-3/4 px-4">
            {/* Search + Sort */}
            <div className="flex gap-3 mb-6">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light" size={16} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm thuốc..."
                    className="form-input w-full pl-9 rounded"
                  />
                </div>
                <button type="submit" className="btn btn-primary py-2 px-5 text-sm">
                  Tìm
                </button>
              </form>

              <select
                value={sort}
                onChange={(e) => {
                  setSearchParams((prev) => { prev.set("sort", e.target.value); return prev; });
                }}
                className="form-input rounded border border-border px-3 py-2 text-sm"
              >
                <option value="">Mặc định</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="bg-theme-light rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : data?.items?.length === 0 ? (
              <div className="text-center py-20 text-text">
                <p className="text-5xl mb-4">🔍</p>
                <p>Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-text mb-4">
                  Tìm thấy <span className="font-bold text-dark">{data?.total}</span> sản phẩm
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {data?.items?.map((medicine) => (
                    <MedicineCard key={medicine.medicineId} medicine={medicine} />
                  ))}
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={data?.totalPages || 1}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
