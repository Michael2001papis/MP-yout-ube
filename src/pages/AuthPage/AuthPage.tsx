import { Link } from 'react-router-dom'

import MemberAuthCard from './MemberAuthCard'

/**
 * Member authentication. Setup instructions: project README and .env.example.
 * Operators: /admin-access (footer).
 */
export default function AuthPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 pb-10 pt-2">
      <MemberAuthCard />

      <footer className="mt-12 border-t border-black/5 pt-6 text-center dark:border-white/10">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Platform operator?{' '}
          <Link
            to="/admin-access"
            state={{ from: '/auth' }}
            className="font-medium text-purple-700 hover:underline dark:text-purple-300"
          >
            Administrator entry
          </Link>
          <span className="mx-1 text-gray-400">·</span>
          separate from member sign-in
        </p>
      </footer>
    </div>
  )
}
