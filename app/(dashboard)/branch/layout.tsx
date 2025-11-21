import Link from 'next/link';

export default function BranchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Cabang - Warna Hijau Tua atau Netral */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-emerald-700">
          Branch Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/branch" className="block px-4 py-2 rounded hover:bg-emerald-700">
            Ringkasan
          </Link>
          <Link href="/branch/sales" className="block px-4 py-2 rounded hover:bg-emerald-700">
            Laporan Penjualan
          </Link>
          <Link href="/branch/expenses" className="block px-4 py-2 rounded hover:bg-emerald-700">
            Pengeluaran
          </Link>
          <Link href="/branch/cashiers" className="block px-4 py-2 rounded hover:bg-emerald-700">
            Manajemen Kasir
          </Link>
        </nav>
        <div className="p-4 border-t border-emerald-700">
          <span className="text-xs text-emerald-300">Branch Admin (L1)</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}