import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAppLoading } from "./AppLoadingContext.jsx";

function Layout() {
  const { isWorking } = useAppLoading();
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f4f5f7" }}
    >
      {/* relative + z-50: đảm bảo luôn nằm TRÊN overlay của main, dù Header có sticky/fixed gì */}
      <div className="relative z-50">
        <Header />
      </div>

      {/* relative để overlay định vị tuyệt đối bên trong đúng vùng này */}
      <main className="flex-1 relative z-0">
        <Outlet />

        {/* Overlay mờ + chặn click — z-40, thấp hơn Header/Footer (z-50) */}
        {isWorking && (
          <div
            className="absolute inset-0 z-40 flex items-center justify-center
                          bg-black/5 backdrop-blur-[1px]"
          >
            <div
              className="flex flex-col items-center gap-2 bg-white rounded-2xl
                            px-8 py-6 shadow-md"
            >
              <div className="text-3xl">💊</div>
              <span className="text-xs text-gray-400">Đang tải...</span>
            </div>
          </div>
        )}
      </main>

      <div className="relative z-50">
        <Footer />
      </div>
    </div>
  );
}
export { Layout as default };
