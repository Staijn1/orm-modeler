import {AfterViewInit, ChangeDetectorRef, Component, Input, ViewChild} from '@angular/core';
import {DataSyncService, DiagramComponent, GojsAngularModule} from 'gojs-angular';
import * as go from 'gojs';
import {Diagram, GraphObject, Link, Margin, Node} from 'gojs';
import produce from 'immer';
import {CommonModule} from '@angular/common';
import {State} from '../types/State';
import {EntityType, Fact} from '../types/ORM';


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

  constructor(private cdr: ChangeDetectorRef) {
    // Fix scoping issues
    this.initDiagram = this.initDiagram.bind(this);
    this.initPalette = this.initPalette.bind(this);
  }

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

    this.diagram.nodeTemplateMap = this.createTemplateMap();
    this.diagram.toolManager.linkingTool.linkValidation = this.validateLink;
    this.diagram.toolManager.relinkingTool.linkValidation = this.validateLink;
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
    palette.model = $(go.GraphLinksModel);
    palette.nodeTemplateMap = this.createTemplateMap();
    return palette;
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

  private createTemplateMap(): go.Map<string, go.Node> {
    const nodeTemplateMap = new go.Map<string, go.Node>();

    const entityTypeTemplate = this.createEntityTypeTemplate();
    nodeTemplateMap.add('EntityType', entityTypeTemplate);

    const binaryFactTypeTemplate = this.createBinaryFactTypeTemplate();
    nodeTemplateMap.add('BinaryFactType', binaryFactTypeTemplate);

    const valueTypeTemplate = this.createValueTypeTemplate();
    nodeTemplateMap.add('ValueType', valueTypeTemplate);

    return nodeTemplateMap;
  }

  private createEntityTypeTemplate() {
    const $ = go.GraphObject.make;
    return $(go.Node, 'Spot',
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
      ),
    );
  }

  private createBinaryFactTypeTemplate() {
    const $ = go.GraphObject.make;
    return $(go.Node, 'Spot',
      $(go.Panel, 'Vertical',  // Change this to 'Vertical'
        $(go.Panel, 'Horizontal',
          $(go.Shape, 'Rectangle',
            {
              stroke: 'black',
              strokeWidth: 2,
              fill: 'white',
              desiredSize: new go.Size(25, 20),
              contextMenu: $('ContextMenu',
                $('ContextMenuButton',
                  $(go.TextBlock, 'Add uniqueness constraint', {margin: 5}),
                  {click: (e: any, obj: any) => this.handleAddUniquenessConstraintClick(e, obj)}
                )
              ),
            },
          ),
          $(go.Shape, 'Rectangle',
            {
              stroke: 'black',
              strokeWidth: 2,
              fill: 'white',
              desiredSize: new go.Size(25, 20)
            },
          ),
        ),
        $(go.TextBlock,
          new go.Binding('text', 'readings'),
          {
            margin: new Margin(5, 0, 0, 0),
            font: '14px sans-serif', // This will change the font size to 14px and make it bold, same as EntityType
          },
        )
      ),
    );
  }

  private createValueTypeTemplate() {
    const $ = go.GraphObject.make;
    return $(go.Node, 'Spot',
      $(go.Panel, 'Spot',
        $(go.Shape, 'RoundedRectangle',
          {
            stroke: 'blue',
            strokeWidth: 3,
            strokeDashArray: [4, 2], // Add this line for dashed border
            fill: 'white',
            desiredSize: new go.Size(100, 50)
          }
        ),
        $(go.TextBlock,
          new go.Binding('text', 'text')
        ),
      ),
    );
  }

  /**
   * Handle a fact creation or update
   * If the fact is new, add it to the diagram, otherwise update the related links
   * todo: handle update
   * @param fact
   */
  public updateFact(fact: Fact) {
    const entityTypeNode = {
      id: this.generateRandomId(),
      text: fact.EntityType.Name,
      category: 'EntityType'
    }

    // If the TargetType does not have an identifier, it is a ValueType, otherwise it is an EntityType
    const targetType = (fact.Target as EntityType).Identifier ? 'EntityType' : 'ValueType';

    // Create a new node for the EntityType or ValueType
    const targetNode = {
      id: Math.random().toString(),
      text: fact.Target.Name,
      category: targetType
    }

    // Create a new BinaryFactType node with the Readings from the fact object
    const binaryFactTypeNode = {
      id: this.generateRandomId(),
      readings: fact.Readings,
      text: fact.Readings.join('/'),
      category: 'BinaryFactType'
    }

    this.diagram.model.addNodeData(entityTypeNode);
    this.diagram.model.addNodeData(targetNode);
    this.diagram.model.addNodeData(binaryFactTypeNode);
    // Create links between the EntityType or ValueType node and the BinaryFactType node
    const linkFromEntityType = {
      key: this.generateRandomId(),
      from: entityTypeNode.id,
      to: binaryFactTypeNode.id
    };

    const linkFromBinaryFactType = {
      key: this.generateRandomId(),
      from: binaryFactTypeNode.id,
      to: targetNode.id
    };

    // Add the links to the diagram
    (this.diagram.model as go.GraphLinksModel).addLinkDataCollection([linkFromEntityType, linkFromBinaryFactType]);
    this.diagram.layoutDiagram(true)
  }

  private generateRandomId() {
    return Math.random().toString();
  }

  private validateLink(fromNode: Node, fromPort: GraphObject, toNode: Node, toPort: GraphObject, link: Link) {
    // A link cannot connect to itself
    if (fromNode === toNode) return false;

    // Only BinaryFactType nodes can be connected to EntityType or ValueType nodes
    return fromNode.category === 'BinaryFactType';
  }
}
