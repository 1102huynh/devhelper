'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Globe, Copy, Check, Info, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export default function HttpHeadersAnalyzerPage() {
  const [url, setUrl] = useState('https://example.com')
  const [headers, setHeaders] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [copied, setCopied] = useState(false)


  const analyzeHeaders = () => {
    const headerLines = headers.split('\n').filter(line => line.trim())
    const headerMap: Record<string, string> = {}

    headerLines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length) {
        headerMap[key.trim().toLowerCase()] = valueParts.join(':').trim()
      }
    })

    const securityHeaders = {
      'strict-transport-security': {
        present: !!headerMap['strict-transport-security'],
        value: headerMap['strict-transport-security'],
        description: 'Enforces HTTPS connections',
        risk: headerMap['strict-transport-security'] ? 'low' : 'high'
      },
      'content-security-policy': {
        present: !!headerMap['content-security-policy'],
        value: headerMap['content-security-policy'],
        description: 'Prevents XSS and injection attacks',
        risk: headerMap['content-security-policy'] ? 'low' : 'medium'
      },
      'x-frame-options': {
        present: !!headerMap['x-frame-options'],
        value: headerMap['x-frame-options'],
        description: 'Prevents clickjacking attacks',
        risk: headerMap['x-frame-options'] ? 'low' : 'medium'
      },
      'x-content-type-options': {
        present: !!headerMap['x-content-type-options'],
        value: headerMap['x-content-type-options'],
        description: 'Prevents MIME type sniffing',
        risk: headerMap['x-content-type-options'] ? 'low' : 'medium'
      },
      'x-xss-protection': {
        present: !!headerMap['x-xss-protection'],
        value: headerMap['x-xss-protection'],
        description: 'Legacy XSS protection',
        risk: headerMap['x-xss-protection'] ? 'low' : 'low'
      }
    }

    const cacheHeaders = {
      'cache-control': headerMap['cache-control'],
      'expires': headerMap['expires'],
      'etag': headerMap['etag'],
      'last-modified': headerMap['last-modified']
    }

    const performanceHeaders = {
      'content-encoding': headerMap['content-encoding'],
      'transfer-encoding': headerMap['transfer-encoding'],
      'connection': headerMap['connection'],
      'keep-alive': headerMap['keep-alive']
    }

    const corsHeaders = {
      'access-control-allow-origin': headerMap['access-control-allow-origin'],
      'access-control-allow-methods': headerMap['access-control-allow-methods'],
      'access-control-allow-headers': headerMap['access-control-allow-headers'],
      'access-control-allow-credentials': headerMap['access-control-allow-credentials']
    }

    setAnalysis({
      allHeaders: headerMap,
      security: securityHeaders,
      cache: cacheHeaders,
      performance: performanceHeaders,
      cors: corsHeaders
    })
  }

  const copyAllHeaders = () => {
    navigator.clipboard.writeText(headers)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sampleHeaders = `HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 1234
Cache-Control: max-age=3600, public
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Access-Control-Allow-Origin: *
Content-Encoding: gzip
Connection: keep-alive`

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>
      case 'medium':
        return <Badge className="bg-orange-500">Medium Risk</Badge>
      case 'low':
        return <Badge className="bg-green-500">Low Risk</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">HTTP Headers Analyzer</h1>
            <p className="text-muted-foreground">Analyze security, caching, and performance headers</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Response Headers</CardTitle>
              <CardDescription>Paste HTTP response headers to analyze</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>URL (Optional)</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Headers</Label>
                <Textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder="Content-Type: application/json&#10;Cache-Control: max-age=3600"
                  className="font-mono text-sm min-h-[300px] mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={analyzeHeaders}
                  disabled={!headers}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Analyze Headers
                </Button>
                <Button
                  onClick={copyAllHeaders}
                  variant="outline"
                  disabled={!headers}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <Button
                onClick={() => setHeaders(sampleHeaders)}
                variant="outline"
                className="w-full"
              >
                Load Sample Headers
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {analysis && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-500" />
                      <CardTitle>Security Headers</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analysis.security).map(([key, value]: [string, any]) => (
                      <div key={key} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-xs font-mono">{key}</code>
                          {getRiskBadge(value.risk)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{value.description}</p>
                        {value.present ? (
                          <p className="text-xs font-mono text-green-600 dark:text-green-400 break-all">
                            {value.value}
                          </p>
                        ) : (
                          <p className="text-xs text-red-600 dark:text-red-400">Not present</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <CardTitle>Cache & Performance</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analysis.cache).map(([key, value]: [string, any]) =>
                      value && (
                        <div key={key} className="p-3 bg-muted rounded-lg">
                          <code className="text-xs font-mono text-blue-600 dark:text-blue-400">
                            {key}
                          </code>
                          <p className="text-xs mt-1 break-all">{value}</p>
                        </div>
                      )
                    )}
                    {Object.entries(analysis.performance).map(([key, value]: [string, any]) =>
                      value && (
                        <div key={key} className="p-3 bg-muted rounded-lg">
                          <code className="text-xs font-mono text-purple-600 dark:text-purple-400">
                            {key}
                          </code>
                          <p className="text-xs mt-1 break-all">{value}</p>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-cyan-500" />
                      <CardTitle>CORS Headers</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analysis.cors).map(([key, value]: [string, any]) =>
                      value && (
                        <div key={key} className="p-3 bg-muted rounded-lg">
                          <code className="text-xs font-mono text-cyan-600 dark:text-cyan-400">
                            {key}
                          </code>
                          <p className="text-xs mt-1 break-all">{value}</p>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {!analysis && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Paste headers and click "Analyze Headers" to see results</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Why Analyze HTTP Headers?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Security:</strong> Identify missing security headers that could expose vulnerabilities</p>
            <p>• <strong>Performance:</strong> Check caching and compression settings for optimization</p>
            <p>• <strong>CORS:</strong> Debug cross-origin resource sharing issues</p>
            <p>• <strong>Compliance:</strong> Ensure headers meet security standards and best practices</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

