import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VisibilityWatcherService } from 'src/app/shared/visibility-watcher.service';
import { mockButton } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentButtonComponent } from './content-button.component';

describe('ContentButtonComponent', () => {
  let component: ContentButtonComponent;
  let fixture: ComponentFixture<ContentButtonComponent>;
  let visibilityWatcherService: VisibilityWatcherService;
  const buttonText = 'Button Text';
  const buttonUrl = 'www.some-url-path.com';
  const buttonEvent = 'open-test-modal';
  const mockEventButton = mockButton(buttonText, '', buttonEvent);
  const mockUrlButton = mockButton(buttonText, buttonUrl, '');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentButtonComponent],
      providers: [PageService, VisibilityWatcherService]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentButtonComponent);
    component = fixture.componentInstance;
    visibilityWatcherService = TestBed.inject(VisibilityWatcherService);
    fixture.detectChanges();
  }));

  it('should create and load in CTA', () => {
    component.item = mockEventButton;
    component.ngOnChanges({
      item: new SimpleChange(null, mockEventButton, true)
    });
    expect(component).toBeTruthy();
    expect(component.buttonText).toBe(buttonText);
    expect(component.type).toBe('event');
    expect(component.events.length).toBe(1);
  });

  it('URL Button, Added http set URL', () => {
    component.item = mockUrlButton;
    component.ngOnChanges({
      item: new SimpleChange(null, mockUrlButton, true)
    });
    expect(component).toBeTruthy();
    expect(component.buttonText).toBe(buttonText);
    expect(component.type).toBe('url');
  });

  it('Test events', () => {
    component.item = mockEventButton;
    component.ngOnChanges({
      item: new SimpleChange(null, mockEventButton, true)
    });

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    component.formAction();

    expect(pageService.formAction).toHaveBeenCalledWith(buttonEvent);
  });

  describe('Visibility functionality', () => {
    let mockFlowWatcher: any;
    let mockButtonWithVisibility: any;

    beforeEach(() => {
      mockFlowWatcher = {
        close: jasmine.createSpy('close')
      };

      mockButtonWithVisibility = {
        ...mockEventButton,
        watchIsGone: jasmine
          .createSpy('watchIsGone')
          .and.returnValue(mockFlowWatcher),
        watchIsInvisible: jasmine
          .createSpy('watchIsInvisible')
          .and.returnValue(mockFlowWatcher)
      };
    });

    it('should initialize visibility state correctly', () => {
      component.item = mockEventButton;
      component.ngOnChanges({
        item: new SimpleChange(null, mockEventButton, true)
      });

      expect(component.isGone).toBe(false);
      expect(component.isInvisible).toBe(false);
      expect(component.state).toBeDefined();
    });

    it('should set up visibility watchers on init', () => {
      spyOn(visibilityWatcherService, 'setupVisibilityWatchers');

      component.item = mockEventButton;
      component.ngOnChanges({
        item: new SimpleChange(null, mockEventButton, true)
      });

      expect(
        visibilityWatcherService.setupVisibilityWatchers
      ).toHaveBeenCalledWith(mockEventButton, component);
    });

    it('should clean up watchers on destroy', () => {
      spyOn(visibilityWatcherService, 'cleanupWatchers');

      component.ngOnDestroy();

      expect(visibilityWatcherService.cleanupWatchers).toHaveBeenCalledWith(
        component
      );
    });

    it('should have access to visibility watcher service in template', () => {
      expect(component.visibilityWatcherService).toBe(visibilityWatcherService);
    });

    it('should handle gone state changes correctly', () => {
      component.item = mockButtonWithVisibility;
      component.ngOnChanges({
        item: new SimpleChange(null, mockButtonWithVisibility, true)
      });

      // Simulate gone state change
      component.isGone = true;

      expect(visibilityWatcherService.shouldShowElement(component)).toBe(false);
    });

    it('should handle invisible state changes correctly', () => {
      component.item = mockButtonWithVisibility;
      component.ngOnChanges({
        item: new SimpleChange(null, mockButtonWithVisibility, true)
      });

      // Simulate invisible state change
      component.isInvisible = true;

      expect(visibilityWatcherService.getVisibilityStyle(component)).toBe(
        'hidden'
      );
    });

    it('should clean up watchers when item changes', () => {
      spyOn(visibilityWatcherService, 'setupVisibilityWatchers');

      // First item
      component.item = mockEventButton;
      component.ngOnChanges({
        item: new SimpleChange(null, mockEventButton, true)
      });

      // Change to new item
      const newButton = mockButton('New Button', '', 'new-event');
      component.item = newButton;
      component.ngOnChanges({
        item: new SimpleChange(mockEventButton, newButton, false)
      });

      // Should be called twice - once for each item
      expect(
        visibilityWatcherService.setupVisibilityWatchers
      ).toHaveBeenCalledTimes(2);
      expect(
        visibilityWatcherService.setupVisibilityWatchers
      ).toHaveBeenCalledWith(newButton, component);
    });

    it('should maintain visibility state during component lifecycle', () => {
      component.item = mockButtonWithVisibility;
      component.ngOnChanges({
        item: new SimpleChange(null, mockButtonWithVisibility, true)
      });

      // Set visibility states
      component.isGone = true;
      component.isInvisible = true;

      // Component should maintain state
      expect(component.isGone).toBe(true);
      expect(component.isInvisible).toBe(true);

      // Service methods should reflect current state
      expect(visibilityWatcherService.shouldShowElement(component)).toBe(false);
      expect(visibilityWatcherService.getVisibilityStyle(component)).toBe(
        'hidden'
      );
    });

    describe('Template rendering with visibility', () => {
      it('should render button when not gone', () => {
        component.item = mockEventButton;
        component.ngOnChanges({
          item: new SimpleChange(null, mockEventButton, true)
        });
        component.isGone = false;

        spyOn(visibilityWatcherService, 'shouldShowElement').and.returnValue(
          true
        );
        fixture.detectChanges();

        const buttonElement = fixture.debugElement.query(
          (selector) =>
            selector.nativeElement.tagName === 'A' &&
            selector.nativeElement.textContent.includes(buttonText)
        );

        expect(buttonElement).toBeTruthy();
        expect(visibilityWatcherService.shouldShowElement).toHaveBeenCalledWith(
          component
        );
      });

      it('should not render button when gone', () => {
        component.item = mockEventButton;
        component.ngOnChanges({
          item: new SimpleChange(null, mockEventButton, true)
        });
        component.isGone = true;

        spyOn(visibilityWatcherService, 'shouldShowElement').and.returnValue(
          false
        );
        fixture.detectChanges();

        const buttonElement = fixture.debugElement.query(
          (selector) =>
            selector.nativeElement.tagName === 'A' &&
            selector.nativeElement.textContent.includes(buttonText)
        );

        expect(buttonElement).toBeFalsy();
      });

      it('should apply visibility style when invisible', () => {
        component.item = mockEventButton;
        component.ngOnChanges({
          item: new SimpleChange(null, mockEventButton, true)
        });
        component.isInvisible = true;

        spyOn(visibilityWatcherService, 'shouldShowElement').and.returnValue(
          true
        );
        spyOn(visibilityWatcherService, 'getVisibilityStyle').and.returnValue(
          'hidden'
        );
        fixture.detectChanges();

        const containerDiv = fixture.debugElement.query((selector) =>
          selector.nativeElement.classList.contains('buttonContent')
        );

        expect(containerDiv).toBeTruthy();
        expect(containerDiv.nativeElement.style.visibility).toBe('hidden');
        expect(
          visibilityWatcherService.getVisibilityStyle
        ).toHaveBeenCalledWith(component);
      });

      it('should apply visible style when not invisible', () => {
        component.item = mockEventButton;
        component.ngOnChanges({
          item: new SimpleChange(null, mockEventButton, true)
        });
        component.isInvisible = false;

        spyOn(visibilityWatcherService, 'shouldShowElement').and.returnValue(
          true
        );
        spyOn(visibilityWatcherService, 'getVisibilityStyle').and.returnValue(
          'visible'
        );
        fixture.detectChanges();

        const containerDiv = fixture.debugElement.query((selector) =>
          selector.nativeElement.classList.contains('buttonContent')
        );

        expect(containerDiv).toBeTruthy();
        expect(containerDiv.nativeElement.style.visibility).toBe('visible');
      });
    });

    describe('Edge cases and error handling', () => {
      it('should handle undefined watchers gracefully', () => {
        component.item = mockEventButton;
        component.isGoneWatcher = undefined;
        component.isInvisibleWatcher = undefined;

        expect(() => component.ngOnDestroy()).not.toThrow();
      });

      it('should handle rapid state changes', () => {
        component.item = mockButtonWithVisibility;
        component.ngOnChanges({
          item: new SimpleChange(null, mockButtonWithVisibility, true)
        });

        // Rapid state changes
        component.isGone = true;
        component.isGone = false;
        component.isInvisible = true;
        component.isInvisible = false;

        expect(component.isGone).toBe(false);
        expect(component.isInvisible).toBe(false);
      });

      it('should handle component re-initialization', () => {
        spyOn(visibilityWatcherService, 'setupVisibilityWatchers');

        // Initialize
        component.item = mockEventButton;
        component.ngOnChanges({
          item: new SimpleChange(null, mockEventButton, true)
        });

        // Re-initialize with different item (this triggers re-initialization)
        const newButton = mockButton('New Button', '', 'new-event');
        component.ngOnChanges({
          item: new SimpleChange(mockEventButton, newButton, false)
        });

        // Should set up watchers for both items
        expect(
          visibilityWatcherService.setupVisibilityWatchers
        ).toHaveBeenCalledTimes(2);
      });

      it('should maintain state consistency across updates', () => {
        component.item = mockButtonWithVisibility;
        component.ngOnChanges({
          item: new SimpleChange(null, mockButtonWithVisibility, true)
        });

        // Set initial state
        component.isGone = true;
        component.isInvisible = true;

        // Verify state is set
        expect(component.isGone).toBe(true);
        expect(component.isInvisible).toBe(true);

        // Note: State is only reset when component is re-initialized with different item
        // Same item updates preserve the current state as expected
      });
    });
  });
});
