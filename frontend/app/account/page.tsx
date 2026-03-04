'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function AccountPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg(null)
    setProfileLoading(true)

    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (res.ok) {
        await update({ name })
        setProfileMsg({ type: 'success', text: 'Profile updated successfully' })
      } else {
        const data = await res.json()
        setProfileMsg({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Something went wrong' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters' })
      return
    }

    setPasswordLoading(true)

    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (res.ok) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
      } else {
        const data = await res.json()
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to change password' })
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Something went wrong' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
      })

      if (res.ok) {
        await signOut({ callbackUrl: '/' })
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Failed to delete account' })
    }
  }

  const MessageBanner = ({ msg }: { msg: { type: 'success' | 'error'; text: string } }) => (
    <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
      msg.type === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
        : 'border-destructive/50 bg-destructive/10 text-destructive'
    }`}>
      {msg.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      {msg.text}
    </div>
  )

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Account Settings</h1>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileMsg && <MessageBanner msg={profileMsg} />}
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email || ''}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? 'Saving...' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {passwordMsg && <MessageBanner msg={passwordMsg} />}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm new password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? 'Changing...' : 'Change password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all saved analyses. This action cannot be undone.
            </p>
            {!deleteConfirm ? (
              <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>
                Delete Account
              </Button>
            ) : (
              <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium">Are you sure? This will delete all your data permanently.</p>
                <div className="flex gap-3">
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Yes, delete my account
                  </Button>
                  <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
