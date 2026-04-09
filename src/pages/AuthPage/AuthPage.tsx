import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import FirebaseConfigStatus from '../../components/auth/FirebaseConfigStatus'
import { useAuth } from '../../context/AuthContext'
import { missingFirebaseEnv } from '../../services/firebase'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>
type ForgotForm = z.infer<typeof forgotSchema>

function AdminAccessShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  )
}

function memberHeadline(forgotMode: boolean, mode: 'login' | 'register'): { title: string; subtitle: string } {
  if (forgotMode) {
    return {
      title: 'Reset your password',
      subtitle: 'We’ll email you a secure link to choose a new password.',
    }
  }
  if (mode === 'register') {
    return {
      title: 'Create your account',
      subtitle: 'Join to upload, engage with content, and personalize your experience.',
    }
  }
  return {
    title: 'Member sign in',
    subtitle: 'Welcome back. Sign in to manage your profile, uploads, and library.',
  }
}

export default function AuthPage() {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
    error,
    firebaseReady,
    user,
    role,
  } = useAuth()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login'

  const location = useLocation()
  const navigate = useNavigate()
  const fromPath = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ? String(state.from) : '/'
  }, [location.state])

  const [forgotMode, setForgotMode] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)

  const { title: memberTitle, subtitle: memberSubtitle } = memberHeadline(forgotMode, mode)

  const {
    register,
    handleSubmit,
    formState: { errors: loginErrors, isSubmitting: loginSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const forgotForm = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  async function onLogin(data: LoginForm) {
    try {
      await loginWithEmail(data.email, data.password)
      navigate(fromPath, { replace: true })
    } catch {
      // error is shown by AuthContext
    }
  }

  async function onRegister(data: RegisterForm) {
    try {
      await registerWithEmail(data.email, data.password, data.name)
      navigate(fromPath, { replace: true })
    } catch {
      // error is shown by AuthContext
    }
  }

  async function onForgot(data: ForgotForm) {
    try {
      await resetPassword(data.email)
      setForgotMode(false)
      navigate('/auth?mode=login', { replace: true })
    } catch {
      // error is shown by AuthContext
    }
  }

  const signInDisabled = !firebaseReady

  return (
    <div className="mx-auto max-w-lg px-1">
      <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
        {/* —— Part 1: Member sign-in (identity + actions) —— */}
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">{memberTitle}</h1>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{memberSubtitle}</p>
        </header>

        {/* —— Part 2: System / Firebase status (only when needed) —— */}
        {!firebaseReady ? (
          <div className="mt-8">
            <FirebaseConfigStatus missingKeys={missingFirebaseEnv} />
          </div>
        ) : null}

        {firebaseReady && error ? (
          <div
            className="mt-8 rounded-xl border border-red-200/90 bg-red-50/90 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {/* Member actions: visually primary */}
        <div className="mt-8">
          {!firebaseReady && !forgotMode ? (
            <p className="mb-4 text-xs leading-relaxed text-gray-500 dark:text-gray-500">
              Sign-in options below are intentionally inactive until configuration is finished—they will work as soon as
              the environment is ready.
            </p>
          ) : null}

          <div className="space-y-4">
            {!forgotMode && (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setGoogleBusy(true)
                      await loginWithGoogle()
                      navigate(fromPath, { replace: true })
                    } catch {
                      // error is shown by AuthContext
                    } finally {
                      setGoogleBusy(false)
                    }
                  }}
                  disabled={signInDisabled || googleBusy}
                  aria-busy={googleBusy}
                  aria-disabled={signInDisabled}
                  className="flex w-full items-center justify-center rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-45 dark:border-white/15 dark:bg-gray-950/30 dark:text-gray-100 dark:hover:bg-gray-900/50"
                >
                  {googleBusy ? 'Connecting…' : 'Continue with Google'}
                </button>

                <div className="flex items-center gap-4 py-1">
                  <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    or email
                  </span>
                  <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                </div>
              </>
            )}

            {!forgotMode && mode === 'login' ? (
              <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200/80 dark:border-white/10 dark:bg-gray-950/40 dark:focus:ring-purple-900/40"
                    {...register('email')}
                  />
                  {loginErrors.email ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{loginErrors.email.message}</p> : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200/80 dark:border-white/10 dark:bg-gray-950/40 dark:focus:ring-purple-900/40"
                    {...register('password')}
                  />
                  {loginErrors.password ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{loginErrors.password.message}</p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={loginSubmitting || signInDisabled}
                  className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:pointer-events-none disabled:opacity-45 dark:hover:bg-purple-500"
                >
                  {loginSubmitting ? 'Signing in…' : 'Sign in'}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="w-full text-center text-sm font-medium text-purple-700 hover:underline dark:text-purple-300"
                >
                  Forgot password?
                </button>

                <div className="pt-1 text-center text-sm text-gray-600 dark:text-gray-400">
                  New here?{' '}
                  <Link to="/auth?mode=register" className="font-medium text-purple-700 hover:underline dark:text-purple-300">
                    Create an account
                  </Link>
                </div>
              </form>
            ) : null}

            {!forgotMode && mode === 'register' ? (
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200/80 dark:border-white/10 dark:bg-gray-950/40 dark:focus:ring-purple-900/40"
                    {...registerForm.register('name')}
                  />
                  {registerForm.formState.errors.name ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{registerForm.formState.errors.name.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="email2">
                    Email
                  </label>
                  <input
                    id="email2"
                    type="email"
                    autoComplete="email"
                    className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200/80 dark:border-white/10 dark:bg-gray-950/40 dark:focus:ring-purple-900/40"
                    {...registerForm.register('email')}
                  />
                  {registerForm.formState.errors.email ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{registerForm.formState.errors.email.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="password2">
                    Password
                  </label>
                  <input
                    id="password2"
                    type="password"
                    autoComplete="new-password"
                    className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200/80 dark:border-white/10 dark:bg-gray-950/40 dark:focus:ring-purple-900/40"
                    {...registerForm.register('password')}
                  />
                  {registerForm.formState.errors.password ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{registerForm.formState.errors.password.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="confirm">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200/80 dark:border-white/10 dark:bg-gray-950/40 dark:focus:ring-purple-900/40"
                    {...registerForm.register('confirmPassword')}
                  />
                  {registerForm.formState.errors.confirmPassword ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={registerForm.formState.isSubmitting || signInDisabled}
                  className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:pointer-events-none disabled:opacity-45 dark:hover:bg-purple-500"
                >
                  {registerForm.formState.isSubmitting ? 'Creating account…' : 'Create account'}
                </button>

                <div className="pt-1 text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link to="/auth?mode=login" className="font-medium text-purple-700 hover:underline dark:text-purple-300">
                    Sign in
                  </Link>
                </div>
              </form>
            ) : null}

            {forgotMode ? (
              <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="forgot-email">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200/80 dark:border-white/10 dark:bg-gray-950/40 dark:focus:ring-purple-900/40"
                    {...forgotForm.register('email')}
                  />
                  {forgotForm.formState.errors.email ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{forgotForm.formState.errors.email.message}</p>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={forgotForm.formState.isSubmitting || signInDisabled}
                  className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:pointer-events-none disabled:opacity-45 dark:hover:bg-purple-500"
                >
                  {forgotForm.formState.isSubmitting ? 'Sending…' : 'Send reset link'}
                </button>
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="w-full text-center text-sm font-medium text-purple-700 hover:underline dark:text-purple-300"
                >
                  Back to sign in
                </button>
              </form>
            ) : null}
          </div>
        </div>

        {/* —— Part 3: Administrator access —— */}
        {!forgotMode ? (
          <section
            className="mt-10 border-t border-black/10 pt-10 dark:border-white/10"
            aria-labelledby="admin-access-heading"
          >
            <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-b from-violet-50/50 to-transparent px-5 py-5 dark:border-violet-900/30 dark:from-violet-950/20 dark:to-transparent">
              <div className="flex gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200"
                  aria-hidden
                >
                  <AdminAccessShieldIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  <div>
                    <h2
                      id="admin-access-heading"
                      className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-900/90 dark:text-violet-200/95"
                    >
                      Administrator access
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      Restricted to platform operators. The same secure sign-in applies; elevated permissions are assigned
                      only to approved accounts.
                    </p>
                  </div>
                  {firebaseReady && role === 'admin' && user ? (
                    <Link
                      to="/admin"
                      className="flex w-full items-center justify-center rounded-xl border border-violet-500/30 bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:hover:bg-violet-600"
                    >
                      Open admin console
                    </Link>
                  ) : (
                    <Link
                      to="/admin-access"
                      state={{ from: '/auth' }}
                      className="flex w-full items-center justify-center rounded-xl border-2 border-violet-300/70 bg-white px-4 py-3 text-sm font-semibold text-violet-950 shadow-sm transition hover:border-violet-400 hover:bg-violet-50/80 dark:border-violet-700/50 dark:bg-gray-950/40 dark:text-violet-100 dark:hover:border-violet-500 dark:hover:bg-violet-950/25"
                    >
                      Continue to administrator entry
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
