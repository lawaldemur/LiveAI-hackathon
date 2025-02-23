import React, { useState, useEffect } from "react";
import Sparkle from "react-sparkle";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import IosShareIcon from "@mui/icons-material/IosShare";

import "./App.css";

const API_SOURCE_URL = "http://127.0.0.1:3001";
const CORE_IMAGE = "styles.png";
const X_SHARE_CONTENT =
    "Here's what I've created using Brando fashion branding tool. Try it yourself!";

function App() {
    const [image, setImage] = useState(null);
    const [coreImage, setCoreImage] = useState(null);
    const [storedStyles, setStoredStyles] = useState([]);
    const [storedImages, setStoredImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [activeGif, setActiveGif] = useState(1);
    const [sharing, setSharing] = useState(false);
    const [sharingImage, setSharingImage] = useState(null);
    const [researchData, setResearchData] = useState([]);

    const artStyles = [
        "Surrealism",
        "Gothic",
        "Postmodernism",
        "Expressionism",
        "Futurism",
        "Conceptual Art",
    ];
    const [personalityStyles, setPersonalityStyles] = useState([
        "Adventerous",
        "Elegant",
        "Luxurious",
        "Modern",
        "Cozy",
        "Warm",
    ]);

    useEffect(() => {
        const updatePersonalityStyles = async (style) => {
            try {
                const response = await fetch(
                    API_SOURCE_URL + "/style_suggestions",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ style: style.join(", ") }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                setPersonalityStyles(data.suggestions);
                console.log("Style recommendations:", data.suggestions);
            } catch (error) {
                console.error("Error updating personality styles:", error);
            }
        };

        if (storedStyles.length > 1) {
            updatePersonalityStyles(storedStyles);
        } else {
            setPersonalityStyles([
                "Adventerous",
                "Elegant",
                "Luxurious",
                "Modern",
                "Cozy",
                "Warm",
            ]);
        }
    }, [storedStyles]);

    useEffect(() => {
        const updateResearchData = async (style) => {
            try {
                const response = await fetch(
                    API_SOURCE_URL + "/research_style",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ style: style.join(", ") }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                setResearchData(data.results);
                console.log("Research data:", data.results);
            } catch (error) {
                console.error("Error updating research data:", error);
            }
        };

        if (storedStyles.length > 0) {
            updateResearchData(storedStyles);
        }
    }, [storedStyles]);

    const pickCore = async (style) => {
        setCoreImage(CORE_IMAGE);
        setImage(CORE_IMAGE);
        setActiveIndex(0);

        if (!storedStyles.includes(style)) {
            setStoredStyles([style]);
        }
        if (!storedImages.includes(image)) {
            setStoredImages([CORE_IMAGE]);
        }
    };

    const scrollBreadcrumbsToEnd = () => {
        const breadcrumbsElement = document.querySelector(".breadcrumbs");
        if (breadcrumbsElement) {
            breadcrumbsElement.scrollLeft = breadcrumbsElement.scrollWidth;
        }
    };

    const fetchImage = async (style) => {
        setLoading(true);
        setResearchData([]);
        const newStyles = [...storedStyles.slice(0, activeIndex + 1), style];
        setStoredStyles(newStyles);
        scrollBreadcrumbsToEnd();
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
            setSharingImage(data.new_image_path);

            const newImages = [
                ...storedImages.slice(0, activeIndex + 1),
                data.new_image_path,
            ];
            setStoredImages(newImages);
            setActiveIndex(newImages.length - 1);
            scrollBreadcrumbsToEnd();
        } catch (error) {
            console.error("Error fetching image:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        // TODO: unsupported dimensions - must be at most 4,194,304 pixels
        if (file) {
            console.log("File selected:", file.name);

            const formData = new FormData();
            formData.append("upload_image", file);
            formData.append("style_image", image);
            formData.append("style", storedStyles.join(", "));

            setLoading(true);
            try {
                const response = await fetch(API_SOURCE_URL + "/try_on", {
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                setSharingImage(data.new_image_path);
                setLoading(false);
            } catch (error) {
                console.log("Error uploading image:", error);
            }
        } else {
            console.log("No files selected");
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

    useEffect(() => {
        if (loading || sharing) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [loading, sharing]);

    return (
        <div className="App">
            <div className="contentApp">
                {sharing && (
                    <div className="sharing-wrapper">
                        <button
                            className="back-home-button"
                            onClick={() => setSharing(null)}
                        >
                            <ArrowBackIosNewIcon className="icon" />
                        </button>
                        <div className="sharing-buttons">
                            <button
                                className="sharing-try-on-btn"
                                onClick={() =>
                                    document.getElementById("fileInput").click()
                                }
                            >
                                Try it on
                            </button>
                            <input
                                type="file"
                                id="fileInput"
                                style={{ display: "none" }}
                                onClick={(event) => (event.target.value = null)}
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="style-image-wrapper">
                            <img
                                src={API_SOURCE_URL + "/images/" + sharingImage}
                                alt="Art Style"
                            />
                        </div>
                        <div className="sharing-buttons">
                            <a
                                class="twitter-share-button"
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                    X_SHARE_CONTENT
                                )}`}
                                data-size="large"
                                target="_blank"
                            >
                                Share on{" "}
                                <img
                                    className="x-icon"
                                    src="./x_white.png"
                                    alt="X"
                                />
                            </a>
                        </div>
                    </div>
                )}
                {image && (
                    <>
                        <button
                            className="back-home-button"
                            onClick={() => {
                                setImage(null);
                                setCoreImage(null);
                                setStoredStyles([]);
                                setStoredImages([]);
                                setActiveIndex(-1);
                                setLoading(false);
                                setActiveGif(1);
                                setSharing(false);
                                setSharingImage(null);
                            }}
                        >
                            <ArrowBackIosNewIcon className="icon" />
                        </button>
                        <button
                            className="share-button"
                            onClick={() => {
                                if (sharingImage === null) {
                                    setSharingImage(image);
                                }
                                setSharing(true);
                            }}
                        >
                            <IosShareIcon className="icon" />
                        </button>
                    </>
                )}
                {!image && (
                    <>
                        <header className="App-header">
                            <h3>Pick the Core Aesthetic</h3>
                        </header>

                        <div className="style-selector-wrapper">
                            <ul>
                                {artStyles.map((style) => (
                                    <li
                                        key={style}
                                        onClick={() => pickCore(style)}
                                    >
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
                        <div className="breadcrumbs-wrapper">
                            <div className="breadcrumbs">
                                {storedStyles.map((style, index) => (
                                    <span
                                        className="breadcrumb_wrapper"
                                        key={index}
                                    >
                                        {index > 0 && (
                                            <span className="breadcrumb-separator">
                                                {" "}
                                                <ArrowForwardIosIcon />{" "}
                                            </span>
                                        )}
                                        <span
                                            className={`breadcrumb ${
                                                index === activeIndex
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() => {
                                                setImage(storedImages[index]);
                                                setActiveIndex(index);
                                            }}
                                        >
                                            {style}
                                        </span>
                                    </span>
                                ))}
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
                            <div
                                className={`loading ${
                                    loading ? "visible" : ""
                                }`}
                            >
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

            {researchData && !loading && researchData.length > 0 && (
                <div className="researchApp">
                    <div className="research-data-wrapper">
                        {researchData.map((data, index) => (
                            <div key={index} className="research-data-item">
                                <h3>
                                    <a
                                        href={data.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {data.company}
                                    </a>
                                </h3>
                                <p>{data.styleDescription}</p>
                                <a
                                    href={`https://x.com/search?q=${encodeURIComponent(
                                        data.company + " Brand"
                                    )}&src=typed_query`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Related discussions on{" "}
                                    <img
                                        className="x-icon"
                                        src="./x.png"
                                        alt="X"
                                    />
                                </a>
                                {data.imgLink && (
                                    <div className="image-wrapper">
                                        <img
                                            src={data.imgLink}
                                            alt={`${data.company} style`}
                                            className="style-image"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
