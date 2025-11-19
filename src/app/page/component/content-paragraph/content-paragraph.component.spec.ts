import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VisibilityWatcherService } from 'src/app/shared/visibility-watcher.service';
import { mockParagraph } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentParagraphComponent } from './content-paragraph.component';

describe('ContentParagraphComponent', () => {
  let component: ContentParagraphComponent;
  let fixture: ComponentFixture<ContentParagraphComponent>;
  let visibilityWatcherService: VisibilityWatcherService;
  const paragraph = mockParagraph();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentParagraphComponent],
      providers: [PageService, VisibilityWatcherService]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentParagraphComponent);
    component = fixture.componentInstance;
    visibilityWatcherService = TestBed.inject(VisibilityWatcherService);
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.item = paragraph;
    component.ngOnChanges({
      item: new SimpleChange(null, paragraph, true)
    });

    expect(component.items).toEqual(paragraph.content);
    expect(component.ready).toBeTrue();
  });

  describe('Visibility functionality', () => {
    let mockFlowWatcher: any;
    let mockParagraphWithVisibility: any;

    beforeEach(() => {
      mockFlowWatcher = {
        close: jasmine.createSpy('close')
      };

      mockParagraphWithVisibility = {
        ...paragraph,
        watchIsGone: jasmine
          .createSpy('watchIsGone')
          .and.returnValue(mockFlowWatcher),
        watchIsInvisible: jasmine
          .createSpy('watchIsInvisible')
          .and.returnValue(mockFlowWatcher)
      };
    });

    it('should initialize visibility state correctly', () => {
      component.item = paragraph;
      component.ngOnChanges({
        item: new SimpleChange(null, paragraph, true)
      });

      expect(component.isGone).toBe(false);
      expect(component.isInvisible).toBe(false);
      expect(component.state).toBeDefined();
    });

    it('should set up visibility watchers on init', () => {
      spyOn(visibilityWatcherService, 'setupVisibilityWatchers');

      component.item = paragraph;
      component.ngOnChanges({
        item: new SimpleChange(null, paragraph, true)
      });

      expect(
        visibilityWatcherService.setupVisibilityWatchers
      ).toHaveBeenCalledWith(paragraph, component);
    });

    it('should clean up watchers on destroy', () => {
      spyOn(visibilityWatcherService, 'cleanupWatchers');

      component.ngOnDestroy();

      expect(visibilityWatcherService.cleanupWatchers).toHaveBeenCalledWith(
        component
      );
    });

    it('should handle gone state for quiz results', () => {
      component.item = mockParagraphWithVisibility;
      component.ngOnChanges({
        item: new SimpleChange(null, mockParagraphWithVisibility, true)
      });

      // Simulate quiz result paragraph that should be gone initially
      component.isGone = true;

      expect(visibilityWatcherService.shouldShowElement(component)).toBe(false);
    });

    it('should handle invisible state for conditional content', () => {
      component.item = mockParagraphWithVisibility;
      component.ngOnChanges({
        item: new SimpleChange(null, mockParagraphWithVisibility, true)
      });

      // Simulate paragraph that should be invisible but preserve space
      component.isInvisible = true;

      expect(visibilityWatcherService.getVisibilityStyle(component)).toBe(
        'hidden'
      );
    });

    it('should show paragraph when conditions are met', () => {
      component.item = mockParagraphWithVisibility;
      component.ngOnChanges({
        item: new SimpleChange(null, mockParagraphWithVisibility, true)
      });

      // Simulate quiz answer selected, result should show
      component.isGone = false;
      component.isInvisible = false;

      expect(visibilityWatcherService.shouldShowElement(component)).toBe(true);
      expect(visibilityWatcherService.getVisibilityStyle(component)).toBe(
        'visible'
      );
    });

    it('should handle both gone and invisible states correctly', () => {
      component.item = mockParagraphWithVisibility;
      component.ngOnChanges({
        item: new SimpleChange(null, mockParagraphWithVisibility, true)
      });

      // Test gone takes precedence (element not in DOM)
      component.isGone = true;
      component.isInvisible = true;

      expect(visibilityWatcherService.shouldShowElement(component)).toBe(false);
      // Visibility style doesn't matter if element is gone
    });

    it('should maintain visibility state during content updates', () => {
      component.item = mockParagraphWithVisibility;
      component.ngOnChanges({
        item: new SimpleChange(null, mockParagraphWithVisibility, true)
      });

      // Set visibility states
      component.isGone = false;
      component.isInvisible = true;

      // Component should maintain state
      expect(component.isGone).toBe(false);
      expect(component.isInvisible).toBe(true);

      // Service methods should reflect current state
      expect(visibilityWatcherService.shouldShowElement(component)).toBe(true);
      expect(visibilityWatcherService.getVisibilityStyle(component)).toBe(
        'hidden'
      );
    });

    describe('Template rendering with visibility', () => {
      it('should render content-repeater when not gone', () => {
        component.item = paragraph;
        component.ngOnChanges({
          item: new SimpleChange(null, paragraph, true)
        });
        component.isGone = false;

        spyOn(visibilityWatcherService, 'shouldShowElement').and.returnValue(
          true
        );
        fixture.detectChanges();

        const repeaterElement = fixture.debugElement.query(
          (selector) => selector.name === 'app-content-repeater'
        );

        expect(repeaterElement).toBeTruthy();
        expect(visibilityWatcherService.shouldShowElement).toHaveBeenCalledWith(
          component
        );
      });

      it('should not render content-repeater when gone', () => {
        component.item = paragraph;
        component.ngOnChanges({
          item: new SimpleChange(null, paragraph, true)
        });
        component.isGone = true;

        spyOn(visibilityWatcherService, 'shouldShowElement').and.returnValue(
          false
        );
        fixture.detectChanges();

        const repeaterElement = fixture.debugElement.query(
          (selector) => selector.name === 'app-content-repeater'
        );

        expect(repeaterElement).toBeFalsy();
      });

      it('should apply visibility style when invisible', () => {
        component.item = paragraph;
        component.ngOnChanges({
          item: new SimpleChange(null, paragraph, true)
        });
        component.isInvisible = true;

        spyOn(visibilityWatcherService, 'shouldShowElement').and.returnValue(
          true
        );
        spyOn(visibilityWatcherService, 'getVisibilityStyle').and.returnValue(
          'hidden'
        );
        fixture.detectChanges();

        const containerDiv = fixture.debugElement.query(
          (selector) => selector.nativeElement.tagName === 'DIV'
        );

        expect(containerDiv).toBeTruthy();
        expect(containerDiv.nativeElement.style.visibility).toBe('hidden');
        expect(
          visibilityWatcherService.getVisibilityStyle
        ).toHaveBeenCalledWith(component);
      });
    });
  });
});
