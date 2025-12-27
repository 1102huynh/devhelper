'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { sshApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Terminal, Plus, Copy, Trash2, Edit, Search, X,
  Monitor, Apple, Laptop, BookOpen, Zap, Star,
  Download, Upload, Code, Lock, Server, Folder,
  CheckCircle, Info
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SshCommand {
  id: number
  name: string
  command: string
  description: string
  category: string
  os: string[]
  favorite: boolean
  tags: string
}

const OS_TYPES = [
  { value: 'all', label: 'All OS', icon: Monitor, color: 'bg-gray-500' },
  { value: 'linux', label: 'Linux', icon: Server, color: 'bg-blue-500' },
  { value: 'mac', label: 'macOS', icon: Apple, color: 'bg-purple-500' },
  { value: 'windows', label: 'Windows', icon: Laptop, color: 'bg-green-500' },
]

const COMMAND_TEMPLATES = {
  linux: [
    // CONNECTION
    {
      name: 'SSH Connect',
      command: 'ssh user@hostname',
      description: 'Connect to remote server via SSH',
      category: 'Connection',
      os: ['linux', 'mac']
    },
    {
      name: 'SSH with Key',
      command: 'ssh -i ~/.ssh/id_rsa user@hostname',
      description: 'Connect using SSH key',
      category: 'Connection',
      os: ['linux', 'mac']
    },
    {
      name: 'SSH with Port',
      command: 'ssh -p 2222 user@hostname',
      description: 'Connect on custom port',
      category: 'Connection',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'SSH X11 Forwarding',
      command: 'ssh -X user@hostname',
      description: 'Enable X11 forwarding for GUI apps',
      category: 'Connection',
      os: ['linux', 'mac']
    },
    {
      name: 'SSH Compression',
      command: 'ssh -C user@hostname',
      description: 'Enable compression for slow connections',
      category: 'Connection',
      os: ['linux', 'mac', 'windows']
    },

    // FILE TRANSFER
    {
      name: 'SCP Upload',
      command: 'scp file.txt user@hostname:/path/',
      description: 'Copy file to remote server',
      category: 'File Transfer',
      os: ['linux', 'mac']
    },
    {
      name: 'SCP Download',
      command: 'scp user@hostname:/path/file.txt .',
      description: 'Download file from remote',
      category: 'File Transfer',
      os: ['linux', 'mac']
    },
    {
      name: 'SCP Recursive',
      command: 'scp -r /local/dir user@hostname:/remote/',
      description: 'Copy directory recursively',
      category: 'File Transfer',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'SCP Preserve Attributes',
      command: 'scp -p file.txt user@hostname:/path/',
      description: 'Preserve file permissions and timestamps',
      category: 'File Transfer',
      os: ['linux', 'mac']
    },
    {
      name: 'RSYNC Sync',
      command: 'rsync -avz /local/ user@host:/remote/',
      description: 'Sync directories with compression',
      category: 'File Transfer',
      os: ['linux', 'mac']
    },
    {
      name: 'RSYNC with Progress',
      command: 'rsync -avz --progress /local/ user@host:/remote/',
      description: 'Sync with progress bar',
      category: 'File Transfer',
      os: ['linux', 'mac']
    },
    {
      name: 'RSYNC Delete',
      command: 'rsync -avz --delete /local/ user@host:/remote/',
      description: 'Sync and delete extra files',
      category: 'File Transfer',
      os: ['linux', 'mac']
    },
    {
      name: 'RSYNC Dry Run',
      command: 'rsync -avz --dry-run /local/ user@host:/remote/',
      description: 'Test sync without changes',
      category: 'File Transfer',
      os: ['linux', 'mac']
    },
    {
      name: 'SFTP Connect',
      command: 'sftp user@hostname',
      description: 'Interactive SFTP session',
      category: 'File Transfer',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'SFTP Batch',
      command: 'sftp -b commands.txt user@hostname',
      description: 'Execute SFTP commands from file',
      category: 'File Transfer',
      os: ['linux', 'mac']
    },

    // SECURITY
    {
      name: 'Generate RSA Key',
      command: 'ssh-keygen -t rsa -b 4096 -C "email@example.com"',
      description: 'Generate 4096-bit RSA key pair',
      category: 'Security',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Generate ED25519 Key',
      command: 'ssh-keygen -t ed25519 -C "email@example.com"',
      description: 'Generate modern ED25519 key',
      category: 'Security',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Change Key Passphrase',
      command: 'ssh-keygen -p -f ~/.ssh/id_rsa',
      description: 'Change or add passphrase to key',
      category: 'Security',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Copy SSH Key',
      command: 'ssh-copy-id user@hostname',
      description: 'Copy public key to server',
      category: 'Security',
      os: ['linux', 'mac']
    },
    {
      name: 'Manual Key Copy',
      command: 'cat ~/.ssh/id_rsa.pub | ssh user@host "cat >> ~/.ssh/authorized_keys"',
      description: 'Manually copy SSH key',
      category: 'Security',
      os: ['linux', 'mac']
    },
    {
      name: 'SSH Agent Start',
      command: 'eval $(ssh-agent) && ssh-add ~/.ssh/id_rsa',
      description: 'Start SSH agent and add key',
      category: 'Security',
      os: ['linux', 'mac']
    },
    {
      name: 'List Agent Keys',
      command: 'ssh-add -l',
      description: 'List keys in SSH agent',
      category: 'Security',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Remove Agent Keys',
      command: 'ssh-add -D',
      description: 'Remove all keys from agent',
      category: 'Security',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Check Key Fingerprint',
      command: 'ssh-keygen -lf ~/.ssh/id_rsa.pub',
      description: 'Display key fingerprint',
      category: 'Security',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Set Key Permissions',
      command: 'chmod 600 ~/.ssh/id_rsa && chmod 644 ~/.ssh/id_rsa.pub',
      description: 'Fix key file permissions',
      category: 'Security',
      os: ['linux', 'mac']
    },

    // ADVANCED - TUNNELING & PORT FORWARDING
    {
      name: 'Local Port Forward',
      command: 'ssh -L 8080:localhost:80 user@hostname',
      description: 'Forward local port to remote',
      category: 'Advanced',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Remote Port Forward',
      command: 'ssh -R 8080:localhost:3000 user@hostname',
      description: 'Forward remote port to local',
      category: 'Advanced',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Dynamic Port Forward (SOCKS)',
      command: 'ssh -D 8080 -C -N user@hostname',
      description: 'Create SOCKS proxy',
      category: 'Advanced',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'SSH Tunnel Background',
      command: 'ssh -f -N -L 8080:localhost:80 user@hostname',
      description: 'Create background tunnel',
      category: 'Advanced',
      os: ['linux', 'mac']
    },
    {
      name: 'Multiple Port Forwards',
      command: 'ssh -L 8080:localhost:80 -L 3306:localhost:3306 user@host',
      description: 'Forward multiple ports',
      category: 'Advanced',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'SSH Jump Host',
      command: 'ssh -J jumphost user@destination',
      description: 'Connect through jump/bastion host',
      category: 'Advanced',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'SSH ProxyJump',
      command: 'ssh -o ProxyJump=jumphost user@destination',
      description: 'Use proxy jump for connection',
      category: 'Advanced',
      os: ['linux', 'mac', 'windows']
    },

    // CONFIGURATION
    {
      name: 'View SSH Config',
      command: 'cat ~/.ssh/config',
      description: 'Display SSH configuration',
      category: 'Configuration',
      os: ['linux', 'mac']
    },
    {
      name: 'Edit SSH Config',
      command: 'nano ~/.ssh/config',
      description: 'Edit SSH configuration',
      category: 'Configuration',
      os: ['linux', 'mac']
    },
    {
      name: 'Test SSH Config',
      command: 'ssh -G hostname',
      description: 'Show effective SSH config for host',
      category: 'Configuration',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'SSH Config Template',
      command: 'Host myserver\n  HostName 192.168.1.100\n  User admin\n  Port 22\n  IdentityFile ~/.ssh/id_rsa',
      description: 'SSH config host entry template',
      category: 'Configuration',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'View Known Hosts',
      command: 'cat ~/.ssh/known_hosts',
      description: 'Display known hosts',
      category: 'Configuration',
      os: ['linux', 'mac']
    },
    {
      name: 'Remove Known Host',
      command: 'ssh-keygen -R hostname',
      description: 'Remove host from known_hosts',
      category: 'Configuration',
      os: ['linux', 'mac', 'windows']
    },

    // DEBUGGING
    {
      name: 'Verbose SSH',
      command: 'ssh -v user@hostname',
      description: 'SSH with verbose output',
      category: 'Debugging',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Very Verbose SSH',
      command: 'ssh -vv user@hostname',
      description: 'SSH with very verbose output',
      category: 'Debugging',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Debug SSH',
      command: 'ssh -vvv user@hostname',
      description: 'Maximum SSH debugging',
      category: 'Debugging',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Test Port Access',
      command: 'nc -zv hostname 22',
      description: 'Test if SSH port is accessible',
      category: 'Debugging',
      os: ['linux', 'mac']
    },
    {
      name: 'Check SSH Service',
      command: 'systemctl status sshd',
      description: 'Check SSH daemon status',
      category: 'Debugging',
      os: ['linux']
    },

    // SYSTEM MANAGEMENT
    {
      name: 'Execute Remote Command',
      command: 'ssh user@host "command"',
      description: 'Run command on remote server',
      category: 'System Management',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Remote Script Execution',
      command: 'ssh user@host "bash -s" < local_script.sh',
      description: 'Execute local script remotely',
      category: 'System Management',
      os: ['linux', 'mac']
    },
    {
      name: 'Remote Sudo Command',
      command: 'ssh -t user@host "sudo command"',
      description: 'Execute sudo command remotely',
      category: 'System Management',
      os: ['linux', 'mac']
    },
    {
      name: 'SSH with Environment',
      command: 'ssh user@host "VAR=value command"',
      description: 'Run command with environment variable',
      category: 'System Management',
      os: ['linux', 'mac', 'windows']
    },
    {
      name: 'Parallel SSH',
      command: 'parallel-ssh -H "host1 host2 host3" "command"',
      description: 'Execute command on multiple hosts',
      category: 'System Management',
      os: ['linux', 'mac']
    },
  ],

  windows: [
    // CONNECTION
    {
      name: 'SSH Connect (OpenSSH)',
      command: 'ssh user@hostname',
      description: 'Connect via OpenSSH (Windows 10+)',
      category: 'Connection',
      os: ['windows']
    },
    {
      name: 'SSH with Key (Windows)',
      command: 'ssh -i C:\\Users\\user\\.ssh\\id_rsa user@hostname',
      description: 'Connect using SSH key on Windows',
      category: 'Connection',
      os: ['windows']
    },
    {
      name: 'PowerShell SSH',
      command: 'Enter-PSSession -HostName user@hostname -KeyFilePath $env:USERPROFILE\\.ssh\\id_rsa',
      description: 'PowerShell remote session',
      category: 'Connection',
      os: ['windows']
    },
    {
      name: 'PuTTY Connect',
      command: 'putty.exe -ssh user@hostname -P 22',
      description: 'Connect using PuTTY GUI',
      category: 'Connection',
      os: ['windows']
    },
    {
      name: 'PuTTY with Key',
      command: 'putty.exe -ssh user@hostname -i C:\\path\\to\\key.ppk',
      description: 'PuTTY with private key',
      category: 'Connection',
      os: ['windows']
    },
    {
      name: 'PuTTY Command Line',
      command: 'plink.exe user@hostname',
      description: 'PuTTY command-line interface',
      category: 'Connection',
      os: ['windows']
    },

    // FILE TRANSFER
    {
      name: 'SCP Upload (PowerShell)',
      command: 'scp C:\\local\\file.txt user@hostname:/remote/path/',
      description: 'Copy file using SCP',
      category: 'File Transfer',
      os: ['windows']
    },
    {
      name: 'SCP Download (PowerShell)',
      command: 'scp user@hostname:/remote/file.txt C:\\local\\',
      description: 'Download file via SCP',
      category: 'File Transfer',
      os: ['windows']
    },
    {
      name: 'SCP Directory (Windows)',
      command: 'scp -r C:\\local\\folder user@hostname:/remote/',
      description: 'Copy directory recursively',
      category: 'File Transfer',
      os: ['windows']
    },
    {
      name: 'WinSCP GUI',
      command: 'winscp.exe',
      description: 'Open WinSCP file transfer GUI',
      category: 'File Transfer',
      os: ['windows']
    },
    {
      name: 'WinSCP CLI Upload',
      command: 'winscp.com /command "open sftp://user@host/" "put C:\\local\\* /remote/" "exit"',
      description: 'WinSCP command-line upload',
      category: 'File Transfer',
      os: ['windows']
    },
    {
      name: 'WinSCP CLI Download',
      command: 'winscp.com /command "open sftp://user@host/" "get /remote/* C:\\local\\" "exit"',
      description: 'WinSCP command-line download',
      category: 'File Transfer',
      os: ['windows']
    },
    {
      name: 'WinSCP Sync',
      command: 'winscp.com /command "open sftp://user@host/" "synchronize local C:\\local /remote" "exit"',
      description: 'WinSCP directory synchronization',
      category: 'File Transfer',
      os: ['windows']
    },
    {
      name: 'PSCP Upload',
      command: 'pscp.exe C:\\file.txt user@host:/path/',
      description: 'PuTTY SCP file upload',
      category: 'File Transfer',
      os: ['windows']
    },
    {
      name: 'PSFTP Connect',
      command: 'psftp.exe user@hostname',
      description: 'PuTTY SFTP client',
      category: 'File Transfer',
      os: ['windows']
    },

    // SECURITY
    {
      name: 'Generate SSH Key (Windows)',
      command: 'ssh-keygen -t rsa -b 4096 -C "email@example.com"',
      description: 'Generate SSH key pair on Windows',
      category: 'Security',
      os: ['windows']
    },
    {
      name: 'Generate ED25519 (Windows)',
      command: 'ssh-keygen -t ed25519 -C "email@example.com"',
      description: 'Generate ED25519 key on Windows',
      category: 'Security',
      os: ['windows']
    },
    {
      name: 'PuTTYgen Generate',
      command: 'puttygen.exe',
      description: 'Launch PuTTYgen key generator',
      category: 'Security',
      os: ['windows']
    },
    {
      name: 'Convert PuTTY to OpenSSH',
      command: 'puttygen.exe key.ppk -O private-openssh -o id_rsa',
      description: 'Convert PPK to OpenSSH format',
      category: 'Security',
      os: ['windows']
    },
    {
      name: 'SSH Agent (Windows)',
      command: 'Start-Service ssh-agent; ssh-add $env:USERPROFILE\\.ssh\\id_rsa',
      description: 'Start SSH agent on Windows',
      category: 'Security',
      os: ['windows']
    },
    {
      name: 'Pageant Add Key',
      command: 'pageant.exe C:\\path\\to\\key.ppk',
      description: 'Add key to PuTTY Pageant',
      category: 'Security',
      os: ['windows']
    },
    {
      name: 'View Public Key',
      command: 'type $env:USERPROFILE\\.ssh\\id_rsa.pub',
      description: 'Display public key content',
      category: 'Security',
      os: ['windows']
    },
    {
      name: 'Set Key Permissions (Windows)',
      command: 'icacls $env:USERPROFILE\\.ssh\\id_rsa /inheritance:r /grant:r "%USERNAME%:F"',
      description: 'Secure private key permissions',
      category: 'Security',
      os: ['windows']
    },

    // ADVANCED
    {
      name: 'Port Forward (Windows)',
      command: 'ssh -L 8080:localhost:80 user@hostname',
      description: 'Local port forwarding on Windows',
      category: 'Advanced',
      os: ['windows']
    },
    {
      name: 'Remote Desktop Tunnel',
      command: 'ssh -L 3389:target:3389 user@jumphost',
      description: 'Tunnel RDP through SSH',
      category: 'Advanced',
      os: ['windows']
    },
    {
      name: 'Database Tunnel',
      command: 'ssh -L 3306:localhost:3306 user@dbserver',
      description: 'Tunnel MySQL/MariaDB connection',
      category: 'Advanced',
      os: ['windows']
    },
    {
      name: 'PuTTY Tunnel',
      command: 'putty.exe -ssh -L 8080:localhost:80 user@hostname',
      description: 'PuTTY with local port forward',
      category: 'Advanced',
      os: ['windows']
    },

    // CONFIGURATION
    {
      name: 'View SSH Config (Windows)',
      command: 'type $env:USERPROFILE\\.ssh\\config',
      description: 'Display SSH config on Windows',
      category: 'Configuration',
      os: ['windows']
    },
    {
      name: 'Edit SSH Config (Notepad)',
      command: 'notepad $env:USERPROFILE\\.ssh\\config',
      description: 'Edit SSH config in Notepad',
      category: 'Configuration',
      os: ['windows']
    },
    {
      name: 'Create SSH Directory',
      command: 'if (!(Test-Path $env:USERPROFILE\\.ssh)) { New-Item -ItemType Directory -Path $env:USERPROFILE\\.ssh }',
      description: 'Create .ssh directory if not exists',
      category: 'Configuration',
      os: ['windows']
    },
    {
      name: 'Check OpenSSH Client',
      command: 'Get-WindowsCapability -Online | Where-Object Name -like "OpenSSH.Client*"',
      description: 'Check if OpenSSH client is installed',
      category: 'Configuration',
      os: ['windows']
    },
    {
      name: 'Install OpenSSH Client',
      command: 'Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0',
      description: 'Install OpenSSH client on Windows',
      category: 'Configuration',
      os: ['windows']
    },
    {
      name: 'Remove Known Host (Windows)',
      command: 'ssh-keygen -R hostname',
      description: 'Remove host from known_hosts',
      category: 'Configuration',
      os: ['windows']
    },

    // DEBUGGING
    {
      name: 'Test Port (PowerShell)',
      command: 'Test-NetConnection -ComputerName hostname -Port 22',
      description: 'Test SSH port connectivity',
      category: 'Debugging',
      os: ['windows']
    },
    {
      name: 'Verbose SSH (Windows)',
      command: 'ssh -v user@hostname',
      description: 'SSH with verbose output',
      category: 'Debugging',
      os: ['windows']
    },
    {
      name: 'Debug SSH (Windows)',
      command: 'ssh -vvv user@hostname',
      description: 'Maximum SSH debugging',
      category: 'Debugging',
      os: ['windows']
    },
    {
      name: 'Check SSH Service',
      command: 'Get-Service sshd',
      description: 'Check SSH server service status',
      category: 'Debugging',
      os: ['windows']
    },

    // SYSTEM MANAGEMENT
    {
      name: 'Remote PowerShell',
      command: 'Invoke-Command -HostName user@hostname -ScriptBlock { Get-Process }',
      description: 'Execute PowerShell command remotely',
      category: 'System Management',
      os: ['windows']
    },
    {
      name: 'Remote Script (Windows)',
      command: 'ssh user@host "powershell -File script.ps1"',
      description: 'Execute PowerShell script remotely',
      category: 'System Management',
      os: ['windows']
    },
  ],

  mac: [
    // macOS SPECIFIC
    {
      name: 'SSH Keychain Integration',
      command: 'ssh-add -K ~/.ssh/id_rsa',
      description: 'Add SSH key to macOS Keychain',
      category: 'Security',
      os: ['mac']
    },
    {
      name: 'List Keychain Keys',
      command: 'ssh-add -l',
      description: 'List keys in Keychain',
      category: 'Security',
      os: ['mac']
    },
    {
      name: 'SSH Config for Keychain',
      command: 'Host *\n  UseKeychain yes\n  AddKeysToAgent yes\n  IdentityFile ~/.ssh/id_rsa',
      description: 'Auto-add keys to Keychain',
      category: 'Configuration',
      os: ['mac']
    },
    {
      name: 'Install Homebrew SSH',
      command: 'brew install openssh',
      description: 'Install latest OpenSSH via Homebrew',
      category: 'Configuration',
      os: ['mac']
    },
    {
      name: 'Mount Remote via SSHFS',
      command: 'sshfs user@host:/remote/path /local/mount',
      description: 'Mount remote filesystem locally',
      category: 'File Transfer',
      os: ['mac', 'linux']
    },
    {
      name: 'Unmount SSHFS',
      command: 'umount /local/mount',
      description: 'Unmount SSHFS filesystem',
      category: 'File Transfer',
      os: ['mac', 'linux']
    },
  ],

  common: [
    // CROSS-PLATFORM ESSENTIALS
    {
      name: 'SSH Keep Alive',
      command: 'ssh -o ServerAliveInterval=60 user@hostname',
      description: 'Keep connection alive (60s ping)',
      category: 'Connection',
      os: ['windows', 'linux', 'mac']
    },
    {
      name: 'SSH Timeout',
      command: 'ssh -o ConnectTimeout=10 user@hostname',
      description: 'Set connection timeout to 10 seconds',
      category: 'Connection',
      os: ['windows', 'linux', 'mac']
    },
    {
      name: 'Disable Host Key Checking',
      command: 'ssh -o StrictHostKeyChecking=no user@hostname',
      description: 'Skip host key verification (not recommended)',
      category: 'Connection',
      os: ['windows', 'linux', 'mac']
    },
    {
      name: 'SSH with Specific Cipher',
      command: 'ssh -c aes256-ctr user@hostname',
      description: 'Use specific encryption cipher',
      category: 'Security',
      os: ['windows', 'linux', 'mac']
    },
    {
      name: 'List Supported Ciphers',
      command: 'ssh -Q cipher',
      description: 'Show all supported ciphers',
      category: 'Configuration',
      os: ['windows', 'linux', 'mac']
    },
    {
      name: 'SSH Escape Sequences',
      command: '~. (disconnect)\n~^Z (suspend)\n~# (list forwarded connections)',
      description: 'SSH escape key sequences',
      category: 'Advanced',
      os: ['windows', 'linux', 'mac']
    },
  ]
}

