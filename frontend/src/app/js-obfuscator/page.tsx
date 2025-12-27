'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Code2, Copy, Check, Download, Upload,
    Shield, Eye, EyeOff, Lock, Unlock, Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import toast from 'react-hot-toast'

export default function JsObfuscatorPage() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [copied, setCopied] = useState(false)

    // Obfuscation settings
    const [compactCode, setCompactCode] = useState(true)
    const [renameVariables, setRenameVariables] = useState(true)
    const [stringArrayEncoding, setStringArrayEncoding] = useState(true)
    const [controlFlowFlattening, setControlFlowFlattening] = useState(false)
    const [deadCodeInjection, setDeadCodeInjection] = useState(false)
    const [selfDefending, setSelfDefending] = useState(false)
    const [debugProtection, setDebugProtection] = useState(false)
    const [obfuscationLevel, setObfuscationLevel] = useState(2)

    const [stats, setStats] = useState({
        originalSize: 0,
        obfuscatedSize: 0,
        compression: 0,
        variables: 0,
        functions: 0,
        strings: 0
    })

    const generateRandomName = (prefix: string = ''): string => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let name = prefix || chars[Math.floor(Math.random() * 52)]
        for (let i = 0; i < 6; i++) {
            name += chars[Math.floor(Math.random() * 52)]
        }
        return name
    }

    const encodeString = (str: string): string => {
        if (!stringArrayEncoding) return `"${str}"`

        // Convert to unicode escape sequences
        let encoded = ''
        for (let i = 0; i < str.length; i++) {
            encoded += '\\x' + str.charCodeAt(i).toString(16).padStart(2, '0')
        }
        return `"${encoded}"`
    }

    const obfuscateCode = () => {
        if (!input.trim()) {
            toast.error('Enter JavaScript code to obfuscate')
            return
        }

        try {
            let code = input

            // Track original stats
            const originalVars = (code.match(/\b(var|let|const)\s+\w+/g) || []).length
            const originalFuncs = (code.match(/function\s+\w+/g) || []).length
            const originalStrings = (code.match(/"[^"]*"|'[^']*'/g) || []).length

            // Variable/function name mapping
            const nameMap = new Map<string, string>()

            // 1. Extract and rename variable declarations
            if (renameVariables) {
                const varPattern = /\b(var|let|const)\s+(\w+)/g
                let match
                while ((match = varPattern.exec(code)) !== null) {
                    const originalName = match[2]
                    if (!nameMap.has(originalName) && !['true', 'false', 'null', 'undefined', 'console', 'document', 'window'].includes(originalName)) {
                        nameMap.set(originalName, generateRandomName('_'))
                    }
                }

                // Extract function names
                const funcPattern = /function\s+(\w+)/g
                while ((match = funcPattern.exec(code)) !== null) {
                    const originalName = match[1]
                    if (!nameMap.has(originalName)) {
                        nameMap.set(originalName, generateRandomName('_f'))
                    }
                }

                // Replace all occurrences
                nameMap.forEach((newName, oldName) => {
                    const regex = new RegExp(`\\b${oldName}\\b`, 'g')
                    code = code.replace(regex, newName)
                })
            }

            // 2. Encode strings
            if (stringArrayEncoding) {
                code = code.replace(/"([^"]*)"|'([^']*)'/g, (match, str1, str2) => {
                    const str = str1 || str2
                    return encodeString(str)
                })
            }

            // 3. Add dead code injection
            if (deadCodeInjection) {
                const deadCode = [
                    `if (false) { var ${generateRandomName()} = function() { return 0; }; }`,
                    `var ${generateRandomName()} = (function() { return false; })() ? 1 : 0;`,
                    `function ${generateRandomName()}() { return null; }`
                ]

                const randomDeadCode = deadCode[Math.floor(Math.random() * deadCode.length)]
                code = randomDeadCode + '\n' + code
            }

            // 4. Control flow flattening (simple version)
            if (controlFlowFlattening) {
                const switchVar = generateRandomName('sw')
                code = `var ${switchVar} = 0; switch(${switchVar}) { case 0: ${code} break; }`
            }

            // 5. Self-defending code
            if (selfDefending) {
                const defender = `(function() { var ${generateRandomName()} = function() { debugger; }; setInterval(${generateRandomName()}, 4000); })();`
                code = defender + '\n' + code
            }

            // 6. Debug protection
            if (debugProtection) {
                const debugProtect = `(function() { var ${generateRandomName()} = /./; ${generateRandomName()}.toString = function() { debugger; }; })();`
                code = debugProtect + '\n' + code
            }

            // 7. Compact code
            if (compactCode) {
                code = code
                    .replace(/\/\/.*/g, '') // Remove single-line comments
                    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                    .replace(/\s+/g, ' ') // Reduce whitespace
                    .replace(/\s*([{}();,])\s*/g, '$1') // Remove spaces around operators
                    .trim()
            }

            setOutput(code)
            calculateStats(input, code, originalVars, originalFuncs, originalStrings)
            toast.success('Code obfuscated!')
        } catch (error) {
            toast.error('Failed to obfuscate code')
            console.error(error)
        }
    }

    const calculateStats = (original: string, obfuscated: string, vars: number, funcs: number, strings: number) => {
        const originalSize = new TextEncoder().encode(original).length
        const obfuscatedSize = new TextEncoder().encode(obfuscated).length
        const compression = ((1 - obfuscatedSize / originalSize) * 100).toFixed(1)

        setStats({
            originalSize,
            obfuscatedSize,
            compression: parseFloat(compression),
            variables: vars,
            functions: funcs,
            strings: strings
        })
    }

    const deobfuscateCode = () => {
        if (!input.trim()) {
            toast.error('Enter code to deobfuscate')
            return
        }

        try {
            let code = input

            // Basic formatting
            code = code
                .replace(/;/g, ';\n')
                .replace(/\{/g, ' {\n')
                .replace(/\}/g, '\n}\n')
                .replace(/,/g, ', ')

            // Decode unicode strings
            code = code.replace(/\\x([0-9a-f]{2})/gi, (match, hex) => {
                return String.fromCharCode(parseInt(hex, 16))
            })

            setOutput(code)
            toast.success('Code deobfuscated! (Basic formatting applied)')
        } catch (error) {
            toast.error('Failed to deobfuscate code')
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.name.endsWith('.js')) {
            toast.error('Please upload a JavaScript file')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const content = event.target?.result as string
            setInput(content)
            toast.success(`Loaded ${file.name}`)
        }
        reader.readAsText(file)
    }

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadOutput = () => {
        const blob = new Blob([output], { type: 'text/javascript' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `obfuscated_${Date.now()}.js`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Downloaded!')
    }

    const applyPreset = (level: 'low' | 'medium' | 'high') => {
        switch (level) {
            case 'low':
                setCompactCode(true)
                setRenameVariables(true)
                setStringArrayEncoding(false)
                setControlFlowFlattening(false)
                setDeadCodeInjection(false)
                setSelfDefending(false)
                setDebugProtection(false)
                setObfuscationLevel(1)
                toast.success('Low obfuscation preset applied')
                break
            case 'medium':
                setCompactCode(true)
                setRenameVariables(true)
                setStringArrayEncoding(true)
                setControlFlowFlattening(false)
                setDeadCodeInjection(true)
                setSelfDefending(false)
                setDebugProtection(false)
                setObfuscationLevel(2)
                toast.success('Medium obfuscation preset applied')
                break
            case 'high':
                setCompactCode(true)
                setRenameVariables(true)
                setStringArrayEncoding(true)
                setControlFlowFlattening(true)
                setDeadCodeInjection(true)
                setSelfDefending(true)
                setDebugProtection(true)
                setObfuscationLevel(3)
                toast.success('High obfuscation preset applied')
                break
        }
    }

    const sampleCode = `function calculateSum(a, b) {
  const result = a + b;
  console.log("The sum is: " + result);
  return result;
}

function greetUser(name) {
  const greeting = "Hello, " + name + "!";
  return greeting;
}

const user = "Developer";
const sum = calculateSum(10, 20);
const message = greetUser(user);

console.log(message);`

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
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
                    <div className="p-3 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 rounded-xl shadow-lg">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            JavaScript Obfuscator
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Obfuscate • Protect • Rename • Encode • Dead code injection
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left - Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>JavaScript Obfuscator</CardTitle>
                                        <CardDescription>
                                            Protect your JavaScript code from reverse engineering
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Button onClick={() => setInput(sampleCode)} variant="outline" size="sm">
                                        <Code2 className="w-4 h-4 mr-2" />
                                        Load Sample
                                    </Button>
                                    <Button onClick={() => document.getElementById('file-upload')?.click()} variant="outline" size="sm">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload .js
                                    </Button>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".js"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <div className="flex-1" />
                                    <Badge variant={obfuscationLevel === 1 ? 'outline' : obfuscationLevel === 2 ? 'default' : 'destructive'}>
                                        Level: {obfuscationLevel === 1 ? 'Low' : obfuscationLevel === 2 ? 'Medium' : 'High'}
                                    </Badge>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-sm">Input JavaScript</Label>
                                        {input && (
                                            <Badge variant="outline" className="text-xs">
                                                {input.length} chars
                                            </Badge>
                                        )}
                                    </div>
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="function hello() { console.log('Hello!'); }"
                                        className="font-mono text-sm h-64"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <Button onClick={() => applyPreset('low')} variant="outline" size="sm">
                                        <Unlock className="w-4 h-4 mr-2" />
                                        Low
                                    </Button>
                                    <Button onClick={() => applyPreset('medium')} variant="outline" size="sm">
                                        <Shield className="w-4 h-4 mr-2" />
                                        Medium
                                    </Button>
                                    <Button onClick={() => applyPreset('high')} variant="outline" size="sm">
                                        <Lock className="w-4 h-4 mr-2" />
                                        High
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={obfuscateCode} className="bg-gradient-to-r from-purple-500 to-indigo-500">
                                        <Shield className="w-4 h-4 mr-2" />
                                        Obfuscate
                                    </Button>
                                    <Button onClick={deobfuscateCode} variant="outline">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Deobfuscate
                                    </Button>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-sm">Output</Label>
                                        {output && (
                                            <Badge variant="outline" className="text-xs">
                                                {output.length} chars
                                            </Badge>
                                        )}
                                    </div>
                                    <Textarea
                                        value={output}
                                        readOnly
                                        placeholder="Obfuscated code will appear here..."
                                        className="font-mono text-sm h-64 bg-muted"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={() => handleCopy(output)} variant="outline" disabled={!output}>
                                        {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                                        Copy
                                    </Button>
                                    <Button onClick={downloadOutput} variant="outline" disabled={!output}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right - Settings & Stats */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Obfuscation Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="compact" className="text-sm cursor-pointer">Compact Code</Label>
                                    <Switch
                                        id="compact"
                                        checked={compactCode}
                                        onCheckedChange={setCompactCode}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="rename" className="text-sm cursor-pointer">Rename Variables</Label>
                                    <Switch
                                        id="rename"
                                        checked={renameVariables}
                                        onCheckedChange={setRenameVariables}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="strings" className="text-sm cursor-pointer">Encode Strings</Label>
                                    <Switch
                                        id="strings"
                                        checked={stringArrayEncoding}
                                        onCheckedChange={setStringArrayEncoding}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="control" className="text-sm cursor-pointer">Control Flow</Label>
                                    <Switch
                                        id="control"
                                        checked={controlFlowFlattening}
                                        onCheckedChange={setControlFlowFlattening}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="dead" className="text-sm cursor-pointer">Dead Code</Label>
                                    <Switch
                                        id="dead"
                                        checked={deadCodeInjection}
                                        onCheckedChange={setDeadCodeInjection}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="self" className="text-sm cursor-pointer">Self Defending</Label>
                                    <Switch
                                        id="self"
                                        checked={selfDefending}
                                        onCheckedChange={setSelfDefending}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="debug" className="text-sm cursor-pointer">Debug Protection</Label>
                                    <Switch
                                        id="debug"
                                        checked={debugProtection}
                                        onCheckedChange={setDebugProtection}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span className="text-sm text-muted-foreground">Variables</span>
                                    <span className="font-bold">{stats.variables}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span className="text-sm text-muted-foreground">Functions</span>
                                    <span className="font-bold">{stats.functions}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span className="text-sm text-muted-foreground">Strings</span>
                                    <span className="font-bold">{stats.strings}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span className="text-sm text-muted-foreground">Original Size</span>
                                    <span className="font-bold">{formatFileSize(stats.originalSize)}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span className="text-sm text-muted-foreground">Obfuscated Size</span>
                                    <span className="font-bold">{formatFileSize(stats.obfuscatedSize)}</span>
                                </div>
                                {stats.compression !== 0 && (
                                    <div className="flex justify-between p-2 bg-purple-100 dark:bg-purple-950 rounded">
                                        <span className="text-sm text-purple-800 dark:text-purple-200">
                                            {stats.compression > 0 ? 'Compression' : 'Expansion'}
                                        </span>
                                        <span className="font-bold text-purple-800 dark:text-purple-200">
                                            {Math.abs(stats.compression)}%
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>⚠️ Warning</CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-2 text-muted-foreground">
                                <p>Obfuscation is NOT encryption. It makes code harder to read but not impossible.</p>
                                <p><strong>Use cases:</strong></p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Protect intellectual property</li>
                                    <li>Prevent casual code theft</li>
                                    <li>Add anti-debugging measures</li>
                                    <li>Reduce code size (minification)</li>
                                </ul>
                                <p className="pt-2"><strong>Note:</strong> High obfuscation may impact performance.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
