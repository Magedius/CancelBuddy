import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Subscription } from "@shared/schema";

interface CostChartProps {
  subscriptions: Subscription[];
}

export default function CostChart({ subscriptions }: CostChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculateCosts = () => {
    const monthlyCost = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    const halfYearlyCost = monthlyCost * 6;
    const yearlyCost = monthlyCost * 12;

    return [
      {
        period: "Kuukausi",
        amount: monthlyCost,
        color: "#8B5CF6",
        label: `${monthlyCost.toFixed(2)}€`
      },
      {
        period: "6kk",
        amount: halfYearlyCost,
        color: "#A78BFA",
        label: `${halfYearlyCost.toFixed(2)}€`
      },
      {
        period: "Vuosi",
        amount: yearlyCost,
        color: "#C4B5FD",
        label: `${yearlyCost.toFixed(2)}€`
      }
    ];
  };

  const data = calculateCosts();
  const maxAmount = Math.max(...data.map(d => d.amount));

  if (subscriptions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg mx-6 mb-6 overflow-hidden fade-in">
      {/* Header */}
      <div 
        className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Kustannusennuste</h3>
              <p className="text-purple-100 text-sm">
                {data[0].label}/kk • {data[2].label}/vuosi
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Chart Content */}
      {isExpanded && (
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 text-sm">
              Näet kuinka paljon kaikki tilauksesi maksavat yhteensä eri aikaväleillä
            </p>
          </div>

          {/* Bar Chart */}
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="period" 
                  axisLine={false}
                  tickLine={false}
                  className="text-gray-600 text-sm"
                />
                <YAxis hide />
                <Bar 
                  dataKey="amount" 
                  radius={[8, 8, 0, 0]}
                  className="drop-shadow-sm"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-3 gap-4">
            {data.map((item, index) => (
              <div 
                key={item.period}
                className="bg-gray-50 rounded-xl p-4 text-center"
              >
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <p className="text-gray-600 text-xs mb-1">{item.period}</p>
                <p className="font-bold text-gray-800">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className="mt-6 p-4 bg-purple-50 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrendingUp className="w-3 h-3 text-purple-600" />
              </div>
              <div>
                <p className="text-purple-800 font-medium text-sm mb-1">
                  Säästöpotentiaali
                </p>
                <p className="text-purple-700 text-xs">
                  Peruuttamalla käyttämättömät tilaukset voit säästää jopa{" "}
                  <span className="font-semibold">{data[2].label}</span> vuodessa
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}