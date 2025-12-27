'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  GitCompare, Copy, Download, ArrowLeftRight, Eye,
  FileText, Check, Filter, List, AlignJustify
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import * as Diff from 'diff'

type ViewMode = 'unified' | 'split' | 'inline'

export default function DiffCheckerPage() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [copied, setCopied] = useState(false)

  // Options
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [contextLines, setContextLines] = useState('all')

  // Compute diff
  const diffResult = useMemo(() => {
    if (!text1 && !text2) return null

    let t1 = text1
    let t2 = text2

    if (ignoreWhitespace) {
      t1 = t1.replace(/\s+/g, ' ').trim()
      t2 = t2.replace(/\s+/g, ' ').trim()
    }

    if (ignoreCase) {
      t1 = t1.toLowerCase()
      t2 = t2.toLowerCase()
    }

    // Line-by-line diff
    const changes = Diff.diffLines(t1, t2)

    // Character-level diff for better granularity
    const charChanges = Diff.diffChars(t1, t2)

    // Word diff
    const wordChanges = Diff.diffWords(t1, t2)

    // Statistics
    let added = 0
    let removed = 0
    let unchanged = 0

    changes.forEach(part => {
      const count = part.value.split('\n').filter(l => l.length > 0).length
      if (part.added) added += count
      else if (part.removed) removed += count
      else unchanged += count
    })

    return {
      changes,
      charChanges,
      wordChanges,
      stats: {
        added,
        removed,
        unchanged,
        total: added + removed + unchanged,
        similarity: unchanged / (added + removed + unchanged) * 100
      }
    }
  }, [text1, text2, ignoreWhitespace, ignoreCase])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadDiff = () => {
    if (!diffResult) return

    let output = '=== DIFF OUTPUT ===\n\n'
    output += `Statistics:\n`
    output += `- Lines added: ${diffResult.stats.added}\n`
    output += `- Lines removed: ${diffResult.stats.removed}\n`
    output += `- Lines unchanged: ${diffResult.stats.unchanged}\n`
    output += `- Similarity: ${diffResult.stats.similarity.toFixed(2)}%\n\n`
    output += '=== CHANGES ===\n\n'

    diffResult.changes.forEach(part => {
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  '
      part.value.split('\n').forEach(line => {
        if (line) output += prefix + line + '\n'
      })
    })

    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diff_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const swapTexts = () => {
    const temp = text1
    setText1(text2)
    setText2(temp)
    toast.success('Texts swapped!')
  }

  const clearAll = () => {
    setText1('')
    setText2('')
    toast.success('Cleared!')
  }

  const renderUnifiedView = () => {
    if (!diffResult) return null

    let lineNumber = 0
    return (
      <div className="space-y-1 max-h-[600px] overflow-y-auto font-mono text-sm border rounded-lg">
        {diffResult.changes.map((part, partIdx) => {
          const lines = part.value.split('\n').filter(l => l.length > 0)
          return lines.map((line, lineIdx) => {
            lineNumber++
            const bgColor = part.added
              ? 'bg-green-50 dark:bg-green-950 border-l-4 border-green-500'
              : part.removed
                ? 'bg-red-50 dark:bg-red-950 border-l-4 border-red-500'
                : 'bg-muted/30'

            const prefix = part.added ? '+ ' : part.removed ? '- ' : '  '

            return (
              <div key={`${partIdx}-${lineIdx}`} className={`p-2 ${bgColor} flex`}>
                {showLineNumbers && (
                  <span className="text-muted-foreground mr-4 w-12 text-right select-none">
                    {lineNumber}
                  </span>
                )}
                <span className="font-bold mr-2 text-muted-foreground">{prefix}</span>
                <span className="flex-1">{line}</span>
              </div>
            )
          })
        })}
      </div>
    )
  }

  const renderSplitView = () => {
    if (!diffResult) return null

    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    const maxLines = Math.max(lines1.length, lines2.length)

    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Original */}
        <div className="border rounded-lg">
          <div className="bg-muted p-2 border-b font-semibold text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Original
            <Badge variant="outline" className="ml-auto">{lines1.length} lines</Badge>
          </div>
          <div className="max-h-[600px] overflow-y-auto font-mono text-sm">
            {lines1.map((line, idx) => (
              <div key={idx} className="p-2 border-b flex hover:bg-muted/50">
                {showLineNumbers && (
                  <span className="text-muted-foreground mr-4 w-12 text-right select-none">
                    {idx + 1}
                  </span>
                )}
                <span className="flex-1">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modified */}
        <div className="border rounded-lg">
          <div className="bg-muted p-2 border-b font-semibold text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Modified
            <Badge variant="outline" className="ml-auto">{lines2.length} lines</Badge>
          </div>
          <div className="max-h-[600px] overflow-y-auto font-mono text-sm">
            {lines2.map((line, idx) => (
              <div key={idx} className="p-2 border-b flex hover:bg-muted/50">
                {showLineNumbers && (
                  <span className="text-muted-foreground mr-4 w-12 text-right select-none">
                    {idx + 1}
                  </span>
                )}
                <span className="flex-1">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderInlineView = () => {
    if (!diffResult) return null

    return (
      <div className="border rounded-lg p-4 space-y-2 max-h-[600px] overflow-y-auto">
        <p className="text-sm font-mono">
          {diffResult.charChanges.map((part, idx) => {
            const className = part.added
              ? 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100'
              : part.removed
                ? 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 line-through'
                : ''

            return (
              <span key={idx} className={className}>
                {part.value}
              </span>
            )
          })}
        </p>
      </div>
    )
  }

  const renderDiffView = () => {
    switch (viewMode) {
      case 'unified':
        return renderUnifiedView()
      case 'split':
        return renderSplitView()
      case 'inline':
        return renderInlineView()
      default:
        return null
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-lg">
              <GitCompare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Diff Checker
              </h1>
              <p className="text-muted-foreground mt-1">
                Compare texts • 3 view modes • Character-level diff
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={swapTexts} variant="outline" size="sm">
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Swap
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm">
              Clear
            </Button>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Original Text</CardTitle>
              <CardDescription>Enter the first text to compare</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                placeholder="Paste or type original text here..."
                className="font-mono h-64"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {text1.split('\n').length} lines • {text1.length} characters
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modified Text</CardTitle>
              <CardDescription>Enter the second text to compare</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                placeholder="Paste or type modified text here..."
                className="font-mono h-64"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {text2.split('\n').length} lines • {text2.length} characters
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Comparison Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="whitespace" className="cursor-pointer">Ignore Whitespace</Label>
                <Switch
                  id="whitespace"
                  checked={ignoreWhitespace}
                  onCheckedChange={setIgnoreWhitespace}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="case" className="cursor-pointer">Ignore Case</Label>
                <Switch
                  id="case"
                  checked={ignoreCase}
                  onCheckedChange={setIgnoreCase}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="numbers" className="cursor-pointer">Line Numbers</Label>
                <Switch
                  id="numbers"
                  checked={showLineNumbers}
                  onCheckedChange={setShowLineNumbers}
                />
              </div>
              <div>
                <Label className="text-xs mb-2 block">View Mode</Label>
                <Select value={viewMode} onValueChange={(v: ViewMode) => setViewMode(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">
                      <div className="flex items-center gap-2">
                        <AlignJustify className="w-4 h-4" />
                        Split View
                      </div>
                    </SelectItem>
                    <SelectItem value="unified">
                      <div className="flex items-center gap-2">
                        <List className="w-4 h-4" />
                        Unified View
                      </div>
                    </SelectItem>
                    <SelectItem value="inline">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Inline View
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {diffResult && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-xs text-green-700 dark:text-green-400">Lines Added</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                    +{diffResult.stats.added}
                  </div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-xs text-red-700 dark:text-red-400">Lines Removed</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-300">
                    -{diffResult.stats.removed}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg border">
                  <div className="text-xs text-muted-foreground">Unchanged</div>
                  <div className="text-2xl font-bold">{diffResult.stats.unchanged}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg border">
                  <div className="text-xs text-muted-foreground">Total Lines</div>
                  <div className="text-2xl font-bold">{diffResult.stats.total}</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-blue-700 dark:text-blue-400">Similarity</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {diffResult.stats.similarity.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diff Result */}
        {diffResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comparison Result</CardTitle>
                  <CardDescription>
                    {viewMode === 'split' && 'Side-by-side comparison'}
                    {viewMode === 'unified' && 'Unified diff view'}
                    {viewMode === 'inline' && 'Inline character-level diff'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(diffResult.changes.map(p => p.value).join(''))}
                    variant="outline"
                    size="sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button onClick={downloadDiff} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderDiffView()}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!diffResult && (
          <Card>
            <CardContent className="p-12 text-center">
              <GitCompare className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">Enter text in both fields to compare</p>
              <p className="text-sm text-muted-foreground">
                The diff will appear here automatically
              </p>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        {diffResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 dark:bg-green-900 border-2 border-green-500 rounded"></div>
                  <span><strong className="text-green-600 dark:text-green-400">+ Added</strong> - New lines in modified text</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 dark:bg-red-900 border-2 border-red-500 rounded"></div>
                  <span><strong className="text-red-600 dark:text-red-400">- Removed</strong> - Deleted lines from original</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted border-2 border-border rounded"></div>
                  <span><strong>Unchanged</strong> - Lines that remained the same</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
