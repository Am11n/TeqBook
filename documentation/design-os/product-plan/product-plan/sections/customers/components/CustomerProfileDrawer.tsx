import { useState } from 'react'
import { X, Mail, Phone, Calendar, Plus, Edit, Trash2, Tag, FileText, Check } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { TagBadge } from './TagBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Customer, Booking, CustomerNote, MarketingConsent } from '../types'

interface CustomerProfileDrawerProps {
  customer: Customer | null
  bookings: Booking[]
  open: boolean
  onClose: () => void
  onEdit?: (id: string) => void
  onAddTag?: (customerId: string, tag: string) => void
  onRemoveTag?: (customerId: string, tag: string) => void
  onAddNote?: (customerId: string, content: string) => void
  onEditNote?: (customerId: string, noteId: string, content: string) => void
  onDeleteNote?: (customerId: string, noteId: string) => void
  onUpdateMarketingConsent?: (customerId: string, consent: MarketingConsent) => void
}

export function CustomerProfileDrawer({
  customer,
  bookings,
  open,
  onClose,
  onEdit,
  onAddTag,
  onRemoveTag,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onUpdateMarketingConsent,
}: CustomerProfileDrawerProps) {
  const [newTag, setNewTag] = useState('')
  const [newNote, setNewNote] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')

  if (!customer) return null

  // Get recent bookings for this customer (last 10)
  const customerBookings = bookings
    .filter((b) => b.customerId === customer.id)
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime()
      const dateB = new Date(`${b.date}T${b.time}`).getTime()
      return dateB - dateA
    })
    .slice(0, 10)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleAddTag = () => {
    if (newTag.trim() && onAddTag) {
      onAddTag(customer.id, newTag.trim())
      setNewTag('')
    }
  }

  const handleAddNote = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(customer.id, newNote.trim())
      setNewNote('')
    }
  }

  const handleStartEditNote = (note: CustomerNote) => {
    setEditingNoteId(note.id)
    setEditingNoteContent(note.content)
  }

  const handleSaveNote = () => {
    if (editingNoteId && editingNoteContent.trim() && onEditNote) {
      onEditNote(customer.id, editingNoteId, editingNoteContent.trim())
      setEditingNoteId(null)
      setEditingNoteContent('')
    }
  }

  const handleToggleMarketing = (type: 'email' | 'sms') => {
    if (onUpdateMarketingConsent) {
      onUpdateMarketingConsent(customer.id, {
        ...customer.marketingConsent,
        [type]: !customer.marketingConsent[type],
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl">{customer.name}</SheetTitle>
              <SheetDescription className="mt-2">
                Customer profile and booking history
              </SheetDescription>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(customer.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                  <div className="text-sm text-slate-900 dark:text-slate-50">{customer.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Phone</div>
                  <div className="text-sm text-slate-900 dark:text-slate-50">{customer.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Member Since</div>
                  <div className="text-sm text-slate-900 dark:text-slate-50">
                    {formatDate(customer.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {customer.tags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  variant={onRemoveTag ? 'removable' : 'default'}
                  onRemove={onRemoveTag ? () => onRemoveTag(customer.id, tag) : undefined}
                />
              ))}
              {onAddTag && (
                <div className="flex items-center gap-1">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag()
                      }
                    }}
                    className="h-7 w-24 text-xs"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleAddTag}
                    className="h-7 w-7"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Notes</h3>
            <div className="space-y-3">
              {customer.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editingNoteContent}
                        onChange={(e) => setEditingNoteContent(e.target.value)}
                        className="text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveNote}
                          className="h-7 text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingNoteId(null)
                            setEditingNoteContent('')
                          }}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-slate-900 dark:text-slate-50 mb-2">{note.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(note.createdAt)} by {note.createdBy}
                        </span>
                        <div className="flex items-center gap-1">
                          {onEditNote && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleStartEditNote(note)}
                              className="h-6 w-6"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {onDeleteNote && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onDeleteNote(customer.id, note.id)}
                              className="h-6 w-6 text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {onAddNote && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAddNote()
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleAddNote}
                    className="h-9 w-9"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Marketing Consent */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Marketing Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Email Marketing</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Receive promotional emails
                  </div>
                </div>
                <Button
                  variant={customer.marketingConsent.email ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleToggleMarketing('email')}
                  className={customer.marketingConsent.email ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}
                >
                  {customer.marketingConsent.email ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Enabled
                    </>
                  ) : (
                    'Enable'
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-50">SMS Marketing</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Receive promotional text messages
                  </div>
                </div>
                <Button
                  variant={customer.marketingConsent.sms ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleToggleMarketing('sms')}
                  className={customer.marketingConsent.sms ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}
                >
                  {customer.marketingConsent.sms ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Enabled
                    </>
                  ) : (
                    'Enable'
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Recent Bookings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Recent Bookings ({customerBookings.length})
            </h3>
            {customerBookings.length > 0 ? (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="text-sm">
                          {formatDateTime(booking.date, booking.time)}
                        </TableCell>
                        <TableCell className="text-sm">{booking.serviceName}</TableCell>
                        <TableCell className="text-sm">{booking.employeeName}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              booking.status === 'completed'
                                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300'
                                : booking.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                No bookings yet
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

