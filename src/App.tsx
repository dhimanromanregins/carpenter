import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "@/components/layout/Loader";
import { Navbar } from "@/components/layout/Navbar";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { HomePage } from "@/pages/HomePage";

function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Loader onComplete={() => setLoaded(true)} />

      {loaded && (
        <>
          <CustomCursor />
          <ScrollProgress />
          <Navbar />

          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
