(() => {
    const data = {
        "name": "TOPICS", "children": [
            {
                "name": "Receiving",
                "children": [
                    {
                        "name": "Manifest"
                        , "size": 100
                        , "area": ""
                    }
                    , {
                        "name": "Unload"
                        , "size": 200
                        , "area": ""
                    }
                    , {
                        "name": "Inspect & Label"
                        , "size": 500
                        , "area": ""
                    }
                    , {
                        "name": "Put Away"
                        , "size": 200
                        , "area": ""
                    }
                    , {
                        "name": "Returns/Damage"
                        , "size": 100
                        , "area": ""
                    }
                ]
            }
            , {
                "name": "Inventory",
                "children": [
                    {
                        "name": "Reslot Bin"
                        , "size": 300
                        , "area": "packing"
                    }
                    , {
                        "name": "Replenish"
                        , "children": [
                            {
                                "name": "Bring Down"
                                , "size": 100
                                , "area": ""
                            }
                            , {
                                "name": "Restock"
                                , "size": 300
                                , "area": ""
                            }
                            , {
                                "name": "Put Away"
                                , "size": 100,
                                "area": ""
                            }]
                    }
                    , {
                        "name": "Resize Bin"
                        , "size": 200
                        , "area": ""
                    }
                    , {
                        "name": "Cycle Count"
                        , "size": 300
                        , "area": ""
                    }
                    , {
                        "name": "Returns/Damage"
                        , "size": 200
                        , "area": ""
                    }
                ]
            }
            , {
                "name": "Picking",
                "children": [
                    {
                        "name": "Dispatch"
                        , "size": 100
                    }
                    , {
                        "name": "Travel"
                        , "size": 500
                        , "area": "routing"
                    }
                    , {
                        "name": "Picking"
                        , "size": 500
                    }
                    , {
                        "name": "Wait"
                        , "size": 500
                        , "area": ""
                    }
                    , {
                        "name": "Pack"
                        , "size": 200
                        , "area": ""
                    }
                ]
            }
            , {
                "name": "Packing",
                "children": [
                    {
                        "name": "Zone Process"
                        , "size": 100
                        , "area": ""
                    }
                    , {
                        "name": "Wrap & Label"
                        , "size": 100
                        , "area": ""
                    }
                    , {
                        "name": "Stage"
                        , "size": 100
                        , "area": ""
                    }
                    , {
                        "name": "QA"
                        , "size": 100
                        , "area": ""
                    }
                ]
            }
            , {
                "name": "Shipping",
                "children": [
                    {
                        "name": "Loading"
                        , "size": 100
                        , "area": ""
                    }
                    , {
                        "name": "Deliver"
                        , "children": [
                            {
                                "name": "Load"
                                , "size": 100
                                , "area": ""
                            }
                            , {
                                "name": "Travel"
                                , "size": 800
                                , "area": ""
                            }
                            , {
                                "name": "Unload"
                                , "size": 200
                                , "area": ""
                            }
                            , {
                                "name": "Returns"
                                , "size": 100
                                , "area": ""
                            }
                        ]
                    }
                    , {
                        "name": "Invoice"
                        , "size": 100
                        , "area": ""
                    }
                ]
            }
            , {
                "name": "Admin",
                "children": [
                    {
                        "name": "Inventory Cutting"
                        , "size": 100
                        , "area": ""
                    }
                    , {
                        "name": "Purchasing"
                        , "size": 1000
                        , "area": ""
                    }
                    , {
                        "name": "Inventory Transfer"
                        , "size": 100
                        , "area": ""
                    }
                ]
            }
        ]
    };
    let svg = d3.select("svg"),
        width = svg.attr("width"),
        height = svg.attr("height"),
        radius = (Math.min(width, height) / 2)
        , padding = 2;
    //reposition svg to center of page viewport
    svg.attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)

    let partition = data => d3.partition()
        .size([2 * Math.PI, radius])
        (d3.hierarchy(data)
            .sum(d => d.size)
            .sort((a, b) => b.size - a.size))

    let colors = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 2))
    let arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, padding * 0.005))
        .padRadius(radius / 2)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1 - padding)

    let root = partition(data);
    //inner circle
    let innerG = svg.append("g");
    innerG.append("circle")
        .attr('cx', 0)
        .attr('cy', 0)
        .attr("r", radius / 4 - padding)//TODO depth hardcode
        .style("fill", colors(data.children.length + 1))
        .attr("fill-opacity", 0.2);

    innerG.append("text").attr("font-size", 16)
        .attr("text-anchor", "middle")
        .text("Sales");
    //circle segments inside navigation
    let outerG = svg.append("g");
    outerG.append("a")
        .attr("id", 'linkOverlay')
        .attr("xlink:href", "#")
        .selectAll("path")
        .data(root.descendants().filter(d => d.depth))
        .join("path")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return colors(d.data.name); })
        .attr("fill-opacity", d => d.data.area ? 0.6 : 0.2)
        .attr("d", arc)
        .on('mouseover', (e, x) => {
            d3.select('#linkOverlay')
                .attr("xlink:href", x.data.area ? "./" + x.data.area : "#")
                .attr("cursor", x.data.area ? "pointer" : "auto");
        });
    //text overlays
    outerG
        .selectAll(".outertext")
        .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
        .join("text")
        .attr("pointer-events", "none")
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle")
        .attr("class", "outertext")
        .attr("font-size", d => 16 - d.depth * 2)
        .attr("transform", function (d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        })
        .attr("dy", "0.35em")
        .text(d => d.data.name);
        
})();
