import "./index.css";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { router } from "./routes.jsx";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/* كل رسائل التطبيق (نجاح / خطأ / تنبيه) تظهر هنا */}
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={3000}
        dir="rtl"
        toastOptions={{ style: { fontFamily: "inherit" } }}
      />
    </QueryClientProvider>
  );
}

export default App;
