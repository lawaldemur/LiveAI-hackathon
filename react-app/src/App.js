import React, { useState, useEffect } from "react";
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
    const [activeGif, setActiveGif] = useState(1);

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
        setLoading(true);
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
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loading) {
            const gifDurations = [
                { file: "loading5.gif", duration: 1700 },
                { file: "loading4.gif", duration: 1760 },
                { file: "loading3.gif", duration: 3750 },
                { file: "loading2.gif", duration: 5040 },
                { file: "loading1.gif", duration: 7200 },
            ];
            const currentGif = `loading${activeGif}.gif`;
            const gifInfo = gifDurations.find((gif) => gif.file === currentGif);
            const duration = gifInfo ? gifInfo.duration : 2000;

            const timeoutId = setTimeout(() => {
                setActiveGif((prev) => (prev % 5) + 1);
            }, duration);

            return () => clearTimeout(timeoutId);
        }
    }, [loading, activeGif]);

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
                    <div
                        className="range-input-wrapper"
                        style={{ textAlign: "center", margin: "20px 0" }}
                    >
                        <input
                            type="range"
                            min="0"
                            max={storedStyles.length - 1}
                            step="0.01"
                            value={activeIndex}
                            onChange={(event) => {
                                const index = parseFloat(event.target.value);
                                const roundedIndex = Math.round(index);
                                setImage(storedImages[roundedIndex]);
                                setActiveIndex(roundedIndex);
                            }}
                            style={{ width: "80%" }}
                        />
                        <div
                            style={{
                                marginTop: "10px",
                                fontSize: "1.2em",
                                color: "#333",
                            }}
                        >
                            {storedStyles[Math.round(activeIndex)]}
                        </div>
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
                                    event.target.blur();
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
                            <img
                                src={`./loading/loading${activeGif}.gif`}
                                alt="Loading"
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default App;
