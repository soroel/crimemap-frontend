import React from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css";
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NMaF1cXGFCeEx1WmFZfVtgdl9HZVZSRWY/P1ZhSXxWdkBjXX5ac3NRQ2lYVkd9XUo=');
const root = document.getElementById("root");
createRoot(root).render(
  <Router>
    <App />
  </Router>
);
