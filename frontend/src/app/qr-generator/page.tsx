'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import QRCodeLib from 'qrcode'

export default function QrGeneratorPage() {
  const [text, setText] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQR = async () => {
    if (!text) return

    try {
      const url = await QRCodeLib.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(url)

      if (canvasRef.current) {
        await QRCodeLib.toCanvas(canvasRef.current, text, {
          width: 300,
          margin: 2
        })
      }
    } catch (err) {
      console.error('Failed to generate QR code:', err)
    }
  }

  const downloadQR = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = qrCodeUrl
    link.click()
  }

  const examples = [
    { label: 'Website URL', value: 'https://example.com' },
    { label: 'Email', value: 'mailto:example@email.com' },
    { label: 'Phone', value: 'tel:+1234567890' },
    { label: 'WiFi', value: 'WIFI:T:WPA;S:NetworkName;P:Password;;' },
    { label: 'SMS', value: 'sms:+1234567890?body=Hello' },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">QR Code Generator</h1>
          <p className="text-muted-foreground">
            Generate QR codes for URLs, text, and more
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Input</CardTitle>
              <CardDescription>Enter text or URL to encode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Text or URL</Label>
                <Input
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text, URL, or data"
                />
              </div>

              <Button onClick={generateQR} className="w-full">
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
              </Button>

              <div className="space-y-2">
                <Label>Quick Examples</Label>
                {examples.map((example, index) => (
                  <Button
                    key={index}
                    onClick={() => setText(example.value)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {example.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated QR Code</CardTitle>
              <CardDescription>Scan with your device</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center items-center min-h-[300px] bg-muted rounded-lg">
                {qrCodeUrl ? (
                  <canvas ref={canvasRef} />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <QrCode className="h-16 w-16 mx-auto mb-2 opacity-50" />
                    <p>QR code will appear here</p>
                  </div>
                )}
              </div>

              {qrCodeUrl && (
                <Button onClick={downloadQR} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>QR Code Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">URL</h4>
                <code className="text-xs bg-muted p-2 rounded block">https://example.com</code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Email</h4>
                <code className="text-xs bg-muted p-2 rounded block">mailto:user@example.com</code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Phone</h4>
                <code className="text-xs bg-muted p-2 rounded block">tel:+1234567890</code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">WiFi</h4>
                <code className="text-xs bg-muted p-2 rounded block">WIFI:T:WPA;S:SSID;P:Pass;;</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

