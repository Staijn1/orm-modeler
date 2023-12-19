import * as go from "gojs";

export type State = {
  diagramNodeData: Array<go.ObjectData>;
  diagramLinkData: Array<go.ObjectData>;
  diagramModelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  paletteNodeData: Array<go.ObjectData>;
  paletteModelData: go.ObjectData;
};
