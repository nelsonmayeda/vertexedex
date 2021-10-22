(()=>{
	//d3js
	let svg = d3.select("svg"),
		svgwidth = svg.attr("width"),
		svgheight = svg.attr("height"),
		g = svg.append("g").attr("transform", "translate("+svgwidth/2 + ","+svgheight/2+")");
	let colors = d3.scaleLinear()
		.domain([-1, 5])
		.range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
		.interpolate(d3.interpolateHcl);
	let margin = 20,
		padding = 10;

	//hardcoded data
	let _maxVolume = 4; //palletSize

	//sample data
	let sampledata = {
		products:[{id:0, volume:_maxVolume, value:1, location:0},{id:1, volume:_maxVolume/2, value:1, location:1},{id:2, volume:1, value:1, location:2},{id:3, volume:1, value:1, location:3},{id:4, volume:1, value:1, location:3},{id:5, volume:1, value:1, location:3},{id:6, volume:1, value:1, location:3}]
		,bins:[{id:0, volume:4},{id:1, volume:4},{id:2, volume:2},{id:3, volume:1}]
	};
	
	//d3data
	let products = [];
	let bins = [];
	let root = {};
	
	svg
	.style("background", colors(-1));

	//events
	document.querySelector('#sampleBtn').addEventListener('click',clickSample);
	document.querySelector('#runBtn').addEventListener('click',clickRun);
	document.querySelector('#resetBtn').addEventListener('click',clickReset);
	document.querySelector('#map').addEventListener('click',clickMap);

	clickSample();//load initial page with sample data

	function makeBinData(){
		return {
			children: [{
				children: bins.map(b =>{
				return {
					id: b.id
					,volume: b.volume
					};
				})
			}]
		};
	}
	function redrawBins(){
		let data = makeBinData();

		let diameter = Math.min(svgwidth, svgheight);
	
		//setup pack sizing
		let pack = d3.pack()
			.size([diameter  - margin, diameter - margin])
			.padding(padding);
		
		root = d3.hierarchy(data)
		.sum(d=> d.volume);

		let nodes = pack(root).descendants();

		//draw circles
		let dcircles = g.selectAll(".bin").data(nodes);

		dcircles.enter()
		.append("circle")
		  .attr("class", d=>'bin bin'+ d.depth)
		  .attr("transform", d=> "translate(" + (d.x - root.x)  + "," + (d.y - root.y)  + ")")
		  .attr("r", d=> d.r)
		  .style("fill", d => colors(d.depth))
		  .on('click', clickBin);

		dcircles.exit().remove();

		//draw labels
		let dlabels = g.selectAll(".label").data(nodes);

		dlabels.enter()
		.append("text")
		  .attr("class", d=> 'label label'+ d.depth)
		  .attr("transform", d=> "translate(" + (d.x - root.x)  + "," + (d.y - root.y)  + ")")
		  .text(d=> d.data.id);

		  dlabels.exit().remove();

		  let binTotal = 0;
		  bins.map(p=>binTotal+=p.volume);
		  document.querySelector('#bintotal').innerHTML="Bin Volume: " +binTotal;
	}
	
	function redrawProducts(){
		//foreach bin circle
		//find products that go in that element
		//create scaled radiuses
		//pack into current circle (now has cx,cy)
		//append a circle to g
		//translate to circle center
		if(products && products.length){
			let maxProductV = 1;
			let maxBinR = 1;
			products.map(p=>{if(p.volume > maxProductV){maxProductV=p.volume;}});
			g.selectAll('.bin2').each(b=> {if(b.r > maxBinR){maxBinR=b.r;}});
	
			g.selectAll('.bin2').each(function(b){
				let data = products.filter(p => p.location == b.data.id).map(p => ({id:p.id, r:scaleR(p.volume, maxProductV,maxBinR)}));
				//setup pack sizing
				let pack = d3.packSiblings(data);
				//draw circles
				pack.map(p => {
					g.insert("circle", '.label2')
					.attr("class", "product")  
					.attr("cx", p.x)//calculated by pack
					.attr("cy", p.y)//calculated by pack
					.attr("r", p.r)
					.attr("transform", "translate(" + (b.x - root.x)  + "," + (b.y - root.y)  + ")")
					.style("fill", "#FFF")
					.on('click', clickProduct);
	
					/*g.insert("text", '.label2')
					.attr("class", "productlabel")  
					.attr("transform", "translate(" + (b.x - root.x + p.x)  + "," + (b.y - root.y + p.y)  + ")")
					.text(p.id);*/
				});
			});
			let productTotal = 0;
			products.map(p=>productTotal+=p.volume);
			document.querySelector('#producttotal').innerHTML="Product Volume: " +productTotal;
		}

		g.selectAll('.product').data(products).exit().remove();
		
	}
	//helpers
	function clearBins(){
		bins=[];
		redrawBins();
	}
	function clearProducts(){
		products = [];
		redrawProducts();
	}
	//event handlers
	function clickReset(){
		clearBins();
		clearProducts();
	}
	function clickSample(){
		clickReset();//note this is needed because d3 associates by index rather than id or value

		bins = JSON.parse(JSON.stringify(sampledata.bins)); 
		redrawBins();

		products = JSON.parse(JSON.stringify(sampledata.products)); 
		redrawProducts();

		document.querySelector('#note').innerHTML="Click green map to add bins, blue bins to add products, white products to increase size.";
	}
	function clickBin(e,target){
		e.stopPropagation();
		let oldproducts = products;
		clearProducts();

		//add new circle
		let n = {id:oldproducts.length, volume:1, location:target.data.id};
		oldproducts.push(n);

		//redraw products
		products = oldproducts; 
		redrawProducts();
	}
	function clickProduct(e, target){
		e.stopPropagation();
		let oldproducts = products;
		clearProducts();

		if(oldproducts[target.id].volume < _maxVolume){
			oldproducts[target.id].volume=oldproducts[target.id].volume+1;
		}
		products = oldproducts; 
		redrawProducts();
	}
	function clickMap(e){
		let oldproducts = products;
		clearProducts();
		let oldbins = bins;
		clearBins();

		//add new circle
		let n = {id:oldbins.length, volume:_maxVolume};
		oldbins.push(n);
		bins = oldbins;
		redrawBins();

		//redraw products
		products = oldproducts; 
		redrawProducts();
	}
	function handleErrors(response){
		if(!response.ok){
			throw Error(response.status + " - "+response.statusText);
		}
		return response;
	}
	function clickRun(){
		//fetch new product bin locations
		fetch(new myEnvironment().getPackingUrl(),
		{   method: 'POST',
			headers: new Headers(
			{
				"Content-Type": "application/json",
				"Accept":"application/json"}
			),
			body: JSON.stringify({warehouse:{bins:bins}, products:products})
		})
		.then(handleErrors)
		.then(responseStream => responseStream.json())
		.then(function(data){
			clearProducts();
			products = data.products;
			redrawProducts();
		})
		.catch(function(error){
			document.querySelector('#note').innerHTML=error;
		}); 
	}
	function scaleR(area, maxArea, otherRadius){
		let maxRadius = Math.sqrt(maxArea/Math.PI);
		let scale = otherRadius/maxRadius;

		let radius = Math.sqrt(area/Math.PI);
		return radius*scale-padding;//extra space for padding
	}
})();