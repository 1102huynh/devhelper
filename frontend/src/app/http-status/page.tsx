'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Globe, AlertCircle, CheckCircle, Info, XCircle, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface HttpStatus {
  code: number
  message: string
  description: string
  category: string
  usage: string
  example?: string
  rfc?: string
}

const httpStatuses: HttpStatus[] = [
  // 1xx Informational
  { code: 100, message: 'Continue', category: '1xx', description: 'The server has received the request headers and the client should proceed to send the request body.', usage: 'Used when client sends Expect: 100-continue header', example: 'POST request with large payload', rfc: 'RFC 7231' },
  { code: 101, message: 'Switching Protocols', category: '1xx', description: 'The requester has asked the server to switch protocols and the server acknowledges that it will do so.', usage: 'Upgrading HTTP to WebSocket', example: 'WebSocket handshake', rfc: 'RFC 7231' },
  { code: 102, message: 'Processing', category: '1xx', description: 'The server has received and is processing the request, but no response is available yet.', usage: 'WebDAV operations that take time', example: 'Long-running server task', rfc: 'RFC 2518' },
  { code: 103, message: 'Early Hints', category: '1xx', description: 'Used to return some response headers before final HTTP message.', usage: 'Performance optimization for preloading resources', example: 'Link headers for CSS/JS preload', rfc: 'RFC 8297' },

  // 2xx Success
  { code: 200, message: 'OK', category: '2xx', description: 'The request succeeded. The meaning depends on the HTTP method.', usage: 'Standard successful response', example: 'GET request successful', rfc: 'RFC 7231' },
  { code: 201, message: 'Created', category: '2xx', description: 'The request succeeded and a new resource was created as a result.', usage: 'Resource creation via POST/PUT', example: 'User account created', rfc: 'RFC 7231' },
  { code: 202, message: 'Accepted', category: '2xx', description: 'The request has been accepted for processing, but processing has not been completed.', usage: 'Asynchronous processing', example: 'Batch job queued', rfc: 'RFC 7231' },
  { code: 203, message: 'Non-Authoritative Information', category: '2xx', description: 'The request was successful but the enclosed payload has been modified from the origin server.', usage: 'Proxy or cache modifications', example: 'Cached response with modifications', rfc: 'RFC 7231' },
  { code: 204, message: 'No Content', category: '2xx', description: 'The server successfully processed the request but is not returning any content.', usage: 'DELETE requests or updates with no response body', example: 'Delete user successful', rfc: 'RFC 7231' },
  { code: 205, message: 'Reset Content', category: '2xx', description: 'The server successfully processed the request and is instructing the client to reset the document view.', usage: 'Form submissions requiring reset', example: 'Form cleared after submit', rfc: 'RFC 7231' },
  { code: 206, message: 'Partial Content', category: '2xx', description: 'The server is delivering only part of the resource due to a range header sent by the client.', usage: 'Video/audio streaming, resume downloads', example: 'Video chunk download', rfc: 'RFC 7233' },
  { code: 207, message: 'Multi-Status', category: '2xx', description: 'Conveys information about multiple resources in situations where multiple status codes might be appropriate.', usage: 'WebDAV bulk operations', example: 'Multiple file operations', rfc: 'RFC 4918' },
  { code: 208, message: 'Already Reported', category: '2xx', description: 'Used inside a DAV: propstat response element to avoid enumerating the internal members of multiple bindings to the same collection repeatedly.', usage: 'WebDAV to avoid repetition', example: 'WebDAV collection members', rfc: 'RFC 5842' },
  { code: 226, message: 'IM Used', category: '2xx', description: 'The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations.', usage: 'Delta encoding', example: 'HTTP delta encoding', rfc: 'RFC 3229' },

  // 3xx Redirection
  { code: 300, message: 'Multiple Choices', category: '3xx', description: 'The request has more than one possible response. The user agent should choose one.', usage: 'Content negotiation with multiple options', example: 'Multiple format options', rfc: 'RFC 7231' },
  { code: 301, message: 'Moved Permanently', category: '3xx', description: 'The requested resource has been permanently moved to a new URL.', usage: 'Permanent URL changes, SEO', example: 'Site migration', rfc: 'RFC 7231' },
  { code: 302, message: 'Found', category: '3xx', description: 'The requested resource resides temporarily under a different URL.', usage: 'Temporary redirects', example: 'Maintenance redirect', rfc: 'RFC 7231' },
  { code: 303, message: 'See Other', category: '3xx', description: 'The response to the request can be found under another URI using a GET method.', usage: 'POST-Redirect-GET pattern', example: 'After form submission', rfc: 'RFC 7231' },
  { code: 304, message: 'Not Modified', category: '3xx', description: 'The resource has not been modified since the version specified by the request headers.', usage: 'Caching with If-Modified-Since', example: 'Browser cache validation', rfc: 'RFC 7232' },
  { code: 305, message: 'Use Proxy', category: '3xx', description: 'The requested resource must be accessed through the proxy given by the Location header.', usage: 'Deprecated for security reasons', example: 'Legacy proxy requirement', rfc: 'RFC 7231' },
  { code: 307, message: 'Temporary Redirect', category: '3xx', description: 'The request should be repeated with another URI but future requests should use the original URI.', usage: 'Temporary redirect preserving method', example: 'Temporary service move', rfc: 'RFC 7231' },
  { code: 308, message: 'Permanent Redirect', category: '3xx', description: 'The request and all future requests should be repeated using another URI.', usage: 'Permanent redirect preserving method', example: 'API version migration', rfc: 'RFC 7538' },

  // 4xx Client Errors
  { code: 400, message: 'Bad Request', category: '4xx', description: 'The server cannot process the request due to malformed syntax or invalid request message.', usage: 'Invalid JSON, missing required fields', example: 'Malformed JSON payload', rfc: 'RFC 7231' },
  { code: 401, message: 'Unauthorized', category: '4xx', description: 'Authentication is required and has failed or has not been provided.', usage: 'Missing or invalid credentials', example: 'Invalid API key', rfc: 'RFC 7235' },
  { code: 402, message: 'Payment Required', category: '4xx', description: 'Reserved for future use. Originally intended for digital payment systems.', usage: 'Experimental, rarely used', example: 'Payment API (future use)', rfc: 'RFC 7231' },
  { code: 403, message: 'Forbidden', category: '4xx', description: 'The server understood the request but refuses to authorize it.', usage: 'Insufficient permissions', example: 'Access denied to resource', rfc: 'RFC 7231' },
  { code: 404, message: 'Not Found', category: '4xx', description: 'The requested resource could not be found but may be available in the future.', usage: 'Resource does not exist', example: 'Page not found', rfc: 'RFC 7231' },
  { code: 405, message: 'Method Not Allowed', category: '4xx', description: 'The request method is not supported for the requested resource.', usage: 'Wrong HTTP verb used', example: 'POST to GET-only endpoint', rfc: 'RFC 7231' },
  { code: 406, message: 'Not Acceptable', category: '4xx', description: 'The requested resource can only generate content not acceptable according to Accept headers.', usage: 'Content negotiation failure', example: 'Unsupported Accept format', rfc: 'RFC 7231' },
  { code: 407, message: 'Proxy Authentication Required', category: '4xx', description: 'The client must first authenticate itself with the proxy.', usage: 'Corporate proxy authentication', example: 'Proxy login required', rfc: 'RFC 7235' },
  { code: 408, message: 'Request Timeout', category: '4xx', description: 'The server timed out waiting for the request from the client.', usage: 'Slow client connections', example: 'Client too slow to send data', rfc: 'RFC 7231' },
  { code: 409, message: 'Conflict', category: '4xx', description: 'The request conflicts with the current state of the server.', usage: 'Concurrent modification conflicts', example: 'Resource version mismatch', rfc: 'RFC 7231' },
  { code: 410, message: 'Gone', category: '4xx', description: 'The requested resource is no longer available and will not be available again.', usage: 'Permanently removed resources', example: 'Deleted account', rfc: 'RFC 7231' },
  { code: 411, message: 'Length Required', category: '4xx', description: 'The request did not specify the length of its content, which is required.', usage: 'Missing Content-Length header', example: 'POST without Content-Length', rfc: 'RFC 7231' },
  { code: 412, message: 'Precondition Failed', category: '4xx', description: 'One or more conditions in the request header fields evaluated to false.', usage: 'Conditional requests fail', example: 'If-Match header mismatch', rfc: 'RFC 7232' },
  { code: 413, message: 'Payload Too Large', category: '4xx', description: 'The request entity is larger than limits defined by server.', usage: 'File upload size limit', example: 'Upload exceeds 10MB', rfc: 'RFC 7231' },
  { code: 414, message: 'URI Too Long', category: '4xx', description: 'The URI provided was too long for the server to process.', usage: 'URL length exceeded', example: 'Query string too long', rfc: 'RFC 7231' },
  { code: 415, message: 'Unsupported Media Type', category: '4xx', description: 'The request entity has a media type which the server does not support.', usage: 'Wrong Content-Type', example: 'XML sent to JSON endpoint', rfc: 'RFC 7231' },
  { code: 416, message: 'Range Not Satisfiable', category: '4xx', description: 'The client has asked for a portion of the file, but the server cannot supply that portion.', usage: 'Invalid byte range', example: 'Range beyond file size', rfc: 'RFC 7233' },
  { code: 417, message: 'Expectation Failed', category: '4xx', description: 'The server cannot meet the requirements of the Expect request-header field.', usage: 'Expect header not supported', example: 'Unsupported expectation', rfc: 'RFC 7231' },
  { code: 418, message: "I'm a teapot", category: '4xx', description: 'The server refuses to brew coffee because it is, permanently, a teapot.', usage: 'April Fools\' joke (HTCPCP)', example: 'Coffee pot protocol', rfc: 'RFC 2324' },
  { code: 421, message: 'Misdirected Request', category: '4xx', description: 'The request was directed at a server that is not able to produce a response.', usage: 'HTTP/2 connection reuse issues', example: 'Wrong host in HTTP/2', rfc: 'RFC 7540' },
  { code: 422, message: 'Unprocessable Entity', category: '4xx', description: 'The request was well-formed but contains semantic errors.', usage: 'Validation errors', example: 'Invalid email format', rfc: 'RFC 4918' },
  { code: 423, message: 'Locked', category: '4xx', description: 'The resource that is being accessed is locked.', usage: 'WebDAV resource locked', example: 'File being edited', rfc: 'RFC 4918' },
  { code: 424, message: 'Failed Dependency', category: '4xx', description: 'The request failed due to failure of a previous request.', usage: 'WebDAV dependency failures', example: 'Parent operation failed', rfc: 'RFC 4918' },
  { code: 425, message: 'Too Early', category: '4xx', description: 'The server is unwilling to risk processing a request that might be replayed.', usage: 'Replay attack prevention', example: 'Early data security', rfc: 'RFC 8470' },
  { code: 426, message: 'Upgrade Required', category: '4xx', description: 'The client should switch to a different protocol.', usage: 'Force protocol upgrade', example: 'Require TLS', rfc: 'RFC 7231' },
  { code: 428, message: 'Precondition Required', category: '4xx', description: 'The server requires the request to be conditional.', usage: 'Prevent lost updates', example: 'Require If-Match header', rfc: 'RFC 6585' },
  { code: 429, message: 'Too Many Requests', category: '4xx', description: 'The user has sent too many requests in a given amount of time (rate limiting).', usage: 'Rate limiting, throttling', example: 'API quota exceeded', rfc: 'RFC 6585' },
  { code: 431, message: 'Request Header Fields Too Large', category: '4xx', description: 'The server is unwilling to process the request because header fields are too large.', usage: 'Large cookies or headers', example: 'Cookie size exceeded', rfc: 'RFC 6585' },
  { code: 451, message: 'Unavailable For Legal Reasons', category: '4xx', description: 'The resource is unavailable due to legal reasons (censorship).', usage: 'Content blocked by law', example: 'DMCA takedown', rfc: 'RFC 7725' },

  // 5xx Server Errors
  { code: 500, message: 'Internal Server Error', category: '5xx', description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.', usage: 'Generic server error', example: 'Unhandled exception', rfc: 'RFC 7231' },
  { code: 501, message: 'Not Implemented', category: '5xx', description: 'The server does not support the functionality required to fulfill the request.', usage: 'Unsupported HTTP method', example: 'TRACE method not supported', rfc: 'RFC 7231' },
  { code: 502, message: 'Bad Gateway', category: '5xx', description: 'The server received an invalid response from an upstream server while acting as a gateway or proxy.', usage: 'Proxy/gateway errors', example: 'Backend server down', rfc: 'RFC 7231' },
  { code: 503, message: 'Service Unavailable', category: '5xx', description: 'The server is currently unable to handle the request due to temporary overload or maintenance.', usage: 'Server overload, maintenance', example: 'Database connection pool full', rfc: 'RFC 7231' },
  { code: 504, message: 'Gateway Timeout', category: '5xx', description: 'The server did not receive a timely response from an upstream server.', usage: 'Upstream timeout', example: 'Backend API timeout', rfc: 'RFC 7231' },
  { code: 505, message: 'HTTP Version Not Supported', category: '5xx', description: 'The server does not support the HTTP protocol version used in the request.', usage: 'Unsupported HTTP version', example: 'HTTP/3 not supported', rfc: 'RFC 7231' },
  { code: 506, message: 'Variant Also Negotiates', category: '5xx', description: 'The server has an internal configuration error: transparent content negotiation results in a circular reference.', usage: 'Content negotiation loop', example: 'Negotiation misconfiguration', rfc: 'RFC 2295' },
  { code: 507, message: 'Insufficient Storage', category: '5xx', description: 'The server is unable to store the representation needed to complete the request.', usage: 'Server disk full', example: 'No storage space', rfc: 'RFC 4918' },
  { code: 508, message: 'Loop Detected', category: '5xx', description: 'The server detected an infinite loop while processing the request.', usage: 'WebDAV infinite loop', example: 'Circular reference detected', rfc: 'RFC 5842' },
  { code: 510, message: 'Not Extended', category: '5xx', description: 'Further extensions to the request are required for the server to fulfill it.', usage: 'Extension framework', example: 'Missing required extension', rfc: 'RFC 2774' },
  { code: 511, message: 'Network Authentication Required', category: '5xx', description: 'The client needs to authenticate to gain network access.', usage: 'Captive portal', example: 'WiFi login required', rfc: 'RFC 6585' },
]

export default function HttpStatusPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedCode, setCopiedCode] = useState<number | null>(null)

  const getStatusColor = (code: number) => {
    if (code >= 100 && code < 200) return 'bg-gray-500'
    if (code >= 200 && code < 300) return 'bg-green-500'
    if (code >= 300 && code < 400) return 'bg-blue-500'
    if (code >= 400 && code < 500) return 'bg-orange-500'
    if (code >= 500) return 'bg-red-500'
    return 'bg-gray-500'
  }

  const getStatusIcon = (code: number) => {
    if (code >= 200 && code < 300) return <CheckCircle className="w-5 h-5" />
    if (code >= 300 && code < 400) return <Info className="w-5 h-5" />
    if (code >= 400 && code < 500) return <AlertCircle className="w-5 h-5" />
    if (code >= 500) return <XCircle className="w-5 h-5" />
    return <Info className="w-5 h-5" />
  }

  const filteredStatuses = httpStatuses.filter(status => {
    const matchesSearch =
      status.code.toString().includes(search) ||
      status.message.toLowerCase().includes(search.toLowerCase()) ||
      status.description.toLowerCase().includes(search.toLowerCase()) ||
      status.usage.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || status.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const statusCategories = [
    { range: '1xx', title: 'Informational', description: 'Request received, continuing process', count: httpStatuses.filter(s => s.category === '1xx').length, color: 'border-gray-200 dark:border-gray-800' },
    { range: '2xx', title: 'Success', description: 'Request successfully received, understood, and accepted', count: httpStatuses.filter(s => s.category === '2xx').length, color: 'border-green-200 dark:border-green-900' },
    { range: '3xx', title: 'Redirection', description: 'Further action needs to be taken', count: httpStatuses.filter(s => s.category === '3xx').length, color: 'border-blue-200 dark:border-blue-900' },
    { range: '4xx', title: 'Client Error', description: 'Request contains bad syntax or cannot be fulfilled', count: httpStatuses.filter(s => s.category === '4xx').length, color: 'border-orange-200 dark:border-orange-900' },
    { range: '5xx', title: 'Server Error', description: 'Server failed to fulfill a valid request', count: httpStatuses.filter(s => s.category === '5xx').length, color: 'border-red-200 dark:border-red-900' },
  ]

  const handleCopyCode = (code: number) => {
    navigator.clipboard.writeText(code.toString())
    setCopiedCode(code)
    toast.success(`${code} copied to clipboard!`)
    setTimeout(() => setCopiedCode(null), 2000)
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
          <div className="p-3 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-xl shadow-lg">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
              HTTP Status Codes Reference
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete guide to all {httpStatuses.length} HTTP status codes with examples
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code, message, description, or usage..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          {statusCategories.map((category) => (
            <Card
              key={category.range}
              className={`cursor-pointer transition-all ${selectedCategory === category.range
                  ? `border-2 ${category.color} shadow-md`
                  : 'hover:shadow-md'
                }`}
              onClick={() => setSelectedCategory(selectedCategory === category.range ? 'all' : category.range)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.range}</CardTitle>
                  <Badge variant="outline">{category.count}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-sm mb-1">{category.title}</h4>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Info */}
        {selectedCategory !== 'all' && (
          <div className="mb-4 flex items-center gap-2">
            <Badge>
              Filtered by: {statusCategories.find(c => c.range === selectedCategory)?.title}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory('all')}>
              Clear Filter
            </Button>
          </div>
        )}

        {/* Status Codes List */}
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredStatuses.map((status, index) => (
              <motion.div
                key={status.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <Badge className={`${getStatusColor(status.code)} text-white px-4 py-2 text-xl font-mono min-w-[80px] justify-center`}>
                          {status.code}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(status.code)}
                          className="h-8"
                        >
                          {copiedCode === status.code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(status.code)}
                          <h3 className="text-xl font-semibold">{status.message}</h3>
                          <Badge variant="outline" className="ml-auto">
                            {status.category}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground mb-3">{status.description}</p>

                        <Tabs defaultValue="usage" className="w-full">
                          <TabsList>
                            <TabsTrigger value="usage">Common Usage</TabsTrigger>
                            {status.example && <TabsTrigger value="example">Example</TabsTrigger>}
                            {status.rfc && <TabsTrigger value="spec">Specification</TabsTrigger>}
                          </TabsList>

                          <TabsContent value="usage" className="mt-3">
                            <div className="p-3 bg-muted rounded-md">
                              <p className="text-sm">{status.usage}</p>
                            </div>
                          </TabsContent>

                          {status.example && (
                            <TabsContent value="example" className="mt-3">
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm font-mono">{status.example}</p>
                              </div>
                            </TabsContent>
                          )}

                          {status.rfc && (
                            <TabsContent value="spec" className="mt-3">
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm">
                                  Defined in: <strong>{status.rfc}</strong>
                                </p>
                              </div>
                            </TabsContent>
                          )}
                        </Tabs>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredStatuses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No status codes found matching your search.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setSelectedCategory('all'); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About HTTP Status Codes</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">RFC Standards</h4>
              <p className="text-muted-foreground">All status codes are standardized in various RFCs (Request for Comments) published by IETF.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Categories</h4>
              <p className="text-muted-foreground">Status codes are grouped into 5 classes based on the first digit (1xx through 5xx).</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage</h4>
              <p className="text-muted-foreground">Understanding status codes helps in API development, debugging, and proper HTTP communication.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
