import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100 p-4">
            <h1 className="text-2xl font-bold mb-4 text-red-500">Authentication Error</h1>
            <p className="mb-6 text-zinc-400">There was an issue verifying your login credentials. Please try again.</p>
            <Link
                href="/login"
                className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded hover:bg-zinc-200 transition-colors"
            >
                Return to Login
            </Link>
        </div>
    )
}
