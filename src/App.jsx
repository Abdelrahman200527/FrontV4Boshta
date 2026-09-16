import "./index.css";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { router } from "./routes.jsx";
import { queryClient } from "./lib/queryClient";
import config from "./config";
import { getUser } from "./utils/getUser";

function App() {
  // ============================================
  // Broadcast Listener (Test Feature)
  // ============================================
  useEffect(() => {
    const user = getUser();

    if (!user?.id) return;

    // --------------------------------------------
    // 1. Ping every 3s → server knows who's online
    // --------------------------------------------
    const ping = () => {
      fetch(`${config.apiUrl}/broadcast/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          role: user.role,
          name: user.full_name || user.name,
        }),
      }).catch(() => {});
    };

    ping();
    const pingInterval = setInterval(ping, 3000);

    // --------------------------------------------
    // 2. Poll for new messages every 3s
    // --------------------------------------------
    const checkMessages = async () => {
      try {
        const res = await fetch(
          `${config.apiUrl}/broadcast/messages/${user.id}`,
        );
        const data = await res.json();

        if (data?.success && Array.isArray(data.messages)) {
          for (const msg of data.messages) {
            toast.success(msg.message, {
              duration: 4000,
              position: "top-center",
            });
          }
        }
      } catch {
        // silent
      }
    };

    const msgInterval = setInterval(checkMessages, 3000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(msgInterval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
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
