// using D3 to read API
const url= "https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json";

let update_selection; //ChatGPT edit to update values of charts when selecting new ID's

// Fetch the JSON data and console log it
d3.json(url).then(function(data) {
    console.log(data);
    update_selection= data // storing fetched data here when selecting from dropdown
    init(data) //calls function after data is fetched and logged
});

//Dashboard and Dropdown Menu
function init(data) {
  //drop down menu
  let dropdownMenu= d3.select("#selDataset"); //connects to the index.html file id=selDataset
  let names= data.names; // variable later helps fetch the names (key) Array of data (values- id's)from the JSON url

  //iterates through each value (id) in the array we fetch using {names} variable
  //for each sample it appends a new option (adds the id text value)
  names.forEach(id => { 
    dropdownMenu.append("option").text(id).property("value",id);
  });

  //dispay data for first data (default at first id)-940. when we open the page
  let first_sample= names[0];
  visualization(data, first_sample);
}

// Visualization function for all charts
//first argument grabs all the {data}, second argument becomes filter
function visualization(data, sampleId) {
  // Finding the sample data for the chosen ID in drop down selection
  //arrow function iterates through sample data to find a match to the sample id
  let samples = data.samples.find(sample => sample.id == sampleId); //reads the data url.json, selects samples key

  // Bar chart
  //reversed to have highest values at the top
  let bar_graph = [{
    x: samples.sample_values.slice(0, 10).reverse(), 
    y: samples.otu_ids.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse(), 
    text: samples.otu_labels.slice(0, 10).reverse(), 
    type: 'bar',
    orientation: 'h'
  }];

  let bar_layout = {
    title: 'Top 10 OTUs found',
  };

  Plotly.newPlot('bar', bar_graph, bar_layout);
  
  //Bubble chart
  //Reference: https://plotly.com/javascript/bubble-charts/, Xpert learning assistant.

  let bubble_chart= [{
    x: samples.otu_ids,
    y: samples.sample_values,
    text: samples.otu_labels,
    mode: 'markers',
    marker: {
      size: samples.sample_values,
      color: samples.otu_ids,
      colorscale: 'Rainbow' //chosing color scheme for the bubbles, Reference: Xpert learning assistant
    }
  }];

  let bubble_layout= {
    title: 'Samples Data',
    xaxis: {title: 'OTU ID'},
  };

  Plotly.newPlot('bubble', bubble_chart, bubble_layout);

  // Get metadata for the selected sample
  //reads the data url.json, selects 'metadata' key values
  let url_metadata = data.metadata.find(meta => meta.id == sampleId); 
  
  let html_meta= d3.select("#sample-metadata"); //connecting to the ID in html file
  html_meta.html(""); //clears previous data

  // Loop through metadata key value pairs and display them
  Object.entries(url_metadata).forEach(([key, value]) => {
    html_meta.append("h5").text(`${key}: ${value}`);
  });

}

// Call function() when a change takes place to the DOM
d3.selectAll("#selDataset").on("change", function() {
  // Use D3 to select the dropdown menu
  let dropdownMenu = d3.select("#selDataset");
  // Assign the value of the dropdown menu option to a variable
  let selectedData = dropdownMenu.property("value");
  // Call the visualization function with the selected ID and the existing data
  visualization(update_selection, selectedData); // Pass existing data to avoid refetching
});
