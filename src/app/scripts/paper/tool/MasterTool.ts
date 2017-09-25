import { ToolMode } from 'app/model/paper';
import { PaperService } from 'app/services';
import * as paper from 'paper';

import { GestureTool } from './GestureTool';
import { Tool } from './Tool';
import { ZoomPanTool } from './ZoomPanTool';

/**
 * The master tool that is in charge of dispatching mouse, key,
 * and toolmode change events.
 */
export class MasterTool {
  private readonly paperTool = new paper.Tool();

  constructor(private readonly ps: PaperService) {
    const gestureTool = new GestureTool(ps);
    const zoomPanTool = new ZoomPanTool(ps);
    let currentTool: Tool;

    // TODO: react immediately to toolmode changes as well?
    const onEventFn = (event?: paper.ToolEvent | paper.KeyEvent) => {
      const prevTool = currentTool;
      currentTool =
        ps.getToolMode() === ToolMode.ZoomPan || (event && event.modifiers.space)
          ? zoomPanTool
          : gestureTool;
      if (prevTool !== currentTool) {
        if (prevTool) {
          prevTool.onDeactivate();
        }
        if (currentTool) {
          currentTool.onActivate();
        }
      }
      if (currentTool) {
        if (event instanceof paper.ToolEvent) {
          currentTool.onMouseEvent(event);
        } else if (event instanceof paper.KeyEvent) {
          currentTool.onKeyEvent(event);
        }
      }
    };

    this.paperTool.on({
      mousedown: onEventFn,
      mousedrag: onEventFn,
      mousemove: onEventFn,
      mouseup: onEventFn,
      keydown: onEventFn,
      keyup: onEventFn,
    });
  }

  setToolMode(toolMode: ToolMode) {
    // TODO: clean this fixed distance code up?
    this.paperTool.fixedDistance = toolMode === ToolMode.Pencil ? 4 : undefined;
  }
}
