/**
 * Created by Holger Stitz on 18.01.2017.
 */
var Config = /** @class */ (function () {
    function Config() {
    }
    Config.curvedLines = true;
    Config.vertOrientation = true;
    Config.collapseParents = true;
    Config.showLifeLines = false;
    Config.showAgeLabels = false;
    Config.glyphSize = 8;
    Config.hiddenGlyphSize = 4;
    Config.spaceBetweenGenerations = 4;
    Config.svgHeight = 600;
    Config.margin = {
        axisTop: 80,
        top: 10,
        right: 10,
        bottom: 60,
        left: 40
    };
    Config.panelAttributeWidth = 300;
    Config.panelAttributeHeight = 100;
    Config.panelSVGwidth = 220;
    Config.collapseSlopeChartWidth = 45;
    Config.slopeChartWidth = 150;
    Config.rowHeight = Config.glyphSize * 2.5 - 4;
    Config.expPanelWidth = '300px';
    Config.colGraphTableWidth = '100%';
    Config.colPanelWidth = '30px';
    Config.expGraphTableWidth = '100%';
    Config.legendHeight = 150;
    return Config;
}());
export { Config };
//# sourceMappingURL=config.js.map