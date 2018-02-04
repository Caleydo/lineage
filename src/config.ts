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
        top: 10,
        right: 10,
        bottom: 60,
        left: 40
    };

  public static icons = {
      Gene:'\uf074',
      Compound:'\uf1e0', //\uf1d5
      Pathway:'\uf18b',
      Movie:'\uf008',
      Actor:'\uf007',
      Episode:'\uf008',
      Character:'\uf007',
      House:'\uf1d0'
  };

  public static colors = {
    Gene:'#B0CACF',
    Compound:'#CFA399',
    Pathway:'#9DBBAE',
    Movie:'#B0CACF',
    Actor:'#9DBBAE',
    Episode:'#B0CACF',
    Character:'#9DBBAE',
    House:'#CFA399'
};

  public static panelAttributeWidth = 300;
  public static panelAttributeHeight = 100;
  public static panelSVGwidth = 220;

  public static collapseSlopeChartWidth = 45;
  public static slopeChartWidth = 150;

  public static rowHeight = Config.glyphSize * 2.5 - 4;


  public static expPanelWidth = '300px';
  public static colGraphTableWidth = '100%';

  public static colPanelWidth = '30px';
  public static expGraphTableWidth = '100%';

  public static legendHeight = 150;


}
