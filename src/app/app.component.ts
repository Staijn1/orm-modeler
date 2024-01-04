import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {OrmEditorComponent} from "./orm-editor/orm-editor.component";
import {State} from "./types/State";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, OrmEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  state: State = {
    diagramNodeData: [
      {id: 'Principal', text: 'Principal', type: 'EntityType'},
      {id: 'Element', text: 'Element', type: 'EntityType'},
      {id: 'SubElement', text: 'SubElement', type: 'EntityType'},
      {id: 'BinaryFactType', text: 'SubElement', type: 'BinaryFactType'}
    ],
    diagramLinkData: [
      {key: -1, from: 'Principal', to: 'Element', reading: ['has']},
      {key: -2, from: 'Element', to: 'SubElement', reading: ['has']},
    ],
    diagramModelData: {prop: 'value'},
    skipsDiagramUpdate: false,

    // Palette state props
    paletteNodeData: [
      {key: 'EntityType', type: 'EntityType', text: "Entity Type"},
      {key: 'BinaryFactType', type: 'BinaryFactType', text: "Binary Fact Type"},
    ],
    paletteModelData: {prop: 'val'}
  };
}
