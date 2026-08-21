import React from "react";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

export type StoreIconProps = {
  size?: number;
  mono?: boolean;
  color?: string;
};

const monoLine = (color: string) => ({
  stroke: color,
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
});

/** Small outlined badge + text, used for the single-color ("mono") icon variants. */
function MonoBadge({
  text,
  color,
  shape = "rect",
  fontSize = 7.5,
}: {
  text: string;
  color: string;
  shape?: "rect" | "circle" | "ellipse";
  fontSize?: number;
}) {
  return (
    <>
      {shape === "circle" && (
        <Circle cx="12" cy="12" r="8.3" stroke={color} strokeWidth={1.6} fill="none" />
      )}
      {shape === "ellipse" && (
        <Ellipse cx="12" cy="12" rx="9" ry="6.3" stroke={color} strokeWidth={1.6} fill="none" />
      )}
      {shape === "rect" && (
        <Rect x="3.5" y="6.7" width="17" height="10.6" rx="2.6" stroke={color} strokeWidth={1.6} fill="none" />
      )}
      <SvgText x="12" y="14.8" fontSize={fontSize} fontWeight="800" fill={color} textAnchor="middle">
        {text}
      </SvgText>
    </>
  );
}

/* A&A SHOP — text badge (no strong public brand reference; kept as a clean wordmark) */
export function AAShopIcon({ size = 22, mono = false, color = "#3a3a3a" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <MonoBadge text="A&A" color={color} fontSize={7} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#F2EFE9" />
      <SvgText x="12" y="13.6" fontSize="8.5" fontWeight="800" fill="#2B2B2B" textAnchor="middle">
        A&amp;A
      </SvgText>
      <SvgText x="12" y="18.6" fontSize="4.6" fontWeight="700" fill="#6b6b6b" textAnchor="middle" letterSpacing="1">
        SHOP
      </SvgText>
    </Svg>
  );
}

/* Albert — white badge, blue "albert" wordmark, yellow/green leaf accent */
export function AlbertIcon({ size = 22, mono = false, color = "#0079BB" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <MonoBadge text="albert" color={color} fontSize={5.4} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#fff" stroke="#e6e6e6" strokeWidth={1} />
      <Path d="M6.6 9.3C7.6 7.4 9.6 6.6 11 7.3C10 8.6 8.3 9.6 6.6 9.3Z" fill="#F8DC00" />
      <Path d="M5.4 9.7C6.3 8.1 8.1 7.2 9.6 7.7C8.5 9.3 6.9 10.1 5.4 9.7Z" fill="#87AB31" />
      <SvgText x="13.2" y="16.6" fontSize="6.6" fontWeight="800" fill="#0079BB" textAnchor="middle">
        albert
      </SvgText>
    </Svg>
  );
}

/* Bauhaus — white badge, black "bauhaus" wordmark with red shadow layer */
export function BauhausIcon({ size = 22, mono = false, color = "#df0023" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <MonoBadge text="bauhaus" color={color} fontSize={4.6} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#fff" stroke="#e6e6e6" strokeWidth={1} />
      <SvgText x="12.5" y="14" fontSize="6.4" fontWeight="800" fill="#df0023" textAnchor="middle">
        bauhaus
      </SvgText>
      <SvgText x="12" y="13.5" fontSize="6.4" fontWeight="800" fill="#000" textAnchor="middle">
        bauhaus
      </SvgText>
    </Svg>
  );
}

/* Dm — yellow badge, red "dm" */
export function DmIcon({ size = 22, mono = false, color = "#3a3a3a" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <MonoBadge text="dm" color={color} fontSize={9} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#FFD100" />
      <SvgText x="12" y="15.8" fontSize="11" fontWeight="800" fill="#E2001A" textAnchor="middle">
        dm
      </SvgText>
    </Svg>
  );
}

/* Fiala řeznictví — dark red butcher seal */
export function FialaIcon({ size = 22, mono = false, color = "#7A1220" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <MonoBadge text="FIALA" color={color} shape="circle" fontSize={5.4} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="11.5" fill="#7A1220" />
      <Circle cx="12" cy="12" r="9.4" stroke="#E9C9A8" strokeWidth={0.7} fill="none" />
      <SvgText x="12" y="15.1" fontSize="6" fontWeight="800" fill="#F3E4D6" textAnchor="middle">
        FIALA
      </SvgText>
    </Svg>
  );
}

/* Ikea — blue badge, yellow ellipse, "IKEA" wordmark */
export function IkeaIcon({ size = 22, mono = false, color = "#0058A3" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <MonoBadge text="IKEA" color={color} fontSize={7} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#0051BA" />
      <SvgText x="12" y="15.2" fontSize="7.6" fontWeight="800" fill="#FFDA1A" textAnchor="middle">
        IKEA
      </SvgText>
    </Svg>
  );
}

