import React from "react";
import { BaseApp } from "./BaseApp";
import "./App.css";

class App extends BaseApp {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state, // Include BaseApp state
            screen: "opening", // Default to the opening screen
            language: "Hebrew", // Default language
            rawArduinoData: "", // Raw data from Arduino
            arduinoData: { number1: 0, number2: 0 }, // Initialize with default values
        };
    }

handleMessage = (event) => {
    let rawData;

    // Handle different types of WebSocket data
    if (event.data instanceof ArrayBuffer) {
        try {
            rawData = new TextDecoder("utf-8").decode(event.data);
        } catch (error) {
            console.error("Failed to decode WebSocket data:", error);
            return;
        }
    } else if (typeof event.data === "string") {
        // Handle string data directly
        rawData = event.data;
    } else if (typeof event.data === "object" && Object.keys(event.data).length > 0) {
        try {
            // If it's a non-empty object, process as JSON
            rawData = JSON.stringify(event.data);
            console.warn(
                "WebSocket sent a structured object; check the server for structured data. Processed as JSON."
            );
        } catch (error) {
            console.error("Failed to process object WebSocket data:", error);
            return;
        }
    } else {
        console.warn("Unsupported or empty data received:", event.data);
        return; // Exit for unsupported or empty objects
    }

    console.log("Raw data from WebSocket:", rawData);

    // Process valid string data
    if (typeof rawData === "string" && rawData.trim().length > 0) {
        try {
            const [number1, number2] = rawData.trim().split(/\s+/).map(parseFloat);
            this.setState({
                rawArduinoData: rawData, // Save raw data for debugging
                arduinoData: { number1: number1 || 0, number2: number2 || 0 }, // Parsed numbers with fallback
            });
        } catch (parseError) {
            console.error("Failed to parse WebSocket data:", parseError);
        }
    }
};



    componentDidMount() {
        super.componentDidMount(); // Set up WebSocket connection
        window.addEventListener("keydown", this.handleKeyPress);
    }

    componentWillUnmount() {
        super.componentWillUnmount(); // Clean up WebSocket and listeners
        window.removeEventListener("keydown", this.handleKeyPress);
    }


    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.moveToNextScreen();
        } else if (event.code === "Space") {
            event.preventDefault(); // Prevent default scrolling behavior
            this.changeLanguage();
        }
    };

    moveToNextScreen = () => {
        this.setState((prevState) => {
            if (prevState.screen === "opening") return { screen: "main" };
            if (prevState.screen === "main") return { screen: "ending" };
            if (prevState.screen === "ending") return { screen: "opening" };
            return prevState;
        });
    };

    changeLanguage = () => {
        const languages = ["Hebrew", "English", "Arabic"];
        this.setState((prevState) => {
            const currentIndex = languages.indexOf(prevState.language);
            const nextIndex = (currentIndex + 1) % languages.length;
            return { language: languages[nextIndex] };
        });
    };

    renderScreen() {
        const { screen, language, arduinoData } = this.state;

        // Labels for data1 and data2 based on the language
        const labels = {
        Hebrew: {
            data1: "זרם נוכחי",
            data2: "מטען שהצטבר",
            unit1: "אמפר",
            unit2: "קולון",
            text1: "סובבו את הידית עד שתגיעו לחלק הצהוב",
            text2: "לחצו על ׳שגר׳!",
            text3: "חובה לשגר",
        },
        English: {
            data1: "Current",
            data2: "Accumulated Charge",
            unit1: "Amper",
            unit2: "Coulomb",
            text1: "Turn the handle until you reach the yellow zone",
            text2: "Press 'Launch'!",
            text3: "Must Launch!",
        },
        Arabic: {
            data1: "التيار الحالي",
            data2: "الشحنة المتراكمة",
            unit1: "أمبير",
            unit2: "كولوم",
            text1: "قم بتدوير المقبض حتى تصل إلى المنطقة الصفراء",
            text2: "اضغط على 'إطلاق'!",
            text3: "يجب الإطلاق",
        },
    };

        const currentLabels = labels[language];

        const getBottomText = (charge) => {
        if (charge < 20) return currentLabels.text1;
        if (charge >= 20 && charge <= 40) return currentLabels.text2;
        return currentLabels.text3;
        };

    const bottomText = getBottomText(arduinoData.number2);


        const getImagePath = () => {
            if (screen === "opening") {
                return `/assets/start_screen/start_${language}.png`;
            } else if (screen === "ending") {
                return `/assets/end_screen/Hydro_end_${language}.png`;
            }
            return null; // No image for the main screen
        };

        if (screen === "opening") {
            return (
                <div className="full-screen-image-wrapper">
                    <img
                        src={getImagePath()}
                        alt={`${screen} screen`}
                        className="full-screen-image"
                    />
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

        const barGraphColor = (value) => {
        if (value < 20) return "green";
        if (value < 40) return "yellow";
        return "red";
        };

        const gaugeRotation = (value) => {
            const maxValue = 30; // Adjust based on max value for current
            return (value / maxValue) * 180; // Scale to half-circle (180 degrees)
        };

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
                <div className="data-screen-side-by-side">
                    {/* Current (Gauge Clock) */}
                    <div className="data-item">
                        <h2 className={`${language} data-label`}>{currentLabels.data1}</h2>
                        <p className={`${language} data-value`}>
                            {arduinoData.number1.toFixed(2)} {currentLabels.unit1}
                        </p>
                        <div className="gauge-container">
                            <div
                                className="gauge"
                                style={{
                                    transform: `rotate(${gaugeRotation(
                                        arduinoData.number1
                                    )}deg)`,
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Accumulated Charge (Vertical Bar Graph) */}
                    <div className="data-item">
                        <h2 className={`${language} data-label`}>{currentLabels.data2}</h2>
                        <p className={`${language} data-value`}>
                            {arduinoData.number2.toFixed(2)} {currentLabels.unit2}
                        </p>
                        <div className="bar-graph-container-vertical">
                            <div
                                className="bar-graph-vertical"
                                style={{
                                    height: `${arduinoData.number2}%`,
                                    backgroundColor: barGraphColor(arduinoData.number2),
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
                {/* Bottom Text */}
                <div className="bottom-text">
                    <p className={`${language} h3-regular`}>{bottomText}</p>
                </div>
            </>
        );
    }

         if (screen === "ending") {
            return (
                <div className="full-screen-image-wrapper">
                    <img
                        src={getImagePath()}
                        alt={`${screen} screen`}
                        className="full-screen-image"
                    />
                </div>
            );
        }
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">{this.renderScreen()}</header>
            </div>
        );
    }
}

export default App;
