import React from "react";
import { Routes, Route } from "react-router-dom";
import SelectionScreen from "./pages/SelectionScreen";
import LoginPage from "./pages/UserPages/LoginPage";
import DashboardPage from "./pages/UserPages/DashboardPage";
import MultiChannelSelectionPage from "./pages/UserPages/MultiChannelSelectionPage";
import RealTimePreviewPage from "./pages/UserPages/RealTimePreviewPage";

const App: React.FC = () => {
    return (
        <Routes>
            {/* Homepage */}
            <Route path="/" element={<SelectionScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user-dashboard" element={<DashboardPage />} />
            <Route path="/multi-select" element={<MultiChannelSelectionPage />} />
            <Route path="/real-time-prev" element={<RealTimePreviewPage />} />
        </Routes>
    );
};

export default App;