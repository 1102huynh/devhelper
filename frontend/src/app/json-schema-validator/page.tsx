'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Textarea } from '@/components/ui/textarea'
import { FileCheck, AlertCircle, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export default function JsonSchemaValidatorPage() {
  const [jsonData, setJsonData] = useState(`{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true
}`)
  const [schema, setSchema] = useState(`{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "number", "minimum": 0 },
    "isActive": { "type": "boolean" }
  },
  "required": ["name", "email"]
}`)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    errors: string[]
  } | null>(null)

  const validateJson = () => {
    try {
      const data = JSON.parse(jsonData)
      const schemaObj = JSON.parse(schema)

      // Basic validation (simplified - in production, use a library like ajv)
      const errors: string[] = []

      // Check required fields
      if (schemaObj.required) {
        schemaObj.required.forEach((field: string) => {
          if (!(field in data)) {
            errors.push(`Missing required field: ${field}`)
          }
        })
      }

      // Check property types
      if (schemaObj.properties) {
        Object.keys(schemaObj.properties).forEach((key) => {
          if (key in data) {
            const expectedType = schemaObj.properties[key].type
            const actualType = typeof data[key]

            if (expectedType === 'number' && actualType !== 'number') {
              errors.push(`Field "${key}" should be a number, got ${actualType}`)
            } else if (expectedType === 'string' && actualType !== 'string') {
              errors.push(`Field "${key}" should be a string, got ${actualType}`)
            } else if (expectedType === 'boolean' && actualType !== 'boolean') {
              errors.push(`Field "${key}" should be a boolean, got ${actualType}`)
            } else if (expectedType === 'object' && actualType !== 'object') {
              errors.push(`Field "${key}" should be an object, got ${actualType}`)
            } else if (expectedType === 'array' && !Array.isArray(data[key])) {
              errors.push(`Field "${key}" should be an array`)
            }

            // Check minimum value for numbers
            if (expectedType === 'number' && schemaObj.properties[key].minimum !== undefined) {
              if (data[key] < schemaObj.properties[key].minimum) {
                errors.push(`Field "${key}" must be >= ${schemaObj.properties[key].minimum}`)
              }
            }

            // Check email format (basic)
            if (schemaObj.properties[key].format === 'email' && actualType === 'string') {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!emailRegex.test(data[key])) {
                errors.push(`Field "${key}" is not a valid email address`)
              }
            }
          }
        })
      }

      setValidationResult({
        valid: errors.length === 0,
        errors
      })
    } catch (err) {
      setValidationResult({
        valid: false,
        errors: [(err as Error).message]
      })
    }
  }

  const schemaExamples = [
    {
      name: 'User Profile',
      schema: `{
  "type": "object",
  "properties": {
    "username": { "type": "string", "minLength": 3 },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "number", "minimum": 18 },
    "roles": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["username", "email"]
}`,
      data: `{
  "username": "testuser",
  "email": "test@example.com",
  "age": 25,
  "roles": ["user", "admin"]
}`
    },
    {
      name: 'API Response',
      schema: `{
  "type": "object",
  "properties": {
    "status": { "type": "string", "enum": ["success", "error"] },
    "data": { "type": "object" },
    "message": { "type": "string" }
  },
  "required": ["status"]
}`,
      data: `{
  "status": "success",
  "data": { "id": 1, "name": "Test" },
  "message": "Operation completed"
}`
    },
    {
      name: 'Product',
      schema: `{
  "type": "object",
  "properties": {
    "id": { "type": "number" },
    "name": { "type": "string" },
    "price": { "type": "number", "minimum": 0 },
    "inStock": { "type": "boolean" },
    "tags": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["id", "name", "price"]
}`,
      data: `{
  "id": 123,
  "name": "Test Product",
  "price": 29.99,
  "inStock": true,
  "tags": ["electronics", "gadget"]
}`
    }
  ]

  const loadExample = (example: typeof schemaExamples[0]) => {
    setSchema(example.schema)
    setJsonData(example.data)
    setValidationResult(null)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <FileCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">JSON Schema Validator</h1>
            <p className="text-muted-foreground">Validate JSON data against schemas for API testing</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>JSON Data</CardTitle>
              <CardDescription>Paste your JSON data to validate</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder='{ "key": "value" }'
                className="font-mono text-sm min-h-[300px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>JSON Schema</CardTitle>
              <CardDescription>Define the expected schema</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                placeholder='{ "type": "object", "properties": {...} }'
                className="font-mono text-sm min-h-[300px]"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={validateJson}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <FileCheck className="w-5 h-5 mr-2" />
            Validate JSON
          </Button>
        </div>

        {validationResult && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                {validationResult.valid ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <CardTitle className="text-green-500">Validation Passed</CardTitle>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-500" />
                    <CardTitle className="text-red-500">Validation Failed</CardTitle>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {validationResult.valid ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-600 dark:text-green-400">
                    ✓ JSON data conforms to the schema
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {validationResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Schema Examples</CardTitle>
            <CardDescription>Click to load example schemas</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {schemaExamples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => loadExample(example)}
              >
                <Badge className="mb-2">{example.name}</Badge>
                <p className="text-xs text-muted-foreground text-left">
                  Click to load this example
                </p>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Supported Schema Features</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Type Validation:</strong> string, number, boolean, object, array</p>
            <p>• <strong>Required Fields:</strong> Ensure mandatory properties exist</p>
            <p>• <strong>Format Validation:</strong> Email format checking</p>
            <p>• <strong>Number Constraints:</strong> Minimum value validation</p>
            <p className="text-blue-600 dark:text-blue-400">
              💡 For production use, consider libraries like AJV for full JSON Schema support
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

