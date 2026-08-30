import Sidebar from "@/components/Sidebar";
import { AgentProvider } from "@/components/Agent";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentProvider>
      <div className="shell">
        <Sidebar />
        <div className="main">{children}</div>
      </div>
    </AgentProvider>
  );
}
