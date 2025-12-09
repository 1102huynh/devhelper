'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { sshApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Terminal, Plus, Copy, Trash2, Edit, Search } from 'lucide-react'

interface SshCommand {
  id: number
  name: string
  command: string
  description: string
  category: string
}

export default function SshCommandsPage() {
  const [commands, setCommands] = useState<SshCommand[]>([])
  const [filteredCommands, setFilteredCommands] = useState<SshCommand[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCommand, setEditingCommand] = useState<SshCommand | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    command: '',
    description: '',
    category: '',
  })

  useEffect(() => {
    fetchCommands()
  }, [])

  useEffect(() => {
    filterCommands()
  }, [commands, searchQuery, selectedCategory])

  const fetchCommands = async () => {
    try {
      const response = await sshApi.getAll()
      setCommands(response.data)
    } catch (error) {
      toast.error('Failed to load SSH commands')
    } finally {
      setLoading(false)
    }
  }

  const filterCommands = () => {
    let filtered = commands

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((cmd) => cmd.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredCommands(filtered)
  }

  const categories = ['All', ...new Set(commands.map((cmd) => cmd.category))]

  const handleCopy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      toast.success('Command copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy command')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCommand) {
        await sshApi.update(editingCommand.id, formData)
        toast.success('Command updated successfully')
      } else {
        await sshApi.create(formData)
        toast.success('Command added successfully')
      }
      setShowForm(false)
      setEditingCommand(null)
      setFormData({ name: '', command: '', description: '', category: '' })
      fetchCommands()
    } catch (error) {
      toast.error('Failed to save command')
    }
  }

  const handleEdit = (command: SshCommand) => {
    setEditingCommand(command)
    setFormData({
      name: command.name,
      command: command.command,
      description: command.description,
      category: command.category,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this command?')) {
      try {
        await sshApi.delete(id)
        toast.success('Command deleted successfully')
        fetchCommands()
      } catch (error) {
        toast.error('Failed to delete command')
      }
    }
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
                <Terminal className="w-8 h-8 text-purple-500" />
                <h1 className="text-4xl font-bold">SSH Commands</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Store and manage frequently used SSH commands
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Command
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingCommand ? 'Edit' : 'Add'} SSH Command</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="command">Command</Label>
                  <Textarea
                    id="command"
                    value={formData.command}
                    onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                    className="font-mono"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingCommand ? 'Update' : 'Add'} Command
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingCommand(null)
                      setFormData({ name: '', command: '', description: '', category: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading commands...</p>
          </div>
        ) : filteredCommands.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No commands found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCommands.map((command, index) => (
              <motion.div
                key={command.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{command.name}</CardTitle>
                        <CardDescription>{command.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(command.command)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(command)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(command.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="p-3 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                      {command.command}
                    </pre>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                      {command.category}
                    </span>
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

