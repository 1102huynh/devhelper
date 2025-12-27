'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Binary, Copy, Check, Upload, Image as ImageIcon,
  Download, Eye, FileText, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'

type EncodeMode = 'text' | 'file' | 'image'

export default function Base64Page() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encodeMode, setEncodeMode] = useState<EncodeMode>('text')
  const [autoProcess, setAutoProcess] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isValidBase64, setIsValidBase64] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-process
  useEffect(() => {
    if (autoProcess && input && mode === 'encode' && encodeMode === 'text') {
      processText()
    } else if (autoProcess && input && mode === 'decode') {
      processText()
    }
  }, [input, mode, autoProcess])

  const processText = () => {
    if (!input) return

    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(input)))
        setOutput(encoded)
        if (!autoProcess) toast.success('Encoded!')
      } else {
        // Validate Base64
        if (!isBase64(input)) {
          setOutput('Invalid Base64 string')
          setIsValidBase64(false)
          return
        }

        const decoded = decodeURIComponent(escape(atob(input.trim())))
        setOutput(decoded)
        setIsValidBase64(true)

        // Check if it's an image
        if (input.startsWith('data:image/') || input.startsWith('/9j/') || input.startsWith('iVBORw')) {
          const imgSrc = input.startsWith('data:') ? input : `data:image/png;base64,${input}`
          setImagePreview(imgSrc)
        } else {
          setImagePreview(null)
        }

        if (!autoProcess) toast.success('Decoded!')
      }
    } catch (error) {
      setOutput('Error: Invalid Base64 or text')
      setIsValidBase64(false)
      if (!autoProcess) toast.error('Processing failed')
    }
  }

  const isBase64 = (str: string): boolean => {
    if (!str || str.length % 4 !== 0) {
      // Allow data URLs
      if (str.startsWith('data:')) return true
      return false
    }
    try {
      return btoa(atob(str)) === str
    } catch (err) {
      return false
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const reader = new FileReader()

    reader.onload = (event) => {
      const base64 = event.target?.result as string

      if (selectedFile.type.startsWith('image/')) {
        setImagePreview(base64)
        setEncodeMode('image')
      } else {
        setEncodeMode('file')
      }

      // Extract just the base64 part (remove data URL prefix)
      const base64Data = base64.split(',')[1] || base64
      setOutput(base64Data)
      toast.success(`File encoded! (${formatFileSize(selectedFile.size)})`)
    }

    reader.readAsDataURL(selectedFile)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `base64_${mode}d_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const downloadDecodedFile = () => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(output.includes(',') ? output.split(',')[1] : output)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray])

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `decoded_file_${Date.now()}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('File downloaded!')
    } catch (error) {
      toast.error('Failed to download file')
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
          <div className="p-3 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-xl shadow-lg">
            <Binary className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Advanced Base64 Tool
            </h1>
            <p className="text-muted-foreground mt-1">
              Text • Files • Images • Auto-process • Preview
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Encoder/Decoder */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Base64 Encoder/Decoder</CardTitle>
                    <CardDescription>
                      {autoProcess ? 'Auto-processes as you type' : 'Click button to process'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={autoProcess}
                        onCheckedChange={setAutoProcess}
                        id="auto"
                      />
                      <Label htmlFor="auto" className="text-xs cursor-pointer">Auto</Label>
                    </div>
                    <Select value={mode} onValueChange={(v: 'encode' | 'decode') => setMode(v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="encode">Encode</SelectItem>
                        <SelectItem value="decode">Decode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'encode' && (
                  <Tabs value={encodeMode} onValueChange={(v: EncodeMode) => setEncodeMode(v)}>
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="text">
                        <FileText className="w-4 h-4 mr-2" />
                        Text
                      </TabsTrigger>
                      <TabsTrigger value="file">
                        <Upload className="w-4 h-4 mr-2" />
                        File
                      </TabsTrigger>
                      <TabsTrigger value="image">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Image
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-4">
                      <div>
                        <Label className="text-sm mb-2 block">Plain Text</Label>
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Enter text to encode..."
                          className="font-mono text-sm h-48"
                        />
                        {input && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{input.length} chars</Badge>
                            <Badge variant="outline" className="text-xs">{new TextEncoder().encode(input).length} bytes</Badge>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="file" className="space-y-4">
                      <div
                        className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {file ? (
                          <div className="space-y-2">
                            <Upload className="w-12 h-12 mx-auto text-green-500" />
                            <p className="font-semibold">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
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
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </TabsContent>

                    <TabsContent value="image" className="space-y-4">
                      <div
                        className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                            <p className="font-semibold">{file?.name}</p>
                            <p className="text-sm text-muted-foreground">{file && formatFileSize(file.size)}</p>
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); clearAll(); }}>
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="font-semibold">Click to upload image</p>
                            <p className="text-sm text-muted-foreground">PNG, JPG, GIF, SVG</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {mode === 'decode' && (
                  <div>
                    <Label className="text-sm mb-2 block flex items-center justify-between">
                      <span>Base64 Input</span>
                      {input && (
                        <Badge variant={isBase64(input) ? 'default' : 'destructive'} className="text-xs">
                          {isBase64(input) ? '✓ Valid' : '✗ Invalid'}
                        </Badge>
                      )}
                    </Label>
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter Base64 string to decode..."
                      className="font-mono text-sm h-48"
                    />
                  </div>
                )}

                {!autoProcess && (
                  <Button onClick={processText} className="w-full bg-gradient-to-r from-orange-500 to-yellow-500">
                    {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
                  </Button>
                )}

                <div>
                  <Label className="text-sm mb-2 block flex items-center justify-between">
                    <span>{mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}</span>
                    {output && <Badge variant="outline" className="text-xs">{output.length} chars</Badge>}
                  </Label>
                  <Textarea
                    value={output}
                    readOnly
                    placeholder={`${mode === 'encode' ? 'Base64' : 'Decoded text'} will appear here...`}
                    className="font-mono text-sm h-48 bg-muted"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => handleCopy(output)} variant="outline" disabled={!output}>
                    {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy
                  </Button>
                  <Button onClick={downloadOutput} variant="outline" disabled={!output}>
                    <Download className="w-4 h-4 mr-2" />
                    .txt
                  </Button>
                  <Button onClick={clearAll} variant="outline">
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Image Preview for Decoded */}
            {mode === 'decode' && imagePreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Image Preview
                  </CardTitle>
                  <CardDescription>Visual rendering of decoded Base64 image</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-grid-pattern">
                    <img src={imagePreview} alt="Decoded" className="max-w-full mx-auto rounded" />
                  </div>
                  <Button onClick={downloadDecodedFile} className="w-full mt-4" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right - Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Base64</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p>
                  Base64 encoding converts binary data to ASCII text format using 64 characters (A-Z, a-z, 0-9, +, /).
                </p>
                <div>
                  <p className="font-semibold text-foreground mb-1">Common Uses:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Embed images in HTML/CSS</li>
                    <li>Email attachments (MIME)</li>
                    <li>Data URLs</li>
                    <li>JWT tokens</li>
                    <li>API authentication</li>
                    <li>Binary data in JSON</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Characteristics:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>33% larger than original</li>
                    <li>Always ends with = or ==</li>
                    <li>Safe for URLs & email</li>
                    <li>Reversible encoding</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Text encoding/decoding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>File upload support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Image preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Auto-process mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Base64 validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Download output</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
