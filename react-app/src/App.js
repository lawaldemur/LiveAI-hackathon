import React, { useState } from "react";
import "./App.css";

const API_SOURCE_URL = "http://127.0.0.1:3001";

function App() {
    const [image, setImage] = useState(null);

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
        setImage("styles.png");
    };

    const fetchImage = async (style) => {
        try {
            try {
                const response = await fetch(API_SOURCE_URL + "/edit_image", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        style: style,
                        image_name: "styles.png",
                    }),
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                console.log(data.new_image_path);
                setImage(data.new_image_path);
            } catch (error) {
                console.error("Error fetching image:", error);
            }
        } catch (error) {
            console.error("Error fetching image:", error);
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
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
