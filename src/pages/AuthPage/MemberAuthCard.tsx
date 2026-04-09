import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAuth } from '../../context/AuthContext'
import { forgotSchema, loginSchema, registerSchema, type ForgotForm, type LoginForm, type RegisterForm } from './authSchemas'

function headlines(forgotMode: boolean, mode: 'login' | 'register'): { title: string; subtitle: string } {
  if (forgotMode) {
    return {
      title: 'Reset password',
      subtitle: 'We will email you a link to set a new password.',
    }
  }
  if (mode === 'register') {
    return {
      title: 'Create account',
      subtitle: 'Sign up with email or Google to upload and use your profile.',
    }
  }
  return {
    title: 'Sign in',
    subtitle: 'Use your email or Google to continue.',
  }
}

export default function MemberAuthCard() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword, error, firebaseReady } = useAuth()
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

  const { title, subtitle } = headlines(forgotMode, mode)
  const authDisabled = !firebaseReady

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
      /* AuthContext */
    }
  }

  async function onRegister(data: RegisterForm) {
    try {
      await registerWithEmail(data.email, data.password, data.name)
      navigate(fromPath, { replace: true })
    } catch {
      /* AuthContext */
    }
  }

  async function onForgot(data: ForgotForm) {
    try {
      await resetPassword(data.email)
      setForgotMode(false)
      navigate('/auth?mode=login', { replace: true })
    } catch {
      /* AuthContext */
    }
  }

  const inputClass =
    'mt-1.5 w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200/80 dark:border-white/10 dark:bg-gray-950/40 dark:focus:ring-purple-900/40'

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">{title}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        {authDisabled ? (
          <p className="text-xs leading-relaxed text-amber-900/95 dark:text-amber-200/90">
            Sign-in is paused until Firebase env vars are set — copy{' '}
            <code className="rounded bg-black/[0.06] px-1 dark:bg-white/10">.env.example</code> to{' '}
            <code className="rounded bg-black/[0.06] px-1 dark:bg-white/10">.env</code>, fill values, restart{' '}
            <code className="rounded bg-black/[0.06] px-1 dark:bg-white/10">npm run dev</code>. See{' '}
            <strong className="font-medium">README</strong>.
          </p>
        ) : null}
      </header>

      {firebaseReady && error ? (
        <div
          className="mt-6 rounded-lg border border-red-200/90 bg-red-50/90 px-3 py-2.5 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
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
                  /* AuthContext */
                } finally {
                  setGoogleBusy(false)
                }
              }}
              disabled={authDisabled || googleBusy}
              aria-busy={googleBusy}
              className="flex w-full items-center justify-center rounded-lg border border-black/12 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 dark:border-white/12 dark:bg-gray-950/30 dark:text-gray-100 dark:hover:bg-gray-900/50"
            >
              {googleBusy ? 'Connecting…' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-3 py-0.5">
              <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              <span className="text-xs text-gray-400 dark:text-gray-500">or use email</span>
              <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            </div>
          </>
        )}

        {!forgotMode && mode === 'login' ? (
          <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="auth-email">
                Email
              </label>
              <input id="auth-email" type="email" autoComplete="email" className={inputClass} {...register('email')} />
              {loginErrors.email ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{loginErrors.email.message}</p> : null}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="auth-password">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete="current-password"
                className={inputClass}
                {...register('password')}
              />
              {loginErrors.password ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{loginErrors.password.message}</p>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={loginSubmitting || authDisabled}
              className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-purple-500"
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
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              No account?{' '}
              <Link to="/auth?mode=register" className="font-medium text-purple-700 hover:underline dark:text-purple-300">
                Register
              </Link>
            </p>
          </form>
        ) : null}

        {!forgotMode && mode === 'register' ? (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="auth-name">
                Name
              </label>
              <input id="auth-name" type="text" autoComplete="name" className={inputClass} {...registerForm.register('name')} />
              {registerForm.formState.errors.name ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{registerForm.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="auth-email2">
                Email
              </label>
              <input id="auth-email2" type="email" autoComplete="email" className={inputClass} {...registerForm.register('email')} />
              {registerForm.formState.errors.email ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{registerForm.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="auth-password2">
                Password
              </label>
              <input
                id="auth-password2"
                type="password"
                autoComplete="new-password"
                className={inputClass}
                {...registerForm.register('password')}
              />
              {registerForm.formState.errors.password ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{registerForm.formState.errors.password.message}</p>
              ) : null}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="auth-confirm">
                Confirm password
              </label>
              <input
                id="auth-confirm"
                type="password"
                autoComplete="new-password"
                className={inputClass}
                {...registerForm.register('confirmPassword')}
              />
              {registerForm.formState.errors.confirmPassword ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{registerForm.formState.errors.confirmPassword.message}</p>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={registerForm.formState.isSubmitting || authDisabled}
              className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-purple-500"
            >
              {registerForm.formState.isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already registered?{' '}
              <Link to="/auth?mode=login" className="font-medium text-purple-700 hover:underline dark:text-purple-300">
                Sign in
              </Link>
            </p>
          </form>
        ) : null}

        {forgotMode ? (
          <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="auth-forgot-email">
                Email
              </label>
              <input
                id="auth-forgot-email"
                type="email"
                autoComplete="email"
                className={inputClass}
                {...forgotForm.register('email')}
              />
              {forgotForm.formState.errors.email ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{forgotForm.formState.errors.email.message}</p>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={forgotForm.formState.isSubmitting || authDisabled}
              className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-purple-500"
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
    </article>
  )
}
