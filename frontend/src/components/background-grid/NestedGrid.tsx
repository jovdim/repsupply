import "./NestedGrid.css";

// it's for type safety. since TS is shouting
interface GridCSSProperties extends React.CSSProperties {
  "--main-grid-size": string;
  "--main-grid-color": string;
  "--main-grid-width": string;
  "--sub-grid-size": string;
  "--sub-grid-color": string;
  "--sub-grid-width": string;
  "--bg-color": string;
}

const NestedGrid = ({
  mainGridSize = 100,
  mainGridColor = "rgba(255, 255, 255, 0.15)",
  mainGridWidth = 3,
  subGridSize = 25,
  subGridColor = "rgba(255, 255, 255, 0.05)",
  subGridWidth = 2,
  backgroundColor = "transparent",
}) => {
  const gridStyle: GridCSSProperties = {
    "--main-grid-size": `${mainGridSize}px`,
    "--main-grid-color": mainGridColor,
    "--main-grid-width": `${mainGridWidth}px`,
    "--sub-grid-size": `${subGridSize}px`,
    "--sub-grid-color": subGridColor,
    "--sub-grid-width": `${subGridWidth}px`,
    "--bg-color": backgroundColor,
  };

  return <div className="nested-grid" style={gridStyle} />;
};

export default NestedGrid;
