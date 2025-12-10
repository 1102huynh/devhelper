'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Type, Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/lib/api'

export default function TextUtilsPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [stats, setStats] = useState({ originalLength: 0, resultLength: 0, wordCount: 0, lineCount: 0 })

  const operations = [
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Capitalize Words' },
    { value: 'camelcase', label: 'camelCase' },
    { value: 'snakecase', label: 'snake_case' },
    { value: 'kebabcase', label: 'kebab-case' },
    { value: 'reverse', label: 'Reverse' },
    { value: 'trim', label: 'Trim Whitespace' },
    { value: 'removewhitespace', label: 'Remove All Whitespace' },
    { value: 'removelines', label: 'Remove Line Breaks' },
  ]

  const convertText = async (operation: string) => {
    try {
      const response = await api.post('/api/text/convert', { text: input, operation })
      setOutput(response.data.result)
      setStats({
        originalLength: response.data.originalLength,
        resultLength: response.data.resultLength,
        wordCount: response.data.wordCount,
        lineCount: response.data.lineCount
      })
    } catch (err) {
      console.error('Failed to convert text:', err)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setStats({ originalLength: 0, resultLength: 0, wordCount: 0, lineCount: 0 })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Text Utilities</h1>
          <p className="text-muted-foreground">
            Transform and manipulate text with various operations
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>Enter text to transform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your text here..."
                className="h-64"
              />

              <Button onClick={clearAll} variant="outline" className="w-full">
                Clear
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
              <CardDescription>Transformed text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={output}
                readOnly
                placeholder="Output will appear here..."
                className="h-64"
              />

              <Button onClick={copyToClipboard} variant="outline" className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>

              {output && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-muted-foreground">Characters</div>
                    <div className="text-2xl font-bold">{stats.resultLength}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-muted-foreground">Words</div>
                    <div className="text-2xl font-bold">{stats.wordCount}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-muted-foreground">Lines</div>
                    <div className="text-2xl font-bold">{stats.lineCount}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-muted-foreground">Change</div>
                    <div className="text-2xl font-bold">{stats.resultLength - stats.originalLength}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Operations</CardTitle>
            <CardDescription>Click any operation to transform your text</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {operations.map((op) => (
                <Button
                  key={op.value}
                  onClick={() => convertText(op.value)}
                  variant="outline"
                  className="w-full"
                >
                  <Type className="mr-2 h-4 w-4" />
                  {op.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

