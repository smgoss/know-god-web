# Conditional Visibility Implementation for Lesson Quizzes

## Overview

This implementation adds support for conditional visibility (`gone-if` and `invisible-if`) to the GodTools web renderer, specifically to support lesson quizzes where content should appear/disappear based on user interactions and state values.

## Problem Solved

**Before**: All content (buttons, paragraphs, text) was always visible in lesson quizzes, which would confuse users because they could see all possible answers and results simultaneously.

**After**: Content conditionally appears/disappears based on state values set by user interactions (e.g., quiz selections), providing a proper quiz flow experience.

## Implementation Details

### 1. Visibility Watcher Service (`src/app/shared/visibility-watcher.service.ts`)

**Purpose**: Centralized service to manage visibility watchers across all content components.

**Key Features**:
- `setupVisibilityWatchers()` - Sets up both gone-if and invisible-if watchers
- `cleanupWatchers()` - Properly closes watchers to prevent memory leaks
- `shouldShowElement()` - Determines if element should be in DOM (gone-if logic)
- `getVisibilityStyle()` - Returns CSS visibility value (invisible-if logic)
- `getStylesWithVisibility()` - Merges visibility with existing styles

**Interfaces**:
- `VisibilityWatchable` - For content items that support visibility conditions
- `VisibilityWatcherComponent` - For components that implement visibility watching

### 2. Updated Components

#### Button Component (`src/app/page/component/content-button/`)
- **TypeScript**: Implements `VisibilityWatcherComponent`, uses service for watcher management
- **Template**: Uses `visibilityWatcherService.shouldShowElement()` and `getVisibilityStyle()`
- **Behavior**: Buttons disappear when conditions are met (e.g., after quiz answer selected)

#### Paragraph Component (`src/app/page/component/content-paragraph/`)
- **TypeScript**: Same pattern as Button component
- **Template**: Wraps content-repeater in visibility-controlled div
- **Behavior**: Result paragraphs show/hide based on quiz answers

#### Text Component (`src/app/page/component/content-text/`)
- **TypeScript**: Same pattern, uses `getStylesWithVisibility()` for style merging
- **Template**: Integrates visibility with existing text styling
- **Behavior**: Individual text elements can be conditionally visible

### 3. Visibility Types

#### `gone-if` (Complete Removal)
- Element is removed from DOM entirely
- No space is reserved in layout
- Implemented via `*ngIf="visibilityWatcherService.shouldShowElement(this)"`
- **Use case**: Quiz buttons that should disappear after selection

#### `invisible-if` (Hidden but Space Preserved)
- Element remains in DOM but is not visible
- Layout space is preserved
- Implemented via `[ngStyle]="{ 'visibility': 'hidden' }"`
- **Use case**: Result text that should be hidden initially but not affect layout

## Usage Example

### XML Content
```xml
<!-- Quiz question -->
<content:text text="What is the main message of John 3:16?" />

<!-- Answer buttons (disappear after selection) -->
<content:button 
  text="God loves the world" 
  events="state:set_answer_correct"
  gone-if="answer_selected" />

<!-- Result text (hidden until answer selected) -->
<content:paragraph invisible-if="selected_answer != 'correct'">
  <content:text text="Correct! God's love is central to the Gospel." />
</content:paragraph>

<!-- Continue button (appears after answer) -->
<content:button 
  text="Next Question" 
  events="next-page"
  gone-if="!answer_selected" />
```

### State Flow
1. **Initial**: All answer buttons visible, result text hidden, continue button gone
2. **User selects answer**: State updated (`answer_selected=true`, `selected_answer='correct'`)
3. **Visibility updates**: Answer buttons gone, correct result visible, continue button appears

## Integration with Existing System

### State Management
- Uses existing `PageService.parserState()` 
- Leverages `@cruglobal/godtools-shared` State system
- Compatible with existing event system and state variables

### Watcher Lifecycle
- Watchers are set up in component `init()` methods
- Properly cleaned up in `ngOnDestroy()` to prevent memory leaks
- Handles component re-initialization correctly

### Performance
- Minimal overhead - only components with visibility conditions create watchers
- Efficient cleanup prevents memory leaks
- Reuses existing state management infrastructure

## Testing

### Unit Tests
- `VisibilityWatcherService` fully tested with mocks
- Component tests verify service integration
- Watcher lifecycle tests ensure proper cleanup

### Integration Testing
- Example scenarios in `visibility-test-example.ts`
- Demonstrates quiz flow with state changes
- Shows XML structure for lesson content

## Files Modified/Added

### New Files
- `src/app/shared/visibility-watcher.service.ts` - Core service
- `src/app/shared/visibility-watcher.service.spec.ts` - Service tests
- `src/app/shared/visibility-test-example.ts` - Usage examples
- `VISIBILITY_IMPLEMENTATION.md` - This documentation

### Modified Files
- `src/app/page/component/content-button/content-button.component.ts` - Added visibility support
- `src/app/page/component/content-button/content-button.component.html` - Updated template
- `src/app/page/component/content-button/content-button.component.spec.ts` - Added tests
- `src/app/page/component/content-paragraph/content-paragraph.component.ts` - Added visibility support
- `src/app/page/component/content-paragraph/content-paragraph.component.html` - Updated template
- `src/app/page/component/content-text/content-text.component.ts` - Added visibility support
- `src/app/page/component/content-text/content-text.component.html` - Updated template

## Next Steps

1. **Test with Real Lesson Content**: Use actual lesson XML with quiz scenarios
2. **Performance Monitoring**: Monitor watcher performance with complex lessons
3. **Additional Components**: Extend to other content types if needed (images, videos, etc.)
4. **Documentation**: Update parser documentation with visibility examples

## Compatibility

- **Backward Compatible**: Existing content without visibility conditions works unchanged
- **Progressive Enhancement**: Only content with `gone-if`/`invisible-if` attributes uses new functionality
- **State Integration**: Fully compatible with existing state management and event systems
