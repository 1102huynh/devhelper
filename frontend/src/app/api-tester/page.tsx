'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiTesterApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Zap, Send, Plus, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

export default function ApiTesterPage() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    setLoading(true)
    try {
      const headerObj: Record<string, string> = {}
      headers.forEach((h) => {
        if (h.key && h.value) {
          headerObj[h.key] = h.value
        }
      })

      const apiResponse = await apiTesterApi.test({
        method,
        url,
        headers: headerObj,
        body: body || undefined,
      })

      setResponse(apiResponse.data)
      toast.success('Request sent successfully')
    } catch (error) {
      toast.error('Error sending request')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadSampleRequest = () => {
    setMethod('GET')
    setUrl('https://jsonplaceholder.typicode.com/users/1')
    setHeaders([{ key: 'Content-Type', value: 'application/json' }])
    setBody('')
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
                <Zap className="w-8 h-8 text-yellow-500" />
                <h1 className="text-4xl font-bold">API Tester</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Quick REST API testing tool
              </p>
            </div>
            <Button onClick={loadSampleRequest} variant="outline">
              Load Sample
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request</CardTitle>
                <CardDescription>Configure your API request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="w-32">
                    <Label>Method</Label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {HTTP_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://api.example.com/endpoint"
                    />
                  </div>
                </div>

                <Button onClick={handleSend} disabled={loading} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Request'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Headers</CardTitle>
                  <Button size="sm" variant="outline" onClick={addHeader}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {headers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No headers added
                  </p>
                ) : (
                  headers.map((header, index) => (
                    <div key={index} className="flex gap-2">
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
              </CardContent>
            </Card>

            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <Card>
                <CardHeader>
                  <CardTitle>Request Body</CardTitle>
                  <CardDescription>JSON payload</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    className="min-h-[200px] font-mono text-sm"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {response && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Response</CardTitle>
                    <CardDescription>
                      Status: {response.statusCode} {response.statusText} • Time:{' '}
                      {response.responseTime}ms
                    </CardDescription>
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
                          <TabsTrigger value="body" className="flex-1">
                            Body
                          </TabsTrigger>
                          <TabsTrigger value="headers" className="flex-1">
                            Headers
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="body">
                          <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm font-mono max-h-[500px] overflow-y-auto">
                            {response.body
                              ? (() => {
                                  try {
                                    return JSON.stringify(JSON.parse(response.body), null, 2)
                                  } catch {
                                    return response.body
                                  }
                                })()
                              : 'No response body'}
                          </pre>
                        </TabsContent>
                        <TabsContent value="headers">
                          <div className="space-y-2">
                            {response.headers && Object.keys(response.headers).length > 0 ? (
                              Object.entries(response.headers).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="p-2 bg-muted rounded-md flex justify-between text-sm"
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
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status Code Reference</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">2xx</span>
                      <span>Success</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">3xx</span>
                      <span>Redirection</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">4xx</span>
                      <span>Client Error</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">5xx</span>
                      <span>Server Error</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

