'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TestTube2, FolderOpen, GitBranch, RefreshCw, Archive, Download, ArrowUpFromLine, ArrowDownToLine, AlertCircle, CheckCircle2, XCircle, Loader2, FolderGit2, Search, ChevronLeft, ChevronRight, Settings, Rocket, FolderKanban, Hammer, Package, X, Filter, FileText, Upload, Play, Square, Trash2, ExternalLink, RotateCw, Copy, Terminal, Activity, Server, Shield, History, Lightbulb, Clock, Eye, Moon, Sun, Star, Keyboard, ListOrdered } from 'lucide-react'
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

const resolveApiBase = () => {
    const configuredBase = process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === 'development'
            ? 'http://localhost:8080'
            : 'https://devhelper-37jw.onrender.com')

    return configuredBase.endsWith('/api')
        ? configuredBase.replace(/\/$/, '')
        : `${configuredBase.replace(/\/$/, '')}/api`
}

const API_BASE = resolveApiBase()
const IS_LOCAL_BACKEND = API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1')
const DEFAULT_PROJECT_BASE_PATH = IS_LOCAL_BACKEND ? 'D:\\learn' : '/opt/render/project/data'
const DEFAULT_TOMCAT_BASE_PATH = IS_LOCAL_BACKEND ? 'D:\\opt' : '/opt'

const isWindowsPath = (value: string) => /^[a-zA-Z]:\\/.test(value)
const isUnixPath = (value: string) => value.startsWith('/')

