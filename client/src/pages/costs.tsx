import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import type { Subscription } from "@shared/schema";

export default function Costs() {
  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  // Calculate cost data
  const monthlyTotal = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const sixMonthTotal = monthlyTotal * 6;
  const yearlyTotal = monthlyTotal * 12;

  const data = [
    {
      period: "1kk",
      amount: monthlyTotal,
      label: `${monthlyTotal.toFixed(2)}€`,
      color: "#8b5cf6"
    },
    {
      period: "6kk", 
      amount: sixMonthTotal,
      label: `${sixMonthTotal.toFixed(2)}€`,
      color: "#a855f7"
    },
    {
      period: "12kk",
      amount: yearlyTotal,
      label: `${yearlyTotal.toFixed(2)}€`,
      color: "#c084fc"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="gradient-bg text-white px-6 pt-12 pb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Kustannusennuste</h1>
            <p className="text-white/80 text-sm">Tilausten kokonaiskustannukset</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 fade-in">
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Ei tilauksia
              </h3>
              <p className="text-gray-600 text-sm">
                Lisää tilauksia nähdäksesi kustannusennusteen
              </p>
            </div>
          ) : (
            <>




              {/* Bar Chart */}
              <div className="h-64 mb-8">
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

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
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



              {/* Subscription Breakdown */}
              {subscriptions.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-800 mb-4">Tilauskohtaiset kustannukset</h3>
                  <div className="space-y-3">
                    {subscriptions.map((subscription) => (
                      <div 
                        key={subscription.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {subscription.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{subscription.name}</p>
                            <p className="text-xs text-gray-600">Kuukausimaksu</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{subscription.price.toFixed(2)}€</p>
                          <p className="text-xs text-gray-600">{(subscription.price * 12).toFixed(2)}€/vuosi</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}