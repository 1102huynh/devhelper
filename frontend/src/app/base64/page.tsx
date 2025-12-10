'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Binary, Copy, ArrowRightLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Base64Page() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const handleEncode = () => {
    if (!input.trim()) {
      toast.error('Please enter text to encode')
      return
    }
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
      toast.success('Text encoded successfully')
    } catch (error) {
      toast.error('Failed to encode text')
    }
  }

  const handleDecode = () => {
    if (!input.trim()) {
      toast.error('Please enter Base64 to decode')
      return
    }
    try {
      const decoded = decodeURIComponent(escape(atob(input)))
      setOutput(decoded)
      toast.success('Base64 decoded successfully')
    } catch (error) {
      toast.error('Invalid Base64 string')
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

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Binary className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-bold">Base64 Encoder/Decoder</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Encode text to Base64 or decode Base64 to text
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
                  <CardTitle>Plain Text</CardTitle>
                  <CardDescription>Enter text to encode</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter text here..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <Button onClick={handleEncode} className="w-full">
                    Encode to Base64
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Base64 Output</CardTitle>
                      <CardDescription>Encoded result</CardDescription>
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
                    placeholder="Encoded Base64 will appear here..."
                    className="min-h-[300px] font-mono text-sm bg-muted"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="decode">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Base64 Input</CardTitle>
                  <CardDescription>Enter Base64 to decode</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter Base64 string here..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <Button onClick={handleDecode} className="w-full">
                    Decode from Base64
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Plain Text Output</CardTitle>
                      <CardDescription>Decoded result</CardDescription>
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
                    placeholder="Decoded text will appear here..."
                    className="min-h-[300px] font-mono text-sm bg-muted"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Base64</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Base64 is a binary-to-text encoding scheme that represents binary data in ASCII string format.</p>
            <div className="mt-4">
              <p className="font-semibold mb-2">Common Use Cases:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Embedding images in HTML/CSS (data URLs)</li>
                <li>Encoding binary data in JSON/XML</li>
                <li>Basic authentication headers</li>
                <li>Email attachments (MIME)</li>
                <li>Storing binary data in text-based systems</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

