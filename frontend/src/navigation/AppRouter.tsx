import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { JobsListScreen } from "@/screens/JobsListScreen";

export const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/jobs" replace />} />
    <Route path="/jobs" element={<JobsListScreen />} />
    <Route path="*" element={<Navigate to="/jobs" replace />} />
  </Routes>
);

export default AppRouter;
