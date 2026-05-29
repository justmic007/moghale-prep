'use client'

import { useState } from 'react'

export default function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false)

    function copy() {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative my-3 rounded-lg overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-400 font-mono">code</span>
                <button
                    onClick={copy}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
            </div>
            <pre className="overflow-x-auto p-4 bg-gray-900 text-gray-100 text-sm font-mono leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    )
}