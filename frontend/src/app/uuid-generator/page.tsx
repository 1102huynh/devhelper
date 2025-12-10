'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

export default function UuidGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(1)
  const [copied, setCopied] = useState(false)

  const generateUuids = () => {
    const newUuids: string[] = []
    const numToGenerate = Math.min(Math.max(1, count), 100)

    for (let i = 0; i < numToGenerate; i++) {
      newUuids.push(crypto.randomUUID())
    }

    setUuids(newUuids)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyAllToClipboard = () => {
    navigator.clipboard.writeText(uuids.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">UUID Generator</h1>
          <p className="text-muted-foreground">
            Generate random UUIDs (Universally Unique Identifiers)
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Generate UUIDs</CardTitle>
              <CardDescription>
                Generate version 4 UUIDs (random)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="count">Number of UUIDs (1-100)</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  placeholder="Enter number of UUIDs"
                />
              </div>

              <Button onClick={generateUuids} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate UUIDs
              </Button>

              {uuids.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Generated UUIDs ({uuids.length})</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAllToClipboard}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {copied ? 'Copied!' : 'Copy All'}
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {uuids.map((uuid, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-md"
                      >
                        <code className="text-sm font-mono">{uuid}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(uuid)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About UUIDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>UUID (Universally Unique Identifier)</strong> is a 128-bit number used to identify information in computer systems.
                </p>
                <p>
                  <strong>Format:</strong> 8-4-4-4-12 hexadecimal digits (e.g., 550e8400-e29b-41d4-a716-446655440000)
                </p>
                <p>
                  <strong>Version 4:</strong> Randomly generated UUIDs with very low probability of collision
                </p>
                <p>
                  <strong>Use Cases:</strong> Database primary keys, session IDs, file names, distributed systems
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

