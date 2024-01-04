import {Component} from '@angular/core';
import {HighlightAutoResult, HighlightJS, HighlightLoader, HighlightModule} from "ngx-highlightjs";
import {FormsModule} from "@angular/forms";
import {JsonPipe} from "@angular/common";
import {Language} from "highlight.js";

@Component({
  selector: 'app-fact-editor',
  standalone: true,
  imports: [
    HighlightModule,
    FormsModule,
    JsonPipe
  ],
  templateUrl: './fact-editor.component.html',
  styleUrl: './fact-editor.component.scss'
})
export class FactEditorComponent {
  fact = 'for foo bar';

  response!: HighlightAutoResult;


  constructor(private hljsLoader: HighlightLoader, private readonly hljsService: HighlightJS) {
    this.hljsLoader.ready.subscribe(() => {
      this.hljsService.hljs!.registerLanguage('orm', () => {
        const language: Language = {
          keywords: 'foo bar',
          contains: [
            {
              className: 'test',
              begin: 'for',
              end: ' '
            }
          ],
          name: 'orm'
        }
        return language;
      });
    })
  }

  onHighlight(e: HighlightAutoResult) {
    this.response = e
  }

  onInput($event: Event) {
    this.fact = ($event.target as HTMLInputElement).value;
    this.hljsService.highlight(this.fact, {language: 'orm', ignoreIllegals: true}).subscribe(e => this.response = e)
  }
}
