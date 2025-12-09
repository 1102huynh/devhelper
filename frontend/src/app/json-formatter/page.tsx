'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { jsonApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { FileJson, Copy, Check, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function JsonFormatterPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFormat = async () => {
    if (!input.trim()) {
      toast.error('Please enter JSON to format')
      return
    }

    setLoading(true)
    try {
      const response = await jsonApi.format({
        jsonString: input,
        indentSize: 2,
      })
      setResult(response.data)
      if (response.data.isValid) {
        toast.success('JSON formatted successfully')
      } else {
        toast.error('Invalid JSON')
      }
    } catch (error) {
      toast.error('Error formatting JSON')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const sampleJson = {
    name: 'Dev Helper',
    version: '1.0.0',
    tools: ['Regex Tester', 'JSON Formatter', 'SSH Commands', 'API Tester', 'Notes'],
    config: {
      theme: 'dark',
      autoSave: true,
    },
  }

  const loadSample = () => {
    setInput(JSON.stringify(sampleJson, null, 2))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileJson className="w-8 h-8 text-green-500" />
            <h1 className="text-4xl font-bold">JSON Formatter</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Format, validate, and beautify JSON with syntax highlighting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Paste your JSON here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='{"name": "example", "value": 123}'
                className="min-h-[400px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleFormat} disabled={loading} className="flex-1">
                  {loading ? 'Processing...' : 'Format JSON'}
                </Button>
                <Button onClick={loadSample} variant="outline">
                  Load Sample
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {result && (
              <>
                {result.isValid ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Output</CardTitle>
                      <CardDescription>
                        Size: {result.size} characters
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="formatted">
                        <TabsList className="w-full">
                          <TabsTrigger value="formatted" className="flex-1">
                            Formatted
                          </TabsTrigger>
                          <TabsTrigger value="minified" className="flex-1">
                            Minified
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="formatted" className="space-y-2">
                          <div className="relative">
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2 z-10"
                              onClick={() => handleCopy(result.formatted)}
                            >
                              {copied ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm font-mono max-h-[500px] overflow-y-auto">
                              {result.formatted}
                            </pre>
                          </div>
                        </TabsContent>
                        <TabsContent value="minified" className="space-y-2">
                          <div className="relative">
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2 z-10"
                              onClick={() => handleCopy(result.minified)}
                            >
                              {copied ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm font-mono max-h-[500px] overflow-y-auto break-all">
                              {result.minified}
                            </pre>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-5 h-5" />
                        Invalid JSON
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-destructive">{result.error}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Validate JSON syntax</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Format with proper indentation</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Minify for production</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Copy formatted output</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

