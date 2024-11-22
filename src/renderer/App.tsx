import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import {
  VideoUpload,
  VideoStoryline,
  GenerateStoryline,
  VideoSummary,
  VideoPreview,
} from './pages';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VideoUpload />} />
        <Route path="/storyline" element={<VideoStoryline />} />
        <Route path="/generate" element={<GenerateStoryline />} />
        <Route path="/summary" element={<VideoSummary />} />
        <Route path="/preview" element={<VideoPreview />} />
      </Routes>
    </Router>
  );
}
