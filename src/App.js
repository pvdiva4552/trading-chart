import { useState } from "react";
import Details from "./Details";
import RangeChart from "./RangeChart";

export default function App() {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [activeTab, setActiveTab] = useState("Chart");
  return (
    <div className="App" style={{ width: "839px", margin: "0px auto" }}>
      <Details
        currentPrice={currentPrice}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
      />
      {activeTab === "Chart" && (
        <RangeChart setCurrentPrice={setCurrentPrice} />
      )}
    </div>
  );
}
