'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Hash, Copy, Check, FileText, Upload, Shield,
  Info, AlertCircle, CheckCircle2, Fingerprint
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
type OutputFormat = 'hex' | 'base64'

export default function HashGeneratorPage() {
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('hex')
  const [compareHash, setCompareHash] = useState('')
  const [compareResult, setCompareResult] = useState<'match' | 'mismatch' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // HMAC state
  const [hmacKey, setHmacKey] = useState('')
  const [hmacAlgorithm, setHmacAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [hmacHash, setHmacHash] = useState('')

  const algorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

  // Auto-generate hashes when input changes
  useEffect(() => {
    if (input && !file) {
      generateTextHashes()
    } else if (!input && !file) {
      setHashes({})
    }
  }, [input, outputFormat])

  // Generate hashes for text
  const generateTextHashes = async () => {
    if (!input) return

    setIsProcessing(true)
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const results: Record<string, string> = {}

    try {
      for (const algorithm of algorithms) {
        const hashBuffer = await crypto.subtle.digest(algorithm, data)
        results[algorithm] = formatHash(hashBuffer)
      }
      setHashes(results)
    } catch (error) {
      toast.error('Failed to generate hashes')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Generate hashes for file
  const generateFileHashes = async (fileData: ArrayBuffer) => {
    setIsProcessing(true)
    const results: Record<string, string> = {}

    try {
      for (const algorithm of algorithms) {
        const hashBuffer = await crypto.subtle.digest(algorithm, fileData)
        results[algorithm] = formatHash(hashBuffer)
      }
      setHashes(results)
      toast.success('File hashes generated!')
    } catch (error) {
      toast.error('Failed to generate file hashes')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Generate HMAC
  const generateHMAC = async () => {
    if (!input || !hmacKey) {
      toast.error('Enter both text and key for HMAC')
      return
    }

    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(hmacKey)
      const messageData = encoder.encode(input)

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: hmacAlgorithm },
        false,
        ['sign']
      )

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
      setHmacHash(formatHash(signature))
      toast.success('HMAC generated!')
    } catch (error) {
      toast.error('Failed to generate HMAC')
      console.error(error)
    }
  }

  // Format hash output
  const formatHash = (buffer: ArrayBuffer): string => {
    const hashArray = Array.from(new Uint8Array(buffer))

    if (outputFormat === 'hex') {
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } else {
      // Base64
      return btoa(String.fromCharCode(...hashArray))
    }
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setFileName(selectedFile.name)
    setFileSize(selectedFile.size)
    setInput('') // Clear text input

    const reader = new FileReader()
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer
      await generateFileHashes(arrayBuffer)
    }
    reader.readAsArrayBuffer(selectedFile)
  }

  // Compare hash
  const handleCompare = (algorithm: string) => {
    if (!compareHash.trim()) {
      toast.error('Enter a hash to compare')
      return
    }

    const currentHash = hashes[algorithm]?.toLowerCase()
    const inputHash = compareHash.trim().toLowerCase()

    if (currentHash === inputHash) {
      setCompareResult('match')
      toast.success('✓ Hashes match!')
    } else {
      setCompareResult('mismatch')
      toast.error('✗ Hashes do not match')
    }
  }

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`${label} copied!`)
    setTimeout(() => setCopied(null), 2000)
  }

  const clearAll = () => {
    setInput('')
    setFile(null)
    setFileName('')
    setFileSize(0)
    setHashes({})
    setCompareHash('')
    setCompareResult(null)
    setHmacHash('')
    setHmacKey('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 rounded-xl shadow-lg">
            <Fingerprint className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Advanced Hash Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              4 algorithms • File hashing • HMAC • Verification • Multiple formats
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>Enter text or upload a file to generate hashes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="text">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="text" onClick={() => { setFile(null); setFileName(''); }}>
                      <FileText className="w-4 h-4 mr-2" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="file" onClick={() => setInput('')}>
                      <Upload className="w-4 h-4 mr-2" />
                      File
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter text to hash..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                    {input && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{input.length} characters</Badge>
                        <Badge variant="outline">{new TextEncoder().encode(input).length} bytes</Badge>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="file" className="space-y-4">
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {fileName ? (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 mx-auto text-green-500" />
                          <p className="font-semibold">{fileName}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</p>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); clearAll(); }}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                          <p className="font-semibold">Click to upload file</p>
                          <p className="text-sm text-muted-foreground">Any file type supported</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm">Output Format:</Label>
                    <Select value={outputFormat} onValueChange={(v: OutputFormat) => setOutputFormat(v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hex">Hexadecimal</SelectItem>
                        <SelectItem value="base64">Base64</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={clearAll} variant="outline">
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hash Results */}
            {Object.keys(hashes).length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Generated Hashes</CardTitle>
                      <CardDescription>
                        {fileName ? `File: ${fileName}` : 'Text hashes'}
                      </CardDescription>
                    </div>
                    {isProcessing && (
                      <Badge variant="outline">Processing...</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {algorithms.map((algorithm) => (
                    <div key={algorithm} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          {algorithm}
                          <Badge variant="outline" className="text-xs">
                            {hashes[algorithm]?.length} chars
                          </Badge>
                        </Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(hashes[algorithm], algorithm)}
                        >
                          {copied === algorithm ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <Input
                        value={hashes[algorithm]}
                        readOnly
                        className="font-mono text-xs bg-muted"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Hash Verification */}
            {Object.keys(hashes).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Hash Verification
                  </CardTitle>
                  <CardDescription>Compare generated hash with expected value</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={compareHash}
                      onChange={(e) => setCompareHash(e.target.value)}
                      placeholder="Paste hash to verify..."
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {algorithms.map((algorithm) => (
                      <Button
                        key={algorithm}
                        onClick={() => handleCompare(algorithm)}
                        variant="outline"
                        size="sm"
                      >
                        vs {algorithm}
                      </Button>
                    ))}
                  </div>

                  {compareResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border flex items-start gap-3 ${compareResult === 'match'
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                        }`}
                    >
                      {compareResult === 'match' ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <p className="font-semibold text-green-900 dark:text-green-100">
                              ✓ Hashes Match
                            </p>
                            <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                              The hash verification was successful. Integrity confirmed.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                          <div>
                            <p className="font-semibold text-red-900 dark:text-red-100">
                              ✗ Hashes Do Not Match
                            </p>
                            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                              The hash verification failed. The content may have been modified.
                            </p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* HMAC Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  HMAC Generator
                </CardTitle>
                <CardDescription>Hash-based Message Authentication Code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-2 block">Algorithm</Label>
                    <Select value={hmacAlgorithm} onValueChange={(v: HashAlgorithm) => setHmacAlgorithm(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {algorithms.map(alg => (
                          <SelectItem key={alg} value={alg}>{alg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block">Secret Key</Label>
                    <Input
                      value={hmacKey}
                      onChange={(e) => setHmacKey(e.target.value)}
                      placeholder="Enter secret key..."
                      className="font-mono"
                    />
                  </div>
                </div>

                <Button onClick={generateHMAC} className="w-full" disabled={!input || !hmacKey}>
                  Generate HMAC
                </Button>

                {hmacHash && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm">HMAC Result:</Label>
                    <div className="flex gap-2">
                      <Input
                        value={hmacHash}
                        readOnly
                        className="font-mono text-xs bg-muted"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleCopy(hmacHash, 'HMAC')}
                      >
                        {copied === 'HMAC' ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Algorithms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-foreground mb-1">SHA-1</p>
                  <p className="text-muted-foreground text-xs">
                    160-bit (40 hex). Legacy use only. Not secure for critical applications.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">SHA-256</p>
                  <p className="text-muted-foreground text-xs">
                    256-bit (64 hex). Recommended for most use cases. Widely used and secure.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">SHA-384</p>
                  <p className="text-muted-foreground text-xs">
                    384-bit (96 hex). Truncated SHA-512. Good balance of security and performance.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">SHA-512</p>
                  <p className="text-muted-foreground text-xs">
                    512-bit (128 hex). Highest security. Used for critical applications.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Use Cases</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">File Integrity</p>
                  <p className="text-xs">Verify downloads haven't been tampered with</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Data Verification</p>
                  <p className="text-xs">Compare checksums to ensure data integrity</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">HMAC</p>
                  <p className="text-xs">Message authentication with secret key</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Digital Signatures</p>
                  <p className="text-xs">Part of cryptographic signature schemes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-900 dark:text-amber-100">
                    <strong>⚠️ SHA-1 Warning:</strong> SHA-1 is cryptographically broken and should not be used for security purposes.
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                  <p className="text-green-900 dark:text-green-100">
                    <strong>✓ Recommended:</strong> Use SHA-256 or SHA-512 for security-critical applications.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
