import {Component, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {OrmEditorComponent} from "./orm-editor/orm-editor.component";
import {State} from "./types/State";
import {FactEditorComponent} from "./fact-editor/fact-editor.component";
import {Fact} from "./types/ORM";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, OrmEditorComponent, FactEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild(OrmEditorComponent) ormEditor!: OrmEditorComponent;

  state: State = {
    diagramNodeData: [
      {id: 1, text: 'Principal', category: 'EntityType'},
      {id: 2, text: 'Name', category: 'ValueType'},
      {id: 3, category: 'BinaryFactType', readings: ['has']},
    ],
    diagramLinkData: [
      {key: -1, from: 1, to: 3},
      {key: -2, from: 3, to: 2},
    ],
    diagramModelData: {prop: 'value'},
    skipsDiagramUpdate: false,

    // Palette state props
    paletteNodeData: [
      {key: 'EntityType', category: 'EntityType', text: "Entity Type"},
      {key: 'BinaryFactType', category: 'BinaryFactType', text: "Binary Fact Type"},
    ],
    paletteModelData: {prop: 'val'}
  };

  onFactUpdated(fact: Fact) {
    this.ormEditor.updateFact(fact);
  }
}
