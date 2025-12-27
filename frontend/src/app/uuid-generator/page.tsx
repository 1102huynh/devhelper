'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Copy, RefreshCw, Check, Download, Hash, Info,
  Sparkles, AlertCircle, CheckCircle, Minus, Plus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'

export default function UuidGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(5)
  const [copied, setCopied] = useState<number | null>(null)
  const [format, setFormat] = useState<'standard' | 'uppercase' | 'lowercase' | 'no-hyphens' | 'braces'>('standard')
  const [validateInput, setValidateInput] = useState('')
  const [validationResult, setValidationResult] = useState<{ valid: boolean, version?: string, variant?: string } | null>(null)

  const generateUUID = (): string => {
    return crypto.randomUUID()
  }

  const formatUUID = (uuid: string): string => {
    switch (format) {
      case 'uppercase':
        return uuid.toUpperCase()
      case 'lowercase':
        return uuid.toLowerCase()
      case 'no-hyphens':
        return uuid.replace(/-/g, '')
      case 'braces':
        return `{${uuid}}`
      default:
        return uuid
    }
  }

  const generateUUIDs = () => {
    const newUuids: string[] = []
    const numToGenerate = Math.min(Math.max(1, count), 1000)

    for (let i = 0; i < numToGenerate; i++) {
      newUuids.push(formatUUID(generateUUID()))
    }

    setUuids(newUuids)
    toast.success(`Generated ${numToGenerate} UUIDs!`)
  }

  const validateUUID = (uuid: string) => {
    // Remove braces and hyphens for validation
    const cleaned = uuid.replace(/[{}-]/g, '').toLowerCase()

    // Check if valid hex and correct length
    const isValidHex = /^[0-9a-f]{32}$/i.test(cleaned)

    if (!isValidHex) {
      setValidationResult({ valid: false })
      return
    }

    // Determine version and variant
    const version = cleaned.charAt(12)
    const variant = cleaned.charAt(16)

    let variantType = 'Unknown'
    const variantInt = parseInt(variant, 16)
    if ((variantInt & 0x8) === 0x8) {
      variantType = 'RFC 4122'
    }

    setValidationResult({
      valid: true,
      version: `Version ${version}`,
      variant: variantType
    })
  }

  const handleValidate = () => {
    if (!validateInput.trim()) {
      toast.error('Please enter a UUID to validate')
      return
    }
    validateUUID(validateInput.trim())
  }

  const copyToClipboard = async (text: string, index?: number) => {
    await navigator.clipboard.writeText(text)
    if (index !== undefined) {
      setCopied(index)
      setTimeout(() => setCopied(null), 2000)
    }
    toast.success('Copied to clipboard!')
  }

  const copyAllToClipboard = () => {
    const text = uuids.join('\n')
    copyToClipboard(text)
  }

  const downloadUUIDs = () => {
    const text = uuids.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uuids_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const downloadAsJSON = () => {
    const data = {
      generated: new Date().toISOString(),
      count: uuids.length,
      format: format,
      uuids: uuids
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uuids_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('JSON downloaded!')
  }

  const downloadAsCSV = () => {
    const csv = 'UUID\n' + uuids.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uuids_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV downloaded!')
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
          <div className="p-3 bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 rounded-xl shadow-lg">
            <Hash className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Advanced UUID Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate • Validate • Format • Export up to 1000 UUIDs
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Generator */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  UUID Generator
                </CardTitle>
                <CardDescription>Generate Version 4 (random) UUIDs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Number of UUIDs</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCount(Math.max(1, count - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                        className="text-center font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCount(Math.min(1000, count + 1))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Max: 1000</p>
                  </div>

                  <div>
                    <Label>Format</Label>
                    <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (lowercase)</SelectItem>
                        <SelectItem value="uppercase">UPPERCASE</SelectItem>
                        <SelectItem value="lowercase">lowercase</SelectItem>
                        <SelectItem value="no-hyphens">No Hyphens</SelectItem>
                        <SelectItem value="braces">With Braces {'{}'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={generateUUIDs} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate {count} UUID{count > 1 ? 's' : ''}
                </Button>

                {/* Generated UUIDs */}
                {uuids.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 pt-4 border-t"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        Generated UUIDs
                        <Badge variant="outline">{uuids.length}</Badge>
                      </h3>
                      <div className="flex gap-2">
                        <Button onClick={copyAllToClipboard} variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy All
                        </Button>
                        <Button onClick={downloadUUIDs} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          .txt
                        </Button>
                        <Button onClick={downloadAsJSON} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          .json
                        </Button>
                        <Button onClick={downloadAsCSV} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          .csv
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                      {uuids.map((uuid, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-background rounded border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Badge variant="outline" className="w-10 justify-center text-xs">
                              #{index + 1}
                            </Badge>
                            <code className="text-sm font-mono flex-1">{uuid}</code>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(uuid, index)}
                          >
                            {copied === index ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Validator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  UUID Validator
                </CardTitle>
                <CardDescription>Validate and analyze UUIDs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Enter UUID to Validate</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={validateInput}
                      onChange={(e) => setValidateInput(e.target.value)}
                      placeholder="550e8400-e29b-41d4-a716-446655440000"
                      className="font-mono flex-1"
                    />
                    <Button onClick={handleValidate}>
                      Validate
                    </Button>
                  </div>
                </div>

                {validationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${validationResult.valid
                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {validationResult.valid ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className={`font-semibold ${validationResult.valid
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-red-900 dark:text-red-100'
                          }`}>
                          {validationResult.valid ? 'Valid UUID' : 'Invalid UUID'}
                        </h4>
                        {validationResult.valid && (
                          <div className={`text-sm mt-2 space-y-1 ${validationResult.valid
                              ? 'text-green-800 dark:text-green-200'
                              : 'text-red-800 dark:text-red-200'
                            }`}>
                            <p><strong>Version:</strong> {validationResult.version}</p>
                            <p><strong>Variant:</strong> {validationResult.variant}</p>
                          </div>
                        )}
                        {!validationResult.valid && (
                          <p className="text-sm mt-1 text-red-800 dark:text-red-200">
                            The provided string is not a valid UUID format
                          </p>
                        )}
                      </div>
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
                  Format Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Standard</Label>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs font-mono">
                    550e8400-e29b-41d4-a716-446655440000
                  </code>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">UPPERCASE</Label>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs font-mono">
                    550E8400-E29B-41D4-A716-446655440000
                  </code>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">No Hyphens</Label>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs font-mono">
                    550e8400e29b41d4a716446655440000
                  </code>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">With Braces</Label>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs font-mono">
                    {'{'}550e8400-e29b-41d4-a716-446655440000{'}'}
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About UUIDs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">What is UUID?</p>
                  <p>A 128-bit number used to uniquely identify information in computer systems.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Format</p>
                  <p>8-4-4-4-12 hexadecimal digits (32 hex characters + 4 hyphens)</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Version 4</p>
                  <p>Randomly generated with ~5.3×10³⁶ possible values. Collision probability: virtually zero.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Use Cases</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Database primary keys</li>
                    <li>Session IDs</li>
                    <li>File names</li>
                    <li>API request IDs</li>
                    <li>Distributed systems</li>
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
