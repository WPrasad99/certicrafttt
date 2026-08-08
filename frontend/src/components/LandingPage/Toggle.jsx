import { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Toggles() {
    const [darkMood, setDarkMood] = useState(false);

    return (
        <>
        <div className="flex flex-row gap-4 items-center">
            <button onClick={() => setDarkMood(!darkMood)}
            className="h-11 w-11 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition duration-300">
            {darkMood ? <FaMoon /> : <FaSun /> }
              
            </button>
           
        </div>
        
        </>
    )
}