'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TestTube2, Play, Copy, Check, FolderOpen, FileCode, BarChart3, RefreshCw, Download, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface CoverageResult {
    className: string
    lineCoverage: number
    branchCoverage: number
    instructionCoverage: number
    methodCoverage: number
}

export default function JacocoRunnerPage() {
    const [projectPath, setProjectPath] = useState('')
    const [mavenCommand, setMavenCommand] = useState('mvn clean verify jacoco:report')
    const [isRunning, setIsRunning] = useState(false)
    const [output, setOutput] = useState('')
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState('config')
    const [coverageResults, setCoverageResults] = useState<CoverageResult[]>([])
    const [overallCoverage, setOverallCoverage] = useState({
        line: 0,
        branch: 0,
        instruction: 0,
        method: 0
    })

    const runJacoco = async () => {
        if (!projectPath) {
            setOutput('Error: Please enter a project path')
            return
        }

        setIsRunning(true)
        setOutput('Starting Jacoco coverage analysis...\n')
        setActiveTab('output')

        try {
            // Simulate running Jacoco - in real implementation, you'd call a backend API
            await new Promise(resolve => setTimeout(resolve, 2000))

            setOutput(prev => prev + `\n> Running: ${mavenCommand}\n`)
            await new Promise(resolve => setTimeout(resolve, 1500))

            setOutput(prev => prev + `\n[INFO] --- jacoco-maven-plugin:0.8.11:prepare-agent (prepare-agent) @ project ---
[INFO] argLine set to -javaagent:/.m2/repository/org/jacoco/org.jacoco.agent/0.8.11/org.jacoco.agent-0.8.11-runtime.jar=destfile=target/jacoco.exec
[INFO] 
[INFO] --- maven-surefire-plugin:3.2.1:test (default-test) @ project ---
[INFO] Using auto detected provider org.apache.maven.surefire.junitplatform.JUnitPlatformProvider
[INFO] 
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.example.ServiceTest
[INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.341 s
[INFO] Running com.example.ControllerTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.234 s
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 23, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] --- jacoco-maven-plugin:0.8.11:report (report) @ project ---
[INFO] Loading execution data file target/jacoco.exec
[INFO] Analyzed bundle 'project' with 12 classes
[INFO] 
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 8.456 s
[INFO] Finished at: ${new Date().toISOString()}
[INFO] ------------------------------------------------------------------------

✅ Jacoco report generated successfully!
📁 Report location: ${projectPath}/target/site/jacoco/index.html
`)

            // Simulate coverage results
            const mockResults: CoverageResult[] = [
                { className: 'com.example.UserService', lineCoverage: 85, branchCoverage: 72, instructionCoverage: 88, methodCoverage: 90 },
                { className: 'com.example.UserController', lineCoverage: 92, branchCoverage: 85, instructionCoverage: 91, methodCoverage: 100 },
                { className: 'com.example.AuthService', lineCoverage: 78, branchCoverage: 65, instructionCoverage: 80, methodCoverage: 85 },
                { className: 'com.example.DataRepository', lineCoverage: 95, branchCoverage: 90, instructionCoverage: 94, methodCoverage: 100 },
                { className: 'com.example.ConfigManager', lineCoverage: 70, branchCoverage: 55, instructionCoverage: 72, methodCoverage: 80 },
            ]

            setCoverageResults(mockResults)
            setOverallCoverage({
                line: Math.round(mockResults.reduce((sum, r) => sum + r.lineCoverage, 0) / mockResults.length),
                branch: Math.round(mockResults.reduce((sum, r) => sum + r.branchCoverage, 0) / mockResults.length),
                instruction: Math.round(mockResults.reduce((sum, r) => sum + r.instructionCoverage, 0) / mockResults.length),
                method: Math.round(mockResults.reduce((sum, r) => sum + r.methodCoverage, 0) / mockResults.length),
            })

        } catch (error) {
            setOutput(prev => prev + `\n❌ Error: ${error}\n`)
        } finally {
            setIsRunning(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const getCoverageColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-500'
        if (percentage >= 60) return 'text-yellow-500'
        return 'text-red-500'
    }

    const getCoverageBarColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500'
        if (percentage >= 60) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <TestTube2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Jacoco Runner</h1>
                        <p className="text-muted-foreground">Run Jacoco code coverage analysis for your Java projects</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="config">
                            <FolderOpen className="w-4 h-4 mr-2" />
                            Configuration
                        </TabsTrigger>
                        <TabsTrigger value="output">
                            <FileCode className="w-4 h-4 mr-2" />
                            Output
                        </TabsTrigger>
                        <TabsTrigger value="results">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Coverage Results
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="config" className="space-y-4">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Configuration</CardTitle>
                                    <CardDescription>Configure your Java project for Jacoco analysis</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="projectPath">Project Path</Label>
                                        <Input
                                            id="projectPath"
                                            value={projectPath}
                                            onChange={(e) => setProjectPath(e.target.value)}
                                            placeholder="e.g., D:\projects\my-java-app"
                                            className="mt-2 font-mono"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Path to your Maven/Gradle project root directory
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="command">Maven Command</Label>
                                        <Input
                                            id="command"
                                            value={mavenCommand}
                                            onChange={(e) => setMavenCommand(e.target.value)}
                                            placeholder="mvn clean verify jacoco:report"
                                            className="mt-2 font-mono"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Command to run Jacoco coverage
                                        </p>
                                    </div>

                                    <Button
                                        onClick={runJacoco}
                                        disabled={isRunning || !projectPath}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                    >
                                        {isRunning ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                Running Jacoco...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                Run Jacoco Analysis
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Commands</CardTitle>
                                    <CardDescription>Common Jacoco commands for quick access</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {[
                                        { label: 'Full Coverage Report', cmd: 'mvn clean verify jacoco:report' },
                                        { label: 'Unit Tests Only', cmd: 'mvn test jacoco:report' },
                                        { label: 'Integration Tests', cmd: 'mvn verify -Pintegration-test jacoco:report' },
                                        { label: 'Skip Tests & Generate', cmd: 'mvn jacoco:report -DskipTests=false' },
                                        { label: 'Aggregate Multi-Module', cmd: 'mvn jacoco:report-aggregate' },
                                    ].map((item, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="w-full justify-start font-mono text-sm"
                                            onClick={() => setMavenCommand(item.cmd)}
                                        >
                                            <FileCode className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                    Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <p>• <strong>Maven:</strong> Jacoco plugin must be configured in your pom.xml</p>
                                <p>• <strong>Java:</strong> JDK 8 or higher is required</p>
                                <p>• <strong>Tests:</strong> Ensure your project has unit tests to measure coverage</p>
                                <p>• <strong>Plugin Example:</strong></p>
                                <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs mt-2">
                                    {`<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.11</version>
  <executions>
    <execution>
      <goals><goal>prepare-agent</goal></goals>
    </execution>
    <execution>
      <id>report</id>
      <phase>verify</phase>
      <goals><goal>report</goal></goals>
    </execution>
  </executions>
</plugin>`}
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="output">
                        <Card>
                            <CardHeader>
                                <CardTitle>Command Output</CardTitle>
                                <CardDescription>Real-time output from Jacoco execution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Textarea
                                        value={output}
                                        readOnly
                                        placeholder="Output will appear here when you run Jacoco..."
                                        className="font-mono text-sm min-h-[400px] bg-zinc-950 text-green-400"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={copyToClipboard}
                                            disabled={!output}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copy Output
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => setOutput('')}
                                            disabled={!output}
                                            variant="outline"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="results">
                        <div className="grid gap-6 lg:grid-cols-4 mb-6">
                            {[
                                { label: 'Line Coverage', value: overallCoverage.line, icon: '📊' },
                                { label: 'Branch Coverage', value: overallCoverage.branch, icon: '🌿' },
                                { label: 'Instruction Coverage', value: overallCoverage.instruction, icon: '📝' },
                                { label: 'Method Coverage', value: overallCoverage.method, icon: '🎯' },
                            ].map((metric, index) => (
                                <Card key={index}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl">{metric.icon}</span>
                                            <span className={`text-3xl font-bold ${getCoverageColor(metric.value)}`}>
                                                {metric.value}%
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${getCoverageBarColor(metric.value)}`}
                                                style={{ width: `${metric.value}%` }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Class Coverage Details</CardTitle>
                                <CardDescription>Coverage breakdown by class</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {coverageResults.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-4">Class</th>
                                                    <th className="text-center py-3 px-4">Line</th>
                                                    <th className="text-center py-3 px-4">Branch</th>
                                                    <th className="text-center py-3 px-4">Instruction</th>
                                                    <th className="text-center py-3 px-4">Method</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {coverageResults.map((result, index) => (
                                                    <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                                                        <td className="py-3 px-4 font-mono text-xs">{result.className}</td>
                                                        <td className={`py-3 px-4 text-center font-semibold ${getCoverageColor(result.lineCoverage)}`}>
                                                            {result.lineCoverage}%
                                                        </td>
                                                        <td className={`py-3 px-4 text-center font-semibold ${getCoverageColor(result.branchCoverage)}`}>
                                                            {result.branchCoverage}%
                                                        </td>
                                                        <td className={`py-3 px-4 text-center font-semibold ${getCoverageColor(result.instructionCoverage)}`}>
                                                            {result.instructionCoverage}%
                                                        </td>
                                                        <td className={`py-3 px-4 text-center font-semibold ${getCoverageColor(result.methodCoverage)}`}>
                                                            {result.methodCoverage}%
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No coverage results yet.</p>
                                        <p className="text-sm">Run Jacoco analysis to see coverage details.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {coverageResults.length > 0 && (
                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export as CSV
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <FileCode className="w-4 h-4 mr-2" />
                                    Open HTML Report
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    )
}
