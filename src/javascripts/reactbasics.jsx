import React from "react";
import {createRoot} from 'react-dom/client'

import A_Title from "../components/A_Title.jsx";

const root = createRoot(document.querySelector('.app'))

root.render(<A_Title/>)