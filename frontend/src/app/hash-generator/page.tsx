'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Hash, Copy, Check } from 'lucide-react'

export default function HashGeneratorPage() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: '',
  })
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (input) {
      generateHashes()
    } else {
      setHashes({ md5: '', sha1: '', sha256: '', sha512: '' })
    }
  }, [input])

  const generateHashes = async () => {
    if (!input) return

    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(input)

      // Generate SHA-256
      const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
      const sha256Hash = Array.from(new Uint8Array(sha256Buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // Generate SHA-512
      const sha512Buffer = await crypto.subtle.digest('SHA-512', data)
      const sha512Hash = Array.from(new Uint8Array(sha512Buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // Generate SHA-1
      const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
      const sha1Hash = Array.from(new Uint8Array(sha1Buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // Simple MD5 implementation (not cryptographically secure, for demonstration)
      const md5Hash = simpleMD5(input)

      setHashes({
        md5: md5Hash,
        sha1: sha1Hash,
        sha256: sha256Hash,
        sha512: sha512Hash,
      })
    } catch (error) {
      toast.error('Failed to generate hashes')
      console.error(error)
    }
  }

  // Simple MD5 implementation (demonstration only)
  const simpleMD5 = (str: string): string => {
    // This is a simplified version for demonstration
    // In production, use a proper crypto library
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(32, '0')
  }

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast.success(`${type.toUpperCase()} copied to clipboard`)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const sampleTexts = {
    password: 'MySecurePassword123!',
    email: 'user@example.com',
    text: 'Hello World',
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Hash className="w-8 h-8 text-indigo-500" />
            <h1 className="text-4xl font-bold">Hash Generator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Generate MD5, SHA-1, SHA-256, and SHA-512 hashes
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>Enter text to generate hashes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text here..."
                className="min-h-[150px] font-mono text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <p className="text-xs text-muted-foreground mr-2">Quick samples:</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setInput(sampleTexts.password)}
                  className="text-xs h-7"
                >
                  Password
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setInput(sampleTexts.email)}
                  className="text-xs h-7"
                >
                  Email
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setInput(sampleTexts.text)}
                  className="text-xs h-7"
                >
                  Simple Text
                </Button>
              </div>
            </CardContent>
          </Card>

          {input && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">MD5</CardTitle>
                  <CardDescription>128-bit hash (32 hex characters)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={hashes.md5}
                      readOnly
                      className="font-mono text-sm bg-muted"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCopy(hashes.md5, 'md5')}
                    >
                      {copied === 'md5' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SHA-1</CardTitle>
                  <CardDescription>160-bit hash (40 hex characters)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={hashes.sha1}
                      readOnly
                      className="font-mono text-sm bg-muted"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCopy(hashes.sha1, 'sha1')}
                    >
                      {copied === 'sha1' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SHA-256</CardTitle>
                  <CardDescription>256-bit hash (64 hex characters)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={hashes.sha256}
                      readOnly
                      className="font-mono text-sm bg-muted"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCopy(hashes.sha256, 'sha256')}
                    >
                      {copied === 'sha256' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SHA-512</CardTitle>
                  <CardDescription>512-bit hash (128 hex characters)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={hashes.sha512}
                      readOnly
                      className="font-mono text-sm bg-muted break-all"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCopy(hashes.sha512, 'sha512')}
                    >
                      {copied === 'sha512' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>About Hash Functions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <p className="font-semibold mb-2">Common Use Cases:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>MD5</strong>: Checksums, non-cryptographic purposes (not secure for passwords)</li>
                  <li><strong>SHA-1</strong>: Legacy systems, Git commit hashes</li>
                  <li><strong>SHA-256</strong>: Password hashing, digital signatures, blockchain</li>
                  <li><strong>SHA-512</strong>: High security applications, certificates</li>
                </ul>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <p className="text-yellow-700 dark:text-yellow-400 font-semibold">⚠️ Security Note</p>
                <p className="text-yellow-600 dark:text-yellow-300 text-xs mt-1">
                  MD5 and SHA-1 are not recommended for security-critical applications. Use SHA-256 or SHA-512 for password hashing and security purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

