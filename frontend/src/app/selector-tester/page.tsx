'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Target, Copy, Check, AlertCircle, Download, RefreshCw,
  Code, History, Zap, Eye, Lightbulb, Settings2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

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
  const [highlightedHtml, setHighlightedHtml] = useState('')
  const [selectorHistory, setSelectorHistory] = useState<string[]>([])
  const [framework, setFramework] = useState<'selenium' | 'playwright' | 'cypress' | 'puppeteer'>('selenium')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [livePreview, setLivePreview] = useState(true)

  useEffect(() => {
    if (matches > 0) {
      highlightMatches()
    }
  }, [matches, matchedElements])

  const highlightMatches = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      if (selectorType === 'css') {
        const elements = doc.querySelectorAll(selector)
        elements.forEach((el) => {
          el.setAttribute('style', 'background-color: #fbbf24; border: 2px solid #f59e0b; padding: 2px;')
        })
      } else {
        const result = doc.evaluate(
          selector,
          doc,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        )
        for (let i = 0; i < result.snapshotLength; i++) {
          const node = result.snapshotItem(i) as Element
          if (node) {
            node.setAttribute('style', 'background-color: #fbbf24; border: 2px solid #f59e0b; padding: 2px;')
          }
        }
      }

      setHighlightedHtml(doc.body.innerHTML)
    } catch (err) {
      setHighlightedHtml('')
    }
  }

  const testSelector = () => {
    setError('')
    setMatches(0)
    setMatchedElements([])
    setSuggestions([])

    if (!selector.trim()) return

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

        // Add to history
        if (!selectorHistory.includes(selector)) {
          setSelectorHistory([selector, ...selectorHistory.slice(0, 9)])
        }

        // Generate suggestions
        generateSuggestions(elements)
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

        if (!selectorHistory.includes(selector)) {
          setSelectorHistory([selector, ...selectorHistory.slice(0, 9)])
        }
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const generateSuggestions = (elements: NodeListOf<Element>) => {
    const selectorSuggestions: string[] = []

    if (elements.length === 1) {
      const el = elements[0]

      // ID selector (most specific)
      if (el.id) {
        selectorSuggestions.push(`#${el.id}`)
      }

      // Class selector
      if (el.className) {
        const classes = el.className.split(' ').filter(c => c)
        if (classes.length > 0) {
          selectorSuggestions.push(`.${classes.join('.')}`)
        }
      }

      // Data attribute
      const dataAttrs = Array.from(el.attributes).filter(attr => attr.name.startsWith('data-'))
      if (dataAttrs.length > 0) {
        selectorSuggestions.push(`[${dataAttrs[0].name}="${dataAttrs[0].value}"]`)
      }

      // Tag + class
      if (el.className) {
        const classes = el.className.split(' ').filter(c => c)[0]
        selectorSuggestions.push(`${el.tagName.toLowerCase()}.${classes}`)
      }
    }

    setSuggestions(selectorSuggestions.filter(s => s !== selector))
    setShowSuggestions(selectorSuggestions.length > 0)
  }

  const generateCode = () => {
    let code = ''
    const escapedSelector = selector.replace(/"/g, '\\"')

    switch (framework) {
      case 'selenium':
        if (selectorType === 'css') {
          code = `// Java - Selenium WebDriver\nWebElement element = driver.findElement(By.cssSelector("${escapedSelector}"));\n\n// Python - Selenium\nelement = driver.find_element(By.CSS_SELECTOR, "${escapedSelector}")\n\n// C# - Selenium\nvar element = driver.FindElement(By.CssSelector("${escapedSelector}"));`
        } else {
          code = `// Java - Selenium WebDriver\nWebElement element = driver.findElement(By.xpath("${escapedSelector}"));\n\n// Python - Selenium\nelement = driver.find_element(By.XPATH, "${escapedSelector}")\n\n// C# - Selenium\nvar element = driver.FindElement(By.XPath("${escapedSelector}"));`
        }
        break

      case 'playwright':
        if (selectorType === 'css') {
          code = `// JavaScript/TypeScript - Playwright\nconst element = await page.locator('${escapedSelector}');\nawait element.click();\n\n// Python - Playwright\nelement = page.locator("${escapedSelector}")\nelement.click()`
        } else {
          code = `// JavaScript/TypeScript - Playwright\nconst element = await page.locator('xpath=${escapedSelector}');\nawait element.click();\n\n// Python - Playwright\nelement = page.locator("xpath=${escapedSelector}")\nelement.click()`
        }
        break

      case 'cypress':
        if (selectorType === 'css') {
          code = `// Cypress\ncy.get('${escapedSelector}').click();\n\n// Multiple elements\ncy.get('${escapedSelector}').should('have.length', ${matches});\n\n// First element\ncy.get('${escapedSelector}').first().click();`
        } else {
          code = `// Cypress with XPath plugin\ncy.xpath('${escapedSelector}').click();\n\n// Note: Requires cypress-xpath plugin\n// npm install -D cypress-xpath`
        }
        break

      case 'puppeteer':
        if (selectorType === 'css') {
          code = `// Puppeteer\nconst element = await page.$('${escapedSelector}');\nawait element.click();\n\n// Multiple elements\nconst elements = await page.$$('${escapedSelector}');\n\n// Wait for element\nawait page.waitForSelector('${escapedSelector}');`
        } else {
          code = `// Puppeteer with XPath\nconst elements = await page.$x('${escapedSelector}');\nif (elements.length > 0) {\n  await elements[0].click();\n}`
        }
        break
    }

    return code
  }

  const downloadCode = () => {
    const code = generateCode()
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `selector_${framework}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyCode = () => {
    const code = generateCode()
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copySelector = () => {
    navigator.clipboard.writeText(selector)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectorExamples = {
    css: [
      { selector: '.item', description: 'All elements with class "item"', category: 'Class' },
      { selector: '#title', description: 'Element with id "title"', category: 'ID' },
      { selector: 'li.active', description: 'List items with class "active"', category: 'Tag + Class' },
      { selector: '[data-id="2"]', description: 'Element with data-id="2"', category: 'Attribute' },
      { selector: 'ul > li', description: 'Direct children li of ul', category: 'Child' },
      { selector: '.container .item:nth-child(2)', description: 'Second item in container', category: 'Pseudo' },
      { selector: 'button:not(.active)', description: 'Buttons without active class', category: 'Negation' },
      { selector: 'li:first-of-type', description: 'First li element', category: 'Position' },
    ],
    xpath: [
      { selector: '//li[@class="item"]', description: 'All li with class="item"', category: 'Attribute' },
      { selector: '//*[@id="title"]', description: 'Element with id="title"', category: 'ID' },
      { selector: '//li[contains(@class, "active")]', description: 'Li containing "active" class', category: 'Contains' },
      { selector: '//button[@id="submit-btn"]', description: 'Button with specific id', category: 'Specific' },
      { selector: '//ul/li[2]', description: 'Second li in ul', category: 'Position' },
      { selector: '//div[@class="container"]//li', description: 'All li descendants of container', category: 'Descendant' },
      { selector: '//li[text()="Item 1"]', description: 'Li with exact text "Item 1"', category: 'Text' },
      { selector: '//li[starts-with(@data-id, "1")]', description: 'Li with data-id starting with "1"', category: 'Starts-with' },
    ]
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Advanced Selector Tester
              </h1>
              <p className="text-muted-foreground mt-1">Test, validate and generate code for CSS selectors and XPath</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  HTML Input
                </CardTitle>
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

            {/* Live Preview */}
            {livePreview && highlightedHtml && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Live Preview
                    </CardTitle>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      Highlighted
                    </Badge>
                  </div>
                  <CardDescription>Matched elements are highlighted in yellow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="p-4 border rounded-lg bg-white dark:bg-gray-950 max-h-[300px] overflow-auto"
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Selector History */}
            {selectorHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Selectors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectorHistory.map((hist, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => setSelector(hist)}
                      >
                        <code className="text-xs font-mono">{hist}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Selector Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selector Type */}
                <div className="space-y-2">
                  <Label>Selector Type</Label>
                  <Tabs value={selectorType} onValueChange={(v) => setSelectorType(v as 'css' | 'xpath')}>
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="css">CSS Selector</TabsTrigger>
                      <TabsTrigger value="xpath">XPath</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Selector Input */}
                <div className="space-y-2">
                  <Label>Test Selector</Label>
                  <div className="flex gap-2">
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

                {/* Live Preview Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor="livePreview" className="cursor-pointer flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </Label>
                  <Switch
                    id="livePreview"
                    checked={livePreview}
                    onCheckedChange={setLivePreview}
                  />
                </div>

                {/* Test Button */}
                <Button
                  onClick={testSelector}
                  className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white"
                  disabled={!selector || !html}
                  size="lg"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Test Selector
                </Button>

                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-500">{error}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success Display */}
                <AnimatePresence>
                  {!error && matches > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="bg-green-500">
                          {matches} Match{matches !== 1 ? 'es' : ''} Found
                        </Badge>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Suggestions */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label className="flex items-center gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Selector Suggestions
                      </Label>
                      <div className="space-y-1">
                        {suggestions.map((sugg, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded cursor-pointer hover:bg-yellow-500/20 transition-colors"
                            onClick={() => {
                              setSelector(sugg)
                              setShowSuggestions(false)
                            }}
                          >
                            <code className="text-xs font-mono text-yellow-700 dark:text-yellow-400">{sugg}</code>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Matched Elements */}
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

            {/* Code Export */}
            {matches > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Code Export
                      </CardTitle>
                      <CardDescription>Export code for your testing framework</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={copyCode} variant="outline" size="sm">
                        {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                        Copy
                      </Button>
                      <Button onClick={downloadCode} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm mb-2">Framework</Label>
                    <Select value={framework} onValueChange={(val: any) => setFramework(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="selenium">Selenium WebDriver</SelectItem>
                        <SelectItem value="playwright">Playwright</SelectItem>
                        <SelectItem value="cypress">Cypress</SelectItem>
                        <SelectItem value="puppeteer">Puppeteer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-gray-950 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono">
                      {generateCode()}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Examples */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Selector Examples & Cheat Sheet</CardTitle>
            <CardDescription>Click any example to use it</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectorType} onValueChange={(v) => setSelectorType(v as 'css' | 'xpath')}>
              <TabsList>
                <TabsTrigger value="css">CSS Examples</TabsTrigger>
                <TabsTrigger value="xpath">XPath Examples</TabsTrigger>
              </TabsList>
              <TabsContent value="css" className="mt-4">
                <div className="grid md:grid-cols-2 gap-3">
                  {selectorExamples.css.map((example, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors border border-transparent hover:border-blue-500/50"
                      onClick={() => setSelector(example.selector)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                          {example.selector}
                        </code>
                        <Badge variant="outline" className="text-xs">{example.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{example.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="xpath" className="mt-4">
                <div className="grid md:grid-cols-2 gap-3">
                  {selectorExamples.xpath.map((example, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors border border-transparent hover:border-cyan-500/50"
                      onClick={() => setSelector(example.selector)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-sm font-mono text-cyan-600 dark:text-cyan-400">
                          {example.selector}
                        </code>
                        <Badge variant="outline" className="text-xs">{example.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{example.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-4 mt-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                Live Highlighting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visual preview with matched elements highlighted
              </p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 dark:border-cyan-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-500" />
                Code Export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate code for Selenium, Playwright, Cypress
              </p>
            </CardContent>
          </Card>

          <Card className="border-teal-200 dark:border-teal-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-teal-500" />
                Smart Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-powered selector optimization and alternatives
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-green-500" />
                Selector History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep track of recently tested selectors
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