const normalizePathForEnvironment = (savedPath: string | null, fallbackPath: string) => {
    if (!savedPath) return fallbackPath

    if (IS_LOCAL_BACKEND && isUnixPath(savedPath)) {
        return fallbackPath
    }

    if (!IS_LOCAL_BACKEND && isWindowsPath(savedPath)) {
        return fallbackPath
    }

    return savedPath
}
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
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)

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

    // Deploy tab improvements
    const [deploymentHistory, setDeploymentHistory] = useState<{
        id: string
        projectName: string
        tomcatName: string
        action: 'deploy' | 'redeploy' | 'undeploy'
        status: 'success' | 'failed'
        timestamp: string
        duration?: number
    }[]>([])
    const [healthCheckResults, setHealthCheckResults] = useState<Record<string, { healthy: boolean; responseTime?: number; lastCheck?: string }>>({})
    const [checkingHealth, setCheckingHealth] = useState<string | null>(null)
    const [showTomcatLogs, setShowTomcatLogs] = useState(false)
    const [tomcatLogs, setTomcatLogs] = useState('')
    const [loadingLogs, setLoadingLogs] = useState(false)
    const [quickDeployProject, setQuickDeployProject] = useState<string>('')
    const [quickDeploying, setQuickDeploying] = useState(false)
    const [deployProgress, setDeployProgress] = useState<{ step: string; progress: number } | null>(null)

    // Test states
    const [selectedTestProject, setSelectedTestProject] = useState<Project | null>(null)
    const [testCommand, setTestCommand] = useState('mvn test')
    const [testRunning, setTestRunning] = useState(false)
    const [testLog, setTestLog] = useState('')
    const [testSuites, setTestSuites] = useState<TestSuite[]>([])
    const [selectedSuites, setSelectedSuites] = useState<Set<string>>(new Set())
    const [loadingSuites, setLoadingSuites] = useState(false)

    // Test tab improvements
    const [testHistory, setTestHistory] = useState<{
        id: string
        projectName: string
        suites: string[]
        status: 'running' | 'success' | 'failed' | 'cancelled'
        startTime: string
        endTime?: string
        duration?: number
        passedCount?: number
        failedCount?: number
        skippedCount?: number
    }[]>([])
    const [testProgress, setTestProgress] = useState<{ step: string; progress: number } | null>(null)
    const [currentTestStats, setCurrentTestStats] = useState<{
        passed: number
        failed: number
        skipped: number
        total: number
    }>({ passed: 0, failed: 0, skipped: 0, total: 0 })
    const [activeTestTab, setActiveTestTab] = useState<string>('all')
    const [orgAlias, setOrgAlias] = useState('qa07')
    const [userId, setUserId] = useState('chava')
    const [username] = useState('webservicetest')
    const [password] = useState('webservicetest')

    // Jenkins states
    const [jenkinsServers] = useState([
        { name: 'Local', url: 'localhost:9090' },
        { name: 'Remote (10.20.3.92)', url: '10.20.3.92:9090' }
    ])
    const [selectedJenkinsServer, setSelectedJenkinsServer] = useState('localhost:9090')
    const [jenkinsOnline, setJenkinsOnline] = useState(false)
    const [jenkinsJobs, setJenkinsJobs] = useState<any[]>([])
    const [jenkinsLoading, setJenkinsLoading] = useState(false)
    const [selectedJob, setSelectedJob] = useState<any>(null)
    const [jobBuilds, setJobBuilds] = useState<any[]>([])
    const [consoleOutput, setConsoleOutput] = useState('')
    const [showConsole, setShowConsole] = useState(false)
    const [jenkinsViews, setJenkinsViews] = useState<{ name: string; url: string }[]>([])
    const [selectedView, setSelectedView] = useState('all')
    const [jobSearchQuery, setJobSearchQuery] = useState('')

    // New Jenkins features
    const [favoriteJobs, setFavoriteJobs] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('jenkins_favorites')
            return saved ? JSON.parse(saved) : []
        }
        return []
    })
    const [batchMode, setBatchMode] = useState(false)
    const [selectedBatchJobs, setSelectedBatchJobs] = useState<Set<string>>(new Set())
    const [showCredentialsModal, setShowCredentialsModal] = useState(false)
    const [jenkinsCredentials, setJenkinsCredentials] = useState({ username: 'admin', token: '' })
    const [showParamsModal, setShowParamsModal] = useState(false)
    const [pendingJobParams, setPendingJobParams] = useState<{ jobName: string; params: Record<string, string> } | null>(null)
    const [liveConsoleJobName, setLiveConsoleJobName] = useState('')
    const [liveConsoleBuildNum, setLiveConsoleBuildNum] = useState(0)
    const [notificationsEnabled, setNotificationsEnabled] = useState(false)
    const [previousJobStates, setPreviousJobStates] = useState<Record<string, string>>({})

    // VPN states
    const [vpnConnected, setVpnConnected] = useState(false)
    const [vpnState, setVpnState] = useState('Unknown')
    const [vpnLoading, setVpnLoading] = useState(false)
    const [showVpnConfig, setShowVpnConfig] = useState(false)
    const [vpnCredentials, setVpnCredentials] = useState({
        server: '',
        username: '',
        password: '',
        group: '',
        pushMethod: 'push' // push, phone, sms, passcode
    })

    // Pipeline editor states
    const [showPipelineEditor, setShowPipelineEditor] = useState(false)
    const [editingJobName, setEditingJobName] = useState('')
    const [pipelineScript, setPipelineScript] = useState('')
    const [isPipelineJob, setIsPipelineJob] = useState(false)
    const [savingPipeline, setSavingPipeline] = useState(false)
    const [configXml, setConfigXml] = useState('')
    const [editMode, setEditMode] = useState<'pipeline' | 'xml'>('pipeline')

    // Create new job states
    const [showCreateJobModal, setShowCreateJobModal] = useState(false)
    const [newJobName, setNewJobName] = useState('')
    const [newJobType, setNewJobType] = useState<'pipeline' | 'freestyle'>('pipeline')
    const [creatingJob, setCreatingJob] = useState(false)

    // Enhancement 1: Dark Mode
    const [darkMode, setDarkMode] = useState(false)

    // Enhancement 7: Favorites/Pinning
    const [favoriteProjects, setFavoriteProjects] = useState<Set<string>>(new Set())

    // Enhancement 8: Build Queue (Jenkins)
    const [buildQueue, setBuildQueue] = useState<{
        id: number
        jobName: string
        why: string
        stuck: boolean
        buildableStartMilliseconds: number
    }[]>([])

    // Enhancement 10: Tab Badges - running counts
    const [runningTestCount, setRunningTestCount] = useState(0)
    const [runningBuildCount, setRunningBuildCount] = useState(0)

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

    // Config Preview and History
    const [showConfigPreview, setShowConfigPreview] = useState(false)
    const [configPreviewData, setConfigPreviewData] = useState<{
        type: 'database' | 'testsuite' | 'all'
        databaseIp?: string
        projects?: string[]
        orgAlias?: string
        userId?: string
        hubUrl?: string
        estimatedFiles?: number
    } | null>(null)
    const [configHistory, setConfigHistory] = useState<{
        id: string
        type: 'database' | 'testsuite' | 'all'
        timestamp: string
        profileName?: string
        databaseIp?: string
        orgAlias?: string
        userId?: string
        projectsCount: number
        filesUpdated: number
        status: 'success' | 'partial' | 'failed'
    }[]>([])

    // Apply environment profile
    const applyEnvironmentProfile = (profile: EnvironmentProfile) => {
        setSelectedProfile(profile)
        setSelectedDatabase(profile.databaseIp)
        setConfigUserId(profile.userId)
        setConfigOrgAlias(profile.orgAlias)
        setHubUrl(profile.hubUrl)
        showNotification('success', `Loaded profile: ${profile.name}`)
    }

    // Enhancement 1: Dark Mode Toggle
    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
        if (!darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    // Enhancement 2: Export History to JSON
    const exportHistory = (type: 'test' | 'config' | 'deploy') => {
        let data: any[]
        let filename: string
        if (type === 'test') {
            data = testHistory
            filename = `test-history-${new Date().toISOString().split('T')[0]}.json`
        } else if (type === 'config') {
            data = configHistory
            filename = `config-history-${new Date().toISOString().split('T')[0]}.json`
        } else {
            data = deploymentHistory
            filename = `deploy-history-${new Date().toISOString().split('T')[0]}.json`
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        showNotification('success', `Exported ${type} history`)
    }

    // Enhancement 3: Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Enter to Run Test
            if (e.ctrlKey && e.key === 'Enter' && activeTab === 'test' && selectedTestProject && !testRunning) {
                e.preventDefault()
                runTest()
            }
            // Ctrl+D for dark mode toggle
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault()
                toggleDarkMode()
            }
            // Ctrl+1-5 for tab switching
            if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
                e.preventDefault()
                const tabs = ['projects', 'config', 'deploy', 'test', 'jenkins']
                setActiveTab(tabs[parseInt(e.key) - 1])
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [activeTab, selectedTestProject, testRunning])

    // Enhancement 7: Toggle Favorite Project
    const toggleFavoriteProject = (projectPath: string) => {
        const newFavorites = new Set(favoriteProjects)
        if (newFavorites.has(projectPath)) {
            newFavorites.delete(projectPath)
            showNotification('success', 'Removed from favorites')
        } else {
            newFavorites.add(projectPath)
            showNotification('success', 'Added to favorites')
        }
        setFavoriteProjects(newFavorites)
    }

    // Enhancement 8: Fetch Build Queue (Jenkins)
    const fetchBuildQueue = async () => {
        try {
            const response = await fetch(`${API_BASE}/jenkins/queue?serverUrl=${encodeURIComponent(selectedJenkinsServer)}`)
            if (response.ok) {
                const data = await response.json()
                setBuildQueue(data.items || [])
            }
        } catch (error) {
            console.error('Failed to fetch build queue')
        }
    }

    // Enhancement 10: Update Running Counts
    useEffect(() => {
        setRunningTestCount(testRunning ? 1 : 0)
    }, [testRunning])

    useEffect(() => {
        const running = jenkinsJobs.filter(j => j.color?.includes('anime')).length
        setRunningBuildCount(running)
    }, [jenkinsJobs])

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

    // VPN functions
    const checkVpnStatus = async () => {
        try {
            const response = await fetch(`${API_BASE}/vpn/status`)
            if (response.ok) {
                const data = await response.json()
                setVpnConnected(data.connected)
                setVpnState(data.state)
            }
        } catch (error) {
            setVpnState('Error')
        }
    }

    const connectVpn = async () => {
        if (!vpnCredentials.server || !vpnCredentials.username || !vpnCredentials.password) {
            showNotification('error', 'Please configure VPN credentials first')
            setShowVpnConfig(true)
            return
        }

        setVpnLoading(true)
        setVpnState('Connecting...')
        try {
            const response = await fetch(`${API_BASE}/vpn/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vpnCredentials)
            })
            const data = await response.json()
            if (data.success) {
                showNotification('success', 'VPN connection initiated. Check Duo push!')
                setTimeout(checkVpnStatus, 5000)
            } else {
                showNotification('error', data.message || 'VPN connection failed')
            }
        } catch (error) {
            showNotification('error', 'Failed to connect VPN')
        } finally {
            setVpnLoading(false)
            setTimeout(checkVpnStatus, 3000)
        }
    }

    const disconnectVpn = async () => {
        setVpnLoading(true)
        try {
            await fetch(`${API_BASE}/vpn/disconnect`, { method: 'POST' })
            showNotification('success', 'VPN disconnected')
            setVpnConnected(false)
            setVpnState('Disconnected')
        } catch (error) {
            showNotification('error', 'Failed to disconnect')
        } finally {
            setVpnLoading(false)
        }
    }

    // Jenkins functions
    const checkJenkinsStatus = async () => {
        setJenkinsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/jenkins/status?serverUrl=${encodeURIComponent(selectedJenkinsServer)}`)
            if (response.ok) {
                const data = await response.json()
                setJenkinsOnline(data.online)
                if (data.online) {
                    await fetchJenkinsViews()
                    await fetchJenkinsJobs()
                }
            }
        } catch (error) {
            setJenkinsOnline(false)
        } finally {
            setJenkinsLoading(false)
        }
    }

    const fetchJenkinsViews = async () => {
        try {
            const response = await fetch(`${API_BASE}/jenkins/views?serverUrl=${encodeURIComponent(selectedJenkinsServer)}`)
            if (response.ok) {
                const data = await response.json()
                setJenkinsViews(data.views || [])
            }
        } catch (error) {
            console.error('Failed to fetch views:', error)
        }
    }

    const fetchJenkinsJobs = async (viewName?: string) => {
        try {
            const view = viewName !== undefined ? viewName : selectedView
            const response = await fetch(`${API_BASE}/jenkins/jobs?serverUrl=${encodeURIComponent(selectedJenkinsServer)}&viewName=${encodeURIComponent(view)}`)
            if (response.ok) {
                const data = await response.json()
                setJenkinsJobs(data.jobs || [])
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error)
        }
    }

    const triggerJenkinsBuild = async (jobName: string) => {
        setJenkinsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/jenkins/build`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serverUrl: selectedJenkinsServer,
                    jobName: jobName
                })
            })
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    showNotification('success', `Build triggered for ${jobName}`)
                    // Refresh jobs after a short delay
                    setTimeout(() => fetchJenkinsJobs(), 2000)
                } else {
                    showNotification('error', data.message || 'Failed to trigger build')
                }
            }
        } catch (error) {
            showNotification('error', 'Failed to trigger build')
        } finally {
            setJenkinsLoading(false)
        }
    }

    // Pipeline Editor functions
    const openPipelineEditor = async (jobName: string) => {
        setEditingJobName(jobName)
        setJenkinsLoading(true)
        setEditMode('pipeline')
        try {
            const response = await fetch(`${API_BASE}/jenkins/job/${encodeURIComponent(jobName)}/config?serverUrl=${encodeURIComponent(selectedJenkinsServer)}`)
            if (response.ok) {
                const data = await response.json()
                setPipelineScript(data.pipelineScript || '')
                setConfigXml(data.configXml || '')
                setIsPipelineJob(data.isPipeline)
                setShowPipelineEditor(true)
                if (!data.isPipeline) {
                    setEditMode('xml')
                }
            } else {
                showNotification('error', 'Failed to load job config')
            }
        } catch (error) {
            showNotification('error', 'Failed to load job config')
        } finally {
            setJenkinsLoading(false)
        }
    }

    const saveJobConfig = async () => {
        setSavingPipeline(true)
        try {
            const body = editMode === 'pipeline'
                ? { pipelineScript: pipelineScript }
                : { configXml: configXml }

            const response = await fetch(`${API_BASE}/jenkins/job/${encodeURIComponent(editingJobName)}/config?serverUrl=${encodeURIComponent(selectedJenkinsServer)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    showNotification('success', 'Job config saved!')
                    setShowPipelineEditor(false)
                } else {
                    showNotification('error', data.message || 'Failed to save')
                }
            }
        } catch (error) {
            showNotification('error', 'Failed to save job config')
        } finally {
            setSavingPipeline(false)
        }
    }

    const deleteJenkinsJob = async (jobName: string) => {
        if (!confirm(`⚠️ Are you sure you want to DELETE "${jobName}"?\n\nThis action cannot be undone!`)) {
            return
        }

        setJenkinsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/jenkins/job/${encodeURIComponent(jobName)}?serverUrl=${encodeURIComponent(selectedJenkinsServer)}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    showNotification('success', `Job "${jobName}" deleted!`)
                    fetchJenkinsJobs()
                    setSelectedJob(null)
                } else {
                    showNotification('error', data.message || 'Failed to delete job')
                }
            }
        } catch (error) {
            showNotification('error', 'Failed to delete job')
        } finally {
            setJenkinsLoading(false)
        }
    }

    const createNewJob = async () => {
        if (!newJobName.trim()) {
            showNotification('error', 'Job name is required')
            return
        }

        setCreatingJob(true)
        try {
            const response = await fetch(`${API_BASE}/jenkins/job/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serverUrl: selectedJenkinsServer,
                    jobName: newJobName.trim(),
                    jobType: newJobType
                })
            })
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    showNotification('success', `Job "${newJobName}" created!`)
                    setShowCreateJobModal(false)
                    setNewJobName('')
                    fetchJenkinsJobs()
                } else {
                    showNotification('error', data.message || 'Failed to create job')
                }
            }
        } catch (error) {
            showNotification('error', 'Failed to create job')
        } finally {
            setCreatingJob(false)
        }
    }

    const fetchJobBuilds = async (jobName: string) => {
        try {
            const response = await fetch(`${API_BASE}/jenkins/job/${encodeURIComponent(jobName)}/builds?serverUrl=${encodeURIComponent(selectedJenkinsServer)}`)
            if (response.ok) {
                const data = await response.json()
                setJobBuilds(data.builds || [])
            }
        } catch (error) {
            console.error('Failed to fetch builds:', error)
        }
    }

    const viewConsoleOutput = async (jobName: string, buildNumber: number) => {
        setJenkinsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/jenkins/job/${encodeURIComponent(jobName)}/${buildNumber}/console?serverUrl=${encodeURIComponent(selectedJenkinsServer)}`)
            if (response.ok) {
                const data = await response.json()
                setConsoleOutput(data.console || 'No output available')
                setShowConsole(true)
            }
        } catch (error) {
            showNotification('error', 'Failed to fetch console output')
        } finally {
            setJenkinsLoading(false)
        }
    }

    // Stop a running Jenkins build
    const stopJenkinsBuild = async (jobName: string, buildNumber?: number) => {
        setJenkinsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/jenkins/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serverUrl: selectedJenkinsServer,
                    jobName: jobName,
                    buildNumber: buildNumber
                })
            })
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    showNotification('success', `Stop request sent for ${jobName}`)
                    setTimeout(() => fetchJenkinsJobs(), 2000)
                } else {
                    showNotification('error', data.message || 'Failed to stop build')
                }
            }
        } catch (error) {
            showNotification('error', 'Failed to stop build')
        } finally {
            setJenkinsLoading(false)
        }
    }

    // Check if job is currently running
    const isJobRunning = (color: string) => {
        if (!color) return false
        // Jenkins uses 'xxx_anime' suffix for running jobs (e.g., blue_anime, red_anime, notbuilt_anime)
        const running = color.includes('anime') ||
            color.includes('building') ||
            color.endsWith('_anime')
        // Debug log
        if (running) console.log('Job running with color:', color)
        return running
    }

    const getJobStatusColor = (color: string) => {
        if (!color) return 'bg-gray-500'
        if (color.includes('blue')) return 'bg-green-500'
        if (color.includes('red')) return 'bg-red-500'
        if (color.includes('yellow') || color.includes('anime')) return 'bg-yellow-500 animate-pulse'
        if (color.includes('grey') || color.includes('disabled')) return 'bg-gray-500'
        return 'bg-gray-500'
    }

    // ===== NEW JENKINS FEATURES =====

    // 1. Favorite Jobs
    const toggleFavorite = (jobName: string) => {
        setFavoriteJobs(prev => {
            const newFavorites = prev.includes(jobName)
                ? prev.filter(j => j !== jobName)
                : [...prev, jobName]
            localStorage.setItem('jenkins_favorites', JSON.stringify(newFavorites))
            return newFavorites
        })
    }

    const sortedJenkinsJobs = [...jenkinsJobs].sort((a, b) => {
        const aFav = favoriteJobs.includes(a.name)
        const bFav = favoriteJobs.includes(b.name)
        if (aFav && !bFav) return -1
        if (!aFav && bFav) return 1
        return 0
    })

    // 2. Build Statistics
    const getBuildStats = () => {
        const successCount = jenkinsJobs.filter(j => j.color?.includes('blue')).length
        const failCount = jenkinsJobs.filter(j => j.color?.includes('red')).length
        const runningCount = jenkinsJobs.filter(j => isJobRunning(j.color)).length
        const totalBuilds = jenkinsJobs.reduce((acc, j) => acc + (j.lastBuild?.number || 0), 0)
        const avgDuration = jenkinsJobs.reduce((acc, j) => acc + (j.lastBuild?.duration || 0), 0) / (jenkinsJobs.length || 1)
        return { successCount, failCount, runningCount, totalBuilds, avgDuration, successRate: jenkinsJobs.length ? Math.round((successCount / jenkinsJobs.length) * 100) : 0 }
    }

    // 3. Desktop Notifications
    const enableNotifications = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission()
            setNotificationsEnabled(permission === 'granted')
            if (permission === 'granted') {
                showNotification('success', 'Desktop notifications enabled!')
            }
        }
    }

    const sendDesktopNotification = (title: string, body: string, isSuccess: boolean) => {
        if (notificationsEnabled && 'Notification' in window) {
            new Notification(title, {
                body,
                icon: isSuccess ? '✅' : '❌'
            })
        }
    }

    // Check for job state changes and notify
    const checkJobStateChanges = (newJobs: any[]) => {
        newJobs.forEach(job => {
            const prevColor = previousJobStates[job.name]
            const currColor = job.color
            if (prevColor && prevColor !== currColor) {
                if (prevColor.includes('anime') && !currColor.includes('anime')) {
                    const isSuccess = currColor.includes('blue')
                    sendDesktopNotification(
                        `Build ${isSuccess ? 'Success' : 'Failed'}`,
                        `Job: ${job.name}`,
                        isSuccess
                    )
                }
            }
        })
        const newStates: Record<string, string> = {}
        newJobs.forEach(j => { newStates[j.name] = j.color })
        setPreviousJobStates(newStates)
    }

    // 4. Batch Build
    const toggleBatchSelect = (jobName: string) => {
        setSelectedBatchJobs(prev => {
            const newSet = new Set(prev)
            if (newSet.has(jobName)) {
                newSet.delete(jobName)
            } else {
                newSet.add(jobName)
            }
            return newSet
        })
    }

    const runBatchBuild = async () => {
        const jobs = Array.from(selectedBatchJobs)
        showNotification('info', `Triggering ${jobs.length} builds...`)
        for (const jobName of jobs) {
            await triggerJenkinsBuild(jobName)
        }
        setSelectedBatchJobs(new Set())
        setBatchMode(false)
    }

    // 5. Live Console
    const startLiveConsole = (jobName: string, buildNumber: number) => {
        setLiveConsoleJobName(jobName)
        setLiveConsoleBuildNum(buildNumber)
        setShowConsole(true)
        viewConsoleOutput(jobName, buildNumber)
    }

    // 6. Build Trend (simple chart data)
    const getBuildTrend = () => {
        return jobBuilds.slice(0, 10).reverse().map(build => ({
            number: build.number,
            success: build.result === 'SUCCESS',
            duration: build.duration || 0
        }))
    }

    const formatDuration = (ms: number) => {
        if (!ms) return '-'
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        if (hours > 0) return `${hours}h ${minutes % 60}m`
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`
        return `${seconds}s`
    }

    const formatTimestamp = (ts: number) => {
        if (!ts) return '-'
        return new Date(ts).toLocaleString()
    }

    // Load basePath and tomcatPath from localStorage on mount
    useEffect(() => {
        const savedPath = localStorage.getItem(STORAGE_KEY)
        const normalizedBasePath = normalizePathForEnvironment(savedPath, DEFAULT_PROJECT_BASE_PATH)
        setBasePath(normalizedBasePath)
        if (normalizedBasePath !== savedPath) {
            localStorage.setItem(STORAGE_KEY, normalizedBasePath)
        }

        const savedTomcat = localStorage.getItem(TOMCAT_STORAGE_KEY)
        const normalizedTomcatPath = normalizePathForEnvironment(savedTomcat, DEFAULT_TOMCAT_BASE_PATH)
        setTomcatBasePath(normalizedTomcatPath)
        if (normalizedTomcatPath !== savedTomcat) {
            localStorage.setItem(TOMCAT_STORAGE_KEY, normalizedTomcatPath)
        }

        // Load VPN credentials from localStorage
        const savedVpn = localStorage.getItem('vpn_credentials')
        if (savedVpn) {
            setVpnCredentials(JSON.parse(savedVpn))
        }

        // Check VPN status on mount
        checkVpnStatus()
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
        if (activeTab === 'jenkins') {
            checkJenkinsStatus()
        }
    }, [activeTab])

    // Auto-refresh Jenkins jobs every 5 seconds when on jenkins tab
    useEffect(() => {
        if (activeTab === 'jenkins' && jenkinsOnline) {
            const interval = setInterval(async () => {
                const response = await fetch(`${API_BASE}/jenkins/jobs?serverUrl=${encodeURIComponent(selectedJenkinsServer)}&viewName=${encodeURIComponent(selectedView)}`)
                if (response.ok) {
                    const data = await response.json()
                    const newJobs = data.jobs || []
                    checkJobStateChanges(newJobs)
                    setJenkinsJobs(newJobs)
                }
            }, 5000)

            return () => clearInterval(interval)
        }
    }, [activeTab, jenkinsOnline, selectedView, notificationsEnabled])

    // Live console auto-refresh
    useEffect(() => {
        if (showConsole && liveConsoleJobName && liveConsoleBuildNum > 0) {
            const interval = setInterval(() => {
                viewConsoleOutput(liveConsoleJobName, liveConsoleBuildNum)
            }, 3000)
            return () => clearInterval(interval)
        }
    }, [showConsole, liveConsoleJobName, liveConsoleBuildNum])

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

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
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

    // Restart Tomcat Server
    const restartTomcatServer = async (tomcat: TomcatInfo) => {
        showNotification('success', `Restarting ${tomcat.name}...`)

        // Stop first
        setRunningTomcats(prev => {
            const newSet = new Set(prev)
            newSet.delete(tomcat.path)
            return newSet
        })

        try {
            await fetch(`${API_BASE}/deploy/tomcat/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tomcatPath: tomcat.path })
            })

            // Wait for graceful shutdown
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Start again
            await fetch(`${API_BASE}/deploy/tomcat/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tomcatPath: tomcat.path })
            })

            setRunningTomcats(prev => new Set([...prev, tomcat.path]))
            showNotification('success', `${tomcat.name} restarted successfully!`)
        } catch (error) {
            showNotification('error', 'Failed to restart Tomcat')
        }
    }

    // Quick Deploy: Build -> Prepare -> Deploy in one click
    const quickDeploy = async (projectPath: string) => {
        const project = projects.find(p => p.path === projectPath)
        if (!project) {
            showNotification('error', 'Project not found')
            return
        }

        if (!selectedTomcat) {
            showNotification('error', 'Please select a Tomcat first')
            return
        }

        setQuickDeploying(true)
        const startTime = Date.now()

        try {
            // Step 1: Build
            setDeployProgress({ step: 'Building project...', progress: 20 })
            const buildRes = await fetch(`${API_BASE}/projects/maven/build`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectPath: project.path })
            })
            const buildResult = await buildRes.json()
            if (!buildResult.success) {
                throw new Error(buildResult.error || 'Build failed')
            }

            // Step 2: Prepare Deployment
            setDeployProgress({ step: 'Preparing artifact...', progress: 50 })
            const prepRes = await fetch(`${API_BASE}/deploy/prepare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectPath: project.path,
                    projectName: project.name
                })
            })
            if (!prepRes.ok) throw new Error('Failed to prepare deployment')
            const newDeployment = await prepRes.json()

            // Step 3: Deploy to Tomcat
            setDeployProgress({ step: 'Deploying to Tomcat...', progress: 80 })
            const deployRes = await fetch(`${API_BASE}/deploy/to-tomcat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deploymentId: newDeployment.id,
                    tomcatPath: selectedTomcat.path
                })
            })
            if (!deployRes.ok) throw new Error('Failed to deploy to Tomcat')

            setDeployProgress({ step: 'Complete!', progress: 100 })
            const duration = Date.now() - startTime

            // Add to deployment history
            addToDeploymentHistory({
                projectName: project.name,
                tomcatName: selectedTomcat.name,
                action: 'deploy',
                status: 'success',
                duration
            })

            showNotification('success', `Quick deploy completed in ${(duration / 1000).toFixed(1)}s!`)
            await loadDeployments()

        } catch (error: any) {
            addToDeploymentHistory({
                projectName: project.name,
                tomcatName: selectedTomcat?.name || 'Unknown',
                action: 'deploy',
                status: 'failed'
            })
            showNotification('error', error.message || 'Quick deploy failed')
        } finally {
            setQuickDeploying(false)
            setTimeout(() => setDeployProgress(null), 2000)
        }
    }

    // Add to deployment history
    const addToDeploymentHistory = (entry: Omit<typeof deploymentHistory[0], 'id' | 'timestamp'>) => {
        const newEntry = {
            ...entry,
            id: Date.now().toString(),
            timestamp: new Date().toLocaleString()
        }
        setDeploymentHistory(prev => [newEntry, ...prev].slice(0, 20)) // Keep last 20 entries
    }

    // Health Check for deployed application
    const checkDeploymentHealth = async (deployment: Deployment) => {
        if (!deployment.contextPath) return

        setCheckingHealth(deployment.id)
        const startTime = Date.now()

        try {
            // Try to reach the deployed app
            const url = `http://localhost:8080${deployment.contextPath}`
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                mode: 'no-cors' // Avoid CORS issues for health check
            })

            clearTimeout(timeoutId)
            const responseTime = Date.now() - startTime

            setHealthCheckResults(prev => ({
                ...prev,
                [deployment.id]: {
                    healthy: true,
                    responseTime,
                    lastCheck: new Date().toLocaleTimeString()
                }
            }))
        } catch (error) {
            setHealthCheckResults(prev => ({
                ...prev,
                [deployment.id]: {
                    healthy: false,
                    lastCheck: new Date().toLocaleTimeString()
                }
            }))
        } finally {
            setCheckingHealth(null)
        }
    }

    // Check all deployments health
    const checkAllDeploymentsHealth = async () => {
        for (const deployment of deployments.filter(d => d.status === 'deployed' && d.contextPath)) {
            await checkDeploymentHealth(deployment)
        }
    }

    // View Tomcat Logs
    const viewTomcatLogs = async (tomcat: TomcatInfo) => {
        setShowTomcatLogs(true)
        setLoadingLogs(true)
        setTomcatLogs('')

        try {
            const response = await fetch(`${API_BASE}/deploy/tomcat/logs?tomcatPath=${encodeURIComponent(tomcat.path)}`)
            if (response.ok) {
                const data = await response.json()
                setTomcatLogs(data.logs || 'No logs available')
            } else {
                setTomcatLogs('Failed to load logs')
            }
        } catch (error) {
            setTomcatLogs('Error loading logs: ' + (error as Error).message)
        } finally {
            setLoadingLogs(false)
        }
    }

    // Get deploy statistics
    const getDeployStats = () => {
        const runningCount = tomcats.filter(t => runningTomcats.has(t.path)).length
        const deployedCount = deployments.filter(d => d.status === 'deployed').length
        const pendingCount = deployments.filter(d => d.status === 'pending').length
        const totalSize = deployments.reduce((acc, d) => acc + (d.warFileSize || 0), 0)
        const healthyCount = Object.values(healthCheckResults).filter(h => h.healthy).length
        return { runningCount, deployedCount, pendingCount, totalSize, healthyCount }
    }


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

        // Add to config history
        const historyEntry = {
            id: Date.now().toString(),
            type: 'all' as const,
            timestamp: new Date().toLocaleString(),
            profileName: selectedProfile?.name,
            databaseIp: selectedDatabase,
            orgAlias: configOrgAlias,
            userId: configUserId,
            projectsCount: selectedConfigProjects.size,
            filesUpdated: totalFiles,
            status: successCount === results.length ? 'success' as const : successCount > 0 ? 'partial' as const : 'failed' as const
        }
        setConfigHistory(prev => [historyEntry, ...prev].slice(0, 20))

        showNotification('success', `Applied all configs: ${totalFiles} files in ${successCount}/${results.length} operations`)
    }

    // Show config preview before applying
    const showPreviewBeforeApply = (type: 'database' | 'testsuite' | 'all') => {
        const projectNames = Array.from(selectedConfigProjects).map(path => {
            const proj = projects.find(p => p.path === path)
            return proj?.name || path
        })

        setConfigPreviewData({
            type,
            databaseIp: selectedDatabase,
            projects: projectNames,
            orgAlias: configOrgAlias,
            userId: configUserId,
            hubUrl: hubUrl,
            estimatedFiles: projectNames.length * 3 // Approximate estimate
        })
        setShowConfigPreview(true)
    }

    // Confirm and apply config from preview
    const confirmApplyConfig = async () => {
        setShowConfigPreview(false)
        if (configPreviewData?.type === 'all') {
            await applyAllConfigs()
        } else if (configPreviewData?.type === 'database') {
            await applyDatabaseConfig()
        } else if (configPreviewData?.type === 'testsuite') {
            await applyTestSuiteConfig()
        }
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

        const testStartTime = new Date()
        const testId = Date.now().toString()
        const selectedSuitesArray = Array.from(selectedSuites)

        // Add to history as running
        const historyEntry = {
            id: testId,
            projectName: selectedTestProject.name,
            suites: selectedSuitesArray.map(s => {
                const suite = testSuites.find(ts => ts.className === s)
                return suite?.name || s
            }),
            status: 'running' as const,
            startTime: testStartTime.toLocaleString()
        }
        setTestHistory(prev => [historyEntry, ...prev].slice(0, 20))

        setTestRunning(true)
        setTestProgress({ step: 'Initializing test execution...', progress: 10 })

        // Clear log on backend before starting
        try {
            await fetch(`${API_BASE}/test/clear-log?projectPath=${encodeURIComponent(selectedTestProject.path)}`, {
                method: 'POST'
            })
        } catch (e) {
            console.error('Failed to clear log', e)
        }

        setTestLog('Starting test execution...\n')
        setTestProgress({ step: 'Preparing test environment...', progress: 20 })

        try {
            if (selectedSuitesArray.length === 0) {
                // No suites selected, use custom command
                setTestProgress({ step: 'Running custom command...', progress: 50 })

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

                // Update history as success (CMD opened)
                setTestHistory(prev => prev.map(entry =>
                    entry.id === testId
                        ? { ...entry, status: 'success' as const, endTime: new Date().toLocaleString(), duration: Math.floor((Date.now() - testStartTime.getTime()) / 1000) }
                        : entry
                ))

                // Don't need to poll, CMD window will show everything
                setTestRunning(false)
                setTestProgress(null)
                showNotification('success', 'Test started in CMD window')
            } else {
                // Run suites sequentially in ONE CMD window
                const commands: string[] = []

                setTestProgress({ step: `Building ${selectedSuitesArray.length} test commands...`, progress: 30 })

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
                    setTestProgress({ step: `Preparing suite ${i + 1}/${selectedSuitesArray.length}...`, progress: 30 + (i / selectedSuitesArray.length) * 30 })
                }

                // Chain all commands with && (run sequentially in one CMD)
                const chainedCommand = commands.join(' && ')

                setTestProgress({ step: 'Opening CMD window...', progress: 70 })
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
                    // Update history as failed
                    setTestHistory(prev => prev.map(entry =>
                        entry.id === testId
                            ? { ...entry, status: 'failed' as const, endTime: new Date().toLocaleString(), duration: Math.floor((Date.now() - testStartTime.getTime()) / 1000) }
                            : entry
                    ))
                    showNotification('error', 'Failed to start test execution')
                } else {
                    setTestProgress({ step: 'Tests running in CMD window...', progress: 100 })

                    // Update history as success (CMD opened)
                    setTestHistory(prev => prev.map(entry =>
                        entry.id === testId
                            ? { ...entry, status: 'success' as const, endTime: new Date().toLocaleString(), duration: Math.floor((Date.now() - testStartTime.getTime()) / 1000) }
                            : entry
                    ))

                    setTestLog(prev => prev + `✅ CMD window opened\n`)
                    setTestLog(prev => prev + `Running ${selectedSuitesArray.length} test suites sequentially\n`)
                    setTestLog(prev => prev + `Check CMD window for real-time progress\n`)
                    showNotification('success', `Running ${selectedSuitesArray.length} suites in 1 CMD window`)
                }

                setTestRunning(false)
                setTestProgress(null)
            }

        } catch (e) {
            // Update history as failed
            setTestHistory(prev => prev.map(entry =>
                entry.id === testId
                    ? { ...entry, status: 'failed' as const, endTime: new Date().toLocaleString(), duration: Math.floor((Date.now() - testStartTime.getTime()) / 1000) }
                    : entry
            ))
            showNotification('error', 'Failed to start test')
            setTestRunning(false)
            setTestProgress(null)
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
                {/* Header with Dark Mode Toggle */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                            <TestTube2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Jacoco Runner</h1>
                            <p className="text-muted-foreground">Manage projects, configure builds and deploy applications</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Keyboard Shortcuts Hint */}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            title="Keyboard Shortcuts: Ctrl+1-5 (Tabs), Ctrl+Enter (Run Test), Ctrl+D (Dark Mode)"
                        >
                            <Keyboard className="w-4 h-4" />
                            <span className="hidden lg:inline">Ctrl+1-5</span>
                        </Button>
                        {/* Dark Mode Toggle */}
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={toggleDarkMode}
                            className="w-9 h-9"
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {darkMode ? (
                                <Sun className="w-4 h-4 text-yellow-500" />
                            ) : (
                                <Moon className="w-4 h-4" />
                            )}
                        </Button>
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
                                : notification.type === 'info'
                                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-600'
                                    : 'bg-red-500/10 border border-red-500/20 text-red-600'
                                }`}
                        >
                            {notification.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : notification.type === 'info' ? (
                                <AlertCircle className="w-5 h-5" />
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
                            {runningTestCount > 0 && (
                                <Badge className="ml-1 text-xs bg-blue-500 text-white animate-pulse">
                                    {runningTestCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="jenkins" className="flex items-center gap-2 text-sm">
                            <FolderKanban className="w-4 h-4" />
                            <span className="hidden sm:inline">Jenkins</span>
                            {runningBuildCount > 0 && (
                                <Badge className="ml-1 text-xs bg-orange-500 text-white animate-pulse">
                                    {runningBuildCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Projects */}
                    <TabsContent value="projects" className="space-y-4">
                        {/* Dashboard Overview Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <FolderGit2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{projects.filter(p => !p.isFolder).length}</p>
                                        <p className="text-xs opacity-80">Total Projects</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <GitBranch className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{gitRepoCount}</p>
                                        <p className="text-xs opacity-80">Git Repos</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Hammer className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{mavenProjectCount}</p>
                                        <p className="text-xs opacity-80">Maven</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{nodeProjectCount}</p>
                                        <p className="text-xs opacity-80">Node.js</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{projects.filter(p => p.hasUncommittedChanges).length}</p>
                                        <p className="text-xs opacity-80">Uncommitted</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Actions Card */}
                        {projects.length > 0 && gitRepoCount > 0 && (
                            <Card className="border-2 border-dashed border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500 rounded-lg">
                                                <Rocket className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-purple-700 dark:text-purple-300">Quick Actions</h3>
                                                <p className="text-xs text-muted-foreground">Batch operations for all Git repositories</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                onClick={batchPullAll}
                                                disabled={batchPulling || gitRepoCount === 0}
                                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                            >
                                                {batchPulling ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        {batchProgress.current}/{batchProgress.total}
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowDownToLine className="w-4 h-4 mr-2" />
                                                        Pull All ({gitRepoCount})
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={async () => {
                                                    const gitProjects = projects.filter(p => p.isGitRepo && !p.isFolder)
                                                    if (gitProjects.length === 0) return

                                                    showNotification('success', `Fetching ${gitProjects.length} repositories...`)
                                                    for (const project of gitProjects) {
                                                        try {
                                                            await fetch(`${API_BASE}/projects/git/fetch`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ projectPath: project.path })
                                                            })
                                                        } catch (e) {
                                                            console.error(`Failed to fetch ${project.name}`, e)
                                                        }
                                                    }
                                                    showNotification('success', 'Fetch completed for all repositories')
                                                }}
                                                className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Fetch All
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={async () => {
                                                    const mavenProjects = projects.filter(p => p.isMavenProject && !p.isFolder)
                                                    if (mavenProjects.length === 0) {
                                                        showNotification('error', 'No Maven projects found')
                                                        return
                                                    }

                                                    showNotification('success', `Building ${mavenProjects.length} Maven projects...`)
                                                    for (const project of mavenProjects) {
                                                        try {
                                                            await fetch(`${API_BASE}/projects/build`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ projectPath: project.path })
                                                            })
                                                        } catch (e) {
                                                            console.error(`Failed to build ${project.name}`, e)
                                                        }
                                                    }
                                                    showNotification('success', 'Build started for all Maven projects')
                                                    await loadProjects()
                                                }}
                                                className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                                            >
                                                <Hammer className="w-4 h-4 mr-2" />
                                                Build All Maven
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => loadProjects()}
                                                disabled={isLoading}
                                            >
                                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                                Refresh
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* VPN Quick Connect */}
                        <Card className={`border-2 ${vpnConnected ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-dashed border-cyan-300 dark:border-cyan-800 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30'}`}>
                            <CardContent className="p-3 md:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${vpnConnected ? 'bg-green-500' : 'bg-cyan-500'}`}>
                                            <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm md:text-base text-cyan-700 dark:text-cyan-300">Cisco AnyConnect VPN</h3>
                                            <p className="text-xs text-muted-foreground">{vpnCredentials.server || 'Not configured'}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${vpnConnected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white/50 dark:bg-black/20'}`}>
                                            <span className={`w-2 h-2 rounded-full ${vpnConnected ? 'bg-green-500' : vpnState === 'Connecting...' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'}`} />
                                            <span className="text-xs md:text-sm font-medium">{vpnState}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {vpnConnected ? (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={disconnectVpn}
                                                disabled={vpnLoading}
                                            >
                                                {vpnLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔓 Disconnect'}
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={connectVpn}
                                                disabled={vpnLoading}
                                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                                            >
                                                {vpnLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔐 Connect VPN'}
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowVpnConfig(true)}
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={checkVpnStatus}
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* VPN Config Modal */}
                        {showVpnConfig && (
                            <Card className="border-t-4 border-t-cyan-500">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            🔐 VPN Configuration
                                        </CardTitle>
                                        <Button size="sm" variant="ghost" onClick={() => setShowVpnConfig(false)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">VPN Server</Label>
                                            <Input
                                                value={vpnCredentials.server}
                                                onChange={(e) => setVpnCredentials(prev => ({ ...prev, server: e.target.value }))}
                                                placeholder="vpn.company.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Group (optional)</Label>
                                            <Input
                                                value={vpnCredentials.group}
                                                onChange={(e) => setVpnCredentials(prev => ({ ...prev, group: e.target.value }))}
                                                placeholder="VPN Group"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Username</Label>
                                            <Input
                                                value={vpnCredentials.username}
                                                onChange={(e) => setVpnCredentials(prev => ({ ...prev, username: e.target.value }))}
                                                placeholder="your.username"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Password</Label>
                                            <Input
                                                type="password"
                                                value={vpnCredentials.password}
                                                onChange={(e) => setVpnCredentials(prev => ({ ...prev, password: e.target.value }))}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Duo Push Method</Label>
                                        <select
                                            value={vpnCredentials.pushMethod}
                                            onChange={(e) => setVpnCredentials(prev => ({ ...prev, pushMethod: e.target.value }))}
                                            className="h-9 w-full px-3 rounded-md border border-input bg-background text-sm"
                                        >
                                            <option value="push">📱 Duo Push (Mobile App)</option>
                                            <option value="phone">📞 Phone Call</option>
                                            <option value="sms">💬 SMS Passcode</option>
                                            <option value="1">1 - First option</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setShowVpnConfig(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                localStorage.setItem('vpn_credentials', JSON.stringify(vpnCredentials))
                                                showNotification('success', 'VPN credentials saved!')
                                                setShowVpnConfig(false)
                                            }}
                                            className="bg-cyan-600 hover:bg-cyan-700"
                                        >
                                            Save Credentials
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        ⚠️ Credentials are saved locally. After clicking Connect, approve the Duo push on your phone.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

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
                                                        {/* Favorite Button */}
                                                        {!project.isFolder && (
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    toggleFavoriteProject(project.path)
                                                                }}
                                                                className="w-6 h-6 p-0 hover:bg-yellow-100"
                                                                title={favoriteProjects.has(project.path) ? 'Remove from favorites' : 'Add to favorites'}
                                                            >
                                                                <Star className={`w-4 h-4 ${favoriteProjects.has(project.path) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                            </Button>
                                                        )}
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
                        {/* Dashboard Overview Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{environmentProfiles.length}</p>
                                        <p className="text-xs opacity-80">Profiles</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <FolderGit2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{selectedConfigProjects.size}</p>
                                        <p className="text-xs opacity-80">Selected</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{configHistory.filter(h => h.status === 'success').length}</p>
                                        <p className="text-xs opacity-80">Success</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{configResults.reduce((sum, r) => sum + r.filesUpdated, 0)}</p>
                                        <p className="text-xs opacity-80">Files Updated</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{configHistory.length}</p>
                                        <p className="text-xs opacity-80">Total Configs</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

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
                                                onClick={() => showPreviewBeforeApply('all')}
                                                disabled={configLoading || selectedConfigProjects.size === 0}
                                                size="sm"
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg"
                                            >
                                                {configLoading ? (
                                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Applying...</>
                                                ) : (
                                                    <><Eye className="w-4 h-4 mr-2" />Preview & Apply</>
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

                        {/* Config History Panel */}
                        <Card className="border-t-4 border-t-indigo-500 shadow-lg">
                            <CardHeader className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-b pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-lg text-indigo-600 dark:text-indigo-400">
                                        <History className="w-5 h-5" />
                                        Configuration History
                                        {configHistory.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {configHistory.length}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {configHistory.length > 0 && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => exportHistory('config')}
                                                    className="text-muted-foreground hover:text-blue-500"
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Export
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setConfigHistory([])}
                                                    className="text-muted-foreground hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Clear
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {configHistory.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No configuration history yet</p>
                                        <p className="text-xs">Applied configurations will appear here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        <AnimatePresence>
                                            {configHistory.map((entry, index) => (
                                                <motion.div
                                                    key={entry.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-md ${entry.status === 'success'
                                                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                                                        : entry.status === 'partial'
                                                            ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                                                            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${entry.status === 'success'
                                                            ? 'bg-green-500 text-white'
                                                            : entry.status === 'partial'
                                                                ? 'bg-yellow-500 text-white'
                                                                : 'bg-red-500 text-white'
                                                            }`}>
                                                            {entry.status === 'success' && <CheckCircle2 className="w-5 h-5" />}
                                                            {entry.status === 'partial' && <AlertCircle className="w-5 h-5" />}
                                                            {entry.status === 'failed' && <XCircle className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm flex items-center gap-2">
                                                                {entry.profileName && (
                                                                    <Badge variant="outline" className="text-xs font-normal">
                                                                        {entry.profileName}
                                                                    </Badge>
                                                                )}
                                                                {entry.type === 'all' ? 'Full Config' : entry.type === 'database' ? 'Database' : 'Test Suite'}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                                                                {entry.databaseIp && (
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                                        DB: {entry.databaseIp}
                                                                    </span>
                                                                )}
                                                                {entry.orgAlias && (
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                                                                        Org: {entry.orgAlias}
                                                                    </span>
                                                                )}
                                                                <span className="flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                                    {entry.projectsCount} projects
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant="outline" className={`mb-1 ${entry.status === 'success'
                                                            ? 'text-green-600 border-green-500'
                                                            : entry.status === 'partial'
                                                                ? 'text-yellow-600 border-yellow-500'
                                                                : 'text-red-600 border-red-500'
                                                            }`}>
                                                            {entry.filesUpdated} files
                                                        </Badge>
                                                        <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Config Preview Modal */}
                        <AnimatePresence>
                            {showConfigPreview && configPreviewData && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                                    onClick={() => setShowConfigPreview(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
                                    >
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Eye className="w-5 h-5" />
                                                Configuration Preview
                                            </h3>
                                            <p className="text-sm text-white/80">Review changes before applying</p>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3">
                                                    <p className="text-xs text-muted-foreground mb-1">Database IP</p>
                                                    <p className="font-mono font-semibold text-purple-600 dark:text-purple-400">{configPreviewData.databaseIp}</p>
                                                </div>
                                                <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-lg p-3">
                                                    <p className="text-xs text-muted-foreground mb-1">Org Alias</p>
                                                    <p className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">{configPreviewData.orgAlias}</p>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                                                    <p className="text-xs text-muted-foreground mb-1">User ID</p>
                                                    <p className="font-mono font-semibold text-blue-600 dark:text-blue-400">{configPreviewData.userId}</p>
                                                </div>
                                                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                                                    <p className="text-xs text-muted-foreground mb-1">Estimated Files</p>
                                                    <p className="font-mono font-semibold text-green-600 dark:text-green-400">~{configPreviewData.estimatedFiles}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium mb-2">Target Projects ({configPreviewData.projects?.length || 0})</p>
                                                <div className="max-h-32 overflow-y-auto space-y-1">
                                                    {configPreviewData.projects?.map((proj, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-zinc-800 rounded px-2 py-1">
                                                            <FolderGit2 className="w-4 h-4 text-muted-foreground" />
                                                            {proj}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                                        This will modify .properties and .xml files in selected projects. Make sure to review changes and rebuild your projects after applying.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t p-4 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-800">
                                            <Button variant="outline" onClick={() => setShowConfigPreview(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={confirmApplyConfig}
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
                                            >
                                                <Rocket className="w-4 h-4 mr-2" />
                                                Apply Now
                                            </Button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </TabsContent>

                    {/* Tab 3: Deploy */}
                    <TabsContent value="deploy" className="space-y-6">
                        {/* Dashboard Overview Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Server className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{getDeployStats().runningCount}/{tomcats.length}</p>
                                        <p className="text-xs opacity-80">Tomcats Running</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{getDeployStats().deployedCount}</p>
                                        <p className="text-xs opacity-80">Deployed Apps</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{getDeployStats().pendingCount}</p>
                                        <p className="text-xs opacity-80">Pending Deploy</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{getDeployStats().healthyCount}</p>
                                        <p className="text-xs opacity-80">Healthy Apps</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Archive className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{(getDeployStats().totalSize / 1024 / 1024).toFixed(0)} MB</p>
                                        <p className="text-xs opacity-80">Total Size</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Deploy Card */}
                        <Card className="border-2 border-dashed border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                            <Rocket className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-purple-700 dark:text-purple-300">Quick Deploy</h3>
                                            <p className="text-xs text-muted-foreground">Build + Prepare + Deploy in one click</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center gap-3 flex-1 md:max-w-md">
                                        <div className="relative flex-1 w-full">
                                            <FolderOpen className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <select
                                                className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                                                value={quickDeployProject}
                                                onChange={(e) => setQuickDeployProject(e.target.value)}
                                                disabled={quickDeploying}
                                            >
                                                <option value="">Select Maven Project...</option>
                                                {projects.filter(p => p.isMavenProject).map(p => (
                                                    <option key={p.path} value={p.path}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button
                                            onClick={() => quickDeploy(quickDeployProject)}
                                            disabled={!quickDeployProject || !selectedTomcat || quickDeploying}
                                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white min-w-[140px]"
                                        >
                                            {quickDeploying ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    {deployProgress?.step || 'Deploying...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Rocket className="w-4 h-4 mr-2" />
                                                    Quick Deploy
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                {deployProgress && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-purple-200 dark:bg-purple-900 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${deployProgress.progress}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-purple-600">{deployProgress.progress}%</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{deployProgress.step}</p>
                                    </motion.div>
                                )}
                                {!selectedTomcat && (
                                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Please select a Tomcat server below first
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Column: Tomcat Management */}
                            <div className="lg:col-span-5 space-y-4">
                                {/* Tomcat Configuration */}
                                <Card className="border-t-4 border-t-purple-500 shadow-lg">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Server className="w-5 h-5 text-purple-500" />
                                                Tomcat Servers
                                            </div>
                                            {selectedTomcat && (
                                                <Badge variant="outline" className="text-purple-600 border-purple-300">
                                                    Selected: {selectedTomcat.name}
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription>
                                            Manage your Tomcat installations
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-3">
                                            <Input
                                                value={tomcatBasePath}
                                                onChange={(e) => setTomcatBasePath(e.target.value)}
                                                placeholder="e.g., C:\Servers or D:\apache"
                                                className="flex-1 font-mono text-sm"
                                            />
                                            <Button
                                                onClick={loadTomcats}
                                                disabled={loadingTomcats || !tomcatBasePath}
                                                size="sm"
                                                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                            >
                                                {loadingTomcats ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Search className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>

                                        {/* Tomcat List */}
                                        {tomcats.length > 0 && (
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                                {tomcats.map((tomcat) => {
                                                    const isRunning = runningTomcats.has(tomcat.path)
                                                    const isSelected = selectedTomcat?.path === tomcat.path
                                                    return (
                                                        <motion.div
                                                            key={tomcat.path}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            onClick={() => {
                                                                setSelectedTomcat(tomcat)
                                                                localStorage.setItem(SELECTED_TOMCAT_KEY, tomcat.path)
                                                            }}
                                                            className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                                                                ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30 shadow-lg'
                                                                : 'border-transparent bg-muted/30 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className={`p-2 rounded-lg ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}>
                                                                        <Server className="w-4 h-4 text-white" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-semibold truncate">{tomcat.name}</span>
                                                                            {tomcat.version && (
                                                                                <Badge variant="outline" className="text-xs">{tomcat.version}</Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground truncate">{tomcat.path}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                                    {isRunning ? (
                                                                        <Badge className="bg-green-500 hover:bg-green-600 animate-pulse text-xs">
                                                                            <span className="mr-1">●</span> Running
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="secondary" className="text-xs">Stopped</Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* Quick Actions */}
                                                            <div className="flex gap-1 mt-2 pt-2 border-t border-dashed" onClick={(e) => e.stopPropagation()}>
                                                                {isRunning ? (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => restartTomcatServer(tomcat)}
                                                                            className="h-7 text-xs flex-1"
                                                                        >
                                                                            <RotateCw className="w-3 h-3 mr-1" />
                                                                            Restart
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => stopTomcatServer(tomcat)}
                                                                            className="h-7 text-xs flex-1"
                                                                        >
                                                                            <Square className="w-3 h-3 mr-1" />
                                                                            Stop
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => startTomcatServer(tomcat)}
                                                                        className="h-7 text-xs flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                                                    >
                                                                        <Play className="w-3 h-3 mr-1" />
                                                                        Start Server
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => viewTomcatLogs(tomcat)}
                                                                    className="h-7 text-xs"
                                                                    title="View Logs"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {tomcats.length === 0 && tomcatBasePath && (
                                            <div className="py-6 text-center text-muted-foreground">
                                                <Server className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">No Tomcat installations found</p>
                                                <p className="text-xs">Click the search button to scan</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Deployment History */}
                                <Card className="border-t-4 border-t-blue-500 shadow-lg">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-blue-500" />
                                                Deployment History
                                            </div>
                                            {deploymentHistory.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setDeploymentHistory([])}
                                                    className="h-7 text-xs text-muted-foreground"
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {deploymentHistory.length === 0 ? (
                                            <div className="py-6 text-center text-muted-foreground">
                                                <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">No deployment history yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-[250px] overflow-y-auto">
                                                {deploymentHistory.map((entry) => (
                                                    <div
                                                        key={entry.id}
                                                        className={`flex items-center justify-between p-2 rounded-lg text-sm ${entry.status === 'success'
                                                            ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900'
                                                            : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {entry.status === 'success' ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-500" />
                                                            )}
                                                            <div>
                                                                <span className="font-medium">{entry.projectName}</span>
                                                                <span className="text-xs text-muted-foreground ml-1">→ {entry.tomcatName}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-muted-foreground">{entry.timestamp}</div>
                                                            {entry.duration && (
                                                                <div className="text-xs font-mono text-green-600">{(entry.duration / 1000).toFixed(1)}s</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Deployments */}
                            <div className="lg:col-span-7 space-y-4">
                                {/* Pending Deployments */}
                                <Card className="border-t-4 border-t-orange-500 shadow-lg">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Upload className="w-5 h-5 text-orange-500" />
                                                Deployments
                                                {deployments.length > 0 && (
                                                    <Badge variant="secondary">{deployments.length}</Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={checkAllDeploymentsHealth}
                                                    disabled={deployments.filter(d => d.status === 'deployed').length === 0}
                                                    className="h-8 text-xs"
                                                >
                                                    <Activity className="w-3 h-3 mr-1" />
                                                    Check Health
                                                </Button>
                                                {selectedTomcat && deployments.length > 0 && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => deployAllToTomcat(selectedTomcat)}
                                                        disabled={!!deployLoading}
                                                        className="h-8 text-xs bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                                    >
                                                        {deployLoading === 'all' ? (
                                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                        ) : (
                                                            <Rocket className="w-3 h-3 mr-1" />
                                                        )}
                                                        Deploy All
                                                    </Button>
                                                )}
                                            </div>
                                        </CardTitle>
                                        <CardDescription>
                                            WAR/JAR files ready to deploy
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {deployments.length === 0 ? (
                                            <div className="py-8 text-center text-muted-foreground">
                                                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                <p>No pending deployments</p>
                                                <p className="text-sm mt-1">Use "Quick Deploy" or click "Deploy" on a Maven project</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                                {deployments.map((deployment) => {
                                                    const health = healthCheckResults[deployment.id]
                                                    return (
                                                        <motion.div
                                                            key={deployment.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`p-4 border-2 rounded-xl transition-all ${deployment.status === 'deployed'
                                                                ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900'
                                                                : 'border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="font-semibold">{deployment.projectName}</span>
                                                                        <Badge variant={deployment.fileType === 'WAR' ? 'default' : 'outline'} className="text-xs">
                                                                            {deployment.fileType || 'WAR'}
                                                                        </Badge>
                                                                        <Badge variant={deployment.status === 'deployed' ? 'default' : 'secondary'} className={deployment.status === 'deployed' ? 'bg-green-500' : ''}>
                                                                            {deployment.status}
                                                                        </Badge>
                                                                        {/* Health Status */}
                                                                        {deployment.status === 'deployed' && health && (
                                                                            <Badge variant="outline" className={health.healthy ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}>
                                                                                {health.healthy ? (
                                                                                    <>✓ {health.responseTime}ms</>
                                                                                ) : (
                                                                                    <>✗ Unhealthy</>
                                                                                )}
                                                                            </Badge>
                                                                        )}
                                                                        {checkingHealth === deployment.id && (
                                                                            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        {deployment.warFileName}
                                                                        <span className="font-mono ml-2">({(deployment.warFileSize / 1024 / 1024).toFixed(2)} MB)</span>
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Added: {deployment.createdAt}
                                                                        {deployment.deployedAt && <> • Deployed: {deployment.deployedAt}</>}
                                                                        {deployment.tomcatName && <> • To: {deployment.tomcatName}</>}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 mt-3 pt-3 border-t border-dashed">
                                                                {/* Open in Browser */}
                                                                {deployment.status === 'deployed' && deployment.contextPath && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => openInBrowser(deployment)}
                                                                        className="h-8 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                                    >
                                                                        <ExternalLink className="w-3 h-3 mr-1" />
                                                                        Open App
                                                                    </Button>
                                                                )}

                                                                {/* Health Check */}
                                                                {deployment.status === 'deployed' && deployment.contextPath && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => checkDeploymentHealth(deployment)}
                                                                        disabled={checkingHealth === deployment.id}
                                                                        className="h-8 text-xs"
                                                                    >
                                                                        {checkingHealth === deployment.id ? (
                                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                                        ) : (
                                                                            <Activity className="w-3 h-3 mr-1" />
                                                                        )}
                                                                        Health
                                                                    </Button>
                                                                )}

                                                                {/* Re-deploy */}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleRedeploy(deployment)}
                                                                    disabled={
                                                                        !selectedTomcat ||
                                                                        deployLoading === deployment.id
                                                                    }
                                                                    className="h-8 text-xs text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                                                >
                                                                    {deployLoading === deployment.id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <RotateCw className="w-3 h-3 mr-1" />
                                                                    )}
                                                                    Re-deploy
                                                                </Button>

                                                                {/* Initial Deploy */}
                                                                {deployment.status === 'pending' && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => deployToTomcat(deployment.id)}
                                                                        disabled={!selectedTomcat || deployLoading === deployment.id}
                                                                        className="h-8 text-xs bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                                                    >
                                                                        {deployLoading === deployment.id ? (
                                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                                        ) : (
                                                                            <>
                                                                                <Rocket className="w-3 h-3 mr-1" />
                                                                                Deploy
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                )}

                                                                <div className="flex-1" />

                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => removeDeployment(deployment.id)}
                                                                    className="h-8"
                                                                >
                                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Deploy Tips */}
                                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-900">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                                            <AlertCircle className="w-4 h-4" />
                                            Quick Tips
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-xs text-muted-foreground space-y-1">
                                        <p>• Use <strong className="text-blue-600">Quick Deploy</strong> for one-click build + deploy</p>
                                        <p>• <strong className="text-green-600">Health checks</strong> verify your app is responding</p>
                                        <p>• <strong className="text-orange-600">Restart</strong> Tomcat to apply configuration changes</p>
                                        <p>• View <strong>Tomcat logs</strong> to debug startup issues</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Tomcat Logs Modal */}
                        <AnimatePresence>
                            {showTomcatLogs && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                                    onClick={() => setShowTomcatLogs(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
                                    >
                                        {/* Terminal Header */}
                                        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900">
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => setShowTomcatLogs(false)}
                                                    className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                                />
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                                <div className="w-3 h-3 bg-green-500 rounded-full" />
                                            </div>
                                            <span className="text-sm text-slate-300 ml-3 font-mono">
                                                {selectedTomcat?.name} — catalina.out
                                            </span>
                                            <div className="flex-1" />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => selectedTomcat && viewTomcatLogs(selectedTomcat)}
                                                className="h-7 text-slate-400 hover:text-white"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                                            </Button>
                                        </div>
                                        {/* Terminal Body */}
                                        <div className="flex-1 overflow-auto bg-slate-950 p-4">
                                            {loadingLogs ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                                                </div>
                                            ) : (
                                                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                                                    {tomcatLogs || 'No logs available'}
                                                </pre>
                                            )}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </TabsContent>

                    {/* Tab 4: Run Test */}
                    <TabsContent value="test" className="space-y-6">
                        {/* Dashboard Overview Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{testHistory.length}</p>
                                        <p className="text-xs opacity-80">Total Runs</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{testHistory.filter(t => t.status === 'success').length}</p>
                                        <p className="text-xs opacity-80">Passed</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <XCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{testHistory.filter(t => t.status === 'failed').length}</p>
                                        <p className="text-xs opacity-80">Failed</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Loader2 className={`w-5 h-5 ${testRunning ? 'animate-spin' : ''}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{testRunning ? 1 : 0}</p>
                                        <p className="text-xs opacity-80">Running</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {testHistory.length > 0
                                                ? Math.round((testHistory.filter(t => t.status === 'success').length / testHistory.length) * 100)
                                                : 0}%
                                        </p>
                                        <p className="text-xs opacity-80">Success Rate</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

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

                        {/* Test Progress Bar (shown when running) */}
                        {testRunning && testProgress && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Card className="border-2 border-blue-300 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{testProgress.step}</span>
                                                    <span className="text-sm font-mono text-blue-600">{testProgress.progress}%</span>
                                                </div>
                                                <div className="h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${testProgress.progress}%` }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    setTestRunning(false)
                                                    setTestProgress(null)
                                                    // Add to history as cancelled
                                                    if (selectedTestProject) {
                                                        const entry = {
                                                            id: Date.now().toString(),
                                                            projectName: selectedTestProject.name,
                                                            suites: Array.from(selectedSuites).map(s => {
                                                                const suite = testSuites.find(ts => ts.className === s)
                                                                return suite?.name || s
                                                            }),
                                                            status: 'cancelled' as const,
                                                            startTime: new Date().toLocaleString()
                                                        }
                                                        setTestHistory(prev => [entry, ...prev].slice(0, 20))
                                                    }
                                                    showNotification('error', 'Test cancelled')
                                                }}
                                            >
                                                <Square className="w-3 h-3 mr-1" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

                        {/* Test History Panel */}
                        <Card className="border-t-4 border-t-indigo-500 shadow-lg">
                            <CardHeader className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-b pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-lg text-indigo-600 dark:text-indigo-400">
                                        <Clock className="w-5 h-5" />
                                        Test History
                                        {testHistory.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {testHistory.length}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {testHistory.length > 0 && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => exportHistory('test')}
                                                    className="text-muted-foreground hover:text-blue-500"
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Export
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setTestHistory([])}
                                                    className="text-muted-foreground hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Clear
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {testHistory.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No test runs yet</p>
                                        <p className="text-xs">Run a test to see history here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                                        <AnimatePresence>
                                            {testHistory.map((entry, index) => (
                                                <motion.div
                                                    key={entry.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-md ${entry.status === 'success'
                                                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                                                        : entry.status === 'failed'
                                                            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                                            : entry.status === 'running'
                                                                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                                                                : 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.status === 'success'
                                                            ? 'bg-green-500 text-white'
                                                            : entry.status === 'failed'
                                                                ? 'bg-red-500 text-white'
                                                                : entry.status === 'running'
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'bg-gray-400 text-white'
                                                            }`}>
                                                            {entry.status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                                                            {entry.status === 'failed' && <XCircle className="w-4 h-4" />}
                                                            {entry.status === 'running' && <Loader2 className="w-4 h-4 animate-spin" />}
                                                            {entry.status === 'cancelled' && <Square className="w-4 h-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{entry.projectName}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {entry.suites.length > 0
                                                                    ? `${entry.suites.length} suite${entry.suites.length > 1 ? 's' : ''}: ${entry.suites.slice(0, 2).join(', ')}${entry.suites.length > 2 ? '...' : ''}`
                                                                    : 'Custom command'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant="outline" className={`mb-1 ${entry.status === 'success'
                                                            ? 'text-green-600 border-green-500'
                                                            : entry.status === 'failed'
                                                                ? 'text-red-600 border-red-500'
                                                                : entry.status === 'running'
                                                                    ? 'text-blue-600 border-blue-500'
                                                                    : 'text-gray-600 border-gray-500'
                                                            }`}>
                                                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                                        </Badge>
                                                        <p className="text-xs text-muted-foreground">{entry.startTime}</p>
                                                        {entry.duration && (
                                                            <p className="text-xs font-mono text-muted-foreground">
                                                                {Math.floor(entry.duration / 60)}m {entry.duration % 60}s
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Tips */}
                        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="w-5 h-5 text-indigo-500 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="font-medium text-indigo-700 dark:text-indigo-300">Quick Tips</p>
                                        <ul className="text-xs text-muted-foreground space-y-1">
                                            <li>• Start Selenium Hub first, then add Nodes for parallel testing</li>
                                            <li>• Select multiple test suites for batch execution</li>
                                            <li>• Use the progress bar to track test execution in real-time</li>
                                            <li>• Check test history to analyze past runs and identify patterns</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 5: Jenkins */}
                    <TabsContent value="jenkins" className="space-y-4 md:space-y-6">
                        {/* Server Selection Card */}
                        <Card className="border-2 border-dashed border-orange-300 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                            <CardContent className="p-3 md:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${jenkinsOnline ? 'bg-green-500' : 'bg-gray-400'}`}>
                                            <FolderKanban className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm md:text-base text-orange-700 dark:text-orange-300">Jenkins Server</h3>
                                            <p className="text-xs text-muted-foreground hidden sm:block">Connect to Jenkins instance</p>
                                        </div>
                                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/50 dark:bg-black/20 ml-auto sm:ml-0">
                                            <span className={`w-2 h-2 rounded-full ${jenkinsOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                            <span className="text-xs md:text-sm font-medium">{jenkinsOnline ? 'Online' : 'Offline'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <select
                                            value={selectedJenkinsServer}
                                            onChange={(e) => {
                                                setSelectedJenkinsServer(e.target.value)
                                                setJenkinsJobs([])
                                                setJenkinsOnline(false)
                                            }}
                                            className="h-9 px-3 rounded-md border border-input bg-background text-sm w-full sm:w-auto"
                                        >
                                            {jenkinsServers.map(server => (
                                                <option key={server.url} value={server.url}>
                                                    {server.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={checkJenkinsStatus}
                                                disabled={jenkinsLoading}
                                                className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                                            >
                                                {jenkinsLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(`http://${selectedJenkinsServer}`, '_blank')}
                                                className="flex-1 sm:flex-none"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span className="ml-1 hidden sm:inline">Open</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dashboard Overview Stats */}
                        {jenkinsOnline && (
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{getBuildStats().successCount}</p>
                                            <p className="text-xs opacity-80">Success</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 text-white shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <XCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{getBuildStats().failCount}</p>
                                            <p className="text-xs opacity-80">Failed</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-4 text-white shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Loader2 className={`w-5 h-5 ${getBuildStats().runningCount > 0 ? 'animate-spin' : ''}`} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{getBuildStats().runningCount}</p>
                                            <p className="text-xs opacity-80">Running</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{getBuildStats().successRate}%</p>
                                            <p className="text-xs opacity-80">Success Rate</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-4 text-white shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold truncate">{formatDuration(getBuildStats().avgDuration)}</p>
                                            <p className="text-xs opacity-80">Avg Duration</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 text-white shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <FolderKanban className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{jenkinsJobs.length}</p>
                                            <p className="text-xs opacity-80">Total Jobs</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Build Queue */}
                        {jenkinsOnline && buildQueue.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <ListOrdered className="w-5 h-5 text-yellow-600" />
                                        <span className="font-semibold text-yellow-700 dark:text-yellow-400">Build Queue</span>
                                        <Badge className="bg-yellow-500 text-white">{buildQueue.length}</Badge>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={fetchBuildQueue} className="h-7">
                                        <RefreshCw className="w-3 h-3" />
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                                    {buildQueue.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-2 bg-white dark:bg-black/20 rounded-lg border border-yellow-100 dark:border-yellow-900"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                                                <span className="text-sm font-medium">{item.jobName}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={item.why}>
                                                {item.why}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Action Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    size="sm"
                                    onClick={() => setShowCreateJobModal(true)}
                                    className="bg-green-600 hover:bg-green-700 text-xs md:text-sm"
                                >
                                    ➕ New Job
                                </Button>
                                <Button
                                    size="sm"
                                    variant={batchMode ? 'default' : 'outline'}
                                    onClick={() => {
                                        setBatchMode(!batchMode)
                                        setSelectedBatchJobs(new Set())
                                    }}
                                    className="text-xs md:text-sm"
                                >
                                    {batchMode ? '✕ Exit' : '🔄 Batch'}
                                </Button>
                                {batchMode && selectedBatchJobs.size > 0 && (
                                    <Button size="sm" onClick={runBatchBuild} className="bg-blue-600 hover:bg-blue-700 text-xs md:text-sm">
                                        ▶️ Run {selectedBatchJobs.size}
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={enableNotifications}
                                    className={`text-xs md:text-sm ${notificationsEnabled ? 'border-green-500 text-green-600' : ''}`}
                                >
                                    {notificationsEnabled ? '🔔' : '🔕'}
                                    <span className="hidden sm:inline ml-1">{notificationsEnabled ? 'On' : 'Notify'}</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowCredentialsModal(true)}
                                    className="text-xs md:text-sm"
                                >
                                    🔐<span className="hidden sm:inline ml-1">Credentials</span>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                            {/* Jobs List */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="lg:col-span-5"
                            >
                                <Card className="border-t-4 border-t-orange-500 shadow-lg h-full">
                                    <CardHeader className="p-3 md:pb-2">
                                        <CardTitle className="flex items-center justify-between text-sm md:text-base">
                                            <span className="flex items-center gap-2">
                                                <FolderKanban className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                                                <span className="hidden sm:inline">Jenkins </span>Jobs
                                            </span>
                                            <Badge variant="secondary" className="text-xs">{jenkinsJobs.filter(j => !jobSearchQuery || j.name.toLowerCase().includes(jobSearchQuery.toLowerCase())).length}</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0 space-y-2 md:space-y-3">
                                        {/* Search Input */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search jobs..."
                                                value={jobSearchQuery}
                                                onChange={(e) => setJobSearchQuery(e.target.value)}
                                                className="pl-9 h-9"
                                            />
                                        </div>

                                        {/* View Tabs */}
                                        {jenkinsViews.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                <Button
                                                    size="sm"
                                                    variant={selectedView === 'all' ? 'default' : 'outline'}
                                                    className="h-7 text-xs"
                                                    onClick={() => {
                                                        setSelectedView('all')
                                                        fetchJenkinsJobs('all')
                                                    }}
                                                >
                                                    All
                                                </Button>
                                                {jenkinsViews.map((view) => (
                                                    <Button
                                                        key={view.name}
                                                        size="sm"
                                                        variant={selectedView === view.name ? 'default' : 'outline'}
                                                        className="h-7 text-xs"
                                                        onClick={() => {
                                                            setSelectedView(view.name)
                                                            fetchJenkinsJobs(view.name)
                                                        }}
                                                    >
                                                        {view.name}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Jobs List */}
                                        {jenkinsJobs.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                {jenkinsOnline ? (
                                                    <p>No jobs found</p>
                                                ) : (
                                                    <p>Connect to Jenkins to see jobs</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                                {sortedJenkinsJobs
                                                    .filter(job => !jobSearchQuery || job.name.toLowerCase().includes(jobSearchQuery.toLowerCase()))
                                                    .map((job: any) => (
                                                        <div
                                                            key={job.name}
                                                            className={`p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent/50 ${selectedJob?.name === job.name ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''} ${favoriteJobs.includes(job.name) ? 'border-l-4 border-l-yellow-400' : ''}`}
                                                            onClick={() => {
                                                                if (batchMode) {
                                                                    toggleBatchSelect(job.name)
                                                                } else {
                                                                    setSelectedJob(job)
                                                                    fetchJobBuilds(job.name)
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    {/* Batch checkbox or Status dot */}
                                                                    {batchMode ? (
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedBatchJobs.has(job.name)}
                                                                            onChange={() => toggleBatchSelect(job.name)}
                                                                            className="w-4 h-4 rounded border-gray-300"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                    ) : (
                                                                        <div className={`w-3 h-3 rounded-full ${getJobStatusColor(job.color)}`} />
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium text-sm flex items-center gap-1">
                                                                            {job.name}
                                                                            {favoriteJobs.includes(job.name) && <span className="text-yellow-500">⭐</span>}
                                                                        </p>
                                                                        {job.lastBuild && (
                                                                            <p className="text-xs text-muted-foreground">
                                                                                #{job.lastBuild.number} - {isJobRunning(job.color) ? 'Running' : (job.lastBuild.result || 'Unknown')}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {/* Favorite button */}
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            toggleFavorite(job.name)
                                                                        }}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        {favoriteJobs.includes(job.name) ? '⭐' : '☆'}
                                                                    </Button>
                                                                    {/* Edit button */}
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            openPipelineEditor(job.name)
                                                                        }}
                                                                        disabled={jenkinsLoading}
                                                                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                                                                        title="Edit Pipeline"
                                                                    >
                                                                        ✏️
                                                                    </Button>
                                                                    {/* Run/Stop button */}
                                                                    {isJobRunning(job.color) ? (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                stopJenkinsBuild(job.name)
                                                                            }}
                                                                            disabled={jenkinsLoading}
                                                                            className="h-8"
                                                                        >
                                                                            <Square className="w-4 h-4" />
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                triggerJenkinsBuild(job.name)
                                                                            }}
                                                                            disabled={jenkinsLoading}
                                                                            className="h-8 hover:bg-green-100 hover:text-green-700"
                                                                        >
                                                                            <Play className="w-4 h-4" />
                                                                        </Button>
                                                                    )}
                                                                    {/* Delete button */}
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            deleteJenkinsJob(job.name)
                                                                        }}
                                                                        disabled={jenkinsLoading}
                                                                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                                                                        title="Delete Job"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Build History */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="lg:col-span-7"
                            >
                                <Card className="border-t-4 border-t-blue-500 shadow-lg h-full">
                                    <CardHeader className="p-3 md:pb-3">
                                        <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                                            <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                                            <span className="truncate">
                                                {selectedJob ? `Builds - ${selectedJob.name}` : 'Build History'}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        {!selectedJob ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>Select a job to see build history</p>
                                            </div>
                                        ) : jobBuilds.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>No builds found</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                                {jobBuilds.slice(0, 10).map((build: any) => (
                                                    <div
                                                        key={build.number}
                                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${build.building ? 'bg-yellow-500 animate-pulse' :
                                                                build.result === 'SUCCESS' ? 'bg-green-500' :
                                                                    build.result === 'FAILURE' ? 'bg-red-500' :
                                                                        'bg-gray-500'
                                                                }`} />
                                                            <div>
                                                                <p className="font-medium text-sm">Build #{build.number}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {build.building ? 'Running...' : build.result || 'Unknown'}
                                                                    {' • '}
                                                                    {formatDuration(build.duration)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatTimestamp(build.timestamp)}
                                                            </span>
                                                            {build.building && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => stopJenkinsBuild(selectedJob.name, build.number)}
                                                                    disabled={jenkinsLoading}
                                                                    className="h-7"
                                                                >
                                                                    <Square className="w-3 h-3" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => startLiveConsole(selectedJob.name, build.number)}
                                                                disabled={jenkinsLoading}
                                                            >
                                                                <Terminal className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Build Trend Chart */}
                                        {selectedJob && jobBuilds.length > 0 && (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="text-xs font-medium text-muted-foreground mb-2">📈 Build Trend (last 10)</p>
                                                <div className="flex items-end gap-1 h-16">
                                                    {getBuildTrend().map((build, i) => (
                                                        <div
                                                            key={i}
                                                            className={`flex-1 rounded-t transition-all ${build.success ? 'bg-green-500' : 'bg-red-500'}`}
                                                            style={{ height: `${Math.max(20, Math.min(100, (build.duration / 1000 / 60) * 10))}%` }}
                                                            title={`#${build.number} - ${build.success ? 'SUCCESS' : 'FAILURE'} - ${formatDuration(build.duration)}`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                    <span>Older</span>
                                                    <span>Latest</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Console Output Modal with Live Update */}
                        {showConsole && (
                            <Card className="border-t-4 border-t-green-500">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <Terminal className="w-4 h-4" />
                                            Console Output {liveConsoleJobName && `- ${liveConsoleJobName} #${liveConsoleBuildNum}`}
                                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 animate-pulse">
                                                LIVE
                                            </Badge>
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => {
                                                navigator.clipboard.writeText(consoleOutput)
                                                showNotification('success', 'Console copied!')
                                            }}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => {
                                                setShowConsole(false)
                                                setLiveConsoleJobName('')
                                                setLiveConsoleBuildNum(0)
                                            }}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg text-xs font-mono max-h-[400px] overflow-auto">
                                        {consoleOutput}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}

                        {/* Credentials Modal */}
                        {showCredentialsModal && (
                            <Card className="border-t-4 border-t-purple-500">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            🔐 Jenkins Credentials
                                        </CardTitle>
                                        <Button size="sm" variant="ghost" onClick={() => setShowCredentialsModal(false)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Username</Label>
                                            <Input
                                                value={jenkinsCredentials.username}
                                                onChange={(e) => setJenkinsCredentials(prev => ({ ...prev, username: e.target.value }))}
                                                placeholder="admin"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">API Token</Label>
                                            <Input
                                                type="password"
                                                value={jenkinsCredentials.token}
                                                onChange={(e) => setJenkinsCredentials(prev => ({ ...prev, token: e.target.value }))}
                                                placeholder="Your API token"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setShowCredentialsModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                try {
                                                    await fetch(`${API_BASE}/jenkins/credentials`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            username: jenkinsCredentials.username,
                                                            token: jenkinsCredentials.token
                                                        })
                                                    })
                                                    showNotification('success', 'Credentials saved!')
                                                    setShowCredentialsModal(false)
                                                    checkJenkinsStatus()
                                                } catch (error) {
                                                    showNotification('error', 'Failed to save credentials')
                                                }
                                            }}
                                            className="bg-purple-600 hover:bg-purple-700"
                                        >
                                            Save Credentials
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        💡 Get your API token from Jenkins → User → Configure → API Token
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pipeline Script Editor */}
                        {showPipelineEditor && (
                            <Card className="border-t-4 border-t-indigo-500">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            ✏️ Job Config Editor
                                            <Badge variant="secondary">{editingJobName}</Badge>
                                            {isPipelineJob && (
                                                <Badge variant="outline" className="text-green-600 border-green-500">Pipeline Job</Badge>
                                            )}
                                        </CardTitle>
                                        <Button size="sm" variant="ghost" onClick={() => setShowPipelineEditor(false)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {/* Mode Toggle */}
                                    {isPipelineJob && (
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                size="sm"
                                                variant={editMode === 'pipeline' ? 'default' : 'outline'}
                                                onClick={() => setEditMode('pipeline')}
                                            >
                                                📝 Pipeline Script
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={editMode === 'xml' ? 'default' : 'outline'}
                                                onClick={() => setEditMode('xml')}
                                            >
                                                📄 Full XML Config
                                            </Button>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {editMode === 'pipeline' && isPipelineJob ? (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Groovy Pipeline Script</Label>
                                            <textarea
                                                value={pipelineScript}
                                                onChange={(e) => setPipelineScript(e.target.value)}
                                                className="w-full h-80 p-3 font-mono text-sm bg-zinc-900 text-zinc-100 rounded-lg border border-zinc-700 resize-y"
                                                placeholder="pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo 'Building...'
            }
        }
    }
}"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Job Configuration (config.xml)</Label>
                                            <textarea
                                                value={configXml}
                                                onChange={(e) => setConfigXml(e.target.value)}
                                                className="w-full h-80 p-3 font-mono text-xs bg-zinc-900 text-zinc-100 rounded-lg border border-zinc-700 resize-y"
                                                placeholder="<?xml version='1.0'?>..."
                                            />
                                            <p className="text-xs text-amber-600">
                                                ⚠️ Editing raw XML. Be careful with syntax!
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(`http://${selectedJenkinsServer}/job/${encodeURIComponent(editingJobName)}/configure`, '_blank')}
                                            >
                                                <ExternalLink className="w-4 h-4 mr-1" />
                                                Open in Jenkins
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => setShowPipelineEditor(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={saveJobConfig}
                                                disabled={savingPipeline}
                                                className="bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                {savingPipeline ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                Save Config
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Create New Job Modal */}
                        {showCreateJobModal && (
                            <Card className="border-t-4 border-t-green-500">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            ➕ Create New Job
                                        </CardTitle>
                                        <Button size="sm" variant="ghost" onClick={() => setShowCreateJobModal(false)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Job Name</Label>
                                        <Input
                                            value={newJobName}
                                            onChange={(e) => setNewJobName(e.target.value)}
                                            placeholder="my-new-pipeline-job"
                                            onKeyDown={(e) => e.key === 'Enter' && createNewJob()}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Job Type</Label>
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant={newJobType === 'pipeline' ? 'default' : 'outline'}
                                                onClick={() => setNewJobType('pipeline')}
                                                className={newJobType === 'pipeline' ? 'bg-blue-600' : ''}
                                            >
                                                📋 Pipeline
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={newJobType === 'freestyle' ? 'default' : 'outline'}
                                                onClick={() => setNewJobType('freestyle')}
                                                className={newJobType === 'freestyle' ? 'bg-orange-600' : ''}
                                            >
                                                🔧 Freestyle
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {newJobType === 'pipeline'
                                                ? '📋 Pipeline: Use Groovy script for CI/CD pipeline definition'
                                                : '🔧 Freestyle: Traditional job with shell commands'}
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setShowCreateJobModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={createNewJob}
                                            disabled={creatingJob || !newJobName.trim()}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {creatingJob ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Create Job
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
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
        </div >
    )
}
