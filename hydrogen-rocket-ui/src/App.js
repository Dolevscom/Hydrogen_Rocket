import React from 'react';
import {BaseApp} from './BaseApp';
import './App.css';

class App extends BaseApp {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state, // Include BaseApp state
            screen: 'opening', // Default to the opening screen
            arduinoData: '', // Store data from the Arduino
        };
    }

    componentDidMount() {
        super.componentDidMount(); // Call the WebSocket connection setup
        window.addEventListener('keydown', this.handleKeyPress);
    }

    componentWillUnmount() {
        super.componentWillUnmount(); // Clean up WebSocket and interval
        window.removeEventListener('keydown', this.handleKeyPress);
    }

    handleMessage = (event) => {
        // Process WebSocket messages from Arduino
        const data = event.data;
        console.log('Raw data from Arduino:', data);

        // Split the data into two parts
        const [number1, number2] = data.trim().split(/\s+/); // Split on any whitespace
        console.log(Number(number1));
        console.log(Number(number2));

        // Update the state with the parsed numbers
        this.setState({
            arduinoData: {number1: parseFloat(number1), number2: parseFloat(number2)},
        });

        console.log('Parsed data:', {number1, number2});

        // Handle specific commands if needed
        if (data.includes('NEXT_SCREEN')) {
            this.moveToNextScreen();
        } else if (data.includes('CHANGE_LANGUAGE')) {
            this.changeLanguage();
        }
    };

    handleKeyPress = (event) => {
        if (event.code === 'Enter') {
            this.moveToNextScreen(); // Move to the next screen
        } else if (event.code === 'Space') {
            event.preventDefault(); // Prevent default scrolling behavior
            this.changeLanguage(); // Cycle languages
        }
    };

    moveToNextScreen = () => {
        this.setState((prevState) => {
            if (prevState.screen === 'opening') return {screen: 'main'};
            if (prevState.screen === 'main') return {screen: 'ending'};
            if (prevState.screen === 'ending') return {screen: 'opening'};
            return prevState;
        });
    };

    renderContent() {
        const {screen, currentLanguageIndex, arduinoData} = this.state;
        const language = this.languages[currentLanguageIndex];

        const getImagePath = () => {
            if (screen === 'opening') {
                return `/assets/start_screen/start_${language}.png`;
            } else if (screen === 'ending') {
                return `/assets/end_screen/Hydro_end_${language}.png`;
            }
            return null; // No image for the main screen
        };

        return (
            <div className="App">
                <header className="App-header">
                    {screen === 'opening' && (
                        <div className="full-screen-image-wrapper">
                            <img
                                src={getImagePath()}
                                alt="Opening Screen"
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
                    )}
                    {screen === 'main' && (
                        <>
                            <h1 className={`${language} h1-bold`}>
                                {language === 'Hebrew'
                                    ? 'טיל מימן'
                                    : language === 'English'
                                        ? 'Hydrogen Rocket'
                                        : 'صاروخ الهيدروجين'}
                            </h1>
                            <p className={`${language} h3-regular`}>
                                {language === 'Hebrew'
                                    ? 'סובבו את ידית הגנרטור על מנת ליצור מתח חשמלי'
                                    : language === 'English'
                                        ? 'Turn the generator handle to generate electrical voltage.'
                                        : 'قم بتدوير مقبض المولد لتوليد الجهد الكهربائي.'}
                            </p>
                            {/* Display Arduino data */}
                            <div className="arduino-data">
                                <h2>
                                    {language === 'Hebrew'
                                        ? `נתוני ארדואינו: ${arduinoData}`
                                        : language === 'English'
                                            ? `Arduino Data: ${arduinoData}`
                                            : `بيانات الأردوينو: ${arduinoData}`}
                                </h2>
                            </div>
                        </>
                    )}
                    {screen === 'ending' && (
                        <div className="full-screen-image-wrapper">
                            <img
                                src={getImagePath()}
                                alt="Ending Screen"
                                className="full-screen-image"
                            />
                        </div>
                    )}
                </header>
            </div>
        );
    }
}

export default App;
