'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { GitCompare } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/lib/api'

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNumber: number
}

export default function DiffCheckerPage() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [differences, setDifferences] = useState<DiffLine[]>([])
  const [stats, setStats] = useState({ totalLines: 0, changedLines: 0 })

  const compareDiff = async () => {
    try {
      const response = await api.post('/api/diff/compare', { text1, text2 })
      setDifferences(response.data.differences)
      setStats({
        totalLines: response.data.totalLines,
        changedLines: response.data.changedLines
      })
    } catch (err) {
      console.error('Failed to compare diff:', err)
    }
  }

  const clearAll = () => {
    setText1('')
    setText2('')
    setDifferences([])
    setStats({ totalLines: 0, changedLines: 0 })
  }

  const getLineColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-100 dark:bg-green-900 border-l-4 border-green-500'
      case 'removed':
        return 'bg-red-100 dark:bg-red-900 border-l-4 border-red-500'
      default:
        return 'bg-muted'
    }
  }

  const getLinePrefix = (type: string) => {
    switch (type) {
      case 'added':
        return '+ '
      case 'removed':
        return '- '
      default:
        return '  '
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
          <h1 className="text-4xl font-bold mb-2">Diff Checker</h1>
          <p className="text-muted-foreground">
            Compare two text blocks and highlight differences
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Original Text</CardTitle>
              <CardDescription>Enter the first text</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                placeholder="Enter original text..."
                className="font-mono h-64"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modified Text</CardTitle>
              <CardDescription>Enter the second text</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                placeholder="Enter modified text..."
                className="font-mono h-64"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6">
          <Button onClick={compareDiff} className="flex-1">
            <GitCompare className="mr-2 h-4 w-4" />
            Compare
          </Button>
          <Button onClick={clearAll} variant="outline">
            Clear
          </Button>
        </div>

        {differences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Differences</CardTitle>
              <CardDescription>
                Total lines: {stats.totalLines} | Changed lines: {stats.changedLines}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {differences.map((line, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded font-mono text-sm ${getLineColor(line.type)}`}
                  >
                    <span className="text-muted-foreground mr-4">{line.lineNumber}</span>
                    <span className="font-semibold">{getLinePrefix(line.type)}</span>
                    {line.content}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

