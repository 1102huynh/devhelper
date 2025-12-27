'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Link2, Copy, Check, Plus, Trash2, Download,
  Link as LinkIcon, Search, AlertCircle, CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'

interface URLParts {
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
}

interface QueryParam {
  id: string
  key: string
  value: string
}

export default function UrlEncoderPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encodeType, setEncodeType] = useState<'component' | 'uri'>('component')
  const [autoProcess, setAutoProcess] = useState(true)

  // URL Parser state
  const [urlParts, setUrlParts] = useState<URLParts | null>(null)
  const [isValidUrl, setIsValidUrl] = useState(false)

  // Query builder state
  const [queryParams, setQueryParams] = useState<QueryParam[]>([
    { id: '1', key: '', value: '' }
  ])
  const [builtUrl, setBuiltUrl] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://example.com/api')

  // Auto-process
  useEffect(() => {
    if (autoProcess && input) {
      processUrl()
    } else if (!input) {
      setOutput('')
    }
  }, [input, mode, encodeType, autoProcess])

  const processUrl = () => {
    if (!input) return

    try {
      let result = ''

      if (mode === 'encode') {
        result = encodeType === 'component'
          ? encodeURIComponent(input)
          : encodeURI(input)
      } else {
        try {
          result = decodeURIComponent(input)
        } catch (e) {
          result = 'Invalid URL encoding'
        }
      }

      setOutput(result)

      // Try to parse URL
      parseUrl(input)

      if (!autoProcess) {
        toast.success(mode === 'encode' ? 'Encoded!' : 'Decoded!')
      }
    } catch (error) {
      toast.error('Processing failed')
    }
  }

  const parseUrl = (url: string) => {
    try {
      const parsed = new URL(url)
      setUrlParts({
        protocol: parsed.protocol.replace(':', ''),
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash
      })
      setIsValidUrl(true)
    } catch (e) {
      setUrlParts(null)
      setIsValidUrl(false)
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${mode}d_url_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const addQueryParam = () => {
    setQueryParams([...queryParams, { id: Date.now().toString(), key: '', value: '' }])
  }

  const removeQueryParam = (id: string) => {
    setQueryParams(queryParams.filter(p => p.id !== id))
  }

  const updateQueryParam = (id: string, field: 'key' | 'value', value: string) => {
    setQueryParams(queryParams.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const buildUrl = () => {
    const params = queryParams
      .filter(p => p.key && p.value)
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&')

    const url = params ? `${baseUrl}?${params}` : baseUrl
    setBuiltUrl(url)
    toast.success('URL built!')
  }

  // Character encoding reference
  const encodingTable = [
    { char: ' ', encoded: '%20', desc: 'Space' },
    { char: '!', encoded: '%21', desc: 'Exclamation mark' },
    { char: '"', encoded: '%22', desc: 'Quotation mark' },
    { char: '#', encoded: '%23', desc: 'Number sign' },
    { char: '$', encoded: '%24', desc: 'Dollar sign' },
    { char: '%', encoded: '%25', desc: 'Percent sign' },
    { char: '&', encoded: '%26', desc: 'Ampersand' },
    { char: "'", encoded: '%27', desc: 'Apostrophe' },
    { char: '(', encoded: '%28', desc: 'Left parenthesis' },
    { char: ')', encoded: '%29', desc: 'Right parenthesis' },
    { char: '*', encoded: '%2A', desc: 'Asterisk' },
    { char: '+', encoded: '%2B', desc: 'Plus sign' },
    { char: ',', encoded: '%2C', desc: 'Comma' },
    { char: '/', encoded: '%2F', desc: 'Forward slash' },
    { char: ':', encoded: '%3A', desc: 'Colon' },
    { char: ';', encoded: '%3B', desc: 'Semicolon' },
    { char: '=', encoded: '%3D', desc: 'Equals sign' },
    { char: '?', encoded: '%3F', desc: 'Question mark' },
    { char: '@', encoded: '%40', desc: 'At sign' },
    { char: '[', encoded: '%5B', desc: 'Left bracket' },
    { char: ']', encoded: '%5D', desc: 'Right bracket' },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 rounded-xl shadow-lg">
            <LinkIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Advanced URL Encoder
            </h1>
            <p className="text-muted-foreground mt-1">
              Encode/decode • URL parser • Query builder • 20+ char reference
            </p>
          </div>
        </div>

        <Tabs defaultValue="encoder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="encoder">Encoder</TabsTrigger>
            <TabsTrigger value="parser">Parser</TabsTrigger>
            <TabsTrigger value="builder">Builder</TabsTrigger>
          </TabsList>

          {/* Encoder Tab */}
          <TabsContent value="encoder" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>URL Encoder/Decoder</CardTitle>
                        <CardDescription>
                          {autoProcess ? 'Auto-processes as you type' : 'Click button to process'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={autoProcess}
                            onCheckedChange={setAutoProcess}
                            id="auto"
                          />
                          <Label htmlFor="auto" className="text-xs cursor-pointer">Auto</Label>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={mode} onValueChange={(v: 'encode' | 'decode') => setMode(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="encode">Encode</SelectItem>
                          <SelectItem value="decode">Decode</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={encodeType} onValueChange={(v: 'component' | 'uri') => setEncodeType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="component">encodeURIComponent</SelectItem>
                          <SelectItem value="uri">encodeURI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">Input</Label>
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                          mode === 'encode'
                            ? 'https://example.com?name=John Doe&email=john@example.com'
                            : 'https://example.com?name=John%20Doe&email=john%40example.com'
                        }
                        className="font-mono text-sm h-32"
                      />
                      {input && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{input.length} chars</Badge>
                          {isValidUrl ? (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Valid URL
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Not a valid URL
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {!autoProcess && (
                      <Button onClick={processUrl} className="w-full bg-gradient-to-r from-sky-500 to-indigo-500">
                        {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
                      </Button>
                    )}

                    <div>
                      <Label className="text-sm mb-2 block flex items-center justify-between">
                        <span>Output</span>
                        {output && <Badge variant="outline" className="text-xs">{output.length} chars</Badge>}
                      </Label>
                      <Textarea
                        value={output}
                        readOnly
                        placeholder="Result will appear here..."
                        className="font-mono text-sm h-32 bg-muted"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => handleCopy(output)} variant="outline" disabled={!output}>
                        {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copy
                      </Button>
                      <Button onClick={downloadOutput} variant="outline" disabled={!output}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Encoding Reference */}
              <div>
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Encoding Reference</CardTitle>
                    <CardDescription>Common character encodings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {encodingTable.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 border rounded hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => handleCopy(item.encoded)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-lg font-mono font-bold">{item.char}</span>
                            <Badge variant="outline" className="text-xs">Click to copy</Badge>
                          </div>
                          <p className="text-xs font-mono text-primary">{item.encoded}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Parser Tab */}
          <TabsContent value="parser" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>URL Parser</CardTitle>
                <CardDescription>Break down URL into components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Enter URL to parse</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value)
                        parseUrl(e.target.value)
                      }}
                      placeholder="https://example.com:8080/path?query=value#hash"
                      className="font-mono flex-1"
                    />
                    <Button onClick={() => parseUrl(input)}>
                      <Search className="w-4 h-4 mr-2" />
                      Parse
                    </Button>
                  </div>
                </div>

                {urlParts && isValidUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    <div className="p-3 bg-muted rounded-lg">
                      <Label className="text-xs text-muted-foreground">Protocol</Label>
                      <p className="font-mono font-bold text-lg">{urlParts.protocol}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <Label className="text-xs text-muted-foreground">Hostname</Label>
                      <p className="font-mono font-bold text-lg">{urlParts.hostname}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <Label className="text-xs text-muted-foreground">Port</Label>
                      <p className="font-mono font-bold text-lg">{urlParts.port || 'default'}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <Label className="text-xs text-muted-foreground">Path</Label>
                      <p className="font-mono font-bold text-lg">{urlParts.pathname}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg md:col-span-2">
                      <Label className="text-xs text-muted-foreground">Query String</Label>
                      <p className="font-mono font-bold break-all">{urlParts.search || 'none'}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg md:col-span-2">
                      <Label className="text-xs text-muted-foreground">Hash</Label>
                      <p className="font-mono font-bold">{urlParts.hash || 'none'}</p>
                    </div>
                  </motion.div>
                )}

                {!isValidUrl && input && (
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-900 dark:text-red-100 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Invalid URL format
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Query String Builder</CardTitle>
                <CardDescription>Build URL with query parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Base URL</Label>
                  <Input
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://example.com/api"
                    className="font-mono mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Query Parameters</Label>
                    <Button onClick={addQueryParam} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Parameter
                    </Button>
                  </div>

                  {queryParams.map((param) => (
                    <div key={param.id} className="flex gap-2">
                      <Input
                        value={param.key}
                        onChange={(e) => updateQueryParam(param.id, 'key', e.target.value)}
                        placeholder="Key"
                        className="font-mono flex-1"
                      />
                      <Input
                        value={param.value}
                        onChange={(e) => updateQueryParam(param.id, 'value', e.target.value)}
                        placeholder="Value"
                        className="font-mono flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQueryParam(param.id)}
                        disabled={queryParams.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button onClick={buildUrl} className="w-full bg-gradient-to-r from-sky-500 to-indigo-500">
                  Build URL
                </Button>

                {builtUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label>Generated URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={builtUrl}
                        readOnly
                        className="font-mono bg-muted flex-1"
                      />
                      <Button variant="outline" onClick={() => handleCopy(builtUrl)}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
