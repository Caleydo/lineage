/**
 * Created by Holger Stitz on 18.01.2017.
 */

export class Config {
  public static curvedLines = true;
  public static vertOrientation = true;
  public static collapseParents = true;
  public static showLifeLines = false;
  public static showAgeLabels = false;

  public static glyphSize = 8;
  public static hiddenGlyphSize = 4;
  public static spaceBetweenGenerations = 4;

  public static svgHeight = 600;
  public static margin = {
        axisTop: 80,
        top: 170,
        right: 0,
        bottom: 60,
        left: 40
    };

  public static panelAttributeWidth = 300;
  public static panelAttributeHeight = 100;
  public static panelSVGwidth = 220;

  public static collapseSlopeChartWidth = 30;
  public static slopeChartWidth = 200;

  public static rowHeight = Config.glyphSize * 2.5 - 4;


  public static expPanelWidth = '300px';
  public static colGraphTableWidth = '100%';

  public static colPanelWidth = '30px';
  public static expGraphTableWidth = '100%';

  public static legendHeight = 150;

}
