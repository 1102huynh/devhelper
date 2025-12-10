'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Database, Copy, Check, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TestDataGeneratorPage() {
  const [count, setCount] = useState(5)
  const [generatedData, setGeneratedData] = useState('')
  const [copied, setCopied] = useState(false)
  const [dataType, setDataType] = useState('email')

  const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'test.com', 'example.com', 'mail.com']
  const streets = ['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Lake', 'Hill', 'Park']
  const streetTypes = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Way', 'Ct', 'Pl']
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'MI', 'WA']

  const generateEmail = () => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase()
    const domain = domains[Math.floor(Math.random() * domains.length)]
    const separator = Math.random() > 0.5 ? '.' : '_'
    const number = Math.random() > 0.7 ? Math.floor(Math.random() * 999) : ''
    return `${firstName}${separator}${lastName}${number}@${domain}`
  }

  const generateName = () => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    return `${firstName} ${lastName}`
  }

  const generatePhone = () => {
    const areaCode = Math.floor(Math.random() * 900) + 100
    const prefix = Math.floor(Math.random() * 900) + 100
    const lineNumber = Math.floor(Math.random() * 9000) + 1000
    return `(${areaCode}) ${prefix}-${lineNumber}`
  }

  const generateAddress = () => {
    const number = Math.floor(Math.random() * 9999) + 1
    const street = streets[Math.floor(Math.random() * streets.length)]
    const type = streetTypes[Math.floor(Math.random() * streetTypes.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const state = states[Math.floor(Math.random() * states.length)]
    const zip = Math.floor(Math.random() * 90000) + 10000
    return `${number} ${street} ${type}, ${city}, ${state} ${zip}`
  }

  const generateUsername = () => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase()
    const number = Math.floor(Math.random() * 9999)
    return `${firstName}${lastName}${number}`
  }

  const generatePassword = () => {
    const length = 12
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const generateCreditCard = () => {
    // Generate fake credit card (Luhn algorithm compliant)
    let cardNumber = '4' // Visa prefix
    for (let i = 0; i < 14; i++) {
      cardNumber += Math.floor(Math.random() * 10)
    }
    // Add check digit
    let sum = 0
    let isEven = true
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i])
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return cardNumber + checkDigit
  }

  const generateCompany = () => {
    const prefixes = ['Tech', 'Global', 'Digital', 'Smart', 'Innovative', 'Advanced', 'Future', 'Prime']
    const suffixes = ['Solutions', 'Systems', 'Technologies', 'Industries', 'Group', 'Corp', 'Inc', 'Labs']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    return `${prefix} ${suffix}`
  }

  const generateData = () => {
    const data = []
    for (let i = 0; i < count; i++) {
      switch (dataType) {
        case 'email':
          data.push(generateEmail())
          break
        case 'name':
          data.push(generateName())
          break
        case 'phone':
          data.push(generatePhone())
          break
        case 'address':
          data.push(generateAddress())
          break
        case 'username':
          data.push(generateUsername())
          break
        case 'password':
          data.push(generatePassword())
          break
        case 'creditcard':
          data.push(generateCreditCard())
          break
        case 'company':
          data.push(generateCompany())
          break
        case 'all':
          data.push(JSON.stringify({
            name: generateName(),
            email: generateEmail(),
            phone: generatePhone(),
            address: generateAddress(),
            username: generateUsername(),
            company: generateCompany()
          }, null, 2))
          break
      }
    }
    setGeneratedData(dataType === 'all' ? data.join(',\n') : data.join('\n'))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const dataTypes = [
    { value: 'email', label: 'Email' },
    { value: 'name', label: 'Name' },
    { value: 'phone', label: 'Phone' },
    { value: 'address', label: 'Address' },
    { value: 'username', label: 'Username' },
    { value: 'password', label: 'Password' },
    { value: 'creditcard', label: 'Credit Card' },
    { value: 'company', label: 'Company' },
    { value: 'all', label: 'All (JSON)' }
  ]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Test Data Generator</h1>
            <p className="text-muted-foreground">Generate realistic test data for automation testing</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Select data type and quantity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Data Type</Label>
                <Tabs value={dataType} onValueChange={setDataType} className="mt-2">
                  <TabsList className="grid grid-cols-3 h-auto">
                    {dataTypes.map((type) => (
                      <TabsTrigger
                        key={type.value}
                        value={type.value}
                        className="text-xs py-2"
                      >
                        {type.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <Label htmlFor="count">Number of Records</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={generateData}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Data</CardTitle>
              <CardDescription>Copy and use in your tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Textarea
                  value={generatedData}
                  readOnly
                  placeholder="Generated data will appear here..."
                  className="font-mono text-sm min-h-[300px]"
                />
                <Button
                  onClick={copyToClipboard}
                  disabled={!generatedData}
                  className="w-full"
                  variant="outline"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Usage Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Email Addresses:</strong> Realistic email formats with common domains</p>
            <p>• <strong>Phone Numbers:</strong> US format with area codes</p>
            <p>• <strong>Credit Cards:</strong> Luhn algorithm compliant (for testing only)</p>
            <p>• <strong>Complete User Data:</strong> JSON format with all fields for easy integration</p>
            <p className="text-amber-600 dark:text-amber-500">⚠️ This data is randomly generated and should only be used for testing purposes</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

