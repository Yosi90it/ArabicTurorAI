import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
