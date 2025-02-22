import React, { useState } from "react";
import Sparkle from "react-sparkle";
import "./App.css";

const API_SOURCE_URL = "http://127.0.0.1:3001";

function App() {
    const [image, setImage] = useState(null);
    const [coreImage, setCoreImage] = useState(null);
    const [storedStyles, setStoredStyles] = useState([]);
    const [storedImages, setStoredImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [loading, setLoading] = useState(false);

    const artStyles = [
        "Surrealism",
        "Minimalism",
        "Postmodernism",
        "Expressionism",
        "Futurism",
        "Conceptual Art",
    ];
    const personalityStyles = [
        "Adventerous",
        "Elegant",
        "Luxurious",
        "Modern",
        "Cozy",
        "Warm",
    ];

    const pickCore = async (style) => {
        setCoreImage("styles.png");
        setImage("styles.png");
        setActiveIndex(0);

        if (!storedStyles.includes(style)) {
            setStoredStyles([style]);
        }
        if (!storedImages.includes(image)) {
            setStoredImages(["styles.png"]);
        }
    };

    const fetchImage = async (style) => {
        setLoading(true); // Set loading to true when starting the fetch
        const newStyles = [...storedStyles.slice(0, activeIndex + 1), style];
        setStoredStyles(newStyles);
        console.log("Requested style: ", newStyles.join(", "));

        try {
            const response = await fetch(API_SOURCE_URL + "/edit_image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    style: newStyles.join(", "),
                    image_name: coreImage,
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            console.log(data.new_image_path);
            setImage(data.new_image_path);

            const newImages = [
                ...storedImages.slice(0, activeIndex + 1),
                data.new_image_path,
            ];
            setStoredImages(newImages);
            setActiveIndex(newImages.length - 1);
        } catch (error) {
            console.error("Error fetching image:", error);
        } finally {
            setLoading(false); // Set loading to false after fetch completes
        }
    };

    return (
        <div className="App">
            {!image && (
                <>
                    <header className="App-header">
                        <h3>Pick the Core Aesthetic</h3>
                    </header>

                    <div className="style-selector-wrapper">
                        <ul>
                            {artStyles.map((style) => (
                                <li key={style} onClick={() => pickCore(style)}>
                                    {style}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            {image && (
                <>
                    <div className="style-image-wrapper">
                        <img
                            src={API_SOURCE_URL + "/images/" + image}
                            alt="Art Style"
                        />
                    </div>
                    <div className="breadcrumbs">
                        <ul>
                            {storedStyles.map((style, index) => (
                                <li
                                    key={index}
                                    onClick={() => {
                                        setImage(storedImages[index]);
                                        setActiveIndex(index);
                                    }}
                                >
                                    {style}
                                    {index < storedStyles.length - 1 && " --- "}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="personality-selector-wrapper">
                        <ul style={{ columns: 2 }}>
                            {personalityStyles.map((style) => (
                                <li
                                    key={style}
                                    onClick={() => fetchImage(style)}
                                >
                                    {style}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="personality-input-wrapper">
                        <input
                            type="text"
                            placeholder="Your personal wish..."
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    fetchImage(event.target.value);
                                    event.target.value = "";
                                    event.target.blur(); // Remove focus from the input
                                }
                            }}
                        />
                    </div>
                    {loading && (
                        <div className={`loading ${loading ? "visible" : ""}`}>
                            <div
                                className="sparklingAnimation"
                                style={{ position: "absolute" }}
                            >
                                <Sparkle count={200} />
                            </div>
                            <img src="./wand.gif" alt="Loading" />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default App;
