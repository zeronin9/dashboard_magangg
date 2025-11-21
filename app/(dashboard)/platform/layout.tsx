import Link from 'next/link';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Platform - Warna Gelap */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-800">
          Horeka Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/platform" className="block px-4 py-2 rounded hover:bg-gray-800">
            Dashboard
          </Link>
          <Link href="/platform/subscriptions" className="block px-4 py-2 rounded hover:bg-gray-800">
            Paket Langganan
          </Link>
          <Link href="/platform/partners" className="block px-4 py-2 rounded hover:bg-gray-800">
            Daftar Mitra
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <span className="text-xs text-gray-500">Platform Level (L3)</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}