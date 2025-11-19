/**
 * Example demonstrating how the visibility functionality works for lesson quizzes
 * This shows how buttons and paragraphs would conditionally appear/disappear based on state
 */

import { State } from 'src/app/services/xml-parser-service/xml-parser.service';

// Example lesson quiz scenario
export class LessonQuizVisibilityExample {
  /**
   * Simulates a lesson quiz where:
   * 1. User sees a question with multiple choice buttons
   * 2. After selecting an answer, some buttons disappear (gone-if)
   * 3. Result text appears based on the answer (invisible-if becomes visible)
   */
  static demonstrateQuizFlow() {
    console.log('=== Lesson Quiz Visibility Demo ===');

    // Create parser state (this would be managed by PageService in real app)
    const _state = State.createState();

    // Initial state - no answer selected yet
    console.log('\n1. Initial Quiz State:');
    console.log('- Question: "What is the main message of John 3:16?"');
    console.log('- Button A: "God loves the world" (visible)');
    console.log('- Button B: "God is angry" (visible)');
    console.log('- Button C: "God is distant" (visible)');
    console.log('- Result text: (hidden - invisible-if="!answer_selected")');

    // User selects answer A (correct answer)
    console.log('\n2. User clicks Button A - "God loves the world":');

    // This would be triggered by button click event
    // state.setValue('selected_answer', 'correct');
    // state.setValue('answer_selected', true);

    console.log(
      '- State updated: selected_answer = "correct", answer_selected = true'
    );

    // Now visibility conditions are evaluated:
    console.log('\n3. Visibility Updates:');
    console.log(
      '- Button A: (gone-if="answer_selected") → HIDDEN (removed from layout)'
    );
    console.log(
      '- Button B: (gone-if="answer_selected") → HIDDEN (removed from layout)'
    );
    console.log(
      '- Button C: (gone-if="answer_selected") → HIDDEN (removed from layout)'
    );
    console.log(
      '- Correct result text: (invisible-if="selected_answer != \'correct\'") → VISIBLE'
    );
    console.log(
      '- Wrong result text: (invisible-if="selected_answer == \'correct\'") → HIDDEN (space preserved)'
    );
    console.log('- Continue button: (gone-if="!answer_selected") → VISIBLE');

    console.log('\n4. Final Quiz State:');
    console.log('- Question: "What is the main message of John 3:16?"');
    console.log('- All choice buttons: GONE (no space taken)');
    console.log(
      '- Result: "Correct! God\'s love for the world is central to the Gospel." (visible)'
    );
    console.log('- Continue button: "Next Question" (visible)');
  }

  /**
   * Shows how the implemented components would handle this
   */
  static explainImplementation() {
    console.log('\n=== Implementation Details ===');

    console.log('\n1. Button Component (ContentButtonComponent):');
    console.log('- Implements VisibilityWatcherComponent interface');
    console.log('- Uses VisibilityWatcherService.setupVisibilityWatchers()');
    console.log(
      '- Template: *ngIf="visibilityWatcherService.shouldShowElement(this)"'
    );
    console.log(
      '- Style: [ngStyle]="{ \'visibility\': visibilityWatcherService.getVisibilityStyle(this) }"'
    );

    console.log('\n2. Paragraph Component (ContentParagraphComponent):');
    console.log('- Same pattern as Button component');
    console.log('- Wraps content-repeater in visibility-controlled div');

    console.log('\n3. Text Component (ContentTextComponent):');
    console.log('- Uses getStylesWithVisibility() to merge existing styles');
    console.log('- Preserves text formatting while adding visibility control');

    console.log('\n4. Visibility Watcher Service:');
    console.log('- Centralizes visibility logic');
    console.log('- Manages FlowWatcher lifecycle (setup/cleanup)');
    console.log('- Provides utility methods for templates');
    console.log(
      '- Handles both gone-if (display:none) and invisible-if (visibility:hidden)'
    );

    console.log('\n5. State Integration:');
    console.log('- Uses existing PageService.parserState()');
    console.log('- Leverages godtools-shared State management');
    console.log('- Watches for state changes via FlowWatcher callbacks');
  }

  /**
   * Example XML that would trigger this behavior
   */
  static showExampleXML() {
    console.log('\n=== Example Lesson XML ===');
    console.log(`
<content:text text="What is the main message of John 3:16?" />

<content:button 
  text="God loves the world" 
  events="state:set_answer_correct"
  gone-if="answer_selected" />

<content:button 
  text="God is angry" 
  events="state:set_answer_wrong"
  gone-if="answer_selected" />

<content:button 
  text="God is distant" 
  events="state:set_answer_wrong"
  gone-if="answer_selected" />

<content:paragraph invisible-if="selected_answer != 'correct'">
  <content:text text="Correct! God's love for the world is central to the Gospel." />
</content:paragraph>

<content:paragraph invisible-if="selected_answer == 'correct'">
  <content:text text="Not quite. John 3:16 emphasizes God's love, not anger or distance." />
</content:paragraph>

<content:button 
  text="Next Question" 
  events="next-page"
  gone-if="!answer_selected" />
    `);
  }
}

// Run the demo
if (typeof window === 'undefined') {
  // Only run in Node.js environment (not in browser)
  LessonQuizVisibilityExample.demonstrateQuizFlow();
  LessonQuizVisibilityExample.explainImplementation();
  LessonQuizVisibilityExample.showExampleXML();
}
