'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import axios from 'axios'

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  const API_URL_WITH_PATH = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`

  const tests = [
    { name: 'Backend URL', url: API_BASE_URL, method: 'GET' },
    { name: 'Health Check', url: `${API_BASE_URL}/actuator/health`, method: 'GET' },
    { name: 'Notes API', url: `${API_URL_WITH_PATH}/notes`, method: 'GET' },
    { name: 'SSH Commands API', url: `${API_URL_WITH_PATH}/ssh`, method: 'GET' },
  ]

  const testEndpoint = async (test: any) => {
    setLoading(true)
    try {
      const response = await axios.get(test.url, { timeout: 10000 })
      setResults((prev: any) => ({
        ...prev,
        [test.name]: {
          status: 'success',
          code: response.status,
          data: response.data,
        },
      }))
    } catch (error: any) {
      setResults((prev: any) => ({
        ...prev,
        [test.name]: {
          status: 'error',
          code: error.response?.status || 0,
          message: error.message,
          data: error.response?.data,
        },
      }))
    }
    setLoading(false)
  }

  const testAll = async () => {
    setResults({})
    for (const test of tests) {
      await testEndpoint(test)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
            <p className="font-mono text-sm">
              <strong>API Base URL:</strong> {API_BASE_URL}
            </p>
            <p className="font-mono text-sm">
              <strong>API with /api:</strong> {API_URL_WITH_PATH}
            </p>
          </div>

          <Button onClick={testAll} disabled={loading}>
            {loading ? 'Testing...' : 'Test All Endpoints'}
          </Button>

          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test.name} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{test.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {test.method} {test.url}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => testEndpoint(test)} disabled={loading}>
                    Test
                  </Button>
                </div>

                {results[test.name] && (
                  <div className="mt-2">
                    <div
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        results[test.name].status === 'success'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {results[test.name].status === 'success' ? '✅ Success' : '❌ Error'}
                      {' - '}
                      Status: {results[test.name].code}
                    </div>

                    <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(
                        results[test.name].data || results[test.name].message,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded">
            <h4 className="font-semibold mb-2">📝 Troubleshooting Tips:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>If Health Check fails → Backend is not running</li>
              <li>If Health Check works but APIs fail → CORS issue</li>
              <li>If timeout → Check backend URL is correct</li>
              <li>Check browser console for CORS errors</li>
              <li>Verify backend is deployed on Render</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

