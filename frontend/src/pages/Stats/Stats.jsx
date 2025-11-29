import { useEffect, useState } from "react";
import { fetchUserStats } from "@/api/stats";
import {
  BarChart,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchUserStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-muted-foreground">Loading stats...</p>
      </div>
    );
  }

  const { counts, asRequester, asCourier, chart } = stats;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] px-6 py-10 flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-10 text-foreground dark:text-white">
        Your Activity Overview
      </h1>

      {/* Stats card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">

        <StatCard
          icon={<CheckCircle2 className="w-8 h-8 text-blue-600" />}
          title="Deliveries Completed"
          value={counts.deliveriesCompleted}
        />

        <StatCard
          icon={<Package className="w-8 h-8 text-blue-600" />}
          title="Requests Made"
          value={counts.requestsMade}
        />

        <StatCard
          icon={<Activity className="w-8 h-8 text-blue-600" />}
          title="Active Deliveries"
          value={counts.deliveriesActive}
        />

        <StatCard
          icon={<Clock className="w-8 h-8 text-blue-600" />}
          title="Completed Requests"
          value={counts.requestsCompleted}
        />

        <StatCard
          icon={<CheckCircle2 className="w-8 h-8 text-green-600" />}
          title="Items Received"
          value={counts.requestsReceived}
        />

        <StatCard
          icon={<XCircle className="w-8 h-8 text-red-600" />}
          title="Not Received"
          value={counts.requestsNotReceived}
        />
      </div>

      {/* Activity chart */}
      <div className="w-full max-w-5xl mt-20">
        <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-white">
          Activity Over the Last 14 Days
        </h2>

        <Card className="p-6 bg-card border border-border shadow">
          <ActivityChart chart={chart} />
        </Card>
      </div>

      {/* Activity list */}
      <div className="w-full max-w-5xl mt-20">
        <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-white">
          Recent Activity
        </h2>

        <Card className="p-6 bg-card border border-border shadow divide-y">
          {renderRecentActivity(asRequester, asCourier)}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <Card className="p-6 bg-card border border-border shadow">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function ActivityChart({ chart }) {
  const { days, deliveriesPerDay, requestsPerDay } = chart;

  const max = Math.max(...deliveriesPerDay, ...requestsPerDay, 1);
  const height = 120;
  const width = 300;

  const scaleY = (value) => height - (value / max) * height;

  const makePoints = (arr) =>
    arr
      .map((v, i) => {
        const x = (i / (arr.length - 1)) * width;
        const y = scaleY(v);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <svg width="100%" height={height + 30} viewBox={`0 0 ${width} ${height + 30}`}>
      <polyline
        fill="none"
        stroke="#377dff"
        strokeWidth="3"
        points={makePoints(deliveriesPerDay)}
      />
      <polyline
        fill="none"
        stroke="#2ecc71"
        strokeWidth="3"
        points={makePoints(requestsPerDay)}
      />
    </svg>
  );
}


function renderRecentActivity(asRequester, asCourier) {
  const events = [];

  asCourier.forEach((r) => {
    events.push({
      type: "delivery",
      text: `Delivered from ${r.pickupLocation} → ${r.dropoffLocation}`,
      time: r.updatedAt,
      status: r.status,
    });
  });

  asRequester.forEach((r) => {
    let txt = `Requested delivery from ${r.pickupLocation}`;
    if (r.status === "completed") txt += " — completed";
    if (r.receiverConfirmed === "received") txt += " — marked received";
    if (r.receiverConfirmed === "not_received") txt += " — marked not received";

    events.push({
      type: "request",
      text: txt,
      time: r.updatedAt,
    });
  });

  // Sort newest → oldest
  events.sort((a, b) => new Date(b.time) - new Date(a.time));

  if (events.length === 0)
    return <p className="text-muted-foreground">No activity yet.</p>;

  return events.slice(0, 10).map((e, i) => (
    <div key={i} className="py-3">
      <p className="text-foreground">{e.text}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {new Date(e.time).toLocaleString()}
      </p>
    </div>
  ));
}
