'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QrCode, Download, History, Trash2, Link2, Mail, Phone, Wifi, CreditCard, MapPin, Calendar, FileText, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCodeLib from 'qrcode'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

interface QRHistory {
  id: string
  type: string
  content: string
  timestamp: number
}

export default function QrGeneratorPage() {
  const [text, setText] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [qrType, setQrType] = useState('text')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Customization options
  const [size, setSize] = useState(300)
  const [margin, setMargin] = useState(2)
  const [darkColor, setDarkColor] = useState('#000000')
  const [lightColor, setLightColor] = useState('#FFFFFF')
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')

  // History
  const [history, setHistory] = useState<QRHistory[]>([])

  // vCard fields
  const [vCard, setVCard] = useState({
    name: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    address: ''
  })

  // WiFi fields
  const [wifi, setWifi] = useState({
    ssid: '',
    password: '',
    encryption: 'WPA'
  })

  // Event fields
  const [event, setEvent] = useState({
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    description: ''
  })

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('qr_history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load history')
      }
    }
  }, [])

  const generateQR = async () => {
    let content = ''

    // Build content based on type
    switch (qrType) {
      case 'text':
      case 'url':
        content = text
        break
      case 'email':
        content = `mailto:${text}`
        break
      case 'phone':
        content = `tel:${text}`
        break
      case 'sms':
        content = `sms:${text}`
        break
      case 'wifi':
        content = `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};;`
        break
      case 'vcard':
        content = `BEGIN:VCARD
VERSION:3.0
FN:${vCard.name}
ORG:${vCard.organization}
TITLE:${vCard.title}
TEL:${vCard.phone}
EMAIL:${vCard.email}
URL:${vCard.website}
ADR:;;${vCard.address};;;;
END:VCARD`
        break
      case 'event':
        content = `BEGIN:VEVENT
SUMMARY:${event.title}
LOCATION:${event.location}
DTSTART:${event.startDate.replace(/[-:]/g, '')}
DTEND:${event.endDate.replace(/[-:]/g, '')}
DESCRIPTION:${event.description}
END:VEVENT`
        break
      default:
        content = text
    }

    if (!content.trim()) {
      toast.error('Please enter content to generate QR code')
      return
    }

    try {
      const url = await QRCodeLib.toDataURL(content, {
        width: size,
        margin: margin,
        color: {
          dark: darkColor,
          light: lightColor
        },
        errorCorrectionLevel: errorCorrectionLevel
      })
      setQrCodeUrl(url)

      if (canvasRef.current) {
        await QRCodeLib.toCanvas(canvasRef.current, content, {
          width: size,
          margin: margin,
          color: {
            dark: darkColor,
            light: lightColor
          },
          errorCorrectionLevel: errorCorrectionLevel
        })
      }

      // Add to history
      const historyItem: QRHistory = {
        id: String(Date.now()),
        type: qrType,
        content: content.length > 100 ? content.substring(0, 100) + '...' : content,
        timestamp: Date.now()
      }
      const newHistory = [historyItem, ...history].slice(0, 20) // Keep last 20
      setHistory(newHistory)
      localStorage.setItem('qr_history', JSON.stringify(newHistory))

      toast.success('QR Code generated successfully!')
    } catch (err) {
      console.error('Failed to generate QR code:', err)
      toast.error('Failed to generate QR code')
    }
  }

  const downloadQR = (format: 'png' | 'svg' | 'jpg' = 'png') => {
    if (!qrCodeUrl) return

    if (format === 'svg') {
      // Generate SVG
      if (canvasRef.current) {
        const content = text || wifi.ssid || vCard.name || event.title
        QRCodeLib.toString(content, {
          type: 'svg',
          width: size,
          margin: margin,
          color: {
            dark: darkColor,
            light: lightColor
          }
        }).then((svg) => {
          const blob = new Blob([svg], { type: 'image/svg+xml' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `qrcode_${Date.now()}.svg`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
          toast.success('SVG downloaded!')
        })
      }
    } else {
      // PNG or JPG
      const link = document.createElement('a')
      link.download = `qrcode_${Date.now()}.${format}`
      link.href = qrCodeUrl
      link.click()
      toast.success(`${format.toUpperCase()} downloaded!`)
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('qr_history')
    toast.success('History cleared')
  }

  const loadFromHistory = (item: QRHistory) => {
    setQrType(item.type)
    setText(item.content)
    toast.success('Loaded from history')
  }

  const templates = [
    {
      icon: Link2,
      label: 'URL',
      type: 'url',
      example: 'https://example.com',
      description: 'Create QR code for website links'
    },
    {
      icon: Mail,
      label: 'Email',
      type: 'email',
      example: 'contact@example.com',
      description: 'Email address with optional subject'
    },
    {
      icon: Phone,
      label: 'Phone',
      type: 'phone',
      example: '+1234567890',
      description: 'Phone number for quick dialing'
    },
    {
      icon: Wifi,
      label: 'WiFi',
      type: 'wifi',
      example: '',
      description: 'WiFi network credentials'
    },
    {
      icon: User,
      label: 'vCard',
      type: 'vcard',
      example: '',
      description: 'Contact information card'
    },
    {
      icon: Calendar,
      label: 'Event',
      type: 'event',
      example: '',
      description: 'Calendar event details'
    },
    {
      icon: FileText,
      label: 'Text',
      type: 'text',
      example: 'Any text content',
      description: 'Plain text or custom data'
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl shadow-lg">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Professional QR Code Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              Create customizable QR codes • vCard, WiFi, Events & more
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Panel - Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select QR Code Type</CardTitle>
                <CardDescription>Choose what kind of QR code to create</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {templates.map((template) => {
                    const Icon = template.icon
                    return (
                      <Button
                        key={template.type}
                        variant={qrType === template.type ? "default" : "outline"}
                        className="h-auto py-4 flex flex-col gap-2"
                        onClick={() => setQrType(template.type)}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{template.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Content Input */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code Content</CardTitle>
                <CardDescription>
                  {templates.find(t => t.type === qrType)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={qrType} onValueChange={setQrType}>
                  <TabsContent value="text" className="space-y-4">
                    <div>
                      <Label>Text Content</Label>
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter any text..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <div>
                      <Label>Website URL</Label>
                      <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="https://example.com"
                        type="url"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="email" className="space-y-4">
                    <div>
                      <Label>Email Address</Label>
                      <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="contact@example.com"
                        type="email"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-4">
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="+1234567890"
                        type="tel"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="sms" className="space-y-4">
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="+1234567890"
                        type="tel"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="wifi" className="space-y-4">
                    <div>
                      <Label>Network Name (SSID)</Label>
                      <Input
                        value={wifi.ssid}
                        onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                        placeholder="MyWiFi"
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input
                        value={wifi.password}
                        onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                        placeholder="password123"
                        type="password"
                      />
                    </div>
                    <div>
                      <Label>Encryption</Label>
                      <Select value={wifi.encryption} onValueChange={(val) => setWifi({ ...wifi, encryption: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WPA">WPA/WPA2</SelectItem>
                          <SelectItem value="WEP">WEP</SelectItem>
                          <SelectItem value="nopass">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="vcard" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          value={vCard.name}
                          onChange={(e) => setVCard({ ...vCard, name: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label>Organization</Label>
                        <Input
                          value={vCard.organization}
                          onChange={(e) => setVCard({ ...vCard, organization: e.target.value })}
                          placeholder="Company Inc."
                        />
                      </div>
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          value={vCard.title}
                          onChange={(e) => setVCard({ ...vCard, title: e.target.value })}
                          placeholder="Manager"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={vCard.phone}
                          onChange={(e) => setVCard({ ...vCard, phone: e.target.value })}
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={vCard.email}
                          onChange={(e) => setVCard({ ...vCard, email: e.target.value })}
                          placeholder="john@example.com"
                          type="email"
                        />
                      </div>
                      <div>
                        <Label>Website</Label>
                        <Input
                          value={vCard.website}
                          onChange={(e) => setVCard({ ...vCard, website: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={vCard.address}
                        onChange={(e) => setVCard({ ...vCard, address: e.target.value })}
                        placeholder="123 Main St, City, Country"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="event" className="space-y-4">
                    <div>
                      <Label>Event Title</Label>
                      <Input
                        value={event.title}
                        onChange={(e) => setEvent({ ...event, title: e.target.value })}
                        placeholder="Team Meeting"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={event.location}
                        onChange={(e) => setEvent({ ...event, location: e.target.value })}
                        placeholder="Conference Room A"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date & Time</Label>
                        <Input
                          value={event.startDate}
                          onChange={(e) => setEvent({ ...event, startDate: e.target.value })}
                          type="datetime-local"
                        />
                      </div>
                      <div>
                        <Label>End Date & Time</Label>
                        <Input
                          value={event.endDate}
                          onChange={(e) => setEvent({ ...event, endDate: e.target.value })}
                          type="datetime-local"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={event.description}
                        onChange={(e) => setEvent({ ...event, description: e.target.value })}
                        placeholder="Event details..."
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button onClick={generateQR} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500">
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>

            {/* Customization */}
            <Card>
              <CardHeader>
                <CardTitle>Customization</CardTitle>
                <CardDescription>Adjust appearance and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Size: {size}px</Label>
                    <Slider
                      value={[size]}
                      onValueChange={(val) => setSize(val[0])}
                      min={150}
                      max={600}
                      step={50}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Margin: {margin}</Label>
                    <Slider
                      value={[margin]}
                      onValueChange={(val) => setMargin(val[0])}
                      min={0}
                      max={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Foreground Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        className="h-10 w-16"
                      />
                      <Input
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="h-10 w-16"
                      />
                      <Input
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Error Correction</Label>
                    <Select value={errorCorrectionLevel} onValueChange={(val: any) => setErrorCorrectionLevel(val)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview & History */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code Preview</CardTitle>
                <CardDescription>Scan with your device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center items-center min-h-[300px] bg-muted rounded-lg p-4">
                  {qrCodeUrl ? (
                    <canvas ref={canvasRef} className="max-w-full" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <QrCode className="h-16 w-16 mx-auto mb-2 opacity-50" />
                      <p>QR code will appear here</p>
                    </div>
                  )}
                </div>

                {qrCodeUrl && (
                  <div className="space-y-2">
                    <Label>Download Format</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button onClick={() => downloadQR('png')} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        PNG
                      </Button>
                      <Button onClick={() => downloadQR('jpg')} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        JPG
                      </Button>
                      <Button onClick={() => downloadQR('svg')} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        SVG
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      History
                    </CardTitle>
                    <CardDescription>Recent QR codes</CardDescription>
                  </div>
                  {history.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No history yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="capitalize">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm truncate">{item.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
