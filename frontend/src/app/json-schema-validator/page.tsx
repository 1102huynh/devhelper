'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  FileCheck, AlertCircle, Check, X, Wand2, Copy,
  Download, RefreshCw, Code, Zap, Eye, Settings2, FileJson
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv({ allErrors: true, verbose: true })
addFormats(ajv)

export default function JsonSchemaValidatorPage() {
  const [jsonData, setJsonData] = useState(`{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "website": "https://example.com",
  "isActive": true,
  "createdAt": "2024-01-15"
}`)
  const [schema, setSchema] = useState(`{
  "type": "object",
  "properties": {
    "name": { "type": "string", "minLength": 2 },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "number", "minimum": 0, "maximum": 150 },
    "website": { "type": "string", "format": "uri" },
    "isActive": { "type": "boolean" },
    "createdAt": { "type": "string", "format": "date" }
  },
  "required": ["name", "email"],
  "additionalProperties": false
}`)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    errors: any[]
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [autoFormat, setAutoFormat] = useState(true)
  const [showStats, setShowStats] = useState(false)
  const [jsonStats, setJsonStats] = useState<any>(null)

  useEffect(() => {
    if (autoFormat) {
      try {
        const formatted = JSON.stringify(JSON.parse(jsonData), null, 2)
        if (formatted !== jsonData) {
          setJsonData(formatted)
        }
      } catch (e) {
        // Invalid JSON, don't format
      }
    }
  }, [])

  const validateJson = () => {
    try {
      const data = JSON.parse(jsonData)
      const schemaObj = JSON.parse(schema)

      // Use AJV for validation
      const validate = ajv.compile(schemaObj)
      const valid = validate(data)

      if (valid) {
        setValidationResult({
          valid: true,
          errors: []
        })

        // Calculate stats
        calculateStats(data)
      } else {
        setValidationResult({
          valid: false,
          errors: validate.errors || []
        })
      }
    } catch (err) {
      setValidationResult({
        valid: false,
        errors: [{
          message: (err as Error).message,
          keyword: 'parse'
        }]
      })
    }
  }

  const calculateStats = (data: any) => {
    const stats = {
      totalKeys: 0,
      depth: 0,
      typeBreakdown: {} as Record<string, number>,
      size: JSON.stringify(data).length
    }

    const traverse = (obj: any, currentDepth: number = 0) => {
      if (currentDepth > stats.depth) stats.depth = currentDepth

      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          stats.totalKeys++
          const type = Array.isArray(obj[key]) ? 'array' : typeof obj[key]
          stats.typeBreakdown[type] = (stats.typeBreakdown[type] || 0) + 1

          if (typeof obj[key] === 'object' && obj[key] !== null) {
            traverse(obj[key], currentDepth + 1)
          }
        })
      }
    }

    traverse(data)
    setJsonStats(stats)
    setShowStats(true)
  }

  const generateSchema = () => {
    try {
      const data = JSON.parse(jsonData)
      const generatedSchema = inferSchema(data)
      setSchema(JSON.stringify(generatedSchema, null, 2))
      setValidationResult(null)
    } catch (err) {
      alert('Invalid JSON data: ' + (err as Error).message)
    }
  }

  const inferSchema = (data: any): any => {
    if (data === null) return { type: 'null' }
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return { type: 'array', items: {} }
      }
      return {
        type: 'array',
        items: inferSchema(data[0])
      }
    }

    const type = typeof data

    if (type === 'object') {
      const properties: any = {}
      const required: string[] = []

      Object.keys(data).forEach(key => {
        properties[key] = inferSchema(data[key])
        if (data[key] !== null && data[key] !== undefined) {
          required.push(key)
        }
      })

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
        additionalProperties: false
      }
    }

    if (type === 'string') {
      // Check for common formats
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const urlRegex = /^https?:\/\/.+/
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      if (emailRegex.test(data)) {
        return { type: 'string', format: 'email' }
      }
      if (urlRegex.test(data)) {
        return { type: 'string', format: 'uri' }
      }
      if (dateRegex.test(data)) {
        return { type: 'string', format: 'date' }
      }
      if (uuidRegex.test(data)) {
        return { type: 'string', format: 'uuid' }
      }

      return { type: 'string' }
    }

    return { type }
  }

  const formatJson = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(jsonData), null, 2)
      setJsonData(formatted)
    } catch (err) {
      alert('Invalid JSON: ' + (err as Error).message)
    }
  }

  const formatSchema = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(schema), null, 2)
      setSchema(formatted)
    } catch (err) {
      alert('Invalid Schema: ' + (err as Error).message)
    }
  }

  const copyData = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadSchema = () => {
    const blob = new Blob([schema], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schema_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const schemaTemplates = [
    {
      name: 'User Profile',
      category: 'Auth',
      icon: '👤',
      schema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "username": { "type": "string", "minLength": 3, "maxLength": 20, "pattern": "^[a-zA-Z0-9_]+$" },
    "email": { "type": "string", "format": "email" },
    "password": { "type": "string", "minLength": 8 },
    "age": { "type": "number", "minimum": 18, "maximum": 120 },
    "roles": { 
      "type": "array", 
      "items": { "type": "string", "enum": ["user", "admin", "moderator"] },
      "minItems": 1,
      "uniqueItems": true
    },
    "profile": {
      "type": "object",
      "properties": {
        "firstName": { "type": "string" },
        "lastName": { "type": "string" },
        "bio": { "type": "string", "maxLength": 500 },
        "avatar": { "type": "string", "format": "uri" }
      }
    },
    "createdAt": { "type": "string", "format": "date-time" },
    "isActive": { "type": "boolean" }
  },
  "required": ["id", "username", "email", "password"],
  "additionalProperties": false
}`,
      data: `{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "age": 30,
  "roles": ["user", "admin"],
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Software developer and tech enthusiast",
    "avatar": "https://example.com/avatar.jpg"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "isActive": true
}`
    },
    {
      name: 'API Response',
      category: 'API',
      icon: '🔌',
      schema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "status": { "type": "string", "enum": ["success", "error", "pending"] },
    "code": { "type": "number", "minimum": 100, "maximum": 599 },
    "message": { "type": "string" },
    "data": { 
      "type": "object",
      "properties": {
        "id": { "type": "number" },
        "items": { "type": "array" }
      }
    },
    "meta": {
      "type": "object",
      "properties": {
        "page": { "type": "number", "minimum": 1 },
        "perPage": { "type": "number", "minimum": 1, "maximum": 100 },
        "total": { "type": "number" }
      }
    },
    "timestamp": { "type": "string", "format": "date-time" }
  },
  "required": ["status", "code", "message"],
  "additionalProperties": true
}`,
      data: `{
  "status": "success",
  "code": 200,
  "message": "Data retrieved successfully",
  "data": {
    "id": 123,
    "items": [1, 2, 3, 4, 5]
  },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 100
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`
    },
    {
      name: 'E-commerce Product',
      category: 'E-commerce',
      icon: '🛍️',
      schema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "sku": { "type": "string", "pattern": "^[A-Z]{3}-[0-9]{6}$" },
    "name": { "type": "string", "minLength": 1, "maxLength": 200 },
    "description": { "type": "string", "maxLength": 2000 },
    "price": { "type": "number", "minimum": 0, "multipleOf": 0.01 },
    "currency": { "type": "string", "enum": ["USD", "EUR", "GBP", "JPY"] },
    "stock": { "type": "integer", "minimum": 0 },
    "categories": { 
      "type": "array", 
      "items": { "type": "string" },
      "minItems": 1
    },
    "images": {
      "type": "array",
      "items": { "type": "string", "format": "uri" }
    },
    "specifications": {
      "type": "object",
      "additionalProperties": { "type": "string" }
    },
    "inStock": { "type": "boolean" },
    "rating": { "type": "number", "minimum": 0, "maximum": 5 }
  },
  "required": ["id", "sku", "name", "price", "currency", "inStock"],
  "additionalProperties": false
}`,
      data: `{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sku": "ELC-123456",
  "name": "Premium Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 199.99,
  "currency": "USD",
  "stock": 50,
  "categories": ["Electronics", "Audio", "Headphones"],
  "images": [
    "https://example.com/product1.jpg",
    "https://example.com/product2.jpg"
  ],
  "specifications": {
    "color": "Black",
    "weight": "250g",
    "battery": "30 hours"
  },
  "inStock": true,
  "rating": 4.5
}`
    },
    {
      name: 'Form Submission',
      category: 'Forms',
      icon: '📝',
      schema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "formId": { "type": "string" },
    "submittedAt": { "type": "string", "format": "date-time" },
    "fields": {
      "type": "object",
      "properties": {
        "fullName": { "type": "string", "minLength": 2 },
        "email": { "type": "string", "format": "email" },
        "phone": { "type": "string", "pattern": "^\\\\+?[1-9]\\\\d{1,14}$" },
        "country": { "type": "string", "minLength": 2, "maxLength": 2 },
        "message": { "type": "string", "minLength": 10, "maxLength": 1000 },
        "consent": { "type": "boolean", "const": true }
      },
      "required": ["fullName", "email", "consent"]
    }
  },
  "required": ["formId", "submittedAt", "fields"],
  "additionalProperties": false
}`,
      data: `{
  "formId": "contact-form-001",
  "submittedAt": "2024-01-15T10:30:00Z",
  "fields": {
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "country": "US",
    "message": "I would like to inquire about your services.",
    "consent": true
  }
}`
    }
  ]

  const loadTemplate = (template: typeof schemaTemplates[0]) => {
    setSchema(template.schema)
    setJsonData(template.data)
    setValidationResult(null)
    setShowStats(false)
  }

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
            <div className="p-3 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <FileCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Advanced JSON Schema Validator
              </h1>
              <p className="text-muted-foreground mt-1">Validate, generate and test JSON schemas with full AJV support</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* JSON Data */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileJson className="w-5 h-5" />
                      JSON Data
                    </CardTitle>
                    <CardDescription>Paste your JSON data to validate</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={formatJson} variant="outline" size="sm">
                      <Code className="w-4 h-4 mr-1" />
                      Format
                    </Button>
                    <Button onClick={() => copyData(jsonData)} variant="outline" size="sm">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder='{ "key": "value" }'
                  className="font-mono text-sm min-h-[400px]"
                />
              </CardContent>
            </Card>

            {/* JSON Stats */}
            {showStats && jsonStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    JSON Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Keys</p>
                      <p className="text-2xl font-bold">{jsonStats.totalKeys}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Depth</p>
                      <p className="text-2xl font-bold">{jsonStats.depth}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="text-2xl font-bold">{jsonStats.size}B</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Types</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {Object.entries(jsonStats.typeBreakdown).map(([type, count]) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}: {count as number}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* JSON Schema */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="w-5 h-5" />
                      JSON Schema
                    </CardTitle>
                    <CardDescription>Define your validation schema</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={generateSchema} variant="outline" size="sm">
                      <Wand2 className="w-4 h-4 mr-1" />
                      Generate
                    </Button>
                    <Button onClick={formatSchema} variant="outline" size="sm">
                      <Code className="w-4 h-4 mr-1" />
                      Format
                    </Button>
                    <Button onClick={downloadSchema} variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-semibold">Auto Format JSON</Label>
                  <Switch checked={autoFormat} onCheckedChange={setAutoFormat} />
                </div>

                <Textarea
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                  placeholder='{ "type": "object", "properties": {...} }'
                  className="font-mono text-sm min-h-[400px]"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Validate Button */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={validateJson}
            size="lg"
            className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white px-12"
          >
            <Zap className="w-5 h-5 mr-2" />
            Validate JSON Schema
          </Button>
        </div>

        {/* Validation Result */}
        <AnimatePresence>
          {validationResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {validationResult.valid ? (
                      <>
                        <Check className="w-6 h-6 text-green-500" />
                        <CardTitle className="text-green-500">✓ Validation Passed</CardTitle>
                      </>
                    ) : (
                      <>
                        <X className="w-6 h-6 text-red-500" />
                        <CardTitle className="text-red-500">✗ Validation Failed</CardTitle>
                      </>
                    )}
                  </div>
                  {validationResult.valid && (
                    <CardDescription>
                      JSON data conforms to the schema specification
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {validationResult.valid ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Check className="w-5 h-5" />
                        <span className="font-semibold">All validations passed successfully!</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your JSON data is valid and matches the schema requirements.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="destructive">
                          {validationResult.errors.length} Error{validationResult.errors.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      {validationResult.errors.map((error, index) => (
                        <div
                          key={index}
                          className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                {error.message || 'Validation error'}
                              </p>
                              {error.instancePath && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Path: <code className="bg-muted px-1 py-0.5 rounded">{error.instancePath || '/'}</code>
                                </p>
                              )}
                              {error.keyword && error.keyword !== 'parse' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Keyword: <Badge variant="outline" className="text-xs">{error.keyword}</Badge>
                                </p>
                              )}
                              {error.params && Object.keys(error.params).length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Details: {JSON.stringify(error.params)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schema Templates */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Schema Templates & Examples</CardTitle>
            <CardDescription>Click to load pre-built schema templates for common use cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {schemaTemplates.map((template, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col items-start p-4 hover:border-green-500/50 hover:bg-green-500/5"
                    onClick={() => loadTemplate(template)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{template.icon}</span>
                      <Badge variant="outline" className="text-xs">{template.category}</Badge>
                    </div>
                    <p className="font-semibold text-left">{template.name}</p>
                    <p className="text-xs text-muted-foreground text-left mt-1">
                      Click to load example
                    </p>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                Full AJV Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Industry-standard JSON Schema validation with draft-07 support
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-emerald-500" />
                Auto Schema Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically generate schemas from your JSON data
              </p>
            </CardContent>
          </Card>

          <Card className="border-teal-200 dark:border-teal-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-500" />
                Format Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Email, URI, date, UUID and many more format validators
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Supported Features */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Supported Validation Features</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="types">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="types">Types</TabsTrigger>
                <TabsTrigger value="formats">Formats</TabsTrigger>
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="types" className="mt-4 space-y-2 text-sm">
                <p>• <strong>string</strong> - Text values</p>
                <p>• <strong>number</strong> - Numeric values (integer or float)</p>
                <p>• <strong>boolean</strong> - true/false values</p>
                <p>• <strong>object</strong> - JSON objects with properties</p>
                <p>• <strong>array</strong> - Lists of items</p>
                <p>• <strong>null</strong> - Null values</p>
              </TabsContent>
              <TabsContent value="formats" className="mt-4 space-y-2 text-sm">
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <p>• <strong>email</strong> - Email addresses</p>
                    <p>• <strong>uri / url</strong> - URLs and URIs</p>
                    <p>• <strong>date</strong> - YYYY-MM-DD format</p>
                    <p>• <strong>date-time</strong> - ISO 8601 datetime</p>
                    <p>• <strong>time</strong> - HH:MM:SS format</p>
                  </div>
                  <div>
                    <p>• <strong>uuid</strong> - UUID format</p>
                    <p>• <strong>ipv4</strong> - IPv4 addresses</p>
                    <p>• <strong>ipv6</strong> - IPv6 addresses</p>
                    <p>• <strong>hostname</strong> - Valid hostnames</p>
                    <p>• <strong>regex</strong> - Regular expressions</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="validation" className="mt-4 space-y-2 text-sm">
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <p>• <strong>required</strong> - Mandatory fields</p>
                    <p>• <strong>enum</strong> - Allowed values list</p>
                    <p>• <strong>pattern</strong> - Regex validation</p>
                    <p>• <strong>minLength / maxLength</strong> - String length</p>
                    <p>• <strong>minimum / maximum</strong> - Number ranges</p>
                  </div>
                  <div>
                    <p>• <strong>minItems / maxItems</strong> - Array size</p>
                    <p>• <strong>uniqueItems</strong> - No duplicates</p>
                    <p>• <strong>multipleOf</strong> - Number divisibility</p>
                    <p>• <strong>const</strong> - Constant value</p>
                    <p>• <strong>default</strong> - Default values</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="advanced" className="mt-4 space-y-2 text-sm">
                <p>• <strong>additionalProperties</strong> - Allow/disallow extra properties</p>
                <p>• <strong>dependencies</strong> - Field dependencies</p>
                <p>• <strong>allOf / anyOf / oneOf</strong> - Schema composition</p>
                <p>• <strong>not</strong> - Schema negation</p>
                <p>• <strong>if / then / else</strong> - Conditional schemas</p>
                <p>• <strong>$ref</strong> - Schema references</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
