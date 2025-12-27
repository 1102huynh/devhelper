'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Calendar, Clock, Copy, Check, AlertCircle, PlayCircle,
  Sparkles, Hash, Timer, Code
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import cronstrue from 'cronstrue'

export default function CronParserPage() {
  const [expression, setExpression] = useState('0 9 * * 1-5')
  const [description, setDescription] = useState('')
  const [nextRuns, setNextRuns] = useState<Date[]>([])
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Builder state
  const [minute, setMinute] = useState('0')
  const [hour, setHour] = useState('9')
  const [dayOfMonth, setDayOfMonth] = useState('*')
  const [month, setMonth] = useState('*')
  const [dayOfWeek, setDayOfWeek] = useState('1-5')

  // Parse cron expression
  useEffect(() => {
    try {
      // Get human-readable description using cronstrue
      const desc = cronstrue.toString(expression, {
        use24HourTimeFormat: true,
        verbose: true
      })
      setDescription(desc)

      // Generate next 10 approximate run times (simplified)
      const runs: Date[] = []
      const now = new Date()

      // Simple estimation based on hour and minute
      const parts = expression.split(' ')
      const minutePart = parts[0] || '0'
      const hourPart = parts[1] || '0'

      // Parse minute and hour (simplified - only handles numbers and *)
      const minutes = minutePart === '*' ? [0] : [parseInt(minutePart.replace(/\*/g, '0').split('/')[0])]
      const hours = hourPart === '*' ? Array.from({ length: 24 }, (_, i) => i) : [parseInt(hourPart.replace(/\*/g, '0').split('/')[0])]

      // Generate next runs
      for (let day = 0; day < 30 && runs.length < 10; day++) {
        for (let h of hours) {
          for (let m of minutes) {
            const date = new Date(now)
            date.setDate(date.getDate() + day)
            date.setHours(h, m, 0, 0)

            if (date > now && runs.length < 10) {
              runs.push(date)
            }
          }
        }
      }

      setNextRuns(runs)
      setIsValid(true)
      setError('')
    } catch (err: any) {
      setIsValid(false)
      setError(err.message || 'Invalid cron expression')
      setDescription('')
      setNextRuns([])
    }
  }, [expression])

  // Build expression from components
  useEffect(() => {
    const built = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
    setExpression(built)
  }, [minute, hour, dayOfMonth, month, dayOfWeek])

  const copyExpression = () => {
    navigator.clipboard.writeText(expression)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const presets = [
    { name: 'Every minute', expr: '* * * * *', category: 'Common' },
    { name: 'Every 5 minutes', expr: '*/5 * * * *', category: 'Common' },
    { name: 'Every 15 minutes', expr: '*/15 * * * *', category: 'Common' },
    { name: 'Every 30 minutes', expr: '*/30 * * * *', category: 'Common' },
    { name: 'Every hour', expr: '0 * * * *', category: 'Common' },
    { name: 'Every 2 hours', expr: '0 */2 * * *', category: 'Common' },
    { name: 'Every 6 hours', expr: '0 */6 * * *', category: 'Common' },
    { name: 'Every 12 hours', expr: '0 */12 * * *', category: 'Common' },

    { name: 'Every day at midnight', expr: '0 0 * * *', category: 'Daily' },
    { name: 'Every day at 9 AM', expr: '0 9 * * *', category: 'Daily' },
    { name: 'Every day at 5 PM', expr: '0 17 * * *', category: 'Daily' },
    { name: 'Every day at noon', expr: '0 12 * * *', category: 'Daily' },
    { name: 'Twice daily (9 AM, 6 PM)', expr: '0 9,18 * * *', category: 'Daily' },

    { name: 'Weekdays at 9 AM', expr: '0 9 * * 1-5', category: 'Weekly' },
    { name: 'Every Monday at 9 AM', expr: '0 9 * * 1', category: 'Weekly' },
    { name: 'Every Friday at 5 PM', expr: '0 17 * * 5', category: 'Weekly' },
    { name: 'Every Sunday at midnight', expr: '0 0 * * 0', category: 'Weekly' },
    { name: 'Every weekend at 10 AM', expr: '0 10 * * 0,6', category: 'Weekly' },

    { name: 'First day of month at midnight', expr: '0 0 1 * *', category: 'Monthly' },
    { name: 'Last day of month at 11 PM', expr: '0 23 L * *', category: 'Monthly' },
    { name: '15th of month at noon', expr: '0 12 15 * *', category: 'Monthly' },
    { name: 'Every 1st and 15th at 9 AM', expr: '0 9 1,15 * *', category: 'Monthly' },

    { name: 'January 1st at midnight', expr: '0 0 1 1 *', category: 'Yearly' },
    { name: 'Every quarter (Jan, Apr, Jul, Oct)', expr: '0 0 1 1,4,7,10 *', category: 'Yearly' },
    { name: 'First Monday of January', expr: '0 0 * 1 1#1', category: 'Yearly' },
  ]

  const categories = ['Common', 'Daily', 'Weekly', 'Monthly', 'Yearly']

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`
    return `in ${seconds} second${seconds > 1 ? 's' : ''}`
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl shadow-lg">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Advanced Cron Expression Tool
            </h1>
            <p className="text-muted-foreground mt-1">
              Parse, build & validate • Next 10 runs • Visual builder
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Expression Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Cron Expression
                </CardTitle>
                <CardDescription>Enter or build your cron expression</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="0 9 * * 1-5"
                    className={`font-mono text-lg flex-1 ${isValid ? 'border-green-500' : 'border-red-500'}`}
                  />
                  <Button onClick={copyExpression} variant="outline">
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {isValid && description && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <PlayCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100">Human Readable:</h3>
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1">{description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!isValid && error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-red-900 dark:text-red-100">Invalid Expression</h3>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Format Guide */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Cron Format
                  </h3>
                  <pre className="text-xs font-mono overflow-x-auto">
                    {`┌────────── Minute (0-59)
│ ┌──────── Hour (0-23)
│ │ ┌────── Day of Month (1-31)
│ │ │ ┌──── Month (1-12)
│ │ │ │ ┌── Day of Week (0-6, Sun=0)
│ │ │ │ │
* * * * *

Special Characters:
*  = any value
,  = value list (1,3,5)
-  = range (1-5)
/  = step values (*/5)
L  = last (day/week)
#  = nth occurrence (1#2)`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Visual Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Visual Builder
                </CardTitle>
                <CardDescription>Build expression using dropdowns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <Label className="text-xs mb-2 block">Minute</Label>
                    <Input
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                      placeholder="*"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">0-59</p>
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block">Hour</Label>
                    <Input
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      placeholder="*"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">0-23</p>
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block">Day</Label>
                    <Input
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(e.target.value)}
                      placeholder="*"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">1-31</p>
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block">Month</Label>
                    <Input
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      placeholder="*"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">1-12</p>
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block">Weekday</Label>
                    <Input
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      placeholder="*"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">0-6</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <Label className="text-xs mb-2 block">Quick Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => { setMinute('*'); setHour('*'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*'); }} variant="outline" size="sm">
                      Every minute
                    </Button>
                    <Button onClick={() => { setMinute('0'); setHour('*'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*'); }} variant="outline" size="sm">
                      Every hour
                    </Button>
                    <Button onClick={() => { setMinute('0'); setHour('0'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*'); }} variant="outline" size="sm">
                      Every day
                    </Button>
                    <Button onClick={() => { setMinute('0'); setHour('9'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('1-5'); }} variant="outline" size="sm">
                      Weekdays 9AM
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Run Times */}
            {isValid && nextRuns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Next 10 Executions
                  </CardTitle>
                  <CardDescription>Upcoming scheduled times</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {nextRuns.map((date, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 justify-center">
                            #{idx + 1}
                          </Badge>
                          <div>
                            <p className="font-mono text-sm font-semibold">{formatDate(date)}</p>
                            <p className="text-xs text-muted-foreground">{getRelativeTime(date)}</p>
                          </div>
                        </div>
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right - Presets */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Common Presets</CardTitle>
                <CardDescription>Click to use</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="Common">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="Common">Common</TabsTrigger>
                    <TabsTrigger value="Daily">Daily</TabsTrigger>
                    <TabsTrigger value="Weekly">Week</TabsTrigger>
                  </TabsList>

                  {categories.map(category => (
                    <TabsContent key={category} value={category} className="space-y-2 max-h-96 overflow-y-auto">
                      {presets
                        .filter(p => p.category === category)
                        .map((preset, idx) => (
                          <div
                            key={idx}
                            onClick={() => setExpression(preset.expr)}
                            className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                          >
                            <code className="font-mono text-xs font-semibold text-primary">
                              {preset.expr}
                            </code>
                            <p className="text-sm text-muted-foreground mt-1">{preset.name}</p>
                          </div>
                        ))}
                    </TabsContent>
                  ))}

                  <TabsContent value="Monthly" className="space-y-2 max-h-96 overflow-y-auto">
                    {presets
                      .filter(p => p.category === 'Monthly')
                      .map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => setExpression(preset.expr)}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        >
                          <code className="font-mono text-xs font-semibold text-primary">
                            {preset.expr}
                          </code>
                          <p className="text-sm text-muted-foreground mt-1">{preset.name}</p>
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="Yearly" className="space-y-2 max-h-96 overflow-y-auto">
                    {presets
                      .filter(p => p.category === 'Yearly')
                      .map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => setExpression(preset.expr)}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        >
                          <code className="font-mono text-xs font-semibold text-primary">
                            {preset.expr}
                          </code>
                          <p className="text-sm text-muted-foreground mt-1">{preset.name}</p>
                        </div>
                      ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
