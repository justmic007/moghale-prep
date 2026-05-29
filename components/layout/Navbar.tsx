import Link from 'next/link'

export default function Navbar() {
    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-bold text-gray-900">
                        Moghale<span className="text-indigo-600">Prep</span>
                    </span>
                </Link>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                    <Link href="/" className="hover:text-gray-900 transition-colors">
                        Dashboard
                    </Link>
                    <a
                        href="https://github.com/justmic007"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-900 transition-colors"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </nav>
    )
}
