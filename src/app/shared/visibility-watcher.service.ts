import { Injectable } from '@angular/core';
import { FlowWatcher } from 'src/app/services/xml-parser-service/xml-parser.service';

/**
 * Interface for content items that support visibility watchers
 */
export interface VisibilityWatchable {
  watchIsGone?: (state: any, callback: (value: boolean) => void) => FlowWatcher;
  watchIsInvisible?: (
    state: any,
    callback: (value: boolean) => void
  ) => FlowWatcher;
}

/**
 * Interface for components that implement visibility watching
 */
export interface VisibilityWatcherComponent {
  state: any;
  isGone: boolean;
  isInvisible: boolean;
  isGoneWatcher?: FlowWatcher;
  isInvisibleWatcher?: FlowWatcher;
}

/**
 * Service to manage visibility watchers for content components
 * Handles both gone-if (removes from layout) and invisible-if (hides but keeps space) conditions
 */
@Injectable({
  providedIn: 'root'
})
export class VisibilityWatcherService {
  /**
   * Sets up visibility watchers for a content item
   * @param item - The content item that may have visibility conditions
   * @param component - The component that will track visibility state
   */
  setupVisibilityWatchers(
    item: VisibilityWatchable,
    component: VisibilityWatcherComponent
  ): void {
    // Clean up existing watchers first
    this.cleanupWatchers(component);

    // Set up gone-if watcher (removes element from layout entirely)
    if (item.watchIsGone) {
      component.isGoneWatcher = item.watchIsGone(
        component.state,
        (value) => (component.isGone = value)
      );
    }

    // Set up invisible-if watcher (hides element but keeps space)
    if (item.watchIsInvisible) {
      component.isInvisibleWatcher = item.watchIsInvisible(
        component.state,
        (value) => (component.isInvisible = value)
      );
    }
  }

  /**
   * Cleans up existing visibility watchers
   * @param component - The component whose watchers should be cleaned up
   */
  cleanupWatchers(component: VisibilityWatcherComponent): void {
    if (component.isGoneWatcher) {
      component.isGoneWatcher.close();
      component.isGoneWatcher = undefined;
    }
    if (component.isInvisibleWatcher) {
      component.isInvisibleWatcher.close();
      component.isInvisibleWatcher = undefined;
    }
  }

  /**
   * Determines if an element should be shown based on visibility state
   * @param component - The component with visibility state
   * @returns true if the element should be shown, false if it should be hidden (gone)
   */
  shouldShowElement(component: VisibilityWatcherComponent): boolean {
    return !component.isGone;
  }

  /**
   * Gets the visibility CSS style for an element
   * @param component - The component with visibility state
   * @returns CSS visibility value ('hidden' or 'visible')
   */
  getVisibilityStyle(component: VisibilityWatcherComponent): string {
    return component.isInvisible ? 'hidden' : 'visible';
  }

  /**
   * Gets the complete style object including visibility
   * @param component - The component with visibility state
   * @param existingStyles - Any existing styles to merge with
   * @returns Combined style object with visibility
   */
  getStylesWithVisibility(
    component: VisibilityWatcherComponent,
    existingStyles: any = {}
  ): any {
    return {
      ...existingStyles,
      visibility: this.getVisibilityStyle(component)
    };
  }
}
