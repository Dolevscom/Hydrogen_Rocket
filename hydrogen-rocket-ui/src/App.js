import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
    const [language, setLanguage] = useState("Hebrew"); // Default language
    const [screen, setScreen] = useState("opening"); // Track the current screen

    const languages = ["Hebrew", "English", "Arabic"]; // List of supported languages

    // Handle "Enter" and "Space" key actions
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.code === "Enter") {
                // Cycle through screens
                if (screen === "opening") setScreen("main");
                else if (screen === "main") setScreen("ending");
                else if (screen === "ending") setScreen("opening");
            } else if (event.code === "Space") {
                // Cycle through languages
                event.preventDefault(); // Prevent default scrolling behavior
                const currentIndex = languages.indexOf(language);
                const nextIndex = (currentIndex + 1) % languages.length;
                setLanguage(languages[nextIndex]);
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [screen, language]);

    // Get image paths based on the current screen and language
    const getImagePath = () => {
        if (screen === "opening") {
            return `/assets/start_screen/start_${language}.png`;
        } else if (screen === "ending") {
            return `/assets/end_screen/Hydro_end_${language}.png`;
        }
        return null; // No image for the main screen
    };

    const renderScreen = () => {
        if (screen === "opening") {
            return (
                <div className="full-screen-image-wrapper">
                    <img src={getImagePath()} alt={`${screen} screen`} className="full-screen-image" />
                    <div className="gif-container">
                        <img
                            src="/assets/gifs/test-tubex (1).gif"
                            alt="Opening Animation"
                            className="centered-gif"
                        />
                    </div>
                </div>
            );
        }
        if (screen === "main") {
            return (
                <>
                    <h1 className={`${language} h1-bold`}>
                        {language === "Hebrew"
                            ? "טיל מימן"
                            : language === "English"
                            ? "Hydrogen Rocket"
                            : "صاروخ الهيدروجين"}
                    </h1>
                    <p className={`${language} h3-regular`}>
                        {language === "Hebrew"
                            ? "סובבו את ידית הגנרטור על מנת ליצור מתח חשמלי"
                            : language === "English"
                            ? "Turn the generator handle to generate electrical voltage."
                            : "قم بتدوير مقبض المولد لتوليد الجهد الكهربائي."}
                    </p>
                </>
            );
        }
        if (screen === "ending") {
            return (
                <div className="full-screen-image-wrapper">
                    <img src={getImagePath()} alt={`${screen} screen`} className="full-screen-image" />
                </div>
            );
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <div className={`content ${language}`}>{renderScreen()}</div>
            </header>
        </div>
    );
}

export default App;
