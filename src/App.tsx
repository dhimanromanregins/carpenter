import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "@/components/layout/Loader";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { HomePage } from "@/pages/HomePage";
import { FloorWalkthroughPage } from "@/pages/FloorWalkthroughPage";
import { InspirationPage } from "@/pages/InspirationPage";
import { InspirationCategoryPage } from "@/pages/InspirationCategoryPage";
import { QuotationBuilderPage } from "@/pages/quotation/QuotationBuilderPage";
import { QuotationResultPage } from "@/pages/quotation/QuotationResultPage";
import { WardrobeQuotationResultPage } from "@/pages/quotation/WardrobeQuotationResultPage";
import { TileQuotationResultPage } from "@/pages/quotation/TileQuotationResultPage";
import { CeilingQuotationResultPage } from "@/pages/quotation/CeilingQuotationResultPage";

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
            <Route path="/design-studio/floor-walkthrough" element={<FloorWalkthroughPage />} />
            <Route path="/inspiration" element={<InspirationPage />} />
            <Route path="/inspiration/:slug" element={<InspirationCategoryPage />} />
            <Route path="/quote" element={<QuotationBuilderPage />} />
            <Route path="/quote/wardrobe/:quotationId" element={<WardrobeQuotationResultPage />} />
            <Route path="/quote/tiles/:quotationId" element={<TileQuotationResultPage />} />
            <Route path="/quote/ceiling/:quotationId" element={<CeilingQuotationResultPage />} />
            <Route path="/quote/:quotationId" element={<QuotationResultPage />} />
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
