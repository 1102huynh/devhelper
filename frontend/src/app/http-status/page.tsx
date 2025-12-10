'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'

const httpStatuses = [
  { code: 100, message: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.' },
  { code: 101, message: 'Switching Protocols', description: 'The requester has asked the server to switch protocols.' },
  { code: 200, message: 'OK', description: 'The request was successful.' },
  { code: 201, message: 'Created', description: 'The request was successful and a resource was created.' },
  { code: 202, message: 'Accepted', description: 'The request has been accepted for processing, but processing has not been completed.' },
  { code: 204, message: 'No Content', description: 'The server successfully processed the request but is not returning any content.' },
  { code: 301, message: 'Moved Permanently', description: 'The requested resource has been permanently moved to a new URL.' },
  { code: 302, message: 'Found', description: 'The requested resource resides temporarily under a different URL.' },
  { code: 304, message: 'Not Modified', description: 'The resource has not been modified since the last request.' },
  { code: 400, message: 'Bad Request', description: 'The server cannot process the request due to a client error.' },
  { code: 401, message: 'Unauthorized', description: 'Authentication is required and has failed or has not been provided.' },
  { code: 403, message: 'Forbidden', description: 'The server understood the request but refuses to authorize it.' },
  { code: 404, message: 'Not Found', description: 'The requested resource could not be found.' },
  { code: 405, message: 'Method Not Allowed', description: 'The request method is not supported for the requested resource.' },
  { code: 408, message: 'Request Timeout', description: 'The server timed out waiting for the request.' },
  { code: 409, message: 'Conflict', description: 'The request conflicts with the current state of the server.' },
  { code: 410, message: 'Gone', description: 'The requested resource is no longer available and will not be available again.' },
  { code: 429, message: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time.' },
  { code: 500, message: 'Internal Server Error', description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.' },
  { code: 501, message: 'Not Implemented', description: 'The server does not support the functionality required to fulfill the request.' },
  { code: 502, message: 'Bad Gateway', description: 'The server received an invalid response from an upstream server.' },
  { code: 503, message: 'Service Unavailable', description: 'The server is currently unable to handle the request due to temporary overload or maintenance.' },
  { code: 504, message: 'Gateway Timeout', description: 'The server did not receive a timely response from an upstream server.' },
]

export default function HttpStatusPage() {
  const [search, setSearch] = useState('')

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'bg-green-500'
    if (code >= 300 && code < 400) return 'bg-blue-500'
    if (code >= 400 && code < 500) return 'bg-yellow-500'
    if (code >= 500) return 'bg-red-500'
    return 'bg-gray-500'
  }

  const filteredStatuses = httpStatuses.filter(status =>
    status.code.toString().includes(search) ||
    status.message.toLowerCase().includes(search.toLowerCase()) ||
    status.description.toLowerCase().includes(search.toLowerCase())
  )

  const statusCategories = [
    { range: '1xx', title: 'Informational', description: 'Request received, continuing process' },
    { range: '2xx', title: 'Success', description: 'Request successfully received, understood, and accepted' },
    { range: '3xx', title: 'Redirection', description: 'Further action needs to be taken to complete the request' },
    { range: '4xx', title: 'Client Error', description: 'Request contains bad syntax or cannot be fulfilled' },
    { range: '5xx', title: 'Server Error', description: 'Server failed to fulfill a valid request' },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">HTTP Status Codes</h1>
          <p className="text-muted-foreground">
            Quick reference guide for HTTP status codes
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Status Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code, message, or description..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-5 gap-4 mb-6">
          {statusCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category.range}</CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-sm mb-1">{category.title}</h4>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredStatuses.map((status) => (
            <motion.div
              key={status.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className={`${getStatusColor(status.code)} text-white px-3 py-1 text-lg font-mono`}>
                      {status.code}
                    </Badge>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{status.message}</h3>
                      <p className="text-muted-foreground">{status.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredStatuses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No status codes found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

