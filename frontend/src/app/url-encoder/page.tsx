'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Link2, Copy, ArrowRightLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function UrlEncoderPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const handleEncode = () => {
    if (!input.trim()) {
      toast.error('Please enter text to encode')
      return
    }
    try {
      const encoded = encodeURIComponent(input)
      setOutput(encoded)
      toast.success('URL encoded successfully')
    } catch (error) {
      toast.error('Failed to encode URL')
    }
  }

  const handleDecode = () => {
    if (!input.trim()) {
      toast.error('Please enter URL to decode')
      return
    }
    try {
      const decoded = decodeURIComponent(input)
      setOutput(decoded)
      toast.success('URL decoded successfully')
    } catch (error) {
      toast.error('Invalid URL encoding')
    }
  }

  const handleEncodeURI = () => {
    if (!input.trim()) {
      toast.error('Please enter URL to encode')
      return
    }
    try {
      const encoded = encodeURI(input)
      setOutput(encoded)
      toast.success('URL encoded successfully (encodeURI)')
    } catch (error) {
      toast.error('Failed to encode URL')
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
  }

  const sampleUrls = {
    query: 'https://example.com?name=John Doe&email=john@example.com',
    path: 'https://example.com/path with spaces/file.html',
    special: 'Hello World! How are you? #awesome',
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
            <Link2 className="w-8 h-8 text-cyan-500" />
            <h1 className="text-4xl font-bold">URL Encoder/Decoder</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Encode and decode URLs and query parameters
          </p>
        </div>

        <Tabs defaultValue="encode">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
          </TabsList>

          <TabsContent value="encode">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Input</CardTitle>
                  <CardDescription>Enter text or URL to encode</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter URL or text here..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="grid grid-cols-1 gap-2">
                    <Button onClick={handleEncode} className="w-full">
                      Encode (encodeURIComponent)
                    </Button>
                    <Button onClick={handleEncodeURI} variant="outline" className="w-full">
                      Encode URI (encodeURI)
                    </Button>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Quick samples:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setInput(sampleUrls.query)}
                        className="text-xs"
                      >
                        Query String
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setInput(sampleUrls.path)}
                        className="text-xs"
                      >
                        Path with Spaces
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setInput(sampleUrls.special)}
                        className="text-xs"
                      >
                        Special Characters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Encoded Output</CardTitle>
                      <CardDescription>URL-safe result</CardDescription>
                    </div>
                    {output && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleSwap}>
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          Swap
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCopy(output)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={output}
                    readOnly
                    placeholder="Encoded URL will appear here..."
                    className="min-h-[200px] font-mono text-sm bg-muted"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="decode">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Encoded Input</CardTitle>
                  <CardDescription>Enter encoded URL to decode</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter encoded URL here..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <Button onClick={handleDecode} className="w-full">
                    Decode URL
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Decoded Output</CardTitle>
                      <CardDescription>Human-readable result</CardDescription>
                    </div>
                    {output && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleSwap}>
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          Swap
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCopy(output)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={output}
                    readOnly
                    placeholder="Decoded URL will appear here..."
                    className="min-h-[200px] font-mono text-sm bg-muted"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>URL Encoding Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div>
              <p className="font-semibold mb-2">encodeURIComponent vs encodeURI:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>encodeURIComponent</strong>: Encodes all special characters including / ? : @ & = + $ #</li>
                <li><strong>encodeURI</strong>: Preserves URL structure characters like / ? : @ & = + $ #</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Common Use Cases:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Encoding query parameter values</li>
                <li>Encoding form data</li>
                <li>Making URLs safe for sharing</li>
                <li>Encoding special characters in API requests</li>
              </ul>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-semibold mb-1">Example:</p>
              <p className="text-xs font-mono">Input: Hello World!</p>
              <p className="text-xs font-mono">Output: Hello%20World%21</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

