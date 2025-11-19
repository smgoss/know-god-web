import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {
  Content,
  FlowWatcher,
  Paragraph
} from 'src/app/services/xml-parser-service/xml-parser.service';
import {
  VisibilityWatcherComponent,
  VisibilityWatcherService
} from 'src/app/shared/visibility-watcher.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-paragraph',
  templateUrl: './content-paragraph.component.html',
  styleUrls: ['./content-paragraph.component.css']
})
export class ContentParagraphComponent
  implements OnChanges, OnDestroy, VisibilityWatcherComponent
{
  @Input() item: Paragraph;

  paragraph: Paragraph;
  ready: boolean;
  items: Array<Content>;

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
              this.items = [];
              this.paragraph = this.item;
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

  private init(): void {
    // Set up visibility watchers using the service
    this.visibilityWatcherService.setupVisibilityWatchers(this.paragraph, this);

    this.items = this.paragraph.content;
    this.ready = true;
  }
}
