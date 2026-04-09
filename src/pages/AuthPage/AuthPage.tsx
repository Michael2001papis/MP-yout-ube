import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

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

export default function AuthPage() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword, error, loading, firebaseReady } = useAuth()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login'

  const location = useLocation()
  const navigate = useNavigate()
  const fromPath = useMemo(() => {
    const state = location.state as any
    return state?.from ? String(state.from) : '/'
  }, [location.state])

  const [forgotMode, setForgotMode] = useState(false)

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

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/30">
        <h1 className="text-2xl font-semibold">{forgotMode ? 'Reset password' : mode === 'register' ? 'Create account' : 'Login'}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {forgotMode
            ? 'We will email you a reset link.'
            : mode === 'register'
              ? 'Sign up to upload, comment, and save favorites.'
              : 'Sign in to upload videos and manage your profile.'}
        </p>

        {!firebaseReady ? (
          <div className="mt-4 rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm text-gray-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-gray-200">
            <div className="font-medium text-gray-900 dark:text-gray-100">חיבור ל-Firebase</div>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              כדי להתחבר ולהעלות תוכן, הוסף קובץ <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">.env</code> לפי{' '}
              <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">.env.example</code>, הפעל מחדש את השרת, ואז נסה שוב.
            </p>
            {missingFirebaseEnv.length > 0 ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                משתנים חסרים: {missingFirebaseEnv.join(', ')}
              </p>
            ) : null}
          </div>
        ) : error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          {!forgotMode && (
            <>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await loginWithGoogle()
                    navigate(fromPath, { replace: true })
                  } catch {
                    // error is shown by AuthContext
                  }
                }}
                disabled={loading || !firebaseReady}
                className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60 dark:border-white/10 dark:bg-gray-900/30 dark:hover:bg-gray-900/50"
              >
                Continue with Google
              </button>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="h-px flex-1 bg-black/10" />
                <span>or</span>
                <div className="h-px flex-1 bg-black/10" />
              </div>
            </>
          )}

          {!forgotMode && mode === 'login' ? (
              <form onSubmit={handleSubmit(onLogin)} className="space-y-3">
              <div>
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                  {...register('email')}
                />
                {loginErrors.email ? <p className="mt-1 text-xs text-red-600">{loginErrors.email.message}</p> : null}
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                  {...register('password')}
                />
                {loginErrors.password ? <p className="mt-1 text-xs text-red-600">{loginErrors.password.message}</p> : null}
              </div>

              <button
                type="submit"
                disabled={loginSubmitting || !firebaseReady}
                className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {loginSubmitting ? 'Signing in...' : 'Login'}
              </button>

              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="w-full text-center text-sm text-purple-700 hover:underline dark:text-purple-300"
              >
                Forgot password?
              </button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                New here?{' '}
                <Link to="/auth?mode=register" className="text-purple-700 hover:underline dark:text-purple-300">
                  Create an account
                </Link>
              </div>
            </form>
          ) : null}

          {!forgotMode && mode === 'register' ? (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3">
              <div>
                <label className="text-sm font-medium" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                  {...registerForm.register('name')}
                />
                {registerForm.formState.errors.name ? (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.name.message}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="email2">
                  Email
                </label>
                <input
                  id="email2"
                  type="email"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                  {...registerForm.register('email')}
                />
                {registerForm.formState.errors.email ? (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="password2">
                  Password
                </label>
                <input
                  id="password2"
                  type="password"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                  {...registerForm.register('password')}
                />
                {registerForm.formState.errors.password ? (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.password.message}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="confirm">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                  {...registerForm.register('confirmPassword')}
                />
                {registerForm.formState.errors.confirmPassword ? (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={registerForm.formState.isSubmitting || !firebaseReady}
                className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {registerForm.formState.isSubmitting ? 'Creating account...' : 'Create account'}
              </button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link to="/auth?mode=login" className="text-purple-700 hover:underline dark:text-purple-300">
                  Login
                </Link>
              </div>
            </form>
          ) : null}

          {forgotMode ? (
            <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-3">
              <div>
                <label className="text-sm font-medium" htmlFor="forgot-email">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                  {...forgotForm.register('email')}
                />
                {forgotForm.formState.errors.email ? (
                  <p className="mt-1 text-xs text-red-600">{forgotForm.formState.errors.email.message}</p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={forgotForm.formState.isSubmitting || !firebaseReady}
                className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {forgotForm.formState.isSubmitting ? 'Sending...' : 'Send reset link'}
              </button>
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="w-full text-center text-sm text-purple-700 hover:underline dark:text-purple-300"
              >
                Back to login
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  )
}

