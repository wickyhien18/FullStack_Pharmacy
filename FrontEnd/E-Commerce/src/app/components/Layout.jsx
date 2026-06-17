import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
function Layout() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f4f5f7" }}
    >
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
export { Layout as default };
