'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  FileCode, Copy, Check, Download, AlertCircle,
  CheckCircle2, Minimize2, Maximize2, RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import toast from 'react-hot-toast'

interface XMLError {
  line: number
  column: number
  message: string
}

interface XMLStats {
  elements: number
  attributes: number
  textNodes: number
  depth: number
  size: number
}

export default function XmlFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [indentSize, setIndentSize] = useState(2)
  const [autoFormat, setAutoFormat] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<XMLError[]>([])
  const [stats, setStats] = useState<XMLStats | null>(null)

  // Auto-format
  useEffect(() => {
    if (autoFormat && input) {
      formatXML()
    }
  }, [input, autoFormat, indentSize])

  const formatXML = () => {
    if (!input.trim()) {
      toast.error('Enter XML to format')
      return
    }

    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(input, 'text/xml')

      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        setIsValid(false)
        setErrors([{
          line: 1,
          column: 1,
          message: parseError.textContent || 'Parse error'
        }])
        toast.error('Invalid XML')
        return
      }

      // Format XML
      const formatted = formatXMLNode(xmlDoc.documentElement, 0)
      setOutput(formatted)
      setIsValid(true)
      setErrors([])

      // Calculate statistics
      calculateStats(xmlDoc)

      if (!autoFormat) {
        toast.success('XML formatted!')
      }
    } catch (error) {
      setIsValid(false)
      setErrors([{
        line: 1,
        column: 1,
        message: error instanceof Error ? error.message : 'Invalid XML'
      }])
      toast.error('Failed to format XML')
    }
  }

  const formatXMLNode = (node: Node, level: number): string => {
    const indent = ' '.repeat(indentSize * level)
    const nextIndent = ' '.repeat(indentSize * (level + 1))

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      return text ? text : ''
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      let result = `${indent}<${element.tagName}`

      // Add attributes
      Array.from(element.attributes).forEach(attr => {
        result += ` ${attr.name}="${attr.value}"`
      })

      // Handle children
      const children = Array.from(element.childNodes)
      const hasElementChildren = children.some(child => child.nodeType === Node.ELEMENT_NODE)
      const textContent = element.textContent?.trim()

      if (children.length === 0) {
        result += ' />'
      } else if (!hasElementChildren && textContent) {
        result += `>${textContent}</${element.tagName}>`
      } else {
        result += '>\n'
        children.forEach(child => {
          const formatted = formatXMLNode(child, level + 1)
          if (formatted) {
            result += formatted + '\n'
          }
        })
        result += `${indent}</${element.tagName}>`
      }

      return result
    }

    return ''
  }

  const minifyXML = () => {
    if (!input.trim()) {
      toast.error('Enter XML to minify')
      return
    }

    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(input, 'text/xml')

      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        toast.error('Invalid XML')
        return
      }

      const minified = minifyXMLNode(xmlDoc.documentElement)
      setOutput(minified)
      setIsValid(true)
      toast.success('XML minified!')
    } catch (error) {
      toast.error('Failed to minify XML')
    }
  }

  const minifyXMLNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent?.trim() || ''
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      let result = `<${element.tagName}`

      Array.from(element.attributes).forEach(attr => {
        result += ` ${attr.name}="${attr.value}"`
      })

      const children = Array.from(element.childNodes)
      if (children.length === 0) {
        result += '/>'
      } else {
        result += '>'
        children.forEach(child => {
          result += minifyXMLNode(child)
        })
        result += `</${element.tagName}>`
      }

      return result
    }

    return ''
  }

  const xmlToJSON = () => {
    if (!input.trim()) {
      toast.error('Enter XML to convert')
      return
    }

    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(input, 'text/xml')

      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        toast.error('Invalid XML')
        return
      }

      const json = xmlNodeToJSON(xmlDoc.documentElement)
      setJsonOutput(JSON.stringify(json, null, 2))
      setIsValid(true)
      toast.success('Converted to JSON!')
    } catch (error) {
      toast.error('Failed to convert to JSON')
    }
  }

  const xmlNodeToJSON = (node: Element): any => {
    const obj: any = {}

    // Add attributes
    if (node.attributes.length > 0) {
      obj['@attributes'] = {}
      Array.from(node.attributes).forEach(attr => {
        obj['@attributes'][attr.name] = attr.value
      })
    }

    // Process children
    const children = Array.from(node.childNodes)
    const textContent = node.textContent?.trim()

    if (children.length === 0 || (children.length === 1 && children[0].nodeType === Node.TEXT_NODE)) {
      if (textContent) {
        if (Object.keys(obj).length === 0) {
          return textContent
        }
        obj['#text'] = textContent
      }
    } else {
      children.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const childElement = child as Element
          const childName = childElement.tagName
          const childValue = xmlNodeToJSON(childElement)

          if (obj[childName]) {
            if (Array.isArray(obj[childName])) {
              obj[childName].push(childValue)
            } else {
              obj[childName] = [obj[childName], childValue]
            }
          } else {
            obj[childName] = childValue
          }
        }
      })
    }

    return obj
  }

  const calculateStats = (xmlDoc: Document) => {
    let elements = 0
    let attributes = 0
    let textNodes = 0
    let maxDepth = 0

    const traverse = (node: Node, depth: number) => {
      maxDepth = Math.max(maxDepth, depth)

      if (node.nodeType === Node.ELEMENT_NODE) {
        elements++
        const element = node as Element
        attributes += element.attributes.length

        Array.from(node.childNodes).forEach(child => {
          if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            textNodes++
          }
          traverse(child, depth + 1)
        })
      }
    }

    traverse(xmlDoc.documentElement, 0)

    setStats({
      elements,
      attributes,
      textNodes,
      depth: maxDepth,
      size: input.length
    })
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted_${Date.now()}.xml`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const downloadJSON = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('JSON downloaded!')
  }

  const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="children">
    <title lang="en">Harry Potter</title>
    <author>J K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
</bookstore>`

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 rounded-xl shadow-lg">
            <FileCode className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Advanced XML Formatter
            </h1>
            <p className="text-muted-foreground mt-1">
              Format • Minify • Validate • XML to JSON • Statistics
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
                    <CardTitle>XML Formatter</CardTitle>
                    <CardDescription>
                      {autoFormat ? 'Auto-formats as you type' : 'Click button to format'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={autoFormat}
                        onCheckedChange={setAutoFormat}
                        id="auto"
                      />
                      <Label htmlFor="auto" className="text-xs cursor-pointer">Auto</Label>
                    </div>
                    {isValid !== null && (
                      <Badge variant={isValid ? 'default' : 'destructive'}>
                        {isValid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Valid
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Invalid
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">Input XML</Label>
                    <Button onClick={() => setInput(sampleXML)} variant="ghost" size="sm">
                      Load Sample
                    </Button>
                  </div>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="<root><element>value</element></root>"
                    className="font-mono text-sm h-64"
                  />
                  {input && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{input.length} chars</Badge>
                      <Badge variant="outline" className="text-xs">{new TextEncoder().encode(input).length} bytes</Badge>
                    </div>
                  )}
                </div>

                {/* Indent Size Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Indent Size: {indentSize} spaces</Label>
                  </div>
                  <Slider
                    value={[indentSize]}
                    onValueChange={(v) => setIndentSize(v[0])}
                    min={2}
                    max={8}
                    step={2}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={formatXML} className="bg-gradient-to-r from-red-500 to-rose-500">
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Format
                  </Button>
                  <Button onClick={minifyXML} variant="outline">
                    <Minimize2 className="w-4 h-4 mr-2" />
                    Minify
                  </Button>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-900 dark:text-red-100 font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Validation Errors:
                    </p>
                    {errors.map((error, idx) => (
                      <p key={idx} className="text-xs text-red-800 dark:text-red-200">
                        Line {error.line}, Column {error.column}: {error.message}
                      </p>
                    ))}
                  </div>
                )}

                <Tabs defaultValue="xml" className="space-y-4">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="xml">Formatted XML</TabsTrigger>
                    <TabsTrigger value="json" onClick={xmlToJSON}>XML to JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="xml" className="space-y-4">
                    <div>
                      <Label className="text-sm mb-2 block flex items-center justify-between">
                        <span>Output</span>
                        {output && <Badge variant="outline" className="text-xs">{output.length} chars</Badge>}
                      </Label>
                      <Textarea
                        value={output}
                        readOnly
                        placeholder="Formatted XML will appear here..."
                        className="font-mono text-sm h-64 bg-muted"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => handleCopy(output)} variant="outline" disabled={!output}>
                        {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copy
                      </Button>
                      <Button onClick={downloadOutput} variant="outline" disabled={!output}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="json" className="space-y-4">
                    <div>
                      <Label className="text-sm mb-2 block flex items-center justify-between">
                        <span>JSON Output</span>
                        {jsonOutput && <Badge variant="outline" className="text-xs">{jsonOutput.length} chars</Badge>}
                      </Label>
                      <Textarea
                        value={jsonOutput}
                        readOnly
                        placeholder="JSON will appear here..."
                        className="font-mono text-sm h-64 bg-muted"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => handleCopy(jsonOutput)} variant="outline" disabled={!jsonOutput}>
                        {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copy
                      </Button>
                      <Button onClick={downloadJSON} variant="outline" disabled={!jsonOutput}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right - Stats & Info */}
          <div className="space-y-6">
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>XML Statistics</CardTitle>
                  <CardDescription>Document analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Elements</span>
                    <span className="font-bold">{stats.elements}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Attributes</span>
                    <span className="font-bold">{stats.attributes}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Text Nodes</span>
                    <span className="font-bold">{stats.textNodes}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Max Depth</span>
                    <span className="font-bold">{stats.depth}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Size</span>
                    <span className="font-bold">{stats.size} bytes</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Format & beautify XML</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Minify XML</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>XML validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>XML to JSON conversion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Statistics & analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Auto-format mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Adjustable indentation</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About XML</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>
                  XML (eXtensible Markup Language) is a markup language for storing and transporting data.
                </p>
                <div>
                  <p className="font-semibold text-foreground mb-1">Common Uses:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Configuration files</li>
                    <li>Data exchange (APIs)</li>
                    <li>Document storage</li>
                    <li>Web services (SOAP)</li>
                    <li>RSS/Atom feeds</li>
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
