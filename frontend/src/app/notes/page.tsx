'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { notesApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  StickyNote, Plus, Trash2, Edit, Pin, Search, X,
  Archive, Calendar, Tag, Grid, List, Filter,
  Download, Upload, Star, Clock, Folder, MoreVertical
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Note {
  id: number
  title: string
  content: string
  tags: string
  pinned: boolean
  archived: boolean
  favorite: boolean
  color: string
  category: string
  createdAt: string
  updatedAt: string
}

const noteColors = [
  { name: 'Default', value: 'default', bg: 'bg-background', border: 'border-border' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-900' },
  { name: 'Green', value: 'green', bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-900' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-200 dark:border-pink-900' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-900' },
]

const categories = ['Personal', 'Work', 'Ideas', 'Important', 'Todo', 'Learning']

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterView, setFilterView] = useState<'all' | 'pinned' | 'favorites' | 'archived'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    color: 'default',
    category: 'Personal',
  })

  useEffect(() => {
    fetchNotes()

    // Global keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault()
        setShowForm(true)
      }
      if (e.key === 'Escape' && showForm) {
        setShowForm(false)
        setEditingNote(null)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showForm])

  useEffect(() => {
    filterNotes()
  }, [notes, searchQuery, filterView, selectedCategory, selectedTags])

  const fetchNotes = async () => {
    try {
      const response = await notesApi.getAll()
      setNotes(response.data.map((note: any) => ({
        ...note,
        archived: note.archived || false,
        favorite: note.favorite || false,
        color: note.color || 'default',
        category: note.category || 'Personal'
      })))
    } catch (error) {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = notes

    // Filter by view
    if (filterView === 'pinned') {
      filtered = filtered.filter(note => note.pinned && !note.archived)
    } else if (filterView === 'favorites') {
      filtered = filtered.filter(note => note.favorite && !note.archived)
    } else if (filterView === 'archived') {
      filtered = filtered.filter(note => note.archived)
    } else {
      filtered = filtered.filter(note => !note.archived)
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory)
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => {
        const noteTags = note.tags.split(',').map(t => t.trim().toLowerCase())
        return selectedTags.some(tag => noteTags.includes(tag.toLowerCase()))
      })
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort: pinned first, then favorites, then by updated date
    const sorted = [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    setFilteredNotes(sorted)
  }

  const getAllTags = () => {
    const allTags = new Set<string>()
    notes.forEach(note => {
      if (note.tags) {
        note.tags.split(',').forEach(tag => allTags.add(tag.trim()))
      }
    })
    return Array.from(allTags).filter(tag => tag.length > 0)
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
      setFormData({ title: '', content: '', tags: '', color: 'default', category: 'Personal' })
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
      color: note.color || 'default',
      category: note.category || 'Personal',
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
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === id ? { ...note, pinned: !note.pinned } : note
        )
      )
      const response = await notesApi.togglePin(id)
      await fetchNotes()
      toast.success(response.data.pinned ? 'Note pinned' : 'Note unpinned')
    } catch (error) {
      toast.error('Failed to toggle pin')
      fetchNotes()
    }
  }

  const handleToggleFavorite = async (note: Note) => {
    try {
      const updated = { ...note, favorite: !note.favorite }
      setNotes(prevNotes =>
        prevNotes.map(n => n.id === note.id ? updated : n)
      )
      await notesApi.update(note.id, updated)
      toast.success(updated.favorite ? 'Added to favorites' : 'Removed from favorites')
    } catch (error) {
      toast.error('Failed to update note')
      fetchNotes()
    }
  }

  const handleArchive = async (note: Note) => {
    try {
      const updated = { ...note, archived: !note.archived }
      setNotes(prevNotes =>
        prevNotes.map(n => n.id === note.id ? updated : n)
      )
      await notesApi.update(note.id, updated)
      toast.success(updated.archived ? 'Note archived' : 'Note unarchived')
    } catch (error) {
      toast.error('Failed to archive note')
      fetchNotes()
    }
  }

  const exportNotes = () => {
    const data = JSON.stringify(filteredNotes, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notes_export_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Notes exported successfully')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const getColorClasses = (colorValue: string) => {
    const color = noteColors.find(c => c.value === colorValue)
    return color || noteColors[0]
  }

  const stats = {
    total: notes.filter(n => !n.archived).length,
    pinned: notes.filter(n => n.pinned && !n.archived).length,
    favorites: notes.filter(n => n.favorite && !n.archived).length,
    archived: notes.filter(n => n.archived).length,
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
                  <StickyNote className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Smart Notes
                </h1>
              </div>
              <p className="text-muted-foreground text-lg flex items-center gap-2">
                Professional note-taking • Press{' '}
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Ctrl+Space</kbd>
                to quick add
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportNotes} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterView('all')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Notes</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <StickyNote className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterView('pinned')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pinned</p>
                    <p className="text-2xl font-bold">{stats.pinned}</p>
                  </div>
                  <Pin className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterView('favorites')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Favorites</p>
                    <p className="text-2xl font-bold">{stats.favorites}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterView('archived')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Archived</p>
                    <p className="text-2xl font-bold">{stats.archived}</p>
                  </div>
                  <Archive className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <Folder className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tag filter */}
          {getAllTags().length > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {getAllTags().map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag))
                    } else {
                      setSelectedTags([...selectedTags, tag])
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])}>
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowForm(false)
                setEditingNote(null)
                setFormData({ title: '', content: '', tags: '', color: 'default', category: 'Personal' })
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{editingNote ? 'Edit' : 'New'} Note</CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setShowForm(false)
                          setEditingNote(null)
                          setFormData({ title: '', content: '', tags: '', color: 'default', category: 'Personal' })
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
                          className="min-h-[200px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="color">Color</Label>
                          <Select value={formData.color} onValueChange={(val) => setFormData({ ...formData, color: val })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {noteColors.map(color => (
                                <SelectItem key={color.value} value={color.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded ${color.bg} border ${color.border}`} />
                                    {color.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="comma, separated, tags"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          {editingNote ? 'Update' : 'Create'} Note
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowForm(false)
                            setEditingNote(null)
                            setFormData({ title: '', content: '', tags: '', color: 'default', category: 'Personal' })
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Grid/List */}
        {
          loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || selectedTags.length > 0 || selectedCategory !== 'all'
                    ? 'No notes found matching your filters'
                    : filterView === 'archived'
                      ? 'No archived notes'
                      : 'No notes yet. Create your first note!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredNotes.map((note, index) => {
                const colorClasses = getColorClasses(note.color)
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Card className={`hover:shadow-lg transition-all ${viewMode === 'grid' ? 'h-full' : ''} ${colorClasses.bg} border-2 ${note.pinned ? 'border-primary shadow-md' : colorClasses.border}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg flex items-center gap-2 truncate">
                              {note.pinned && <Pin className="w-4 h-4 text-primary flex-shrink-0 fill-current" />}
                              {note.favorite && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 fill-current" />}
                              <span className="truncate">{note.title}</span>
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{note.category}</Badge>
                              <CardDescription className="text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(note.updatedAt)}
                              </CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(note)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePin(note.id)}>
                                <Pin className="w-4 h-4 mr-2" />
                                {note.pinned ? 'Unpin' : 'Pin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFavorite(note)}>
                                <Star className="w-4 h-4 mr-2" />
                                {note.favorite ? 'Remove from favorites' : 'Add to favorites'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchive(note)}>
                                <Archive className="w-4 h-4 mr-2" />
                                {note.archived ? 'Unarchive' : 'Archive'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(note.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-sm text-muted-foreground whitespace-pre-wrap ${viewMode === 'grid' ? 'line-clamp-6' : 'line-clamp-3'}`}>
                          {note.content}
                        </p>
                        {note.tags && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {note.tags.split(',').map((tag, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-primary/20"
                                onClick={() => {
                                  const tagTrimmed = tag.trim()
                                  if (!selectedTags.includes(tagTrimmed)) {
                                    setSelectedTags([...selectedTags, tagTrimmed])
                                  }
                                }}
                              >
                                #{tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )
        }
      </motion.div >
    </div >
  )
}
