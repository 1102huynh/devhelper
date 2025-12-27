'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  KeyRound, Copy, AlertCircle, Check, History, Info,
  Clock, Shield, User, FileText, Trash2, Eye, EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DecodedJWT {
  header: any
  payload: any
  signature: string
  raw: string
  isValid: boolean
  error?: string
}

interface TokenHistory {
  id: string
  token: string
  timestamp: number
  preview: string
}

export default function JwtDecoderPage() {
  const [jwt, setJwt] = useState('')
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [history, setHistory] = useState<TokenHistory[]>([])
  const [showToken, setShowToken] = useState(true)
  const [autoDecodeEnabled, setAutoDecodeEnabled] = useState(true)

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jwt_history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load history')
      }
    }
  }, [])

  // Auto-decode on paste if enabled
  useEffect(() => {
    if (autoDecodeEnabled && jwt && jwt.split('.').length === 3) {
      decodeJWT(jwt)
    }
  }, [jwt, autoDecodeEnabled])

  const decodeJWT = (token: string = jwt) => {
    if (!token.trim()) {
      toast.error('Please enter a JWT token')
      return
    }

    try {
      const parts = token.split('.')

      if (parts.length !== 3) {
        setDecoded({
          header: null,
          payload: null,
          signature: '',
          raw: token,
          isValid: false,
          error: 'Invalid JWT format. JWT must have 3 parts separated by dots.',
        })
        toast.error('Invalid JWT format')
        return
      }

      const [headerB64, payloadB64, signature] = parts

      // Decode header
      const headerJson = atob(headerB64.replace(/-/g, '+').replace(/_/g, '/'))
      const header = JSON.parse(headerJson)

      // Decode payload
      const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
      const payload = JSON.parse(payloadJson)

      const decodedResult = {
        header,
        payload,
        signature,
        raw: token,
        isValid: true,
      }

      setDecoded(decodedResult)

      // Add to history
      const preview = payload.sub || payload.email || payload.name || 'JWT Token'
      const historyItem: TokenHistory = {
        id: String(Date.now()),
        token,
        timestamp: Date.now(),
        preview
      }

      const newHistory = [historyItem, ...history.filter(h => h.token !== token)].slice(0, 10)
      setHistory(newHistory)
      localStorage.setItem('jwt_history', JSON.stringify(newHistory))

      toast.success('JWT decoded successfully')
    } catch (error) {
      setDecoded({
        header: null,
        payload: null,
        signature: '',
        raw: token,
        isValid: false,
        error: 'Failed to decode JWT. Please check if the token is valid.',
      })
      toast.error('Failed to decode JWT')
    }
  }

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`${label} copied!`)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatTimestamp = (timestamp: number): string => {
    try {
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getTimeRemaining = (exp: number): string => {
    const now = Date.now() / 1000
    const diff = exp - now

    if (diff <= 0) return 'Expired'

    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  const isExpired = (exp?: number): boolean => {
    if (!exp) return false
    return Date.now() / 1000 > exp
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('jwt_history')
    toast.success('History cleared')
  }

  const loadFromHistory = (item: TokenHistory) => {
    setJwt(item.token)
    decodeJWT(item.token)
  }

  const claimDescriptions: Record<string, string> = {
    sub: 'Subject - Identifies the principal (user ID)',
    iat: 'Issued At - When the token was created',
    exp: 'Expiration Time - When the token expires',
    nbf: 'Not Before - Token is not valid before this time',
    iss: 'Issuer - Who created and signed the token',
    aud: 'Audience - Who the token is intended for',
    jti: 'JWT ID - Unique identifier for the token',
    azp: 'Authorized Party - Party to which ID token was issued'
  }

  const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.4Adcj0MnjHfD0Birth7RbRVkDwvFyjP3_xFg6TqvGCc'

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl shadow-lg">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Advanced JWT Decoder
            </h1>
            <p className="text-muted-foreground mt-1">
              Decode & inspect • Auto-parse • Token history • Claim explanations
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>JWT Token</CardTitle>
                <CardDescription>
                  Paste your JWT token - auto-decodes as you type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={showToken ? jwt : jwt.replace(/./g, '•')}
                    onChange={(e) => setJwt(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="min-h-[120px] font-mono text-sm pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Token Parts Visual */}
                {jwt && jwt.split('.').length === 3 && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                      <p className="font-semibold text-red-700 dark:text-red-400">Header</p>
                      <code className="text-red-600 dark:text-red-300 break-all">
                        {jwt.split('.')[0].substring(0, 20)}...
                      </code>
                    </div>
                    <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded border border-purple-200 dark:border-purple-800">
                      <p className="font-semibold text-purple-700 dark:text-purple-400">Payload</p>
                      <code className="text-purple-600 dark:text-purple-300 break-all">
                        {jwt.split('.')[1].substring(0, 20)}...
                      </code>
                    </div>
                    <div className="p-2 bg-cyan-50 dark:bg-cyan-950 rounded border border-cyan-200 dark:border-cyan-800">
                      <p className="font-semibold text-cyan-700 dark:text-cyan-400">Signature</p>
                      <code className="text-cyan-600 dark:text-cyan-300 break-all">
                        {jwt.split('.')[2].substring(0, 20)}...
                      </code>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => decodeJWT()} className="flex-1 bg-gradient-to-r from-green-500 to-teal-500">
                    <KeyRound className="w-4 h-4 mr-2" />
                    Decode JWT
                  </Button>
                  <Button onClick={() => setJwt(sampleJWT)} variant="outline">
                    Load Sample
                  </Button>
                  <Button onClick={() => setJwt('')} variant="outline">
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Decoded Results */}
            {decoded && decoded.isValid && (
              <Tabs defaultValue="payload" className="space-y-4">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="header">Header</TabsTrigger>
                  <TabsTrigger value="payload">Payload</TabsTrigger>
                  <TabsTrigger value="signature">Signature</TabsTrigger>
                </TabsList>

                <TabsContent value="header">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Header</CardTitle>
                          <CardDescription>Algorithm and token type</CardDescription>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), 'Header')}
                        >
                          {copied === 'Header' ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                          Copy
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm font-mono">
                        {JSON.stringify(decoded.header, null, 2)}
                      </pre>

                      {decoded.header.alg && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>Algorithm:</strong> {decoded.header.alg}
                            {decoded.header.alg === 'HS256' && ' (HMAC SHA-256)'}
                            {decoded.header.alg === 'RS256' && ' (RSA SHA-256)'}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payload">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Payload</CardTitle>
                          <CardDescription>Claims and user data</CardDescription>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), 'Payload')}
                        >
                          {copied === 'Payload' ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                          Copy
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm font-mono">
                        {JSON.stringify(decoded.payload, null, 2)}
                      </pre>

                      {/* Claim Explanations */}
                      <div className="space-y-2">
                        <p className="font-semibold text-sm">Claim Explanations:</p>
                        {Object.keys(decoded.payload).map(key => {
                          const description = claimDescriptions[key]
                          if (!description) return null

                          return (
                            <div key={key} className="p-2 bg-muted rounded text-sm">
                              <strong className="text-foreground">{key}:</strong>{' '}
                              <span className="text-muted-foreground">{description}</span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Timestamps */}
                      {(decoded.payload.exp || decoded.payload.iat || decoded.payload.nbf) && (
                        <div className="border-t pt-4">
                          <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Timestamps
                          </p>
                          <div className="space-y-2 text-sm">
                            {decoded.payload.iat && (
                              <div className="flex justify-between p-2 bg-muted rounded">
                                <span className="text-muted-foreground">Issued At (iat):</span>
                                <span className="font-mono">{formatTimestamp(decoded.payload.iat)}</span>
                              </div>
                            )}
                            {decoded.payload.exp && (
                              <div className={`flex justify-between p-2 rounded ${isExpired(decoded.payload.exp)
                                  ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                                  : 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                                }`}>
                                <span className="text-muted-foreground">Expires (exp):</span>
                                <div className="text-right">
                                  <p className="font-mono">{formatTimestamp(decoded.payload.exp)}</p>
                                  <p className={`text-xs ${isExpired(decoded.payload.exp) ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                    }`}>
                                    {getTimeRemaining(decoded.payload.exp)}
                                  </p>
                                </div>
                              </div>
                            )}
                            {decoded.payload.nbf && (
                              <div className="flex justify-between p-2 bg-muted rounded">
                                <span className="text-muted-foreground">Not Before (nbf):</span>
                                <span className="font-mono">{formatTimestamp(decoded.payload.nbf)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="signature">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Signature</CardTitle>
                          <CardDescription>Base64 URL encoded signature</CardDescription>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(decoded.signature, 'Signature')}
                        >
                          {copied === 'Signature' ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                          Copy
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="p-4 bg-muted rounded-md break-all text-sm font-mono">
                        {decoded.signature}
                      </p>

                      <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-900 dark:text-amber-100 flex items-start gap-2">
                          <Shield className="w-4 h-4 mt-0.5" />
                          <span>
                            <strong>Note:</strong> This tool only decodes the JWT. Signature verification requires the secret key and is not performed here.
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* Error State */}
            {decoded && !decoded.isValid && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    Invalid JWT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{decoded.error}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right - History & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Token History
                    </CardTitle>
                    <CardDescription>Recent tokens</CardDescription>
                  </div>
                  {history.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No history yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 border rounded cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => loadFromHistory(item)}
                      >
                        <p className="text-sm font-semibold truncate">{item.preview}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  About JWT
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p>
                  JSON Web Token (JWT) is a compact, URL-safe means of representing claims securely between two parties.
                </p>
                <div>
                  <p className="font-semibold text-foreground mb-1">Structure:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Header:</strong> Algorithm & token type</li>
                    <li><strong>Payload:</strong> Claims (user data)</li>
                    <li><strong>Signature:</strong> Verification</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Common Uses:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Authentication</li>
                    <li>Authorization</li>
                    <li>Information exchange</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
