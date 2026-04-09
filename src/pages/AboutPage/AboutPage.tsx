export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">About</h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">About the platform</h2>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          MP-yout-ube is a modern content management platform designed to deliver a smooth, secure, and scalable user
          experience.
        </p>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          The system allows users to access personalized content, manage their profiles, and interact with a structured
          digital environment.
        </p>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          Behind the scenes, the platform is built with advanced technologies and a strong architectural approach,
          ensuring reliability, performance, and future scalability.
        </p>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Special attention has been given to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            <li>Clean and intuitive interface</li>
            <li>Secure authentication system</li>
            <li>Separation between user and administrator roles</li>
            <li>Continuous improvement and optimization</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4 border-t border-black/10 pt-10 dark:border-white/10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">About the developer</h2>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          This platform was developed by:
        </p>
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Michael Papismedov – MP</p>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          An independent developer focused on building high-quality, modern web applications with strong attention to
          detail, performance, and user experience.
        </p>
        <blockquote className="border-l-2 border-purple-500/60 pl-4 text-sm italic leading-relaxed text-gray-600 dark:border-purple-400/50 dark:text-gray-400">
          The goal is not just to build websites — but to create systems that feel professional, reliable, and ready for
          real-world use.
        </blockquote>
      </section>

      <footer className="border-t border-black/10 pt-8 text-xs text-gray-500 dark:border-white/10 dark:text-gray-500">
        <p>© 2026 Michael Papismedov – MP. All rights reserved.</p>
      </footer>
    </div>
  )
}
