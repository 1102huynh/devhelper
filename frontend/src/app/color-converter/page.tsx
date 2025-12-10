'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Palette, Copy } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ColorConverterPage() {
  const [hex, setHex] = useState('#3b82f6')
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 })
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 })

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
      const hex = x.toString(16)
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
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
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

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Color Converter</h1>
          <p className="text-muted-foreground">
            Convert between HEX, RGB, and HSL color formats
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Color Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="w-full h-64 rounded-lg border-2 border-border"
                style={{ backgroundColor: hex }}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>HEX</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={hex}
                    onChange={(e) => updateFromHex(e.target.value)}
                    placeholder="#000000"
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(hex)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>RGB</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>R</Label>
                    <Input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.r}
                      onChange={(e) => updateFromRgb(parseInt(e.target.value) || 0, rgb.g, rgb.b)}
                    />
                  </div>
                  <div>
                    <Label>G</Label>
                    <Input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.g}
                      onChange={(e) => updateFromRgb(rgb.r, parseInt(e.target.value) || 0, rgb.b)}
                    />
                  </div>
                  <div>
                    <Label>B</Label>
                    <Input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.b}
                      onChange={(e) => updateFromRgb(rgb.r, rgb.g, parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HSL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>H</Label>
                    <Input
                      type="number"
                      min="0"
                      max="360"
                      value={hsl.h}
                      onChange={(e) => updateFromHsl(parseInt(e.target.value) || 0, hsl.s, hsl.l)}
                    />
                  </div>
                  <div>
                    <Label>S</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={hsl.s}
                      onChange={(e) => updateFromHsl(hsl.h, parseInt(e.target.value) || 0, hsl.l)}
                    />
                  </div>
                  <div>
                    <Label>L</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={hsl.l}
                      onChange={(e) => updateFromHsl(hsl.h, hsl.s, parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

