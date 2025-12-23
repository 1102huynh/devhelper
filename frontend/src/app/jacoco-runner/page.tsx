'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TestTube2, FolderOpen, GitBranch, RefreshCw, Archive, Download, ArrowUpFromLine, ArrowDownToLine, AlertCircle, CheckCircle2, XCircle, Loader2, FolderGit2, Search, ChevronLeft, ChevronRight, Settings, Rocket, FolderKanban, Hammer, Package, X, Filter, FileText, Upload, Play, Square, Trash2, ExternalLink, RotateCw, Copy, Terminal, Activity, Server } from 'lucide-react'
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
    isFolder: boolean
}

interface GitResult {
    success: boolean
    output: string
    error: string
    command: string
}

interface Deployment {
    id: string
    projectName: string
    projectPath: string
    warFileName: string
    warFilePath: string
    warFileSize: number
    fileType: 'WAR' | 'JAR'
    status: 'pending' | 'deployed' | 'running'
    tomcatPath: string | null
    tomcatName: string | null
    contextPath?: string
    createdAt: string
    deployedAt: string | null
}

interface TomcatInfo {
    name: string
    path: string
    version: string
    hasWebapps: boolean
}

interface TestSuite {
    name: string
    className: string
    path: string
    type: 'junit' | 'cucumber' | 'xifinportal' | 'engine' | 'restapi'
}

