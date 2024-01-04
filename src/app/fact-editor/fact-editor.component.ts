import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {HighlightJS, HighlightLoader, HighlightModule} from "ngx-highlightjs";
import {FormsModule} from "@angular/forms";
import {JsonPipe} from "@angular/common";
import {Language, Mode} from "highlight.js";
import {Fact} from "../types/ORM";

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
  @Output() createdFact = new EventEmitter<Fact>();
  @Input() fact = '';

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

  private createFact() {
    const identifiersElements = this.editor.nativeElement.querySelectorAll('.hljs-identifier');
    const entityNamesElements = this.editor.nativeElement.querySelectorAll('.hljs-entity-name');
    const readingsElements = this.editor.nativeElement.querySelectorAll('.hljs-reading');

    if (identifiersElements.length !== 1) throw new Error('Expected exactly one identifier in the Entity Type');
    if (entityNamesElements.length !== 2) throw new Error('Expected exactly two type names in the fact');
    // todo?
    if (readingsElements.length !== 1) throw new Error('Non-binary facts are not supported yet');

    const entityTypeName = Array.from(entityNamesElements, el => el.textContent)[0] ?? '';
    const entityTypeIdentifierName = Array.from(identifiersElements, el => el.textContent)[0] ?? '';
    // todo detect based on identifier name
    const entityTypeIdentifierDatatype = 'number';
    const rawReading = Array.from(readingsElements, el => el.textContent)[0] ?? '';
    const readings = rawReading.split('/');
    const targetTypeName = Array.from(entityNamesElements, el => el.textContent)[1] ?? '';


    const fact: Fact = {
      EntityType: {
        Name: entityTypeName,
        Identifier: {
          Name: entityTypeIdentifierName,
          Datatype: entityTypeIdentifierDatatype
        }
      },
      Readings: readings,
      Target: {
        Name: targetTypeName,
        Datatype: undefined
      }
    };

    this.createdFact.emit(fact);
  }

  onTyping($event: KeyboardEvent) {
    if ($event.key === 'Enter') {
      $event.preventDefault();
      this.createFact();
    }
    this.fact = ($event.target as HTMLInputElement).value;
  }
}


