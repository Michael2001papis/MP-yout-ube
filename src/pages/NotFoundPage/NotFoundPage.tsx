import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-5xl font-semibold">404</h1>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">The route you requested does not exist.</p>
      <Link to="/" className="mt-4 inline-block text-sm font-medium text-purple-700 hover:underline dark:text-purple-300">
        Back to Home
      </Link>
    </div>
  )
}

