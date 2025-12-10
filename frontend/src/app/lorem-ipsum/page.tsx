'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Copy, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoremIpsumPage() {
  const [paragraphs, setParagraphs] = useState(3)
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50)
  const [generated, setGenerated] = useState('')

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ]

  const generateLorem = () => {
    const result: string[] = []

    for (let i = 0; i < paragraphs; i++) {
      const paragraph: string[] = []
      for (let j = 0; j < wordsPerParagraph; j++) {
        const word = loremWords[Math.floor(Math.random() * loremWords.length)]
        if (j === 0) {
          paragraph.push(word.charAt(0).toUpperCase() + word.slice(1))
        } else {
          paragraph.push(word)
        }
      }
      result.push(paragraph.join(' ') + '.')
    }

    setGenerated(result.join('\n\n'))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated)
  }

  const generateWords = (count: number) => {
    const words: string[] = []
    for (let i = 0; i < count; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
    }
    setGenerated(words.join(' ') + '.')
  }

  const generateSentences = (count: number) => {
    const sentences: string[] = []
    for (let i = 0; i < count; i++) {
      const words: string[] = []
      const sentenceLength = Math.floor(Math.random() * 10) + 5
      for (let j = 0; j < sentenceLength; j++) {
        const word = loremWords[Math.floor(Math.random() * loremWords.length)]
        if (j === 0) {
          words.push(word.charAt(0).toUpperCase() + word.slice(1))
        } else {
          words.push(word)
        }
      }
      sentences.push(words.join(' ') + '.')
    }
    setGenerated(sentences.join(' '))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Lorem Ipsum Generator</h1>
          <p className="text-muted-foreground">
            Generate placeholder text for your designs and mockups
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure generation options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paragraphs">Paragraphs</Label>
                <Input
                  id="paragraphs"
                  type="number"
                  min="1"
                  max="20"
                  value={paragraphs}
                  onChange={(e) => setParagraphs(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="words">Words per Paragraph</Label>
                <Input
                  id="words"
                  type="number"
                  min="10"
                  max="200"
                  value={wordsPerParagraph}
                  onChange={(e) => setWordsPerParagraph(parseInt(e.target.value) || 50)}
                />
              </div>

              <Button onClick={generateLorem} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generate Paragraphs
              </Button>

              <div className="border-t pt-4 space-y-2">
                <Label>Quick Generate</Label>
                <Button onClick={() => generateWords(50)} variant="outline" className="w-full">
                  50 Words
                </Button>
                <Button onClick={() => generateWords(100)} variant="outline" className="w-full">
                  100 Words
                </Button>
                <Button onClick={() => generateSentences(5)} variant="outline" className="w-full">
                  5 Sentences
                </Button>
                <Button onClick={() => generateSentences(10)} variant="outline" className="w-full">
                  10 Sentences
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Generated Text</CardTitle>
              <CardDescription>Your placeholder text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={generated}
                readOnly
                placeholder="Generated text will appear here..."
                className="h-96"
              />

              <Button onClick={copyToClipboard} variant="outline" className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>

              {generated && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-muted-foreground">Characters</div>
                    <div className="text-2xl font-bold">{generated.length}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-muted-foreground">Words</div>
                    <div className="text-2xl font-bold">
                      {generated.split(/\s+/).filter(w => w.length > 0).length}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-muted-foreground">Paragraphs</div>
                    <div className="text-2xl font-bold">
                      {generated.split('\n\n').filter(p => p.length > 0).length}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Lorem Ipsum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              It has been the industry's standard dummy text ever since the 1500s, when an
              unknown printer took a galley of type and scrambled it to make a type specimen book.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

