'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Server, Copy, Check, Download, Plus, Trash2, Clock,
  Code, Zap, FileJson, Database, RefreshCw, Play, Settings2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface MockEndpoint {
  id: string
  method: string
  path: string
  status: number
  delay: number
  response: string
  headers: Record<string, string>
}

export default function MockApiGeneratorPage() {
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([
    {
      id: '1',
      method: 'GET',
      path: '/api/users',
      status: 200,
      delay: 0,
      response: '',
      headers: { 'Content-Type': 'application/json' }
    }
  ])
  const [selectedEndpoint, setSelectedEndpoint] = useState('1')
  const [mockCode, setMockCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [framework, setFramework] = useState('express')
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [includeDelay, setIncludeDelay] = useState(false)
  const [collectionName, setCollectionName] = useState('My API Collection')

  const templates = {
    user: {
      name: 'Single User',
      icon: '👤',
      data: {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        avatar: 'https://i.pravatar.cc/150?img=1',
        createdAt: new Date().toISOString(),
        isActive: true
      }
    },
    users: {
      name: 'User List',
      icon: '👥',
      data: {
        users: [
          { id: 1, username: 'johndoe', email: 'john@example.com', role: 'admin' },
          { id: 2, username: 'janesmith', email: 'jane@example.com', role: 'user' },
          { id: 3, username: 'bobwilson', email: 'bob@example.com', role: 'moderator' }
        ],
        total: 3,
        page: 1,
        perPage: 10
      }
    },
    auth: {
      name: 'Auth Response',
      icon: '🔐',
      data: {
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'rt_abc123def456...',
        user: {
          id: 1,
          email: 'user@example.com',
          role: 'user'
        },
        expiresIn: 3600
      }
    },
    product: {
      name: 'Product',
      icon: '🛍️',
      data: {
        id: 101,
        name: 'Premium Wireless Headphones',
        sku: 'WH-1000XM4',
        price: 299.99,
        currency: 'USD',
        inStock: true,
        quantity: 50,
        category: 'Electronics',
        brand: 'AudioTech',
        tags: ['featured', 'bestseller', 'new'],
        images: [
          'https://picsum.photos/400/300?random=1',
          'https://picsum.photos/400/300?random=2'
        ],
        rating: 4.8,
        reviews: 1234
      }
    },
    products: {
      name: 'Product List',
      icon: '📦',
      data: {
        products: [
          { id: 101, name: 'Wireless Headphones', price: 299.99, inStock: true },
          { id: 102, name: 'Smart Watch', price: 199.99, inStock: true },
          { id: 103, name: 'USB-C Cable', price: 19.99, inStock: false }
        ],
        pagination: {
          page: 1,
          perPage: 20,
          total: 100,
          totalPages: 5
        }
      }
    },
    post: {
      name: 'Blog Post',
      icon: '📝',
      data: {
        id: 1,
        title: 'Getting Started with React',
        slug: 'getting-started-with-react',
        author: {
          id: 1,
          name: 'John Doe',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        content: 'Lorem ipsum dolor sit amet...',
        excerpt: 'Learn the basics of React...',
        tags: ['react', 'javascript', 'tutorial'],
        published: true,
        publishedAt: new Date().toISOString(),
        views: 1250,
        likes: 89
      }
    },
    error: {
      name: 'Error Response',
      icon: '❌',
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            { field: 'email', message: 'Email is required' },
            { field: 'password', message: 'Password must be at least 8 characters' }
          ]
        },
        timestamp: new Date().toISOString()
      }
    },
    success: {
      name: 'Success Response',
      icon: '✅',
      data: {
        success: true,
        message: 'Operation completed successfully',
        data: {
          id: 123,
          status: 'completed'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  const getCurrentEndpoint = () => endpoints.find(e => e.id === selectedEndpoint) || endpoints[0]

  const updateEndpoint = (updates: Partial<MockEndpoint>) => {
    setEndpoints(endpoints.map(e =>
      e.id === selectedEndpoint ? { ...e, ...updates } : e
    ))
  }

  const addEndpoint = () => {
    const newId = String(Date.now())
    const newEndpoint: MockEndpoint = {
      id: newId,
      method: 'GET',
      path: '/api/endpoint',
      status: 200,
      delay: 0,
      response: '',
      headers: { 'Content-Type': 'application/json' }
    }
    setEndpoints([...endpoints, newEndpoint])
    setSelectedEndpoint(newId)
  }

  const deleteEndpoint = (id: string) => {
    if (endpoints.length === 1) return // Keep at least one
    setEndpoints(endpoints.filter(e => e.id !== id))
    if (selectedEndpoint === id) {
      setSelectedEndpoint(endpoints[0].id)
    }
  }

  const loadTemplate = (template: { name: string; data: any }) => {
    updateEndpoint({ response: JSON.stringify(template.data, null, 2) })
  }

  const generateMockCode = () => {
    let code = ''

    switch (framework) {
      case 'express':
        code = generateExpressCode()
        break
      case 'json-server':
        code = generateJsonServerCode()
        break
      case 'msw':
        code = generateMSWCode()
        break
      case 'fastify':
        code = generateFastifyCode()
        break
      case 'swagger':
        code = generateSwaggerCode()
        break
      case 'graphql':
        code = generateGraphQLCode()
        break
    }

    setMockCode(code)
  }

  const generateExpressCode = () => {
    const routes = endpoints.map(ep => {
      const body = ep.response || '{}'
      const headersCode = includeHeaders
        ? `\n  ${Object.entries(ep.headers).map(([k, v]) => `res.setHeader('${k}', '${v}');`).join('\n  ')}`
        : ''
      const delayCode = includeDelay && ep.delay > 0
        ? `\n  await new Promise(resolve => setTimeout(resolve, ${ep.delay}));`
        : ''

      return `app.${ep.method.toLowerCase()}('${ep.path}', async (req, res) => {${delayCode}${headersCode}
  res.status(${ep.status}).json(${body});
});`
    }).join('\n\n')

    return `// Express.js Mock Server
const express = require('express');
const app = express();

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

${routes}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`Mock server running on http://localhost:\${PORT}\`);
});

// Install: npm install express
// Run: node server.js`
  }

  const generateJsonServerCode = () => {
    const db: any = {}
    endpoints.forEach(ep => {
      const resourceName = ep.path.replace('/api/', '').replace('/', '')
      try {
        db[resourceName] = JSON.parse(ep.response || '{}')
      } catch (e) {
        db[resourceName] = {}
      }
    })

    return `// db.json for JSON Server
${JSON.stringify(db, null, 2)}

// Install: npm install -g json-server
// Run: json-server --watch db.json --port 3001
// API: http://localhost:3001/${Object.keys(db)[0] || 'resource'}`
  }

  const generateMSWCode = () => {
    const handlers = endpoints.map(ep => {
      const body = ep.response || '{}'
      const delayCode = includeDelay && ep.delay > 0 ? `\n      ctx.delay(${ep.delay}),` : ''
      const headersCode = includeHeaders
        ? `\n      ${Object.entries(ep.headers).map(([k, v]) => `ctx.set('${k}', '${v}')`).join(',\n      ')},`
        : ''

      return `  rest.${ep.method.toLowerCase()}('${ep.path}', (req, res, ctx) => {
    return res(${delayCode}${headersCode}
      ctx.status(${ep.status}),
      ctx.json(${body})
    );
  })`
    }).join(',\n\n')

    return `// Mock Service Worker (MSW)
import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
${handlers}
];

export const server = setupServer(...handlers);

// Install: npm install msw --save-dev
// Setup: npx msw init public/
// In tests: server.listen() / server.close()`
  }

  const generateFastifyCode = () => {
    const routes = endpoints.map(ep => {
      const body = ep.response || '{}'
      const delayCode = includeDelay && ep.delay > 0
        ? `\n    await new Promise(resolve => setTimeout(resolve, ${ep.delay}));`
        : ''

      return `fastify.${ep.method.toLowerCase()}('${ep.path}', async (request, reply) => {${delayCode}
  return reply.status(${ep.status}).send(${body});
});`
    }).join('\n\n')

    return `// Fastify Mock Server
const fastify = require('fastify')({ logger: true });

// Enable CORS
fastify.register(require('@fastify/cors'), {
  origin: '*'
});

${routes}

const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    console.log('Mock server running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Install: npm install fastify @fastify/cors
// Run: node server.js`
  }

  const generateSwaggerCode = () => {
    const paths: any = {}
    endpoints.forEach(ep => {
      if (!paths[ep.path]) paths[ep.path] = {}

      const response = JSON.parse(ep.response || '{}')
      paths[ep.path][ep.method.toLowerCase()] = {
        summary: `${ep.method} ${ep.path}`,
        responses: {
          [ep.status]: {
            description: 'Successful response',
            content: {
              'application/json': {
                example: response
              }
            }
          }
        }
      }
    })

    const spec = {
      openapi: '3.0.0',
      info: {
        title: collectionName,
        version: '1.0.0',
        description: 'Generated Mock API'
      },
      servers: [
        { url: 'http://localhost:3001', description: 'Mock Server' }
      ],
      paths
    }

    return `# OpenAPI 3.0 Specification
${JSON.stringify(spec, null, 2)}

# Use with Swagger UI:
# https://editor.swagger.io/
# Or run: npx swagger-ui serve swagger.json`
  }

  const generateGraphQLCode = () => {
    return `// GraphQL Mock Server
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql\`
  type Query {
    users: [User!]!
    user(id: ID!): User
  }
  
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
  }
\`;

const resolvers = {
  Query: {
    users: () => ${endpoints[0]?.response || '[]'},
    user: (_, { id }) => {
      const users = ${endpoints[0]?.response || '[]'};
      return users.find(u => u.id === parseInt(id));
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen(3001).then(({ url }) => {
  console.log(\`GraphQL server ready at \${url}\`);
});

// Install: npm install apollo-server graphql
// Run: node server.js
// Playground: http://localhost:3001`
  }

  const exportPostman = () => {
    const collection = {
      info: {
        name: collectionName,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: endpoints.map(ep => ({
        name: `${ep.method} ${ep.path}`,
        request: {
          method: ep.method,
          header: Object.entries(ep.headers).map(([key, value]) => ({ key, value })),
          url: {
            raw: `http://localhost:3001${ep.path}`,
            protocol: 'http',
            host: ['localhost'],
            port: '3001',
            path: ep.path.split('/').filter(Boolean)
          }
        },
        response: [{
          name: 'Example Response',
          status: String(ep.status),
          code: ep.status,
          header: Object.entries(ep.headers).map(([key, value]) => ({ key, value })),
          body: ep.response
        }]
      }))
    }

    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${collectionName.replace(/\s+/g, '_')}_postman.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(mockCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
    const extensions: Record<string, string> = {
      'json-server': 'json',
      'express': 'js',
      'msw': 'js',
      'fastify': 'js',
      'swagger': 'json',
      'graphql': 'js'
    }

    const blob = new Blob([mockCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mock-${framework}.${extensions[framework] || 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentEndpoint = getCurrentEndpoint()

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Server className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Mock API Generator
              </h1>
              <p className="text-muted-foreground mt-1">Generate production-ready mock APIs for testing and development</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Endpoints List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Endpoints</CardTitle>
                <Button onClick={addEndpoint} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>Manage your API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedEndpoint === ep.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                    }`}
                  onClick={() => setSelectedEndpoint(ep.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={`${ep.method === 'GET' ? 'bg-green-500' :
                        ep.method === 'POST' ? 'bg-blue-500' :
                          ep.method === 'PUT' ? 'bg-orange-500' :
                            ep.method === 'DELETE' ? 'bg-red-500' : 'bg-purple-500'
                      }`}>
                      {ep.method}
                    </Badge>
                    {endpoints.length > 1 && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteEndpoint(ep.id)
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <code className="text-xs">{ep.path}</code>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{ep.status}</Badge>
                    {ep.delay > 0 && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Clock className="w-3 h-3" />
                        {ep.delay}ms
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Middle: Config */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Endpoint Configuration</CardTitle>
              <CardDescription>Configure the selected endpoint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Method & Path */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>HTTP Method</Label>
                  <Select value={currentEndpoint.method} onValueChange={(val) => updateEndpoint({ method: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status Code</Label>
                  <Input
                    type="number"
                    value={currentEndpoint.status}
                    onChange={(e) => updateEndpoint({ status: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {/* Path */}
              <div className="space-y-2">
                <Label>Endpoint Path</Label>
                <Input
                  value={currentEndpoint.path}
                  onChange={(e) => updateEndpoint({ path: e.target.value })}
                  placeholder="/api/resource"
                />
              </div>

              {/* Delay */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Response Delay (ms)
                </Label>
                <Input
                  type="number"
                  value={currentEndpoint.delay}
                  onChange={(e) => updateEndpoint({ delay: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              {/* Response Body */}
              <div className="space-y-2">
                <Label>Response Body (JSON)</Label>
                <Textarea
                  value={currentEndpoint.response}
                  onChange={(e) => updateEndpoint({ response: e.target.value })}
                  placeholder='{ "message": "Success" }'
                  className="font-mono text-sm min-h-[200px]"
                />
              </div>

              {/* Templates */}
              <div className="space-y-2">
                <Label>Quick Templates</Label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(templates).map(([key, template]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => loadTemplate(template)}
                      className="flex-col h-auto py-2"
                    >
                      <span className="text-xl mb-1">{template.icon}</span>
                      <span className="text-xs">{template.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Generation Section */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Generated Code
                </CardTitle>
                <CardDescription>Production-ready mock server code</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="Collection Name"
                  className="w-48"
                />
                <Button onClick={exportPostman} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Postman
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Framework Selection */}
            <Tabs value={framework} onValueChange={setFramework}>
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="express">Express</TabsTrigger>
                <TabsTrigger value="fastify">Fastify</TabsTrigger>
                <TabsTrigger value="json-server">JSON Server</TabsTrigger>
                <TabsTrigger value="msw">MSW</TabsTrigger>
                <TabsTrigger value="swagger">OpenAPI</TabsTrigger>
                <TabsTrigger value="graphql">GraphQL</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Options */}
            <div className="flex gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Switch
                  id="headers"
                  checked={includeHeaders}
                  onCheckedChange={setIncludeHeaders}
                />
                <Label htmlFor="headers" className="cursor-pointer">Include Headers</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="delay"
                  checked={includeDelay}
                  onCheckedChange={setIncludeDelay}
                />
                <Label htmlFor="delay" className="cursor-pointer">Include Delays</Label>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateMockCode}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white"
              size="lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Generate {framework.toUpperCase()} Code
            </Button>

            {/* Generated Code */}
            <AnimatePresence>
              {mockCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Textarea
                    value={mockCode}
                    readOnly
                    className="font-mono text-xs min-h-[400px] bg-gray-950 text-green-400"
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
                      Download File
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Framework Info */}
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card className="border-indigo-200 dark:border-indigo-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-500" />
                Multiple Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create and manage multiple API endpoints in one mock server
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                Network Delays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Simulate real network latency with configurable response delays
              </p>
            </CardContent>
          </Card>

          <Card className="border-pink-200 dark:border-pink-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileJson className="w-4 h-4 text-pink-500" />
                Export Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export as Postman collection or OpenAPI specification
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
