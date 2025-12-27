'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Palette, Copy, Check, Shuffle, Download, Eye, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

export default function ColorConverterPage() {
  const [hex, setHex] = useState('#3b82f6')
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 })
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 })
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)
  const [shades, setShades] = useState<string[]>([])
  const [complementary, setComplementary] = useState<string[]>([])

  // Color conversion functions
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    } else {
      s = 0
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360
    s /= 100
    l /= 100
    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  }

  const updateFromHex = (newHex: string) => {
    setHex(newHex)
    const rgbVal = hexToRgb(newHex)
    if (rgbVal) {
      setRgb(rgbVal)
      setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b))
    }
  }

  const updateFromRgb = (r: number, g: number, b: number) => {
    setRgb({ r, g, b })
    setHex(rgbToHex(r, g, b))
    setHsl(rgbToHsl(r, g, b))
  }

  const updateFromHsl = (h: number, s: number, l: number) => {
    setHsl({ h, s, l })
    const rgbVal = hslToRgb(h, s, l)
    setRgb(rgbVal)
    setHex(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b))
  }

  const generateShades = () => {
    const shadesArr: string[] = []
    for (let i = 10; i >= 1; i--) {
      const lightness = Math.round((i / 10) * 90 + 5)
      const shade = hslToRgb(hsl.h, hsl.s, lightness)
      shadesArr.push(rgbToHex(shade.r, shade.g, shade.b))
    }
    setShades(shadesArr)
  }

  const generateComplementary = () => {
    const colors: string[] = []

    // Complementary (opposite)
    const comp1 = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l)
    colors.push(rgbToHex(comp1.r, comp1.g, comp1.b))

    // Triadic
    const tri1 = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l)
    const tri2 = hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l)
    colors.push(rgbToHex(tri1.r, tri1.g, tri1.b))
    colors.push(rgbToHex(tri2.r, tri2.g, tri2.b))

    // Analogous
    const ana1 = hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l)
    const ana2 = hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l)
    colors.push(rgbToHex(ana1.r, ana1.g, ana1.b))
    colors.push(rgbToHex(ana2.r, ana2.g, ana2.b))

    setComplementary(colors)
  }

  useEffect(() => {
    generateShades()
    generateComplementary()
  }, [hex])

  const randomColor = () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    updateFromHex(randomHex)
  }

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text)
    setCopiedFormat(format)
    toast.success(`${format} copied!`)
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  const getContrast = (hex1: string, hex2: string) => {
    const rgb1 = hexToRgb(hex1)
    const rgb2 = hexToRgb(hex2)
    if (!rgb1 || !rgb2) return 0

    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(val => {
        val /= 255
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  }

  const contrastWhite = getContrast(hex, '#FFFFFF')
  const contrastBlack = getContrast(hex, '#000000')

  const formats = [
    { name: 'HEX', value: hex.toUpperCase(), code: hex },
    { name: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, code: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { name: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`, code: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
    { name: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, code: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { name: 'HSLA', value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`, code: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)` },
    { name: 'CSS', value: `color: ${hex};`, code: `color: ${hex};` },
    { name: 'CMYK', value: `cmyk(${Math.round((1 - rgb.r / 255) * 100)}, ${Math.round((1 - rgb.g / 255) * 100)}, ${Math.round((1 - rgb.b / 255) * 100)}, 0)`, code: `cmyk(...)` },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-xl shadow-lg">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Advanced Color Converter
              </h1>
              <p className="text-muted-foreground mt-1">
                Convert colors • Generate palettes • Check contrast
              </p>
            </div>
          </div>
          <Button onClick={randomColor} variant="outline">
            <Shuffle className="w-4 h-4 mr-2" />
            Random
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Preview & Picker */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="w-full h-48 rounded-lg border-4 border-border shadow-lg"
                  style={{ backgroundColor: hex }}
                />

                {/* Color Picker */}
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={hex}
                    onChange={(e) => updateFromHex(e.target.value)}
                    className="h-12 w-20 cursor-pointer"
                  />
                  <Input
                    value={hex}
                    onChange={(e) => updateFromHex(e.target.value)}
                    className="font-mono text-lg"
                    placeholder="#000000"
                  />
                </div>

                {/* Sliders */}
                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="flex justify-between text-xs mb-2">
                      <span>Hue: {hsl.h}°</span>
                    </Label>
                    <Slider
                      value={[hsl.h]}
                      onValueChange={(val) => updateFromHsl(val[0], hsl.s, hsl.l)}
                      min={0}
                      max={360}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="flex justify-between text-xs mb-2">
                      <span>Saturation: {hsl.s}%</span>
                    </Label>
                    <Slider
                      value={[hsl.s]}
                      onValueChange={(val) => updateFromHsl(hsl.h, val[0], hsl.l)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="flex justify-between text-xs mb-2">
                      <span>Lightness: {hsl.l}%</span>
                    </Label>
                    <Slider
                      value={[hsl.l]}
                      onValueChange={(val) => updateFromHsl(hsl.h, hsl.s, val[0])}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contrast Checker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Accessibility
                </CardTitle>
                <CardDescription>WCAG contrast ratios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: hex, color: '#FFFFFF' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">White Text</span>
                    <Badge variant={contrastWhite >= 4.5 ? "default" : "destructive"}>
                      {contrastWhite.toFixed(2)}:1
                    </Badge>
                  </div>
                  <p className="text-xs mt-1">
                    {contrastWhite >= 7 ? 'AAA' : contrastWhite >= 4.5 ? 'AA' : 'Fail'}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: hex, color: '#000000' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Black Text</span>
                    <Badge variant={contrastBlack >= 4.5 ? "default" : "destructive"}>
                      {contrastBlack.toFixed(2)}:1
                    </Badge>
                  </div>
                  <p className="text-xs mt-1">
                    {contrastBlack >= 7 ? 'AAA' : contrastBlack >= 4.5 ? 'AA' : 'Fail'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle - Formats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Formats</CardTitle>
                <CardDescription>All format conversions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {formats.map((format) => (
                  <div key={format.name} className="flex items-center gap-2">
                    <Label className="w-16 text-xs font-semibold">{format.name}</Label>
                    <Input
                      value={format.value}
                      readOnly
                      className="font-mono text-sm flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(format.code, format.name)}
                    >
                      {copiedFormat === format.name ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* RGB Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>RGB Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="flex justify-between text-xs mb-2">
                    <span>Red: {rgb.r}</span>
                  </Label>
                  <Slider
                    value={[rgb.r]}
                    onValueChange={(val) => updateFromRgb(val[0], rgb.g, rgb.b)}
                    min={0}
                    max={255}
                    step={1}
                  />
                </div>
                <div>
                  <Label className="flex justify-between text-xs mb-2">
                    <span>Green: {rgb.g}</span>
                  </Label>
                  <Slider
                    value={[rgb.g]}
                    onValueChange={(val) => updateFromRgb(rgb.r, val[0], rgb.b)}
                    min={0}
                    max={255}
                    step={1}
                  />
                </div>
                <div>
                  <Label className="flex justify-between text-xs mb-2">
                    <span>Blue: {rgb.b}</span>
                  </Label>
                  <Slider
                    value={[rgb.b]}
                    onValueChange={(val) => updateFromRgb(rgb.r, rgb.g, val[0])}
                    min={0}
                    max={255}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Palettes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Shades & Tints
                </CardTitle>
                <CardDescription>Lightness variations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {shades.map((shade, idx) => (
                    <div key={idx} className="space-y-1">
                      <div
                        className="h-16 rounded-md border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: shade }}
                        onClick={() => updateFromHex(shade)}
                        title={shade}
                      />
                      <p className="text-[10px] font-mono text-center">{shade.slice(1, 4)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Harmony Colors</CardTitle>
                <CardDescription>Complementary & analogous</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { color: hex, label: 'Base' },
                    { color: complementary[0], label: 'Complement' },
                    { color: complementary[1], label: 'Triadic 1' },
                    { color: complementary[2], label: 'Triadic 2' },
                    { color: complementary[3], label: 'Analogous 1' },
                    { color: complementary[4], label: 'Analogous 2' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div
                        className="h-20 rounded-lg border-2 border-border cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: item.color }}
                        onClick={() => item.color && updateFromHex(item.color)}
                      />
                      <div className="text-center">
                        <p className="text-xs font-semibold">{item.label}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{item.color}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
