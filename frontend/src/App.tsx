import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./components/ui/ToastProvider";

export default function App() {
  return (
    <ToastProvider>
      <main id="main-content" role="main">
        <AppRoutes />
      </main>
    </ToastProvider>
  );
}