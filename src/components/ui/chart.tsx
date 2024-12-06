import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartTooltipProps extends TooltipProps<ValueType, NameType> {
  config: ChartConfig;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  config,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-md">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {config[entry.dataKey as string]?.label || entry.dataKey}:{" "}
            {entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export const ChartTooltipContent: React.FC<ChartTooltipProps> = (props) => {
  return <ChartTooltip {...props} />;
};

export {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
};
