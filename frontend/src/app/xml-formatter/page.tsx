'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, FileCode } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/lib/api'

export default function XmlFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(true)

  const formatXml = async () => {
    try {
      setError('')
      const response = await api.post('/api/xml/format', { xml: input, indent: 2 })
      setOutput(response.data.formatted)
      setIsValid(response.data.valid)
      if (!response.data.valid) {
        setError(response.data.error)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to format XML')
      setIsValid(false)
    }
  }

  const validateXml = async () => {
    try {
      setError('')
      const response = await api.post('/api/xml/validate', { xml: input })
      setIsValid(response.data.valid)
      if (response.data.valid) {
        setError('✓ Valid XML')
      } else {
        setError('✗ ' + response.data.error)
      }
    } catch (err: any) {
      setError('✗ ' + (err.message || 'Invalid XML'))
      setIsValid(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
    setIsValid(true)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">XML Formatter</h1>
          <p className="text-muted-foreground">
            Format, validate, and beautify XML documents
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Input XML</CardTitle>
              <CardDescription>Paste your XML here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="<root><element>value</element></root>"
                className="font-mono h-96"
              />

              <div className="flex gap-2">
                <Button onClick={formatXml} className="flex-1">
                  <FileCode className="mr-2 h-4 w-4" />
                  Format
                </Button>
                <Button onClick={validateXml} variant="outline" className="flex-1">
                  Validate
                </Button>
                <Button onClick={clearAll} variant="outline">
                  Clear
                </Button>
              </div>

              {error && (
                <div className={`p-3 rounded-md text-sm ${
                  isValid ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                           'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formatted XML</CardTitle>
              <CardDescription>Beautified output</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={output}
                readOnly
                placeholder="Formatted XML will appear here"
                className="font-mono h-96"
              />

              <Button onClick={copyToClipboard} variant="outline" className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

