import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  Button,
  EventId,
  FlowWatcher
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { formatEvents } from 'src/app/shared/formatEvents';
import {
  VisibilityWatcherComponent,
  VisibilityWatcherService
} from 'src/app/shared/visibility-watcher.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-button',
  templateUrl: './content-button.component.html',
  styleUrls: ['./content-button.component.css']
})
export class ContentButtonComponent
  implements OnChanges, OnDestroy, VisibilityWatcherComponent
{
  @Input() item: Button;

  button: Button;
  text: any;
  ready: boolean;
  buttonText: string;
  type: string;
  events: EventId[];
  url: string;
  buttonTextColor: string;
  buttonBgColor: string;
  dir$: Observable<string>;

  // Visibility state management (implements VisibilityWatcherComponent)
  state: any;
  isGone: boolean = false;
  isInvisible: boolean = false;
  isGoneWatcher?: FlowWatcher;
  isInvisibleWatcher?: FlowWatcher;

  constructor(
    private pageService: PageService,
    public visibilityWatcherService: VisibilityWatcherService
  ) {
    this.dir$ = this.pageService.pageDir$;
    this.state = this.pageService.parserState();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'item': {
            if (
              !changes['item'].previousValue ||
              changes['item'].currentValue !== changes['item'].previousValue
            ) {
              this.ready = false;
              this.buttonText = '';
              this.type = '';
              this.events = [] as EventId[];
              this.url = '';
              this.text = null;
              this.button = this.item;
              this.buttonTextColor = '';
              this.buttonBgColor = '';
              this.init();
            }
          }
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.visibilityWatcherService.cleanupWatchers(this);
  }

  formAction(): void {
    if (this.events && this.type === 'event') {
      this.pageService.formAction(formatEvents(this.events));
    }
  }

  private init(): void {
    // Set up visibility watchers using the service
    this.visibilityWatcherService.setupVisibilityWatchers(this.button, this);

    // TODO Allow Button styles when Books are ready
    // this.buttonTextColor = this.button.buttonColor || ''
    // this.buttonBgColor = this.button.backgroundColor || ''
    if (this.button.text) {
      this.text = this.button.text;
      this.buttonText = this.text?.text || '';
    }
    const isUrlType = !!this.button.url;
    const isEventType = !!this.button.events?.length;

    if (isUrlType) {
      this.type = 'url';
      this.url = this.button.url;
    }
    if (isEventType) {
      this.type = 'event';
      this.events = this.button.events;
    }
    this.ready = true;
  }
}
