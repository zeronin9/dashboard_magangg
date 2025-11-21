import Link from 'next/link';

export default function MitraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Mitra - Warna Biru Tua */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-blue-800">
          Mitra Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/mitra" className="block px-4 py-2 rounded hover:bg-blue-800">
            Dashboard
          </Link>
          <Link href="/mitra/branches" className="block px-4 py-2 rounded hover:bg-blue-800">
            Kelola Cabang
          </Link>
          <Link href="/mitra/products" className="block px-4 py-2 rounded hover:bg-blue-800">
            Produk General
          </Link>
          <Link href="/mitra/licenses" className="block px-4 py-2 rounded hover:bg-blue-800">
            Lisensi Device
          </Link>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <span className="text-xs text-blue-300">Super Admin (L2)</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}