'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Copy, Code, Check, Search, FileText, Link,
  Eye, Hash, Download
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'

type EncodeType = 'html' | 'url' | 'attr' | 'js'

export default function HtmlEncoderPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encodeType, setEncodeType] = useState<EncodeType>('html')
  const [autoProcess, setAutoProcess] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Auto-process when input changes
  useEffect(() => {
    if (autoProcess && input) {
      processText()
    } else if (!input) {
      setOutput('')
    }
  }, [input, mode, encodeType, autoProcess])

  const processText = () => {
    if (!input) {
      toast.error('Enter text to process')
      return
    }

    try {
      let result = ''

      if (mode === 'encode') {
        switch (encodeType) {
          case 'html':
            result = encodeHtml(input)
            break
          case 'url':
            result = encodeURIComponent(input)
            break
          case 'attr':
            result = encodeHtmlAttribute(input)
            break
          case 'js':
            result = encodeForJavaScript(input)
            break
        }
      } else {
        switch (encodeType) {
          case 'html':
            result = decodeHtml(input)
            break
          case 'url':
            try {
              result = decodeURIComponent(input)
            } catch (e) {
              result = 'Invalid URL encoding'
            }
            break
          case 'attr':
            result = decodeHtml(input)
            break
          case 'js':
            result = decodeFromJavaScript(input)
            break
        }
      }

      setOutput(result)
      if (!autoProcess) {
        toast.success(mode === 'encode' ? 'Encoded!' : 'Decoded!')
      }
    } catch (error) {
      toast.error('Processing failed')
      console.error(error)
    }
  }

  const encodeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const decodeHtml = (text: string): string => {
    const div = document.createElement('div')
    div.innerHTML = text
    return div.textContent || div.innerText || ''
  }

  const encodeHtmlAttribute = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  const encodeForJavaScript = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
  }

  const decodeFromJavaScript = (text: string): string => {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\')
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
    a.download = `${mode}d_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const swapInputOutput = () => {
    const temp = input
    setInput(output)
    setOutput(temp)
    setMode(mode === 'encode' ? 'decode' : 'encode')
    toast.success('Swapped!')
  }

  // Common HTML entities database
  const allEntities = [
    { char: '<', entity: '&lt;', code: '&#60;', desc: 'Less than' },
    { char: '>', entity: '&gt;', code: '&#62;', desc: 'Greater than' },
    { char: '&', entity: '&amp;', code: '&#38;', desc: 'Ampersand' },
    { char: '"', entity: '&quot;', code: '&#34;', desc: 'Quotation mark' },
    { char: "'", entity: '&apos;', code: '&#39;', desc: 'Apostrophe' },
    { char: ' ', entity: '&nbsp;', code: '&#160;', desc: 'Non-breaking space' },
    { char: '©', entity: '&copy;', code: '&#169;', desc: 'Copyright' },
    { char: '®', entity: '&reg;', code: '&#174;', desc: 'Registered trademark' },
    { char: '™', entity: '&trade;', code: '&#8482;', desc: 'Trademark' },
    { char: '€', entity: '&euro;', code: '&#8364;', desc: 'Euro sign' },
    { char: '£', entity: '&pound;', code: '&#163;', desc: 'Pound sign' },
    { char: '¥', entity: '&yen;', code: '&#165;', desc: 'Yen sign' },
    { char: '¢', entity: '&cent;', code: '&#162;', desc: 'Cent sign' },
    { char: '§', entity: '&sect;', code: '&#167;', desc: 'Section sign' },
    { char: '¶', entity: '&para;', code: '&#182;', desc: 'Pilcrow sign' },
    { char: '•', entity: '&bull;', code: '&#8226;', desc: 'Bullet' },
    { char: '…', entity: '&hellip;', code: '&#8230;', desc: 'Horizontal ellipsis' },
    { char: '–', entity: '&ndash;', code: '&#8211;', desc: 'En dash' },
    { char: '—', entity: '&mdash;', code: '&#8212;', desc: 'Em dash' },
    { char: '←', entity: '&larr;', code: '&#8592;', desc: 'Left arrow' },
    { char: '→', entity: '&rarr;', code: '&#8594;', desc: 'Right arrow' },
    { char: '↑', entity: '&uarr;', code: '&#8593;', desc: 'Up arrow' },
    { char: '↓', entity: '&darr;', code: '&#8595;', desc: 'Down arrow' },
    { char: '×', entity: '&times;', code: '&#215;', desc: 'Multiplication sign' },
    { char: '÷', entity: '&divide;', code: '&#247;', desc: 'Division sign' },
    { char: '±', entity: '&plusmn;', code: '&#177;', desc: 'Plus-minus sign' },
    { char: '≠', entity: '&ne;', code: '&#8800;', desc: 'Not equal to' },
    { char: '≤', entity: '&le;', code: '&#8804;', desc: 'Less than or equal to' },
    { char: '≥', entity: '&ge;', code: '&#8805;', desc: 'Greater than or equal to' },
    { char: '°', entity: '&deg;', code: '&#176;', desc: 'Degree sign' },
    { char: 'µ', entity: '&micro;', code: '&#181;', desc: 'Micro sign' },
    { char: '¼', entity: '&frac14;', code: '&#188;', desc: 'One quarter' },
    { char: '½', entity: '&frac12;', code: '&#189;', desc: 'One half' },
    { char: '¾', entity: '&frac34;', code: '&#190;', desc: 'Three quarters' },
    { char: '«', entity: '&laquo;', code: '&#171;', desc: 'Left double angle quotes' },
    { char: '»', entity: '&raquo;', code: '&#187;', desc: 'Right double angle quotes' },
  ]

  const filteredEntities = allEntities.filter(e =>
    e.char.includes(searchQuery) ||
    e.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.desc.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-xl shadow-lg">
            <Code className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
              Advanced HTML Encoder
            </h1>
            <p className="text-muted-foreground mt-1">
              HTML • URL • Attributes • JavaScript • 35+ entities
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Input/Output */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Encoder/Decoder</CardTitle>
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
                      <Label htmlFor="auto" className="text-xs cursor-pointer">
                        Auto
                      </Label>
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
                {/* Type Selector */}
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant={encodeType === 'html' ? 'default' : 'outline'}
                    onClick={() => setEncodeType('html')}
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    HTML
                  </Button>
                  <Button
                    variant={encodeType === 'url' ? 'default' : 'outline'}
                    onClick={() => setEncodeType('url')}
                    size="sm"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    URL
                  </Button>
                  <Button
                    variant={encodeType === 'attr' ? 'default' : 'outline'}
                    onClick={() => setEncodeType('attr')}
                    size="sm"
                  >
                    <Hash className="w-4 h-4 mr-2" />
                    Attr
                  </Button>
                  <Button
                    variant={encodeType === 'js' ? 'default' : 'outline'}
                    onClick={() => setEncodeType('js')}
                    size="sm"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    JS
                  </Button>
                </div>

                {/* Input */}
                <div>
                  <Label className="text-sm mb-2 block">
                    Input {mode === 'encode' ? '(Plain Text)' : '(Encoded Text)'}
                  </Label>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      mode === 'encode'
                        ? '<div class="hello">Hello & Welcome</div>'
                        : '&lt;div&gt;Hello &amp; Welcome&lt;/div&gt;'
                    }
                    className="font-mono text-sm h-48"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {input.length} characters
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {new TextEncoder().encode(input).length} bytes
                    </Badge>
                  </div>
                </div>

                {!autoProcess && (
                  <Button onClick={processText} className="w-full bg-gradient-to-r from-rose-500 to-fuchsia-500">
                    {mode === 'encode' ? 'Encode' : 'Decode'}
                  </Button>
                )}

                {/* Output */}
                <div>
                  <Label className="text-sm mb-2 block flex items-center justify-between">
                    <span>Output {mode === 'encode' ? '(Encoded)' : '(Decoded)'}</span>
                    {output && (
                      <Badge variant="outline">{output.length} chars</Badge>
                    )}
                  </Label>
                  <Textarea
                    value={output}
                    readOnly
                    placeholder="Output will appear here..."
                    className="font-mono text-sm h-48 bg-muted"
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => handleCopy(output)} variant="outline" disabled={!output}>
                    {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy
                  </Button>
                  <Button onClick={swapInputOutput} variant="outline" disabled={!output}>
                    <Eye className="w-4 h-4 mr-2" />
                    Swap
                  </Button>
                  <Button onClick={downloadOutput} variant="outline" disabled={!output}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {output && mode === 'decode' && encodeType === 'html' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    HTML Preview
                  </CardTitle>
                  <CardDescription>Visual rendering of decoded HTML</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="p-4 border rounded-lg bg-white dark:bg-gray-900 min-h-[100px]"
                    dangerouslySetInnerHTML={{ __html: output }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right - Entity Reference */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>HTML Entities</CardTitle>
                <CardDescription>Quick reference (35+ entities)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search entities..."
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredEntities.map((entity, idx) => (
                    <div
                      key={idx}
                      className="p-2 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => handleCopy(entity.entity)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl font-mono">{entity.char}</span>
                        <Badge variant="outline" className="text-xs">
                          Click to copy
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-mono text-primary">{entity.entity}</p>
                        <p className="text-xs font-mono text-muted-foreground">{entity.code}</p>
                        <p className="text-xs text-muted-foreground">{entity.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredEntities.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No entities found
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
