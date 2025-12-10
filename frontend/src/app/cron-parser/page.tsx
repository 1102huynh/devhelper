'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/lib/api'

export default function CronParserPage() {
  const [expression, setExpression] = useState('0 0 * * *')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const examples = [
    { expr: '* * * * *', desc: 'Every minute' },
    { expr: '0 * * * *', desc: 'Every hour' },
    { expr: '0 0 * * *', desc: 'Every day at midnight' },
    { expr: '0 9 * * 1', desc: 'Every Monday at 9:00 AM' },
    { expr: '*/5 * * * *', desc: 'Every 5 minutes' },
    { expr: '0 0 1 * *', desc: 'First day of every month' },
    { expr: '0 0 * * 0', desc: 'Every Sunday at midnight' },
    { expr: '30 2 * * *', desc: 'Every day at 2:30 AM' },
  ]

  const parseCron = async () => {
    try {
      setError('')
      const response = await api.post('/api/cron/parse', { expression })
      setDescription(response.data.description)
      if (!response.data.valid) {
        setError(response.data.error)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to parse cron expression')
      setDescription('')
    }
  }

  const useExample = (expr: string) => {
    setExpression(expr)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Cron Expression Parser</h1>
          <p className="text-muted-foreground">
            Parse and understand cron expressions
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Cron Expression</CardTitle>
              <CardDescription>Enter a cron expression to parse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expression">Expression</Label>
                <Input
                  id="expression"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="0 0 * * *"
                  className="font-mono"
                />
              </div>

              <Button onClick={parseCron} className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Parse Expression
              </Button>

              {description && (
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-md">
                  <h3 className="font-semibold mb-2">Description:</h3>
                  <p className="text-sm">{description}</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold">Cron Format:</h3>
                <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
{`* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of Week (0-6, Sunday=0)
│ │ │ └─── Month (1-12)
│ │ └───── Day of Month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Examples</CardTitle>
              <CardDescription>Click to use an example</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    onClick={() => useExample(example.expr)}
                    className="p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors"
                  >
                    <code className="font-mono text-sm font-semibold">{example.expr}</code>
                    <p className="text-sm text-muted-foreground mt-1">{example.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

