'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Globe, Copy, Check, Info, Shield, Zap, AlertTriangle,
  Download, RefreshCw, TrendingUp, Cookie, Lock, Eye, Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

export default function HttpHeadersAnalyzerPage() {
  const [url, setUrl] = useState('https://example.com')
  const [headers, setHeaders] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchTime, setFetchTime] = useState<number | null>(null)
  const [securityScore, setSecurityScore] = useState(0)

  const fetchHeaders = async () => {
    setLoading(true)
    const startTime = performance.now()

    try {
      // Note: This will fail due to CORS in browser - need proxy/backend
      const response = await fetch(url, { method: 'HEAD' })
      const endTime = performance.now()
      setFetchTime(endTime - startTime)

      let headersText = ''
      response.headers.forEach((value, key) => {
        headersText += `${key}: ${value}\n`
      })

      setHeaders(headersText)
      analyzeHeaders(headersText)
    } catch (error) {
      alert('Cannot fetch headers due to CORS. Please paste headers manually or use a CORS proxy.')
    } finally {
      setLoading(false)
    }
  }

  const analyzeHeaders = (headerText?: string) => {
    const headerLines = (headerText || headers).split('\n').filter(line => line.trim())
    const headerMap: Record<string, string> = {}

    headerLines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length) {
        headerMap[key.trim().toLowerCase()] = valueParts.join(':').trim()
      }
    })

    // Security Headers Analysis
    const securityHeaders = {
      'strict-transport-security': {
        present: !!headerMap['strict-transport-security'],
        value: headerMap['strict-transport-security'],
        description: 'Forces HTTPS connections to prevent man-in-the-middle attacks',
        recommendation: 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
        risk: headerMap['strict-transport-security'] ? 'low' : 'high',
        impact: 'critical'
      },
      'content-security-policy': {
        present: !!headerMap['content-security-policy'],
        value: headerMap['content-security-policy'],
        description: 'Prevents XSS, clickjacking and other code injection attacks',
        recommendation: "Add: Content-Security-Policy: default-src 'self'; script-src 'self'",
        risk: headerMap['content-security-policy'] ? 'low' : 'high',
        impact: 'critical'
      },
      'x-frame-options': {
        present: !!headerMap['x-frame-options'],
        value: headerMap['x-frame-options'],
        description: 'Prevents clickjacking by controlling iframe embedding',
        recommendation: 'Add: X-Frame-Options: DENY or SAMEORIGIN',
        risk: headerMap['x-frame-options'] ? 'low' : 'medium',
        impact: 'high'
      },
      'x-content-type-options': {
        present: !!headerMap['x-content-type-options'],
        value: headerMap['x-content-type-options'],
        description: 'Prevents MIME type sniffing',
        recommendation: 'Add: X-Content-Type-Options: nosniff',
        risk: headerMap['x-content-type-options'] ? 'low' : 'medium',
        impact: 'medium'
      },
      'x-xss-protection': {
        present: !!headerMap['x-xss-protection'],
        value: headerMap['x-xss-protection'],
        description: 'Legacy browser XSS protection (mostly deprecated)',
        recommendation: 'Add: X-XSS-Protection: 1; mode=block',
        risk: headerMap['x-xss-protection'] ? 'low' : 'low',
        impact: 'low'
      },
      'referrer-policy': {
        present: !!headerMap['referrer-policy'],
        value: headerMap['referrer-policy'],
        description: 'Controls how much referrer information is shared',
        recommendation: 'Add: Referrer-Policy: strict-origin-when-cross-origin',
        risk: headerMap['referrer-policy'] ? 'low' : 'medium',
        impact: 'medium'
      },
      'permissions-policy': {
        present: !!headerMap['permissions-policy'],
        value: headerMap['permissions-policy'],
        description: 'Controls which browser features can be used',
        recommendation: 'Add: Permissions-Policy: geolocation=(), microphone=()',
        risk: headerMap['permissions-policy'] ? 'low' : 'medium',
        impact: 'medium'
      }
    }

    // Calculate Security Score
    const totalHeaders = Object.keys(securityHeaders).length
    const presentHeaders = Object.values(securityHeaders).filter(h => h.present).length
    const criticalPresent = Object.values(securityHeaders)
      .filter(h => h.impact === 'critical' && h.present).length
    const criticalTotal = Object.values(securityHeaders)
      .filter(h => h.impact === 'critical').length

    const score = Math.round(
      (presentHeaders / totalHeaders) * 60 +
      (criticalPresent / criticalTotal) * 40
    )
    setSecurityScore(score)

    // Cookie Analysis
    const setCookieHeaders = Object.entries(headerMap)
      .filter(([key]) => key.toLowerCase() === 'set-cookie')
      .map(([_, value]) => value)

    const cookies = setCookieHeaders.map(cookieStr => {
      const parts = cookieStr.split(';').map(p => p.trim())
      const [nameValue, ...attributes] = parts
      const [name, value] = nameValue.split('=')

      const hasSecure = attributes.some(a => a.toLowerCase() === 'secure')
      const hasHttpOnly = attributes.some(a => a.toLowerCase() === 'httponly')
      const hasSameSite = attributes.some(a => a.toLowerCase().startsWith('samesite'))

      return {
        name,
        value,
        secure: hasSecure,
        httpOnly: hasHttpOnly,
        sameSite: hasSameSite,
        attributes,
        risk: (!hasSecure || !hasHttpOnly) ? 'medium' : 'low'
      }
    })

    const cacheHeaders = {
      'cache-control': headerMap['cache-control'],
      'expires': headerMap['expires'],
      'etag': headerMap['etag'],
      'last-modified': headerMap['last-modified'],
      'age': headerMap['age'],
      'vary': headerMap['vary']
    }

    const performanceHeaders = {
      'content-encoding': headerMap['content-encoding'],
      'transfer-encoding': headerMap['transfer-encoding'],
      'connection': headerMap['connection'],
      'keep-alive': headerMap['keep-alive'],
      'content-length': headerMap['content-length']
    }

    const corsHeaders = {
      'access-control-allow-origin': headerMap['access-control-allow-origin'],
      'access-control-allow-methods': headerMap['access-control-allow-methods'],
      'access-control-allow-headers': headerMap['access-control-allow-headers'],
      'access-control-allow-credentials': headerMap['access-control-allow-credentials'],
      'access-control-max-age': headerMap['access-control-max-age'],
      'access-control-expose-headers': headerMap['access-control-expose-headers']
    }

    setAnalysis({
      allHeaders: headerMap,
      security: securityHeaders,
      cache: cacheHeaders,
      performance: performanceHeaders,
      cors: corsHeaders,
      cookies,
      headerCount: Object.keys(headerMap).length
    })
  }

  const copyAllHeaders = () => {
    navigator.clipboard.writeText(headers)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadReport = () => {
    const report = {
      url,
      timestamp: new Date().toISOString(),
      securityScore,
      fetchTime,
      analysis
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `headers-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sampleHeaders = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 1234
Cache-Control: max-age=3600, public
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Access-Control-Allow-Origin: *
Content-Encoding: gzip
Connection: keep-alive
Set-Cookie: sessionid=abc123; Secure; HttpOnly; SameSite=Strict`

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />High Risk</Badge>
      case 'medium':
        return <Badge className="bg-orange-500 gap-1"><AlertTriangle className="w-3 h-3" />Medium</Badge>
      case 'low':
        return <Badge className="bg-green-500 gap-1"><Check className="w-3 h-3" />Low Risk</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
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
            <div className="p-3 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl shadow-lg">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Advanced HTTP Headers Analyzer
              </h1>
              <p className="text-muted-foreground mt-1">Analyze security, performance, caching and CORS headers</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Input Headers
              </CardTitle>
              <CardDescription>Fetch from URL or paste response headers manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL Input with Fetch */}
              <div className="space-y-2">
                <Label>URL to Analyze</Label>
                <div className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1"
                  />
                  <Button
                    onClick={fetchHeaders}
                    disabled={!url || loading}
                    variant="outline"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: May fail due to CORS restrictions. Use manual paste instead.
                </p>
              </div>

              {/* Headers Textarea */}
              <div className="space-y-2">
                <Label>Response Headers</Label>
                <Textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder="Content-Type: application/json&#10;Cache-Control: max-age=3600"
                  className="font-mono text-sm min-h-[300px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => analyzeHeaders()}
                  disabled={!headers}
                  className="flex-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600"
                >
                  <Shield className="w-4 h-4 mr-2" />
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

          {/* Results Column */}
          <div className="space-y-6">
            {analysis && (
              <>
                {/* Security Score Card */}
                <Card className="border-2 border-orange-200 dark:border-orange-900">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Security Score
                      </CardTitle>
                      {analysis && (
                        <Button onClick={downloadReport} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className={`text-6xl font-bold ${getScoreColor(securityScore)}`}>
                        {securityScore}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">out of 100</p>
                    </div>
                    <Progress value={securityScore} className="h-3" />
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Headers Found</p>
                        <p className="text-2xl font-bold">{analysis.headerCount}</p>
                      </div>
                      {fetchTime && (
                        <div className="text-center">
                          <p className="text-muted-foreground">Fetch Time</p>
                          <p className="text-2xl font-bold">{fetchTime.toFixed(0)}ms</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!analysis && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter URL or paste headers to analyze</p>
                    <p className="text-sm mt-2">Security, performance and cookie analysis</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Analysis Results Tabs */}
        {analysis && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <Tabs defaultValue="security">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="security">
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="performance">
                    <Zap className="w-4 h-4 mr-2" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="cors">
                    <Globe className="w-4 h-4 mr-2" />
                    CORS
                  </TabsTrigger>
                  <TabsTrigger value="cookies">
                    <Cookie className="w-4 h-4 mr-2" />
                    Cookies
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    <Eye className="w-4 h-4 mr-2" />
                    All
                  </TabsTrigger>
                </TabsList>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4 mt-4">
                  {Object.entries(analysis.security).map(([key, value]: [string, any]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono font-semibold">{key}</code>
                            {getRiskBadge(value.risk)}
                          </div>
                          <p className="text-sm text-muted-foreground">{value.description}</p>
                        </div>
                      </div>

                      {value.present ? (
                        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded">
                          <p className="text-xs font-mono text-green-700 dark:text-green-400 break-all">
                            ✓ {value.value}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 space-y-2">
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                            <p className="text-xs text-red-700 dark:text-red-400 font-semibold">
                              ✗ Header not present
                            </p>
                          </div>
                          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                              <strong>Recommendation:</strong> {value.recommendation}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      Cache Headers
                    </h3>
                    {Object.entries(analysis.cache).map(([key, value]: [string, any]) =>
                      value && (
                        <div key={key} className="p-3 bg-muted rounded-lg">
                          <code className="text-sm font-mono text-blue-600 dark:text-blue-400 font-semibold">
                            {key}
                          </code>
                          <p className="text-sm mt-1 break-all">{value}</p>
                        </div>
                      )
                    )}
                  </div>

                  <div className="space-y-3 mt-6">
                    <h3 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      Performance Headers
                    </h3>
                    {Object.entries(analysis.performance).map(([key, value]: [string, any]) =>
                      value && (
                        <div key={key} className="p-3 bg-muted rounded-lg">
                          <code className="text-sm font-mono text-purple-600 dark:text-purple-400 font-semibold">
                            {key}
                          </code>
                          <p className="text-sm mt-1 break-all">{value}</p>
                        </div>
                      )
                    )}
                  </div>
                </TabsContent>

                {/* CORS Tab */}
                <TabsContent value="cors" className="space-y-4 mt-4">
                  {Object.entries(analysis.cors).some(([_, value]) => value) ? (
                    Object.entries(analysis.cors).map(([key, value]: [string, any]) =>
                      value && (
                        <div key={key} className="p-4 border rounded-lg">
                          <code className="text-sm font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                            {key}
                          </code>
                          <p className="text-sm mt-2 break-all">{value}</p>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No CORS headers found</p>
                    </div>
                  )}
                </TabsContent>

                {/* Cookies Tab */}
                <TabsContent value="cookies" className="space-y-4 mt-4">
                  {analysis.cookies && analysis.cookies.length > 0 ? (
                    analysis.cookies.map((cookie: any, idx: number) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <code className="text-sm font-mono font-semibold">{cookie.name}</code>
                          {getRiskBadge(cookie.risk)}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <Badge variant={cookie.secure ? "default" : "destructive"} className="justify-center">
                            <Lock className="w-3 h-3 mr-1" />
                            {cookie.secure ? 'Secure' : 'Not Secure'}
                          </Badge>
                          <Badge variant={cookie.httpOnly ? "default" : "destructive"} className="justify-center">
                            {cookie.httpOnly ? 'HttpOnly' : 'No HttpOnly'}
                          </Badge>
                          <Badge variant={cookie.sameSite ? "default" : "secondary"} className="justify-center">
                            {cookie.sameSite ? 'SameSite' : 'No SameSite'}
                          </Badge>
                        </div>

                        <div className="text-xs space-y-1">
                          <p className="text-muted-foreground">Attributes:</p>
                          <p className="font-mono">{cookie.attributes.join('; ')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Cookie className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No cookies found in headers</p>
                    </div>
                  )}
                </TabsContent>

                {/* All Headers Tab */}
                <TabsContent value="all" className="space-y-3 mt-4">
                  {Object.entries(analysis.allHeaders).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-3 bg-muted rounded-lg font-mono text-sm">
                      <span className="font-semibold text-primary">{key}:</span>
                      <span className="ml-2 break-all">{value}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Security Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-red-600 dark:text-red-400">🔴 Critical Headers</p>
              <p className="text-muted-foreground">• <strong>HSTS:</strong> Enforce HTTPS to prevent downgrade attacks</p>
              <p className="text-muted-foreground">• <strong>CSP:</strong> Prevent XSS and code injection</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-orange-600 dark:text-orange-400">🟠 Important Headers</p>
              <p className="text-muted-foreground">• <strong>X-Frame-Options:</strong> Prevent clickjacking</p>
              <p className="text-muted-foreground">• <strong>Referrer-Policy:</strong> Control information leakage</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
