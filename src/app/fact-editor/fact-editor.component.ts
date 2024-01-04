import {Component, ElementRef, ViewChild} from '@angular/core';
import {HighlightJS, HighlightLoader, HighlightModule} from "ngx-highlightjs";
import {FormsModule} from "@angular/forms";
import {JsonPipe} from "@angular/common";
import {Language, Mode} from "highlight.js";

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
  @ViewChild('editor') editor!: ElementRef<HTMLElement>;

  fact = `"MOCReferenceAttribute(.id) has Value()", "ReferenceAttributeValue(.id) is active YesNo()", "ReferenceAttributeValue(.id) is from dwh YesNo()"`;

  constructor(private hljsLoader: HighlightLoader, private readonly hljsService: HighlightJS) {
    this.hljsLoader.ready.subscribe(() => {
      this.hljsService.hljs!.registerLanguage('orm', () => {
        const IDENTIFIER: Mode = {
          className: 'identifier',
          begin: '\\.[A-Za-z]+',
          relevance: 10
        };

        const ENTITY_NAME: Mode = {
          className: 'entity-name',
          begin: '\\b[A-Z][A-Za-z]*',
          relevance: 10
        };

        const READING: Mode = {
          className: 'reading',
          begin: '\\b[a-z]+\\b',
          relevance: 10
        };

        const language: Language = {
          contains: [ENTITY_NAME, IDENTIFIER, READING],
          name: 'orm',
          case_insensitive: false
        };

        return language;
      });
    })
  }

  onInput($event: Event) {
    this.fact = ($event.target as HTMLInputElement).value;
  }
}