/* Jysk — deep red badge, white "JYSK" wordmark */
export function JyskIcon({ size = 22, mono = false, color = "#CE0037" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <MonoBadge text="JYSK" color={color} fontSize={6.6} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#CE0037" />
      <SvgText x="12" y="15" fontSize="7.4" fontWeight="800" fill="#fff" textAnchor="middle">
        JYSK
      </SvgText>
    </Svg>
  );
}

/* Lidl — blue/yellow/red ring badge */
export function LidlIcon({ size = 22, mono = false, color = "#0050AA" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <MonoBadge text="LIDL" color={color} shape="circle" fontSize={6} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="11.5" fill="#0050AA" />
      <Circle cx="12" cy="12" r="8.6" fill="#FFF000" />
      <Circle cx="12" cy="12" r="6.4" fill="#E60A14" />
      <SvgText x="12" y="15.3" fontSize="7.5" fontWeight="800" fill="#fff" textAnchor="middle">
        LIDL
      </SvgText>
    </Svg>
  );
}

/* Penny — red badge, "PENNY" wordmark */
export function PennyIcon({ size = 22, mono = false, color = "#ED1C24" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <MonoBadge text="PENNY" color={color} fontSize={5.4} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#ED1C24" />
      <SvgText x="12" y="14.8" fontSize="6.4" fontWeight="800" fill="#fff" textAnchor="middle">
        PENNY
      </SvgText>
    </Svg>
  );
}

/* Pepco — blue-to-pink gradient badge, white "pepco" wordmark */
export function PepcoIcon({ size = 22, mono = false, color = "#0078E3" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <MonoBadge text="pepco" color={color} fontSize={5.4} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="pepcoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#009EE2" />
          <Stop offset="55%" stopColor="#0078E3" />
          <Stop offset="100%" stopColor="#5B3FA6" />
        </LinearGradient>
      </Defs>
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="url(#pepcoGrad)" />
      <SvgText x="12" y="15" fontSize="6.8" fontWeight="800" fill="#fff" textAnchor="middle">
        pepco
      </SvgText>
    </Svg>
  );
}

/* Teta drogerie — orange oval, "teta" wordmark */
export function TetaIcon({ size = 22, mono = false, color = "#E06010" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <MonoBadge text="teta" color={color} shape="ellipse" fontSize={6.5} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#FDEBD5" />
      <Ellipse cx="12" cy="12" rx="9" ry="6.2" fill="#E06010" />
      <SvgText x="12" y="14.4" fontSize="6.3" fontWeight="800" fill="#fff" textAnchor="middle">
        teta
      </SvgText>
    </Svg>
  );
}

/* Lékárna — generic pharmacy cross */
export function LekarnaIcon({ size = 22, mono = false, color = "#2E9E5B" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x="9.7" y="4.5" width="4.6" height="15" rx="1.4" fill={color} />
        <Rect x="4.5" y="9.7" width="15" height="4.6" rx="1.4" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#E3F5EA" />
      <Rect x="9.9" y="4.8" width="4.2" height="14.4" rx="1.3" fill="#2E9E5B" />
      <Rect x="4.8" y="9.9" width="14.4" height="4.2" rx="1.3" fill="#2E9E5B" />
    </Svg>
  );
}

/* Sušice — location pin (town, not a store chain) */
export function SusiceIcon({ size = 22, mono = false, color = "#8f0c0c" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 20.5C12 20.5 18 14.8 18 10.1C18 6.7 15.3 4 12 4C8.7 4 6 6.7 6 10.1C6 14.8 12 20.5 12 20.5Z"
          {...monoLine(color)}
        />
        <Circle cx="12" cy="10" r="2.3" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#FBE3E3" />
      <Path
        d="M12 19.5C12 19.5 17 14.5 17 10.4C17 7.4 14.8 5 12 5C9.2 5 7 7.4 7 10.4C7 14.5 12 19.5 12 19.5Z"
        fill="#C43C3C"
      />
      <Circle cx="12" cy="10.2" r="2.1" fill="#FBE3E3" />
    </Svg>
  );
}

/* Generic fallback — shopping cart */
export function GenericStoreIcon({ size = 22, mono = false, color = "#6b6b6b" }: StoreIconProps) {
  if (mono) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M3 4H5L6.2 6.5M6.2 6.5H19.5L17.8 13.5H8L6.2 6.5Z" {...monoLine(color)} />
        <Circle cx="9" cy="18" r="1.3" fill={color} />
        <Circle cx="16" cy="18" r="1.3" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#ECECEC" />
      <Path d="M4.5 5.5H6L7 8M7 8H18.5L17 14.5H8.7L7 8Z" stroke="#6b6b6b" strokeWidth={1.5} strokeLinejoin="round" fill="none" />
      <Circle cx="9.5" cy="18" r="1.3" fill="#6b6b6b" />
      <Circle cx="15.5" cy="18" r="1.3" fill="#6b6b6b" />
    </Svg>
  );
}
