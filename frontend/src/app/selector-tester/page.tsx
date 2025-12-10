'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Target, Copy, Check, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function SelectorTesterPage() {
  const [html, setHtml] = useState(`<div class="container">
  <h1 id="title">Sample Page</h1>
  <ul class="list">
    <li class="item" data-id="1">Item 1</li>
    <li class="item active" data-id="2">Item 2</li>
    <li class="item" data-id="3">Item 3</li>
  </ul>
  <button id="submit-btn" class="btn primary">Submit</button>
</div>`)
  const [selector, setSelector] = useState('')
  const [selectorType, setSelectorType] = useState<'css' | 'xpath'>('css')
  const [matches, setMatches] = useState<number>(0)
  const [matchedElements, setMatchedElements] = useState<string[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const testSelector = () => {
    setError('')
    setMatches(0)
    setMatchedElements([])

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      if (selectorType === 'css') {
        const elements = doc.querySelectorAll(selector)
        setMatches(elements.length)
        const matched: string[] = []
        elements.forEach((el) => {
          matched.push(el.outerHTML)
        })
        setMatchedElements(matched)
      } else {
        // XPath
        const result = doc.evaluate(
          selector,
          doc,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        )
        setMatches(result.snapshotLength)
        const matched: string[] = []
        for (let i = 0; i < result.snapshotLength; i++) {
          const node = result.snapshotItem(i)
          if (node) {
            matched.push((node as Element).outerHTML || node.textContent || '')
          }
        }
        setMatchedElements(matched)
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const copySelector = () => {
    navigator.clipboard.writeText(selector)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectorExamples = {
    css: [
      { selector: '.item', description: 'All elements with class "item"' },
      { selector: '#title', description: 'Element with id "title"' },
      { selector: 'li.active', description: 'List items with class "active"' },
      { selector: '[data-id="2"]', description: 'Element with data-id="2"' },
      { selector: 'ul > li', description: 'Direct children li of ul' },
      { selector: '.container .item:nth-child(2)', description: 'Second item in container' }
    ],
    xpath: [
      { selector: '//li[@class="item"]', description: 'All li with class="item"' },
      { selector: '//*[@id="title"]', description: 'Element with id="title"' },
      { selector: '//li[contains(@class, "active")]', description: 'Li containing "active" class' },
      { selector: '//button[@id="submit-btn"]', description: 'Button with specific id' },
      { selector: '//ul/li[2]', description: 'Second li in ul' },
      { selector: '//div[@class="container"]//li', description: 'All li descendants of container' }
    ]
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Selector Tester</h1>
            <p className="text-muted-foreground">Test and validate CSS selectors and XPath expressions</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>HTML Input</CardTitle>
                <CardDescription>Paste your HTML code to test selectors against</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="<div>Your HTML here...</div>"
                  className="font-mono text-sm min-h-[300px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selector Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectorType} onValueChange={(v) => setSelectorType(v as 'css' | 'xpath')}>
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="css">CSS Selector</TabsTrigger>
                    <TabsTrigger value="xpath">XPath</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Selector</CardTitle>
                <CardDescription>Enter your selector to test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selector</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={selector}
                      onChange={(e) => setSelector(e.target.value)}
                      placeholder={selectorType === 'css' ? '.class or #id' : '//div[@class="example"]'}
                      className="font-mono"
                      onKeyDown={(e) => e.key === 'Enter' && testSelector()}
                    />
                    <Button onClick={copySelector} variant="outline" size="icon">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={testSelector}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  disabled={!selector || !html}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Test Selector
                </Button>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-500">{error}</div>
                  </div>
                )}

                {!error && matches > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="bg-green-500">
                        {matches} Match{matches !== 1 ? 'es' : ''} Found
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Matched Elements</CardTitle>
                <CardDescription>Elements matching your selector</CardDescription>
              </CardHeader>
              <CardContent>
                {matchedElements.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {matchedElements.map((element, index) => (
                      <div
                        key={index}
                        className="p-2 bg-muted rounded-lg text-xs font-mono overflow-x-auto"
                      >
                        {element}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No matches yet. Test a selector to see results.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Example Selectors</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectorType} onValueChange={(v) => setSelectorType(v as 'css' | 'xpath')}>
              <TabsList>
                <TabsTrigger value="css">CSS Examples</TabsTrigger>
                <TabsTrigger value="xpath">XPath Examples</TabsTrigger>
              </TabsList>
              <TabsContent value="css" className="space-y-2 mt-4">
                {selectorExamples.css.map((example, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => setSelector(example.selector)}
                  >
                    <div>
                      <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                        {example.selector}
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">{example.description}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="xpath" className="space-y-2 mt-4">
                {selectorExamples.xpath.map((example, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => setSelector(example.selector)}
                  >
                    <div>
                      <code className="text-sm font-mono text-cyan-600 dark:text-cyan-400">
                        {example.selector}
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">{example.description}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

