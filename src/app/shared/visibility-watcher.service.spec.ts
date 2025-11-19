import { TestBed } from '@angular/core/testing';
import { FlowWatcher } from 'src/app/services/xml-parser-service/xml-parser.service';
import {
  VisibilityWatchable,
  VisibilityWatcherComponent,
  VisibilityWatcherService
} from './visibility-watcher.service';

describe('VisibilityWatcherService', () => {
  let service: VisibilityWatcherService;
  let mockWatchable: VisibilityWatchable;
  let mockComponent: VisibilityWatcherComponent;
  let mockFlowWatcher: FlowWatcher;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisibilityWatcherService);

    // Mock FlowWatcher
    mockFlowWatcher = {
      close: jasmine.createSpy('close')
    } as any;

    // Mock VisibilityWatchable
    mockWatchable = {
      watchIsGone: jasmine
        .createSpy('watchIsGone')
        .and.returnValue(mockFlowWatcher),
      watchIsInvisible: jasmine
        .createSpy('watchIsInvisible')
        .and.returnValue(mockFlowWatcher)
    };

    // Mock VisibilityWatcherComponent
    mockComponent = {
      state: { someState: 'value' },
      isGone: false,
      isInvisible: false,
      isGoneWatcher: undefined,
      isInvisibleWatcher: undefined
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setupVisibilityWatchers', () => {
    it('should set up gone watcher when watchIsGone is available', () => {
      service.setupVisibilityWatchers(mockWatchable, mockComponent);

      expect(mockWatchable.watchIsGone).toHaveBeenCalledWith(
        mockComponent.state,
        jasmine.any(Function)
      );
      expect(mockComponent.isGoneWatcher).toBe(mockFlowWatcher);
    });

    it('should set up invisible watcher when watchIsInvisible is available', () => {
      service.setupVisibilityWatchers(mockWatchable, mockComponent);

      expect(mockWatchable.watchIsInvisible).toHaveBeenCalledWith(
        mockComponent.state,
        jasmine.any(Function)
      );
      expect(mockComponent.isInvisibleWatcher).toBe(mockFlowWatcher);
    });

    it('should call gone callback when watcher triggers', () => {
      service.setupVisibilityWatchers(mockWatchable, mockComponent);

      // Get the callback that was passed to watchIsGone
      const goneCallback = (
        mockWatchable.watchIsGone as jasmine.Spy
      ).calls.argsFor(0)[1];

      // Trigger the callback
      goneCallback(true);

      expect(mockComponent.isGone).toBe(true);
    });

    it('should call invisible callback when watcher triggers', () => {
      service.setupVisibilityWatchers(mockWatchable, mockComponent);

      // Get the callback that was passed to watchIsInvisible
      const invisibleCallback = (
        mockWatchable.watchIsInvisible as jasmine.Spy
      ).calls.argsFor(0)[1];

      // Trigger the callback
      invisibleCallback(true);

      expect(mockComponent.isInvisible).toBe(true);
    });

    it('should clean up existing watchers before setting up new ones', () => {
      const existingGoneWatcher = { close: jasmine.createSpy('close') } as any;
      const existingInvisibleWatcher = {
        close: jasmine.createSpy('close')
      } as any;

      mockComponent.isGoneWatcher = existingGoneWatcher;
      mockComponent.isInvisibleWatcher = existingInvisibleWatcher;

      service.setupVisibilityWatchers(mockWatchable, mockComponent);

      expect(existingGoneWatcher.close).toHaveBeenCalled();
      expect(existingInvisibleWatcher.close).toHaveBeenCalled();
    });
  });

  describe('cleanupWatchers', () => {
    it('should close and clear gone watcher', () => {
      mockComponent.isGoneWatcher = mockFlowWatcher;

      service.cleanupWatchers(mockComponent);

      expect(mockFlowWatcher.close).toHaveBeenCalled();
      expect(mockComponent.isGoneWatcher).toBeUndefined();
    });

    it('should close and clear invisible watcher', () => {
      mockComponent.isInvisibleWatcher = mockFlowWatcher;

      service.cleanupWatchers(mockComponent);

      expect(mockFlowWatcher.close).toHaveBeenCalled();
      expect(mockComponent.isInvisibleWatcher).toBeUndefined();
    });

    it('should handle undefined watchers gracefully', () => {
      mockComponent.isGoneWatcher = undefined;
      mockComponent.isInvisibleWatcher = undefined;

      expect(() => service.cleanupWatchers(mockComponent)).not.toThrow();
    });
  });

  describe('shouldShowElement', () => {
    it('should return true when element is not gone', () => {
      mockComponent.isGone = false;
      expect(service.shouldShowElement(mockComponent)).toBe(true);
    });

    it('should return false when element is gone', () => {
      mockComponent.isGone = true;
      expect(service.shouldShowElement(mockComponent)).toBe(false);
    });
  });

  describe('getVisibilityStyle', () => {
    it('should return "visible" when element is not invisible', () => {
      mockComponent.isInvisible = false;
      expect(service.getVisibilityStyle(mockComponent)).toBe('visible');
    });

    it('should return "hidden" when element is invisible', () => {
      mockComponent.isInvisible = true;
      expect(service.getVisibilityStyle(mockComponent)).toBe('hidden');
    });
  });

  describe('getStylesWithVisibility', () => {
    it('should merge existing styles with visibility', () => {
      mockComponent.isInvisible = true;
      const existingStyles = { color: 'red', fontSize: '16px' };

      const result = service.getStylesWithVisibility(
        mockComponent,
        existingStyles
      );

      expect(result).toEqual({
        color: 'red',
        fontSize: '16px',
        visibility: 'hidden'
      });
    });

    it('should work with empty existing styles', () => {
      mockComponent.isInvisible = false;

      const result = service.getStylesWithVisibility(mockComponent);

      expect(result).toEqual({
        visibility: 'visible'
      });
    });
  });
});
