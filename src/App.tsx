import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "@/components/layout/Loader";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { HomePage } from "@/pages/HomePage";
import { QuotationBuilderPage } from "@/pages/quotation/QuotationBuilderPage";
import { QuotationResultPage } from "@/pages/quotation/QuotationResultPage";

function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Loader onComplete={() => setLoaded(true)} />

      {loaded && (
        <>
          <ScrollProgress />
          <Navbar />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quote" element={<QuotationBuilderPage />} />
            <Route path="/quote/:quotationId" element={<QuotationResultPage />} />
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
