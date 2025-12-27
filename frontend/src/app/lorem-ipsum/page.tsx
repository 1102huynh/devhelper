'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Copy, FileText, Check, Download, Sparkles, Type, Globe, Code } from 'lucide-react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

const loremData = {
  latin: {
    name: 'Latin (Classic)',
    words: [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'vitae', 'elementum',
      'semper', 'nec', 'tellus', 'posuere', 'ac', 'tincidunt', 'vitae', 'semper'
    ]
  },
  english: {
    name: 'English',
    words: [
      'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'hello', 'world',
      'technology', 'innovation', 'solution', 'business', 'strategy', 'development',
      'creative', 'design', 'modern', 'digital', 'professional', 'service', 'quality',
      'customer', 'experience', 'product', 'platform', 'system', 'network', 'cloud',
      'data', 'analytics', 'software', 'application', 'interface', 'user', 'management',
      'security', 'performance', 'optimization', 'integration', 'automation', 'workflow',
      'collaboration', 'communication', 'enterprise', 'advanced', 'intelligent', 'smart'
    ]
  },
  tech: {
    name: 'Tech Jargon',
    words: [
      'API', 'cloud', 'blockchain', 'algorithm', 'database', 'framework', 'deployment',
      'scalability', 'microservices', 'container', 'kubernetes', 'docker', 'DevOps',
      'agile', 'sprint', 'repository', 'commit', 'merge', 'branch', 'pipeline',
      'infrastructure', 'serverless', 'lambda', 'function', 'authentication', 'authorization',
      'encryption', 'token', 'session', 'cache', 'queue', 'webhook', 'endpoint',
      'payload', 'response', 'request', 'middleware', 'router', 'controller', 'model',
      'schema', 'migration', 'seed', 'query', 'transaction', 'index', 'optimization'
    ]
  },
  hipster: {
    name: 'Hipster',
    words: [
      'artisan', 'craft', 'organic', 'sustainable', 'vintage', 'retro', 'authentic',
      'handcrafted', 'locally-sourced', 'farm-to-table', 'small-batch', 'heritage',
      'bespoke', 'curated', 'minimalist', 'aesthetic', 'vibe', 'aesthetic', 'indie',
      'underground', 'alternative', 'experimental', 'eclectic', 'bohemian', 'rustic',
      'reclaimed', 'upcycled', 'artisanal', 'pour-over', 'cold-brew', 'fixie',
      'vinyl', 'analog', 'film', 'polaroid', 'typewriter', 'messenger bag', 'flannel'
    ]
  },
  corporate: {
    name: 'Corporate',
    words: [
      'synergy', 'leverage', 'paradigm', 'optimize', 'streamline', 'maximize', 'utilize',
      'strategize', 'monetize', 'deliverable', 'stakeholder', 'bandwidth', 'vertical',
      'horizontal', 'ecosystem', 'scalable', 'innovative', 'disruptive', 'actionable',
      'best-practice', 'benchmark', 'touch-base', 'circle-back', 'deep-dive', 'low-hanging',
      'fruit', 'win-win', 'game-changer', 'ROI', 'KPI', 'B2B', 'B2C', 'enterprise',
      'solution', 'value-add', 'core-competency', 'mission-critical', 'turnkey'
    ]
  }
}