const API_BASE = 'http://localhost:8080/api'
const ITEMS_PER_PAGE_OPTIONS = [6, 12, 24, 48]
const STORAGE_KEY = 'jacoco-runner-base-path'
const TOMCAT_STORAGE_KEY = 'jacoco-runner-tomcat-base-path'
const SELECTED_TOMCAT_KEY = 'jacoco-runner-selected-tomcat-path'

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

    // Deployment states
    const [deployments, setDeployments] = useState<Deployment[]>([])
    const [tomcatBasePath, setTomcatBasePath] = useState('')
    const [tomcats, setTomcats] = useState<TomcatInfo[]>([])
    const [selectedTomcat, setSelectedTomcat] = useState<TomcatInfo | null>(null)
    const [deployLoading, setDeployLoading] = useState<string | null>(null)
    const [runningTomcats, setRunningTomcats] = useState<Set<string>>(new Set())
    const [loadingTomcats, setLoadingTomcats] = useState(false)

    // Test states
    const [selectedTestProject, setSelectedTestProject] = useState<Project | null>(null)
    const [testCommand, setTestCommand] = useState('mvn test')
    const [testRunning, setTestRunning] = useState(false)
    const [testLog, setTestLog] = useState('')
    const [testSuites, setTestSuites] = useState<TestSuite[]>([])
    const [selectedSuites, setSelectedSuites] = useState<Set<string>>(new Set())
    const [loadingSuites, setLoadingSuites] = useState(false)
    const [activeTestTab, setActiveTestTab] = useState<string>('all')
    const [orgAlias, setOrgAlias] = useState('qa07')
    const [userId, setUserId] = useState('chava')
    const [username] = useState('webservicetest')
    const [password] = useState('webservicetest')

    // Environment Profiles
    interface EnvironmentProfile {
        name: string
        databaseIp: string
        userId: string
        orgAlias: string
        hubUrl: string
        color: string
    }

    const environmentProfiles: EnvironmentProfile[] = [
        { name: 'QA07', databaseIp: '192.168.84.55', userId: 'chava', orgAlias: 'qa07', hubUrl: 'http://localhost:', color: 'bg-blue-500' },
        { name: 'QA08', databaseIp: '192.168.84.56', userId: 'qatester', orgAlias: 'qa08', hubUrl: 'http://localhost:', color: 'bg-green-500' },
        { name: 'QA09', databaseIp: '192.168.84.57', userId: 'chava', orgAlias: 'qa09', hubUrl: 'http://localhost:', color: 'bg-purple-500' },
        { name: 'QA10', databaseIp: '192.168.84.58', userId: 'chava', orgAlias: 'qa10', hubUrl: 'http://localhost:', color: 'bg-orange-500' },
    ]

    const [selectedProfile, setSelectedProfile] = useState<EnvironmentProfile | null>(environmentProfiles[0])

    // Database Configuration states
    const [databaseIps] = useState<string[]>(['192.168.84.55', '192.168.84.56', '192.168.84.57', '192.168.84.58'])
    const [selectedDatabase, setSelectedDatabase] = useState<string>('192.168.84.55')
    const [selectedConfigProjects, setSelectedConfigProjects] = useState<Set<string>>(new Set())
    const [configLoading, setConfigLoading] = useState(false)
    const [configResults, setConfigResults] = useState<{ projectName: string; filesUpdated: number; success: boolean; files?: string[] }[]>([])
    const [hubUrl, setHubUrl] = useState('http://localhost:')
    const [configOrgAlias, setConfigOrgAlias] = useState('qa07')
    const [configUserId, setConfigUserId] = useState('chava')

    // Apply environment profile
    const applyEnvironmentProfile = (profile: EnvironmentProfile) => {
        setSelectedProfile(profile)
        setSelectedDatabase(profile.databaseIp)
        setConfigUserId(profile.userId)
        setConfigOrgAlias(profile.orgAlias)
        setHubUrl(profile.hubUrl)
        showNotification('success', `Loaded profile: ${profile.name}`)
    }

    // Selenium Grid state
    const [seleniumHubRunning, setSeleniumHubRunning] = useState(false)
    const [seleniumNodeCount, setSeleniumNodeCount] = useState(0)
    const [seleniumLoading, setSeleniumLoading] = useState(false)
    const [seleniumHubPath] = useState('D:\\Selenium4\\SeleniumHub.bat')
    const [seleniumNodePath] = useState('D:\\Selenium4\\SeleniumNodeStart.bat')

    // Check Selenium Grid status
    const checkSeleniumStatus = async () => {
        try {
            const response = await fetch(`${API_BASE}/selenium/status`)
            if (response.ok) {
                const data = await response.json()
                setSeleniumHubRunning(data.hubRunning)
                setSeleniumNodeCount(data.nodeCount || 0)
            }
        } catch (error) {
            setSeleniumHubRunning(false)
            setSeleniumNodeCount(0)
        }
    }

    // Start Selenium Hub
    const startSeleniumHub = async () => {
        setSeleniumLoading(true)
        try {
            const response = await fetch(`${API_BASE}/selenium/start-hub`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hubPath: seleniumHubPath })
            })
            if (response.ok) {
                showNotification('success', 'Selenium Hub starting...')
                // Wait and check status
                setTimeout(() => checkSeleniumStatus(), 4000)
            } else {
                showNotification('error', 'Failed to start Selenium Hub')
            }
        } catch (error) {
            showNotification('error', 'Failed to start Selenium Hub')
        } finally {
            setSeleniumLoading(false)
        }
    }

    // Start Selenium Node
    const startSeleniumNode = async () => {
        setSeleniumLoading(true)
        try {
            const response = await fetch(`${API_BASE}/selenium/start-node`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodePath: seleniumNodePath })
            })
            if (response.ok) {
                showNotification('success', 'Selenium Node starting...')
                // Wait and check status
                setTimeout(() => checkSeleniumStatus(), 4000)
            } else {
                showNotification('error', 'Failed to start Selenium Node')
            }
        } catch (error) {
            showNotification('error', 'Failed to start Selenium Node')
        } finally {
            setSeleniumLoading(false)
        }
    }

    // Stop all Selenium
    const stopSelenium = async () => {
        setSeleniumLoading(true)
        try {
            const response = await fetch(`${API_BASE}/selenium/stop-all`, {
                method: 'POST'
            })
            if (response.ok) {
                showNotification('success', 'Selenium Grid stopped')
                setSeleniumHubRunning(false)
                setSeleniumNodeCount(0)
            } else {
                showNotification('error', 'Failed to stop Selenium Grid')
            }
        } catch (error) {
            showNotification('error', 'Failed to stop Selenium Grid')
        } finally {
            setSeleniumLoading(false)
        }
    }

    // ChromeDriver state
    const [chromeDriverInfo, setChromeDriverInfo] = useState<{
        chromeVersion: string
        latestDriverVersion: string
        installedDriverVersion: string
        updateAvailable: boolean
    } | null>(null)
    const [chromeDriverLoading, setChromeDriverLoading] = useState(false)

    // Check ChromeDriver info
    const checkChromeDriverInfo = async () => {
        setChromeDriverLoading(true)
        try {
            const response = await fetch(`${API_BASE}/selenium/chromedriver-info`)
            if (response.ok) {
                const data = await response.json()
                setChromeDriverInfo(data)
            }
        } catch (error) {
            showNotification('error', 'Failed to check ChromeDriver info')
        } finally {
            setChromeDriverLoading(false)
        }
    }

    // Download latest ChromeDriver
    const downloadChromeDriver = async () => {
        setChromeDriverLoading(true)
        showNotification('success', 'Downloading ChromeDriver... This may take a moment.')
        try {
            const response = await fetch(`${API_BASE}/selenium/download-chromedriver`, {
                method: 'POST'
            })
            if (response.ok) {
                const data = await response.json()
                showNotification('success', data.message || 'ChromeDriver downloaded successfully!')
                // Refresh info
                await checkChromeDriverInfo()
            } else {
                const error = await response.json()
                showNotification('error', error.error || 'Failed to download ChromeDriver')
            }
        } catch (error) {
            showNotification('error', 'Failed to download ChromeDriver')
        } finally {
            setChromeDriverLoading(false)
        }
    }

    // Quick Start All - Start Hub + Node in sequence
    const quickStartSelenium = async () => {
        setSeleniumLoading(true)

        // Step 1: Start Hub
        showNotification('success', 'Starting Selenium Hub...')
        try {
            const hubResponse = await fetch(`${API_BASE}/selenium/start-hub`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hubPath: seleniumHubPath })
            })

            if (!hubResponse.ok) {
                showNotification('error', 'Failed to start Hub')
                setSeleniumLoading(false)
                return
            }

            // Wait for Hub to be ready
            await new Promise(resolve => setTimeout(resolve, 4000))
            await checkSeleniumStatus()

            if (!seleniumHubRunning) {
                // Check again
                const statusResponse = await fetch(`${API_BASE}/selenium/status`)
                if (statusResponse.ok) {
                    const data = await statusResponse.json()
                    if (!data.hubRunning) {
                        showNotification('error', 'Hub failed to start')
                        setSeleniumLoading(false)
                        return
                    }
                    setSeleniumHubRunning(data.hubRunning)
                }
            }

            // Step 2: Start Node
            showNotification('success', 'Hub started! Starting Node...')
            const nodeResponse = await fetch(`${API_BASE}/selenium/start-node`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodePath: seleniumNodePath })
            })

            if (nodeResponse.ok) {
                await new Promise(resolve => setTimeout(resolve, 3000))
                await checkSeleniumStatus()
                showNotification('success', 'Selenium Grid is ready! Hub + Node running.')
            } else {
                showNotification('error', 'Failed to start Node')
            }
        } catch (error) {
            showNotification('error', 'Failed to start Selenium Grid')
        } finally {
            setSeleniumLoading(false)
        }
    }

    // Load basePath and tomcatPath from localStorage on mount
    useEffect(() => {
        const savedPath = localStorage.getItem(STORAGE_KEY)
        if (savedPath) {
            setBasePath(savedPath)
        } else {
            setBasePath('D:\\learn')
        }

        const savedTomcat = localStorage.getItem(TOMCAT_STORAGE_KEY)
        if (savedTomcat) {
            setTomcatBasePath(savedTomcat)
        } else {
            setTomcatBasePath('D:\\opt')
        }
    }, [])

    // Auto-load projects when basePath changes (from localStorage or input)
    useEffect(() => {
        if (basePath) {
            loadProjects()
        }
    }, [basePath])

    // Auto-check Selenium status when switching to test tab
    useEffect(() => {
        if (activeTab === 'test') {
            checkSeleniumStatus()
            checkChromeDriverInfo()
        }
    }, [activeTab])

    // Auto-load Tomcats when tomcatBasePath changes
    useEffect(() => {
        if (tomcatBasePath) {
            loadTomcats()
        }
    }, [tomcatBasePath])

    // Reset to page 1 when search query or filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, filterType])

    // Load test suites when project changes
    useEffect(() => {
        if (selectedTestProject) {
            loadTestSuites()
        } else {
            setTestSuites([])
            setSelectedSuites(new Set())
        }
    }, [selectedTestProject])

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

    // Navigate into a folder
    const navigateToFolder = (folderPath: string) => {
        setBasePath(folderPath)
        setProjects([])
    }

    // Navigate up to parent directory
    const navigateUp = () => {
        const parentPath = basePath.replace(/[/\\][^/\\]+$/, '')
        if (parentPath && parentPath !== basePath) {
            setBasePath(parentPath)
            setProjects([])
        }
    }

    // Auto-load when basePath changes from navigation
    useEffect(() => {
        if (basePath && projects.length === 0 && !isLoading) {
            loadProjects()
        }
    }, [basePath])

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

    // Prepare deployment - copy WAR and switch to deploy tab
    const prepareDeployment = async (project: Project) => {
        setLoadingProject(project.path)
        setLoadingAction('Preparing deployment')

        try {
            const response = await fetch(`${API_BASE}/deploy/prepare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectPath: project.path, projectName: project.name })
            })

            if (response.ok) {
                const deployment = await response.json()

                // If Tomcat is selected, deploy immediately
                if (selectedTomcat) {
                    showNotification('success', `Auto-deploying to ${selectedTomcat.name}...`)
                    const deployRes = await fetch(`${API_BASE}/deploy/to-tomcat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deploymentId: deployment.id, tomcatPath: selectedTomcat.path })
                    })

                    if (deployRes.ok) {
                        showNotification('success', `Deployed ${project.name} to ${selectedTomcat.name}`)
                    } else {
                        showNotification('error', `Failed to auto-deploy to ${selectedTomcat.name}`)
                    }
                } else {
                    showNotification('success', `Deployment prepared for ${project.name}`)
                }

                await loadDeployments()
                setActiveTab('deploy') // Switch to deploy tab
            } else {
                const error = await response.json()
                showNotification('error', error.error || 'Failed to prepare deployment')
            }
        } catch (error) {
            showNotification('error', 'Failed to prepare deployment')
        } finally {
            setLoadingProject(null)
            setLoadingAction(null)
        }
    }

    // Load deployments list
    const loadDeployments = async () => {
        try {
            const response = await fetch(`${API_BASE}/deploy/list`)
            if (response.ok) {
                const data = await response.json()
                setDeployments(data)
            }
        } catch (error) {
            console.error('Failed to load deployments')
        }
    }

    // Load Tomcats from base path
    const loadTomcats = async () => {
        if (!tomcatBasePath) return

        setLoadingTomcats(true)
        try {
            const response = await fetch(`${API_BASE}/deploy/tomcats?basePath=${encodeURIComponent(tomcatBasePath)}`)
            if (response.ok) {
                const data = await response.json()
                setTomcats(data)
                localStorage.setItem(TOMCAT_STORAGE_KEY, tomcatBasePath)

                // Try to restore selected tomcat from localStorage
                const savedSelectedPath = localStorage.getItem(SELECTED_TOMCAT_KEY)
                let restored = false

                if (savedSelectedPath) {
                    const found = data.find((t: TomcatInfo) => t.path === savedSelectedPath)
                    if (found) {
                        setSelectedTomcat(found)
                        restored = true
                    }
                }

                // Fallback to first one if not restored or not selected
                if (!restored && data.length > 0 && !selectedTomcat) {
                    setSelectedTomcat(data[0])
                }
            }
        } catch (error) {
            showNotification('error', 'Failed to load Tomcats')
        } finally {
            setLoadingTomcats(false)
        }
    }

    // Deploy to Tomcat
    const deployToTomcat = async (deploymentId: string) => {
        if (!selectedTomcat) {
            showNotification('error', 'Please select a Tomcat first')
            return
        }

        setDeployLoading(deploymentId)

        try {
            const response = await fetch(`${API_BASE}/deploy/to-tomcat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deploymentId, tomcatPath: selectedTomcat.path })
            })

            if (response.ok) {
                showNotification('success', `Deployed to ${selectedTomcat.name} successfully`)
                await loadDeployments()
            } else {
                const error = await response.json()
                showNotification('error', error.error || 'Failed to deploy')
            }
        } catch (error) {
            showNotification('error', 'Failed to deploy to Tomcat')
        } finally {
            setDeployLoading(null)
        }
    }

    // Deploy All to selected Tomcat
    const deployAllToTomcat = async (targetTomcat: TomcatInfo | null = selectedTomcat) => {
        if (!targetTomcat) {
            showNotification('error', 'Please select a Tomcat first')
            return
        }

        const targets = deployments // Deploy ALL
        if (targets.length === 0) return

        setDeployLoading('all')

        try {
            let successCount = 0
            for (const deployment of targets) {
                // Skip if already deployed to THIS tomcat 
                // Note: We might want to force redeploy, but for now let's skip exact matches to save time
                if (deployment.status === 'deployed' && deployment.tomcatPath === targetTomcat.path) {
                    continue;
                }

                try {
                    const response = await fetch(`${API_BASE}/deploy/to-tomcat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deploymentId: deployment.id, tomcatPath: targetTomcat.path })
                    })

                    if (response.ok) {
                        successCount++
                    }
                } catch (e) {
                    console.error(`Failed to deploy ${deployment.projectName}`, e)
                }
            }

            if (successCount > 0) {
                showNotification('success', `Deployed ${successCount} projects to ${targetTomcat.name}`)
                await loadDeployments()
            } else {
                showNotification('success', 'All projects are already on this Tomcat')
            }
        } catch (error) {
            showNotification('error', 'Batch deployment failed')
        } finally {
            setDeployLoading(null)
        }
    }

    // Start Tomcat - accepts tomcat directly
    const startTomcatServer = (tomcat: TomcatInfo) => {
        const tomcatPath = tomcat.path
        const tomcatName = tomcat.name

        // Update status immediately (optimistic update)
        setRunningTomcats(prev => new Set([...prev, tomcatPath]))
        showNotification('success', `Starting ${tomcatName}...`)

        // Fire API call without blocking UI
        fetch(`${API_BASE}/deploy/tomcat/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tomcatPath })
        }).catch(error => {
            // Revert status if API call fails
            setRunningTomcats(prev => {
                const newSet = new Set(prev)
                newSet.delete(tomcatPath)
                return newSet
            })
            showNotification('error', 'Failed to start Tomcat')
        })
    }

    // Stop Tomcat - accepts tomcat directly
    const stopTomcatServer = (tomcat: TomcatInfo) => {
        const tomcatPath = tomcat.path
        const tomcatName = tomcat.name

        // Update status immediately (optimistic update)
        setRunningTomcats(prev => {
            const newSet = new Set(prev)
            newSet.delete(tomcatPath)
            return newSet
        })
        showNotification('success', `Stopping ${tomcatName}...`)

        // Fire API call without blocking UI
        fetch(`${API_BASE}/deploy/tomcat/stop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tomcatPath })
        }).catch(error => {
            // Revert status if API call fails
            setRunningTomcats(prev => new Set([...prev, tomcatPath]))
            showNotification('error', 'Failed to stop Tomcat')
        })
    }

    // Apply database configuration to selected projects (properties files only)
    const applyDatabaseConfig = async () => {
        if (selectedConfigProjects.size === 0) {
            showNotification('error', 'Please select at least one project')
            return
        }

        setConfigLoading(true)
        setConfigResults([])

        const results: { projectName: string; filesUpdated: number; success: boolean; files?: string[] }[] = []

        for (const projectPath of selectedConfigProjects) {
            const project = projects.find(p => p.path === projectPath)
            if (!project) continue

            try {
                const response = await fetch(`${API_BASE}/config/replace-database`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectPath: project.path,
                        newDatabaseIp: selectedDatabase
                    })
                })

                if (response.ok) {
                    const data = await response.json()
                    results.push({
                        projectName: project.name,
                        filesUpdated: data.filesUpdated || 0,
                        success: true,
                        files: data.updatedFiles || []
                    })
                } else {
                    results.push({
                        projectName: project.name,
                        filesUpdated: 0,
                        success: false
                    })
                }
            } catch (error) {
                results.push({
                    projectName: project.name,
                    filesUpdated: 0,
                    success: false
                })
            }
        }

        setConfigResults(results)
        setConfigLoading(false)

        const successCount = results.filter(r => r.success).length
        const totalFiles = results.reduce((sum, r) => sum + r.filesUpdated, 0)
        showNotification('success', `Updated ${totalFiles} files in ${successCount}/${results.length} projects`)
    }

    // Apply test suite configuration to qa-rpmoverall project (XML files only)
    const applyTestSuiteConfig = async () => {
        // Find qa-rpmoverall project
        const qaProject = projects.find(p => p.name.toLowerCase().includes('qa-rpmoverall'))
        if (!qaProject) {
            showNotification('error', 'qa-rpmoverall project not found. Please load projects first.')
            return
        }

        setConfigLoading(true)
        setConfigResults([])

        // Compute SSO credentials from username and userId
        const ssoUsername = `${username}_${configUserId}`
        const ssoPassword = `${password}_${configUserId}`

        try {
            const response = await fetch(`${API_BASE}/config/replace-testsuite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectPath: qaProject.path,
                    hub: hubUrl,
                    ssoUsername: ssoUsername,
                    ssoPassword: ssoPassword,
                    orgAlias: configOrgAlias
                })
            })

            if (response.ok) {
                const data = await response.json()
                setConfigResults([{
                    projectName: qaProject.name,
                    filesUpdated: data.filesUpdated || 0,
                    success: true,
                    files: data.updatedFiles || []
                }])
                showNotification('success', `Updated ${data.filesUpdated} test suite files in ${qaProject.name}`)
            } else {
                setConfigResults([{
                    projectName: qaProject.name,
                    filesUpdated: 0,
                    success: false
                }])
                showNotification('error', 'Failed to update test suite configuration')
            }
        } catch (error) {
            setConfigResults([{
                projectName: qaProject.name,
                filesUpdated: 0,
                success: false
            }])
            showNotification('error', 'Failed to update test suite configuration')
        } finally {
            setConfigLoading(false)
        }
    }

    // Toggle config project selection
    const toggleConfigProjectSelection = (projectPath: string) => {
        const newSelected = new Set(selectedConfigProjects)
        if (newSelected.has(projectPath)) {
            newSelected.delete(projectPath)
        } else {
            newSelected.add(projectPath)
        }
        setSelectedConfigProjects(newSelected)
    }

    // Select all Maven projects for config
    const selectAllMavenProjectsForConfig = () => {
        const mavenPaths = projects.filter(p => p.isMavenProject).map(p => p.path)
        setSelectedConfigProjects(new Set(mavenPaths))
    }

    // Clear all config project selections
    const clearConfigProjectSelections = () => {
        setSelectedConfigProjects(new Set())
    }

    // Apply all configurations (Database + Test Suite) at once
    const applyAllConfigs = async () => {
        if (selectedConfigProjects.size === 0) {
            showNotification('error', 'Please select at least one project for database config')
            return
        }

        setConfigLoading(true)
        setConfigResults([])

        const results: { projectName: string; filesUpdated: number; success: boolean; files?: string[] }[] = []

        // 1. Apply Database Config to selected projects
        showNotification('success', 'Applying database configuration...')
        for (const projectPath of selectedConfigProjects) {
            const project = projects.find(p => p.path === projectPath)
            if (!project) continue

            try {
                const response = await fetch(`${API_BASE}/config/replace-database`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectPath: project.path,
                        newDatabaseIp: selectedDatabase
                    })
                })

                if (response.ok) {
                    const data = await response.json()
                    results.push({
                        projectName: `[DB] ${project.name}`,
                        filesUpdated: data.filesUpdated || 0,
                        success: true,
                        files: data.updatedFiles || []
                    })
                } else {
                    results.push({
                        projectName: `[DB] ${project.name}`,
                        filesUpdated: 0,
                        success: false
                    })
                }
            } catch (error) {
                results.push({
                    projectName: `[DB] ${project.name}`,
                    filesUpdated: 0,
                    success: false
                })
            }
        }

        // 2. Apply Test Suite Config to qa-rpmoverall
        const qaProject = projects.find(p => p.name.toLowerCase().includes('qa-rpmoverall'))
        if (qaProject) {
            showNotification('success', 'Applying test suite configuration...')
            const ssoUsername = `${username}_${configUserId}`
            const ssoPassword = `${password}_${configUserId}`

            try {
                const response = await fetch(`${API_BASE}/config/replace-testsuite`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectPath: qaProject.path,
                        hub: hubUrl,
                        ssoUsername: ssoUsername,
                        ssoPassword: ssoPassword,
                        orgAlias: configOrgAlias
                    })
                })

                if (response.ok) {
                    const data = await response.json()
                    results.push({
                        projectName: `[TestSuite] ${qaProject.name}`,
                        filesUpdated: data.filesUpdated || 0,
                        success: true,
                        files: data.updatedFiles || []
                    })
                } else {
                    results.push({
                        projectName: `[TestSuite] ${qaProject.name}`,
                        filesUpdated: 0,
                        success: false
                    })
                }
            } catch (error) {
                results.push({
                    projectName: `[TestSuite] ${qaProject.name}`,
                    filesUpdated: 0,
                    success: false
                })
            }
        }

        setConfigResults(results)
        setConfigLoading(false)

        const successCount = results.filter(r => r.success).length
        const totalFiles = results.reduce((sum, r) => sum + r.filesUpdated, 0)
        showNotification('success', `Applied all configs: ${totalFiles} files in ${successCount}/${results.length} operations`)
    }

    // Load test suites for selected project
    const loadTestSuites = async () => {
        if (!selectedTestProject) return

        setLoadingSuites(true)
        try {
            const response = await fetch(`${API_BASE}/test/suites?projectPath=${encodeURIComponent(selectedTestProject.path)}`)
            if (response.ok) {
                const data = await response.json()
                setTestSuites(data)
            } else {
                showNotification('error', 'Failed to load test suites')
            }
        } catch (error) {
            showNotification('error', 'Cannot load test suites')
        } finally {
            setLoadingSuites(false)
        }
    }

    // Toggle test suite selection
    const toggleSuiteSelection = (className: string) => {
        const newSelected = new Set(selectedSuites)
        if (newSelected.has(className)) {
            newSelected.delete(className)
        } else {
            newSelected.add(className)
        }
        setSelectedSuites(newSelected)
    }

    // Select all test suites (context-aware based on active tab)
    const selectAllSuites = () => {
        let suitesToSelect: TestSuite[]

        if (activeTestTab === 'all') {
            suitesToSelect = testSuites
        } else {
            suitesToSelect = testSuites.filter(s => s.type === activeTestTab)
        }

        setSelectedSuites(new Set(suitesToSelect.map(s => s.className)))
    }

    // Clear all selections (context-aware based on active tab)
    const clearAllSelections = () => {
        if (activeTestTab === 'all') {
            // Clear all selections
            setSelectedSuites(new Set())
        } else {
            // Clear only selections of current tab type
            const suitesToClear = testSuites.filter(s => s.type === activeTestTab).map(s => s.className)
            const newSelected = new Set(selectedSuites)
            suitesToClear.forEach(className => newSelected.delete(className))
            setSelectedSuites(newSelected)
        }
    }

    // Helper function to remove file extension from test suite name
    const removeFileExtension = (fileName: string): string => {
        return fileName.replace(/\.(xml|properties|suite|json|feature)$/i, '')
    }

    // Run Test
    const runTest = async () => {
        if (!selectedTestProject) {
            showNotification('error', 'Please select a project first')
            return
        }

        setTestRunning(true)

        // Clear log on backend before starting
        try {
            await fetch(`${API_BASE}/test/clear-log?projectPath=${encodeURIComponent(selectedTestProject.path)}`, {
                method: 'POST'
            })
        } catch (e) {
            console.error('Failed to clear log', e)
        }

        setTestLog('Starting test execution...\n')

        try {
            const selectedSuitesArray = Array.from(selectedSuites)

            if (selectedSuitesArray.length === 0) {
                // No suites selected, use custom command
                const res = await fetch(`${API_BASE}/test/run`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectPath: selectedTestProject.path,
                        command: testCommand,
                        openTerminal: true  // Open real CMD window
                    })
                })

                if (!res.ok) throw new Error('Failed to trigger test')

                // Don't need to poll, CMD window will show everything
                setTestRunning(false)
                showNotification('success', 'Test started in CMD window')
            } else {
                // Run suites sequentially in ONE CMD window
                const commands: string[] = []

                for (let i = 0; i < selectedSuitesArray.length; i++) {
                    const suiteName = selectedSuitesArray[i]
                    const suiteInfo = testSuites.find(s => s.className === suiteName)

                    // Remove file extension from suite name
                    const suiteNameWithoutExt = removeFileExtension(suiteName)

                    // Build command based on test type
                    let command: string

                    if (suiteInfo?.type === 'restapi') {
                        // REST API tests - uses restassured\test\ path
                        command = `mvn clean test -DOrgAlias=${orgAlias} -DUserId=${userId} -DUsername=${username} -DPassword=${password} -Denforcer.skip -DtestSuite=restassured\\${suiteNameWithoutExt}`
                    } else if (suiteInfo?.type === 'xifinportal') {
                        command = `mvn clean test -DforkCount=0 -Dmaven.surefire.debug -DreuseForks=false -DorgAlias=${orgAlias} -DtestSuite=newXp\\${suiteNameWithoutExt}`
                    } else if (suiteInfo?.type === 'engine') {
                        command = `mvn clean test -DforkCount=0 -Dmaven.surefire.debug -DreuseForks=false -DorgAlias=${orgAlias} -DtestSuite=pfEngines\\${suiteNameWithoutExt}`
                    } else {
                        command = `mvn test -Dtest=${suiteNameWithoutExt}`
                    }

                    commands.push(command)
                    setTestLog(prev => prev + `Suite ${i + 1}: ${suiteName}\n`)
                    setTestLog(prev => prev + `Command: ${command}\n\n`)
                }

                // Chain all commands with && (run sequentially in one CMD)
                const chainedCommand = commands.join(' && ')

                setTestLog(prev => prev + `Opening 1 CMD window to run ${selectedSuitesArray.length} test suites sequentially...\n\n`)

                const res = await fetch(`${API_BASE}/test/run`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectPath: selectedTestProject.path,
                        command: chainedCommand,
                        openTerminal: true  // Open ONE CMD window
                    })
                })

                if (!res.ok) {
                    showNotification('error', 'Failed to start test execution')
                } else {
                    setTestLog(prev => prev + `✅ CMD window opened\n`)
                    setTestLog(prev => prev + `Running ${selectedSuitesArray.length} test suites sequentially\n`)
                    setTestLog(prev => prev + `Check CMD window for real-time progress\n`)
                    showNotification('success', `Running ${selectedSuitesArray.length} suites in 1 CMD window`)
                }

                setTestRunning(false)
            }

        } catch (e) {
            showNotification('error', 'Failed to start test')
            setTestRunning(false)
        }
    }

    // Remove deployment
    const removeDeployment = async (deploymentId: string) => {
        try {
            await fetch(`${API_BASE}/deploy/${deploymentId}`, { method: 'DELETE' })
            await loadDeployments()
            showNotification('success', 'Deployment removed')
        } catch (error) {
            showNotification('error', 'Failed to remove deployment')
        }
    }

    // Open deployed app in browser
    const openInBrowser = (deployment: Deployment) => {
        if (!deployment.contextPath) return
        const url = `http://localhost:8080${deployment.contextPath}`
        window.open(url, '_blank')
    }

    // Re-deploy: Build -> Prepare -> Deploy
    const handleRedeploy = async (deployment: Deployment) => {
        if (!selectedTomcat) {
            showNotification('error', 'Please select a Tomcat first')
            return
        }

        setDeployLoading(deployment.id)

        try {
            // 1. Trigger Build
            showNotification('success', `Building ${deployment.projectName}...`)
            const buildRes = await fetch(`${API_BASE}/projects/maven/build`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectPath: deployment.projectPath })
            })

            const buildResult = await buildRes.json()
            if (!buildResult.success) {
                throw new Error(buildResult.error || 'Build failed')
            }

            // 2. Prepare Deployment
            showNotification('success', `Preparing artifact...`)
            const prepRes = await fetch(`${API_BASE}/deploy/prepare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectPath: deployment.projectPath,
                    projectName: deployment.projectName
                })
            })

            if (!prepRes.ok) throw new Error('Failed to prepare deployment')
            const newDeployment = await prepRes.json()

            // 3. Deploy to Tomcat
            showNotification('success', `Deploying to ${selectedTomcat.name}...`)
            const deployRes = await fetch(`${API_BASE}/deploy/to-tomcat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deploymentId: newDeployment.id,
                    tomcatPath: selectedTomcat.path
                })
            })

            if (!deployRes.ok) throw new Error('Failed to deploy to Tomcat')

            showNotification('success', 'Re-deploy completed successfully')

            // Clean up old deployment if it's different ID (optional, but good for cleanup)
            if (newDeployment.id !== deployment.id) {
                await fetch(`${API_BASE}/deploy/${deployment.id}`, { method: 'DELETE' })
            }

            await loadDeployments()

        } catch (error: any) {
            showNotification('error', error.message || 'Re-deploy failed')
        } finally {
            setDeployLoading(null)
        }
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
                    <TabsList className="grid w-full grid-cols-5 h-12">
                        <TabsTrigger value="projects" className="flex items-center gap-2 text-sm">
                            <FolderGit2 className="w-4 h-4" />
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
                        <TabsTrigger value="test" className="flex items-center gap-2 text-sm">
                            <TestTube2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Run Test</span>
                        </TabsTrigger>
                        <TabsTrigger value="jenkins" className="flex items-center gap-2 text-sm">
                            <FolderKanban className="w-4 h-4" />
                            <span className="hidden sm:inline">Jenkins</span>
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
                                        onClick={navigateUp}
                                        disabled={isLoading || !basePath || basePath.split(/[/\\]/).length <= 2}
                                        variant="outline"
                                        title="Go to parent folder"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
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
                                        <Card
                                            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col ${project.isFolder
                                                ? 'border-l-4 border-l-blue-500 cursor-pointer hover:bg-accent/50'
                                                : project.isGitRepo
                                                    ? 'border-l-4 border-l-green-500'
                                                    : 'border-l-4 border-l-gray-400'
                                                }`}
                                            onClick={() => project.isFolder && navigateToFolder(project.path)}
                                        >
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
                                                        {project.isFolder ? (
                                                            <FolderOpen className="w-5 h-5 flex-shrink-0 text-blue-500" />
                                                        ) : (
                                                            <FolderGit2 className={`w-5 h-5 flex-shrink-0 ${project.isGitRepo ? 'text-green-500' : 'text-gray-400'}`} />
                                                        )}
                                                        <CardTitle className="text-lg truncate" title={project.name}>{project.name}</CardTitle>
                                                    </div>
                                                    {project.isFolder ? (
                                                        <Badge variant="outline" className="text-blue-500 border-blue-500/50 flex-shrink-0">
                                                            <FolderOpen className="w-3 h-3 mr-1" />
                                                            Folder
                                                        </Badge>
                                                    ) : project.isGitRepo && project.hasUncommittedChanges && (
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
                                                {project.isFolder ? (
                                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                                                        <FolderOpen className="w-12 h-12 text-blue-400/50 mb-2" />
                                                        <p className="text-sm text-muted-foreground">Click to enter folder</p>
                                                    </div>
                                                ) : project.isGitRepo ? (
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

                                                        {/* Deploy - Only show for Maven projects with successful build */}
                                                        {project.isMavenProject && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => prepareDeployment(project)}
                                                                disabled={isProjectLoading(project.path)}
                                                                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                                            >
                                                                <Upload className="w-4 h-4 mr-1" />
                                                                Deploy
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
                        {/* Environment Profiles Quick Switch */}
                        <Card className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500 rounded-lg">
                                            <Settings className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-indigo-700 dark:text-indigo-300">Environment Profiles</h3>
                                            <p className="text-xs text-muted-foreground">Quick switch between QA environments</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {environmentProfiles.map((profile) => (
                                            <Button
                                                key={profile.name}
                                                variant={selectedProfile?.name === profile.name ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => applyEnvironmentProfile(profile)}
                                                className={`h-9 px-4 font-semibold transition-all ${selectedProfile?.name === profile.name
                                                    ? `${profile.color} text-white border-0 shadow-lg scale-105`
                                                    : 'hover:scale-105'
                                                    }`}
                                            >
                                                {profile.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                {selectedProfile && (
                                    <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800">
                                        <div className="flex flex-wrap gap-4 text-xs">
                                            <span className="flex items-center gap-1">
                                                <span className="text-muted-foreground">Database:</span>
                                                <code className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 rounded font-mono text-indigo-600 dark:text-indigo-400">{selectedProfile.databaseIp}</code>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="text-muted-foreground">UserId:</span>
                                                <code className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 rounded font-mono text-purple-600 dark:text-purple-400">{selectedProfile.userId}</code>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="text-muted-foreground">OrgAlias:</span>
                                                <code className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 rounded font-mono text-cyan-600 dark:text-cyan-400">{selectedProfile.orgAlias}</code>
                                            </span>
                                            <div className="flex-1" />
                                            <Button
                                                onClick={applyAllConfigs}
                                                disabled={configLoading || selectedConfigProjects.size === 0}
                                                size="sm"
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg"
                                            >
                                                {configLoading ? (
                                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Applying...</>
                                                ) : (
                                                    <><Rocket className="w-4 h-4 mr-2" />Apply All Configs</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Column: Two Config Cards */}
                            <div className="lg:col-span-5 space-y-4">
                                {/* Card 1: Database Configuration */}
                                <Card className="border-t-4 border-t-purple-500 shadow-lg">
                                    <CardHeader className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-b pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg text-purple-600 dark:text-purple-400">
                                            <Settings className="w-5 h-5" />
                                            Database Configuration
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Replace database IP in .properties files
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4">
                                        {/* Database Selection */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Database Server</Label>
                                            <select
                                                className="w-full h-10 px-3 rounded-lg border-2 border-purple-200 dark:border-purple-900 bg-white dark:bg-zinc-950 text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                value={selectedDatabase}
                                                onChange={(e) => setSelectedDatabase(e.target.value)}
                                            >
                                                {databaseIps.map(ip => (
                                                    <option key={ip} value={ip} className="dark:bg-zinc-950">{ip}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Project Selection */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-medium">
                                                    Projects
                                                    {selectedConfigProjects.size > 0 && (
                                                        <Badge variant="secondary" className="ml-2 text-xs">
                                                            {selectedConfigProjects.size}
                                                        </Badge>
                                                    )}
                                                </Label>
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" onClick={selectAllMavenProjectsForConfig} className="h-6 text-xs px-2">
                                                        All
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={clearConfigProjectSelections} className="h-6 text-xs px-2">
                                                        Clear
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-1 max-h-[180px] overflow-y-auto border rounded-lg p-2 bg-muted/30">
                                                {projects.filter(p => p.isMavenProject).length === 0 ? (
                                                    <p className="text-xs text-muted-foreground text-center py-2">
                                                        No Maven projects found.
                                                    </p>
                                                ) : (
                                                    projects.filter(p => p.isMavenProject).map((project) => (
                                                        <div
                                                            key={project.path}
                                                            onClick={() => toggleConfigProjectSelection(project.path)}
                                                            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all hover:bg-accent ${selectedConfigProjects.has(project.path)
                                                                ? 'bg-purple-500/10 border border-purple-500/30'
                                                                : 'border border-transparent'
                                                                }`}
                                                        >
                                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedConfigProjects.has(project.path)
                                                                ? 'bg-purple-500 border-purple-500'
                                                                : 'border-muted-foreground/30'
                                                                }`}>
                                                                {selectedConfigProjects.has(project.path) && (
                                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-medium truncate">{project.name}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Apply Button */}
                                        <Button
                                            onClick={applyDatabaseConfig}
                                            disabled={selectedConfigProjects.size === 0 || configLoading}
                                            className="w-full h-10 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                                        >
                                            {configLoading ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Applying...</>
                                            ) : (
                                                <><Settings className="w-4 h-4 mr-2" />Apply Database Config</>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Card 2: Test Suite Configuration */}
                                <Card className="border-t-4 border-t-cyan-500 shadow-lg">
                                    <CardHeader className="bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/20 dark:to-background border-b pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg text-cyan-600 dark:text-cyan-400">
                                            <TestTube2 className="w-5 h-5" />
                                            Test Suite Config
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Update XML test suites in qa-rpmoverall
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4">
                                        {/* Hub URL */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Hub URL</Label>
                                            <Input
                                                value={hubUrl}
                                                onChange={(e) => setHubUrl(e.target.value)}
                                                placeholder="http://localhost:"
                                                className="font-mono text-sm h-9"
                                            />
                                        </div>

                                        {/* OrgAlias & UserId */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">OrgAlias</Label>
                                                <Input
                                                    value={configOrgAlias}
                                                    onChange={(e) => setConfigOrgAlias(e.target.value)}
                                                    placeholder="qa07"
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">UserId</Label>
                                                <Input
                                                    value={configUserId}
                                                    onChange={(e) => setConfigUserId(e.target.value)}
                                                    placeholder="chava"
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>

                                        {/* Preview SSO credentials */}
                                        <div className="p-2 bg-muted/50 rounded-lg border text-xs">
                                            <p className="text-muted-foreground mb-1">SSO Credentials:</p>
                                            <p className="font-mono">User: <span className="text-cyan-600">{username}_{configUserId}</span></p>
                                            <p className="font-mono">Pass: <span className="text-cyan-600">{password}_{configUserId}</span></p>
                                        </div>

                                        {/* Apply Test Suite Button */}
                                        <Button
                                            onClick={applyTestSuiteConfig}
                                            disabled={configLoading}
                                            className="w-full h-10 shadow-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500"
                                        >
                                            {configLoading ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Applying...</>
                                            ) : (
                                                <><TestTube2 className="w-4 h-4 mr-2" />Apply to qa-rpmoverall</>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Results */}
                            <Card className="lg:col-span-7 flex flex-col shadow-lg">
                                <CardHeader className="border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Configuration Results
                                    </CardTitle>
                                    <CardDescription>
                                        View the results of database configuration changes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 p-6">
                                    {configResults.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                                            <Settings className="w-16 h-16 mb-4 opacity-30" />
                                            <p className="text-lg">No configuration applied yet</p>
                                            <p className="text-sm mt-2">Select projects and click "Apply" to see results</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                            <div className="flex items-center justify-between mb-4 sticky top-0 bg-background py-2">
                                                <p className="text-sm text-muted-foreground">
                                                    Database IP: <span className="font-mono font-semibold text-purple-600">{selectedDatabase}</span>
                                                </p>
                                                <Badge variant="outline" className="text-sm">
                                                    {configResults.filter(r => r.success).length}/{configResults.length} successful
                                                </Badge>
                                            </div>
                                            {configResults.map((result, index) => (
                                                <div
                                                    key={index}
                                                    className={`rounded-lg border overflow-hidden ${result.success
                                                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                                                        : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between p-3">
                                                        <div className="flex items-center gap-3">
                                                            {result.success ? (
                                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-red-500" />
                                                            )}
                                                            <span className="font-medium">{result.projectName}</span>
                                                        </div>
                                                        <Badge variant={result.success ? 'default' : 'destructive'}>
                                                            {result.success ? `${result.filesUpdated} files` : 'Failed'}
                                                        </Badge>
                                                    </div>
                                                    {result.success && result.files && result.files.length > 0 && (
                                                        <div className="border-t border-green-200 dark:border-green-900 bg-white/50 dark:bg-black/20 p-2">
                                                            <p className="text-xs text-muted-foreground mb-1 px-1">Updated files:</p>
                                                            <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
                                                                {result.files.map((file, fileIndex) => (
                                                                    <div
                                                                        key={fileIndex}
                                                                        className="text-xs font-mono text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded truncate hover:text-clip hover:overflow-visible"
                                                                        title={file}
                                                                    >
                                                                        {file.split(/[/\\]/).slice(-3).join('/')}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <AlertCircle className="w-5 h-5 text-blue-500" />
                                    How It Works
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <p>• This tool scans all <strong>.properties</strong> and <strong>.xml</strong> files in the selected projects</p>
                                <p>• It replaces any existing database IP addresses with the selected database IP</p>
                                <p>• Common patterns like <strong>jdbc:oracle:thin:@IP:port</strong> and <strong>db.host=IP</strong> are detected</p>
                                <p>• Always review changes before building and deploying your application</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Deploy */}
                    <TabsContent value="deploy" className="space-y-4">
                        {/* Tomcat Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Rocket className="w-5 h-5" />
                                    Load Tomcat Servers
                                </CardTitle>
                                <CardDescription>
                                    Enter the folder containing your Tomcat installations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-3">
                                    <Input
                                        value={tomcatBasePath}
                                        onChange={(e) => setTomcatBasePath(e.target.value)}
                                        placeholder="e.g., C:\Servers or D:\apache"
                                        className="flex-1 font-mono"
                                    />
                                    <Button
                                        onClick={loadTomcats}
                                        disabled={loadingTomcats || !tomcatBasePath}
                                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                    >
                                        {loadingTomcats ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Search className="w-4 h-4 mr-2" />
                                        )}
                                        Load Tomcats
                                    </Button>
                                </div>

                                {/* Tomcat List */}
                                {tomcats.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Tomcat Servers:</Label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {tomcats.map((tomcat) => (
                                                <div
                                                    key={tomcat.path}
                                                    onClick={() => {
                                                        setSelectedTomcat(tomcat)
                                                        localStorage.setItem(SELECTED_TOMCAT_KEY, tomcat.path)
                                                    }}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedTomcat?.path === tomcat.path
                                                        ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30'
                                                        : 'hover:border-purple-500/50 hover:bg-accent/5'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <Rocket className={`w-5 h-5 flex-shrink-0 ${selectedTomcat?.path === tomcat.path ? 'text-purple-500' : 'text-muted-foreground'}`} />
                                                            <span className="font-semibold truncate">{tomcat.name}</span>
                                                            {tomcat.version && (
                                                                <Badge variant="outline" className="text-xs flex-shrink-0">{tomcat.version}</Badge>
                                                            )}
                                                            {runningTomcats.has(tomcat.path) ? (
                                                                <Badge className="text-xs bg-green-500 hover:bg-green-600 animate-pulse flex-shrink-0">
                                                                    <span className="mr-1">●</span> Running
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="text-xs flex-shrink-0">
                                                                    Stopped
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 ml-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                            {runningTomcats.has(tomcat.path) ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => stopTomcatServer(tomcat)}
                                                                    className="h-8"
                                                                >
                                                                    <Square className="w-3.5 h-3.5 mr-1" />
                                                                    Stop
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => startTomcatServer(tomcat)}
                                                                    className="h-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                                                >
                                                                    <Play className="w-3.5 h-3.5 mr-1" />
                                                                    Start
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1 truncate">{tomcat.path}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {tomcats.length === 0 && tomcatBasePath && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No Tomcat installations found. Click "Load Tomcats" to scan.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pending Deployments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Upload className="w-5 h-5" />
                                        Pending Deployments
                                        {deployments.length > 0 && (
                                            <Badge variant="secondary">{deployments.length}</Badge>
                                        )}
                                    </div>
                                    {selectedTomcat && deployments.length > 0 && (
                                        <Button
                                            size="sm"
                                            onClick={() => deployAllToTomcat(selectedTomcat)}
                                            disabled={!!deployLoading}
                                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                        >
                                            {deployLoading === 'all' ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Rocket className="w-4 h-4 mr-2" />
                                            )}
                                            Copy All to {selectedTomcat.name}
                                        </Button>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    WAR files ready to deploy to Tomcat
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {deployments.length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>No pending deployments</p>
                                        <p className="text-sm mt-1">Click "Deploy" on a Maven project to add one</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {deployments.map((deployment) => (
                                            <div
                                                key={deployment.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{deployment.projectName}</span>
                                                        <Badge variant={deployment.fileType === 'WAR' ? 'default' : 'outline'} className="text-xs">
                                                            {deployment.fileType || 'WAR'}
                                                        </Badge>
                                                        <Badge variant={deployment.status === 'deployed' ? 'default' : 'secondary'}>
                                                            {deployment.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {deployment.warFileName} ({(deployment.warFileSize / 1024 / 1024).toFixed(2)} MB)
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Added: {deployment.createdAt}
                                                        {deployment.deployedAt && ` • Deployed: ${deployment.deployedAt}`}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {/* Open in Browser */}
                                                    {deployment.status === 'deployed' && deployment.contextPath && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openInBrowser(deployment)}
                                                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <ExternalLink className="w-4 h-4 mr-1" />
                                                            Open App
                                                        </Button>
                                                    )}

                                                    {/* Re-deploy (Build + Deploy) */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRedeploy(deployment)}
                                                        disabled={
                                                            !selectedTomcat ||
                                                            deployLoading === deployment.id ||
                                                            (deployment.status === 'deployed' && selectedTomcat && !runningTomcats.has(selectedTomcat.path))
                                                        }
                                                        className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                                    >
                                                        {deployLoading === deployment.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <RotateCw className="w-4 h-4 mr-1" />
                                                        )}
                                                        Re-deploy
                                                    </Button>

                                                    {/* Initial Deploy */}
                                                    {deployment.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => deployToTomcat(deployment.id)}
                                                            disabled={!selectedTomcat || deployLoading === deployment.id}
                                                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                                        >
                                                            {deployLoading === deployment.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Rocket className="w-4 h-4 mr-1" />
                                                                    Deploy
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => removeDeployment(deployment.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Deploy Guide */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <AlertCircle className="w-5 h-5 text-blue-500" />
                                    Deployment Guide
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <p>1. <strong>Build</strong> your Maven project first (Build Maven button)</p>
                                <p>2. Click <strong>Deploy</strong> on the project card to add WAR to pending list</p>
                                <p>3. Enter your <strong>Tomcat path</strong> above (e.g., C:\apache-tomcat-9.0.80)</p>
                                <p>4. Click <strong>Deploy to Tomcat</strong> to copy WAR to webapps folder</p>
                                <p>5. Click <strong>Start Tomcat</strong> to run the server</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 4: Run Test */}
                    <TabsContent value="test" className="space-y-6">
                        {/* Selenium Grid Control */}
                        <Card className="border-2 border-dashed border-cyan-300 dark:border-cyan-800 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${seleniumHubRunning ? 'bg-green-500' : 'bg-gray-400'}`}>
                                            <Activity className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-cyan-700 dark:text-cyan-300">Selenium Grid Control</h3>
                                            <p className="text-xs text-muted-foreground">Start Hub and Node for Selenium tests</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Hub Status */}
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-black/20">
                                            <span className={`w-2 h-2 rounded-full ${seleniumHubRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                            <span className="text-sm font-medium">Hub: {seleniumHubRunning ? 'Running' : 'Stopped'}</span>
                                        </div>
                                        {/* Node Count */}
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-black/20">
                                            <Server className="w-4 h-4 text-cyan-600" />
                                            <span className="text-sm font-medium">Nodes: {seleniumNodeCount}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={startSeleniumHub}
                                            disabled={seleniumLoading || seleniumHubRunning}
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                        >
                                            {seleniumLoading ? (
                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                                <Rocket className="w-4 h-4 mr-1" />
                                            )}
                                            Start Hub
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={startSeleniumNode}
                                            disabled={seleniumLoading || !seleniumHubRunning}
                                            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                                        >
                                            {seleniumLoading ? (
                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                                <Server className="w-4 h-4 mr-1" />
                                            )}
                                            Start Node
                                        </Button>
                                        {!seleniumHubRunning && seleniumNodeCount === 0 && (
                                            <Button
                                                size="sm"
                                                onClick={quickStartSelenium}
                                                disabled={seleniumLoading}
                                                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                                            >
                                                {seleniumLoading ? (
                                                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Starting...</>
                                                ) : (
                                                    <><Rocket className="w-4 h-4 mr-1" />Quick Start All</>
                                                )}
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={stopSelenium}
                                            disabled={seleniumLoading || (!seleniumHubRunning && seleniumNodeCount === 0)}
                                        >
                                            <Square className="w-4 h-4 mr-1" />
                                            Stop All
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={checkSeleniumStatus}
                                            disabled={seleniumLoading}
                                        >
                                            <RefreshCw className={`w-4 h-4 ${seleniumLoading ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>
                                </div>
                                {seleniumHubRunning && (
                                    <div className="mt-3 pt-3 border-t border-cyan-200 dark:border-cyan-800">
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="flex items-center gap-1">
                                                <span className="text-muted-foreground">Grid Console:</span>
                                                <a
                                                    href="http://localhost:4444/ui"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-cyan-600 hover:underline font-mono"
                                                >
                                                    http://localhost:4444/ui
                                                </a>
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {/* ChromeDriver Section */}
                                <div className="mt-3 pt-3 border-t border-cyan-200 dark:border-cyan-800">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-orange-500 rounded">
                                                <Download className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium">ChromeDriver</span>
                                                {chromeDriverInfo && (
                                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                                        <span>Installed: <code className="text-orange-600">{chromeDriverInfo.installedDriverVersion}</code></span>
                                                        <span>Latest: <code className="text-green-600">{chromeDriverInfo.latestDriverVersion}</code></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={checkChromeDriverInfo}
                                                disabled={chromeDriverLoading}
                                            >
                                                {chromeDriverLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="w-4 h-4" />
                                                )}
                                            </Button>
                                            {chromeDriverInfo?.updateAvailable && (
                                                <Button
                                                    size="sm"
                                                    onClick={downloadChromeDriver}
                                                    disabled={chromeDriverLoading}
                                                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                                                >
                                                    {chromeDriverLoading ? (
                                                        <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Downloading...</>
                                                    ) : (
                                                        <><Download className="w-4 h-4 mr-1" />Update Driver</>
                                                    )}
                                                </Button>
                                            )}
                                            {!chromeDriverInfo && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={checkChromeDriverInfo}
                                                    disabled={chromeDriverLoading}
                                                >
                                                    Check Version
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
                            {/* Left Column: Configuration */}
                            <Card className="lg:col-span-4 flex flex-col border-t-4 border-t-blue-500 shadow-lg overflow-hidden">
                                <CardHeader className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-b">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
                                                <TestTube2 className="w-6 h-6" />
                                                Test Runner
                                            </CardTitle>
                                            <CardDescription>
                                                Execute Maven tests or Selenium suites
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 p-6 flex-1 overflow-y-auto">
                                    <div className="space-y-3">
                                        <Label className="text-base font-medium">Select Project</Label>
                                        <div className="relative">
                                            <FolderOpen className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <select
                                                className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-blue-500 transition-all hover:bg-accent/5 dark:bg-zinc-950 dark:text-zinc-100"
                                                value={selectedTestProject?.path || ''}
                                                onChange={(e) => {
                                                    const proj = projects.find(p => p.path === e.target.value)
                                                    setSelectedTestProject(proj || null)
                                                }}
                                            >
                                                <option value="" className="dark:bg-zinc-950">Choose a project...</option>
                                                {projects.map(p => (
                                                    <option key={p.path} value={p.path} className="dark:bg-zinc-950">{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Test Suites Selection */}
                                    {selectedTestProject && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-medium">
                                                    Test Suites
                                                    {testSuites.length > 0 && (
                                                        <Badge variant="secondary" className="ml-2">
                                                            {selectedSuites.size}/{testSuites.length}
                                                        </Badge>
                                                    )}
                                                </Label>
                                                {testSuites.length > 0 && (
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={selectAllSuites}
                                                            className="h-7 text-xs"
                                                            title={activeTestTab === 'all' ? 'Select all test suites' : `Select all ${activeTestTab} tests`}
                                                        >
                                                            All {activeTestTab !== 'all' && `(${activeTestTab})`}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={clearAllSelections}
                                                            className="h-7 text-xs"
                                                            title={activeTestTab === 'all' ? 'Clear all selections' : `Clear ${activeTestTab} selections`}
                                                        >
                                                            Clear {activeTestTab !== 'all' && `(${activeTestTab})`}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {loadingSuites ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : testSuites.length === 0 ? (
                                                <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">
                                                    No test suites found in this project
                                                </div>
                                            ) : (
                                                <Tabs defaultValue="all" value={activeTestTab} onValueChange={setActiveTestTab} className="w-full">
                                                    <TabsList className="w-full h-auto grid grid-cols-3 gap-2 p-1 bg-muted/50">
                                                        <TabsTrigger value="all" className="text-xs py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                                                            All ({testSuites.length})
                                                        </TabsTrigger>
                                                        {testSuites.some(s => s.type === 'junit') && (
                                                            <TabsTrigger value="junit" className="text-xs py-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
                                                                <span className="mr-1">🟢</span>
                                                                JUnit ({testSuites.filter(s => s.type === 'junit').length})
                                                            </TabsTrigger>
                                                        )}
                                                        {testSuites.some(s => s.type === 'cucumber') && (
                                                            <TabsTrigger value="cucumber" className="text-xs py-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                                                                <span className="mr-1">🟣</span>
                                                                Cucumber ({testSuites.filter(s => s.type === 'cucumber').length})
                                                            </TabsTrigger>
                                                        )}
                                                        {testSuites.some(s => s.type === 'xifinportal') && (
                                                            <TabsTrigger value="xifinportal" className="text-xs py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                                                <span className="mr-1">🟠</span>
                                                                Portal ({testSuites.filter(s => s.type === 'xifinportal').length})
                                                            </TabsTrigger>
                                                        )}
                                                        {testSuites.some(s => s.type === 'engine') && (
                                                            <TabsTrigger value="engine" className="text-xs py-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                                                                <span className="mr-1">🔵</span>
                                                                Engine ({testSuites.filter(s => s.type === 'engine').length})
                                                            </TabsTrigger>
                                                        )}
                                                        {testSuites.some(s => s.type === 'restapi') && (
                                                            <TabsTrigger value="restapi" className="text-xs py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                                                <span className="mr-1">🔵</span>
                                                                API ({testSuites.filter(s => s.type === 'restapi').length})
                                                            </TabsTrigger>
                                                        )}
                                                    </TabsList>

                                                    {/* All Tab */}
                                                    <TabsContent value="all" className="mt-2">
                                                        <div className="space-y-2 max-h-[280px] overflow-y-auto border rounded-lg p-2 bg-muted/30">
                                                            {testSuites.map((suite) => (
                                                                <div
                                                                    key={suite.className}
                                                                    onClick={() => toggleSuiteSelection(suite.className)}
                                                                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-accent ${selectedSuites.has(suite.className)
                                                                        ? 'bg-blue-500/10 border border-blue-500/30'
                                                                        : 'border border-transparent'
                                                                        }`}
                                                                >
                                                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedSuites.has(suite.className)
                                                                        ? 'bg-blue-500 border-blue-500'
                                                                        : 'border-muted-foreground/30'
                                                                        }`}>
                                                                        {selectedSuites.has(suite.className) && (
                                                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium truncate">{suite.name}</span>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={`text-xs ${suite.type === 'junit'
                                                                                    ? 'text-green-600 border-green-600/30'
                                                                                    : suite.type === 'cucumber'
                                                                                        ? 'text-purple-600 border-purple-600/30'
                                                                                        : suite.type === 'xifinportal'
                                                                                            ? 'text-orange-600 border-orange-600/30'
                                                                                            : suite.type === 'engine'
                                                                                                ? 'text-cyan-600 border-cyan-600/30'
                                                                                                : 'text-blue-600 border-blue-600/30'
                                                                                    }`}
                                                                            >
                                                                                {suite.type}
                                                                            </Badge>
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground truncate">{suite.className}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TabsContent>

                                                    {/* JUnit Tab */}
                                                    {testSuites.some(s => s.type === 'junit') && (
                                                        <TabsContent value="junit" className="mt-2">
                                                            <div className="space-y-2 max-h-[280px] overflow-y-auto border rounded-lg p-2 bg-muted/30">
                                                                {testSuites.filter(s => s.type === 'junit').map((suite) => (
                                                                    <div
                                                                        key={suite.className}
                                                                        onClick={() => toggleSuiteSelection(suite.className)}
                                                                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-accent ${selectedSuites.has(suite.className)
                                                                            ? 'bg-blue-500/10 border border-blue-500/30'
                                                                            : 'border border-transparent'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedSuites.has(suite.className)
                                                                            ? 'bg-blue-500 border-blue-500'
                                                                            : 'border-muted-foreground/30'
                                                                            }`}>
                                                                            {selectedSuites.has(suite.className) && (
                                                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-sm font-medium truncate">{suite.name}</span>
                                                                            <p className="text-xs text-muted-foreground truncate">{suite.className}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TabsContent>
                                                    )}

                                                    {/* Cucumber Tab */}
                                                    {testSuites.some(s => s.type === 'cucumber') && (
                                                        <TabsContent value="cucumber" className="mt-2">
                                                            <div className="space-y-2 max-h-[280px] overflow-y-auto border rounded-lg p-2 bg-muted/30">
                                                                {testSuites.filter(s => s.type === 'cucumber').map((suite) => (
                                                                    <div
                                                                        key={suite.className}
                                                                        onClick={() => toggleSuiteSelection(suite.className)}
                                                                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-accent ${selectedSuites.has(suite.className)
                                                                            ? 'bg-blue-500/10 border border-blue-500/30'
                                                                            : 'border border-transparent'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedSuites.has(suite.className)
                                                                            ? 'bg-blue-500 border-blue-500'
                                                                            : 'border-muted-foreground/30'
                                                                            }`}>
                                                                            {selectedSuites.has(suite.className) && (
                                                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-sm font-medium truncate">{suite.name}</span>
                                                                            <p className="text-xs text-muted-foreground truncate">{suite.className}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TabsContent>
                                                    )}

                                                    {/* XifinPortal Tab */}
                                                    {testSuites.some(s => s.type === 'xifinportal') && (
                                                        <TabsContent value="xifinportal" className="mt-2">
                                                            <div className="space-y-2 max-h-[280px] overflow-y-auto border rounded-lg p-2 bg-muted/30">
                                                                {testSuites.filter(s => s.type === 'xifinportal').map((suite) => (
                                                                    <div
                                                                        key={suite.className}
                                                                        onClick={() => toggleSuiteSelection(suite.className)}
                                                                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-accent ${selectedSuites.has(suite.className)
                                                                            ? 'bg-blue-500/10 border border-blue-500/30'
                                                                            : 'border border-transparent'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedSuites.has(suite.className)
                                                                            ? 'bg-blue-500 border-blue-500'
                                                                            : 'border-muted-foreground/30'
                                                                            }`}>
                                                                            {selectedSuites.has(suite.className) && (
                                                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-sm font-medium truncate">{suite.name}</span>
                                                                            <p className="text-xs text-muted-foreground truncate">{suite.className}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TabsContent>
                                                    )}

                                                    {/* Engine Tab */}
                                                    {testSuites.some(s => s.type === 'engine') && (
                                                        <TabsContent value="engine" className="mt-2">
                                                            <div className="space-y-2 max-h-[280px] overflow-y-auto border rounded-lg p-2 bg-muted/30">
                                                                {testSuites.filter(s => s.type === 'engine').map((suite) => (
                                                                    <div
                                                                        key={suite.className}
                                                                        onClick={() => toggleSuiteSelection(suite.className)}
                                                                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-accent ${selectedSuites.has(suite.className)
                                                                            ? 'bg-blue-500/10 border border-blue-500/30'
                                                                            : 'border border-transparent'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedSuites.has(suite.className)
                                                                            ? 'bg-blue-500 border-blue-500'
                                                                            : 'border-muted-foreground/30'
                                                                            }`}>
                                                                            {selectedSuites.has(suite.className) && (
                                                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-sm font-medium truncate">{suite.name}</span>
                                                                            <p className="text-xs text-muted-foreground truncate">{suite.className}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TabsContent>
                                                    )}

                                                    {/* REST API Tab */}
                                                    {testSuites.some(s => s.type === 'restapi') && (
                                                        <TabsContent value="restapi" className="mt-2">
                                                            <div className="space-y-2 max-h-[280px] overflow-y-auto border rounded-lg p-2 bg-muted/30">
                                                                {testSuites.filter(s => s.type === 'restapi').map((suite) => (
                                                                    <div
                                                                        key={suite.className}
                                                                        onClick={() => toggleSuiteSelection(suite.className)}
                                                                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-accent ${selectedSuites.has(suite.className)
                                                                            ? 'bg-blue-500/10 border border-blue-500/30'
                                                                            : 'border border-transparent'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedSuites.has(suite.className)
                                                                            ? 'bg-blue-500 border-blue-500'
                                                                            : 'border-muted-foreground/30'
                                                                            }`}>
                                                                            {selectedSuites.has(suite.className) && (
                                                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-sm font-medium truncate">{suite.name}</span>
                                                                            <p className="text-xs text-muted-foreground truncate">{suite.className}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TabsContent>
                                                    )}
                                                </Tabs>
                                            )}
                                        </div>
                                    )}

                                    {/* Test Parameters */}
                                    {selectedTestProject && selectedSuites.size > 0 && (
                                        <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                                            <Label className="text-base font-medium text-blue-700 dark:text-blue-400">
                                                Test Parameters
                                            </Label>

                                            {/* OrgAlias - Always shown for Portal/Engine/API */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    OrgAlias <span className="text-red-500">*</span>
                                                </Label>
                                                <select
                                                    value={orgAlias}
                                                    onChange={(e) => setOrgAlias(e.target.value)}
                                                    className="w-full h-10 px-3 rounded-md border border-blue-200 dark:border-blue-900 bg-white dark:bg-black text-sm focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="qa07">qa07</option>
                                                    <option value="qa08">qa08</option>
                                                </select>
                                            </div>

                                            {/* REST API specific parameters */}
                                            {Array.from(selectedSuites).some(className => {
                                                const suite = testSuites.find(s => s.className === className)
                                                return suite?.type === 'restapi'
                                            }) && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">
                                                                UserId <span className="text-red-500">*</span>
                                                            </Label>
                                                            <select
                                                                value={userId}
                                                                onChange={(e) => setUserId(e.target.value)}
                                                                className="w-full h-10 px-3 rounded-md border border-blue-200 dark:border-blue-900 bg-white dark:bg-black text-sm focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                <option value="chava">chava</option>
                                                                <option value="qatester">qatester</option>
                                                            </select>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Username</Label>
                                                                <Input
                                                                    value={username}
                                                                    disabled
                                                                    className="bg-gray-100 dark:bg-gray-800 text-sm"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Password</Label>
                                                                <Input
                                                                    value={password}
                                                                    type="password"
                                                                    disabled
                                                                    className="bg-gray-100 dark:bg-gray-800 text-sm"
                                                                />
                                                            </div>
                                                        </div>

                                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                                            REST API Parameters: -DOrgAlias={orgAlias} -DUserId={userId} -DUsername={username} -DPassword={password}
                                                        </p>
                                                    </>
                                                )}

                                            {/* Portal/Engine info */}
                                            {Array.from(selectedSuites).some(className => {
                                                const suite = testSuites.find(s => s.className === className)
                                                return suite?.type === 'xifinportal' || suite?.type === 'engine'
                                            }) && !Array.from(selectedSuites).some(className => {
                                                const suite = testSuites.find(s => s.className === className)
                                                return suite?.type === 'restapi'
                                            }) && (
                                                    <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                                                        {Array.from(selectedSuites).some(className => {
                                                            const suite = testSuites.find(s => s.className === className)
                                                            return suite?.type === 'xifinportal'
                                                        }) && (
                                                                <p>Portal: -DorgAlias={orgAlias} -DtestSuite=newXp\[suite]</p>
                                                            )}
                                                        {Array.from(selectedSuites).some(className => {
                                                            const suite = testSuites.find(s => s.className === className)
                                                            return suite?.type === 'engine'
                                                        }) && (
                                                                <p>Engine: -DorgAlias={orgAlias} -DtestSuite=pfEngines\[suite]</p>
                                                            )}
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Label className="text-base font-medium">Custom Command (Optional)</Label>
                                        <div className="relative">
                                            <Terminal className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                value={testCommand}
                                                onChange={(e) => setTestCommand(e.target.value)}
                                                placeholder="mvn test"
                                                className="pl-9 font-mono text-sm border-input bg-background/50 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex gap-2 flex-wrap text-xs">
                                            <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors" onClick={() => setTestCommand('mvn test')}>mvn test</Badge>
                                            <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors" onClick={() => setTestCommand('mvn clean test')}>mvn clean test</Badge>
                                            <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors" onClick={() => setTestCommand('npm test')}>npm test</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedSuites.size > 0
                                                ? `Will run ${selectedSuites.size} selected test suite${selectedSuites.size > 1 ? 's' : ''}`
                                                : 'Leave empty to use custom command above'}
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            onClick={runTest}
                                            disabled={!selectedTestProject || testRunning}
                                            className={`w-full h-12 text-lg shadow-lg transition-all duration-300 ${testRunning
                                                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25'
                                                }`}
                                        >
                                            {testRunning ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                                    Running Tests...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-5 h-5 mr-2 fill-current" />
                                                    Start Execution
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Right Column: Terminal Output */}
                            <Card className="lg:col-span-8 flex flex-col bg-[#1e1e1e] border-zinc-800 shadow-2xl overflow-hidden text-zinc-300">
                                {/* Terminal Header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-zinc-700">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5 mr-3">
                                            <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 transition-colors shadow-inner" />
                                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 transition-colors shadow-inner" />
                                            <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 transition-colors shadow-inner" />
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-800/50 px-3 py-1 rounded-md border border-zinc-700/50">
                                            <Terminal className="w-3 h-3" />
                                            {selectedTestProject ? `test-runner@${selectedTestProject.name}:~` : 'terminal'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {testRunning && (
                                            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 animate-pulse mr-2">
                                                <RotateCw className="w-3 h-3 mr-1 animate-spin" />
                                                Live
                                            </Badge>
                                        )}
                                        <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-zinc-700 hover:text-white" onClick={() => {
                                            navigator.clipboard.writeText(testLog)
                                            showNotification('success', 'Log copied')
                                        }} title="Copy Log">
                                            <Copy className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-zinc-700 hover:text-red-400" onClick={() => setTestLog('')} title="Clear Log">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Terminal Content */}
                                <CardContent className="flex-1 p-0 overflow-hidden relative font-mono text-sm leading-relaxed">
                                    {testLog ? (
                                        <pre className="absolute inset-0 p-4 overflow-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                                            {testLog}
                                        </pre>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 opacity-50">
                                            <Terminal className="w-16 h-16 mb-4" strokeWidth={1} />
                                            <p>Waiting for command...</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab 5: Jenkins */}
                    <TabsContent value="jenkins" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Jenkins Controller */}
                            <Card className="border-t-4 border-t-orange-500 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-orange-600">
                                        <FolderKanban className="w-6 h-6" />
                                        Jenkins Controller
                                    </CardTitle>
                                    <CardDescription>Start and manage Jenkins Local Server</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900/50">
                                        <Label className="mb-2 block font-semibold text-orange-700 dark:text-orange-400">Startup Command</Label>
                                        <div className="flex gap-2">
                                            <Input className="font-mono bg-white dark:bg-black" defaultValue="java -jar jenkins.war --httpPort=9090" />
                                            <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-orange-500/20">
                                                <Play className="w-4 h-4 mr-2" /> Start
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all group" onClick={() => window.open('http://localhost:9090', '_blank')}>
                                            <ExternalLink className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                                            <span>Open Dashboard</span>
                                        </Button>
                                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group">
                                            <FileText className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                                            <span>View Reports</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Jobs Mockup */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Recent Jobs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-green-500' : i === 2 ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`} />
                                                    <div>
                                                        <p className="font-medium text-sm">Pipeline_Build_v{i}.0</p>
                                                        <p className="text-xs text-muted-foreground">Updated 10 mins ago</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="link" className="w-full mt-2 text-sm text-muted-foreground">View All Jobs</Button>
                                </CardContent>
                            </Card>
                        </div>
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
