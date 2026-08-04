// ================================================================
// AppLoadingContext.jsx — Chia sẻ trạng thái loading nền giữa
// AuthInitializer (nơi fetch data) và Layout (nơi hiển thị overlay)
// ================================================================
import { createContext, useContext } from "react";

export const AppLoadingContext = createContext({ isWorking: false });

export const useAppLoading = () => useContext(AppLoadingContext);
