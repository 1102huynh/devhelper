'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Image as ImageIcon, Download, Upload,
    RotateCw, Maximize2, Minimize2, Crop, Palette,
    FlipHorizontal, FlipVertical, Wand2, Sun, Droplets
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import toast from 'react-hot-toast'

type ImageFormat = 'png' | 'jpeg' | 'webp' | 'bmp' | 'ico'

interface ImageFilters {
    brightness: number
    contrast: number
    saturation: number
    blur: number
    grayscale: boolean
    sepia: boolean
    invert: boolean
}

export default function ImageConverterPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [outputFormat, setOutputFormat] = useState<ImageFormat>('png')
    const [quality, setQuality] = useState(90)
    const [resizeWidth, setResizeWidth] = useState(0)
    const [resizeHeight, setResizeHeight] = useState(0)
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
    const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 })
    const [converting, setConverting] = useState(false)
    const [rotation, setRotation] = useState(0)
    const [flipH, setFlipH] = useState(false)
    const [flipV, setFlipV] = useState(false)

    // Filters
    const [filters, setFilters] = useState<ImageFilters>({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: false,
        sepia: false,
        invert: false
    })

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Apply filters to preview
    useEffect(() => {
        if (selectedImage && previewCanvasRef.current) {
            applyPreview()
        }
    }, [selectedImage, filters, rotation, flipH, flipV, resizeWidth, resizeHeight])

    const applyPreview = async () => {
        if (!selectedImage || !previewCanvasRef.current) return

        const img = new Image()
        img.src = selectedImage

        await new Promise((resolve) => {
            img.onload = resolve
        })

        const canvas = previewCanvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        const targetWidth = resizeWidth || img.width
        const targetHeight = resizeHeight || img.height
        canvas.width = targetWidth
        canvas.height = targetHeight

        // Apply transformations
        ctx.save()
        ctx.translate(targetWidth / 2, targetHeight / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
        ctx.translate(-targetWidth / 2, -targetHeight / 2)

        // Apply filters
        ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      ${filters.grayscale ? 'grayscale(100%)' : ''}
      ${filters.sepia ? 'sepia(100%)' : ''}
      ${filters.invert ? 'invert(100%)' : ''}
    `.trim()

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
        ctx.restore()
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        setOriginalFile(file)
        const reader = new FileReader()
        reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
                setOriginalDimensions({ width: img.width, height: img.height })
                setResizeWidth(img.width)
                setResizeHeight(img.height)
                // Reset all transformations
                setRotation(0)
                setFlipH(false)
                setFlipV(false)
                setFilters({
                    brightness: 100,
                    contrast: 100,
                    saturation: 100,
                    blur: 0,
                    grayscale: false,
                    sepia: false,
                    invert: false
                })
            }
            img.src = event.target?.result as string
            setSelectedImage(event.target?.result as string)
            toast.success(`Loaded ${file.name}`)
        }
        reader.readAsDataURL(file)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            const input = fileInputRef.current
            if (input) {
                const dataTransfer = new DataTransfer()
                dataTransfer.items.add(file)
                input.files = dataTransfer.files
                handleFileUpload({ target: input } as React.ChangeEvent<HTMLInputElement>)
            }
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleResizeWidthChange = (width: number) => {
        setResizeWidth(width)
        if (maintainAspectRatio && originalDimensions.width > 0) {
            const ratio = originalDimensions.height / originalDimensions.width
            setResizeHeight(Math.round(width * ratio))
        }
    }

    const handleResizeHeightChange = (height: number) => {
        setResizeHeight(height)
        if (maintainAspectRatio && originalDimensions.height > 0) {
            const ratio = originalDimensions.width / originalDimensions.height
            setResizeWidth(Math.round(height * ratio))
        }
    }

    const convertImage = async () => {
        if (!selectedImage || !canvasRef.current) {
            toast.error('Please upload an image first')
            return
        }

        setConverting(true)

        try {
            const img = new Image()
            img.src = selectedImage

            await new Promise((resolve) => {
                img.onload = resolve
            })

            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('Failed to get canvas context')

            // Set canvas dimensions
            const targetWidth = resizeWidth || img.width
            const targetHeight = resizeHeight || img.height
            canvas.width = targetWidth
            canvas.height = targetHeight

            // Apply transformations
            ctx.save()
            ctx.translate(targetWidth / 2, targetHeight / 2)
            ctx.rotate((rotation * Math.PI) / 180)
            ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
            ctx.translate(-targetWidth / 2, -targetHeight / 2)

            // Apply filters
            ctx.filter = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        blur(${filters.blur}px)
        ${filters.grayscale ? 'grayscale(100%)' : ''}
        ${filters.sepia ? 'sepia(100%)' : ''}
        ${filters.invert ? 'invert(100%)' : ''}
      `.trim()

            ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
            ctx.restore()

            // Convert to desired format
            const mimeType = `image/${outputFormat === 'jpeg' ? 'jpeg' : outputFormat}`
            const qualityValue = outputFormat === 'png' ? 1 : quality / 100

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        toast.error('Failed to convert image')
                        setConverting(false)
                        return
                    }

                    // Download the converted image
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `converted_${Date.now()}.${outputFormat}`
                    a.click()
                    URL.revokeObjectURL(url)

                    toast.success(`Image converted to ${outputFormat.toUpperCase()}!`)
                    setConverting(false)
                },
                mimeType,
                qualityValue
            )
        } catch (error) {
            toast.error('Failed to convert image')
            setConverting(false)
        }
    }

    const resetToOriginal = () => {
        setResizeWidth(originalDimensions.width)
        setResizeHeight(originalDimensions.height)
        setQuality(90)
        setRotation(0)
        setFlipH(false)
        setFlipV(false)
        setFilters({
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            grayscale: false,
            sepia: false,
            invert: false
        })
        toast.success('Reset to original')
    }

    const applyPreset = (preset: 'thumbnail' | 'medium' | 'hd' | 'social') => {
        switch (preset) {
            case 'thumbnail':
                setResizeWidth(150)
                setResizeHeight(150)
                toast.success('Thumbnail preset applied (150x150)')
                break
            case 'medium':
                setResizeWidth(800)
                setResizeHeight(600)
                toast.success('Medium preset applied (800x600)')
                break
            case 'hd':
                setResizeWidth(1920)
                setResizeHeight(1080)
                toast.success('HD preset applied (1920x1080)')
                break
            case 'social':
                setResizeWidth(1200)
                setResizeHeight(630)
                toast.success('Social media preset applied (1200x630)')
                break
        }
    }

    const applyFilter = (filterName: string) => {
        switch (filterName) {
            case 'grayscale':
                setFilters({ ...filters, grayscale: !filters.grayscale })
                break
            case 'sepia':
                setFilters({ ...filters, sepia: !filters.sepia })
                break
            case 'invert':
                setFilters({ ...filters, invert: !filters.invert })
                break
            case 'brighten':
                setFilters({ ...filters, brightness: 150 })
                break
            case 'darken':
                setFilters({ ...filters, brightness: 50 })
                break
            case 'high-contrast':
                setFilters({ ...filters, contrast: 150 })
                break
            case 'low-contrast':
                setFilters({ ...filters, contrast: 50 })
                break
        }
    }

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
                    <div className="p-3 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl shadow-lg">
                        <ImageIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Image Converter & Editor
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Convert • Resize • Rotate • Flip • Filters • Crop • Professional editing
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left - Preview & Upload */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload & Preview</CardTitle>
                                <CardDescription>
                                    Drag & drop or click to upload (PNG, JPEG, WebP, BMP, GIF)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!selectedImage ? (
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                                    >
                                        <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                        <div>
                                            <p className="text-lg font-semibold">Drop image here</p>
                                            <p className="text-sm text-muted-foreground">or click to browse</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative border rounded-lg p-4 bg-checkered">
                                            <canvas
                                                ref={previewCanvasRef}
                                                className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                                            />
                                            <Badge variant="outline" className="absolute top-2 right-2">
                                                {resizeWidth} x {resizeHeight}
                                                {originalFile && ` • ${formatFileSize(originalFile.size)}`}
                                            </Badge>
                                        </div>
                                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Change Image
                                        </Button>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </CardContent>
                        </Card>

                        {selectedImage && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Edit & Transform</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="resize">
                                        <TabsList className="grid grid-cols-4 w-full">
                                            <TabsTrigger value="resize">Resize</TabsTrigger>
                                            <TabsTrigger value="transform">Transform</TabsTrigger>
                                            <TabsTrigger value="filters">Filters</TabsTrigger>
                                            <TabsTrigger value="convert">Convert</TabsTrigger>
                                        </TabsList>

                                        {/* Resize Tab */}
                                        <TabsContent value="resize" className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Maintain Aspect Ratio</Label>
                                                <Switch
                                                    checked={maintainAspectRatio}
                                                    onCheckedChange={setMaintainAspectRatio}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm mb-2 block">Width (px)</Label>
                                                    <input
                                                        type="number"
                                                        value={resizeWidth}
                                                        onChange={(e) => handleResizeWidthChange(parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border rounded-md"
                                                        min={1}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm mb-2 block">Height (px)</Label>
                                                    <input
                                                        type="number"
                                                        value={resizeHeight}
                                                        onChange={(e) => handleResizeHeightChange(parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border rounded-md"
                                                        min={1}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-2">
                                                <Button onClick={() => applyPreset('thumbnail')} variant="outline" size="sm">
                                                    Thumbnail
                                                </Button>
                                                <Button onClick={() => applyPreset('medium')} variant="outline" size="sm">
                                                    Medium
                                                </Button>
                                                <Button onClick={() => applyPreset('hd')} variant="outline" size="sm">
                                                    HD
                                                </Button>
                                                <Button onClick={() => applyPreset('social')} variant="outline" size="sm">
                                                    Social
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        {/* Transform Tab */}
                                        <TabsContent value="transform" className="space-y-4">
                                            <div>
                                                <Label className="mb-2 block">Rotate: {rotation}°</Label>
                                                <Slider
                                                    value={[rotation]}
                                                    onValueChange={(v) => setRotation(v[0])}
                                                    min={0}
                                                    max={360}
                                                    step={90}
                                                />
                                                <div className="grid grid-cols-4 gap-2 mt-2">
                                                    <Button onClick={() => setRotation(0)} variant="outline" size="sm">0°</Button>
                                                    <Button onClick={() => setRotation(90)} variant="outline" size="sm">90°</Button>
                                                    <Button onClick={() => setRotation(180)} variant="outline" size="sm">180°</Button>
                                                    <Button onClick={() => setRotation(270)} variant="outline" size="sm">270°</Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    onClick={() => setFlipH(!flipH)}
                                                    variant={flipH ? "default" : "outline"}
                                                >
                                                    <FlipHorizontal className="w-4 h-4 mr-2" />
                                                    Flip H
                                                </Button>
                                                <Button
                                                    onClick={() => setFlipV(!flipV)}
                                                    variant={flipV ? "default" : "outline"}
                                                >
                                                    <FlipVertical className="w-4 h-4 mr-2" />
                                                    Flip V
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        {/* Filters Tab */}
                                        <TabsContent value="filters" className="space-y-4">
                                            <div>
                                                <Label>Brightness: {filters.brightness}%</Label>
                                                <Slider
                                                    value={[filters.brightness]}
                                                    onValueChange={(v) => setFilters({ ...filters, brightness: v[0] })}
                                                    min={0}
                                                    max={200}
                                                />
                                            </div>

                                            <div>
                                                <Label>Contrast: {filters.contrast}%</Label>
                                                <Slider
                                                    value={[filters.contrast]}
                                                    onValueChange={(v) => setFilters({ ...filters, contrast: v[0] })}
                                                    min={0}
                                                    max={200}
                                                />
                                            </div>

                                            <div>
                                                <Label>Saturation: {filters.saturation}%</Label>
                                                <Slider
                                                    value={[filters.saturation]}
                                                    onValueChange={(v) => setFilters({ ...filters, saturation: v[0] })}
                                                    min={0}
                                                    max={200}
                                                />
                                            </div>

                                            <div>
                                                <Label>Blur: {filters.blur}px</Label>
                                                <Slider
                                                    value={[filters.blur]}
                                                    onValueChange={(v) => setFilters({ ...filters, blur: v[0] })}
                                                    min={0}
                                                    max={10}
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <Button
                                                    onClick={() => applyFilter('grayscale')}
                                                    variant={filters.grayscale ? "default" : "outline"}
                                                    size="sm"
                                                >
                                                    Grayscale
                                                </Button>
                                                <Button
                                                    onClick={() => applyFilter('sepia')}
                                                    variant={filters.sepia ? "default" : "outline"}
                                                    size="sm"
                                                >
                                                    Sepia
                                                </Button>
                                                <Button
                                                    onClick={() => applyFilter('invert')}
                                                    variant={filters.invert ? "default" : "outline"}
                                                    size="sm"
                                                >
                                                    Invert
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        {/* Convert Tab */}
                                        <TabsContent value="convert" className="space-y-4">
                                            <div>
                                                <Label className="mb-2 block">Output Format</Label>
                                                <Select value={outputFormat} onValueChange={(v: ImageFormat) => setOutputFormat(v)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="png">PNG - Lossless</SelectItem>
                                                        <SelectItem value="jpeg">JPEG - Small size</SelectItem>
                                                        <SelectItem value="webp">WebP - Modern</SelectItem>
                                                        <SelectItem value="bmp">BMP - Uncompressed</SelectItem>
                                                        <SelectItem value="ico">ICO - Icon</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {outputFormat !== 'png' && outputFormat !== 'bmp' && (
                                                <div>
                                                    <Label className="mb-2 block">Quality: {quality}%</Label>
                                                    <Slider
                                                        value={[quality]}
                                                        onValueChange={(v) => setQuality(v[0])}
                                                        min={1}
                                                        max={100}
                                                        step={1}
                                                    />
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button onClick={resetToOriginal} variant="outline">
                                                    <RotateCw className="w-4 h-4 mr-2" />
                                                    Reset All
                                                </Button>
                                                <Button
                                                    onClick={convertImage}
                                                    disabled={converting}
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-500"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    {converting ? 'Converting...' : 'Download'}
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right - Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Features</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                                    <span>5 image formats</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Maximize2 className="w-4 h-4 text-emerald-500" />
                                    <span>Resize with aspect ratio</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RotateCw className="w-4 h-4 text-emerald-500" />
                                    <span>Rotate 0-360°</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FlipHorizontal className="w-4 h-4 text-emerald-500" />
                                    <span>Flip H/V</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wand2 className="w-4 h-4 text-emerald-500" />
                                    <span>7 filter effects</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sun className="w-4 h-4 text-emerald-500" />
                                    <span>Brightness/Contrast</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Droplets className="w-4 h-4 text-emerald-500" />
                                    <span>Saturation/Blur</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Filters</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button onClick={() => applyFilter('brighten')} variant="outline" size="sm" className="w-full">
                                    Brighten
                                </Button>
                                <Button onClick={() => applyFilter('darken')} variant="outline" size="sm" className="w-full">
                                    Darken
                                </Button>
                                <Button onClick={() => applyFilter('high-contrast')} variant="outline" size="sm" className="w-full">
                                    High Contrast
                                </Button>
                                <Button onClick={() => applyFilter('low-contrast')} variant="outline" size="sm" className="w-full">
                                    Low Contrast
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Hidden canvas for conversion */}
                <canvas ref={canvasRef} className="hidden" />
            </motion.div>

            <style jsx global>{`
        .bg-checkered {
          background-image: 
            linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
        </div>
    )
}
