'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { regexApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Code2, Play, AlertCircle } from 'lucide-react'

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flags, setFlags] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    if (!pattern) {
      toast.error('Please enter a regex pattern')
      return
    }

    setLoading(true)
    try {
      const response = await regexApi.test({
        pattern,
        testString,
        flags,
      })
      setResult(response.data)
      if (response.data.isValid) {
        toast.success(`Found ${response.data.matchCount} matches`)
      } else {
        toast.error('Invalid regex pattern')
      }
    } catch (error) {
      toast.error('Error testing regex')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFlag = (flag: string) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    )
  }

  const highlightMatches = () => {
    if (!result?.matches || result.matches.length === 0) {
      return testString
    }

    let highlighted = testString
    let offset = 0

    result.matches.forEach((match: any) => {
      const start = match.start + offset
      const end = match.end + offset
      const before = highlighted.slice(0, start)
      const matchText = highlighted.slice(start, end)
      const after = highlighted.slice(end)

      const replacement = `<mark class="bg-yellow-300 dark:bg-yellow-600">${matchText}</mark>`
      highlighted = before + replacement + after
      offset += replacement.length - matchText.length
    })

    return highlighted
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold">Regex Tester</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Test regular expressions with live matching and highlighting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pattern</CardTitle>
                <CardDescription>Enter your regular expression pattern</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pattern">Regex Pattern</Label>
                  <Input
                    id="pattern"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="e.g., \d{3}-\d{3}-\d{4}"
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label>Flags</Label>
                  <div className="flex gap-2 mt-2">
                    {['i', 'm', 's'].map((flag) => (
                      <Button
                        key={flag}
                        variant={flags.includes(flag) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleFlag(flag)}
                      >
                        {flag}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    i: case-insensitive, m: multiline, s: dotall
                  </p>
                </div>

                <div>
                  <Label htmlFor="testString">Test String</Label>
                  <Textarea
                    id="testString"
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder="Enter text to test against"
                    className="min-h-[200px] font-mono"
                  />
                </div>

                <Button onClick={handleTest} disabled={loading} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  {loading ? 'Testing...' : 'Test Pattern'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Reference</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-muted p-1 rounded">\d</code>
                  <span>Any digit</span>
                  <code className="bg-muted p-1 rounded">\w</code>
                  <span>Word character</span>
                  <code className="bg-muted p-1 rounded">\s</code>
                  <span>Whitespace</span>
                  <code className="bg-muted p-1 rounded">.</code>
                  <span>Any character</span>
                  <code className="bg-muted p-1 rounded">*</code>
                  <span>0 or more</span>
                  <code className="bg-muted p-1 rounded">+</code>
                  <span>1 or more</span>
                  <code className="bg-muted p-1 rounded">?</code>
                  <span>0 or 1</span>
                  <code className="bg-muted p-1 rounded">{'{n,m}'}</code>
                  <span>Between n and m</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {result && (
              <>
                {result.isValid ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>
                          Found {result.matchCount} match{result.matchCount !== 1 ? 'es' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div
                          className="p-4 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap break-words"
                          dangerouslySetInnerHTML={{ __html: highlightMatches() }}
                        />
                      </CardContent>
                    </Card>

                    {result.matches.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Match Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {result.matches.map((match: any, index: number) => (
                              <div key={index} className="p-3 bg-muted rounded-md">
                                <div className="font-semibold text-sm mb-1">
                                  Match {index + 1}
                                </div>
                                <div className="text-sm space-y-1">
                                  <div>
                                    <span className="text-muted-foreground">Value:</span>{' '}
                                    <code className="bg-background px-2 py-1 rounded">
                                      {match.value}
                                    </code>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Position:</span>{' '}
                                    {match.start} - {match.end}
                                  </div>
                                  {match.groups.length > 0 && (
                                    <div>
                                      <span className="text-muted-foreground">Groups:</span>{' '}
                                      {match.groups.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-5 h-5" />
                        Invalid Pattern
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-destructive">{result.error}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

