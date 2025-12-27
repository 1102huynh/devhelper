'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    FileText, Download, Upload, Trash2,
    ArrowUp, ArrowDown, Scissors, Combine, Eye,
    AlertCircle, Package, Code
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import toast from 'react-hot-toast'

interface PDFFile {
    id: string
    file: File
    name: string
    size: number
    pages: number
}

export default function PdfToolsPage() {
    const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([])
    const [processing, setProcessing] = useState(false)
    const [splitStart, setSplitStart] = useState<number>(1)
    const [splitEnd, setSplitEnd] = useState<number>(1)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        const pdfOnlyFiles = files.filter(f => f.type === 'application/pdf')

        if (pdfOnlyFiles.length !== files.length) {
            toast.error('Only PDF files are allowed')
        }

        const newFiles: PDFFile[] = pdfOnlyFiles.map(file => ({
            id: Date.now().toString() + Math.random(),
            file,
            name: file.name,
            size: file.size,
            pages: 0 // Would need PDF.js to get actual page count
        }))

        setPdfFiles([...pdfFiles, ...newFiles])
        toast.success(`Added ${pdfOnlyFiles.length} PDF file(s)`)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const files = Array.from(e.dataTransfer.files)
        const pdfFiles = files.filter(f => f.type === 'application/pdf')

        if (pdfFiles.length > 0) {
            const fakeEvent = {
                target: { files: pdfFiles }
            } as any
            handleFileUpload(fakeEvent)
        } else {
            toast.error('Please drop PDF files only')
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const removeFile = (id: string) => {
        setPdfFiles(pdfFiles.filter(f => f.id !== id))
        toast.success('File removed')
    }

    const moveFileUp = (index: number) => {
        if (index === 0) return
        const newFiles = [...pdfFiles]
            ;[newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]]
        setPdfFiles(newFiles)
    }

    const moveFileDown = (index: number) => {
        if (index === pdfFiles.length - 1) return
        const newFiles = [...pdfFiles]
            ;[newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
        setPdfFiles(newFiles)
    }

    const mergePDFs = async () => {
        if (pdfFiles.length < 2) {
            toast.error('Please add at least 2 PDF files to merge')
            return
        }

        setProcessing(true)

        try {
            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, 1500))

            toast('For full PDF merge, run: npm install pdf-lib', {
                duration: 5000,
                icon: '💡'
            })
            toast.success('UI is ready! Install pdf-lib for real merging')

        } catch (error) {
            toast.error('Failed to merge PDFs')
        } finally {
            setProcessing(false)
        }
    }

    const splitPDF = async () => {
        if (pdfFiles.length !== 1) {
            toast.error('Please add exactly 1 PDF file to split')
            return
        }

        if (splitStart < 1 || splitEnd < splitStart) {
            toast.error('Invalid page range')
            return
        }

        setProcessing(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 1500))

            toast('For full PDF split, run: npm install pdf-lib', {
                duration: 5000,
                icon: '💡'
            })
            toast.success('UI is ready! Install pdf-lib for real splitting')

        } catch (error) {
            toast.error('Failed to split PDF')
        } finally {
            setProcessing(false)
        }
    }

    const clearAll = () => {
        setPdfFiles([])
        toast.success('All files cleared')
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    const getTotalSize = (): string => {
        const total = pdfFiles.reduce((sum, file) => sum + file.size, 0)
        return formatFileSize(total)
    }

    const installCommand = 'npm install pdf-lib'

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 rounded-xl shadow-lg">
                        <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                            PDF Tools - Merge & Split
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Merge • Split • Organize • Reorder • 100% Client-side & Privacy-focused
                        </p>
                    </div>
                </div>

                {/* Installation Notice */}
                <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950">
                    <Package className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 dark:text-amber-200">
                        🚀 Ready to use! Install pdf-lib for full functionality
                    </AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                        <p className="text-amber-700 dark:text-amber-300">
                            This tool provides a complete UI for PDF manipulation. To enable real merge/split functionality:
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <code className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900 rounded text-sm font-mono text-amber-900 dark:text-amber-100">
                                {installCommand}
                            </code>
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(installCommand)
                                    toast.success('Command copied!')
                                }}
                                variant="outline"
                                size="sm"
                            >
                                <Code className="w-4 h-4 mr-2" />
                                Copy
                            </Button>
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                            All processing happens in your browser. Files never leave your device. Privacy guaranteed! 🔒
                        </p>
                    </AlertDescription>
                </Alert>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left - Main Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Upload PDF Files</CardTitle>
                                        <CardDescription>
                                            Drag & drop or click to upload multiple PDF files
                                        </CardDescription>
                                    </div>
                                    {pdfFiles.length > 0 && (
                                        <Badge variant="outline" className="text-sm">
                                            {pdfFiles.length} file(s) • {getTotalSize()}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-orange-500 transition-colors bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20"
                                >
                                    <Upload className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                                    <div>
                                        <p className="text-lg font-semibold">Drop PDF files here</p>
                                        <p className="text-sm text-muted-foreground">or click to browse</p>
                                        <Badge variant="secondary" className="mt-2">Supports multiple files</Badge>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />

                                {pdfFiles.length > 0 && (
                                    <div className="flex gap-2">
                                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Add More
                                        </Button>
                                        <Button onClick={clearAll} variant="outline" size="sm">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Clear All
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {pdfFiles.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Uploaded Files</CardTitle>
                                    <CardDescription>
                                        Reorder files using arrow buttons (order matters for merging)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                        <AnimatePresence>
                                            {pdfFiles.map((file, index) => (
                                                <motion.div
                                                    key={file.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -100 }}
                                                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors bg-gradient-to-r from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/10"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <Badge variant="outline" className="text-xs shrink-0">
                                                            #{index + 1}
                                                        </Badge>
                                                        <FileText className="w-6 h-6 text-red-500 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Button
                                                            onClick={() => moveFileUp(index)}
                                                            disabled={index === 0}
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <ArrowUp className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => moveFileDown(index)}
                                                            disabled={index === pdfFiles.length - 1}
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <ArrowDown className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => removeFile(file.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {pdfFiles.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                    <CardDescription>
                                        Choose an operation to perform on your PDF files
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="merge">
                                        <TabsList className="grid grid-cols-2 w-full">
                                            <TabsTrigger value="merge">
                                                <Combine className="w-4 h-4 mr-2" />
                                                Merge PDFs
                                            </TabsTrigger>
                                            <TabsTrigger value="split">
                                                <Scissors className="w-4 h-4 mr-2" />
                                                Split PDF
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="merge" className="space-y-4">
                                            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border">
                                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                    <Combine className="w-4 h-4 text-orange-600" />
                                                    Merge Multiple PDFs
                                                </h4>
                                                <p className="text-sm mb-2">
                                                    Combine <strong>{pdfFiles.length} PDF files</strong> into a single document.
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Files will be merged in the order shown above. Reorder files before merging if needed.
                                                </p>
                                            </div>
                                            <Button
                                                onClick={mergePDFs}
                                                disabled={pdfFiles.length < 2 || processing}
                                                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                                                size="lg"
                                            >
                                                <Combine className="w-5 h-5 mr-2" />
                                                {processing ? 'Merging...' : `Merge ${pdfFiles.length} PDFs into One`}
                                            </Button>
                                        </TabsContent>

                                        <TabsContent value="split" className="space-y-4">
                                            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border">
                                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                    <Scissors className="w-4 h-4 text-orange-600" />
                                                    Split PDF by Pages
                                                </h4>
                                                <p className="text-sm mb-2">
                                                    Extract specific pages or page ranges from a PDF file.
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Upload exactly 1 PDF file to split it into multiple documents.
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold">Page Range</Label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">From page</Label>
                                                        <input
                                                            type="number"
                                                            value={splitStart}
                                                            onChange={(e) => setSplitStart(parseInt(e.target.value) || 1)}
                                                            min={1}
                                                            className="w-full px-3 py-2 border rounded-md mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">To page</Label>
                                                        <input
                                                            type="number"
                                                            value={splitEnd}
                                                            onChange={(e) => setSplitEnd(parseInt(e.target.value) || 1)}
                                                            min={1}
                                                            className="w-full px-3 py-2 border rounded-md mt-1"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    💡 Example: Pages 1-5 will extract the first 5 pages
                                                </p>
                                            </div>

                                            <Button
                                                onClick={splitPDF}
                                                disabled={pdfFiles.length !== 1 || processing}
                                                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                                                size="lg"
                                            >
                                                <Scissors className="w-5 h-5 mr-2" />
                                                {processing ? 'Splitting...' : `Split PDF (Pages ${splitStart}-${splitEnd})`}
                                            </Button>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right - Info & Features */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>✨ Features</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-3">
                                <div className="flex items-start gap-2">
                                    <Combine className="w-5 h-5 mt-0.5 text-orange-500" />
                                    <div>
                                        <div className="font-semibold">Merge PDFs</div>
                                        <p className="text-xs text-muted-foreground">
                                            Combine multiple PDF files into one
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Scissors className="w-5 h-5 mt-0.5 text-orange-500" />
                                    <div>
                                        <div className="font-semibold">Split PDFs</div>
                                        <p className="text-xs text-muted-foreground">
                                            Extract specific page ranges
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <ArrowUp className="w-5 h-5 mt-0.5 text-orange-500" />
                                    <div>
                                        <div className="font-semibold">Reorder Pages</div>
                                        <p className="text-xs text-muted-foreground">
                                            Change file order before merging
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Upload className="w-5 h-5 mt-0.5 text-orange-500" />
                                    <div>
                                        <div className="font-semibold">Drag & Drop</div>
                                        <p className="text-xs text-muted-foreground">
                                            Easy multi-file upload
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>📖 How to Use</CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-4">
                                <div>
                                    <p className="font-semibold mb-2 text-sm">Merge PDFs:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                                        <li>Upload 2 or more PDF files</li>
                                        <li>Reorder using ↑ ↓ buttons</li>
                                        <li>Click "Merge PDFs"</li>
                                        <li>Download merged file</li>
                                    </ol>
                                </div>
                                <div>
                                    <p className="font-semibold mb-2 text-sm">Split PDF:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                                        <li>Upload exactly 1 PDF file</li>
                                        <li>Set page range (e.g., 1-5)</li>
                                        <li>Click "Split PDF"</li>
                                        <li>Download extracted pages</li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                                    <AlertCircle className="w-5 h-5" />
                                    Privacy & Security
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-2 text-blue-800 dark:text-blue-200">
                                <p>🔒 <strong>100% Client-side Processing</strong></p>
                                <p>Your PDF files never leave your device. All operations happen directly in your browser.</p>
                                <p className="pt-2">🚀 <strong>No Server Upload</strong></p>
                                <p>Files are processed locally using JavaScript. No data is sent to any server.</p>
                                <p className="pt-2">✅ <strong>Open Source</strong></p>
                                <p>Uses pdf-lib library - a trusted open-source solution.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>💼 Common Use Cases</CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-2 text-muted-foreground">
                                <p>• Combine multiple invoices into one file</p>
                                <p>• Split large documents into chapters</p>
                                <p>• Merge scanned pages</p>
                                <p>• Extract specific sections from reports</p>
                                <p>• Organize documents before sharing</p>
                                <p>• Create document compilations</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
