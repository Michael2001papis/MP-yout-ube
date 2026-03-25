export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">About</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        MP-yout-ube is a modern video platform inspired by YouTube. Users can watch videos immediately, register and log in
        (including Google authentication), manage their profile, upload local videos, and operate with structured roles and
        permissions.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        This demo uses React + React Router + Firebase, with a modular architecture for scalability.
      </p>
    </div>
  )
}

