import React from "react";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

type IconProps = {
  size?: number;
  color?: string;
};

export function SearchIcon({ size = 20, color = "#9a9a9a" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2} />
      <Path
        d="M20 20L16.2 16.2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 22, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CheckIcon({ size = 14, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12.5L9.5 18L20 6"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HeartIcon({
  size = 22,
  color = "#8f0c0c",
  filled = false,
}: IconProps & { filled?: boolean }) {
  const d =
    "M12 20.5C12 20.5 3.5 15.4 3.5 9.4C3.5 6.6 5.7 4.4 8.5 4.4C10 4.4 11.3 5.1 12 6.2C12.7 5.1 14 4.4 15.5 4.4C18.3 4.4 20.5 6.6 20.5 9.4C20.5 15.4 12 20.5 12 20.5Z";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={d}
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth={filled ? 0 : 1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 18, color = "#999" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 5L16 12L9 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 14, color = "#999" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 9L12 16L19 9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function GridIcon({ size = 16, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="7" height="7" rx="1.6" fill={color} />
      <Rect x="13" y="4" width="7" height="7" rx="1.6" fill={color} />
      <Rect x="4" y="13" width="7" height="7" rx="1.6" fill={color} />
      <Rect x="13" y="13" width="7" height="7" rx="1.6" fill={color} />
    </Svg>
  );
}

export function StorefrontIcon({ size = 22, color = "#8f0c0c" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 9L5 4H19L20 9" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
      <Path
        d="M4 9C4 10.38 5.12 11.5 6.5 11.5C7.88 11.5 9 10.38 9 9C9 10.38 10.12 11.5 11.5 11.5C12.88 11.5 14 10.38 14 9C14 10.38 15.12 11.5 16.5 11.5C17.88 11.5 19 10.38 19 9"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M5.5 11.5V20H18.5V11.5" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
      <Rect x="10" y="14.5" width="4" height="5.5" stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}

export function ListPlusIcon({ size = 20, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="3" y1="6" x2="14" y2="6" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="3" y1="12" x2="14" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="3" y1="18" x2="10" y2="18" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="18" y1="13" x2="18" y2="21" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="14" y1="17" x2="22" y2="17" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function CartHeartIcon({
  size = 34,
  cartColor = "#1a1a1a",
  heartColor = "#b3121b",
}: {
  size?: number;
  cartColor?: string;
  heartColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 3H4L4.8 6M4.8 6H20L18 13H7L4.8 6Z"
        stroke={cartColor}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Circle cx="8.5" cy="19" r="1.4" fill={cartColor} />
      <Circle cx="16.5" cy="19" r="1.4" fill={cartColor} />
      <Path
        d="M15 7.4C15 6.1 16 5.1 17.1 5.1C17.7 5.1 18.2 5.4 18.6 5.8C19 5.4 19.5 5.1 20.1 5.1C21.2 5.1 22.1 6.1 22.1 7.4C22.1 9.3 18.6 11.3 18.6 11.3C18.6 11.3 15 9.3 15 7.4Z"
        fill={heartColor}
      />
    </Svg>
  );
}

export function GripIcon({ size = 18, color = "#999" }: IconProps) {
  const dots = [0, 1, 2];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {dots.map((row) =>
        [8, 16].map((cx) => (
          <Circle
            key={`${row}-${cx}`}
            cx={cx}
            cy={5 + row * 7}
            r="1.6"
            fill={color}
          />
        )),
      )}
    </Svg>
  );
}

export function BackArrowIcon({ size = 20, color = "#111" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12L11 6M5 12L11 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PinIcon({ size = 20, color = "#8f0c0c" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21C12 21 18.5 14.9 18.5 9.9C18.5 6.3 15.6 3.5 12 3.5C8.4 3.5 5.5 6.3 5.5 9.9C5.5 14.9 12 21 12 21Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="9.8" r="2.4" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}
