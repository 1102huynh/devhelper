'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Code2, Play, Copy, Check, AlertCircle, CheckCircle2,
  Book, Replace, Search, History, Code, Download,
  Plus, Trash2, X, FileCode, TestTube
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

interface Match {
  value: string
  start: number
  end: number
  groups: string[]
}

interface CommonPattern {
  name: string
  pattern: string
  description: string
  example: string
}

interface TestCase {
  id: string
  input: string
  shouldMatch: boolean
  description: string
}

interface PatternHistory {
  id: string
  pattern: string
  flags: string[]
  name: string
  timestamp: number
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [replaceWith, setReplaceWith] = useState('')
  const [flags, setFlags] = useState<string[]>(['g'])
  const [matches, setMatches] = useState<Match[]>([])
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [highlightedText, setHighlightedText] = useState('')
  const [replacedText, setReplacedText] = useState('')
  const [autoTest, setAutoTest] = useState(true)
  const [explanation, setExplanation] = useState('')

  // Test Cases
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [newTestInput, setNewTestInput] = useState('')
  const [newTestShouldMatch, setNewTestShouldMatch] = useState(true)
  const [newTestDescription, setNewTestDescription] = useState('')
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  // Pattern History
  const [patternHistory, setPatternHistory] = useState<PatternHistory[]>([])
  const [historyName, setHistoryName] = useState('')

  // Code generation
  const [codeLanguage, setCodeLanguage] = useState('javascript')