export default function SshCommandsPage() {
  const [commands, setCommands] = useState<SshCommand[]>([])
  const [filteredCommands, setFilteredCommands] = useState<SshCommand[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedOS, setSelectedOS] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCommand, setEditingCommand] = useState<SshCommand | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    command: '',
    description: '',
    category: 'Connection',
    os: [] as string[],
    tags: '',
  })

  useEffect(() => {
    fetchCommands()
  }, [])

  useEffect(() => {
    filterCommands()
  }, [commands, searchQuery, selectedCategory, selectedOS, showFavoritesOnly])

  const fetchCommands = async () => {
    try {
      const response = await sshApi.getAll()
      setCommands(response.data.map((cmd: any) => ({
        ...cmd,
        os: cmd.os || ['linux'],
        favorite: cmd.favorite || false,
        tags: cmd.tags || ''
      })))
    } catch (error) {
      toast.error('Failed to load SSH commands')
    } finally {
      setLoading(false)
    }
  }

  const filterCommands = () => {
    let filtered = commands

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((cmd) => cmd.category === selectedCategory)
    }

    if (selectedOS !== 'all') {
      filtered = filtered.filter((cmd) => cmd.os.includes(selectedOS))
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((cmd) => cmd.favorite)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cmd.tags.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort: favorites first
    filtered.sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1
      return 0
    })

    setFilteredCommands(filtered)
  }

  const categories = ['All', ...new Set(commands.map((cmd) => cmd.category))]

  const handleCopy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      toast.success('Command copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy command')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCommand) {
        await sshApi.update(editingCommand.id, formData)
        toast.success('Command updated successfully')
      } else {
        await sshApi.create(formData)
        toast.success('Command added successfully')
      }
      setShowForm(false)
      setEditingCommand(null)
      setFormData({ name: '', command: '', description: '', category: 'Connection', os: [], tags: '' })
      fetchCommands()
    } catch (error) {
      toast.error('Failed to save command')
    }
  }

  const handleEdit = (command: SshCommand) => {
    setEditingCommand(command)
    setFormData({
      name: command.name,
      command: command.command,
      description: command.description,
      category: command.category,
      os: command.os || [],
      tags: command.tags || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this command?')) {
      try {
        await sshApi.delete(id)
        toast.success('Command deleted successfully')
        fetchCommands()
      } catch (error) {
        toast.error('Failed to delete command')
      }
    }
  }

  const toggleFavorite = async (command: SshCommand) => {
    try {
      const updated = { ...command, favorite: !command.favorite }
      setCommands(commands.map(c => c.id === command.id ? updated : c))
      await sshApi.update(command.id, updated)
      toast.success(updated.favorite ? 'Added to favorites' : 'Removed from favorites')
    } catch (error) {
      toast.error('Failed to update favorite')
      fetchCommands()
    }
  }

  const loadTemplate = (template: any) => {
    setFormData({
      name: template.name,
      command: template.command,
      description: template.description,
      category: template.category,
      os: template.os,
      tags: ''
    })
    setShowForm(true)
  }

  const exportCommands = () => {
    const data = JSON.stringify(filteredCommands, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ssh_commands_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Commands exported!')
  }

  const getOSIcon = (osArray: string[]) => {
    if (osArray.includes('linux')) return <Server className="w-4 h-4" />
    if (osArray.includes('mac')) return <Apple className="w-4 h-4" />
    if (osArray.includes('windows')) return <Laptop className="w-4 h-4" />
    return <Monitor className="w-4 h-4" />
  }

  const allTemplates = [
    ...COMMAND_TEMPLATES.linux,
    ...COMMAND_TEMPLATES.windows,
    ...COMMAND_TEMPLATES.common
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-xl shadow-lg">
              <Terminal className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SSH Command Library
              </h1>
              <p className="text-muted-foreground mt-1">
                Multi-platform SSH commands • Windows, Linux & macOS
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Code className="w-4 h-4 mr-2" />
                  Templates
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="max-h-96 overflow-y-auto">
                  {allTemplates.map((template, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => loadTemplate(template)}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{template.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {template.description}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={exportCommands} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Command
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {OS_TYPES.map((os) => {
            const count = os.value === 'all'
              ? commands.length
              : commands.filter(c => c.os.includes(os.value)).length
            const Icon = os.icon
            return (
              <Card
                key={os.value}
                className={`cursor-pointer hover:border-primary transition-colors ${selectedOS === os.value ? 'border-primary border-2' : ''
                  }`}
                onClick={() => setSelectedOS(os.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{os.label}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    <Icon className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowForm(false)
                setEditingCommand(null)
                setFormData({ name: '', command: '', description: '', category: '', os: [], tags: '' })
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{editingCommand ? 'Edit' : 'Add'} SSH Command</CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setShowForm(false)
                          setEditingCommand(null)
                          setFormData({ name: '', command: '', description: '', category: '', os: [], tags: '' })
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Command Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="SSH Connect"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="command">Command</Label>
                        <Textarea
                          id="command"
                          value={formData.command}
                          onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                          className="font-mono text-sm"
                          placeholder="ssh user@hostname"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Connection">Connection</SelectItem>
                              <SelectItem value="File Transfer">File Transfer</SelectItem>
                              <SelectItem value="Security">Security</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Configuration">Configuration</SelectItem>
                              <SelectItem value="Debugging">Debugging</SelectItem>
                              <SelectItem value="System Management">System Management</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Operating Systems</Label>
                          <div className="flex gap-2 mt-2">
                            {['linux', 'mac', 'windows'].map((os) => (
                              <Badge
                                key={os}
                                variant={formData.os.includes(os) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  const newOS = formData.os.includes(os)
                                    ? formData.os.filter(o => o !== os)
                                    : [...formData.os, os]
                                  setFormData({ ...formData, os: newOS })
                                }}
                              >
                                {os === 'linux' && <Server className="w-3 h-3 mr-1" />}
                                {os === 'mac' && <Apple className="w-3 h-3 mr-1" />}
                                {os === 'windows' && <Laptop className="w-3 h-3 mr-1" />}
                                {os.charAt(0).toUpperCase() + os.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="What does this command do?"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="ssh, secure, remote"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          {editingCommand ? 'Update' : 'Add'} Command
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowForm(false)
                            setEditingCommand(null)
                            setFormData({ name: '', command: '', description: '', category: '', os: [], tags: '' })
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search commands, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Commands List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading commands...</p>
          </div>
        ) : filteredCommands.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'All' || selectedOS !== 'all'
                  ? 'No commands match your filters'
                  : 'No commands yet. Add your first SSH command!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCommands.map((command, index) => (
              <motion.div
                key={command.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {command.favorite && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          {command.name}
                        </CardTitle>
                        <CardDescription className="mt-1">{command.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{command.category}</Badge>
                          {command.os.map((os) => {
                            const osType = OS_TYPES.find(o => o.value === os)
                            const Icon = osType?.icon || Monitor
                            return (
                              <Badge key={os} variant="secondary" className="gap-1">
                                <Icon className="w-3 h-3" />
                                {os}
                              </Badge>
                            )
                          })}
                          {command.tags && command.tags.split(',').map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              #{tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleFavorite(command)}
                          className={command.favorite ? 'text-yellow-500' : ''}
                        >
                          <Star className={`w-4 h-4 ${command.favorite ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopy(command.command)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(command)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(command.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="p-4 bg-gray-950 text-green-400 rounded-md text-sm font-mono overflow-x-auto">
                      {command.command}
                    </pre>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card className="border-purple-200 dark:border-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                Multi-Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Commands for Windows, Linux, and macOS with OS-specific filtering
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 dark:border-indigo-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Templates Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                20+ pre-built SSH command templates for common operations
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                Secure Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Safely store your frequently used SSH commands and snippets
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
