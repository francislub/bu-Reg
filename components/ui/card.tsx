import type React from "react"

export const Chart = ({ children }: { children: React.ReactNode }) => {
  return <div className="chart">{children}</div>
}

export const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="chart-container">{children}</div>
}

export const ChartLegend = ({ children }: { children: React.ReactNode }) => {
  return <div className="chart-legend">{children}</div>
}

export const ChartLegendContent = () => {
  return <div className="chart-legend-content"></div>
}

export const ChartPie = ({ children }: { children: React.ReactNode }) => {
  return <div className="chart-pie">{children}</div>
}

export const ChartPieSeries = ({ data, nameKey, valueKey }: { data: any[]; nameKey: string; valueKey: string }) => {
  return <div className="chart-pie-series"></div>
}

export const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <div className="chart-tooltip">{children}</div>
}

export const ChartTooltipContent = () => {
  return <div className="chart-tooltip-content"></div>
}

// components/ui/card.tsx
export const Card = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-4 shadow-lg rounded-lg bg-white">{children}</div>;
};

export const CardHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="border-b p-2 font-bold">{children}</div>;
};

export const CardContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-2">{children}</div>;
};

export const CardFooter = ({ children }: { children: React.ReactNode }) => {
  return <div className="border-t p-2">{children}</div>;
};

export const CardTitle = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="text-lg font-semibold">{children}</h2>;
};

export const CardDescription = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-sm text-gray-600">{children}</p>;
};