  const commonPatterns: CommonPattern[] = [
    // Basic & Contact
    {
      name: 'Email',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      description: 'Matches email addresses',
      example: 'user@example.com'
    },
    {
      name: 'Phone (US)',
      pattern: '\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}',
      description: 'Matches US phone numbers',
      example: '(555) 123-4567'
    },
    {
      name: 'Phone (International)',
      pattern: '\\+?[1-9]\\d{1,14}',
      description: 'Matches international phone numbers',
      example: '+1234567890'
    },
    {
      name: 'Username',
      pattern: '^[a-zA-Z0-9_]{3,16}$',
      description: 'Matches usernames (3-16 chars)',
      example: 'user_123'
    },

    // Web & URLs
    {
      name: 'URL',
      pattern: 'https?://[\\w\\-.]+(:\\d+)?(/[\\w\\-./?%&=]*)?',
      description: 'Matches URLs',
      example: 'https://example.com/path'
    },
    {
      name: 'Domain Name',
      pattern: '(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]',
      description: 'Matches domain names',
      example: 'example.com'
    },
    {
      name: 'Slug',
      pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
      description: 'Matches URL-friendly slugs',
      example: 'my-blog-post'
    },
    {
      name: 'YouTube URL',
      pattern: '(?:https?:\\/\\/)?(?:www\\.)?(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([a-zA-Z0-9_-]{11})',
      description: 'Matches YouTube video URLs',
      example: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      name: 'GitHub URL',
      pattern: 'https?://github\\.com/([\\w-]+)/([\\w-]+)',
      description: 'Matches GitHub repository URLs',
      example: 'https://github.com/user/repo'
    },

    // Network & Technical
    {
      name: 'IPv4 Address',
      pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
      description: 'Matches IPv4 addresses',
      example: '192.168.1.1'
    },
    {
      name: 'IPv6 Address',
      pattern: '(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}',
      description: 'Matches IPv6 addresses',
      example: '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
    },
    {
      name: 'MAC Address',
      pattern: '([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})',
      description: 'Matches MAC addresses',
      example: 'AA:BB:CC:DD:EE:FF'
    },
    {
      name: 'Port Number',
      pattern: '\\b(?:[1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])\\b',
      description: 'Matches valid port numbers (1-65535)',
      example: '8080'
    },

    // Date & Time
    {
      name: 'Date (YYYY-MM-DD)',
      pattern: '\\d{4}-\\d{2}-\\d{2}',
      description: 'Matches ISO date format',
      example: '2024-12-27'
    },
    {
      name: 'Date (MM/DD/YYYY)',
      pattern: '\\b(?:0[1-9]|1[0-2])/(?:0[1-9]|[12][0-9]|3[01])/\\d{4}\\b',
      description: 'Matches US date format',
      example: '12/27/2024'
    },
    {
      name: 'Time (HH:MM:SS)',
      pattern: '(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d',
      description: 'Matches time in 24h format',
      example: '14:30:00'
    },
    {
      name: 'Time (12h)',
      pattern: '(?:0?[1-9]|1[0-2]):[0-5]\\d\\s?(?:AM|PM|am|pm)',
      description: 'Matches 12-hour time format',
      example: '2:30 PM'
    },

    // Financial
    {
      name: 'Credit Card',
      pattern: '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b',
      description: 'Matches credit card numbers',
      example: '1234-5678-9012-3456'
    },
    {
      name: 'Visa Card',
      pattern: '4[0-9]{12}(?:[0-9]{3})?',
      description: 'Matches Visa card numbers',
      example: '4111111111111111'
    },
    {
      name: 'MasterCard',
      pattern: '5[1-5][0-9]{14}',
      description: 'Matches MasterCard numbers',
      example: '5500000000000004'
    },
    {
      name: 'AmEx Card',
      pattern: '3[47][0-9]{13}',
      description: 'Matches American Express card numbers',
      example: '378282246310005'
    },
    {
      name: 'Currency',
      pattern: '\\$?\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2})?',
      description: 'Matches currency amounts',
      example: '$1,234.56'
    },
    {
      name: 'IBAN',
      pattern: '[A-Z]{2}\\d{2}[A-Z0-9]{1,30}',
      description: 'Matches IBAN bank account numbers',
      example: 'GB82WEST12345698765432'
    },

    // Government & IDs
    {
      name: 'SSN (US)',
      pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
      description: 'Matches US Social Security Numbers',
      example: '123-45-6789'
    },
    {
      name: 'ZIP Code (US)',
      pattern: '\\b\\d{5}(?:-\\d{4})?\\b',
      description: 'Matches US ZIP codes',
      example: '12345-6789'
    },
    {
      name: 'Passport',
      pattern: '[A-Z]{1,2}\\d{6,9}',
      description: 'Matches passport numbers',
      example: 'AB1234567'
    },
    {
      name: 'ISBN-10',
      pattern: '(?:\\d[- ]?){9}[\\dxX]',
      description: 'Matches ISBN-10 book numbers',
      example: '0-306-40615-2'
    },
    {
      name: 'ISBN-13',
      pattern: '97[89][- ]?(?:\\d[- ]?){9}\\d',
      description: 'Matches ISBN-13 book numbers',
      example: '978-0-306-40615-7'
    },
    {
      name: 'VIN',
      pattern: '[A-HJ-NPR-Z0-9]{17}',
      description: 'Matches Vehicle Identification Numbers',
      example: '1HGBH41JXMN109186'
    },

    // Crypto & Blockchain
    {
      name: 'Bitcoin Address',
      pattern: '[13][a-km-zA-HJ-NP-Z1-9]{25,34}',
      description: 'Matches Bitcoin wallet addresses',
      example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    {
      name: 'Ethereum Address',
      pattern: '0x[a-fA-F0-9]{40}',
      description: 'Matches Ethereum wallet addresses',
      example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    },

    // Colors & Design
    {
      name: 'Hex Color',
      pattern: '#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}',
      description: 'Matches hex color codes',
      example: '#FF5733'
    },
    {
      name: 'RGB Color',
      pattern: 'rgb\\(\\s*(?:(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])\\s*,\\s*){2}(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])\\s*\\)',
      description: 'Matches RGB color values',
      example: 'rgb(255, 87, 51)'
    },

    // Markup & Code
    {
      name: 'HTML Tag',
      pattern: '<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)',
      description: 'Matches HTML tags',
      example: '<div>content</div>'
    },
    {
      name: 'XML Tag',
      pattern: '<\\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>',
      description: 'Matches XML tags',
      example: '<tag attribute="value"/>'
    },
    {
      name: 'Markdown Link',
      pattern: '\\[([^\\]]+)\\]\\(([^\\)]+)\\)',
      description: 'Matches Markdown link syntax',
      example: '[Link Text](https://example.com)'
    },
    {
      name: 'JSON Property',
      pattern: '"[^"]+":',
      description: 'Matches JSON property names',
      example: '"name":'
    },

    // File & Path
    {
      name: 'File Path (Windows)',
      pattern: '[a-zA-Z]:\\\\(?:[^\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\/:*?"<>|\\r\\n]*',
      description: 'Matches Windows file paths',
      example: 'C:\\Users\\Documents\\file.txt'
    },
    {
      name: 'File Path (Unix)',
      pattern: '\\/(?:[^\\/\\0]+\\/)*[^\\/\\0]+',
      description: 'Matches Unix/Linux file paths',
      example: '/home/user/documents/file.txt'
    },
    {
      name: 'File Extension',
      pattern: '\\.[a-zA-Z0-9]+$',
      description: 'Matches file extensions',
      example: '.txt'
    },

    // Social Media
    {
      name: 'Twitter Handle',
      pattern: '@[a-zA-Z0-9_]{1,15}',
      description: 'Matches Twitter/X usernames',
      example: '@username'
    },
    {
      name: 'Hashtag',
      pattern: '#[a-zA-Z0-9_]+',
      description: 'Matches social media hashtags',
      example: '#DevHelper'
    },

    // Technical IDs
    {
      name: 'UUID',
      pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
      description: 'Matches UUIDs',
      example: '123e4567-e89b-12d3-a456-426614174000'
    },
    {
      name: 'Base64',
      pattern: '[A-Za-z0-9+/]{4,}={0,2}',
      description: 'Matches Base64 encoded strings',
      example: 'SGVsbG8gV29ybGQ='
    },
    {
      name: 'JWT Token',
      pattern: 'eyJ[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_.+/=]*',
      description: 'Matches JWT tokens',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'
    },

    // Misc
    {
      name: 'Version',
      pattern: '\\d+\\.\\d+\\.\\d+',
      description: 'Matches semantic version numbers',
      example: '1.2.3'
    },
    {
      name: 'Password Strong',
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
      description: 'Strong password (8+ chars, mixed case, number, special)',
      example: 'MyP@ssw0rd'
    },
    {
      name: 'Latitude',
      pattern: '^[-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?)$',
      description: 'Matches latitude coordinates',
      example: '40.7128'
    },
    {
      name: 'Longitude',
      pattern: '^[-+]?(180(\\.0+)?|((1[0-7]\\d)|([1-9]?\\d))(\\.\\d+)?)$',
      description: 'Matches longitude coordinates',
      example: '-74.0060'
    },
    {
      name: 'Emoji',
      pattern: '[\\u{1F600}-\\u{1F64F}]',
      description: 'Matches emoji characters',
      example: '😀'
    }
  ]

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('regex_pattern_history')
    if (savedHistory) {
      try {
        setPatternHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load pattern history')
      }
    }

    const savedTestCases = localStorage.getItem('regex_test_cases')
    if (savedTestCases) {
      try {
        setTestCases(JSON.parse(savedTestCases))
      } catch (e) {
        console.error('Failed to load test cases')
      }
    }
  }, [])

  // Save test cases to localStorage
  useEffect(() => {
    if (testCases.length > 0) {
      localStorage.setItem('regex_test_cases', JSON.stringify(testCases))
    }
  }, [testCases])

  // Auto-test
  useEffect(() => {
    if (autoTest && pattern && testString) {
      testRegex()
    }
  }, [pattern, testString, flags, autoTest])

  const testRegex = () => {
    if (!pattern) {
      toast.error('Enter a regex pattern')
      return
    }

    try {
      const flagStr = flags.join('')
      const regex = new RegExp(pattern, flagStr)
      const foundMatches: Match[] = []
      let match

      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            value: match[0],
            start: match.index,
            end: match.index + match[0].length,
            groups: match.slice(1).filter(g => g !== undefined)
          })
        }
      } else {
        match = regex.exec(testString)
        if (match) {
          foundMatches.push({
            value: match[0],
            start: match.index,
            end: match.index + match[0].length,
            groups: match.slice(1).filter(g => g !== undefined)
          })
        }
      }

      setMatches(foundMatches)
      setIsValid(true)
      setError('')
      generateExplanation(pattern)
      highlightMatches(foundMatches)

      if (!autoTest) {
        toast.success(`Found ${foundMatches.length} match${foundMatches.length !== 1 ? 'es' : ''}`)
      }
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : 'Invalid regex pattern')
      setMatches([])
      setHighlightedText(testString)
      if (!autoTest) {
        toast.error('Invalid regex pattern')
      }
    }
  }

  const highlightMatches = (foundMatches: Match[]) => {
    if (!testString || foundMatches.length === 0) {
      setHighlightedText(testString)
      return
    }

    let result = ''
    let lastIndex = 0

    foundMatches.forEach((match, idx) => {
      result += testString.slice(lastIndex, match.start)
      result += `<mark class="bg-yellow-300 dark:bg-yellow-600 px-1 rounded" title="Match ${idx + 1}">${match.value}</mark>`
      lastIndex = match.end
    })
    result += testString.slice(lastIndex)

    setHighlightedText(result)
  }

  const performReplace = () => {
    if (!pattern || !testString) {
      toast.error('Enter pattern and test string')
      return
    }

    try {
      const flagStr = flags.join('')
      const regex = new RegExp(pattern, flagStr)
      const replaced = testString.replace(regex, replaceWith)
      setReplacedText(replaced)
      toast.success('Replacement complete!')
    } catch (err) {
      toast.error('Invalid regex pattern')
    }
  }

  const generateExplanation = (pat: string) => {
    const explanations: string[] = []

    if (pat.includes('\\d')) explanations.push('\\d = Any digit (0-9)')
    if (pat.includes('\\D')) explanations.push('\\D = Any non-digit')
    if (pat.includes('\\w')) explanations.push('\\w = Word character (a-z, A-Z, 0-9, _)')
    if (pat.includes('\\W')) explanations.push('\\W = Non-word character')
    if (pat.includes('\\s')) explanations.push('\\s = Whitespace')
    if (pat.includes('\\S')) explanations.push('\\S = Non-whitespace')
    if (pat.includes('^')) explanations.push('^ = Start of string/line')
    if (pat.includes('$')) explanations.push('$ = End of string/line')
    if (pat.includes('.')) explanations.push('. = Any character (except newline)')
    if (pat.includes('*')) explanations.push('* = 0 or more times')
    if (pat.includes('+')) explanations.push('+ = 1 or more times')
    if (pat.includes('?')) explanations.push('? = 0 or 1 time (optional)')
    if (pat.includes('|')) explanations.push('| = OR operator')
    if (pat.includes('[')) explanations.push('[...] = Character class')
    if (pat.includes('(')) explanations.push('(...) = Capture group')

    setExplanation(explanations.join(' • '))
  }

  const toggleFlag = (flag: string) => {
    setFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    )
  }

  const loadPattern = (pat: CommonPattern) => {
    setPattern(pat.pattern)
    setTestString(pat.example)
    toast.success(`Loaded: ${pat.name}`)
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Test Cases Functions
  const addTestCase = () => {
    if (!newTestInput.trim()) {
      toast.error('Enter test input')
      return
    }

    const newCase: TestCase = {
      id: Date.now().toString(),
      input: newTestInput,
      shouldMatch: newTestShouldMatch,
      description: newTestDescription || `Test case ${testCases.length + 1}`
    }

    setTestCases([...testCases, newCase])
    setNewTestInput('')
    setNewTestDescription('')
    toast.success('Test case added!')
  }

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter(tc => tc.id !== id))
    toast.success('Test case removed!')
  }

  const runAllTests = () => {
    if (!pattern) {
      toast.error('Enter a regex pattern first')
      return
    }

    try {
      const flagStr = flags.join('')
      const regex = new RegExp(pattern, flagStr)
      const results: Record<string, boolean> = {}

      testCases.forEach(tc => {
        const hasMatch = regex.test(tc.input)
        results[tc.id] = tc.shouldMatch === hasMatch
      })

      setTestResults(results)

      const passed = Object.values(results).filter(r => r).length
      const total = testCases.length

      if (passed === total) {
        toast.success(`All ${total} tests passed! ✓`)
      } else {
        toast.error(`${passed}/${total} tests passed`)
      }
    } catch (err) {
      toast.error('Invalid regex pattern')
    }
  }

  // Pattern History Functions
  const saveToHistory = () => {
    if (!pattern) {
      toast.error('No pattern to save')
      return
    }

    const newHistory: PatternHistory = {
      id: Date.now().toString(),
      pattern,
      flags,
      name: historyName || `Pattern ${patternHistory.length + 1}`,
      timestamp: Date.now()
    }

    const updated = [newHistory, ...patternHistory].slice(0, 20)
    setPatternHistory(updated)
    localStorage.setItem('regex_pattern_history', JSON.stringify(updated))
    setHistoryName('')
    toast.success('Pattern saved to history!')
  }

  const loadFromHistory = (item: PatternHistory) => {
    setPattern(item.pattern)
    setFlags(item.flags)
    toast.success(`Loaded: ${item.name}`)
  }

  const deleteFromHistory = (id: string) => {
    const updated = patternHistory.filter(h => h.id !== id)
    setPatternHistory(updated)
    localStorage.setItem('regex_pattern_history', JSON.stringify(updated))
    toast.success('Pattern deleted!')
  }

  const clearHistory = () => {
    setPatternHistory([])
    localStorage.removeItem('regex_pattern_history')
    toast.success('History cleared!')
  }

  // Code Generation
  const generateCode = () => {
    const flagStr = flags.join('')
    const escapedPattern = pattern.replace(/\\/g, '\\\\')

    const codes: Record<string, string> = {
      javascript: `// JavaScript
const regex = /${pattern}/${flagStr};
const text = "${testString.replace(/"/g, '\\"')}";
const matches = text.match(regex);
console.log(matches);`,

      python: `# Python
import re

pattern = r'${pattern}'
text = """${testString}"""
matches = re.findall(pattern, text${flags.includes('i') ? ', re.IGNORECASE' : ''}${flags.includes('m') ? ' | re.MULTILINE' : ''})
print(matches)`,

      php: `// PHP
$pattern = '/${pattern}/${flagStr}';
$text = "${testString.replace(/"/g, '\\"')}";
preg_match_all($pattern, $text, $matches);
print_r($matches);`,

      java: `// Java
import java.util.regex.*;

String pattern = "${escapedPattern}";
String text = "${testString.replace(/"/g, '\\"')}";
Pattern regex = Pattern.compile(pattern${flags.includes('i') ? ', Pattern.CASE_INSENSITIVE' : ''});
Matcher matcher = regex.matcher(text);

while (matcher.find()) {
    System.out.println(matcher.group());
}`,

      csharp: `// C#
using System.Text.RegularExpressions;

string pattern = @"${pattern}";
string text = "${testString.replace(/"/g, '\\"')}";
MatchCollection matches = Regex.Matches(text, pattern${flags.includes('i') ? ', RegexOptions.IgnoreCase' : ''});

foreach (Match match in matches) {
    Console.WriteLine(match.Value);
}`,

      go: `// Go
package main

import (
    "fmt"
    "regexp"
)

func main() {
    pattern := \`${pattern}\`
    text := \`${testString}\`
    regex := regexp.MustCompile(pattern)
    matches := regex.FindAllString(text, -1)
    fmt.Println(matches)
}`
    }

    return codes[codeLanguage] || codes.javascript
  }

  // Export Matches
  const exportMatches = (format: 'json' | 'csv' | 'txt') => {
    if (matches.length === 0) {
      toast.error('No matches to export')
      return
    }

    let content = ''
    let mimeType = 'text/plain'
    let extension = 'txt'

    if (format === 'json') {
      content = JSON.stringify(matches, null, 2)
      mimeType = 'application/json'
      extension = 'json'
    } else if (format === 'csv') {
      content = 'Match,Value,Start,End,Groups\n'
      matches.forEach((m, i) => {
        content += `${i + 1},"${m.value}",${m.start},${m.end},"${m.groups.join(', ')}"\n`
      })
      mimeType = 'text/csv'
      extension = 'csv'
    } else {
      content = matches.map((m, i) =>
        `Match ${i + 1}:\nValue: ${m.value}\nPosition: ${m.start}-${m.end}\nGroups: ${m.groups.join(', ')}\n`
      ).join('\n')
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `regex_matches_${Date.now()}.${extension}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${matches.length} matches as ${format.toUpperCase()}!`)
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
          <div className="p-3 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-lg">
            <Code2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ultimate Regex Tester
            </h1>
            <p className="text-muted-foreground mt-1">
              Test • Replace • 20+ Patterns • Test Cases • Code Gen • History • Export
            </p>
          </div>
        </div>

        <Tabs defaultValue="tester" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="tester">Tester</TabsTrigger>
            <TabsTrigger value="testcases">Test Cases</TabsTrigger>
            <TabsTrigger value="codegen">Code Gen</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>

          {/* Main Tester Tab */}
          <TabsContent value="tester">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left - Pattern & Test */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Regex Pattern Tester</CardTitle>
                        <CardDescription>
                          {autoTest ? 'Auto-tests as you type' : 'Click button to test'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={autoTest}
                            onCheckedChange={setAutoTest}
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
                      <Label htmlFor="pattern">Regular Expression</Label>
                      <div className="flex gap-2 mt-2">
                        <span className="text-2xl text-muted-foreground">/</span>
                        <Input
                          id="pattern"
                          value={pattern}
                          onChange={(e) => setPattern(e.target.value)}
                          placeholder="Enter regex pattern... e.g. \d{3}-\d{3}-\d{4}"
                          className="font-mono flex-1"
                        />
                        <span className="text-2xl text-muted-foreground">/</span>
                        <Button onClick={saveToHistory} variant="outline" size="icon" title="Save to history">
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Flags */}
                    <div>
                      <Label>Flags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[
                          { flag: 'g', desc: 'Global' },
                          { flag: 'i', desc: 'Case-insensitive' },
                          { flag: 'm', desc: 'Multiline' },
                          { flag: 's', desc: 'Dotall' },
                          { flag: 'u', desc: 'Unicode' },
                          { flag: 'y', desc: 'Sticky' }
                        ].map(({ flag, desc }) => (
                          <Button
                            key={flag}
                            variant={flags.includes(flag) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleFlag(flag)}
                            title={desc}
                          >
                            {flag}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    {explanation && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-900 dark:text-blue-100">
                          <strong>Pattern Explanation:</strong> {explanation}
                        </p>
                      </div>
                    )}

                    {/* Test String */}
                    <div>
                      <Label htmlFor="testString">Test String</Label>
                      <Textarea
                        id="testString"
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        placeholder="Enter text to test against the regex pattern..."
                        className="font-mono text-sm h-32 mt-2"
                      />
                      {testString && (
                        <Badge variant="outline" className="text-xs mt-2">{testString.length} chars</Badge>
                      )}
                    </div>

                    {!autoTest && (
                      <Button onClick={testRegex} className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
                        <Play className="w-4 h-4 mr-2" />
                        Test Pattern
                      </Button>
                    )}

                    {/* Error */}
                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-900 dark:text-red-100 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </p>
                      </div>
                    )}

                    {/* Results */}
                    {isValid && matches.length >= 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Highlighted Results</Label>
                          <div className="flex items-center gap-2">
                            <Badge>
                              {matches.length} match{matches.length !== 1 ? 'es' : ''}
                            </Badge>
                            {matches.length > 0 && (
                              <div className="flex gap-1">
                                <Button onClick={() => exportMatches('json')} size="sm" variant="outline" title="Export JSON">
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button onClick={() => exportMatches('csv')} size="sm" variant="outline" title="Export CSV">
                                  CSV
                                </Button>
                                <Button onClick={() => exportMatches('txt')} size="sm" variant="outline" title="Export TXT">
                                  TXT
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className="p-4 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap break-words min-h-[100px]"
                          dangerouslySetInnerHTML={{ __html: highlightedText || testString }}
                        />
                      </div>
                    )}

                    {/* Match Details */}
                    {matches.length > 0 && (
                      <div>
                        <Label className="mb-2 block">Match Details</Label>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {matches.map((match, idx) => (
                            <div key={idx} className="p-3 bg-muted rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm">Match {idx + 1}</span>
                                <Badge variant="outline" className="text-xs">
                                  Pos: {match.start}-{match.end}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Value:</span>{' '}
                                  <code className="bg-background px-2 py-1 rounded">{match.value}</code>
                                </div>
                                {match.groups.length > 0 && (
                                  <div>
                                    <span className="text-muted-foreground">Groups:</span>{' '}
                                    {match.groups.map((g, i) => (
                                      <code key={i} className="bg-background px-2 py-1 rounded mr-1">
                                        {g}
                                      </code>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Replace Tool */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Replace className="w-4 h-4" />
                      Find & Replace
                    </CardTitle>
                    <CardDescription>Replace matched patterns with custom text</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="replaceWith">Replace With</Label>
                      <Input
                        id="replaceWith"
                        value={replaceWith}
                        onChange={(e) => setReplaceWith(e.target.value)}
                        placeholder="Replacement text (use $1, $2 for groups)"
                        className="font-mono mt-2"
                      />
                    </div>

                    <Button onClick={performReplace} variant="outline" className="w-full">
                      <Replace className="w-4 h-4 mr-2" />
                      Replace All Matches
                    </Button>

                    {replacedText && (
                      <div>
                        <Label className="mb-2 block">Replaced Text</Label>
                        <div className="relative">
                          <Textarea
                            value={replacedText}
                            readOnly
                            className="font-mono text-sm h-32 bg-muted"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => handleCopy(replacedText)}
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right - Quick Reference */}
              <div>
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Quick Reference</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-3 max-h-[600px] overflow-y-auto">
                    <div>
                      <p className="font-semibold mb-2">Character Classes:</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <code className="bg-muted px-2 py-1 rounded">\d</code>
                          <span className="text-muted-foreground">Digit (0-9)</span>
                        </div>
                        <div className="flex justify-between">
                          <code className="bg-muted px-2 py-1 rounded">\w</code>
                          <span className="text-muted-foreground">Word char</span>
                        </div>
                        <div className="flex justify-between">
                          <code className="bg-muted px-2 py-1 rounded">\s</code>
                          <span className="text-muted-foreground">Whitespace</span>
                        </div>
                        <div className="flex justify-between">
                          <code className="bg-muted px-2 py-1 rounded">.</code>
                          <span className="text-muted-foreground">Any char</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Quantifiers:</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <code className="bg-muted px-2 py-1 rounded">*</code>
                          <span className="text-muted-foreground">0 or more</span>
                        </div>
                        <div className="flex justify-between">
                          <code className="bg-muted px-2 py-1 rounded">+</code>
                          <span className="text-muted-foreground">1 or more</span>
                        </div>
                        <div className="flex justify-between">
                          <code className="bg-muted px-2 py-1 rounded">?</code>
                          <span className="text-muted-foreground">0 or 1</span>
                        </div>
                        <div className="flex justify-between">
                          <code className="bg-muted px-2 py-1 rounded">{'{n,m}'}</code>
                          <span className="text-muted-foreground">Between n-m</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Anchors:</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <code className="bg-muted px-2 py-1 rounded">^</code>
                          <span className="text-muted-foreground">Start of line</span>
                        </div>
                        <div className="flex justify-between">
                          <code className="bg-muted px-2 py-1 rounded">$</code>
                          <span className="text-muted-foreground">End of line</span>
                        </div>
                        <div className="flex justify-between">
                          <code className="bg-muted px-2 py-1 rounded">\b</code>
                          <span className="text-muted-foreground">Word boundary</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Test Cases Tab */}
          <TabsContent value="testcases">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Test Cases Manager
                </CardTitle>
                <CardDescription>Create and run multiple test cases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Test Input</Label>
                    <Input
                      value={newTestInput}
                      onChange={(e) => setNewTestInput(e.target.value)}
                      placeholder="Test string..."
                      className="font-mono mt-2"
                    />
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Input
                      value={newTestDescription}
                      onChange={(e) => setNewTestDescription(e.target.value)}
                      placeholder="Description..."
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Should Match?</Label>
                    <Select value={newTestShouldMatch ? 'yes' : 'no'} onValueChange={(v) => setNewTestShouldMatch(v === 'yes')}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">✓ Should Match</SelectItem>
                        <SelectItem value="no">✗ Should NOT Match</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addTestCase} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Case
                  </Button>
                  <Button onClick={runAllTests} variant="outline" disabled={testCases.length === 0}>
                    <Play className="w-4 h-4 mr-2" />
                    Run All Tests
                  </Button>
                </div>

                {testCases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No test cases yet. Add one above!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {testCases.map((tc) => {
                      const result = testResults[tc.id]
                      const hasResult = result !== undefined

                      return (
                        <div
                          key={tc.id}
                          className={`p-3 border rounded-lg ${hasResult
                            ? result
                              ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                            : 'bg-muted'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{tc.description}</span>
                              <Badge variant={tc.shouldMatch ? 'default' : 'outline'} className="text-xs">
                                {tc.shouldMatch ? '✓ Should Match' : '✗ Should NOT Match'}
                              </Badge>
                              {hasResult && (
                                <Badge variant={result ? 'default' : 'destructive'} className="text-xs">
                                  {result ? '✓ PASS' : '✗ FAIL'}
                                </Badge>
                              )}
                            </div>
                            <Button onClick={() => removeTestCase(tc.id)} size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <code className="text-xs bg-background dark:bg-muted px-2 py-1 rounded block">
                            {tc.input}
                          </code>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Generation Tab */}
          <TabsContent value="codegen">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Code Generator
                </CardTitle>
                <CardDescription>Generate regex code in multiple languages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label>Language:</Label>
                  <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="php">PHP</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {pattern ? (
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono">
                      {generateCode()}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(generateCode())}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Enter a regex pattern in the Tester tab to generate code
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pattern History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Pattern History
                    </CardTitle>
                    <CardDescription>Recent 20 patterns saved</CardDescription>
                  </div>
                  {patternHistory.length > 0 && (
                    <Button onClick={clearHistory} variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={historyName}
                    onChange={(e) => setHistoryName(e.target.value)}
                    placeholder="Pattern name (optional)..."
                  />
                  <Button onClick={saveToHistory} disabled={!pattern}>
                    <Plus className="w-4 h-4 mr-2" />
                    Save Current
                  </Button>
                </div>

                {patternHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No patterns saved yet
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {patternHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {new Date(item.timestamp).toLocaleString()}
                            </Badge>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteFromHistory(item.id)
                              }}
                              size="sm"
                              variant="ghost"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <code className="text-xs bg-muted dark:bg-background px-2 py-1 rounded block">
                          /{item.pattern}/{item.flags.join('')}
                        </code>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Common Patterns Tab */}
          <TabsContent value="patterns">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Common Patterns Library
                </CardTitle>
                <CardDescription>20+ pre-built regex patterns - Click to load</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {commonPatterns.map((pat, idx) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => loadPattern(pat)}
                    >
                      <div className="font-semibold text-sm mb-1">{pat.name}</div>
                      <code className="text-xs bg-muted dark:bg-background px-2 py-1 rounded block mb-2 break-all">
                        {pat.pattern}
                      </code>
                      <p className="text-xs text-muted-foreground">{pat.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Example:</strong> {pat.example}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
