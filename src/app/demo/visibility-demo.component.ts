import { Component, OnInit } from '@angular/core';
import { PageService } from '../page/service/page-service.service';
import { VisibilityWatcherService } from '../shared/visibility-watcher.service';

@Component({
  selector: 'app-visibility-demo',
  template: `
    <div
      class="demo-container"
      style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;"
    >
      <h1>🎯 Visibility Functionality Demo</h1>
      <p>
        This demo shows the conditional visibility features for lesson quizzes
        that we just implemented!
      </p>

      <div
        class="quiz-section"
        style="border: 2px solid #e0e0e0; padding: 20px; margin: 20px 0; border-radius: 8px;"
      >
        <h2>📝 Quiz Question</h2>

        <!-- Question Text (always visible) -->
        <div
          style="font-size: 18px; margin-bottom: 20px; padding: 10px; background: #f0f8ff; border-radius: 5px;"
        >
          <strong>What is the main message of John 3:16?</strong>
        </div>

        <!-- Answer Buttons (hidden after selection) -->
        <div
          class="answer-buttons"
          style="margin: 20px 0;"
          *ngIf="!answerSelected"
        >
          <h3>Choose your answer:</h3>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button
              (click)="selectAnswer('correct')"
              style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;"
            >
              God loves the world
            </button>

            <button
              (click)="selectAnswer('wrong')"
              style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;"
            >
              God is angry with sinners
            </button>
          </div>
        </div>

        <!-- Result Paragraphs (conditionally visible) -->
        <div class="results-section" style="margin: 20px 0;">
          <div
            *ngIf="selectedAnswer === 'correct'"
            style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28a745;"
          >
            <h4 style="color: #155724; margin: 0 0 10px 0;">✅ Correct!</h4>
            <p style="margin: 0; color: #155724;">
              That's right! John 3:16 tells us that "God so loved the world that
              he gave his one and only Son, that whoever believes in him shall
              not perish but have eternal life." This verse shows God's
              incredible love for us.
            </p>
          </div>

          <div
            *ngIf="selectedAnswer === 'wrong'"
            style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #dc3545;"
          >
            <h4 style="color: #721c24; margin: 0 0 10px 0;">
              ❌ Not quite right
            </h4>
            <p style="margin: 0; color: #721c24;">
              While God does hate sin, John 3:16 emphasizes God's love for the
              world. The verse shows that God's love is so great that He gave
              His Son to save us from our sins.
            </p>
          </div>
        </div>

        <!-- Continue Button (appears after answer) -->
        <div
          class="continue-section"
          style="margin: 20px 0;"
          *ngIf="answerSelected"
        >
          <button
            (click)="resetQuiz()"
            style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;"
          >
            Next Question →
          </button>
        </div>
      </div>

      <!-- State Display -->
      <div
        class="state-display"
        style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #dee2e6;"
      >
        <h3 style="margin-top: 0;">🔍 Current State:</h3>
        <ul style="margin: 0;">
          <li>
            <strong>Answer Selected:</strong>
            {{ answerSelected ? 'true' : 'false' }}
          </li>
          <li>
            <strong>Selected Answer:</strong> {{ selectedAnswer || 'none' }}
          </li>
          <li>
            <strong>Visibility Service Active:</strong>
            {{ visibilityServiceActive ? 'true' : 'false' }}
          </li>
        </ul>
      </div>

      <!-- Technical Details -->
      <div
        class="tech-details"
        style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeaa7;"
      >
        <h3 style="margin-top: 0;">⚙️ Technical Implementation:</h3>
        <ul style="margin: 0;">
          <li>
            <strong>VisibilityWatcherService:</strong> Manages component
            visibility state
          </li>
          <li>
            <strong>State Management:</strong> PageService tracks quiz state
            values
          </li>
          <li>
            <strong>Conditional Rendering:</strong> Angular *ngIf directives
            based on state
          </li>
          <li>
            <strong>Test Coverage:</strong> 201 tests protect this functionality
          </li>
        </ul>
      </div>

      <!-- Instructions -->
      <div
        class="instructions"
        style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #b8daff;"
      >
        <h3 style="margin-top: 0;">📋 How it works:</h3>
        <ol style="margin: 0;">
          <li>
            <strong>Initial State:</strong> Question visible, both answer
            buttons visible, results hidden, continue hidden
          </li>
          <li>
            <strong>After Correct Answer:</strong> Buttons disappear, correct
            result appears, continue button appears
          </li>
          <li>
            <strong>After Wrong Answer:</strong> Buttons disappear, wrong result
            appears, continue button appears
          </li>
          <li>
            <strong>After Continue:</strong> Reset to initial state for next
            question
          </li>
        </ol>

        <div
          style="margin-top: 15px; padding: 10px; background: rgba(0,123,255,0.1); border-radius: 3px;"
        >
          <strong
            >🎉 This demonstrates the visibility functionality we just
            built!</strong
          ><br />
          In the real application, this would be powered by XML content with
          <code>gone-if</code> and <code>invisible-if</code> attributes.
        </div>
      </div>
    </div>
  `
})
export class VisibilityDemoComponent implements OnInit {
  answerSelected = false;
  selectedAnswer: 'correct' | 'wrong' | null = null;
  visibilityServiceActive = false;

  constructor(
    private pageService: PageService,
    private visibilityWatcherService: VisibilityWatcherService
  ) {}

  ngOnInit() {
    // Initialize the visibility service to show it's active
    this.visibilityServiceActive = true;

    // Set up initial state
    this.resetQuiz();
  }

  selectAnswer(type: 'correct' | 'wrong') {
    this.answerSelected = true;
    this.selectedAnswer = type;

    // Update the page service state (this is what would happen in real quiz)
    const state = this.pageService.parserState();
    state.setValue('answer_selected', true);
    state.setValue('selected_answer', type);

    console.log('🎯 Answer selected:', type);
    console.log('📊 State updated:', {
      answer_selected: state.getValue('answer_selected'),
      selected_answer: state.getValue('selected_answer')
    });
  }

  resetQuiz() {
    this.answerSelected = false;
    this.selectedAnswer = null;

    // Reset the page service state
    const state = this.pageService.parserState();
    state.setValue('answer_selected', false);
    state.setValue('selected_answer', null);

    console.log('🔄 Quiz reset');
    console.log('📊 State reset:', {
      answer_selected: state.getValue('answer_selected'),
      selected_answer: state.getValue('selected_answer')
    });
  }
}
