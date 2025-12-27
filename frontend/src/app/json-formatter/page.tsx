'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  FileJson, Copy, Check, Download, AlertCircle,
  CheckCircle2, Minimize2, Maximize2, Code, Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import toast from 'react-hot-toast'

interface JSONStats {
  keys: number
  values: number
  arrays: number
  objects: number
  depth: number
  size: number
}

export default function JsonFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [xmlOutput, setXmlOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [indentSize, setIndentSize] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)
  const [autoFormat, setAutoFormat] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<JSONStats | null>(null)
  const [searchKey, setSearchKey] = useState('')
  const [foundPath, setFoundPath] = useState('')

  // Auto-format
  useEffect(() => {
    if (autoFormat && input) {
      formatJSON()
    }
  }, [input, autoFormat, indentSize, sortKeys])

  const formatJSON = () => {
    if (!input.trim()) {
      toast.error('Enter JSON to format')
      return
    }

    try {
      let parsed = JSON.parse(input)

      if (sortKeys) {
        parsed = sortObjectKeys(parsed)
      }

      const formatted = JSON.stringify(parsed, null, indentSize)
      setOutput(formatted)
      setIsValid(true)
      setError('')

      // Calculate stats
      calculateStats(parsed)

      if (!autoFormat) {
        toast.success('JSON formatted!')
      }
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : 'Invalid JSON')
      toast.error('Invalid JSON')
    }
  }

  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys)
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj)
        .sort()
        .reduce((result: any, key) => {
          result[key] = sortObjectKeys(obj[key])
          return result
        }, {})
    }
    return obj
  }

  const minifyJSON = () => {
    if (!input.trim()) {
      toast.error('Enter JSON to minify')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setIsValid(true)
      setError('')
      toast.success('JSON minified!')
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : 'Invalid JSON')
      toast.error('Invalid JSON')
    }
  }

  const escapeJSON = () => {
    if (!input.trim()) {
      toast.error('Enter JSON to escape')
      return
    }

    const escaped = input
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')

    setOutput(escaped)
    toast.success('JSON escaped!')
  }

  const unescapeJSON = () => {
    if (!input.trim()) {
      toast.error('Enter JSON to unescape')
      return
    }

    const unescaped = input
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')

    setOutput(unescaped)
    toast.success('JSON unescaped!')
  }

  const jsonToXML = () => {
    if (!input.trim()) {
      toast.error('Enter JSON to convert')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const xml = objectToXML(parsed, 'root')
      setXmlOutput(`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`)
      toast.success('Converted to XML!')
    } catch (err) {
      toast.error('Invalid JSON')
    }
  }

  const objectToXML = (obj: any, tagName: string, indent = 0): string => {
    const spacing = ' '.repeat(indent * 2)

    if (Array.isArray(obj)) {
      return obj.map(item => objectToXML(item, 'item', indent)).join('\n')
    }

    if (obj !== null && typeof obj === 'object') {
      let xml = `${spacing}<${tagName}>\n`
      Object.entries(obj).forEach(([key, value]) => {
        xml += objectToXML(value, key, indent + 1) + '\n'
      })
      xml += `${spacing}</${tagName}>`
      return xml
    }

    return `${spacing}<${tagName}>${obj}</${tagName}>`
  }

  const calculateStats = (obj: any) => {
    let keys = 0
    let values = 0
    let arrays = 0
    let objects = 0
    let maxDepth = 0

    const traverse = (item: any, depth: number) => {
      maxDepth = Math.max(maxDepth, depth)

      if (Array.isArray(item)) {
        arrays++
        item.forEach(element => traverse(element, depth + 1))
      } else if (item !== null && typeof item === 'object') {
        objects++
        Object.entries(item).forEach(([key, value]) => {
          keys++
          values++
          traverse(value, depth + 1)
        })
      } else {
        values++
      }
    }

    traverse(obj, 0)

    setStats({
      keys,
      values,
      arrays,
      objects,
      depth: maxDepth,
      size: output.length
    })
  }

  const findKeyPath = () => {
    if (!searchKey.trim() || !input.trim()) {
      toast.error('Enter both JSON and key to search')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const path = searchForKey(parsed, searchKey, '')

      if (path) {
        setFoundPath(path)
        toast.success('Key found!')
      } else {
        setFoundPath('Key not found')
        toast.error('Key not found')
      }
    } catch (err) {
      toast.error('Invalid JSON')
    }
  }

  const searchForKey = (obj: any, targetKey: string, currentPath: string): string | null => {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const result = searchForKey(obj[i], targetKey, `${currentPath}[${i}]`)
        if (result) return result
      }
    } else if (obj !== null && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        const newPath = currentPath ? `${currentPath}.${key}` : key
        if (key === targetKey) {
          return newPath
        }
        const result = searchForKey(value, targetKey, newPath)
        if (result) return result
      }
    }
    return null
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadOutput = (content: string, ext: string) => {
    const blob = new Blob([content], {
      type: ext === 'json' ? 'application/json' : 'application/xml'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted_${Date.now()}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const sampleJSON = {
    name: "DevHelper",
    version: "1.0.0",
    tools: ["JSON Formatter", "XML Formatter", "Base64", "Hash Generator"],
    config: {
      theme: "dark",
      autoSave: true,
      features: {
        validation: true,
        beautify: true
      }
    },
    stats: {
      users: 1000,
      tools: 24
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl shadow-lg">
            <FileJson className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Advanced JSON Formatter
            </h1>
            <p className="text-muted-foreground mt-1">
              Format • Minify • Escape • JSON to XML • Path Finder • Statistics
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Input/Output */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>JSON Formatter</CardTitle>
                    <CardDescription>
                      {autoFormat ? 'Auto-formats as you type' : 'Click button to format'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={autoFormat}
                        onCheckedChange={setAutoFormat}
                        id="auto"
                      />
                      <Label htmlFor="auto" className="text-xs cursor-pointer">Auto</Label>
                    </div>
                    {isValid !== null && (
                      <Badge variant={isValid ? 'default' : 'destructive'}>
                        {isValid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Valid
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Invalid
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">Input JSON</Label>
                    <Button
                      onClick={() => setInput(JSON.stringify(sampleJSON, null, 2))}
                      variant="ghost"
                      size="sm"
                    >
                      Load Sample
                    </Button>
                  </div>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='{"key": "value", "array": [1, 2, 3]}'
                    className="font-mono text-sm h-64"
                  />
                  {input && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{input.length} chars</Badge>
                      <Badge variant="outline" className="text-xs">{new TextEncoder().encode(input).length} bytes</Badge>
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Indent Size: {indentSize} spaces</Label>
                    <Slider
                      value={[indentSize]}
                      onValueChange={(v) => setIndentSize(v[0])}
                      min={2}
                      max={8}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={sortKeys}
                      onCheckedChange={setSortKeys}
                      id="sort"
                    />
                    <Label htmlFor="sort" className="text-sm cursor-pointer">
                      Sort Keys Alphabetically
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={formatJSON} className="bg-gradient-to-r from-green-500 to-teal-500">
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Format
                  </Button>
                  <Button onClick={minifyJSON} variant="outline">
                    <Minimize2 className="w-4 h-4 mr-2" />
                    Minify
                  </Button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-900 dark:text-red-100 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  </div>
                )}

                <Tabs defaultValue="formatted" className="space-y-4">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="formatted">Formatted</TabsTrigger>
                    <TabsTrigger value="escaped">Escape</TabsTrigger>
                    <TabsTrigger value="xml" onClick={jsonToXML}>To XML</TabsTrigger>
                  </TabsList>

                  <TabsContent value="formatted" className="space-y-4">
                    <div>
                      <Label className="text-sm mb-2 block flex items-center justify-between">
                        <span>Output</span>
                        {output && <Badge variant="outline" className="text-xs">{output.length} chars</Badge>}
                      </Label>
                      <Textarea
                        value={output}
                        readOnly
                        placeholder="Formatted JSON will appear here..."
                        className="font-mono text-sm h-64 bg-muted"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => handleCopy(output)} variant="outline" disabled={!output}>
                        {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copy
                      </Button>
                      <Button onClick={() => downloadOutput(output, 'json')} variant="outline" disabled={!output}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="escaped" className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <Button onClick={escapeJSON} variant="outline">
                        <Code className="w-4 h-4 mr-2" />
                        Escape
                      </Button>
                      <Button onClick={unescapeJSON} variant="outline">
                        <Code className="w-4 h-4 mr-2" />
                        Unescape
                      </Button>
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">Escaped Output</Label>
                      <Textarea
                        value={output}
                        readOnly
                        placeholder="Escaped JSON will appear here..."
                        className="font-mono text-sm h-64 bg-muted"
                      />
                    </div>

                    <Button onClick={() => handleCopy(output)} variant="outline" disabled={!output} className="w-full">
                      {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy Escaped
                    </Button>
                  </TabsContent>

                  <TabsContent value="xml" className="space-y-4">
                    <div>
                      <Label className="text-sm mb-2 block">XML Output</Label>
                      <Textarea
                        value={xmlOutput}
                        readOnly
                        placeholder="XML will appear here..."
                        className="font-mono text-sm h-64 bg-muted"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => handleCopy(xmlOutput)} variant="outline" disabled={!xmlOutput}>
                        {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copy
                      </Button>
                      <Button onClick={() => downloadOutput(xmlOutput, 'xml')} variant="outline" disabled={!xmlOutput}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Path Finder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  JSON Path Finder
                </CardTitle>
                <CardDescription>Find the path to any key in your JSON</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    placeholder="Enter key name to search..."
                    className="flex-1"
                  />
                  <Button onClick={findKeyPath}>
                    <Search className="w-4 h-4 mr-2" />
                    Find
                  </Button>
                </div>

                {foundPath && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-muted rounded-lg"
                  >
                    <Label className="text-xs text-muted-foreground mb-1 block">Path:</Label>
                    <code className="text-sm font-mono">{foundPath}</code>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Stats & Info */}
          <div className="space-y-6">
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>JSON Statistics</CardTitle>
                  <CardDescription>Document analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Keys</span>
                    <span className="font-bold">{stats.keys}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Values</span>
                    <span className="font-bold">{stats.values}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Arrays</span>
                    <span className="font-bold">{stats.arrays}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Objects</span>
                    <span className="font-bold">{stats.objects}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Max Depth</span>
                    <span className="font-bold">{stats.depth}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Size</span>
                    <span className="font-bold">{stats.size} bytes</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Format & beautify</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Minify JSON</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Sort keys alphabetically</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Escape/unescape strings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>JSON to XML conversion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Path finder</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Statistics & analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Auto-format mode</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About JSON</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>
                  JSON (JavaScript Object Notation) is a lightweight data interchange format.
                </p>
                <div>
                  <p className="font-semibold text-foreground mb-1">Common Uses:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>API responses/requests</li>
                    <li>Configuration files</li>
                    <li>Data storage</li>
                    <li>Web applications</li>
                    <li>NoSQL databases</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
