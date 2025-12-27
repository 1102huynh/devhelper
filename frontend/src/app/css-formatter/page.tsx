'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Palette, Copy, Check, Download, Upload,
    Maximize2, Minimize2, Code, Wand2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import toast from 'react-hot-toast'

export default function CssFormatterPage() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [copied, setCopied] = useState(false)
    const [indentSize, setIndentSize] = useState(2)
    const [autoFormat, setAutoFormat] = useState(true)
    const [stats, setStats] = useState({
        rules: 0,
        selectors: 0,
        properties: 0,
        originalSize: 0,
        formattedSize: 0,
        minifiedSize: 0,
        compression: 0
    })

    useEffect(() => {
        if (autoFormat && input) {
            formatCSS()
        }
    }, [input, autoFormat, indentSize])

    const formatCSS = () => {
        if (!input.trim()) {
            toast.error('Enter CSS to format')
            return
        }

        try {
            // Remove comments
            let css = input.replace(/\/\*[\s\S]*?\*\//g, '')

            // Format CSS
            const indent = ' '.repeat(indentSize)
            let formatted = ''
            let level = 0
            let inSelector = false
            let buffer = ''

            for (let i = 0; i < css.length; i++) {
                const char = css[i]
                const nextChar = css[i + 1]

                if (char === '{') {
                    formatted += buffer.trim() + ' {\n'
                    level++
                    inSelector = false
                    buffer = ''
                } else if (char === '}') {
                    if (buffer.trim()) {
                        formatted += indent.repeat(level) + buffer.trim() + '\n'
                    }
                    level--
                    formatted += indent.repeat(level) + '}\n'
                    if (nextChar && nextChar !== '}') {
                        formatted += '\n'
                    }
                    buffer = ''
                } else if (char === ';') {
                    formatted += indent.repeat(level) + buffer.trim() + ';\n'
                    buffer = ''
                } else if (char === '\n' || char === '\r') {
                    continue
                } else {
                    buffer += char
                }
            }

            setOutput(formatted.trim())
            calculateStats(input, formatted)

            if (!autoFormat) {
                toast.success('CSS formatted!')
            }
        } catch (error) {
            toast.error('Failed to format CSS')
        }
    }

    const minifyCSS = () => {
        if (!input.trim()) {
            toast.error('Enter CSS to minify')
            return
        }

        try {
            let css = input

            // Remove comments
            css = css.replace(/\/\*[\s\S]*?\*\//g, '')

            // Remove unnecessary whitespace
            css = css.replace(/\s+/g, ' ')
            css = css.replace(/\s*{\s*/g, '{')
            css = css.replace(/\s*}\s*/g, '}')
            css = css.replace(/\s*;\s*/g, ';')
            css = css.replace(/\s*:\s*/g, ':')
            css = css.replace(/\s*,\s*/g, ',')

            // Remove last semicolon in blocks
            css = css.replace(/;}/g, '}')

            // Trim
            css = css.trim()

            setOutput(css)
            calculateStats(input, css)
            toast.success('CSS minified!')
        } catch (error) {
            toast.error('Failed to minify CSS')
        }
    }

    const beautifyCSS = () => {
        formatCSS()
    }

    const calculateStats = (original: string, processed: string) => {
        // Count rules
        const rules = (original.match(/{/g) || []).length

        // Count selectors (rough estimate)
        const selectors = (original.match(/[^{}]+(?={)/g) || []).length

        // Count properties
        const properties = (original.match(/:/g) || []).length

        // Size calculations
        const originalSize = new TextEncoder().encode(original).length
        const formattedSize = new TextEncoder().encode(processed).length

        // Minified size
        let minified = original.replace(/\/\*[\s\S]*?\*\//g, '')
        minified = minified.replace(/\s+/g, ' ').replace(/\s*{\s*/g, '{').replace(/\s*}\s*/g, '}')
        minified = minified.replace(/\s*;\s*/g, ';').replace(/\s*:\s*/g, ':').replace(/;}/g, '}').trim()
        const minifiedSize = new TextEncoder().encode(minified).length

        const compression = ((1 - minifiedSize / originalSize) * 100).toFixed(1)

        setStats({
            rules,
            selectors,
            properties,
            originalSize,
            formattedSize,
            minifiedSize,
            compression: parseFloat(compression)
        })
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.name.endsWith('.css')) {
            toast.error('Please upload a CSS file')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const content = event.target?.result as string
            setInput(content)
            toast.success(`Loaded ${file.name}`)
        }
        reader.readAsText(file)
    }

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadOutput = (type: 'formatted' | 'minified') => {
        const blob = new Blob([output], { type: 'text/css' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `styles_${type}_${Date.now()}.css`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Downloaded!')
    }

    const prefixCSS = () => {
        if (!input.trim()) {
            toast.error('Enter CSS to add prefixes')
            return
        }

        const prefixes = ['-webkit-', '-moz-', '-ms-', '-o-']
        const propertiesToPrefix = [
            'transform', 'transition', 'animation', 'border-radius',
            'box-shadow', 'box-sizing', 'user-select', 'appearance',
            'flex', 'flex-direction', 'flex-wrap', 'justify-content',
            'align-items', 'align-content'
        ]

        let result = input

        propertiesToPrefix.forEach(prop => {
            const regex = new RegExp(`(\\s+)(${prop})(\\s*:)`, 'g')
            result = result.replace(regex, (match, space, property, colon) => {
                const prefixed = prefixes.map(prefix =>
                    `${space}${prefix}${property}${colon}`
                ).join('\n')
                return `${prefixed}\n${space}${property}${colon}`
            })
        })

        setOutput(result)
        toast.success('Vendor prefixes added!')
    }

    const sampleCSS = `/* Sample CSS */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}`

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
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
                    <div className="p-3 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-xl shadow-lg">
                        <Palette className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                            CSS Formatter & Minifier
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Format • Minify • Beautify • Auto-prefix • Statistics
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left - Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>CSS Formatter</CardTitle>
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
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Button onClick={() => setInput(sampleCSS)} variant="outline" size="sm">
                                        <Code className="w-4 h-4 mr-2" />
                                        Load Sample
                                    </Button>
                                    <Button onClick={() => document.getElementById('file-upload')?.click()} variant="outline" size="sm">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload .css
                                    </Button>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".css"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-sm">Input CSS</Label>
                                        {input && (
                                            <Badge variant="outline" className="text-xs">
                                                {input.length} chars
                                            </Badge>
                                        )}
                                    </div>
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder=".class { property: value; }"
                                        className="font-mono text-sm h-64"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm">Indent Size: {indentSize} spaces</Label>
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
                                    <Button onClick={formatCSS} className="bg-gradient-to-r from-pink-500 to-red-500">
                                        <Maximize2 className="w-4 h-4 mr-2" />
                                        Format
                                    </Button>
                                    <Button onClick={minifyCSS} variant="outline">
                                        <Minimize2 className="w-4 h-4 mr-2" />
                                        Minify
                                    </Button>
                                    <Button onClick={beautifyCSS} variant="outline">
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Beautify
                                    </Button>
                                    <Button onClick={prefixCSS} variant="outline">
                                        <Code className="w-4 h-4 mr-2" />
                                        Auto-prefix
                                    </Button>
                                </div>

                                <Tabs defaultValue="output">
                                    <TabsList className="grid grid-cols-2 w-full">
                                        <TabsTrigger value="output">Formatted CSS</TabsTrigger>
                                        <TabsTrigger value="preview">Color Preview</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="output" className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="text-sm">Output</Label>
                                                {output && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {output.length} chars
                                                    </Badge>
                                                )}
                                            </div>
                                            <Textarea
                                                value={output}
                                                readOnly
                                                placeholder="Formatted CSS will appear here..."
                                                className="font-mono text-sm h-64 bg-muted"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Button onClick={() => handleCopy(output)} variant="outline" disabled={!output}>
                                                {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                                                Copy
                                            </Button>
                                            <Button onClick={() => downloadOutput('formatted')} variant="outline" disabled={!output}>
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="preview" className="space-y-4">
                                        <div className="p-4 border rounded-lg bg-muted min-h-[200px]">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Color values found in your CSS:
                                            </p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {(() => {
                                                    const hexColors = input.match(/#[0-9a-fA-F]{3,6}/g) || []
                                                    const rgbColors = input.match(/rgb\([^)]+\)/g) || []
                                                    const allColors = [...new Set([...hexColors, ...rgbColors])]

                                                    if (allColors.length === 0) {
                                                        return <p className="text-sm text-muted-foreground col-span-4">No colors found</p>
                                                    }

                                                    return allColors.map((color, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                                                            <div
                                                                className="w-8 h-8 rounded border"
                                                                style={{ backgroundColor: color }}
                                                            />
                                                            <code className="text-xs">{color}</code>
                                                        </div>
                                                    ))
                                                })()}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right - Stats & Guide */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>CSS Statistics</CardTitle>
                                <CardDescription>Document analysis</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span className="text-sm text-muted-foreground">Rules</span>
                                    <span className="font-bold">{stats.rules}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span className="text-sm text-muted-foreground">Selectors</span>
                                    <span className="font-bold">{stats.selectors}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span className="text-sm text-muted-foreground">Properties</span>
                                    <span className="font-bold">{stats.properties}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span className="text-sm text-muted-foreground">Original Size</span>
                                    <span className="font-bold">{formatFileSize(stats.originalSize)}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span className="text-sm text-muted-foreground">Minified Size</span>
                                    <span className="font-bold">{formatFileSize(stats.minifiedSize)}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-green-100 dark:bg-green-950 rounded">
                                    <span className="text-sm text-green-800 dark:text-green-200">Compression</span>
                                    <span className="font-bold text-green-800 dark:text-green-200">
                                        {stats.compression}%
                                    </span>
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
                                    <span>Format & beautify CSS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>Minify CSS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>Auto-prefix vendors</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>Color preview</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>Statistics & analysis</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>Adjustable indentation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>Auto-format mode</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-2 text-muted-foreground">
                                <p>• <strong>Format</strong> - Beautify with proper indentation</p>
                                <p>• <strong>Minify</strong> - Compress for production</p>
                                <p>• <strong>Auto-prefix</strong> - Add vendor prefixes</p>
                                <p>• <strong>Color Preview</strong> - See all colors used</p>
                                <p>• Use minified CSS in production to reduce file size</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
