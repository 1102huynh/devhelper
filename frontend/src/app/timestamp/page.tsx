'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Clock, Copy, RefreshCw } from 'lucide-react'

export default function TimestampConverterPage() {
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000))
  const [timestamp, setTimestamp] = useState('')
  const [datetime, setDatetime] = useState('')
  const [convertedDate, setConvertedDate] = useState('')
  const [convertedTimestamp, setConvertedTimestamp] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatDateTime = (ts: number): string => {
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
        timeZoneName: 'short',
      })
    } catch {
      return 'Invalid timestamp'
    }
  }

  const formatISO = (ts: number): string => {
    try {
      const date = new Date(ts * 1000)
      return date.toISOString()
    } catch {
      return 'Invalid timestamp'
    }
  }

  const handleTimestampToDate = () => {
    const ts = parseInt(timestamp)
    if (isNaN(ts)) {
      toast.error('Invalid timestamp')
      return
    }

    const date = new Date(ts * 1000)
    const formatted = `
Local: ${date.toLocaleString()}
UTC: ${date.toUTCString()}
ISO: ${date.toISOString()}
Relative: ${getRelativeTime(ts)}
    `.trim()

    setConvertedDate(formatted)
    toast.success('Timestamp converted')
  }

  const handleDateToTimestamp = () => {
    if (!datetime) {
      toast.error('Please enter a date/time')
      return
    }

    try {
      const date = new Date(datetime)
      if (isNaN(date.getTime())) {
        toast.error('Invalid date format')
        return
      }

      const ts = Math.floor(date.getTime() / 1000)
      setConvertedTimestamp(`${ts}`)
      toast.success('Date converted to timestamp')
    } catch {
      toast.error('Invalid date format')
    }
  }

  const getRelativeTime = (ts: number): string => {
    const now = Date.now() / 1000
    const diff = Math.abs(now - ts)

    if (diff < 60) return `${Math.floor(diff)} seconds ${ts > now ? 'from now' : 'ago'}`
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ${ts > now ? 'from now' : 'ago'}`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ${ts > now ? 'from now' : 'ago'}`
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ${ts > now ? 'from now' : 'ago'}`
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ${ts > now ? 'from now' : 'ago'}`
    return `${Math.floor(diff / 31536000)} years ${ts > now ? 'from now' : 'ago'}`
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  const loadCurrentTime = () => {
    const now = Math.floor(Date.now() / 1000)
    setTimestamp(now.toString())
    handleTimestampToDate()
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
            <Clock className="w-8 h-8 text-teal-500" />
            <h1 className="text-4xl font-bold">Timestamp Converter</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Convert between Unix timestamps and human-readable dates
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Time</CardTitle>
              <CardDescription>Live Unix timestamp and date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Unix Timestamp</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={currentTime}
                      readOnly
                      className="font-mono text-lg font-bold"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCopy(currentTime.toString())}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Current Date/Time</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={formatDateTime(currentTime)}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCopy(formatDateTime(currentTime))}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">ISO 8601</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={formatISO(currentTime)}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy(formatISO(currentTime))}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamp to Date</CardTitle>
              <CardDescription>Convert Unix timestamp to human-readable date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timestamp">Unix Timestamp</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="timestamp"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    placeholder="1638360000"
                    className="font-mono"
                  />
                  <Button onClick={loadCurrentTime} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Now
                  </Button>
                  <Button onClick={handleTimestampToDate}>
                    Convert
                  </Button>
                </div>
              </div>
              {convertedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <Label>Converted Date</Label>
                  <div className="flex gap-2">
                    <pre className="flex-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                      {convertedDate}
                    </pre>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCopy(convertedDate)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date to Timestamp</CardTitle>
              <CardDescription>Convert date/time to Unix timestamp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="datetime">Date and Time</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                  />
                  <Button onClick={handleDateToTimestamp}>
                    Convert
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Or enter any date format: "2024-12-10", "Dec 10, 2024", etc.
                </p>
              </div>
              {convertedTimestamp && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <Label>Unix Timestamp</Label>
                  <div className="flex gap-2">
                    <Input
                      value={convertedTimestamp}
                      readOnly
                      className="font-mono text-lg font-bold"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCopy(convertedTimestamp)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Unix Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                Unix timestamp (also known as Epoch time) is the number of seconds that have elapsed since 00:00:00 UTC on January 1, 1970.
              </p>
              <div>
                <p className="font-semibold mb-2">Common Use Cases:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Storing dates in databases</li>
                  <li>API date/time parameters</li>
                  <li>Comparing dates across timezones</li>
                  <li>Date calculations and sorting</li>
                  <li>Log timestamps</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Formats:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Seconds</strong>: 1638360000 (10 digits)</li>
                  <li><strong>Milliseconds</strong>: 1638360000000 (13 digits)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

