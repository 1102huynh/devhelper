'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiTesterApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Send, Plus, X, Copy, Download, History,
  Save, Trash2, Clock, CheckCircle, XCircle, AlertCircle,
  Code, Eye, FileJson, Key, Lock, MoreVertical
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'

const HTTP_METHODS = [
  { value: 'GET', color: 'bg-green-500' },
  { value: 'POST', color: 'bg-blue-500' },
  { value: 'PUT', color: 'bg-orange-500' },
  { value: 'PATCH', color: 'bg-purple-500' },
  { value: 'DELETE', color: 'bg-red-500' },
  { value: 'HEAD', color: 'bg-gray-500' },
  { value: 'OPTIONS', color: 'bg-yellow-500' },
]

interface Header {
  key: string
  value: string
  enabled: boolean
}

interface QueryParam {
  key: string
  value: string
  enabled: boolean
}

interface SavedRequest {
  id: string
  name: string
  method: string
  url: string
  headers: Header[]
  queryParams: QueryParam[]
  body: string
  authType: string
  authToken: string
  timestamp: number
}

interface RequestHistory {
  id: string
  method: string
  url: string
  status: number
  time: number
  timestamp: number
}

export default function ApiTesterPage() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<Header[]>([])
  const [queryParams, setQueryParams] = useState<QueryParam[]>([])
  const [body, setBody] = useState('')
  const [authType, setAuthType] = useState('none')
  const [authToken, setAuthToken] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([])
  const [requestHistory, setRequestHistory] = useState<RequestHistory[]>([])
  const [beautifyJson, setBeautifyJson] = useState(true)
  const [showRawResponse, setShowRawResponse] = useState(false)

  useEffect(() => {
    // Load saved requests from localStorage
    const saved = localStorage.getItem('apiTester_savedRequests')
    if (saved) {
      try {
        setSavedRequests(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved requests')
      }
    }

    // Load request history
    const history = localStorage.getItem('apiTester_history')
    if (history) {
      try {
        setRequestHistory(JSON.parse(history))
      } catch (e) {
        console.error('Failed to load history')
      }
    }
  }, [])

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }])
  }

  const updateHeader = (index: number, field: keyof Header, value: string | boolean) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value as any
    setHeaders(newHeaders)
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '', enabled: true }])
  }

  const updateQueryParam = (index: number, field: keyof QueryParam, value: string | boolean) => {
    const newParams = [...queryParams]
    newParams[index][field] = value as any
    setQueryParams(newParams)
  }

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index))
  }

  const buildUrlWithParams = () => {
    const enabledParams = queryParams.filter(p => p.enabled && p.key)
    if (enabledParams.length === 0) return url

    const baseUrl = url.split('?')[0]
    const queryString = enabledParams
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&')

    return `${baseUrl}?${queryString}`
  }

  const handleSend = async () => {
    const finalUrl = buildUrlWithParams()

    if (!finalUrl) {
      toast.error('Please enter a URL')
      return
    }

    setLoading(true)
    const startTime = Date.now()

    try {
      const headerObj: Record<string, string> = {}
      headers.forEach((h) => {
        if (h.enabled && h.key && h.value) {
          headerObj[h.key] = h.value
        }
      })

      // Add auth header
      if (authType === 'bearer' && authToken) {
        headerObj['Authorization'] = `Bearer ${authToken}`
      } else if (authType === 'basic' && authToken) {
        headerObj['Authorization'] = `Basic ${btoa(authToken)}`
      } else if (authType === 'apikey' && authToken) {
        headerObj['X-API-Key'] = authToken
      }

      const apiResponse = await apiTesterApi.test({
        method,
        url: finalUrl,
        headers: headerObj,
        body: body || undefined,
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime

      setResponse({
        ...apiResponse.data,
        responseTime
      })

      // Add to history
      const historyItem: RequestHistory = {
        id: String(Date.now()),
        method,
        url: finalUrl,
        status: apiResponse.data.statusCode,
        time: responseTime,
        timestamp: Date.now()
      }
      const newHistory = [historyItem, ...requestHistory].slice(0, 50) // Keep last 50
      setRequestHistory(newHistory)
      localStorage.setItem('apiTester_history', JSON.stringify(newHistory))

      toast.success('Request sent successfully')
    } catch (error) {
      toast.error('Error sending request')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const saveRequest = () => {
    const name = prompt('Enter a name for this request:')
    if (!name) return

    const savedRequest: SavedRequest = {
      id: String(Date.now()),
      name,
      method,
      url,
      headers,
      queryParams,
      body,
      authType,
      authToken,
      timestamp: Date.now()
    }

    const updated = [...savedRequests, savedRequest]
    setSavedRequests(updated)
    localStorage.setItem('apiTester_savedRequests', JSON.stringify(updated))
    toast.success('Request saved!')
  }

  const loadSavedRequest = (req: SavedRequest) => {
    setMethod(req.method)
    setUrl(req.url)
    setHeaders(req.headers)
    setQueryParams(req.queryParams || [])
    setBody(req.body)
    setAuthType(req.authType || 'none')
    setAuthToken(req.authToken || '')
    toast.success(`Loaded: ${req.name}`)
  }

  const deleteSavedRequest = (id: string) => {
    const updated = savedRequests.filter(r => r.id !== id)
    setSavedRequests(updated)
    localStorage.setItem('apiTester_savedRequests', JSON.stringify(updated))
    toast.success('Request deleted')
  }

  const clearHistory = () => {
    setRequestHistory([])
    localStorage.removeItem('apiTester_history')
    toast.success('History cleared')
  }

  const copyResponseBody = () => {
    if (response?.body) {
      navigator.clipboard.writeText(response.body)
      toast.success('Response copied to clipboard')
    }
  }

  const downloadResponse = () => {
    if (response?.body) {
      const blob = new Blob([response.body], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `response_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Response downloaded')
    }
  }

  const formatBody = () => {
    try {
      const parsed = JSON.parse(body)
      setBody(JSON.stringify(parsed, null, 2))
      toast.success('JSON formatted')
    } catch (e) {
      toast.error('Invalid JSON')
    }
  }

  const commonHeaders = [
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Accept', value: 'application/json' },
    { key: 'User-Agent', value: 'API-Tester/1.0' },
    { key: 'Accept-Language', value: 'en-US,en;q=0.9' },
  ]

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-500'
    if (status >= 300 && status < 400) return 'text-blue-500'
    if (status >= 400 && status < 500) return 'text-orange-500'
    if (status >= 500) return 'text-red-500'
    return 'text-gray-500'
  }

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="w-4 h-4" />
    if (status >= 400) return <XCircle className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  const sampleRequests = [
    {
      name: 'JSONPlaceholder - Get User',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users/1',
      headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }]
    },
    {
      name: 'JSONPlaceholder - Create Post',
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
      body: JSON.stringify({ title: 'foo', body: 'bar', userId: 1 }, null, 2)
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-xl shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
                Professional API Tester
              </h1>
              <p className="text-muted-foreground mt-1">
                Test REST APIs like a pro • Save requests • Track history
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileJson className="w-4 h-4 mr-2" />
                  Samples
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sampleRequests.map((req, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    onClick={() => {
                      setMethod(req.method)
                      setUrl(req.url)
                      setHeaders(req.headers)
                      setBody(req.body || '')
                    }}
                  >
                    {req.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={saveRequest} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="saved">
                <TabsList className="w-full">
                  <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                </TabsList>

                <TabsContent value="saved" className="space-y-2 mt-4 max-h-[600px] overflow-y-auto">
                  {savedRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No saved requests
                    </p>
                  ) : (
                    savedRequests.map(req => (
                      <div
                        key={req.id}
                        className="p-3 border rounded-lg hover:border-primary cursor-pointer group"
                        onClick={() => loadSavedRequest(req)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={HTTP_METHODS.find(m => m.value === req.method)?.color}>
                            {req.method}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSavedRequest(req.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-medium truncate">{req.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{req.url}</p>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-2 mt-4 max-h-[600px] overflow-y-auto">
                  {requestHistory.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mb-2"
                      onClick={clearHistory}
                    >
                      Clear History
                    </Button>
                  )}
                  {requestHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No history yet
                    </p>
                  ) : (
                    requestHistory.map(item => (
                      <div
                        key={item.id}
                        className="p-3 border rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={HTTP_METHODS.find(m => m.value === item.method)?.color}>
                            {item.method}
                          </Badge>
                          <div className={`flex items-center gap-1 ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span>{item.status}</span>
                          </div>
                        </div>
                        <p className="text-xs truncate">{item.url}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {item.time}ms
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Request Builder */}
            <Card>
              <CardHeader>
                <CardTitle>Request Builder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Method + URL */}
                <div className="flex gap-2">
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HTTP_METHODS.map(m => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleSend()
                      }
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={loading}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-8"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+Enter</kbd> to send
                </p>

                {/* Tabs */}
                <Tabs defaultValue="params">
                  <TabsList className="w-full">
                    <TabsTrigger value="params" className="flex-1">Query Params</TabsTrigger>
                    <TabsTrigger value="headers" className="flex-1">Headers</TabsTrigger>
                    <TabsTrigger value="auth" className="flex-1">Auth</TabsTrigger>
                    {['POST', 'PUT', 'PATCH'].includes(method) && (
                      <TabsTrigger value="body" className="flex-1">Body</TabsTrigger>
                    )}
                  </TabsList>

                  {/* Query Params */}
                  <TabsContent value="params" className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>URL Parameters</Label>
                      <Button size="sm" variant="outline" onClick={addQueryParam}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {queryParams.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No query parameters
                      </p>
                    ) : (
                      queryParams.map((param, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Switch
                            checked={param.enabled}
                            onCheckedChange={(val) => updateQueryParam(index, 'enabled', val)}
                          />
                          <Input
                            placeholder="Key"
                            value={param.key}
                            onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                          />
                          <Input
                            placeholder="Value"
                            value={param.value}
                            onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeQueryParam(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Headers */}
                  <TabsContent value="headers" className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Request Headers</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={addHeader}>
                            Custom Header
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {commonHeaders.map((h, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              onClick={() => setHeaders([...headers, { ...h, enabled: true }])}
                            >
                              {h.key}: {h.value}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {headers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No headers added
                      </p>
                    ) : (
                      headers.map((header, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Switch
                            checked={header.enabled}
                            onCheckedChange={(val) => updateHeader(index, 'enabled', val)}
                          />
                          <Input
                            placeholder="Key"
                            value={header.key}
                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                          />
                          <Input
                            placeholder="Value"
                            value={header.value}
                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeHeader(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Auth */}
                  <TabsContent value="auth" className="space-y-3">
                    <div>
                      <Label>Authorization Type</Label>
                      <Select value={authType} onValueChange={setAuthType}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Auth</SelectItem>
                          <SelectItem value="bearer">Bearer Token</SelectItem>
                          <SelectItem value="basic">Basic Auth</SelectItem>
                          <SelectItem value="apikey">API Key</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {authType !== 'none' && (
                      <div>
                        <Label>
                          {authType === 'bearer' && 'Token'}
                          {authType === 'basic' && 'username:password'}
                          {authType === 'apikey' && 'API Key'}
                        </Label>
                        <Input
                          type="password"
                          value={authToken}
                          onChange={(e) => setAuthToken(e.target.value)}
                          placeholder={
                            authType === 'bearer' ? 'eyJhbGciOi...' :
                              authType === 'basic' ? 'username:password' :
                                'your-api-key'
                          }
                          className="mt-2 font-mono"
                        />
                      </div>
                    )}
                  </TabsContent>

                  {/* Body */}
                  {['POST', 'PUT', 'PATCH'].includes(method) && (
                    <TabsContent value="body" className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Request Body (JSON)</Label>
                        <Button size="sm" variant="outline" onClick={formatBody}>
                          <Code className="w-4 h-4 mr-1" />
                          Format
                        </Button>
                      </div>
                      <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>

            {/* Response */}
            <AnimatePresence>
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Response
                            <Badge className={getStatusColor(response.statusCode)}>
                              {getStatusIcon(response.statusCode)}
                              {response.statusCode} {response.statusText}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {response.responseTime}ms
                            </span>
                            <span>
                              Size: {response.body ? new Blob([response.body]).size : 0} bytes
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={copyResponseBody}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={downloadResponse}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {response.error ? (
                        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                          <p className="font-semibold mb-2">Error</p>
                          <p className="text-sm">{response.error}</p>
                        </div>
                      ) : (
                        <Tabs defaultValue="body">
                          <TabsList className="w-full">
                            <TabsTrigger value="body" className="flex-1">Body</TabsTrigger>
                            <TabsTrigger value="headers" className="flex-1">Headers</TabsTrigger>
                          </TabsList>

                          <TabsContent value="body" className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Response Body</Label>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={beautifyJson}
                                  onCheckedChange={setBeautifyJson}
                                  id="beautify"
                                />
                                <Label htmlFor="beautify" className="text-sm cursor-pointer">
                                  Beautify
                                </Label>
                              </div>
                            </div>
                            <pre className="p-4 bg-gray-950 text-green-400 rounded-md overflow-x-auto text-sm font-mono max-h-[500px] overflow-y-auto">
                              {response.body
                                ? (() => {
                                  try {
                                    return beautifyJson
                                      ? JSON.stringify(JSON.parse(response.body), null, 2)
                                      : response.body
                                  } catch {
                                    return response.body
                                  }
                                })()
                                : 'No response body'}
                            </pre>
                          </TabsContent>

                          <TabsContent value="headers" className="space-y-2">
                            {response.headers && Object.keys(response.headers).length > 0 ? (
                              Object.entries(response.headers).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="p-3 bg-muted rounded-md flex justify-between text-sm"
                                >
                                  <span className="font-semibold">{key}:</span>
                                  <span className="text-muted-foreground truncate ml-2">
                                    {value as string}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No headers
                              </p>
                            )}
                          </TabsContent>
                        </Tabs>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
