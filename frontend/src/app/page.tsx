'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Code2, FileJson, Terminal, Zap, StickyNote, Binary, Link2, Hash, KeyRound, Clock, Fingerprint, FileCode, Calendar, GitCompare, Type, Palette, Code, FileText, QrCode, Info, Sparkles, Rocket, Star, Database, Target, FileCheck, Globe, Server, Search, TrendingUp, Shield, CheckCircle2, Zap as ZapIcon, FileImage, Brush, Scissors } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import GitHubStarButton from '@/components/github-star-button'

const tools = [
  { title: 'API Tester', description: 'Professional REST API testing with collections & history', icon: Zap, href: '/api-tester', color: 'text-yellow-500', category: 'dev', popular: true },
  { title: 'Base64', description: 'Encode/decode Base64 with file & image support', icon: Binary, href: '/base64', color: 'text-orange-500', category: 'dev' },
  { title: 'Color Converter', description: 'Convert between 8 color formats with live preview', icon: Palette, href: '/color-converter', color: 'text-red-500', category: 'dev' },
  { title: 'Cron Parser', description: 'Parse cron expressions with next run calculations', icon: Calendar, href: '/cron-parser', color: 'text-rose-500', category: 'dev' },
  { title: 'CSS Formatter', description: 'Format, minify & auto-prefix CSS stylesheets', icon: Brush, href: '/css-formatter', color: 'text-pink-600', category: 'dev', popular: true },
  { title: 'Diff Checker', description: 'Compare text with 3 view modes (unified/split/side)', icon: GitCompare, href: '/diff-checker', color: 'text-slate-500', category: 'dev' },
  { title: 'Hash Generator', description: 'Generate MD5, SHA hashes with file & HMAC support', icon: Hash, href: '/hash-generator', color: 'text-indigo-500', category: 'dev' },
  { title: 'HTML Encoder', description: 'Encode/decode HTML entities with 35+ references', icon: Code, href: '/html-encoder', color: 'text-lime-500', category: 'dev' },
  { title: 'HTTP Status', description: 'Complete HTTP status code reference guide', icon: Info, href: '/http-status', color: 'text-blue-600', category: 'dev' },
  { title: 'Image Converter', description: 'Convert, resize, rotate, flip & apply filters', icon: FileImage, href: '/image-converter', color: 'text-emerald-600', category: 'dev', popular: true },
  { title: 'JS Obfuscator', description: 'Protect JavaScript code with 7 obfuscation techniques', icon: Shield, href: '/js-obfuscator', color: 'text-purple-600', category: 'dev', popular: true },
  { title: 'JSON Formatter', description: 'Format, validate & convert JSON with sorting', icon: FileJson, href: '/json-formatter', color: 'text-green-500', category: 'dev', popular: true },
  { title: 'JWT Decoder', description: 'Decode & validate JSON Web Tokens', icon: KeyRound, href: '/jwt-decoder', color: 'text-emerald-500', category: 'dev' },
  { title: 'Lorem Ipsum', description: 'Generate customizable placeholder text', icon: FileText, href: '/lorem-ipsum', color: 'text-sky-500', category: 'dev' },
  { title: 'Markdown Preview', description: 'Live markdown preview with themes & export', icon: FileText, href: '/markdown-preview', color: 'text-cyan-600', category: 'dev', popular: true },
  { title: 'Notes', description: 'Lightning-fast notes with Ctrl+Space shortcut', icon: StickyNote, href: '/notes', color: 'text-pink-500', category: 'dev' },
  { title: 'PDF Tools', description: 'Merge & split PDF files client-side', icon: Scissors, href: '/pdf-tools', color: 'text-red-600', category: 'dev' },
  { title: 'QR Generator', description: 'Generate customizable QR codes instantly', icon: QrCode, href: '/qr-generator', color: 'text-neutral-500', category: 'dev' },
  { title: 'Regex Tester', description: 'Test regex with 50 patterns & live highlighting', icon: Code2, href: '/regex-tester', color: 'text-blue-500', category: 'dev', popular: true },
  { title: 'SSH Commands', description: 'Manage frequently used SSH command library', icon: Terminal, href: '/ssh-commands', color: 'text-purple-500', category: 'dev' },
  { title: 'Text Utils', description: 'Transform text with 50+ operations', icon: Type, href: '/text-utils', color: 'text-fuchsia-500', category: 'dev' },
  { title: 'Timestamp', description: 'Convert Unix timestamps across 10 timezones', icon: Clock, href: '/timestamp', color: 'text-teal-500', category: 'dev' },
  { title: 'URL Encoder', description: 'Encode/decode URLs with query builder', icon: Link2, href: '/url-encoder', color: 'text-cyan-500', category: 'dev' },
  { title: 'UUID Generator', description: 'Generate & validate UUIDs with batch support', icon: Fingerprint, href: '/uuid-generator', color: 'text-violet-500', category: 'dev' },
  { title: 'XML Formatter', description: 'Format, validate & convert XML to JSON', icon: FileCode, href: '/xml-formatter', color: 'text-amber-500', category: 'dev' },
  { title: 'HTTP Headers Analyzer', description: 'Analyze security, caching & performance headers', icon: Globe, href: '/http-headers-analyzer', color: 'text-orange-600', category: 'automation' },
  { title: 'JSON Schema Validator', description: 'Validate JSON data against schemas', icon: FileCheck, href: '/json-schema-validator', color: 'text-emerald-600', category: 'automation' },
  { title: 'Mock API Generator', description: 'Generate realistic mock API responses', icon: Server, href: '/mock-api-generator', color: 'text-indigo-600', category: 'automation' },
  { title: 'Selector Tester', description: 'Test CSS selectors & XPath expressions', icon: Target, href: '/selector-tester', color: 'text-cyan-600', category: 'automation' },
  { title: 'Test Data Generator', description: 'Generate realistic test data for automation', icon: Database, href: '/test-data-generator', color: 'text-purple-600', category: 'automation' },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  const popularTools = tools.filter(t => t.popular)
  const filteredTools = searchQuery
    ? tools.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : tools

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10 border-b border-border/50">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">30 Professional Developer Tools</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Welcome to{' '}
              <span className="gradient-text">Dev Helper</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your comprehensive suite of professional developer productivity tools.
              Built for engineers who demand excellence.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center mb-12">
              <Link href="#tools">
                <Button size="lg" className="rounded-xl shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6">
                  <Rocket className="w-5 h-5 mr-2" />
                  Explore All Tools
                </Button>
              </Link>
              <GitHubStarButton
                variant="full"
                repoUrl="https://github.com/1102huynh/devhelper"
              />
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-1">30</div>
                <div className="text-sm text-muted-foreground">Professional Tools</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-purple-500 mb-1">∞</div>
                <div className="text-sm text-muted-foreground">No Limits</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Free Forever</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold">Most Popular Tools</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {popularTools.map((tool, index) => (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={tool.href}>
                  <Card className="modern-card group cursor-pointer h-full hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`${tool.color} p-2 rounded-lg bg-secondary/50`}>
                          <tool.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base group-hover:text-primary transition-colors">
                            {tool.title}
                          </CardTitle>
                        </div>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <CardDescription className="text-xs leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* All Tools Section with Search */}
      <section id="tools" className="container mx-auto px-4 py-16 border-t border-border/50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-center">All 30 Tools</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tools... (e.g., JSON, image, regex)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: searchQuery ? 0 : index * 0.02 }}
              >
                <Link href={tool.href}>
                  <Card className="modern-card group cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`${tool.color} p-3 rounded-xl bg-secondary/50 group-hover:bg-secondary transition-colors`}
                        >
                          <tool.icon className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {tool.title}
                          </CardTitle>
                          {tool.popular && (
                            <Badge variant="secondary" className="text-xs mt-1">Popular</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No tools found matching "{searchQuery}"</p>
              <Button onClick={() => setSearchQuery('')} variant="outline">
                Clear Search
              </Button>
            </div>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 border-y border-border/50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Dev Helper?</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass-card text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-3">
                    <ZapIcon className="w-6 h-6 text-yellow-500" />
                  </div>
                  <CardTitle className="text-lg">Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Instant results. No waiting, no lag. Optimized for speed.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Beautiful UI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Modern design with dark mode. Professional and pleasing.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">Feature Rich</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    30 comprehensive tools with advanced features built-in.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center mb-3">
                    <Rocket className="w-6 h-6 text-pink-500" />
                  </div>
                  <CardTitle className="text-lg">Always Free</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No subscriptions, no limits, no catches. Free forever.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to boost your productivity?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers who use Dev Helper daily
          </p>
          <Link href="#tools">
            <Button size="lg" className="text-lg px-8 py-6">
              <Rocket className="w-5 h-5 mr-2" />
              Start Using Dev Helper Now
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
