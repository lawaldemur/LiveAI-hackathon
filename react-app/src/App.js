import React, { useState } from "react";
import "./App.css";

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

    const fetchImage = async (style) => {
        try {
            const response = await fetch(`/api/getImage?style=${style}`);
            const data = await response.json();
            setImage(data.imageUrl);
        } catch (error) {
            console.error("Error fetching image:", error);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h3>Pick the Core Aesthetic</h3>
            </header>

            <div className="style-selector-wrapper">
                <ul>
                    {artStyles.map((style) => (
                        <li key={style} onClick={() => fetchImage(style)}>
                            {style}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="style-image-wrapper">
                {image && <img src={image} alt="Art Style" />}
            </div>
        </div>
    );
}

export default App;
