'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Type, Copy, Check, FileText, Download, Sparkles, Hash,
  AlignLeft, ArrowUpDown, Code, Filter, Binary, Shuffle,
  WrapText, Calculator, Search, Repeat
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

export default function TextUtilsPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeOperation, setActiveOperation] = useState<string | null>(null)

  // Find & Replace
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)

  // Encoding
  const [encodingType, setEncodingType] = useState('base64')

  // Statistics
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    lines: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
    speakingTime: 0,
    uniqueWords: 0
  })

  // Calculate stats whenever input changes
  useEffect(() => {
    const trimmed = input.trim()
    const chars = input.length
    const charsNoSpaces = input.replace(/\s/g, '').length
    const words = trimmed ? trimmed.split(/\s+/).filter(w => w.length > 0).length : 0
    const lines = input ? input.split('\n').length : 0
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0
    const paragraphs = trimmed ? trimmed.split(/\n\n+/).filter(p => p.trim().length > 0).length : 0
    const uniqueWords = new Set(trimmed.toLowerCase().split(/\s+/).filter(w => w.length > 0)).size

    setStats({
      characters: chars,
      charactersNoSpaces: charsNoSpaces,
      words,
      lines,
      sentences,
      paragraphs,
      readingTime: Math.ceil(words / 200), // avg 200 wpm
      speakingTime: Math.ceil(words / 150), // avg 150 wpm
      uniqueWords
    })
  }, [input])

  // Case Operations
  const toUpperCase = () => applyOperation(input.toUpperCase(), 'UPPERCASE')
  const toLowerCase = () => applyOperation(input.toLowerCase(), 'lowercase')
  const toTitleCase = () => applyOperation(
    input.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
    'Title Case'
  )
  const toSentenceCase = () => applyOperation(
    input.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase()),
    'Sentence case'
  )
  const toCamelCase = () => applyOperation(
    input.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    ).replace(/\s+/g, ''),
    'camelCase'
  )
  const toPascalCase = () => applyOperation(
    input.replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase()).replace(/\s+/g, ''),
    'PascalCase'
  )
  const toSnakeCase = () => applyOperation(
    input.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, ''),
    'snake_case'
  )
  const toKebabCase = () => applyOperation(
    input.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
    'kebab-case'
  )
  const toConstantCase = () => applyOperation(
    input.toUpperCase().replace(/\s+/g, '_').replace(/[^\w_]/g, ''),
    'CONSTANT_CASE'
  )
  const toDotCase = () => applyOperation(
    input.toLowerCase().replace(/\s+/g, '.').replace(/[^\w.]/g, ''),
    'dot.case'
  )

  // Text Transformations
  const reverseText = () => applyOperation(input.split('').reverse().join(''), 'Reversed')
  const reverseWords = () => applyOperation(input.split(' ').reverse().join(' '), 'Words Reversed')
  const reverseLines = () => applyOperation(input.split('\n').reverse().join('\n'), 'Lines Reversed')

  const sortLines = (order: 'asc' | 'desc' = 'asc') => {
    const lines = input.split('\n')
    const sorted = order === 'asc'
      ? lines.sort((a, b) => a.localeCompare(b))
      : lines.sort((a, b) => b.localeCompare(a))
    applyOperation(sorted.join('\n'), `Lines Sorted ${order === 'asc' ? '↑' : '↓'}`)
  }

  const shuffleLines = () => {
    const lines = input.split('\n')
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]]
    }
    applyOperation(lines.join('\n'), 'Lines Shuffled')
  }

  const removeDuplicateLines = () => {
    const lines = input.split('\n')
    const unique = [...new Set(lines)]
    applyOperation(unique.join('\n'), 'Duplicates Removed')
  }

  const removeEmptyLines = () => {
    const lines = input.split('\n').filter(line => line.trim().length > 0)
    applyOperation(lines.join('\n'), 'Empty Lines Removed')
  }

  // Whitespace Operations
  const trimWhitespace = () => applyOperation(
    input.split('\n').map(line => line.trim()).join('\n'),
    'Trimmed'
  )

  const removeAllWhitespace = () => applyOperation(
    input.replace(/\s+/g, ''),
    'All Whitespace Removed'
  )

  const normalizeWhitespace = () => applyOperation(
    input.replace(/\s+/g, ' ').trim(),
    'Whitespace Normalized'
  )

  const addLineNumbers = () => {
    const lines = input.split('\n')
    const numbered = lines.map((line, idx) => `${idx + 1}. ${line}`)
    applyOperation(numbered.join('\n'), 'Line Numbers Added')
  }

  // Encoding/Decoding
  const encodeBase64 = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)))
      applyOperation(encoded, 'Base64 Encoded')
    } catch (e) {
      toast.error('Failed to encode Base64')
    }
  }

  const decodeBase64 = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)))
      applyOperation(decoded, 'Base64 Decoded')
    } catch (e) {
      toast.error('Invalid Base64 string')
    }
  }

  const encodeURL = () => applyOperation(encodeURIComponent(input), 'URL Encoded')
  const decodeURL = () => {
    try {
      applyOperation(decodeURIComponent(input), 'URL Decoded')
    } catch (e) {
      toast.error('Invalid URL encoding')
    }
  }

  const encodeHTML = () => {
    const div = document.createElement('div')
    div.textContent = input
    applyOperation(div.innerHTML, 'HTML Encoded')
  }

  const decodeHTML = () => {
    const div = document.createElement('div')
    div.innerHTML = input
    applyOperation(div.textContent || '', 'HTML Decoded')
  }

  const toJSON = () => {
    try {
      applyOperation(JSON.stringify(input, null, 2), 'JSON String')
    } catch (e) {
      toast.error('Failed to convert to JSON')
    }
  }

  const fromJSON = () => {
    try {
      const parsed = JSON.parse(input)
      applyOperation(typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2), 'Parsed JSON')
    } catch (e) {
      toast.error('Invalid JSON')
    }
  }

  const toBinary = () => {
    const binary = input.split('').map(char =>
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join(' ')
    applyOperation(binary, 'Binary')
  }

  const fromBinary = () => {
    try {
      const text = input.split(/\s+/).map(bin =>
        String.fromCharCode(parseInt(bin, 2))
      ).join('')
      applyOperation(text, 'From Binary')
    } catch (e) {
      toast.error('Invalid binary')
    }
  }

  const toHex = () => {
    const hex = input.split('').map(char =>
      char.charCodeAt(0).toString(16).padStart(2, '0')
    ).join(' ')
    applyOperation(hex, 'Hexadecimal')
  }

  const fromHex = () => {
    try {
      const text = input.split(/\s+/).map(hex =>
        String.fromCharCode(parseInt(hex, 16))
      ).join('')
      applyOperation(text, 'From Hex')
    } catch (e) {
      toast.error('Invalid hex')
    }
  }

  // Text Analysis
  const extractEmails = () => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = input.match(emailRegex) || []
    applyOperation(emails.join('\n'), 'Emails Extracted')
  }

  const extractURLs = () => {
    const urlRegex = /https?:\/\/[^\s]+/g
    const urls = input.match(urlRegex) || []
    applyOperation(urls.join('\n'), 'URLs Extracted')
  }

  const extractNumbers = () => {
    const numbers = input.match(/\d+\.?\d*/g) || []
    applyOperation(numbers.join('\n'), 'Numbers Extracted')
  }

  // Find & Replace
  const findAndReplace = () => {
    if (!findText) {
      toast.error('Enter text to find')
      return
    }
    const flags = caseSensitive ? 'g' : 'gi'
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
    const count = (input.match(regex) || []).length
    const replaced = input.replace(regex, replaceText)
    applyOperation(replaced, `Replaced ${count} occurrence(s)`)
  }

  // Formatting
  const addPrefix = (prefix: string) => {
    const lines = input.split('\n').map(line => prefix + line)
    applyOperation(lines.join('\n'), 'Prefix Added')
  }

  const addSuffix = (suffix: string) => {
    const lines = input.split('\n').map(line => line + suffix)
    applyOperation(lines.join('\n'), 'Suffix Added')
  }

  const wrapLines = (width: number) => {
    const words = input.split(/\s+/)
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
      if ((currentLine + word).length > width && currentLine.length > 0) {
        lines.push(currentLine.trim())
        currentLine = word + ' '
      } else {
        currentLine += word + ' '
      }
    })
    if (currentLine.trim()) lines.push(currentLine.trim())

    applyOperation(lines.join('\n'), `Wrapped at ${width} chars`)
  }

  // Helper
  const applyOperation = (result: string, operation: string) => {
    setOutput(result)
    setActiveOperation(operation)
    toast.success(`Applied: ${operation}`)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `text_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const operations = [
    {
      category: 'Case', items: [
        { label: 'UPPERCASE', fn: toUpperCase, icon: Type },
        { label: 'lowercase', fn: toLowerCase, icon: Type },
        { label: 'Title Case', fn: toTitleCase, icon: Type },
        { label: 'Sentence case', fn: toSentenceCase, icon: Type },
        { label: 'camelCase', fn: toCamelCase, icon: Type },
        { label: 'PascalCase', fn: toPascalCase, icon: Type },
        { label: 'snake_case', fn: toSnakeCase, icon: Type },
        { label: 'kebab-case', fn: toKebabCase, icon: Type },
        { label: 'CONSTANT_CASE', fn: toConstantCase, icon: Type },
        { label: 'dot.case', fn: toDotCase, icon: Type },
      ]
    },
    {
      category: 'Transform', items: [
        { label: 'Reverse Text', fn: reverseText, icon: Repeat },
        { label: 'Reverse Words', fn: reverseWords, icon: Repeat },
        { label: 'Reverse Lines', fn: reverseLines, icon: Repeat },
        { label: 'Sort Lines ↑', fn: () => sortLines('asc'), icon: ArrowUpDown },
        { label: 'Sort Lines ↓', fn: () => sortLines('desc'), icon: ArrowUpDown },
        { label: 'Shuffle Lines', fn: shuffleLines, icon: Shuffle },
        { label: 'Remove Duplicates', fn: removeDuplicateLines, icon: Filter },
        { label: 'Remove Empty Lines', fn: removeEmptyLines, icon: Filter },
      ]
    },
    {
      category: 'Whitespace', items: [
        { label: 'Trim Lines', fn: trimWhitespace, icon: AlignLeft },
        { label: 'Remove All', fn: removeAllWhitespace, icon: AlignLeft },
        { label: 'Normalize', fn: normalizeWhitespace, icon: AlignLeft },
        { label: 'Add Line Numbers', fn: addLineNumbers, icon: Hash },
      ]
    },
    {
      category: 'Extract', items: [
        { label: 'Extract Emails', fn: extractEmails, icon: Search },
        { label: 'Extract URLs', fn: extractURLs, icon: Search },
        { label: 'Extract Numbers', fn: extractNumbers, icon: Search },
      ]
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Advanced Text Utilities
            </h1>
            <p className="text-muted-foreground mt-1">
              50+ text operations • Encoding • Analysis • Transformations
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Input */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>Enter or paste your text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or paste your text here..."
                className="h-96 font-mono text-sm"
              />

              {/* Stats Grid */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-xs text-muted-foreground">Characters</div>
                  <div className="font-bold">{stats.characters}</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-xs text-muted-foreground">No Spaces</div>
                  <div className="font-bold">{stats.charactersNoSpaces}</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-xs text-muted-foreground">Words</div>
                  <div className="font-bold">{stats.words}</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-xs text-muted-foreground">Lines</div>
                  <div className="font-bold">{stats.lines}</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-xs text-muted-foreground">Sentences</div>
                  <div className="font-bold">{stats.sentences}</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-xs text-muted-foreground">Paragraphs</div>
                  <div className="font-bold">{stats.paragraphs}</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-xs text-muted-foreground">Unique Words</div>
                  <div className="font-bold">{stats.uniqueWords}</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-xs text-muted-foreground">Read Time</div>
                  <div className="font-bold">{stats.readingTime}m</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-xs text-muted-foreground">Speak Time</div>
                  <div className="font-bold">{stats.speakingTime}m</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="case">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="case">Case</TabsTrigger>
                  <TabsTrigger value="transform">Transform</TabsTrigger>
                  <TabsTrigger value="encode">Encode</TabsTrigger>
                  <TabsTrigger value="more">More</TabsTrigger>
                </TabsList>

                <TabsContent value="case" className="space-y-2 max-h-96 overflow-y-auto">
                  {operations[0].items.map((op, idx) => {
                    const Icon = op.icon
                    return (
                      <Button
                        key={idx}
                        onClick={op.fn}
                        variant="outline"
                        className="w-full justify-start text-left"
                        size="sm"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {op.label}
                      </Button>
                    )
                  })}
                </TabsContent>

                <TabsContent value="transform" className="space-y-2 max-h-96 overflow-y-auto">
                  {operations[1].items.concat(operations[2].items).map((op, idx) => {
                    const Icon = op.icon
                    return (
                      <Button
                        key={idx}
                        onClick={op.fn}
                        variant="outline"
                        className="w-full justify-start text-left"
                        size="sm"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {op.label}
                      </Button>
                    )
                  })}
                </TabsContent>

                <TabsContent value="encode" className="space-y-2 max-h-96 overflow-y-auto">
                  <Button onClick={encodeBase64} variant="outline" className="w-full justify-start" size="sm">
                    <Code className="w-4 h-4 mr-2" />
                    Base64 Encode
                  </Button>
                  <Button onClick={decodeBase64} variant="outline" className="w-full justify-start" size="sm">
                    <Code className="w-4 h-4 mr-2" />
                    Base64 Decode
                  </Button>
                  <Button onClick={encodeURL} variant="outline" className="w-full justify-start" size="sm">
                    <Code className="w-4 h-4 mr-2" />
                    URL Encode
                  </Button>
                  <Button onClick={decodeURL} variant="outline" className="w-full justify-start" size="sm">
                    <Code className="w-4 h-4 mr-2" />
                    URL Decode
                  </Button>
                  <Button onClick={encodeHTML} variant="outline" className="w-full justify-start" size="sm">
                    <Code className="w-4 h-4 mr-2" />
                    HTML Encode
                  </Button>
                  <Button onClick={decodeHTML} variant="outline" className="w-full justify-start" size="sm">
                    <Code className="w-4 h-4 mr-2" />
                    HTML Decode
                  </Button>
                  <Button onClick={toJSON} variant="outline" className="w-full justify-start" size="sm">
                    <Code className="w-4 h-4 mr-2" />
                    To JSON String
                  </Button>
                  <Button onClick={fromJSON} variant="outline" className="w-full justify-start" size="sm">
                    <Code className="w-4 h-4 mr-2" />
                    Parse JSON
                  </Button>
                  <Button onClick={toBinary} variant="outline" className="w-full justify-start" size="sm">
                    <Binary className="w-4 h-4 mr-2" />
                    To Binary
                  </Button>
                  <Button onClick={fromBinary} variant="outline" className="w-full justify-start" size="sm">
                    <Binary className="w-4 h-4 mr-2" />
                    From Binary
                  </Button>
                  <Button onClick={toHex} variant="outline" className="w-full justify-start" size="sm">
                    <Hash className="w-4 h-4 mr-2" />
                    To Hexadecimal
                  </Button>
                  <Button onClick={fromHex} variant="outline" className="w-full justify-start" size="sm">
                    <Hash className="w-4 h-4 mr-2" />
                    From Hexadecimal
                  </Button>
                </TabsContent>

                <TabsContent value="more" className="space-y-2 max-h-96 overflow-y-auto">
                  {operations[3].items.map((op, idx) => {
                    const Icon = op.icon
                    return (
                      <Button
                        key={idx}
                        onClick={op.fn}
                        variant="outline"
                        className="w-full justify-start text-left"
                        size="sm"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {op.label}
                      </Button>
                    )
                  })}
                  <div className="pt-2 border-t">
                    <Label className="text-xs mb-2 block">Find & Replace</Label>
                    <div className="space-y-2">
                      <Input
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        placeholder="Find..."
                        className="text-sm"
                      />
                      <Input
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        placeholder="Replace with..."
                        className="text-sm"
                      />
                      <Button onClick={findAndReplace} variant="default" className="w-full" size="sm">
                        Replace All
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Output</CardTitle>
                  <CardDescription>
                    {activeOperation ? `Applied: ${activeOperation}` : 'Result will appear here'}
                  </CardDescription>
                </div>
                {activeOperation && (
                  <Badge variant="outline">{activeOperation}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={output}
                readOnly
                placeholder="Output will appear here..."
                className="h-96 font-mono text-sm"
              />

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button onClick={downloadFile} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setInput(output)} variant="outline" className="flex-1">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Use as Input
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
