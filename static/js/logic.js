

let map = L.map("map", {
    center: [24.0, -102.145],
    zoom: 4
  })

  L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
    .addTo(map)


let dropdownMenu = d3.select("#selDataset") 


d3.json('static/js/Grouped_data.json').then(data => {console.log(data)

//////////////////////////////////////////////////////////////
      let groupedData = d3.groups(data, d => d.unidad)

      let uniqueValues = groupedData.map(function(d) {
        return d[0]
      })

      console.log(uniqueValues)

     

      for(let i =0; i<uniqueValues.length; i++){
        dropdownMenu.append("option").text(uniqueValues[i]).property("value",uniqueValues[i])
    }
/////////////////////////////////////////////////////////////////

test = [{
    x: [1, 2, 3, 4, 5],
    y: [1, 2, 4, 8, 16] }];

  Plotly.newPlot("plot", test)





})