import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VisibilityWatcherService } from 'src/app/shared/visibility-watcher.service';
import { mockText } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentTextComponent } from './content-text.component';

describe('ContentTextComponent', () => {
  let component: ContentTextComponent;
  let fixture: ComponentFixture<ContentTextComponent>;
  let pageService: PageService;
  let visibilityWatcherService: VisibilityWatcherService;
  const text = mockText('text cru text \ndps.');

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentTextComponent],
      providers: [
        { provide: PageService, useValue: pageService },
        VisibilityWatcherService
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentTextComponent);
    component = fixture.componentInstance;
    visibilityWatcherService = TestBed.inject(VisibilityWatcherService);
    fixture.detectChanges();
    spyOn(pageService, 'formAction');
  }));

  it('Values are assigned correctly', async () => {
    component.item = text;
    component.ngOnChanges({
      item: new SimpleChange(null, text, true)
    });

    expect(component.text).toEqual(text);
    expect(component.textValue).toEqual('text cru text <br/>dps.');
  });

  describe('Visibility functionality', () => {
    let mockFlowWatcher: any;
    let mockTextWithVisibility: any;

    beforeEach(() => {
      mockFlowWatcher = {
        close: jasmine.createSpy('close')
      };

      mockTextWithVisibility = {
        ...text,
        watchIsGone: jasmine
          .createSpy('watchIsGone')
          .and.returnValue(mockFlowWatcher),
        watchIsInvisible: jasmine
          .createSpy('watchIsInvisible')
          .and.returnValue(mockFlowWatcher)
      };
    });

    it('should initialize visibility state correctly', () => {
      component.item = text;
      component.ngOnChanges({
        item: new SimpleChange(null, text, true)
      });

      expect(component.isGone).toBe(false);
      expect(component.isInvisible).toBe(false);
      expect(component.state).toBeDefined();
    });

    it('should set up visibility watchers on init', () => {
      spyOn(visibilityWatcherService, 'setupVisibilityWatchers');

      component.item = text;
      component.ngOnChanges({
        item: new SimpleChange(null, text, true)
      });

      expect(
        visibilityWatcherService.setupVisibilityWatchers
      ).toHaveBeenCalledWith(text, component);
    });

    it('should clean up watchers on destroy', () => {
      spyOn(visibilityWatcherService, 'cleanupWatchers');

      component.ngOnDestroy();

      expect(visibilityWatcherService.cleanupWatchers).toHaveBeenCalledWith(
        component
      );
    });

    it('should handle gone state for conditional text', () => {
      component.item = mockTextWithVisibility;
      component.ngOnChanges({
        item: new SimpleChange(null, mockTextWithVisibility, true)
      });

      // Simulate text that should be gone based on state
      component.isGone = true;

      expect(visibilityWatcherService.shouldShowElement(component)).toBe(false);
    });

    it('should handle invisible state for conditional text', () => {
      component.item = mockTextWithVisibility;
      component.ngOnChanges({
        item: new SimpleChange(null, mockTextWithVisibility, true)
      });

      // Simulate text that should be invisible but preserve space
      component.isInvisible = true;

      expect(visibilityWatcherService.getVisibilityStyle(component)).toBe(
        'hidden'
      );
    });

    it('should merge visibility styles with existing text styles', () => {
      component.item = mockTextWithVisibility;
      component.ngOnChanges({
        item: new SimpleChange(null, mockTextWithVisibility, true)
      });

      const existingStyles = {
        'font-weight': 'bold',
        'font-size': '1.2rem',
        color: 'blue'
      };
      component.styles = existingStyles;
      component.isInvisible = true;

      const mergedStyles = visibilityWatcherService.getStylesWithVisibility(
        component,
        existingStyles
      );

      expect(mergedStyles).toEqual({
        'font-weight': 'bold',
        'font-size': '1.2rem',
        color: 'blue',
        visibility: 'hidden'
      });
    });

    it('should preserve text formatting when applying visibility', () => {
      const styledText = {
        ...text,
        fontWeight: 'bold',
        textScale: 1.5,
        textAlign: { name: 'center' },
        textStyles: [{ name: 'ITALIC' }]
      } as any; // Type assertion to avoid strict type checking for test

      component.item = styledText;
      component.ngOnChanges({
        item: new SimpleChange(null, styledText, true)
      });

      // Verify styles are preserved
      expect(component.styles['font-weight']).toBe('bold');
      expect(component.styles['font-style']).toBe('italic');
      expect(component.styles['font-size']).toBe('1.5rem');
      expect(component.styles['justify-content']).toBe('center');

      // Verify visibility can be applied on top
      component.isInvisible = true;
      const mergedStyles = visibilityWatcherService.getStylesWithVisibility(
        component,
        component.styles
      );
      expect(mergedStyles['visibility']).toBe('hidden');
      expect(mergedStyles['font-weight']).toBe('bold'); // Original styles preserved
    });

    describe('Template rendering with visibility', () => {
      it('should render paragraph when not gone', () => {
        component.item = text;
        component.ngOnChanges({
          item: new SimpleChange(null, text, true)
        });
        component.isGone = false;

        spyOn(visibilityWatcherService, 'shouldShowElement').and.returnValue(
          true
        );
        spyOn(
          visibilityWatcherService,
          'getStylesWithVisibility'
        ).and.returnValue({
          visibility: 'visible'
        });
        fixture.detectChanges();

        const paragraphElement = fixture.debugElement.query(
          (selector) =>
            selector.nativeElement.tagName === 'P' &&
            selector.nativeElement.classList.contains('textContent')
        );

        expect(paragraphElement).toBeTruthy();
        expect(visibilityWatcherService.shouldShowElement).toHaveBeenCalledWith(
          component
        );
      });

      it('should not render paragraph when gone', () => {
        component.item = text;
        component.ngOnChanges({
          item: new SimpleChange(null, text, true)
        });
        component.isGone = true;

        spyOn(visibilityWatcherService, 'shouldShowElement').and.returnValue(
          false
        );
        fixture.detectChanges();

        const paragraphElement = fixture.debugElement.query(
          (selector) =>
            selector.nativeElement.tagName === 'P' &&
            selector.nativeElement.classList.contains('textContent')
        );

        expect(paragraphElement).toBeFalsy();
      });

      it('should apply merged styles including visibility', () => {
        component.item = text;
        component.ngOnChanges({
          item: new SimpleChange(null, text, true)
        });
        component.isInvisible = true;

        const mergedStyles = {
          'font-size': '1rem',
          visibility: 'hidden'
        };

        spyOn(visibilityWatcherService, 'shouldShowElement').and.returnValue(
          true
        );
        spyOn(
          visibilityWatcherService,
          'getStylesWithVisibility'
        ).and.returnValue(mergedStyles);
        fixture.detectChanges();

        const paragraphElement = fixture.debugElement.query(
          (selector) => selector.nativeElement.tagName === 'P'
        );

        expect(paragraphElement).toBeTruthy();
        expect(paragraphElement.nativeElement.style.visibility).toBe('hidden');
        expect(
          visibilityWatcherService.getStylesWithVisibility
        ).toHaveBeenCalledWith(component, component.styles);
      });
    });
  });
});
