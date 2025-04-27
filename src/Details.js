import React from "react";

const tabs = ["Summary", "Chart", "Statistics", "Analysis", "Settings"];

const Details = ({ currentPrice, setActiveTab, activeTab }) => {
  console.log("curr", currentPrice);

  return (
    <div>
      <div
        style={{
          alignItems: "end",
          marginTop: "40px",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div
            style={{
              fontSize: "70px",
              fontWeight: "400",
              color: "#1A243A",
            }}
          >
            {currentPrice.toFixed(2)}
          </div>
          <sup
            style={{
              fontSize: "24px",
              color: "#BDBEBF",
              fontWeight: "400",
              marginLeft: "8px",
              marginTop: "15px",
            }}
          >
            USD
          </sup>
        </div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "500",
            color: "#22c55e",
            marginTop: "12px",
          }}
        >
          +2,161.42 (3.54%)
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #e5e7eb" }}>
        <div
          style={{
            display: "flex",
            gap: "32px",
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                position: "relative",
                paddingBottom: "20px",
                fontSize: "18px",
                fontStyle: "bold",
                fontWeight: "400",
                color: activeTab === tab ? "#111827" : "#6b7280",
                cursor: "pointer",
              }}
            >
              {tab}
              {activeTab === tab && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    height: "3px",
                    width: "100%",
                    backgroundColor: "#4F46E5",
                    borderRadius: "2px",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Details;
