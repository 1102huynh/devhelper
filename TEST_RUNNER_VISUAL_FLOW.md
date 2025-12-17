# Run Test Tab - Visual Flow & Features

## 🎯 Tính năng đã hoàn thành

### ✅ Backend Implementation
```java
// TestController.java
@GetMapping("/suites")
public ResponseEntity<List<Map<String, String>>> getTestSuites(@RequestParam String projectPath)

// TestService.java
public List<Map<String, String>> getTestSuites(String projectPath)
- Scan src/test/java for JUnit tests
- Scan features folder for Cucumber tests
- Return: name, className, path, type
```

### ✅ Frontend Implementation
```typescript
// State Management
- testSuites: TestSuite[]
- selectedSuites: Set<string>
- loadingSuites: boolean

// Core Functions
- loadTestSuites(): Load suites from API
- toggleSuiteSelection(): Toggle individual selection
- selectAllSuites(): Select all
- clearAllSelections(): Clear all
- runTest(): Execute with selected suites
```

## 📐 UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                      JACOCO RUNNER                               │
├─────────────────────────────────────────────────────────────────┤
│  [Projects] [Configuration] [Deploy] [Run Test] [Jenkins]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │  TEST RUNNER       │  │  TERMINAL OUTPUT                   │ │
│  │  ─────────────     │  │  ══════════════                    │ │
│  │                    │  │                                     │ │
│  │  Select Project    │  │  🔴 🟡 🟢 test-runner@project:~   │ │
│  │  [Dropdown ▼]      │  │  ──────────────────────────────────│ │
│  │                    │  │                                     │ │
│  │  Test Suites 3/10  │  │  Starting test...                  │ │
│  │  [All] [Clear]     │  │  [INFO] Scanning for projects...  │ │
│  │                    │  │  [INFO] Building...                │ │
│  │  ┌──────────────┐  │  │  [INFO] Running tests...           │ │
│  │  │☑ UserTest    │  │  │                                     │ │
│  │  │  junit       │  │  │  Tests run: 3, Failures: 0         │ │
│  │  ├──────────────┤  │  │                                     │ │
│  │  │☑ OrderTest   │  │  │  BUILD SUCCESS                     │ │
│  │  │  junit       │  │  │                                     │ │
│  │  ├──────────────┤  │  │                                     │ │
│  │  │☐ PaymentTest │  │  │                                     │ │
│  │  │  junit       │  │  │                                     │ │
│  │  └──────────────┘  │  │                                     │ │
│  │                    │  │  [Copy] [Clear]                    │ │
│  │  Custom Command    │  └────────────────────────────────────┘ │
│  │  [mvn test]        │                                         │
│  │                    │                                         │
│  │  [▶ Start Execution]│                                        │
│  └────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 User Flow

### Flow 1: Select and Run Single Test
```
User Action                     System Response
───────────────────────────────────────────────────────
1. Click project dropdown    → Show project list
2. Select "my-project"        → Load test suites
3. See loading spinner        → Scanning test files...
4. See 10 test suites         → Display with checkboxes
5. Click "UserServiceTest"    → Checkbox ✓, blue highlight
6. See badge "1/10"           → Update counter
7. Click "Start Execution"    → Build: mvn test -Dtest=UserServiceTest
8. See "Running Tests..."     → Button disabled, spinner
9. See terminal update        → Real-time log streaming
10. See "BUILD SUCCESS"       → Test completed
11. See notification          → "Test execution finished"
```

### Flow 2: Run Multiple Tests
```
User Action                     System Response
───────────────────────────────────────────────────────
1. Select project              → Load 10 test suites
2. Click suite #1              → Selected (1/10)
3. Click suite #2              → Selected (2/10)
4. Click suite #3              → Selected (3/10)
5. Click "Start Execution"     → mvn test -Dtest=Suite1,Suite2,Suite3
6. Watch terminal              → All 3 suites executed
```

### Flow 3: Select All and Run
```
User Action                     System Response
───────────────────────────────────────────────────────
1. Select project              → Load 10 test suites
2. Click "All" button          → All checked (10/10)
3. Click "Start Execution"     → mvn test -Dtest=All10Suites
4. Watch terminal              → Full test suite run
```

### Flow 4: Use Custom Command
```
User Action                     System Response
───────────────────────────────────��───────────────────
1. Select project              → Load test suites
2. Click "Clear" button        → All unchecked (0/10)
3. Type "mvn clean test"       → Command updated
4. Click "Start Execution"     → Execute: mvn clean test
```

## 🎨 Visual States

### Test Suite Item - Unselected
```
┌─────────────────────────────────────┐
│ ☐  UserServiceTest           junit  │
│    com.example.UserServiceTest      │
└─────────────────────────────────────┘
- White background
- Gray border
- Empty checkbox
```

### Test Suite Item - Selected
```
┌─────────────────────────────────────┐
│ ☑  UserServiceTest           junit  │
│    com.example.UserServiceTest      │
└─────────────────────────────────────┘
- Blue light background (bg-blue-500/10)
- Blue border (border-blue-500/30)
- Blue checkbox with checkmark
```

