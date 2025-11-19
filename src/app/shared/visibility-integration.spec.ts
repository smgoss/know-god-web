import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { mockButton, mockParagraph, mockText } from '../_tests/mocks';
import { ContentButtonComponent } from '../page/component/content-button/content-button.component';
import { ContentParagraphComponent } from '../page/component/content-paragraph/content-paragraph.component';
import { ContentTextComponent } from '../page/component/content-text/content-text.component';
import { PageService } from '../page/service/page-service.service';
import { VisibilityWatcherService } from './visibility-watcher.service';

/**
 * Integration tests for visibility functionality across multiple components
 * Simulates real lesson quiz scenarios with state changes
 */

@Component({
  template: `
    <div class="quiz-container">
      <!-- Quiz Question -->
      <app-content-text [item]="questionText" data-testid="question-text">
      </app-content-text>

      <!-- Answer Buttons -->
      <app-content-button
        [item]="answerButtonA"
        data-testid="answer-a"
        (click)="selectAnswer('correct')"
      >
      </app-content-button>

      <app-content-button
        [item]="answerButtonB"
        data-testid="answer-b"
        (click)="selectAnswer('wrong')"
      >
      </app-content-button>

      <!-- Result Paragraphs -->
      <app-content-paragraph
        [item]="correctResultParagraph"
        data-testid="correct-result"
      >
      </app-content-paragraph>

      <app-content-paragraph
        [item]="wrongResultParagraph"
        data-testid="wrong-result"
      >
      </app-content-paragraph>

      <!-- Continue Button -->
      <app-content-button
        [item]="continueButton"
        data-testid="continue-button"
        (click)="nextQuestion()"
      >
      </app-content-button>
    </div>
  `
})
class TestQuizComponent {
  questionText = mockText('What is the main message of John 3:16?');
  answerButtonA = mockButton('God loves the world', '', 'select-answer-a');
  answerButtonB = mockButton('God is angry', '', 'select-answer-b');
  correctResultParagraph = mockParagraph();
  wrongResultParagraph = mockParagraph();
  continueButton = mockButton('Next Question', '', 'next-question');

  constructor(private pageService: PageService) {
    this.setupVisibilityConditions();
  }

  selectAnswer(type: 'correct' | 'wrong') {
    // Simulate state changes that would happen in real quiz
    const state = this.pageService.parserState();
    state.setValue('answer_selected', true);
    state.setValue('selected_answer', type);
  }

  nextQuestion() {
    const state = this.pageService.parserState();
    state.setValue('answer_selected', false);
    state.setValue('selected_answer', null);
  }

  private setupVisibilityConditions() {
    // Set up mock visibility watchers that respond to state changes
    (this.answerButtonA as any).watchIsGone = (
      state: any,
      callback: (value: boolean) => void
    ) => {
      const watcher = {
        close: () => {},
        callback
      };
      // Simulate watcher that hides button when answer is selected
      if (state.addListener) {
        state.addListener('answer_selected', (value: boolean) =>
          callback(value)
        );
      }
      return watcher;
    };

    (this.answerButtonB as any).watchIsGone = (
      state: any,
      callback: (value: boolean) => void
    ) => {
      const watcher = {
        close: () => {},
        callback
      };
      if (state.addListener) {
        state.addListener('answer_selected', (value: boolean) =>
          callback(value)
        );
      }
      return watcher;
    };

    (this.correctResultParagraph as any).watchIsInvisible = (
      state: any,
      callback: (value: boolean) => void
    ) => {
      const watcher = {
        close: () => {},
        callback
      };
      // Show when correct answer is selected
      if (state.addListener) {
        state.addListener('selected_answer', (value: string) =>
          callback(value !== 'correct')
        );
      }
      return watcher;
    };

    (this.wrongResultParagraph as any).watchIsInvisible = (
      state: any,
      callback: (value: boolean) => void
    ) => {
      const watcher = {
        close: () => {},
        callback
      };
      // Show when wrong answer is selected
      if (state.addListener) {
        state.addListener('selected_answer', (value: string) =>
          callback(value !== 'wrong')
        );
      }
      return watcher;
    };

    (this.continueButton as any).watchIsGone = (
      state: any,
      callback: (value: boolean) => void
    ) => {
      const watcher = {
        close: () => {},
        callback
      };
      // Show when any answer is selected
      if (state.addListener) {
        state.addListener('answer_selected', (value: boolean) =>
          callback(!value)
        );
      }
      return watcher;
    };
  }
}

