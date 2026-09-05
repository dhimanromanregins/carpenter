import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { HomePage } from "@/pages/HomePage";
import { FloorWalkthroughPage } from "@/pages/FloorWalkthroughPage";
import { DesignStudioToolPage } from "@/pages/DesignStudioToolPage";
import { InspirationPage } from "@/pages/InspirationPage";
import { InspirationCategoryPage } from "@/pages/InspirationCategoryPage";
import { LocalSeoPage } from "@/pages/LocalSeoPage";
import { ServiceSeoPage } from "@/pages/ServiceSeoPage";
import { QuotationBuilderPage } from "@/pages/quotation/QuotationBuilderPage";
import { QuotationResultPage } from "@/pages/quotation/QuotationResultPage";
import { WardrobeQuotationResultPage } from "@/pages/quotation/WardrobeQuotationResultPage";
import { TileQuotationResultPage } from "@/pages/quotation/TileQuotationResultPage";
import { CeilingQuotationResultPage } from "@/pages/quotation/CeilingQuotationResultPage";

function App() {
  const location = useLocation();
  // These are full-bleed 3D tools with their own back-navigation and toolbars —
  // the site's fixed top Navbar would visually collide with them.
  const hideNavbar = location.pathname.startsWith("/design-studio");

  return (
    <>
      <ScrollProgress />
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/design-studio"
          element={
            <DesignStudioToolPage
              src="/design-studio.html"
              title="3D Design Studio"
              description="Explore Dhiman Interiors' interactive 3D Design Studio — visualize kitchens, wardrobes, floors, beds and TV panels before you build."
              path="/design-studio"
            />
          }
        />
        <Route
          path="/design-studio/kitchen"
          element={
            <DesignStudioToolPage
              src="/design-studio-kitchen.html"
              title="Kitchen Designer — 3D Design Studio"
              description="Design your dream modular kitchen in interactive 3D with Dhiman Interiors' Kitchen Designer tool."
              path="/design-studio/kitchen"
            />
          }
        />
        <Route
          path="/design-studio/wardrobe"
          element={
            <DesignStudioToolPage
              src="/design-studio-wardrobe.html"
              title="Wardrobe Designer — 3D Design Studio"
              description="Design your dream wardrobe in interactive 3D with Dhiman Interiors' Wardrobe Designer tool."
              path="/design-studio/wardrobe"
            />
          }
        />
        <Route
          path="/design-studio/floor"
          element={
            <DesignStudioToolPage
              src="/design-studio-floor.html"
              title="Floor Design — 3D Design Studio"
              description="Design your floor layout in interactive 3D with Dhiman Interiors' Floor Design tool."
              path="/design-studio/floor"
            />
          }
        />
        <Route
          path="/design-studio/bed"
          element={
            <DesignStudioToolPage
              src="/design-studio-bed.html"
              title="Bed Design — 3D Design Studio"
              description="Design your dream bed and bedroom layout in interactive 3D with Dhiman Interiors' Bed Design tool."
              path="/design-studio/bed"
            />
          }
        />
        <Route
          path="/design-studio/tv-panel"
          element={
            <DesignStudioToolPage
              src="/design-studio-tv-panel.html"
              title="TV Panel Design — 3D Design Studio"
              description="Design your TV panel and media wall in interactive 3D with Dhiman Interiors' TV Panel Design tool."
              path="/design-studio/tv-panel"
            />
          }
        />
        <Route path="/design-studio/floor-walkthrough" element={<FloorWalkthroughPage />} />
        <Route path="/inspiration" element={<InspirationPage />} />
        <Route path="/inspiration/:slug" element={<InspirationCategoryPage />} />
        <Route path="/interior-designer-zirakpur" element={<LocalSeoPage slug="zirakpur" />} />
        <Route path="/interior-designer-chandigarh" element={<LocalSeoPage slug="chandigarh" />} />
        <Route path="/interior-designer-mohali" element={<LocalSeoPage slug="mohali" />} />
        <Route path="/interior-designer-panchkula" element={<LocalSeoPage slug="panchkula" />} />
        <Route path="/modular-kitchen-chandigarh" element={<ServiceSeoPage slug="modular-kitchen-chandigarh" />} />
        <Route path="/custom-wardrobe-design" element={<ServiceSeoPage slug="custom-wardrobe-design" />} />
        <Route path="/quote" element={<QuotationBuilderPage />} />
        <Route path="/quote/wardrobe/:quotationId" element={<WardrobeQuotationResultPage />} />
        <Route path="/quote/tiles/:quotationId" element={<TileQuotationResultPage />} />
        <Route path="/quote/ceiling/:quotationId" element={<CeilingQuotationResultPage />} />
        <Route path="/quote/:quotationId" element={<QuotationResultPage />} />
      </Routes>
    </>
  );
}

export default App;