### Test Suite Item - Hover
```
┌─────────────────────────────────────┐
│ ☐  UserServiceTest           junit  │
│    com.example.UserServiceTest      │
└─────────────────────────────────────┘
- Light gray background (hover:bg-accent)
- Cursor pointer
- Smooth transition
```

### Type Badges
```
junit     → Green badge (text-green-600 border-green-600/30)
cucumber  → Purple badge (text-purple-600 border-purple-600/30)
```

### Counter Badge
```
3/10  → Secondary badge
      → Shows: selected/total
```

## 🎬 Animation & Transitions

### Suite Selection
```
Click → Smooth scale (100% → 98% → 100%)
      → Border color transition (0.2s)
      → Background fade-in (0.2s)
```

### Test Running
```
Button   → Disabled state + spinner animation
Badge    → "Live" badge pulsing
Terminal → Auto-scroll on new content
         → Line-by-line appear effect
```

### Loading Suites
```
Spinner → Center of list area
        → Rotate animation
        → 6x6 size
```

## 📊 Data Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ Select Project
     ▼
┌────────────────┐
│  Frontend      │
│  React State   │
└────┬───────────┘
     │ GET /api/test/suites?projectPath=...
     ▼
┌────────────────┐
│  Backend       │
│  TestService   │
└────┬───────────┘
     │ Scan Filesystem
     │ - src/test/java/*.java
     │ - features/*.feature
     ▼
┌────────────────┐
│  Return JSON   │
│  [{name, type, │
│    className}] │
└────┬───────────┘
     │
     ▼
┌────────────────┐
│  Display List  │
│  with Checkbox │
└────────��───────┘
     │ User selects suites
     ▼
┌────────────────┐
│  Build Command │
│  mvn test      │
│  -Dtest=...    │
└────┬───────────┘
     │ POST /api/test/run
     ▼
┌────────────────┐
│  Execute Test  │
│  Stream Logs   │
└────┬───────────┘
     │ Poll every 1s
     │ GET /api/test/log
     │ GET /api/test/status
     ▼
┌────────────────┐
│  Update UI     │
│  Show Logs     │
└────────────────┘
```

## 🎯 Component Breakdown

### Left Panel (Configuration)
```
┌─────────────────────────┐
│ 🧪 Test Runner          │ ← Header with icon
├─────────────────────────┤
│                         │
│ Select Project          │ ← Dropdown
│ [Dropdown with icon]    │
│                         │
│ Test Suites  [3/10]     │ ← Section title + badge
│         [All] [Clear]   │ ← Quick actions
│ ┌─────────────────────┐ │
│ │ Scrollable List     │ │ ← Suite list (max 300px)
│ │ ☑ Suite 1           │ │
│ │ ☐ Suite 2           │ │
│ │ ...                 │ │
│ └─────────────────────┘ │
│                         │
│ Custom Command          │ ← Optional input
│ [Input field]           │
│ [mvn test] [...badges]  │ ← Quick commands
│                         │
│ ▶ Start Execution       │ ← Action button
└─────────────────────────┘
```

### Right Panel (Terminal)
```
┌──────────────────���──────────────┐
│ 🔴🟡🟢 terminal  [Live] [Copy][X]│ ← Header
├─────────────────────────────────┤
│                                 │
│ $ mvn test -Dtest=UserTest     │
│                                 │
│ [INFO] Starting...              │
│ [INFO] Tests run: 3             │ ← Log content
│ [INFO] SUCCESS                  │
│                                 │
│                                 │
└─────────────────────────────────┘
```

## ⚡ Performance

- Test suite loading: < 500ms for typical project
- Log polling: Every 1 second
- UI update: Debounced for smooth experience
- Memory: Set data structure for O(1) selection check

## 🔒 Error Handling

```typescript
// No project selected
if (!selectedTestProject) {
  showNotification('error', 'Please select a project first')
  return
}

// API failure
catch (error) {
  showNotification('error', 'Cannot load test suites')
}

// Test execution failure
if (!res.ok) {
  throw new Error('Failed to trigger test')
}
```

## 📝 Code Structure

```
frontend/src/app/jacoco-runner/page.tsx
├── Interfaces
│   ├── TestSuite
│   └── Other interfaces
├── State Management
│   ├── testSuites
│   ├── selectedSuites
│   └── loadingSuites
├── Effects
│   └── useEffect → loadTestSuites on project change
├── Functions
│   ├── loadTestSuites()
│   ├── toggleSuiteSelection()
│   ├── selectAllSuites()
│   ├── clearAllSelections()
│   └── runTest()
└── UI Components
    ├── TabsContent "test"
    ├── Left Panel (Configuration)
    └── Right Panel (Terminal)
```

## 🚀 Future Enhancements

### Phase 2
- [ ] Search/filter test suites
- [ ] Group by package
- [ ] Test suite favorites
- [ ] Stop running test

### Phase 3  
- [ ] Test history
- [ ] Test results visualization
- [ ] Coverage integration
- [ ] Parallel execution

### Phase 4
- [ ] Gradle support
- [ ] npm test support
- [ ] Test comparison
- [ ] CI/CD integration

