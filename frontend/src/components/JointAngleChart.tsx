import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FrameBiomechanics } from "../types/schema";

interface Props {
  frames: FrameBiomechanics[];
}

export function JointAngleChart({ frames }: Props) {
  const data = frames
    .filter((f) => f.joint_angles.left_knee !== null || f.joint_angles.right_knee !== null)
    .map((f) => ({
      t: Number(f.timestamp_sec.toFixed(1)),
      left: f.joint_angles.left_knee,
      right: f.joint_angles.right_knee,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[var(--color-muted)]">
        No pose lock on the knees in this clip — try a closer or more front-on angle.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="leftKneeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f6b5c" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#0f6b5c" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="rightKneeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c69117" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#c69117" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#d9ded6" strokeDasharray="2 4" vertical={false} />
        <XAxis
          dataKey="t"
          tickFormatter={(v) => `${v}s`}
          stroke="#6b756e"
          fontSize={11}
          fontFamily="IBM Plex Mono"
          tickLine={false}
          axisLine={{ stroke: "#d9ded6" }}
        />
        <YAxis
          domain={[60, 190]}
          stroke="#6b756e"
          fontSize={11}
          fontFamily="IBM Plex Mono"
          tickLine={false}
          axisLine={false}
          width={34}
        />
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #d9ded6",
            borderRadius: 4,
            fontFamily: "IBM Plex Mono",
            fontSize: 12,
          }}
          formatter={(value, name) => [`${Number(value).toFixed(1)}°`, String(name)]}
          labelFormatter={(l) => `t = ${l}s`}
        />
        <Area
          type="monotone"
          dataKey="left"
          name="Left knee"
          stroke="#0f6b5c"
          strokeWidth={1.75}
          fill="url(#leftKneeFill)"
          connectNulls
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="right"
          name="Right knee"
          stroke="#c69117"
          strokeWidth={1.75}
          fill="url(#rightKneeFill)"
          connectNulls
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
