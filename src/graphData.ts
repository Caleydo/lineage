/**
 * Created by Carolina Nobre on 01.22.2017
 */

/**
 * Class that represents the genealogy data
 */
class graphData {

  public data;
    // = [
    // {'id': 1, 'name': 'A', 'sex': 'M', 'dob':1982},
    // {'id': 2, 'name': 'B', 'sex': 'M', 'dob':1984},
    // {'id': 3, 'name': 'C', 'sex': 'M', 'dob':1986},
    // {'id': 4, 'name': 'D', 'sex': 'M','dob':1988},
    // {'id': 5, 'name': 'E', 'sex': 'M', 'dob':1956},
    // {'id': 6, 'name': 'F', 'sex': 'F', 'dob':1958}];


  constructor(data) {

    this.data = data;
    //Initially set all nodes to visible and of type 'single' (vs aggregate)
    this.data.forEach(function(d)
    {
      // d['index'] = d.id;
      d['type']  = 'single';
      d['visible']=true;
      d['bdate']=+d['bdate'];

    });
  }


  /**
   * Restores the order of the nodes to the original sorting
   */
  private restoreOrder() {
    this.data.forEach(function(d)
    {
      d['index'] = d.id;
    });
  }

  /**
   * Aggregates Nodes
   */
  public aggregateNodes(ind1,ind2) {
    let collapseCols = ind2 - ind1 -1;
    let collapsed = [];
    this.data.forEach(function(d)
    {
      if (d.id <= ind2 && d.id >=ind1){
        d['visible'] = 'false';
        collapsed.push(d);
      }
      if (d.id >ind2){
        d['index'] = d['index'] - collapseCols;
      }
    });

    let aggregateNode =  {
      'id': 1,
      'name': 'A',
      'sex': 'F',
      'dob':undefined
    }

    this.data.push(aggregateNode)

    aggregateNode['index'] = ind1;
    aggregateNode['collapsed'] = collapsed;
    aggregateNode['type']= 'aggregate';
    aggregateNode['visible']=true;
  };

};



/**
 * Method to create a new graphData instance
 * @param data
 * @returns {graphData}
 */
export function create(data) {
  return new graphData(data);
}


