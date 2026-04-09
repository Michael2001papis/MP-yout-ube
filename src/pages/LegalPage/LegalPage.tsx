import { useParams } from 'react-router-dom'

export default function LegalPage() {
  const { docType } = useParams()
  const type = (docType ?? '').toLowerCase()

  const title =
    type === 'terms'
      ? 'Terms of Service'
      : type === 'privacy'
        ? 'Privacy Policy'
        : type === 'copyright'
          ? 'Copyright'
          : 'Legal'

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
        <p>
          This is placeholder legal content for the demo. Replace it with your real policies before production.
        </p>
        <p>
          The platform supports guests and signed-in members, authentication (email/password + Google via Firebase),
          and protected routes for personal areas.
        </p>
      </div>
    </div>
  )
}

