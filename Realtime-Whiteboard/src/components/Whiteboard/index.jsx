import React, { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs";

const Whiteboard = ({ canvasRef, contextRef, tool, color, elements, setElements, user, socket }) => {
    const roughGenerator = rough.generator();
    const [isDrawing, setIsDrawing] = useState(false);
    const [image, setImage] = useState(null);

    // Socket for whiteboard data
    useEffect(() => {
        socket.on("whiteboardDataResponse", (data) => {
            setImage(data.imgURL);
        });
    }, []);

    // Canvas initialization
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.height = window.innerHeight * 2;
        canvas.width = window.innerWidth * 2;

        const context = canvas.getContext("2d");
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.lineCap = "round";
        contextRef.current = context;
    }, []);

    // Color update
    useEffect(() => {
        contextRef.current.strokeStyle = color;
    }, [color]);

    // Drawing elements
    useLayoutEffect(() => {
        if (canvasRef) {
            const roughCanvas = rough.canvas(canvasRef.current);
            if (elements.length > 0) {
                contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
            elements.forEach((element) => {
                if (element.type === "pencil") {
                    roughCanvas.linearPath(element.path, { stroke: element.stroke, strokeWidth: 3, roughness: 0 });
                } else if (element.type === "line") {
                    roughCanvas.draw(
                        roughGenerator.line(
                            element.offsetX,
                            element.offsetY,
                            element.width,
                            element.height,
                            { stroke: element.stroke, strokeWidth: 3, roughness: 0 }
                        )
                    );
                } else if (element.type === "rect") {
                    roughCanvas.draw(
                        roughGenerator.rectangle(
                            element.offsetX,
                            element.offsetY,
                            element.width,
                            element.height,
                            { stroke: element.stroke, strokeWidth: 3, roughness: 0 }
                        )
                    );
                }
            });

            const canvasImage = canvasRef.current.toDataURL();
            socket.emit("whiteboardData", canvasImage);
        }
    }, [elements]);

    // Tool handling
    const handleMouseDown = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        setIsDrawing(true);

        const newElement = (type, path = [], width = 0, height = 0) => ({
            type,
            offsetX,
            offsetY,
            path,
            width,
            height,
            stroke: color
        });

        setElements((prevElements) => [
            ...prevElements,
            newElement(tool === "pencil" ? "pencil" : tool === "line" ? "line" : "rect")
        ]);
    };

    const handleMouseMove = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (!isDrawing) return;

        setElements((prevElements) =>
            prevElements.map((element, index) =>
                index === elements.length - 1
                    ? tool === "pencil"
                        ? { ...element, path: [...element.path, [offsetX, offsetY]] }
                        : { ...element, width: offsetX, height: offsetY }
                    : element
            )
        );
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    // Download canvas as image
    const downloadCanvas = () => {
        const link = document.createElement("a");
        link.href = canvasRef.current.toDataURL("image/png");
        link.download = "whiteboard.png";
        link.click();
    };

    // Get dynamic cursor
    const getCursor = (tool) => {
        switch (tool) {
            case "pencil":
                return "crosshair";
            case "line":
                return "default";
            case "rect":
                return "cell";
            default:
                return "pointer";
        }
    };

    // Display the whiteboard or image based on user role
    return (
        <div style={{ cursor: getCursor(tool) }} className="h-100 w-100 overflow-hidden" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <div style={{ padding: "10px", backgroundColor: "#f1f1f1", borderRadius: "8px" }}>
                <span>Active Tool: {tool}</span>
                <span style={{ marginLeft: "20px" }}>Color: {color}</span>
                <button onClick={downloadCanvas} style={{ marginLeft: "10px" }}>Download</button>
            </div>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default Whiteboard;