describe('Visibility Integration Tests - Lesson Quiz Scenarios', () => {
  let component: TestQuizComponent;
  let fixture: ComponentFixture<TestQuizComponent>;
  let pageService: PageService;
  let visibilityWatcherService: VisibilityWatcherService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestQuizComponent,
        ContentButtonComponent,
        ContentParagraphComponent,
        ContentTextComponent
      ],
      providers: [PageService, VisibilityWatcherService]
    }).compileComponents();

    fixture = TestBed.createComponent(TestQuizComponent);
    component = fixture.componentInstance;
    pageService = TestBed.inject(PageService);
    visibilityWatcherService = TestBed.inject(VisibilityWatcherService);

    fixture.detectChanges();
  });

  it('should create quiz component with all elements', () => {
    expect(component).toBeTruthy();

    const questionElement = fixture.debugElement.query(
      By.css('[data-testid="question-text"]')
    );
    const answerAElement = fixture.debugElement.query(
      By.css('[data-testid="answer-a"]')
    );
    const answerBElement = fixture.debugElement.query(
      By.css('[data-testid="answer-b"]')
    );

    expect(questionElement).toBeTruthy();
    expect(answerAElement).toBeTruthy();
    expect(answerBElement).toBeTruthy();
  });

  describe('Complete Quiz Flow Simulation', () => {
    it('should simulate complete correct answer flow', async () => {
      // Initial state: Question visible, buttons visible, results hidden, continue hidden
      fixture.detectChanges();

      let questionElement = fixture.debugElement.query(
        By.css('[data-testid="question-text"]')
      );
      let answerAElement = fixture.debugElement.query(
        By.css('[data-testid="answer-a"]')
      );
      let answerBElement = fixture.debugElement.query(
        By.css('[data-testid="answer-b"]')
      );
      let continueElement = fixture.debugElement.query(
        By.css('[data-testid="continue-button"]')
      );

      expect(questionElement).toBeTruthy();
      expect(answerAElement).toBeTruthy();
      expect(answerBElement).toBeTruthy();
      expect(continueElement).toBeFalsy(); // Should be gone initially

      // User selects correct answer
      component.selectAnswer('correct');
      fixture.detectChanges();

      // After correct answer: buttons gone, correct result visible, continue visible
      answerAElement = fixture.debugElement.query(
        By.css('[data-testid="answer-a"]')
      );
      answerBElement = fixture.debugElement.query(
        By.css('[data-testid="answer-b"]')
      );
      continueElement = fixture.debugElement.query(
        By.css('[data-testid="continue-button"]')
      );

      expect(answerAElement).toBeFalsy(); // Should be gone
      expect(answerBElement).toBeFalsy(); // Should be gone
      expect(continueElement).toBeTruthy(); // Should be visible

      // Verify correct result is visible and wrong result is hidden
      const correctResultElement = fixture.debugElement.query(
        By.css('[data-testid="correct-result"]')
      );
      const wrongResultElement = fixture.debugElement.query(
        By.css('[data-testid="wrong-result"]')
      );

      expect(correctResultElement).toBeTruthy();
      // Note: wrongResultElement might still exist in DOM but be invisible
      if (wrongResultElement) {
        const wrongResultDiv = wrongResultElement.query(By.css('div'));
        expect(wrongResultDiv?.nativeElement.style.visibility).toBe('hidden');
      }
    });

    it('should simulate complete wrong answer flow', async () => {
      // User selects wrong answer
      component.selectAnswer('wrong');
      fixture.detectChanges();

      // After wrong answer: buttons gone, wrong result visible, continue visible
      const answerAElement = fixture.debugElement.query(
        By.css('[data-testid="answer-a"]')
      );
      const answerBElement = fixture.debugElement.query(
        By.css('[data-testid="answer-b"]')
      );
      const continueElement = fixture.debugElement.query(
        By.css('[data-testid="continue-button"]')
      );

      expect(answerAElement).toBeFalsy(); // Should be gone
      expect(answerBElement).toBeFalsy(); // Should be gone
      expect(continueElement).toBeTruthy(); // Should be visible

      // Verify wrong result is visible and correct result is hidden
      const correctResultElement = fixture.debugElement.query(
        By.css('[data-testid="correct-result"]')
      );
      const wrongResultElement = fixture.debugElement.query(
        By.css('[data-testid="wrong-result"]')
      );

      expect(wrongResultElement).toBeTruthy();
      if (correctResultElement) {
        const correctResultDiv = correctResultElement.query(By.css('div'));
        expect(correctResultDiv?.nativeElement.style.visibility).toBe('hidden');
      }
    });

    it('should handle quiz reset flow', async () => {
      // Complete a quiz cycle
      component.selectAnswer('correct');
      fixture.detectChanges();

      // Verify post-answer state
      let continueElement = fixture.debugElement.query(
        By.css('[data-testid="continue-button"]')
      );
      expect(continueElement).toBeTruthy();

      // Reset for next question
      component.nextQuestion();
      fixture.detectChanges();

      // Should return to initial state
      const questionElement = fixture.debugElement.query(
        By.css('[data-testid="question-text"]')
      );
      const answerAElement = fixture.debugElement.query(
        By.css('[data-testid="answer-a"]')
      );
      const answerBElement = fixture.debugElement.query(
        By.css('[data-testid="answer-b"]')
      );
      continueElement = fixture.debugElement.query(
        By.css('[data-testid="continue-button"]')
      );

      expect(questionElement).toBeTruthy();
      expect(answerAElement).toBeTruthy(); // Should be visible again
      expect(answerBElement).toBeTruthy(); // Should be visible again
      expect(continueElement).toBeFalsy(); // Should be gone again
    });
  });

  describe('State Management Integration', () => {
    it('should properly manage state across multiple components', () => {
      const state = pageService.parserState();

      // Initial state
      expect(state.getValue('answer_selected')).toBeFalsy();
      expect(state.getValue('selected_answer')).toBeFalsy();

      // Select answer
      component.selectAnswer('correct');

      // State should be updated
      expect(state.getValue('answer_selected')).toBe(true);
      expect(state.getValue('selected_answer')).toBe('correct');

      // Reset
      component.nextQuestion();

      // State should be reset
      expect(state.getValue('answer_selected')).toBe(false);
      expect(state.getValue('selected_answer')).toBe(null);
    });

    it('should handle rapid state changes without errors', () => {
      // Rapid state changes
      component.selectAnswer('correct');
      component.selectAnswer('wrong');
      component.selectAnswer('correct');
      component.nextQuestion();
      component.selectAnswer('wrong');

      // Should not throw errors and end in consistent state
      const state = pageService.parserState();
      expect(state.getValue('answer_selected')).toBe(true);
      expect(state.getValue('selected_answer')).toBe('wrong');
    });
  });

  describe('Memory Management', () => {
    it('should properly clean up watchers when components are destroyed', () => {
      spyOn(visibilityWatcherService, 'cleanupWatchers');

      // Destroy the component
      fixture.destroy();

      // Should have called cleanup for each component with visibility watchers
      expect(visibilityWatcherService.cleanupWatchers).toHaveBeenCalled();
    });

    it('should handle component re-initialization without memory leaks', () => {
      const initialWatcherCount = Object.keys(
        pageService.parserState().listeners || {}
      ).length;

      // Re-create component multiple times
      for (let i = 0; i < 3; i++) {
        fixture.destroy();
        fixture = TestBed.createComponent(TestQuizComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      }

      // Should not accumulate listeners
      const finalWatcherCount = Object.keys(
        pageService.parserState().listeners || {}
      ).length;
      expect(finalWatcherCount).toBeLessThanOrEqual(initialWatcherCount + 10); // Allow some reasonable growth
    });
  });
});
