'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { notesApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { StickyNote, Plus, Trash2, Edit, Pin, Search, X } from 'lucide-react'

interface Note {
  id: number
  title: string
  content: string
  tags: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  })

  useEffect(() => {
    fetchNotes()

    // Global keyboard shortcut for quick note
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault()
        setShowForm(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    filterNotes()
  }, [notes, searchQuery])

  const fetchNotes = async () => {
    try {
      const response = await notesApi.getAll()
      setNotes(response.data)
    } catch (error) {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = notes

    if (searchQuery) {
      filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort: pinned notes first, then by updated date
    const sorted = [...filtered].sort((a, b) => {
      if (a.pinned === b.pinned) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      return a.pinned ? -1 : 1
    })

    setFilteredNotes(sorted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingNote) {
        await notesApi.update(editingNote.id, formData)
        toast.success('Note updated successfully')
      } else {
        await notesApi.create(formData)
        toast.success('Note created successfully')
      }
      setShowForm(false)
      setEditingNote(null)
      setFormData({ title: '', content: '', tags: '' })
      fetchNotes()
    } catch (error) {
      toast.error('Failed to save note')
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await notesApi.delete(id)
        toast.success('Note deleted successfully')
        fetchNotes()
      } catch (error) {
        toast.error('Failed to delete note')
      }
    }
  }

  const handleTogglePin = async (id: number) => {
    try {
      // Optimistically update UI
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === id ? { ...note, pinned: !note.pinned } : note
        )
      )

      const response = await notesApi.togglePin(id)
      console.log('Toggle pin response:', response.data)

      // Fetch fresh data to ensure sync
      await fetchNotes()
      toast.success(response.data.pinned ? 'Note pinned' : 'Note unpinned')
    } catch (error) {
      console.error('Toggle pin error:', error)
      toast.error('Failed to toggle pin')
      // Revert optimistic update
      fetchNotes()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StickyNote className="w-8 h-8 text-pink-500" />
                <h1 className="text-4xl font-bold">Task Notes</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Lightning-fast notes • Press{' '}
                <kbd className="px-2 py-1 bg-muted rounded text-sm">Ctrl+Space</kbd> to
                quickly add
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingNote ? 'Edit' : 'New'} Note</CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false)
                    setEditingNote(null)
                    setFormData({ title: '', content: '', tags: '' })
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Note title"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your note here..."
                    className="min-h-[150px]"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="comma,separated,tags"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingNote ? 'Update' : 'Create'} Note
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingNote(null)
                      setFormData({ title: '', content: '', tags: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No notes found' : 'No notes yet. Create your first note!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className={`hover:shadow-lg transition-all h-full ${note.pinned ? 'border-2 border-primary shadow-md' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {note.pinned && <Pin className="w-4 h-4 text-primary" />}
                          {note.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {formatDate(note.updatedAt)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleTogglePin(note.id)}
                          className={`h-8 w-8 ${note.pinned ? 'text-primary hover:text-primary/80' : 'hover:text-primary'}`}
                          title={note.pinned ? 'Unpin note' : 'Pin note'}
                        >
                          <Pin className={`w-4 h-4 ${note.pinned ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(note)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(note.id)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                      {note.content}
                    </p>
                    {note.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {note.tags.split(',').map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

