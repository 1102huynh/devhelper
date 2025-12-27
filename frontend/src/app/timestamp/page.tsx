'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Clock, Copy, Check, RefreshCw, Calendar as CalendarIcon,
  Globe, Zap, Download, Plus, Minus
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TimestampConverterPage() {
  const [currentTime, setCurrentTime] = useState(0)
  const [timestamp, setTimestamp] = useState('')
  const [datetime, setDatetime] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedTimezone, setSelectedTimezone] = useState('local')
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds')
  const [mounted, setMounted] = useState(false)

  // Set mounted on client
  useEffect(() => {
    setMounted(true)
    setCurrentTime(Math.floor(Date.now() / 1000))
  }, [])

  // Update current time every second
  useEffect(() => {
    if (!mounted) return

    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [mounted])

  // Common timezones
  const timezones = [
    { value: 'local', label: 'Local Time', offset: new Date().getTimezoneOffset() / -60 },
    { value: 'UTC', label: 'UTC (GMT+0)', offset: 0 },
    { value: 'America/New_York', label: 'New York (EST/EDT)', offset: -5 },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: -8 },
    { value: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 1 },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
    { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)', offset: 11 },
  ]

  const formatDateTime = (ts: number, tz: string = selectedTimezone): string => {
    try {
      const date = new Date(ts * 1000)
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: tz === 'local' ? undefined : tz,
        timeZoneName: 'short',
      })
    } catch {
      return 'Invalid timestamp'
    }
  }

  const formatISO = (ts: number): string => {
    try {
      return new Date(ts * 1000).toISOString()
    } catch {
      return 'Invalid timestamp'
    }
  }

  const formatUnix = (ts: number): number => {
    return unit === 'seconds' ? ts : ts * 1000
  }

  const parseToSeconds = (input: string): number => {
    const num = parseInt(input)
    // Auto-detect if milliseconds (13 digits) or seconds (10 digits)
    return input.length >= 13 ? Math.floor(num / 1000) : num
  }

  const getRelativeTime = (ts: number): string => {
    const now = Date.now() / 1000
    const diff = ts - now
    const absDiff = Math.abs(diff)
    const isPast = diff < 0

    if (absDiff < 60) return `${Math.floor(absDiff)} seconds ${isPast ? 'ago' : 'from now'}`
    if (absDiff < 3600) return `${Math.floor(absDiff / 60)} minutes ${isPast ? 'ago' : 'from now'}`
    if (absDiff < 86400) return `${Math.floor(absDiff / 3600)} hours ${isPast ? 'ago' : 'from now'}`
    if (absDiff < 2592000) return `${Math.floor(absDiff / 86400)} days ${isPast ? 'ago' : 'from now'}`
    if (absDiff < 31536000) return `${Math.floor(absDiff / 2592000)} months ${isPast ? 'ago' : 'from now'}`
    return `${Math.floor(absDiff / 31536000)} years ${isPast ? 'ago' : 'from now'}`
  }

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`${label} copied!`)
    setTimeout(() => setCopied(null), 2000)
  }

  const addTime = (seconds: number) => {
    const current = timestamp ? parseToSeconds(timestamp) : currentTime
    setTimestamp(String(current + seconds))
  }

  const downloadFormats = () => {
    const ts = timestamp ? parseToSeconds(timestamp) : currentTime
    const date = new Date(ts * 1000)

    const content = `Timestamp Conversion Report
Generated: ${new Date().toISOString()}

=== INPUT ===
Unix Timestamp (seconds): ${ts}
Unix Timestamp (milliseconds): ${ts * 1000}

=== FORMATS ===
ISO 8601: ${date.toISOString()}
RFC 2822: ${date.toUTCString()}
Local Time: ${date.toLocaleString()}
UTC Time: ${date.toUTCString()}

=== COMPONENTS ===
Year: ${date.getFullYear()}
Month: ${date.getMonth() + 1} (${date.toLocaleString('en-US', { month: 'long' })})
Day: ${date.getDate()}
Day of Week: ${date.getDay()} (${date.toLocaleString('en-US', { weekday: 'long' })})
Hour: ${date.getHours()}
Minute: ${date.getMinutes()}
Second: ${date.getSeconds()}
Millisecond: ${date.getMilliseconds()}

=== TIMEZONES ===
${timezones.map(tz => `${tz.label}: ${formatDateTime(ts, tz.value)}`).join('\n')}

=== RELATIVE ===
${getRelativeTime(ts)}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timestamp_${ts}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report downloaded!')
  }

  const timestampToConvert = timestamp ? parseToSeconds(timestamp) : currentTime

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
            <div className="p-3 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                Advanced Timestamp Converter
              </h1>
              <p className="text-muted-foreground mt-1">
                Unix time • Multiple formats • 10 timezones • Live clock
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Input & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Time */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Live Current Time
                    </CardTitle>
                    <CardDescription>Updates every second</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={unit} onValueChange={(v: 'seconds' | 'milliseconds') => setUnit(v)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seconds">Seconds</SelectItem>
                        <SelectItem value="milliseconds">Milliseconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!mounted ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading current time...
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Unix Timestamp</Label>
                        <div className="flex gap-2">
                          <Input
                            value={formatUnix(currentTime)}
                            readOnly
                            className="font-mono text-2xl font-bold"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleCopy(String(formatUnix(currentTime)), 'Timestamp')}
                          >
                            {copied === 'Timestamp' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">ISO 8601</Label>
                        <div className="flex gap-2">
                          <Input
                            value={formatISO(currentTime)}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleCopy(formatISO(currentTime), 'ISO')}
                          >
                            {copied === 'ISO' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Human Readable</Label>
                      <Input
                        value={formatDateTime(currentTime)}
                        readOnly
                        className="text-sm"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Timestamp Converter */}
            <Card>
              <CardHeader>
                <CardTitle>Timestamp Converter</CardTitle>
                <CardDescription>Enter timestamp to convert (auto-detects seconds/milliseconds)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    placeholder="1735286400 or 1735286400000"
                    className="font-mono flex-1"
                  />
                  <Button onClick={() => setTimestamp(String(currentTime))} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Now
                  </Button>
                </div>

                {/* Quick Adjust */}
                <div>
                  <Label className="text-xs mb-2 block">Quick Adjust</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <Button onClick={() => addTime(-86400)} variant="outline" size="sm">
                      <Minus className="w-3 h-3 mr-1" />
                      1 Day
                    </Button>
                    <Button onClick={() => addTime(-3600)} variant="outline" size="sm">
                      <Minus className="w-3 h-3 mr-1" />
                      1 Hour
                    </Button>
                    <Button onClick={() => addTime(3600)} variant="outline" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      1 Hour
                    </Button>
                    <Button onClick={() => addTime(86400)} variant="outline" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      1 Day
                    </Button>
                  </div>
                </div>

                {/* Converted Results */}
                {timestamp && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 pt-4 border-t"
                  >
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Seconds</Label>
                        <p className="font-mono font-bold">{timestampToConvert}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Milliseconds</Label>
                        <p className="font-mono font-bold">{timestampToConvert * 1000}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">ISO 8601</Label>
                        <p className="font-mono text-xs">{formatISO(timestampToConvert)}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Relative Time</Label>
                        <p className="text-sm font-semibold">{getRelativeTime(timestampToConvert)}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Label className="text-xs text-blue-700 dark:text-blue-400 mb-1 block">Full Date & Time</Label>
                      <p className="text-sm text-blue-900 dark:text-blue-100">{formatDateTime(timestampToConvert)}</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Date to Timestamp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date to Timestamp
                </CardTitle>
                <CardDescription>Convert any date to Unix timestamp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="datetime-local"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (datetime) {
                        const ts = Math.floor(new Date(datetime).getTime() / 1000)
                        setTimestamp(String(ts))
                        toast.success('Converted to timestamp!')
                      }
                    }}
                  >
                    Convert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Timezones */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  World Timezones
                </CardTitle>
                <CardDescription>View time in different zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {timezones.map((tz) => (
                    <div
                      key={tz.value}
                      className={`p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer ${selectedTimezone === tz.value ? 'bg-muted border-primary' : ''
                        }`}
                      onClick={() => setSelectedTimezone(tz.value)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{tz.label}</span>
                        <Badge variant="outline" className="text-xs">
                          GMT{tz.offset >= 0 ? '+' : ''}{tz.offset}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(timestampToConvert, tz.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={downloadFormats} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Formats
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Unix Time</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <p className="text-muted-foreground">
                  Number of seconds since January 1, 1970 00:00:00 UTC (Unix Epoch)
                </p>
                <div>
                  <p className="font-semibold mb-1">Common Formats:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• <strong>Seconds:</strong> 1735286400 (10 digits)</li>
                    <li>• <strong>Milliseconds:</strong> 1735286400000 (13 digits)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
