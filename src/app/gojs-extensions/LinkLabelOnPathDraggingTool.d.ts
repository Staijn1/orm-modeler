declare class LinkLabelOnPathDraggingTool extends go.Tool {
  constructor();
  label: go.GraphObject | null;
  _originalFraction: number | null;
  canStart(): boolean;
  findLabel(): go.GraphObject | null;
  doActivate(): void;
  doDeactivate(): void;
  doStop(): void;
  doCancel(): void;
  doMouseMove(): void;
  doMouseUp(): void;
  updateSegmentOffset(): void;
}

export = LinkLabelOnPathDraggingTool;
