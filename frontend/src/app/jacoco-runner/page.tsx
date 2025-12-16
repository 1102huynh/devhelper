'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TestTube2, FolderOpen, GitBranch, RefreshCw, Archive, Download, ArrowUpFromLine, ArrowDownToLine, AlertCircle, CheckCircle2, XCircle, Loader2, FolderGit2, Search, ChevronLeft, ChevronRight, Settings, Rocket, FolderKanban, Hammer, Package, X, Filter, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface Project {
    name: string
    path: string
    isGitRepo: boolean
    currentBranch: string
    hasUncommittedChanges: boolean
    recentBranches: string[]
    isMavenProject: boolean
    isNodeProject: boolean
    lastBuildStatus: string | null
    lastBuildTime: string | null
}

interface GitResult {
    success: boolean
    output: string
    error: string
    command: string
}

const API_BASE = 'http://localhost:8080/api'
const ITEMS_PER_PAGE_OPTIONS = [6, 12, 24, 48]
const STORAGE_KEY = 'jacoco-runner-base-path'

export default function JacocoRunnerPage() {
    const [activeTab, setActiveTab] = useState('projects')
    const [basePath, setBasePath] = useState('')
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [loadingProject, setLoadingProject] = useState<string | null>(null)
    const [loadingAction, setLoadingAction] = useState<string | null>(null)
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // Search, Pagination and Filter
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)
    const [filterType, setFilterType] = useState<'all' | 'git' | 'maven' | 'node'>('all')

    // Build log modal
    const [showBuildLog, setShowBuildLog] = useState(false)
    const [buildLogProject, setBuildLogProject] = useState<Project | null>(null)
    const [buildLog, setBuildLog] = useState('')
    const [loadingLog, setLoadingLog] = useState(false)

    // Batch operations
    const [batchPulling, setBatchPulling] = useState(false)
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })

    // Load basePath from localStorage on mount
    useEffect(() => {
        const savedPath = localStorage.getItem(STORAGE_KEY)
        if (savedPath) {
            setBasePath(savedPath)
        } else {
            setBasePath('D:\\learn')
        }
    }, [])

    // Auto-load projects when basePath changes (from localStorage or input)
    useEffect(() => {
        if (basePath) {
            loadProjects()
        }
    }, [basePath])

    // Reset to page 1 when search query or filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, filterType])

    // Filter and paginate projects
    const filteredProjects = useMemo(() => {
        let result = projects

        // Apply type filter
        if (filterType === 'git') {
            result = result.filter(p => p.isGitRepo)
        } else if (filterType === 'maven') {
            result = result.filter(p => p.isMavenProject)
        } else if (filterType === 'node') {
            result = result.filter(p => p.isNodeProject)
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(project =>
                project.name.toLowerCase().includes(query)
            )
        }

        return result
    }, [projects, searchQuery, filterType])

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)

    const paginatedProjects = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredProjects.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredProjects, currentPage, itemsPerPage])

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const loadProjects = async () => {
        if (!basePath) return

        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/projects?basePath=${encodeURIComponent(basePath)}`)
            if (response.ok) {
                const data = await response.json()
                setProjects(data)
                setCurrentPage(1)
                // Save basePath to localStorage
                localStorage.setItem(STORAGE_KEY, basePath)
            } else {
                showNotification('error', 'Failed to load projects')
            }
        } catch (error) {
            showNotification('error', 'Cannot connect to backend server')
        } finally {
            setIsLoading(false)
        }
    }

    const executeGitCommand = async (projectPath: string, projectName: string, action: string, endpoint: string) => {
        setLoadingProject(projectPath)
        setLoadingAction(action)

        try {
            const response = await fetch(`${API_BASE}/projects/git/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectPath })
            })

            const result: GitResult = await response.json()

            if (result.success) {
                showNotification('success', `${action} completed for ${projectName}`)
                await loadProjects()
            } else {
                showNotification('error', result.error || `${action} failed`)
            }
        } catch (error) {
            showNotification('error', `Failed to execute ${action}`)
        } finally {
            setLoadingProject(null)
            setLoadingAction(null)
        }
    }

    const gitStash = (project: Project) => executeGitCommand(project.path, project.name, 'Stash', 'stash')
    const gitStashPop = (project: Project) => executeGitCommand(project.path, project.name, 'Stash Pop', 'stash-pop')
    const gitPush = (project: Project) => executeGitCommand(project.path, project.name, 'Push', 'push')
    const gitFetch = (project: Project) => executeGitCommand(project.path, project.name, 'Fetch', 'fetch')
    const gitPull = (project: Project) => executeGitCommand(project.path, project.name, 'Pull', 'pull')

    // Git checkout to branch
    const gitCheckout = async (project: Project, branch: string) => {
        if (branch === project.currentBranch) {
            showNotification('error', `Already on branch ${branch}`)
            return
        }

        setLoadingProject(project.path)
        setLoadingAction(`Checkout ${branch}`)

        try {
            const response = await fetch(`${API_BASE}/projects/git/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectPath: project.path, branch })
            })

            const result: GitResult = await response.json()

            if (result.success) {
                showNotification('success', `Switched to branch ${branch}`)
                await loadProjects()
            } else {
                showNotification('error', result.error || 'Checkout failed')
            }
        } catch (error) {
            showNotification('error', 'Failed to checkout branch')
        } finally {
            setLoadingProject(null)
            setLoadingAction(null)
        }
    }

    // Maven build - uses different endpoint
    const mavenBuild = async (project: Project) => {
        setLoadingProject(project.path)
        setLoadingAction('Building')

        try {
            const response = await fetch(`${API_BASE}/projects/maven/build`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectPath: project.path })
            })

            const result: GitResult = await response.json()

            if (result.success) {
                showNotification('success', `Build completed for ${project.name}`)
            } else {
                showNotification('error', result.error || 'Build failed')
            }
            // Reload projects to get updated build status
            await loadProjects()
        } catch (error) {
            showNotification('error', 'Failed to execute build')
        } finally {
            setLoadingProject(null)
            setLoadingAction(null)
        }
    }

    // NPM build for Node.js projects
    const npmBuild = async (project: Project) => {
        setLoadingProject(project.path)
        setLoadingAction('Installing')

        try {
            const response = await fetch(`${API_BASE}/projects/npm/build`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectPath: project.path })
            })

            const result: GitResult = await response.json()

            if (result.success) {
                showNotification('success', `npm install completed for ${project.name}`)
            } else {
                showNotification('error', result.error || 'npm install failed')
            }
            // Reload projects to get updated build status
            await loadProjects()
        } catch (error) {
            showNotification('error', 'Failed to execute npm install')
        } finally {
            setLoadingProject(null)
            setLoadingAction(null)
        }
    }

    // View build log in modal
    const viewBuildLog = async (project: Project) => {
        setBuildLogProject(project)
        setShowBuildLog(true)
        setLoadingLog(true)
        setBuildLog('')

        try {
            const response = await fetch(`${API_BASE}/projects/build/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectPath: project.path })
            })
            const log = await response.text()
            setBuildLog(log)
        } catch (error) {
            setBuildLog('Failed to load build log')
        } finally {
            setLoadingLog(false)
        }
    }

    // Batch pull all git repos
    const batchPullAll = async () => {
        const gitRepos = projects.filter(p => p.isGitRepo)
        if (gitRepos.length === 0) {
            showNotification('error', 'No git repositories found')
            return
        }

        setBatchPulling(true)
        setBatchProgress({ current: 0, total: gitRepos.length })

        let successCount = 0
        let failCount = 0

        for (let i = 0; i < gitRepos.length; i++) {
            const project = gitRepos[i]
            setBatchProgress({ current: i + 1, total: gitRepos.length })

            try {
                const response = await fetch(`${API_BASE}/projects/git/pull`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectPath: project.path })
                })
                const result: GitResult = await response.json()
                if (result.success) {
                    successCount++
                } else {
                    failCount++
                }
            } catch (error) {
                failCount++
            }
        }

        setBatchPulling(false)
        showNotification('success', `Batch pull completed: ${successCount} success, ${failCount} failed`)
        await loadProjects()
    }

    const isProjectLoading = (projectPath: string) => loadingProject === projectPath

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i)
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
                pages.push('...')
                pages.push(totalPages)
            }
        }
        return pages
    }

    // Count repos
    const gitRepoCount = projects.filter(p => p.isGitRepo).length
    const mavenProjectCount = projects.filter(p => p.isMavenProject).length
    const nodeProjectCount = projects.filter(p => p.isNodeProject).length

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <TestTube2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Jacoco Runner</h1>
                        <p className="text-muted-foreground">Manage projects, configure builds and deploy applications</p>
                    </div>
                </div>

                {/* Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${notification.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/20 text-green-600'
                                : 'bg-red-500/10 border border-red-500/20 text-red-600'
                                }`}
                        >
                            {notification.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                            <span>{notification.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 h-12">
                        <TabsTrigger value="projects" className="flex items-center gap-2 text-sm">
                            <FolderKanban className="w-4 h-4" />
                            <span className="hidden sm:inline">Projects</span>
                            {projects.length > 0 && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {projects.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="config" className="flex items-center gap-2 text-sm">
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Configuration</span>
                        </TabsTrigger>
                        <TabsTrigger value="deploy" className="flex items-center gap-2 text-sm">
                            <Rocket className="w-4 h-4" />
                            <span className="hidden sm:inline">Deploy</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Projects */}
                    <TabsContent value="projects" className="space-y-4">
                        {/* Path Configuration */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FolderOpen className="w-5 h-5" />
                                    Project Folder
                                </CardTitle>
                                <CardDescription>Enter the path to your projects folder</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3">
                                    <Input
                                        value={basePath}
                                        onChange={(e) => setBasePath(e.target.value)}
                                        placeholder="e.g., D:\projects"
                                        className="flex-1 font-mono"
                                    />
                                    <Button
                                        onClick={loadProjects}
                                        disabled={isLoading || !basePath}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Load Projects
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Quick Stats */}
                                {projects.length > 0 && (
                                    <div className="flex gap-4 mt-4 pt-4 border-t flex-wrap">
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-muted-foreground">Git Repos:</span>
                                            <span className="font-semibold">{gitRepoCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                            <span className="text-muted-foreground">Maven:</span>
                                            <span className="font-semibold">{mavenProjectCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                                            <span className="text-muted-foreground">Node.js:</span>
                                            <span className="font-semibold">{nodeProjectCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                            <span className="text-muted-foreground">Others:</span>
                                            <span className="font-semibold">{projects.length - gitRepoCount}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Search and Pagination Controls */}
                        {projects.length > 0 && (
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                {/* Search and Filter */}
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search projects..."
                                            className="pl-10"
                                        />
                                    </div>

                                    {/* Filter Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value as 'all' | 'git' | 'maven' | 'node')}
                                            className="h-10 px-3 pr-8 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="all">All</option>
                                            <option value="git">Git Only</option>
                                            <option value="maven">Maven</option>
                                            <option value="node">Node.js</option>
                                        </select>
                                        <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>

                                    {/* Batch Pull All Button */}
                                    <Button
                                        variant="outline"
                                        onClick={batchPullAll}
                                        disabled={batchPulling || gitRepoCount === 0}
                                        className="whitespace-nowrap"
                                    >
                                        {batchPulling ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {batchProgress.current}/{batchProgress.total}
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDownToLine className="w-4 h-4 mr-2" />
                                                Pull All
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Results info and items per page */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">
                                        Showing {paginatedProjects.length} of {filteredProjects.length} projects
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm text-muted-foreground">Per page:</Label>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value))
                                                setCurrentPage(1)
                                            }}
                                            className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        >
                                            {ITEMS_PER_PAGE_OPTIONS.map(option => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Projects Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence mode="popLayout">
                                {paginatedProjects.map((project, index) => (
                                    <motion.div
                                        key={project.path}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: index * 0.03 }}
                                        layout
                                    >
                                        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col ${project.isGitRepo
                                            ? 'border-l-4 border-l-green-500'
                                            : 'border-l-4 border-l-gray-400'
                                            }`}>
                                            {/* Loading Overlay */}
                                            {isProjectLoading(project.path) && (
                                                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                        <span className="text-sm text-muted-foreground">{loadingAction}...</span>
                                                    </div>
                                                </div>
                                            )}

                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        <FolderGit2 className={`w-5 h-5 flex-shrink-0 ${project.isGitRepo ? 'text-green-500' : 'text-gray-400'}`} />
                                                        <CardTitle className="text-lg truncate" title={project.name}>{project.name}</CardTitle>
                                                    </div>
                                                    {project.isGitRepo && project.hasUncommittedChanges && (
                                                        <Badge variant="outline" className="text-amber-500 border-amber-500/50 flex-shrink-0">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            Changes
                                                        </Badge>
                                                    )}
                                                </div>
                                                {project.isGitRepo && project.currentBranch && (
                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                        <GitBranch className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                        <Badge variant="secondary" className="font-mono text-xs truncate max-w-[180px]" title={project.currentBranch}>
                                                            {project.currentBranch}
                                                        </Badge>
                                                        {project.isMavenProject && (
                                                            <Badge variant="outline" className="text-orange-500 border-orange-500/50 text-xs">
                                                                Maven
                                                            </Badge>
                                                        )}
                                                        {project.isNodeProject && (
                                                            <Badge variant="outline" className="text-teal-500 border-teal-500/50 text-xs">
                                                                Node.js
                                                            </Badge>
                                                        )}
                                                        {project.lastBuildStatus && (
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs cursor-pointer hover:opacity-80 ${project.lastBuildStatus === 'success'
                                                                    ? 'text-green-500 border-green-500/50 bg-green-500/10'
                                                                    : 'text-red-500 border-red-500/50 bg-red-500/10'
                                                                    }`}
                                                                title={`Build ${project.lastBuildStatus} at ${project.lastBuildTime} - Click to view log`}
                                                                onClick={() => viewBuildLog(project)}
                                                            >
                                                                {project.lastBuildStatus === 'success' ? '✓' : '✗'} {project.lastBuildTime}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </CardHeader>

                                            <CardContent className="flex-1 flex flex-col">
                                                {project.isGitRepo ? (
                                                    <div className="space-y-3 flex-1 flex flex-col">
                                                        {/* Git Actions - Row 1: Stash & Pop */}
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => gitStash(project)}
                                                                disabled={isProjectLoading(project.path)}
                                                                className="w-full"
                                                            >
                                                                <Archive className="w-4 h-4 mr-1" />
                                                                Stash
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => gitStashPop(project)}
                                                                disabled={isProjectLoading(project.path)}
                                                                className="w-full"
                                                            >
                                                                <Download className="w-4 h-4 mr-1" />
                                                                Pop
                                                            </Button>
                                                        </div>

                                                        {/* Git Actions - Row 2: Push (full width) */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => gitPush(project)}
                                                            disabled={isProjectLoading(project.path)}
                                                            className="w-full border-green-500/50 text-green-600 hover:bg-green-500/10"
                                                        >
                                                            <ArrowUpFromLine className="w-4 h-4 mr-1" />
                                                            Push
                                                        </Button>

                                                        {/* Git Actions - Row 3: Fetch & Pull */}
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => gitFetch(project)}
                                                                disabled={isProjectLoading(project.path)}
                                                                className="w-full"
                                                            >
                                                                <RefreshCw className="w-4 h-4 mr-1" />
                                                                Fetch
                                                            </Button>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => gitPull(project)}
                                                                disabled={isProjectLoading(project.path)}
                                                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                                            >
                                                                <ArrowDownToLine className="w-4 h-4 mr-1" />
                                                                Pull
                                                            </Button>
                                                        </div>

                                                        {/* Maven Build - Only show for Maven projects */}
                                                        {project.isMavenProject && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => mavenBuild(project)}
                                                                disabled={isProjectLoading(project.path)}
                                                                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                                                            >
                                                                <Hammer className="w-4 h-4 mr-1" />
                                                                Build Maven
                                                            </Button>
                                                        )}

                                                        {/* NPM Install - Only show for Node.js projects */}
                                                        {project.isNodeProject && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => npmBuild(project)}
                                                                disabled={isProjectLoading(project.path)}
                                                                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                                                            >
                                                                <Package className="w-4 h-4 mr-1" />
                                                                npm install
                                                            </Button>
                                                        )}

                                                        {/* Recent Branches */}
                                                        <div className="pt-2 border-t mt-auto min-h-[60px]">
                                                            {project.recentBranches && project.recentBranches.length > 1 ? (
                                                                <>
                                                                    <Label className="text-xs text-muted-foreground">Recent branches (click to checkout):</Label>
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {project.recentBranches.slice(0, 3).map((branch) => (
                                                                            <Badge
                                                                                key={branch}
                                                                                variant={branch === project.currentBranch ? "secondary" : "outline"}
                                                                                className={`text-xs cursor-pointer truncate max-w-[100px] ${branch === project.currentBranch
                                                                                        ? 'bg-primary/20 border-primary/50'
                                                                                        : 'hover:bg-accent hover:border-primary/50'
                                                                                    }`}
                                                                                title={branch === project.currentBranch ? `${branch} (current)` : `Switch to ${branch}`}
                                                                                onClick={() => gitCheckout(project, branch)}
                                                                            >
                                                                                {branch === project.currentBranch && '• '}
                                                                                {branch}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground/50">No other branches</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-muted-foreground flex-1 flex items-center justify-center">
                                                        <p className="text-sm">Not a Git repository</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {getPageNumbers().map((page, index) => (
                                        typeof page === 'number' ? (
                                            <Button
                                                key={index}
                                                variant={currentPage === page ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => goToPage(page)}
                                                className={`w-9 ${currentPage === page ? 'bg-gradient-to-r from-green-500 to-emerald-600' : ''}`}
                                            >
                                                {page}
                                            </Button>
                                        ) : (
                                            <span key={index} className="px-2 text-muted-foreground">...</span>
                                        )
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && projects.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Enter a valid folder path and click "Load Projects" to see your projects.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* No search results */}
                        {!isLoading && projects.length > 0 && filteredProjects.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        No projects match "{searchQuery}". Try a different search term.
                                    </p>
                                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                                        Clear Search
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <AlertCircle className="w-5 h-5 text-blue-500" />
                                    Quick Actions Guide
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <p>• <strong>Stash:</strong> Save your uncommitted changes temporarily</p>
                                <p>• <strong>Pop:</strong> Restore previously stashed changes</p>
                                <p>• <strong>Push:</strong> Push your commits to remote repository</p>
                                <p>• <strong>Fetch:</strong> Download changes from remote without merging</p>
                                <p>• <strong>Pull:</strong> Download and merge changes from remote</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 2: Configuration */}
                    <TabsContent value="config" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Build Configuration
                                </CardTitle>
                                <CardDescription>
                                    Configure and modify project files before building
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="py-12 text-center">
                                <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                                <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Coming Soon</h3>
                                <p className="text-muted-foreground">
                                    This feature will allow you to modify configuration files, <br />
                                    environment variables, and build settings before deployment.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Deploy */}
                    <TabsContent value="deploy" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Rocket className="w-5 h-5" />
                                    Deployment Status
                                </CardTitle>
                                <CardDescription>
                                    View and manage Maven Tomcat deployments
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="py-12 text-center">
                                <Rocket className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                                <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Coming Soon</h3>
                                <p className="text-muted-foreground">
                                    This feature will display deployed projects status <br />
                                    and allow you to manage Tomcat deployments.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* Build Log Modal */}
            <AnimatePresence>
                {showBuildLog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowBuildLog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    <h3 className="font-semibold">Build Log - {buildLogProject?.name}</h3>
                                    {buildLogProject?.lastBuildStatus && (
                                        <Badge className={buildLogProject.lastBuildStatus === 'success' ? 'bg-green-500' : 'bg-red-500'}>
                                            {buildLogProject.lastBuildStatus}
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowBuildLog(false)}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-auto p-4">
                                {loadingLog ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-x-auto">
                                        {buildLog || 'No build log available'}
                                    </pre>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-2 p-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(buildLog)
                                        showNotification('success', 'Build log copied to clipboard')
                                    }}
                                    disabled={!buildLog || loadingLog}
                                >
                                    Copy Log
                                </Button>
                                <Button onClick={() => setShowBuildLog(false)}>
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
