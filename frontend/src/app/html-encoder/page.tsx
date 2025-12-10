'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Code } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HtmlEncoderPage() {
  const [input, setInput] = useState('')
  const [encoded, setEncoded] = useState('')
  const [decoded, setDecoded] = useState('')

  const encodeHtml = () => {
    const div = document.createElement('div')
    div.textContent = input
    setEncoded(div.innerHTML)
  }

  const decodeHtml = () => {
    const div = document.createElement('div')
    div.innerHTML = input
    setDecoded(div.textContent || '')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const entities = [
    { char: '<', entity: '&lt;', code: '&#60;' },
    { char: '>', entity: '&gt;', code: '&#62;' },
    { char: '&', entity: '&amp;', code: '&#38;' },
    { char: '"', entity: '&quot;', code: '&#34;' },
    { char: "'", entity: '&apos;', code: '&#39;' },
    { char: ' ', entity: '&nbsp;', code: '&#160;' },
    { char: '©', entity: '&copy;', code: '&#169;' },
    { char: '®', entity: '&reg;', code: '&#174;' },
    { char: '€', entity: '&euro;', code: '&#8364;' },
    { char: '™', entity: '&trade;', code: '&#8482;' },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">HTML Encoder/Decoder</h1>
          <p className="text-muted-foreground">
            Encode and decode HTML entities
          </p>
        </div>

        <Tabs defaultValue="encode" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Plain Text</CardTitle>
                  <CardDescription>Enter text to encode</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="<div>Hello & Welcome</div>"
                    className="font-mono h-64"
                  />
                  <Button onClick={encodeHtml} className="w-full">
                    <Code className="mr-2 h-4 w-4" />
                    Encode HTML
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Encoded HTML</CardTitle>
                  <CardDescription>HTML entities output</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={encoded}
                    readOnly
                    placeholder="Encoded HTML will appear here"
                    className="font-mono h-64"
                  />
                  <Button
                    onClick={() => copyToClipboard(encoded)}
                    variant="outline"
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="decode" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>HTML Entities</CardTitle>
                  <CardDescription>Enter HTML entities to decode</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="&lt;div&gt;Hello &amp; Welcome&lt;/div&gt;"
                    className="font-mono h-64"
                  />
                  <Button onClick={decodeHtml} className="w-full">
                    <Code className="mr-2 h-4 w-4" />
                    Decode HTML
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Decoded Text</CardTitle>
                  <CardDescription>Plain text output</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={decoded}
                    readOnly
                    placeholder="Decoded text will appear here"
                    className="font-mono h-64"
                  />
                  <Button
                    onClick={() => copyToClipboard(decoded)}
                    variant="outline"
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Common HTML Entities</CardTitle>
            <CardDescription>Quick reference for frequently used entities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Character</th>
                    <th className="text-left p-2">Named Entity</th>
                    <th className="text-left p-2">Numeric Code</th>
                  </tr>
                </thead>
                <tbody>
                  {entities.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-mono text-lg">{item.char}</td>
                      <td className="p-2 font-mono">{item.entity}</td>
                      <td className="p-2 font-mono">{item.code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

