'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Server, Copy, Check, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MockApiGeneratorPage() {
  const [endpoint, setEndpoint] = useState('/api/users')
  const [method, setMethod] = useState('GET')
  const [statusCode, setStatusCode] = useState(200)
  const [responseBody, setResponseBody] = useState('')
  const [mockCode, setMockCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [framework, setFramework] = useState('json-server')

  const templates = {
    user: {
      name: 'User',
      data: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    },
    users: {
      name: 'Users List',
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
      ]
    },
    product: {
      name: 'Product',
      data: {
        id: 101,
        name: 'Sample Product',
        price: 29.99,
        inStock: true,
        category: 'Electronics',
        tags: ['featured', 'new']
      }
    },
    error: {
      name: 'Error Response',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input provided',
          details: ['Email is required', 'Password must be at least 8 characters']
        }
      }
    },
    pagination: {
      name: 'Paginated Response',
      data: {
        data: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ],
        pagination: {
          page: 1,
          perPage: 10,
          total: 100,
          totalPages: 10
        }
      }
    }
  }

  const generateMockCode = () => {
    const body = responseBody || JSON.stringify(templates.user.data, null, 2)

    let code = ''

    switch (framework) {
      case 'json-server':
        code = `// db.json for JSON Server
{
  "${endpoint.replace('/api/', '').replace('/', '')}": ${body}
}

// Start server: npx json-server --watch db.json --port 3001`
        break

      case 'express':
        code = `// Express.js Mock Endpoint
const express = require('express');
const app = express();

app.${method.toLowerCase()}('${endpoint}', (req, res) => {
  res.status(${statusCode}).json(${body});
});

app.listen(3001, () => {
  console.log('Mock server running on port 3001');
});`
        break

      case 'msw':
        code = `// Mock Service Worker (MSW)
import { rest } from 'msw';

export const handlers = [
  rest.${method.toLowerCase()}('${endpoint}', (req, res, ctx) => {
    return res(
      ctx.status(${statusCode}),
      ctx.json(${body})
    );
  }),
];`
        break

      case 'fetch-mock':
        code = `// Fetch Mock
fetchMock.${method.toLowerCase()}('${endpoint}', {
  status: ${statusCode},
  body: ${body}
});`
        break

      case 'nock':
        code = `// Nock (Node.js HTTP mocking)
const nock = require('nock');

nock('http://localhost:3001')
  .${method.toLowerCase()}('${endpoint}')
  .reply(${statusCode}, ${body});`
        break

      case 'postman':
        code = `// Postman Mock Server Script
pm.sendRequest({
  url: '${endpoint}',
  method: '${method}',
  header: {
    'Content-Type': 'application/json'
  }
}, function (err, response) {
  console.log(response.json());
});

// Expected Response:
// Status: ${statusCode}
// Body: ${body}`
        break
    }

    setMockCode(code)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(mockCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
    const blob = new Blob([mockCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mock-${framework}.${framework === 'json-server' ? 'json' : 'js'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadTemplate = (template: { name: string; data: any }) => {
    setResponseBody(JSON.stringify(template.data, null, 2))
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mock API Generator</h1>
            <p className="text-muted-foreground">Generate mock API responses for testing</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Define your mock endpoint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>HTTP Method</Label>
                  <Tabs value={method} onValueChange={setMethod} className="mt-2">
                    <TabsList className="grid grid-cols-5">
                      <TabsTrigger value="GET">GET</TabsTrigger>
                      <TabsTrigger value="POST">POST</TabsTrigger>
                      <TabsTrigger value="PUT">PUT</TabsTrigger>
                      <TabsTrigger value="PATCH">PATCH</TabsTrigger>
                      <TabsTrigger value="DELETE">DELETE</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <Label>Endpoint</Label>
                  <Input
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/api/users"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Status Code</Label>
                  <Input
                    type="number"
                    value={statusCode}
                    onChange={(e) => setStatusCode(parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Body</CardTitle>
                <CardDescription>JSON response data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={responseBody}
                  onChange={(e) => setResponseBody(e.target.value)}
                  placeholder='{ "message": "Success" }'
                  className="font-mono text-sm min-h-[200px]"
                />

                <div>
                  <Label>Quick Templates</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(templates).map(([key, template]) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => loadTemplate(template)}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Framework</CardTitle>
                <CardDescription>Choose your mocking framework</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={framework} onValueChange={setFramework}>
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="json-server">JSON Server</TabsTrigger>
                    <TabsTrigger value="express">Express</TabsTrigger>
                    <TabsTrigger value="msw">MSW</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-3 mt-2">
                    <TabsTrigger value="fetch-mock">Fetch Mock</TabsTrigger>
                    <TabsTrigger value="nock">Nock</TabsTrigger>
                    <TabsTrigger value="postman">Postman</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Code</CardTitle>
                <CardDescription>Ready to use in your tests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={generateMockCode}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <Server className="w-4 h-4 mr-2" />
                  Generate Mock Code
                </Button>

                {mockCode && (
                  <>
                    <Textarea
                      value={mockCode}
                      readOnly
                      className="font-mono text-xs min-h-[300px]"
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={copyCode}
                        variant="outline"
                        className="flex-1"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Code
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={downloadCode}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Framework Features</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <h3 className="font-semibold mb-2">JSON Server</h3>
              <p className="text-muted-foreground">Quick REST API with zero coding. Perfect for prototyping.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">MSW</h3>
              <p className="text-muted-foreground">Service Worker based mocking. Works in browser and Node.js.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Nock</h3>
              <p className="text-muted-foreground">HTTP server mocking for Node.js testing.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

