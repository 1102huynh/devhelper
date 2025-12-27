'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    FileText, Copy, Check, Download, Upload,
    Eye, Code, Split, Maximize2, Palette, Book
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

export default function MarkdownPreviewPage() {
    const [markdown, setMarkdown] = useState('')
    const [copied, setCopied] = useState(false)
    const [theme, setTheme] = useState<'light' | 'dark' | 'github'>('github')
    const [livePreview, setLivePreview] = useState(true)
    const [showLineNumbers, setShowLineNumbers] = useState(false)
    const [splitView, setSplitView] = useState(true)

    // Simple markdown to HTML converter (basic version)
    const parseMarkdown = (md: string): string => {
        if (!md) return ''

        let html = md

        // Headers (h1-h6)
        html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
        html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
        html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
        html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
        html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
        html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')

        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
        html = html.replace(/_(.+?)_/g, '<em>$1</em>')

        // Strikethrough
        html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

        // Inline code
        html = html.replace(/`(.+?)`/g, '<code class="inline-code">$1</code>')

        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, (match, lang, code) => {
            return `<pre><code class="code-block${lang ? ` language-${lang}` : ''}">${code.trim()}</code></pre>`
        })

        // Links
        html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

        // Images
        html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')

        // Unordered lists
        html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>')
        html = html.replace(/^-\s+(.+)$/gm, '<li>$1</li>')
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

        // Ordered lists
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')

        // Blockquotes
        html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')

        // Horizontal rule
        html = html.replace(/^---$/gm, '<hr />')
        html = html.replace(/^\*\*\*$/gm, '<hr />')

        // Line breaks
        html = html.replace(/\n\n/g, '<br /><br />')
        html = html.replace(/\n/g, '<br />')

        return html
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
            toast.error('Please upload a Markdown file (.md or .markdown)')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const content = event.target?.result as string
            setMarkdown(content)
            toast.success(`Loaded ${file.name}`)
        }
        reader.readAsText(file)
    }

    const handleCopy = async (text: string, type: 'markdown' | 'html') => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(`${type === 'markdown' ? 'Markdown' : 'HTML'} copied to clipboard!`)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadMarkdown = () => {
        const blob = new Blob([markdown], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `document_${Date.now()}.md`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Markdown downloaded!')
    }

    const downloadHTML = () => {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
        code.inline-code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 6px; overflow-x: auto; }
        pre code { background: none; padding: 0; }
        a { color: #0969da; text-decoration: none; }
        a:hover { text-decoration: underline; }
        blockquote { border-left: 4px solid #d1d5db; padding-left: 16px; margin-left: 0; color: #6b7280; }
        img { max-width: 100%; height: auto; }
        ul, ol { padding-left: 24px; }
        hr { border: 0; border-top: 1px solid #d1d5db; margin: 24px 0; }
    </style>
</head>
<body>
${parseMarkdown(markdown)}
</body>
</html>`

        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `document_${Date.now()}.html`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('HTML downloaded!')
    }

    const sampleMarkdown = `# Welcome to Markdown Preview

This is a **bold** text and this is *italic*.

## Features

- Live preview
- Split view mode
- Multiple themes
- Export to HTML
- Syntax highlighting

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Links and Images

Check out [DevHelper](https://github.com) for more tools!

> This is a blockquote with some important information.

---

#### Lists

1. First item
2. Second item
3. Third item

#### Inline Code

Use \`npm install\` to install packages.

**That's it!** Happy writing 📝
`

    const getThemeStyles = () => {
        const themes = {
            light: {
                bg: 'bg-white',
                text: 'text-gray-900',
                border: 'border-gray-200'
            },
            dark: {
                bg: 'bg-gray-900',
                text: 'text-gray-100',
                border: 'border-gray-700'
            },
            github: {
                bg: 'bg-white',
                text: 'text-gray-900',
                border: 'border-gray-200'
            }
        }
        return themes[theme]
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
                    <div className="p-3 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl shadow-lg">
                        <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                            Markdown Preview
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Live preview • Split view • Export HTML • Multiple themes
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Left - Editor/Preview */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Markdown Editor & Preview</CardTitle>
                                        <CardDescription>
                                            {livePreview ? 'Live preview enabled' : 'Click preview button to update'}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={livePreview}
                                                onCheckedChange={setLivePreview}
                                                id="live"
                                            />
                                            <Label htmlFor="live" className="text-xs cursor-pointer">Live</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={splitView}
                                                onCheckedChange={setSplitView}
                                                id="split"
                                            />
                                            <Label htmlFor="split" className="text-xs cursor-pointer">Split</Label>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Button onClick={() => setMarkdown(sampleMarkdown)} variant="outline" size="sm">
                                        <Book className="w-4 h-4 mr-2" />
                                        Load Sample
                                    </Button>
                                    <Button onClick={() => document.getElementById('file-upload')?.click()} variant="outline" size="sm">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload .md
                                    </Button>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".md,.markdown"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <div className="flex-1" />
                                    <Select value={theme} onValueChange={(v: 'light' | 'dark' | 'github') => setTheme(v)}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                            <SelectItem value="github">GitHub</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className={`grid ${splitView ? 'md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                    {/* Editor */}
                                    {(splitView || !livePreview) && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="text-sm">Markdown</Label>
                                                {markdown && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {markdown.length} chars
                                                    </Badge>
                                                )}
                                            </div>
                                            <Textarea
                                                value={markdown}
                                                onChange={(e) => setMarkdown(e.target.value)}
                                                placeholder="# Start typing your markdown here..."
                                                className="font-mono text-sm h-[500px]"
                                            />
                                        </div>
                                    )}

                                    {/* Preview */}
                                    {(livePreview || !splitView) && (
                                        <div>
                                            <Label className="text-sm mb-2 block">Preview</Label>
                                            <div
                                                className={`border rounded-lg p-6 h-[500px] overflow-y-auto prose prose-sm max-w-none ${getThemeStyles().bg} ${getThemeStyles().text} ${getThemeStyles().border}`}
                                                dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
                                                style={{
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <Button onClick={() => handleCopy(markdown, 'markdown')} variant="outline" disabled={!markdown}>
                                        {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                                        Copy MD
                                    </Button>
                                    <Button onClick={() => handleCopy(parseMarkdown(markdown), 'html')} variant="outline" disabled={!markdown}>
                                        <Code className="w-4 h-4 mr-2" />
                                        Copy HTML
                                    </Button>
                                    <Button onClick={downloadMarkdown} variant="outline" disabled={!markdown}>
                                        <Download className="w-4 h-4 mr-2" />
                                        .md
                                    </Button>
                                    <Button onClick={downloadHTML} variant="outline" disabled={!markdown}>
                                        <Download className="w-4 h-4 mr-2" />
                                        .html
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right - Syntax Guide */}
                    <div>
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle>Markdown Syntax</CardTitle>
                                <CardDescription>Quick reference</CardDescription>
                            </CardHeader>
                            <CardContent className="text-xs space-y-3 max-h-[700px] overflow-y-auto">
                                <div>
                                    <p className="font-semibold mb-2">Headers:</p>
                                    <pre className="bg-muted p-2 rounded text-[10px]">
                                        {`# H1
## H2
### H3`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Emphasis:</p>
                                    <pre className="bg-muted p-2 rounded text-[10px]">
                                        {`**bold**
*italic*
~~strikethrough~~`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Lists:</p>
                                    <pre className="bg-muted p-2 rounded text-[10px]">
                                        {`- Item 1
- Item 2

1. First
2. Second`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Links & Images:</p>
                                    <pre className="bg-muted p-2 rounded text-[10px]">
                                        {`[Link](url)
![Image](url)`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Code:</p>
                                    <pre className="bg-muted p-2 rounded text-[10px]">
                                        {`\`inline code\`

\`\`\`javascript
code block
\`\`\``}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Blockquotes:</p>
                                    <pre className="bg-muted p-2 rounded text-[10px]">
                                        {`> Quote`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Horizontal Rule:</p>
                                    <pre className="bg-muted p-2 rounded text-[10px]">
                                        {`---
***`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Tables:</p>
                                    <pre className="bg-muted p-2 rounded text-[10px]">
                                        {`| Header |
|--------|
| Cell   |`}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
