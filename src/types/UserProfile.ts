import type { AppRole } from './role'

export type UserProfile = {
  uid: string
  email: string | null
  name: string
  photoURL: string | null
  role: AppRole
  blocked: boolean
  createdAt: number | null
}

