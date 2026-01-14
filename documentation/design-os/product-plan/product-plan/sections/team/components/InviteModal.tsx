import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Role } from '../types'

interface InviteModalProps {
  open: boolean
  onClose: () => void
  roles: Role[]
  onInvite?: (email: string, roleId: string) => void
}

export function InviteModal({ open, onClose, roles, onInvite }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)

  const selectedRole = roles.find((r) => r.id === roleId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !roleId) return

    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      onInvite?.(email, roleId)
      setIsSubmitting(false)
      setEmail('')
      setRoleId('')
      onClose()
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an email invitation to join your team. They'll receive a link to create their account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <DropdownMenu open={roleMenuOpen} onOpenChange={setRoleMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    type="button"
                  >
                    {selectedRole ? (
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{selectedRole.name}</span>
                        <span className="text-xs text-slate-500">{selectedRole.description}</span>
                      </div>
                    ) : (
                      'Select a role'
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                  <DropdownMenuLabel>Select Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {roles.map((role) => (
                    <DropdownMenuItem
                      key={role.id}
                      onClick={() => {
                        setRoleId(role.id)
                        setRoleMenuOpen(false)
                      }}
                    >
                      <div className="flex flex-col">
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs text-slate-500">{role.description}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!email || !roleId || isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

