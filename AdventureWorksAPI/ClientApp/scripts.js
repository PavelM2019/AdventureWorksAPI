document.addEventListener('DOMContentLoaded', function () {
    init();
});

async function init() {
    // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
    // For details, see https://gojs.net/latest/intro/buildingObjects.html
    const $ = go.GraphObject.make; // for conciseness in defining templates

    myDiagram = new go.Diagram(
        'myDiagramDiv', // must name or refer to the DIV HTML element
        {
            allowDelete: false,
            allowCopy: false,
            layout: $(go.ForceDirectedLayout, { isInitial: false }),
            'undoManager.isEnabled': true,
            // use "Modern" themes from extensions/Themes
            'themeManager.themeMap': new go.Map([
                { key: 'light', value: Modern },
                { key: 'dark', value: ModernDark },
            ]),
            'themeManager.changesDivBackground': true,
            'themeManager.currentTheme': document.getElementById('theme').value,
        }
    );

    myDiagram.themeManager.set('light', {
        colors: {
            primary: '#f7f9fc',
            green: '#62bd8e',
            blue: '#3999bf',
            purple: '#7f36b0',
            red: '#c41000',
        },
    });
    myDiagram.themeManager.set('dark', {
        colors: {
            primary: '#4a4a4a',
            green: '#429e6f',
            blue: '#3f9fc6',
            purple: '#9951c9',
            red: '#ff4d3d',
        },
    });

    // the template for each attribute in a node's array of item data
    const itemTempl = $(go.Panel,
        'Horizontal',
        { margin: new go.Margin(2, 0) },
        $(go.Shape,
            { desiredSize: new go.Size(15, 15), strokeWidth: 0, margin: new go.Margin(0, 5, 0, 0) },
            new go.Binding('figure', 'figure'),
            new go.ThemeBinding('fill', 'color').ofData()
        ),
        $(go.TextBlock,
            { font: '12px sans-serif', stroke: 'black' },
            new go.Binding('text', 'name'),
            new go.Binding('font', 'iskey', (k) => (k ? 'italic 12px sans-serif' : '12px sans-serif')),
            new go.ThemeBinding('stroke', 'text')
        )
    );

    // define the Node template, representing an entity
    myDiagram.nodeTemplate = $(go.Node,
        'Auto', // the whole node panel
        {
            selectionAdorned: true,
            resizable: true,
            layoutConditions: go.LayoutConditions.Standard & ~go.LayoutConditions.NodeSized,
            fromSpot: go.Spot.LeftRightSides,
            toSpot: go.Spot.LeftRightSides,
        },
        new go.Binding('location', 'location').makeTwoWay(),
        // whenever the PanelExpanderButton changes the visible property of the "LIST" panel,
        // clear out any desiredSize set by the ResizingTool.
        new go.Binding('desiredSize', 'visible', (v) => new go.Size(NaN, NaN)).ofObject('LIST'),
        // define the node's outer shape, which will surround the Table
        $(go.Shape, 'RoundedRectangle', { stroke: '#e8f1ff', strokeWidth: 3 }, new go.ThemeBinding('fill', 'primary')),
        $(go.Panel,
            "Table",
            { name: "LIST", row: 1, alignment: go.Spot.TopLeft },
            $(go.Panel,
                "Auto",
                { row: 0, columnSpan: 2, alignment: go.Spot.Center },
                $(go.Shape,
                    {
                        fill: "lightgray", 
                        stroke: null 
                    }),
                $(go.TextBlock,
                    {
                        margin: new go.Margin(5, 10, 5, 10), 
                        font: "bold 13px sans-serif",
                        alignment: go.Spot.Center
                    },
                    new go.Binding("text", "key")) 
            ),
            $(go.Panel,
                "Vertical",
                {
                    row: 1,
                    name: "NonInherited",
                    alignment: go.Spot.TopLeft,
                    defaultAlignment: go.Spot.Left,
                    itemTemplate: itemTempl,
                },
                new go.Binding("itemArray", "items")
            ),
            $(go.Panel,
                "Vertical",
                {
                    row: 2,
                    name: "Inherited",
                    alignment: go.Spot.TopLeft,
                    defaultAlignment: go.Spot.Left,
                    itemTemplate: itemTempl,
                },
                new go.Binding("itemArray", "inheritedItems")
            )
        )
    ); // end Node

    // define the Link template, representing a relationship
    myDiagram.linkTemplate = $(go.Link, // the whole link panel
        {
            selectionAdorned: true,
            layerName: 'Background',
            reshapable: true,
            routing: go.Routing.AvoidsNodes,
            corner: 5,
            curve: go.Curve.JumpOver,
            toolTip: $(go.Adornment, 'Auto',
                $(go.Shape, { fill: '#f7e9e7' }),
                $(go.Panel, 'Horizontal',
                    { margin: 4 },
                    $(go.TextBlock, { font: 'normal 12px sans-serif', margin: new go.Margin(0, 2, 0, 0) }, 'each'), 
                    $(go.TextBlock, { font: 'bold 12px sans-serif', margin: new go.Margin(0, 2, 0, 0) }, new go.Binding('text', 'to')),
                    $(go.TextBlock, { font: 'normal 12px sans-serif', margin: new go.Margin(0, 2, 0, 0) }, 'may have multiple'), 
                    $(go.TextBlock, { font: 'bold 12px sans-serif' }, new go.Binding('text', 'from'))
                )
            )
        },
        $(go.Shape, // the link shape
            { stroke: '#f7f9fc', strokeWidth: 3 },
            new go.ThemeBinding('stroke', 'link')
        ),
        $(go.TextBlock, // the "from" label
            {
                textAlign: 'center',
                font: 'bold 12px sans-serif',
                stroke: 'black',
                segmentIndex: 0,
                segmentOffset: new go.Point(NaN, NaN),
                segmentOrientation: go.Orientation.Upright,
            },
            new go.Binding('text', 'text'),
            new go.ThemeBinding('stroke', 'text')
        ),
        $(go.TextBlock, // the "to" label
            {
                textAlign: 'center',
                font: 'bold 12px sans-serif',
                stroke: 'black',
                segmentIndex: -1,
                segmentOffset: new go.Point(NaN, NaN),
                segmentOrientation: go.Orientation.Upright,
            },
            new go.Binding('text', 'toText'),
            new go.ThemeBinding('stroke', 'text')
        )
    );

    const response = await fetch('api/AdventureWorks/tables')
    const data = await response.json();
    const nodeDataArray = transformData(data);    
    const linkDataArray = data.linkInfo;

    myDiagram.model = new go.GraphLinksModel({
        copiesArrays: true,
        copiesArrayObjects: true,
        nodeDataArray: nodeDataArray,
        linkDataArray: linkDataArray,
    });

}
function transformData(data) {
    if (!data || !Array.isArray(data.tables)) {
        console.error("Incorrect data from the backend");
        return [];
    }
    return data.tables.map(table => ({
        ...table,
        location: new go.Point(table.location.x, table.location.y),
        items: table.items.map(item => ({
            ...item,
            iskey: item.isKey
        }))
    }));
}

async function exportDiagramToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    const bounds = myDiagram.documentBounds;
    const width = bounds.width;
    const height = bounds.height;

    myDiagram.makeImageData({
        background: "white",
        type: "image/png",
        callback: function (imgData) {
            const img = new Image();
            img.onload = function () {
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const scale = Math.min(pageWidth / width, pageHeight / height);

                const scaledWidth = width * scale;
                const scaledHeight = height * scale;

                doc.addImage(img, 'PNG', 0, 0, scaledWidth, scaledHeight);
                doc.save("myDiagram.pdf");
            };
            img.src = imgData;
        },
        scale: 1,
        maxSize: new go.Size(Infinity, Infinity)
    });
}

document.getElementById("exportButton").addEventListener("click", exportDiagramToPDF);