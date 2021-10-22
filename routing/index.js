(()=>{

//d3js
let svg = d3.select("svg"),
	svgwidth = svg.attr("width"),
	svgheight = svg.attr("height");

//draw roads grid background: 3 rows and 26 columns
let grid = [];
	//top: A-Z
	grid.push({x1:0,y1:0,x2:25,y2:0});
	//middle
	grid.push({x1:0,y1:25,x2:25,y2:25});
	//bottom
	grid.push({x1:0,y1:50,x2:25,y2:50});
	//aisles:0-50
	for(let x=0;x<=25;x++){
		grid.push({x1:x,y1:0,x2:x,y2:50});
	}

svg.selectAll(".line")
	.data(grid)
	.enter().append("line")
	.attr("class", "line")
	.attr("x1", d => scalex(d.x1))
	.attr("y1", d => scaley(d.y1))
	.attr("x2", d => scalex(d.x2))
	.attr("y2", d => scaley(d.y2))
	.attr("stroke", "#999")
	.attr("stroke-opacity", 0.6);

//sample data
let sampledata = {
	nodes:[{id:0, label:'M00', x:11, y:0},{id:1, label:'A1', x:0, y:1},{id:2, label:'A50', x:0, y:50},{id:3, label:'B1', x:1, y:1},{id:4, label:'B50', x:1, y:50},{id:5, label:'C1', x:2, y:1},{id:6, label:'C50', x:2, y:50}]
	,links:[{source:0, target:5},{source:5, target:3},{source:3, target:1},{source:1, target:2},{source:2, target:4},{source:4, target:6},{source:6, target:0}]
};

//d3data
let nodes = [];
let links = [];
let colors = d3.scaleOrdinal(d3.schemeCategory10);

//events
document.querySelector('#sampleBtn').addEventListener('click',clickSample);
document.querySelector('#runBtn').addEventListener('click',clickRun);
document.querySelector('#resetBtn').addEventListener('click',clickReset);
document.querySelector('#map').addEventListener('click',clickMap);

clickSample();//load initial page with sample data

function redrawNodes(){

	//nodes
	let dnodes = svg.selectAll(".node")
		.data(nodes);
	dnodes.enter().append("g")
		.attr("class", "node");
			
	//node circle 
	let dcircles = svg.selectAll('.circle').data(nodes);
	dcircles.enter().append("circle")
	.attr("class", "circle")
		.attr('cx', d => scalex(d.x))
		.attr('cy', d => scaley(d.y))
		.attr("r", 5)
		.style("fill", function (d, i) { return colors(d.TypeId); });

	dcircles.exit().remove();

	//node text label
	let dtext = svg.selectAll('.text').data(nodes);
	dtext.enter().append("text")
		.text(function (d) { return d.label; })
		.attr("class", "text")
		.attr('x', d => scalex(d.x))
		.attr('y', d => scaley(d.y))
		.attr("dy", -5);

	dtext.exit().remove();
}
function redrawLinks(){
	let dlinks = svg.selectAll(".link")
	.data(links);

	//draw link lines
	dlinks.enter().append("line")
	.attr("class", "link")
	.attr("x1", d => scalex(nodes[d.source].x))
	.attr("y1", d => scaley(nodes[d.source].y))
	.attr("x2", d => scalex(nodes[d.target].x))
	.attr("y2", d => scaley(nodes[d.target].y))
	.attr("stroke", "#000")
	.attr("stroke-opacity", 1);

	dlinks.exit().remove();
}
//helpers
function clearLinks(){
	//note: we need to clear existing links for each update, d3js can't compare which ones are the same or different
	//remove links
	links=[];
	redrawLinks();
}
function clearNodes(){
	//remove nodes
	nodes = [];
	redrawNodes();
}
//event handlers
function clickReset(){
	clearLinks();
	clearNodes();
}
function clickSample(){
	clickReset();//note this is needed because d3 associates by index rather than id or value

	nodes = JSON.parse(JSON.stringify(sampledata.nodes)); 
	redrawNodes();
	
	links = JSON.parse(JSON.stringify(sampledata.links)); 
	redrawLinks();
	document.querySelector('#note').innerHTML="Click map to add stops.";
}
function handleErrors(response){
	if(!response.ok){
		throw Error(response.status + " - "+response.statusText);
	}
	return response;
}
function clickRun(){
	clearLinks();
	//fetch new links
	fetch(new myEnvironment().getRoutingUrl(),
	{   method: 'POST',
		headers: new Headers(
		{
			"Content-Type": "application/json",
			"Accept":"application/json"}
		),
		body: JSON.stringify({nodes:nodes})
	})
	.then(handleErrors)
	.then(responseStream => responseStream.json())
	.then(function(data){
		links = data.links;
		redrawLinks();
		document.querySelector('#note').innerHTML="Total Distance:"+data.pathDistance;
	})
	.catch(function(error){
		document.querySelector('#note').innerHTML=error;
	}); 
}
function clickMap(e){
	//add new node
	let n = {i:nodes.length,x:unscalex(d3.pointer(e)[0]),y:unscaley(d3.pointer(e)[1])};
	n.label = String.fromCharCode(65+n.x) + n.y;
	nodes.push(n);
	redrawNodes();
}
function scalex(x){
	let spacing = 20;
	return spacing+scaleCoordinate(x, 26, svgwidth-2*spacing);
}
function scaley(y){
	let spacing = 20;
	return spacing+scaleCoordinate(y, 51, svgheight-2*spacing);
}
function scaleCoordinate(c, maxC, mapC){
	return 1.0*c*mapC/maxC;
}
function unscalex(x){
	let spacing = 20;
	return Math.round(scaleCoordinate(x-spacing, svgwidth-2*spacing, 26));
}
function unscaley(y){
	let spacing = 20;
	return Math.round(scaleCoordinate(y-spacing, svgheight-2*spacing, 51));
}
})();