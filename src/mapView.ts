import { select, selection, selectAll, mouse, event } from 'd3-selection';
import { format } from 'd3-format';
import { scaleLinear, scaleOrdinal, schemeCategory20c } from 'd3-scale';
import { max, min, mean } from 'd3-array';
class MapView{
    init(){
      this.initUtil();
    }

    initUtil(){
      select('.navbar-collapse')
          .append('ul').attr('class', 'nav navbar-nav navbar-left').attr('id', 'Toggle Tree')
          .append('li')
          .append('a')
          .attr('class', 'btn-link')
          .attr('role', 'button')
          .html('Show/Hide Map')
          .on('click',d=>{
            let map_component = document.getElementById('col4')
            if (map_component.style.display === 'none'){
              map_component.style.display = 'block';
            } else{
              map_component.style.display = 'none';
            }})
    }
    deleteHighlight(){

    }

    draw(){

    }

}
export function create(){
    return new MapView();
}
