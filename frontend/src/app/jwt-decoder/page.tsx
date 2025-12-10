'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { KeyRound, Copy, AlertCircle } from 'lucide-react'

interface DecodedJWT {
  header: any
  payload: any
  signature: string
  isValid: boolean
  error?: string
}

export default function JwtDecoderPage() {
  const [jwt, setJwt] = useState('')
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null)

  const decodeJWT = () => {
    if (!jwt.trim()) {
      toast.error('Please enter a JWT token')
      return
    }

    try {
      const parts = jwt.split('.')

      if (parts.length !== 3) {
        setDecoded({
          header: null,
          payload: null,
          signature: '',
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

      setDecoded({
        header,
        payload,
        signature,
        isValid: true,
      })

      toast.success('JWT decoded successfully')
    } catch (error) {
      setDecoded({
        header: null,
        payload: null,
        signature: '',
        isValid: false,
        error: 'Failed to decode JWT. Please check if the token is valid.',
      })
      toast.error('Failed to decode JWT')
    }
  }

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (error) {
      toast.error('Failed to copy')
    }
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

  const isExpired = (exp?: number): boolean => {
    if (!exp) return false
    return Date.now() / 1000 > exp
  }

  const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <KeyRound className="w-8 h-8 text-emerald-500" />
            <h1 className="text-4xl font-bold">JWT Decoder</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Decode and inspect JSON Web Tokens (JWT)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>JWT Token</CardTitle>
              <CardDescription>Paste your JWT token here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jwt}
                onChange={(e) => setJwt(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="min-h-[120px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={decodeJWT} className="flex-1">
                  Decode JWT
                </Button>
                <Button onClick={() => setJwt(sampleJWT)} variant="outline">
                  Load Sample
                </Button>
              </div>
            </CardContent>
          </Card>

          {decoded && (
            <>
              {decoded.isValid ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
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
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm font-mono">
                        {JSON.stringify(decoded.header, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Payload</CardTitle>
                          <CardDescription>Claims and data</CardDescription>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), 'Payload')}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm font-mono">
                        {JSON.stringify(decoded.payload, null, 2)}
                      </pre>

                      {(decoded.payload.exp || decoded.payload.iat || decoded.payload.nbf) && (
                        <div className="border-t pt-4">
                          <p className="font-semibold text-sm mb-3">Timestamps:</p>
                          <div className="space-y-2 text-sm">
                            {decoded.payload.iat && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Issued At (iat):</span>
                                <span className="font-mono">{formatTimestamp(decoded.payload.iat)}</span>
                              </div>
                            )}
                            {decoded.payload.exp && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Expires (exp):</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{formatTimestamp(decoded.payload.exp)}</span>
                                  {isExpired(decoded.payload.exp) && (
                                    <span className="text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded">
                                      Expired
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            {decoded.payload.nbf && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Not Before (nbf):</span>
                                <span className="font-mono">{formatTimestamp(decoded.payload.nbf)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Signature</CardTitle>
                          <CardDescription>Base64 encoded signature</CardDescription>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(decoded.signature, 'Signature')}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="p-4 bg-muted rounded-md break-all text-sm font-mono">
                        {decoded.signature}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
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
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>About JWT</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <p className="mb-2">
                  JSON Web Token (JWT) is an open standard (RFC 7519) for securely transmitting information between parties as a JSON object.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">JWT Structure:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Header</strong>: Contains token type and signing algorithm</li>
                  <li><strong>Payload</strong>: Contains claims (user data, expiration, etc.)</li>
                  <li><strong>Signature</strong>: Ensures token hasn't been tampered with</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Common Claims:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>sub</strong>: Subject (user ID)</li>
                  <li><strong>iat</strong>: Issued at (timestamp)</li>
                  <li><strong>exp</strong>: Expiration (timestamp)</li>
                  <li><strong>iss</strong>: Issuer</li>
                  <li><strong>aud</strong>: Audience</li>
                </ul>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                <p className="text-blue-700 dark:text-blue-400 font-semibold">ℹ️ Note</p>
                <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
                  This tool only decodes JWT tokens. It does NOT verify signatures. Never trust unverified tokens in production!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