export default function LoremIpsumPage() {
  const [paragraphs, setParagraphs] = useState(3)
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50)
  const [generated, setGenerated] = useState('')
  const [language, setLanguage] = useState('latin')
  const [startWithClassic, setStartWithClassic] = useState(true)
  const [includeHTML, setIncludeHTML] = useState(false)
  const [htmlTag, setHtmlTag] = useState('p')
  const [copied, setCopied] = useState(false)

  const generateLorem = () => {
    const words = loremData[language as keyof typeof loremData].words
    const result: string[] = []

    for (let i = 0; i < paragraphs; i++) {
      const paragraph: string[] = []

      // Start with "Lorem ipsum dolor sit amet" if enabled and first paragraph
      if (startWithClassic && i === 0 && language === 'latin') {
        paragraph.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit')
      }

      const remainingWords = wordsPerParagraph - paragraph.length
      for (let j = 0; j < remainingWords; j++) {
        const word = words[Math.floor(Math.random() * words.length)]
        paragraph.push(word)
      }

      // Capitalize first word
      if (paragraph.length > 0) {
        paragraph[0] = paragraph[0].charAt(0).toUpperCase() + paragraph[0].slice(1)
      }

      const text = paragraph.join(' ') + '.'

      if (includeHTML) {
        result.push(`<${htmlTag}>${text}</${htmlTag}>`)
      } else {
        result.push(text)
      }
    }

    setGenerated(result.join(includeHTML ? '\n' : '\n\n'))
  }

  const generateWords = (count: number) => {
    const words = loremData[language as keyof typeof loremData].words
    const result: string[] = []

    if (startWithClassic && language === 'latin') {
      result.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet')
    }

    const remainingWords = count - result.length
    for (let i = 0; i < remainingWords; i++) {
      result.push(words[Math.floor(Math.random() * words.length)])
    }

    result[0] = result[0].charAt(0).toUpperCase() + result[0].slice(1)
    setGenerated(result.join(' ') + '.')
  }

  const generateSentences = (count: number) => {
    const words = loremData[language as keyof typeof loremData].words
    const sentences: string[] = []

    for (let i = 0; i < count; i++) {
      const sentenceWords: string[] = []
      const sentenceLength = Math.floor(Math.random() * 10) + 8

      if (i === 0 && startWithClassic && language === 'latin') {
        sentenceWords.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit')
      }

      const remaining = sentenceLength - sentenceWords.length
      for (let j = 0; j < remaining; j++) {
        sentenceWords.push(words[Math.floor(Math.random() * words.length)])
      }

      sentenceWords[0] = sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1)
      sentences.push(sentenceWords.join(' ') + '.')
    }

    setGenerated(sentences.join(' '))
  }

  const generateList = (items: number, ordered: boolean = false) => {
    const words = loremData[language as keyof typeof loremData].words
    const list: string[] = []

    for (let i = 0; i < items; i++) {
      const itemWords: string[] = []
      const itemLength = Math.floor(Math.random() * 5) + 3

      for (let j = 0; j < itemLength; j++) {
        itemWords.push(words[Math.floor(Math.random() * words.length)])
      }

      itemWords[0] = itemWords[0].charAt(0).toUpperCase() + itemWords[0].slice(1)

      if (includeHTML) {
        list.push(`  <li>${itemWords.join(' ')}</li>`)
      } else {
        list.push(`${ordered ? `${i + 1}.` : '•'} ${itemWords.join(' ')}`)
      }
    }

    if (includeHTML) {
      const tag = ordered ? 'ol' : 'ul'
      setGenerated(`<${tag}>\n${list.join('\n')}\n</${tag}>`)
    } else {
      setGenerated(list.join('\n'))
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadText = () => {
    const blob = new Blob([generated], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lorem_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const stats = generated ? {
    characters: generated.length,
    charactersNoSpaces: generated.replace(/\s/g, '').length,
    words: generated.split(/\s+/).filter(w => w.length > 0).length,
    sentences: generated.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
    paragraphs: generated.split(/\n\n/).filter(p => p.length > 0).length
  } : null

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
              Advanced Lorem Ipsum Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              Multi-language placeholder text • HTML tags • Lists & more
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Settings Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Settings
              </CardTitle>
              <CardDescription>Configure generation options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selection */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4" />
                  Language/Style
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(loremData).map(([key, data]) => (
                      <SelectItem key={key} value={key}>
                        {data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Paragraphs */}
              <div>
                <Label>Paragraphs: {paragraphs}</Label>
                <Slider
                  value={[paragraphs]}
                  onValueChange={(val) => setParagraphs(val[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Words per Paragraph */}
              <div>
                <Label>Words per Paragraph: {wordsPerParagraph}</Label>
                <Slider
                  value={[wordsPerParagraph]}
                  onValueChange={(val) => setWordsPerParagraph(val[0])}
                  min={10}
                  max={200}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Options */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="classic" className="cursor-pointer">
                    Start with classic
                    {language === 'latin' && (
                      <span className="text-xs text-muted-foreground block">
                        (Lorem ipsum dolor...)
                      </span>
                    )}
                  </Label>
                  <Switch
                    id="classic"
                    checked={startWithClassic}
                    onCheckedChange={setStartWithClassic}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="html" className="cursor-pointer flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Include HTML tags
                  </Label>
                  <Switch
                    id="html"
                    checked={includeHTML}
                    onCheckedChange={setIncludeHTML}
                  />
                </div>

                {includeHTML && (
                  <div>
                    <Label>HTML Tag</Label>
                    <Select value={htmlTag} onValueChange={setHtmlTag}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p">{'<p>'} Paragraph</SelectItem>
                        <SelectItem value="div">{'<div>'} Division</SelectItem>
                        <SelectItem value="span">{'<span>'} Span</SelectItem>
                        <SelectItem value="section">{'<section>'} Section</SelectItem>
                        <SelectItem value="article">{'<article>'} Article</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button onClick={generateLorem} className="w-full bg-gradient-to-r from-amber-500 to-red-500">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Paragraphs
              </Button>

              {/* Quick Actions */}
              <div className="space-y-2 pt-4 border-t">
                <Label className="text-sm">Quick Generate</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => generateWords(25)} variant="outline" size="sm">
                    25 Words
                  </Button>
                  <Button onClick={() => generateWords(50)} variant="outline" size="sm">
                    50 Words
                  </Button>
                  <Button onClick={() => generateWords(100)} variant="outline" size="sm">
                    100 Words
                  </Button>
                  <Button onClick={() => generateWords(200)} variant="outline" size="sm">
                    200 Words
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => generateSentences(5)} variant="outline" size="sm">
                    5 Sentences
                  </Button>
                  <Button onClick={() => generateSentences(10)} variant="outline" size="sm">
                    10 Sentences
                  </Button>
                  <Button onClick={() => generateList(5, false)} variant="outline" size="sm">
                    5 List Items
                  </Button>
                  <Button onClick={() => generateList(10, true)} variant="outline" size="sm">
                    10 Ordered
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Text</CardTitle>
                  <CardDescription>Your placeholder content</CardDescription>
                </div>
                <Badge variant="outline">
                  {loremData[language as keyof typeof loremData].name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={generated}
                readOnly
                placeholder="Generated text will appear here..."
                className="h-96 font-mono text-sm"
              />

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                <Button onClick={downloadText} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Characters</div>
                    <div className="text-xl font-bold">{stats.characters}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">No Spaces</div>
                    <div className="text-xl font-bold">{stats.charactersNoSpaces}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Words</div>
                    <div className="text-xl font-bold">{stats.words}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Sentences</div>
                    <div className="text-xl font-bold">{stats.sentences}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Paragraphs</div>
                    <div className="text-xl font-bold">{stats.paragraphs}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-500" />
                5 Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Latin classic, English, Tech jargon, Hipster, and Corporate speak
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="w-4 h-4 text-orange-500" />
                HTML Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate with HTML tags (p, div, span, section, article)
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />
                Flexible Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Words, sentences, paragraphs, lists - ordered and unordered
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
