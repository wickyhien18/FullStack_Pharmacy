import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

//Intermediary component between main.jsx and route.jsx
function App() {
  return <RouterProvider router={router} />;
}
export { App as default };
