'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

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

  return (
    <main className="container">
      <div className="account-page">
        <h1 className="account-title">Account Settings</h1>

        {/* Profile Section */}
        <section className="account-section">
          <h2 className="account-section-title">Profile</h2>
          {profileMsg && (
            <div className={`auth-message auth-message-${profileMsg.type}`}>
              {profileMsg.text}
            </div>
          )}
          <form onSubmit={handleProfileUpdate} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={session?.user?.email || ''}
                className="form-input"
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Your name"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </section>

        {/* Password Section */}
        <section className="account-section">
          <h2 className="account-section-title">Change Password</h2>
          {passwordMsg && (
            <div className={`auth-message auth-message-${passwordMsg.type}`}>
              {passwordMsg.text}
            </div>
          )}
          <form onSubmit={handlePasswordChange} className="auth-form">
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">Current password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">New password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmNewPassword" className="form-label">Confirm new password</label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="form-input"
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
              {passwordLoading ? 'Changing...' : 'Change password'}
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="account-section account-danger-zone">
          <h2 className="account-section-title">Danger Zone</h2>
          <p className="account-danger-text">
            Permanently delete your account and all saved analyses. This action cannot be undone.
          </p>
          {!deleteConfirm ? (
            <button
              className="btn btn-danger"
              onClick={() => setDeleteConfirm(true)}
            >
              Delete Account
            </button>
          ) : (
            <div className="delete-confirm">
              <p>Are you sure? This will delete all your data permanently.</p>
              <div className="delete-confirm-actions">
                <button className="btn btn-danger" onClick={handleDeleteAccount}>
                  Yes, delete my account
                </button>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
