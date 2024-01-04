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
      {id: 'Principal', text: 'Principal', category: 'EntityType'},
      {id: 'Element', text: 'Element', category: 'EntityType'},
      {id: 'SubElement', text: 'SubElement', category: 'EntityType'},
      {id: 'BinaryFactType', text: 'SubElement', category: 'BinaryFactType', readings: ['has']},
    ],
    diagramLinkData: [
      {key: -1, from: 'Principal', to: 'Element'},
      {key: -2, from: 'Element', to: 'SubElement'},
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
