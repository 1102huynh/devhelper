'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Database, Copy, Check, RefreshCw, Download, Settings2,
  Globe, Calendar, Hash, MapPin, CreditCard, Building2,
  User, Lock, Phone, Mail, FileText, Car, Shield, Package
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

// Seeded random number generator for reproducibility
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  nextInt(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }
}

export default function TestDataGeneratorPage() {
  const [count, setCount] = useState(10)
  const [generatedData, setGeneratedData] = useState<any[]>([])
  const [displayData, setDisplayData] = useState('')
  const [copied, setCopied] = useState(false)
  const [dataType, setDataType] = useState('email')
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'sql' | 'text'>('text')
  const [useSeed, setUseSeed] = useState(false)
  const [seed, setSeed] = useState(12345)
  const [tableName, setTableName] = useState('test_data')
  const [autoPreview, setAutoPreview] = useState(true)
  const [country, setCountry] = useState<'US' | 'VN' | 'UK' | 'JP' | 'FR' | 'DE'>('US')

  // Country-specific data
  const countryData = {
    US: {
      firstNames: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Emily', 'Emma', 'Olivia', 'Ava', 'Isabella'],
      lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Walker', 'Hall', 'Allen', 'Young'],
      cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Seattle', 'Denver', 'Boston', 'Miami'],
      states: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'MI', 'WA', 'CO', 'MA'],
      phoneFormat: (rng: any) => {
        const areaCode = rng.nextInt(200, 999)
        const prefix = rng.nextInt(200, 999)
        const lineNumber = rng.nextInt(1000, 9999)
        return `+1 (${areaCode}) ${prefix}-${lineNumber}`
      },
      zipFormat: (rng: any) => rng.nextInt(10000, 99999).toString(),
      flag: '🇺🇸'
    },
    VN: {
      firstNames: ['Minh', 'Anh', 'Thu', 'Hương', 'Linh', 'Quân', 'Dũng', 'Hà', 'Mai', 'Tuấn', 'Phương', 'Ngọc', 'Hùng', 'Lan', 'Trang', 'Bảo', 'Long', 'Nam', 'Thảo', 'Hải'],
      lastNames: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'],
      cities: ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Biên Hòa', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Buôn Ma Thuột', 'Quy Nhơn', 'Đà Lạt'],
      states: ['HN', 'HCM', 'DN', 'HP', 'CT', 'BD', 'NT', 'HUE', 'VT', 'BMT', 'QN', 'DL'],
      phoneFormat: (rng: any) => {
        const prefix = rng.choice(['090', '091', '093', '094', '097', '098', '096', '032', '033', '034', '035', '036', '037', '038', '039'])
        const number = rng.nextInt(1000000, 9999999)
        return `+84 ${prefix} ${number.toString().slice(0, 3)} ${number.toString().slice(3)}`
      },
      zipFormat: (rng: any) => rng.nextInt(100000, 999999).toString(),
      flag: '🇻🇳'
    },
    UK: {
      firstNames: ['Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Charlie', 'Thomas', 'Oscar', 'William', 'James', 'Amelia', 'Olivia', 'Emily', 'Isla', 'Ava', 'Jessica', 'Lily', 'Sophie', 'Grace', 'Mia'],
      lastNames: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green'],
      cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh', 'Leicester', 'Nottingham'],
      states: ['LDN', 'MAN', 'BIR', 'LDS', 'GLA', 'LIV', 'NEW', 'SHF', 'BRS', 'EDI', 'LEI', 'NOT'],
      phoneFormat: (rng: any) => {
        const area = rng.choice(['020', '0131', '0161', '0113', '0141'])
        const number = rng.nextInt(10000000, 99999999)
        return `+44 ${area} ${number.toString().slice(0, 4)} ${number.toString().slice(4)}`
      },
      zipFormat: (rng: any) => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        return `${letters[rng.nextInt(0, 25)]}${letters[rng.nextInt(0, 25)]}${rng.nextInt(1, 9)} ${rng.nextInt(1, 9)}${letters[rng.nextInt(0, 25)]}${letters[rng.nextInt(0, 25)]}`
      },
      flag: '🇬🇧'
    },
    JP: {
      firstNames: ['Yuki', 'Haruto', 'Sota', 'Yui', 'Hina', 'Aoi', 'Sakura', 'Ren', 'Mei', 'Kaito', 'Akari', 'Riku', 'Himari', 'Minato', 'Airi', 'Haruka', 'Yuto', 'Hinata', 'Sora', 'Mio'],
      lastNames: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato', 'Yoshida', 'Yamada', 'Sasaki', 'Yamaguchi', 'Matsumoto'],
      cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Hiroshima', 'Sendai', 'Kawasaki', 'Saitama'],
      states: ['TYO', 'OSA', 'KYO', 'YOK', 'NGO', 'SAP', 'FUK', 'KOB', 'HIR', 'SEN', 'KAW', 'SAI'],
      phoneFormat: (rng: any) => {
        const area = rng.choice(['03', '06', '075', '045', '052', '011'])
        const number = rng.nextInt(10000000, 99999999)
        return `+81 ${area} ${number.toString().slice(0, 4)} ${number.toString().slice(4)}`
      },
      zipFormat: (rng: any) => `${rng.nextInt(100, 999)}-${rng.nextInt(1000, 9999)}`,
      flag: '🇯🇵'
    },
    FR: {
      firstNames: ['Louis', 'Lucas', 'Gabriel', 'Jules', 'Raphaël', 'Arthur', 'Emma', 'Léa', 'Chloé', 'Manon', 'Camille', 'Marie', 'Sarah', 'Océane', 'Laura', 'Julie', 'Mathis', 'Hugo', 'Nathan', 'Tom'],
      lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia'],
      cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims'],
      states: ['PAR', 'MAR', 'LYO', 'TOU', 'NIC', 'NAN', 'STR', 'MON', 'BOR', 'LIL', 'REN', 'REI'],
      phoneFormat: (rng: any) => {
        const number = rng.nextInt(100000000, 999999999)
        const str = number.toString()
        return `+33 ${str[0]} ${str.slice(1, 3)} ${str.slice(3, 5)} ${str.slice(5, 7)} ${str.slice(7)}`
      },
      zipFormat: (rng: any) => rng.nextInt(10000, 99999).toString(),
      flag: '🇫🇷'
    },
    DE: {
      firstNames: ['Ben', 'Jonas', 'Leon', 'Finn', 'Noah', 'Elias', 'Mia', 'Emma', 'Hannah', 'Sofia', 'Anna', 'Lena', 'Leonie', 'Marie', 'Lina', 'Paul', 'Lukas', 'Felix', 'Maximilian', 'Alexander'],
      lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Schröder'],
      cities: ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden'],
      states: ['BER', 'HAM', 'MUN', 'KOL', 'FRA', 'STU', 'DUS', 'DOR', 'ESS', 'LEI', 'BRE', 'DRE'],
      phoneFormat: (rng: any) => {
        const area = rng.choice(['030', '040', '089', '0221', '069'])
        const number = rng.nextInt(10000000, 99999999)
        return `+49 ${area} ${number.toString().slice(0, 4)} ${number.toString().slice(4)}`
      },
      zipFormat: (rng: any) => rng.nextInt(10000, 99999).toString(),
      flag: '🇩🇪'
    }
  }

  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'test.com', 'example.com', 'mail.com', 'protonmail.com', 'icloud.com']
  const streets = ['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Lake', 'Hill', 'Park', 'River', 'Forest', 'Spring', 'Valley', 'First', 'Second', 'Third', 'Market', 'Church']
  const streetTypes = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Way', 'Ct', 'Pl', 'Ter']
  const tlds = ['.com', '.org', '.net', '.io', '.co', '.dev', '.app', '.tech']
  const productAdjectives = ['Premium', 'Ultra', 'Pro', 'Deluxe', 'Advanced', 'Smart', 'Digital', 'Portable', 'Wireless', 'HD']
  const productNouns = ['Laptop', 'Phone', 'Tablet', 'Camera', 'Speaker', 'Headset', 'Monitor', 'Keyboard', 'Mouse', 'Charger']
  const carMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Nissan', 'Volkswagen']
  const loremWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua']

  const getRandom = () => {
    if (useSeed) {
      return new SeededRandom(seed)
    }
    return {
      next: () => Math.random(),
      nextInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
      choice: <T,>(array: T[]) => array[Math.floor(Math.random() * array.length)]
    }
  }

  const generateUUID = (rng: any) => {
    const hex = '0123456789abcdef'
    let uuid = ''
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-'
      } else if (i === 14) {
        uuid += '4'
      } else if (i === 19) {
        uuid += hex[rng.nextInt(8, 11)]
      } else {
        uuid += hex[rng.nextInt(0, 15)]
      }
    }
    return uuid
  }

  const generateDate = (rng: any) => {
    const start = new Date(1950, 0, 1)
    const end = new Date(2005, 11, 31)
    const date = new Date(start.getTime() + rng.next() * (end.getTime() - start.getTime()))
    return date.toISOString().split('T')[0]
  }

  const generateDateTime = (rng: any) => {
    const start = new Date(2020, 0, 1)
    const end = new Date()
    const date = new Date(start.getTime() + rng.next() * (end.getTime() - start.getTime()))
    return date.toISOString()
  }

  const generateURL = (rng: any) => {
    const protocols = ['https://', 'http://']
    const subdomains = ['www.', 'api.', 'app.', 'dev.', '']
    const names = ['example', 'test', 'demo', 'sample', 'mysite', 'webapp', 'portal']

    const protocol = rng.choice(protocols)
    const subdomain = rng.choice(subdomains)
    const name = rng.choice(names)
    const tld = rng.choice(tlds)

    return `${protocol}${subdomain}${name}${tld}`
  }

  const generateIPv4 = (rng: any) => {
    return `${rng.nextInt(1, 255)}.${rng.nextInt(0, 255)}.${rng.nextInt(0, 255)}.${rng.nextInt(1, 255)}`
  }

  const generateIPv6 = (rng: any) => {
    const hex = '0123456789abcdef'
    const segments = []
    for (let i = 0; i < 8; i++) {
      let segment = ''
      for (let j = 0; j < 4; j++) {
        segment += hex[rng.nextInt(0, 15)]
      }
      segments.push(segment)
    }
    return segments.join(':')
  }

  const generateLorem = (rng: any, wordCount = 10) => {
    const words = []
    for (let i = 0; i < wordCount; i++) {
      words.push(rng.choice(loremWords))
    }
    const sentence = words.join(' ')
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
  }

  const generateSSN = (rng: any) => {
    const area = rng.nextInt(100, 899)
    const group = rng.nextInt(10, 99)
    const serial = rng.nextInt(1000, 9999)
    return `${area}-${group}-${serial}`
  }

  const generateVIN = (rng: any) => {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'
    let vin = ''
    for (let i = 0; i < 17; i++) {
      vin += chars[rng.nextInt(0, chars.length - 1)]
    }
    return vin
  }

  const generateLicensePlate = (rng: any) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const format = rng.choice(['AAA-9999', 'AAA-999', '9AAA999', 'AA-99999'])

    return format.split('').map((char: string) => {
      if (char === 'A') return letters[rng.nextInt(0, letters.length - 1)]
      if (char === '9') return rng.nextInt(0, 9).toString()
      return char
    }).join('')
  }

  const generateProduct = (rng: any) => {
    const adj = rng.choice(productAdjectives)
    const noun = rng.choice(productNouns)
    const model = rng.nextInt(1000, 9999)
    return `${adj} ${noun} ${model}`
  }

  const generateEmail = (rng: any) => {
    const data = countryData[country]
    const firstName = rng.choice(data.firstNames).toLowerCase()
    const lastName = rng.choice(data.lastNames).toLowerCase()
    const domain = rng.choice(domains)
    const separator = rng.next() > 0.5 ? '.' : '_'
    const number = rng.next() > 0.7 ? rng.nextInt(1, 999) : ''
    return `${firstName}${separator}${lastName}${number}@${domain}`
  }

  const generateName = (rng: any) => {
    const data = countryData[country]
    const firstName = rng.choice(data.firstNames)
    const lastName = rng.choice(data.lastNames)
    return `${firstName} ${lastName}`
  }

  const generatePhone = (rng: any) => {
    const data = countryData[country]
    return data.phoneFormat(rng)
  }

  const generateAddress = (rng: any) => {
    const data = countryData[country]
    const number = rng.nextInt(1, 9999)
    const street = rng.choice(streets)
    const type = rng.choice(streetTypes)
    const city = rng.choice(data.cities)
    const state = rng.choice(data.states)
    const zip = data.zipFormat(rng)
    return `${number} ${street} ${type}, ${city}, ${state} ${zip}`
  }

  const generateUsername = (rng: any) => {
    const data = countryData[country]
    const firstName = rng.choice(data.firstNames).toLowerCase()
    const lastName = rng.choice(data.lastNames).toLowerCase()
    const number = rng.nextInt(1, 9999)
    return `${firstName}${lastName}${number}`
  }

  const generatePassword = (rng: any) => {
    const length = 16
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars.charAt(rng.nextInt(0, chars.length - 1))
    }
    return password
  }

  const generateCreditCard = (rng: any) => {
    let cardNumber = '4'
    for (let i = 0; i < 14; i++) {
      cardNumber += rng.nextInt(0, 9)
    }
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
    const full = cardNumber + checkDigit
    return `${full.slice(0, 4)} ${full.slice(4, 8)} ${full.slice(8, 12)} ${full.slice(12)}`
  }

  const generateCompany = (rng: any) => {
    const prefixes = ['Tech', 'Global', 'Digital', 'Smart', 'Innovative', 'Advanced', 'Future', 'Prime', 'Next', 'Meta']
    const suffixes = ['Solutions', 'Systems', 'Technologies', 'Industries', 'Group', 'Corp', 'Inc', 'Labs', 'Ventures', 'Dynamics']
    const prefix = rng.choice(prefixes)
    const suffix = rng.choice(suffixes)
    return `${prefix} ${suffix}`
  }

  const generateData = () => {
    const rng = getRandom()
    const data: any[] = []

    for (let i = 0; i < count; i++) {
      let item: any

      switch (dataType) {
        case 'email':
          item = generateEmail(rng)
          break
        case 'name':
          item = generateName(rng)
          break
        case 'phone':
          item = generatePhone(rng)
          break
        case 'address':
          item = generateAddress(rng)
          break
        case 'username':
          item = generateUsername(rng)
          break
        case 'password':
          item = generatePassword(rng)
          break
        case 'creditcard':
          item = generateCreditCard(rng)
          break
        case 'company':
          item = generateCompany(rng)
          break
        case 'uuid':
          item = generateUUID(rng)
          break
        case 'date':
          item = generateDate(rng)
          break
        case 'datetime':
          item = generateDateTime(rng)
          break
        case 'url':
          item = generateURL(rng)
          break
        case 'ipv4':
          item = generateIPv4(rng)
          break
        case 'ipv6':
          item = generateIPv6(rng)
          break
        case 'lorem':
          item = generateLorem(rng, 15)
          break
        case 'ssn':
          item = generateSSN(rng)
          break
        case 'vin':
          item = generateVIN(rng)
          break
        case 'license':
          item = generateLicensePlate(rng)
          break
        case 'product':
          item = generateProduct(rng)
          break
        case 'user':
          item = {
            id: i + 1,
            uuid: generateUUID(rng),
            name: generateName(rng),
            username: generateUsername(rng),
            email: generateEmail(rng),
            phone: generatePhone(rng),
            address: generateAddress(rng),
            company: generateCompany(rng),
            birthdate: generateDate(rng),
            created_at: generateDateTime(rng)
          }
          break
      }

      data.push(item)
    }

    setGeneratedData(data)
    formatOutput(data)
  }

  const formatOutput = (data: any[]) => {
    if (data.length === 0) {
      setDisplayData('')
      return
    }

    let output = ''

    switch (exportFormat) {
      case 'json':
        if (dataType === 'user') {
          output = JSON.stringify(data, null, 2)
        } else {
          output = JSON.stringify(data, null, 2)
        }
        break

      case 'csv':
        if (dataType === 'user') {
          const headers = Object.keys(data[0]).join(',')
          const rows = data.map(item =>
            Object.values(item).map(val =>
              typeof val === 'string' && val.includes(',') ? `"${val}"` : val
            ).join(',')
          )
          output = [headers, ...rows].join('\n')
        } else {
          output = data.join('\n')
        }
        break

      case 'sql':
        if (dataType === 'user') {
          const columns = Object.keys(data[0]).join(', ')
          const inserts = data.map(item => {
            const values = Object.values(item).map(val =>
              typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val
            ).join(', ')
            return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`
          })
          output = inserts.join('\n')
        } else {
          const inserts = data.map((item, idx) =>
            `INSERT INTO ${tableName} (id, value) VALUES (${idx + 1}, '${item.toString().replace(/'/g, "''")}');`
          )
          output = inserts.join('\n')
        }
        break

      case 'text':
      default:
        if (dataType === 'user') {
          output = data.map(item => JSON.stringify(item, null, 2)).join('\n\n')
        } else {
          output = data.join('\n')
        }
        break
    }

    setDisplayData(output)
  }

  useEffect(() => {
    if (autoPreview && generatedData.length > 0) {
      formatOutput(generatedData)
    }
  }, [exportFormat, tableName])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadData = () => {
    const extension = exportFormat === 'text' ? 'txt' : exportFormat
    const blob = new Blob([displayData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test_data_${dataType}_${Date.now()}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const dataTypes = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'name', label: 'Name', icon: User },
    { value: 'phone', label: 'Phone', icon: Phone },
    { value: 'address', label: 'Address', icon: MapPin },
    { value: 'username', label: 'Username', icon: User },
    { value: 'password', label: 'Password', icon: Lock },
    { value: 'creditcard', label: 'Credit Card', icon: CreditCard },
    { value: 'company', label: 'Company', icon: Building2 },
    { value: 'uuid', label: 'UUID', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'datetime', label: 'DateTime', icon: Calendar },
    { value: 'url', label: 'URL', icon: Globe },
    { value: 'ipv4', label: 'IPv4', icon: Globe },
    { value: 'ipv6', label: 'IPv6', icon: Globe },
    { value: 'lorem', label: 'Lorem Ipsum', icon: FileText },
    { value: 'ssn', label: 'SSN', icon: Shield },
    { value: 'vin', label: 'VIN', icon: Car },
    { value: 'license', label: 'License Plate', icon: Car },
    { value: 'product', label: 'Product', icon: Package },
    { value: 'user', label: 'Complete User', icon: User }
  ]

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl shadow-lg">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Advanced Test Data Generator
              </h1>
              <p className="text-muted-foreground mt-1">Generate realistic test data with multiple export formats</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Configuration
              </CardTitle>
              <CardDescription>Customize your test data generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Type Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Data Type</Label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Country/Locale Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Country / Locale</Label>
                <Select value={country} onValueChange={(val: any) => setCountry(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">
                      <div className="flex items-center gap-2">
                        <span>{countryData.US.flag}</span>
                        United States
                      </div>
                    </SelectItem>
                    <SelectItem value="VN">
                      <div className="flex items-center gap-2">
                        <span>{countryData.VN.flag}</span>
                        Vietnam
                      </div>
                    </SelectItem>
                    <SelectItem value="UK">
                      <div className="flex items-center gap-2">
                        <span>{countryData.UK.flag}</span>
                        United Kingdom
                      </div>
                    </SelectItem>
                    <SelectItem value="JP">
                      <div className="flex items-center gap-2">
                        <span>{countryData.JP.flag}</span>
                        Japan
                      </div>
                    </SelectItem>
                    <SelectItem value="FR">
                      <div className="flex items-center gap-2">
                        <span>{countryData.FR.flag}</span>
                        France
                      </div>
                    </SelectItem>
                    <SelectItem value="DE">
                      <div className="flex items-center gap-2">
                        <span>{countryData.DE.flag}</span>
                        Germany
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Affects names, phone numbers, addresses, and postal codes
                </p>
              </div>

              {/* Count */}
              <div className="space-y-2">
                <Label htmlFor="count" className="text-sm font-semibold">
                  Number of Records
                </Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                />
              </div>

              {/* Export Format */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Export Format</Label>
                <Select value={exportFormat} onValueChange={(val: any) => setExportFormat(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="sql">SQL INSERT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table Name for SQL */}
              {exportFormat === 'sql' && (
                <div className="space-y-2">
                  <Label htmlFor="tableName" className="text-sm font-semibold">
                    Table Name
                  </Label>
                  <Input
                    id="tableName"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="test_data"
                  />
                </div>
              )}

              {/* Seed Options */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="useSeed" className="text-sm font-semibold cursor-pointer">
                    Use Seed (Reproducible)
                  </Label>
                  <Switch
                    id="useSeed"
                    checked={useSeed}
                    onCheckedChange={setUseSeed}
                  />
                </div>
                {useSeed && (
                  <Input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value) || 1)}
                    placeholder="Enter seed number"
                  />
                )}
              </div>

              {/* Auto Preview */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <Label htmlFor="autoPreview" className="text-sm font-semibold cursor-pointer">
                  Auto Preview Format
                </Label>
                <Switch
                  id="autoPreview"
                  checked={autoPreview}
                  onCheckedChange={setAutoPreview}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateData}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white shadow-lg"
                size="lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Generate Data
              </Button>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Data</CardTitle>
                  <CardDescription>
                    {generatedData.length > 0 ? `${generatedData.length} records generated` : 'Your generated data will appear here'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    disabled={!displayData}
                    variant="outline"
                    size="sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={downloadData}
                    disabled={!displayData}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  value={displayData}
                  readOnly
                  placeholder="Configure settings and click 'Generate Data' to create test data..."
                  className="font-mono text-xs min-h-[600px] resize-none"
                />
                <AnimatePresence>
                  {displayData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg"
                    >
                      ✓ Ready
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card className="border-purple-200 dark:border-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-500" />
                6 Countries Supported
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate authentic data for US, Vietnam, UK, Japan, France, and Germany
              </p>
            </CardContent>
          </Card>

          <Card className="border-pink-200 dark:border-pink-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-500" />
                Multiple Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export as JSON, CSV, SQL, or plain text for any use case
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="w-4 h-4 text-orange-500" />
                Reproducible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use seed values to generate the same data set every time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Guide */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Usage Guide & Examples</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-purple-600 dark:text-purple-400">🌍 Multi-Country Support</p>
              <p className="text-muted-foreground">Generate locale-specific data for US 🇺🇸, Vietnam 🇻🇳, UK 🇬🇧, Japan 🇯🇵, France 🇫🇷, and Germany 🇩🇪 with authentic names, phone formats, and addresses</p>

              <p className="font-semibold text-pink-600 dark:text-pink-400 mt-4">� Email & Personal Data</p>
              <p className="text-muted-foreground">Culture-appropriate names, realistic phone numbers with correct country codes, and localized addresses</p>

              <p className="font-semibold text-orange-600 dark:text-orange-400 mt-4">🌐 Network & URLs</p>
              <p className="text-muted-foreground">Generate IPv4, IPv6 addresses, and realistic URLs for API testing</p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-blue-600 dark:text-blue-400">📅 Dates & IDs</p>
              <p className="text-muted-foreground">Create UUIDs, dates, timestamps for database seeding</p>

              <p className="font-semibold text-green-600 dark:text-green-400 mt-4">🚗 Vehicle Data</p>
              <p className="text-muted-foreground">Generate VINs and license plates for automotive applications</p>

              <p className="font-semibold text-red-600 dark:text-red-400 mt-4">� Security Testing</p>
              <p className="text-muted-foreground">Passwords, SSNs, and Luhn-compliant credit cards for security tests</p>
            </div>

            <div className="col-span-full mt-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-lg">
              <p className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <strong>Important:</strong> All data is randomly generated for testing purposes only. Do not use in production with real user data.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

