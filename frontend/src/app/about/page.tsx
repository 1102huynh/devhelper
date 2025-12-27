'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Info, Code, Sparkles, Heart, Star, Github,
    Mail, Coffee, CheckCircle2, Zap, Shield, Rocket,
    Users, TrendingUp, Award
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import GitHubStarButton from '@/components/github-star-button'

export default function AboutPage() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
                        <Info className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            About Dev Helper
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            The most comprehensive developer productivity suite
                        </p>
                    </div>
                </div>

                {/* Hero Stats */}
                <Card className="mb-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
                    <CardContent className="relative py-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div>
                                <div className="text-4xl font-bold gradient-text mb-2">30</div>
                                <div className="text-sm text-muted-foreground">Professional Tools</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-purple-500 mb-2">100%</div>
                                <div className="text-sm text-muted-foreground">Free & Open Source</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-pink-500 mb-2">∞</div>
                                <div className="text-sm text-muted-foreground">No Limits</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-blue-500 mb-2">24/7</div>
                                <div className="text-sm text-muted-foreground">Always Available</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Mission */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Rocket className="w-5 h-5 text-primary" />
                                Our Mission
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-muted-foreground">
                                Dev Helper was created with a simple goal: <strong>to provide developers with a comprehensive suite of professional tools that are fast, beautiful, and completely free.</strong>
                            </p>
                            <p className="text-muted-foreground">
                                We believe that great tools shouldn't be locked behind paywalls. Every developer deserves access to premium productivity tools.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Why Dev Helper */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                Why Dev Helper?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                <span>30 professional tools in one place</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                <span>Modern, intuitive interface with dark mode</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                <span>No registration or login required</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                <span>Privacy-focused - most tools work offline</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                <span>Open source & community driven</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tool Categories */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Tool Categories</CardTitle>
                        <CardDescription>30 tools organized in 2 main categories</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Code className="w-4 h-4 text-blue-500" />
                                Dev Tools (25 tools)
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'Regex Tester', 'JSON Formatter', 'XML Formatter', 'Base64', 'URL Encoder',
                                    'HTML Encoder', 'Hash Generator', 'JWT Decoder', 'UUID Generator', 'Timestamp',
                                    'Cron Parser', 'Diff Checker', 'Text Utils', 'Color Converter', 'Lorem Ipsum',
                                    'QR Generator', 'HTTP Status', 'SSH Commands', 'API Tester', 'Notes',
                                    'Markdown Preview', 'CSS Formatter', 'JS Obfuscator', 'Image Converter', 'PDF Tools'
                                ].map(tool => (
                                    <Badge key={tool} variant="secondary">{tool}</Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-purple-500" />
                                Automation Tools (6 tools)
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'Test Data Generator', 'Selector Tester', 'JSON Schema Validator',
                                    'HTTP Headers Analyzer', 'Mock API Generator', 'Jacoco Runner'
                                ].map(tool => (
                                    <Badge key={tool} variant="secondary">{tool}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-3">
                                <Zap className="w-6 h-6 text-yellow-500" />
                            </div>
                            <CardTitle className="text-lg">Lightning Fast</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                All tools are optimized for speed with instant results
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                                <Shield className="w-6 h-6 text-green-500" />
                            </div>
                            <CardTitle className="text-lg">Privacy First</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Most tools work client-side. Your data never leaves your device
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                                <Award className="w-6 h-6 text-blue-500" />
                            </div>
                            <CardTitle className="text-lg">Professional Quality</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Each tool is built with attention to detail and UX
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Technology Stack */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Built With Modern Technology</CardTitle>
                        <CardDescription>State-of-the-art tech stack for best performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Frontend</h4>
                                <div className="flex flex-wrap gap-2">
                                    <Badge>Next.js 14</Badge>
                                    <Badge>React 18</Badge>
                                    <Badge>TypeScript</Badge>
                                    <Badge>Tailwind CSS</Badge>
                                    <Badge>Shadcn UI</Badge>
                                    <Badge>Framer Motion</Badge>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Features</h4>
                                <div className="flex flex-wrap gap-2">
                                    <Badge>Dark Mode</Badge>
                                    <Badge>Responsive</Badge>
                                    <Badge>Offline Support</Badge>
                                    <Badge>Fast Performance</Badge>
                                    <Badge>SEO Optimized</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Community & Support */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Join the Community
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Dev Helper is open source and welcomes contributions from developers worldwide.
                            </p>
                            <div className="flex gap-3">
                                <GitHubStarButton
                                    variant="full"
                                    repoUrl="https://github.com/1102huynh/devhelper"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-pink-500" />
                                Support the Project
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Dev Helper is and will always be free. If you find it useful, consider:
                            </p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span>Star the repository on GitHub</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <span>Share with fellow developers</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Coffee className="w-4 h-4 text-amber-500" />
                                    <span>Contribute code or report bugs</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            Get in Touch
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Have questions, suggestions, or found a bug? We'd love to hear from you!
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button asChild>
                                    <a href="https://github.com/1102huynh/devhelper" target="_blank" rel="noopener noreferrer">
                                        <Github className="w-4 h-4 mr-2" />
                                        GitHub
                                    </a>
                                </Button>
                                <Button asChild variant="outline">
                                    <a href="https://github.com/1102huynh/devhelper/issues" target="_blank" rel="noopener noreferrer">
                                        Report Issue
                                    </a>
                                </Button>
                                <Button asChild variant="outline">
                                    <a href="https://github.com/1102huynh/devhelper/discussions" target="_blank" rel="noopener noreferrer">
                                        Discussions
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* CTA */}
                <div className="text-center mt-12 py-8">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-muted-foreground mb-6">
                        Explore all 30 professional developer tools now
                    </p>
                    <Link href="/">
                        <Button size="lg" className="text-lg px-8 py-6">
                            <Rocket className="w-5 h-5 mr-2" />
                            Start Using Dev Helper
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
