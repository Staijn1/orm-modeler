import {AfterViewInit, ChangeDetectorRef, Component, Input, ViewChild} from '@angular/core';
import {DataSyncService, DiagramComponent, GojsAngularModule} from 'gojs-angular';
import * as go from 'gojs';
import {Diagram} from 'gojs';
import produce from 'immer';
import {CommonModule} from '@angular/common';
import LinkLabelOnPathDraggingTool from "../gojs-extensions/LinkLabelOnPathDraggingTool";
import {State} from "../types/State";
import {Fact} from "../types/ORM";


@Component({
  selector: 'app-orm-editor',
  standalone: true,
  imports: [
    CommonModule,
    GojsAngularModule
  ],
  templateUrl: './orm-editor.component.html',
  styleUrl: './orm-editor.component.scss'
})
export class OrmEditorComponent implements AfterViewInit {
  @ViewChild('myDiagram', {static: true}) public myDiagramComponent!: DiagramComponent;

  // Big object that holds app-level state data
  // As of gojs-angular 2.0, immutability is expected and required of state for ease of change detection.
  // Whenever updating state, immutability must be preserved. It is recommended to use immer for this, a small package that makes working with immutable data easy.
  @Input() public state: undefined | State;

  private diagram!: go.Diagram;


  /**
   * Initialize the diagram and templates
   */
  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    this.diagram = $(go.Diagram, {
      'undoManager.isEnabled': true,
      layout: $(go.ForceDirectedLayout, {defaultSpringLength: 50, defaultElectricalCharge: 50}),
      model: $(go.GraphLinksModel,
        {
          nodeKeyProperty: 'id',
          linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        }
      )
    });

    // install the LinkLabelDraggingTool as a "mouse move" tool
    this.diagram.toolManager.mouseMoveTools.insertAt(0, new LinkLabelOnPathDraggingTool());

    // define the Node template
    this.diagram.nodeTemplate = $(go.Node, 'Spot',
      $(go.Panel, 'Spot',
        $(go.Shape, 'RoundedRectangle',
          {
            stroke: 'blue',
            strokeWidth: 3,
            fill: 'white',
            desiredSize: new go.Size(100, 50)
          }
        ),
        $(go.TextBlock,  // Add this line
          new go.Binding('text', 'text')  // Bind the text property of node data to the TextBlock
        ),
        new go.Binding('visible', 'type', (type: string) => type === 'EntityType')
      ),

      // Binary Fact Type
      $(go.Panel, 'Horizontal',
        $(go.Shape, 'Rectangle',
          {
            stroke: 'black',
            strokeWidth: 2,
            fill: 'white',
            desiredSize: new go.Size(25, 20),
            contextMenu: $("ContextMenu",
              $("ContextMenuButton",
                $(go.TextBlock, "Add uniqueness constraint", {margin: 5}),
                {click: (e: any, obj: any) => this.handleAddUniquenessConstraintClick(e, obj)}
              )
            ),
          },
          new go.Binding('visible', 'type', (type: string) => type === 'BinaryFactType'),
        ),
        $(go.Shape, 'Rectangle',
          {
            stroke: 'black',
            strokeWidth: 2,
            fill: 'white',
            desiredSize: new go.Size(25, 20)
          },
          new go.Binding('visible', 'type', (type: string) => type === 'BinaryFactType'),
        )
      ),
    );

    this.diagram.linkTemplate =
      $(go.Link,
        {
          routing: go.Link.AvoidsNodes,
          corner: 5,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          resegmentable: true,
        },
        $(go.Shape),
        $(go.Shape, {toArrow: "OpenTriangle"}),
        $(go.Panel, "Auto",
          // mark this Panel as being a draggable label, and set default segment props
          {_isLinkLabel: true, segmentIndex: NaN, segmentFraction: .5},
          $(go.Shape, {fill: "white"}),
          $(go.TextBlock, "?", {margin: 3},
            new go.Binding("text", "reading")),
          // remember any modified segment properties in the link data object
          new go.Binding("segmentFraction").makeTwoWay()
        )
      );

    return this.diagram;
  }


  /**
   * When the diagram model changes, update app data to reflect those changes.
   * Be sure to use immer's "produce" function to preserve immutability
   * @param changes the GoJS model changes
   */
  public diagramModelChange = (changes: go.IncrementalData) => {
    if (!changes) return;
    this.state = produce(this.state, (draft: any) => {
      // set skipsDiagramUpdate: true since GoJS already has this update
      // this way, we don't log an unneeded transaction in the Diagram's undoManager history
      draft.skipsDiagramUpdate = true;
      draft.diagramNodeData = DataSyncService.syncNodeData(changes, draft.diagramNodeData, this.observedDiagram?.model);
      draft.diagramLinkData = DataSyncService.syncLinkData(changes, draft.diagramLinkData, (this.observedDiagram?.model as any));
      draft.diagramModelData = DataSyncService.syncModelData(changes, draft.diagramModelData);
      // If one of the modified nodes was the selected node used by the inspector, update the inspector selectedNodeData object
      const modifiedNodeDatas = changes.modifiedNodeData;
      if (modifiedNodeDatas && draft.selectedNodeData) {
        for (const modifiedNodeData of modifiedNodeDatas) {
          const nodeKeyProperty = this.myDiagramComponent.diagram.model.nodeKeyProperty as string;
          if (modifiedNodeData[nodeKeyProperty] === draft.selectedNodeData[nodeKeyProperty]) {
            draft.selectedNodeData = modifiedNodeData;
          }
        }
      }
    });
  }

  public initPalette(): go.Palette {
    const $ = go.GraphObject.make;
    const palette = $(go.Palette);

    // define the Node template
    palette.nodeTemplate = $(go.Node, 'Spot',
      $(go.Shape, 'RoundedRectangle',
        {
          stroke: 'blue',
          strokeWidth: 3,
          fill: 'white',
          desiredSize: new go.Size(100, 50)
        },
        new go.Binding('figure', 'type', (type: string) => type === 'EntityType' ? 'RoundedRectangle' : 'Circle'),
      ),
      $(go.TextBlock,  // Add this line
        new go.Binding('text', 'text')  // Bind the text property of node data to the TextBlock
      )
    )

    palette.model = $(go.GraphLinksModel);
    return palette;
  }

  constructor(private cdr: ChangeDetectorRef) {
  }

  public initOverview(): go.Overview {
    const $ = go.GraphObject.make;
    return $(go.Overview);
  }

  public observedDiagram!: Diagram;

  // currently selected node; for inspector
  public selectedNodeData: go.ObjectData | null = null;

  public ngAfterViewInit() {
    if (this.observedDiagram) return;
    this.observedDiagram = this.myDiagramComponent.diagram;
    this.cdr.detectChanges(); // IMPORTANT: without this, Angular will throw ExpressionChangedAfterItHasBeenCheckedError (dev mode only)

    // listener for inspector
    this.myDiagramComponent.diagram.addDiagramListener('ChangedSelection', e => {
      if (e.diagram.selection.count === 0) {
        this.selectedNodeData = null;
      }
      const node = e.diagram.selection.first();
      this.state = produce(this.state, (draft: any) => {
        if (node instanceof go.Node) {
          const idx = draft.diagramNodeData.findIndex((nd: any) => nd.id == node.data.id);
          draft.selectedNodeData = draft.diagramNodeData[idx];
        } else {
          draft.selectedNodeData = null;
        }
      });
    });
  }

  private handleAddUniquenessConstraintClick(e: any, obj: any) {
  };


  public updateFact(fact: Fact) {

  }
}
